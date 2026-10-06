"""Panel in der Seitenleiste und Lovelace-Karte registrieren."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN

STATIC_URL = f"/{DOMAIN}_static"
PANEL_URL_PATH = DOMAIN
PANEL_COMPONENT = "essensplaner-panel"
_FRONTEND_DIR = Path(__file__).parent / "frontend"
_DATA_STATIC = f"{DOMAIN}_static_registered"


async def _version(hass: HomeAssistant) -> str:
    integration = await async_get_integration(hass, DOMAIN)
    return str(integration.version)


def card_url(version: str) -> str:
    return f"{STATIC_URL}/essensplaner-card.js?v={version}"


async def async_register_static(hass: HomeAssistant) -> None:
    """Statische Dateien einmalig registrieren (lassen sich nicht wieder entfernen)."""
    if hass.data.get(_DATA_STATIC):
        return
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(_FRONTEND_DIR), cache_headers=False)]
    )
    hass.data[_DATA_STATIC] = True


async def async_register_panel(hass: HomeAssistant) -> None:
    """Panel und Karten-Skript anmelden."""
    version = await _version(hass)
    await panel_custom.async_register_panel(
        hass,
        webcomponent_name=PANEL_COMPONENT,
        frontend_url_path=PANEL_URL_PATH,
        module_url=f"{STATIC_URL}/essensplaner-panel.js?v={version}",
        sidebar_title="Essensplaner",
        sidebar_icon="mdi:silverware-fork-knife",
        require_admin=False,
        config={},
    )
    frontend.add_extra_js_url(hass, card_url(version))


async def async_unregister_panel(hass: HomeAssistant) -> None:
    """Panel und Karten-Skript abmelden."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
    frontend.remove_extra_js_url(hass, card_url(await _version(hass)))
