"""Bilder der Gerichte: speichern, verkleinern, ausliefern."""

from __future__ import annotations

from http import HTTPStatus
import io
import logging
from pathlib import Path
import re
import uuid

from aiohttp import ClientError, ClientTimeout, web

from homeassistant.components.http import HomeAssistantView
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.http import KEY_HASS

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

IMAGE_URL = "/api/essensplaner/images/{image_id}"
UPLOAD_URL = "/api/essensplaner/upload"
MAX_BYTES = 15 * 1024 * 1024
MAX_EDGE = 1280
_ID_RE = re.compile(r"^[0-9a-f]{32}$")
_EXTENSIONS = {"jpg": "image/jpeg", "png": "image/png", "webp": "image/webp", "gif": "image/gif"}


class InvalidImage(HomeAssistantError):
    """Die Daten sind kein (unterstütztes) Bild."""


def image_url(image: dict | None) -> str | None:
    """Öffentliche URL eines gespeicherten Bildes."""
    if not image or not image.get("id"):
        return None
    return IMAGE_URL.format(image_id=image["id"])


def _sniff(data: bytes) -> str | None:
    if data[:3] == b"\xff\xd8\xff":
        return "jpg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    return None


def _process(data: bytes) -> tuple[bytes, str]:
    """Bild drehen (EXIF), verkleinern und als JPEG speichern (blockierend)."""
    if _sniff(data) is None:
        raise InvalidImage("Kein unterstütztes Bildformat")
    try:
        from PIL import Image, ImageOps  # noqa: PLC0415 - optional, Teil von HA Core
    except ImportError:
        return data, _sniff(data) or "jpg"
    try:
        with Image.open(io.BytesIO(data)) as img:
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGB")
            img.thumbnail((MAX_EDGE, MAX_EDGE))
            out = io.BytesIO()
            img.save(out, format="JPEG", quality=85, optimize=True)
            return out.getvalue(), "jpg"
    except Exception as err:  # noqa: BLE001 - Pillow wirft viele Fehlerarten
        raise InvalidImage(str(err)) from err


class ImageStore:
    """Dateiablage unter <config>/essensplaner/images."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self.directory = Path(hass.config.path(DOMAIN, "images"))

    def find(self, image_id: str) -> Path | None:
        """Pfad zur Bilddatei oder None (blockierend)."""
        if not _ID_RE.match(image_id):
            return None
        for ext in _EXTENSIONS:
            path = self.directory / f"{image_id}.{ext}"
            if path.is_file():
                return path
        return None

    async def async_save(self, data: bytes) -> str:
        """Bild verarbeiten und speichern, liefert die neue Bild-ID."""
        if len(data) > MAX_BYTES:
            raise InvalidImage("Bild ist zu groß")
        image_id = uuid.uuid4().hex

        def _write() -> None:
            content, ext = _process(data)
            self.directory.mkdir(parents=True, exist_ok=True)
            (self.directory / f"{image_id}.{ext}").write_bytes(content)

        await self.hass.async_add_executor_job(_write)
        return image_id

    async def async_save_from_url(self, url: str) -> str:
        """Bild von einer URL laden und speichern."""
        if not url.lower().startswith(("http://", "https://")):
            raise InvalidImage("Nur http(s)-Adressen")
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(url, timeout=ClientTimeout(total=20)) as resp:
                resp.raise_for_status()
                data = await resp.content.read(MAX_BYTES + 1)
        except (ClientError, TimeoutError) as err:
            raise InvalidImage(f"Download fehlgeschlagen: {err}") from err
        return await self.async_save(data)

    async def async_delete(self, image_id: str) -> None:
        def _delete() -> None:
            if path := self.find(image_id):
                path.unlink(missing_ok=True)

        await self.hass.async_add_executor_job(_delete)

    async def async_cleanup(self, referenced: set[str]) -> int:
        """Nicht mehr verwendete Bilder löschen."""

        def _cleanup() -> int:
            if not self.directory.is_dir():
                return 0
            removed = 0
            for path in self.directory.iterdir():
                if path.stem not in referenced and _ID_RE.match(path.stem):
                    path.unlink(missing_ok=True)
                    removed += 1
            return removed

        return await self.hass.async_add_executor_job(_cleanup)


def _store(hass: HomeAssistant) -> ImageStore | None:
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is ConfigEntryState.LOADED:
            return entry.runtime_data.images
    return None


class ImageUploadView(HomeAssistantView):
    """Bild hochladen (multipart, Feld "file")."""

    url = UPLOAD_URL
    name = "api:essensplaner:upload"

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app[KEY_HASS]
        if (store := _store(hass)) is None:
            return self.json_message("Essensplaner nicht geladen", HTTPStatus.SERVICE_UNAVAILABLE)
        reader = await request.multipart()
        data = bytearray()
        while (part := await reader.next()) is not None:
            if getattr(part, "name", None) != "file":
                continue
            while chunk := await part.read_chunk():
                data.extend(chunk)
                if len(data) > MAX_BYTES:
                    return self.json_message("Bild ist zu groß", HTTPStatus.REQUEST_ENTITY_TOO_LARGE)
            break
        if not data:
            return self.json_message("Keine Datei", HTTPStatus.BAD_REQUEST)
        try:
            image_id = await store.async_save(bytes(data))
        except InvalidImage as err:
            return self.json_message(str(err), HTTPStatus.BAD_REQUEST)
        image = {"id": image_id, "source": "upload"}
        return self.json({**image, "url": image_url(image)})


class ImageServeView(HomeAssistantView):
    """Bild ausliefern. Ohne Anmeldung, damit <img> funktioniert; IDs sind zufällig."""

    url = IMAGE_URL
    name = "api:essensplaner:image"
    requires_auth = False

    async def get(self, request: web.Request, image_id: str) -> web.StreamResponse:
        hass: HomeAssistant = request.app[KEY_HASS]
        if (store := _store(hass)) is None:
            raise web.HTTPNotFound
        path = await hass.async_add_executor_job(store.find, image_id)
        if path is None:
            raise web.HTTPNotFound
        return web.FileResponse(
            path,
            headers={
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Type": _EXTENSIONS[path.suffix[1:]],
            },
        )
