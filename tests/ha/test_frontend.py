"""Tests für Panel, Bilder und die neuen WebSocket-Befehle (Phase 2)."""

from __future__ import annotations

import io
from typing import Any

from aiohttp import FormData
from PIL import Image

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.util import dt as dt_util

from custom_components.essensplaner.manager import EssensplanerManager


def _png(width: int = 2000, height: int = 1000) -> bytes:
    out = io.BytesIO()
    Image.new("RGB", (width, height), (200, 80, 40)).save(out, format="PNG")
    return out.getvalue()


async def _call(client: Any, **msg: Any) -> dict[str, Any]:
    await client.send_json_auto_id(msg)
    return await client.receive_json()


async def test_panel_registered(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    panels = hass.data["frontend_panels"]
    assert "essensplaner" in panels
    assert panels["essensplaner"].sidebar_title == "Essensplaner"

    assert await hass.config_entries.async_unload(manager.entry.entry_id)
    await hass.async_block_till_done()
    assert "essensplaner" not in hass.data["frontend_panels"]


async def test_static_files_served(
    hass: HomeAssistant, manager: EssensplanerManager, hass_client: Any
) -> None:
    client = await hass_client()
    for name in ("essensplaner-panel.js", "essensplaner-card.js"):
        resp = await client.get(f"/essensplaner_static/{name}")
        assert resp.status == 200, name
        assert "customElements.define" in await resp.text()


async def test_image_upload_serve_and_cleanup(
    hass: HomeAssistant, manager: EssensplanerManager, hass_client: Any, hass_client_no_auth: Any
) -> None:
    client = await hass_client()
    form = FormData()
    form.add_field("file", _png(), filename="foto.png", content_type="image/png")
    resp = await client.post("/api/essensplaner/upload", data=form)
    assert resp.status == 200
    result = await resp.json()
    image_id = result["id"]
    assert result["url"] == f"/api/essensplaner/images/{image_id}"

    # Ausliefern ohne Anmeldung, verkleinert auf max. 1280 px, als JPEG
    anon = await hass_client_no_auth()
    resp = await anon.get(result["url"])
    assert resp.status == 200
    assert resp.headers["Content-Type"] == "image/jpeg"
    with Image.open(io.BytesIO(await resp.read())) as img:
        assert max(img.size) == 1280

    # Gericht mit Bild speichern, Bild ersetzen -> altes Bild wird gelöscht
    manager.save_dish({"id": "d_huhn_reis", "name": "Hühnerreis", "image": {"id": image_id}})
    form = FormData()
    form.add_field("file", _png(100, 100), filename="b.png", content_type="image/png")
    second = await (await client.post("/api/essensplaner/upload", data=form)).json()
    manager.save_dish({"id": "d_huhn_reis", "name": "Hühnerreis", "image": {"id": second["id"]}})
    await hass.async_block_till_done()
    assert (await anon.get(result["url"])).status == 404
    assert (await anon.get(second["url"])).status == 200

    # Gericht löschen -> Bild weg
    manager.delete_dish("d_huhn_reis")
    await hass.async_block_till_done()
    assert (await anon.get(second["url"])).status == 404


async def test_image_upload_rejects_non_images(
    hass: HomeAssistant, manager: EssensplanerManager, hass_client: Any, hass_client_no_auth: Any
) -> None:
    client = await hass_client()
    form = FormData()
    form.add_field("file", b"kein bild", filename="x.txt", content_type="text/plain")
    resp = await client.post("/api/essensplaner/upload", data=form)
    assert resp.status == 400

    anon = await hass_client_no_auth()
    # Path Traversal: blockt bereits HAs Security-Filter (400) oder unsere ID-Prüfung (404)
    assert (await anon.get("/api/essensplaner/images/..%2F..%2Fsecrets")).status in (400, 404)
    assert (await anon.get("/api/essensplaner/images/secrets")).status == 404
    assert (await anon.get("/api/essensplaner/images/" + "a" * 32)).status == 404


async def test_upload_requires_auth(
    hass: HomeAssistant, manager: EssensplanerManager, hass_client_no_auth: Any
) -> None:
    anon = await hass_client_no_auth()
    form = FormData()
    form.add_field("file", _png(10, 10), filename="a.png", content_type="image/png")
    assert (await anon.post("/api/essensplaner/upload", data=form)).status == 401


async def test_orphan_images_cleaned_on_start(
    hass: HomeAssistant, manager: EssensplanerManager
) -> None:
    kept = await manager.images.async_save(_png(10, 10))
    orphan = await manager.images.async_save(_png(10, 10))
    manager.save_dish({"id": "d_gulasch", "name": "Gulasch", "image": {"id": kept}})
    await manager.async_cleanup_images()
    assert await hass.async_add_executor_job(manager.images.find, kept)
    assert await hass.async_add_executor_job(manager.images.find, orphan) is None


async def test_subscribe_compat_and_parse(
    hass: HomeAssistant, manager: EssensplanerManager, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    anna, ben = manager.profiles

    msg = await _call(client, type="essensplaner/subscribe")
    assert msg["success"]
    sub_id = msg["id"]
    manager.save_dish({"name": "Neu"})
    event = await client.receive_json()
    assert event["id"] == sub_id and event["event"] == {"changed": True}

    msg = await _call(client, type="essensplaner/compat/all")
    assert msg["result"]["d_huhn_reis"] == {anna: "ok", ben: "ok"}
    assert msg["result"]["d_gulasch"][anna] == "excluded"

    msg = await _call(
        client, type="essensplaner/parse_ingredients", text="250 g Reis #beilage\n\n2 Karotten"
    )
    assert msg["result"] == [
        {"name": "Reis", "amount": 250.0, "unit": "g", "role": "side"},
        {"name": "Karotten", "amount": 2.0, "unit": None, "role": "other"},
    ]


async def test_dish_save_ignores_extra_fields(
    hass: HomeAssistant, manager: EssensplanerManager, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    dish = {**manager.dishes["d_gulasch"].to_dict(), "name": "Gulasch neu"}
    msg = await _call(client, type="essensplaner/dish/save", dish=dish)
    assert msg["success"], msg
    assert manager.dishes["d_gulasch"].name == "Gulasch neu"

    msg = await _call(
        client,
        type="essensplaner/dish/save",
        dish={"name": "X", "image": {"id": "../../etc/passwd"}},
    )
    assert not msg["success"]


async def test_generate_with_meals_per_day(
    hass: HomeAssistant, manager: EssensplanerManager, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    today = dt_util.now().date()
    tomorrow = today.fromordinal(today.toordinal() + 1)
    msg = await _call(
        client,
        type="essensplaner/plan/generate",
        start_date=today.isoformat(),
        days=2,
        meals={today.isoformat(): ["lunch"], tomorrow.isoformat(): ["dinner", "snack"]},
    )
    assert msg["success"], msg
    assert set(manager.plan[today.isoformat()]) == {"lunch"}
    # Snack: kein Gericht vorhanden -> Warnung, Abendessen geplant
    assert set(manager.plan[tomorrow.isoformat()]) == {"dinner"}
    assert any(w["meal_type"] == "snack" for w in msg["result"]["warnings"])


async def test_push_only_selected_keys(
    hass: HomeAssistant,
    manager: EssensplanerManager,
    hass_ws_client: Any,
    todo_calls: list[ServiceCall],
) -> None:
    client = await hass_ws_client(hass)
    today = dt_util.now().date().isoformat()
    manager.set_meal(today, "lunch", [{"dish_id": "d_huhn_reis"}])
    msg = await _call(
        client,
        type="essensplaner/shopping/push",
        start_date=today,
        days=1,
        keys=["reis"],
    )
    assert msg["success"], msg
    assert msg["result"]["added"] == ["Reis – 150 g"]
    assert [c.data["item"] for c in todo_calls] == ["Reis – 150 g"]


async def test_sensor_has_image_url(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    image_id = await manager.images.async_save(_png(10, 10))
    manager.save_dish({"id": "d_huhn_reis", "name": "Hühnerreis", "image": {"id": image_id}})
    manager.set_meal(dt_util.now().date().isoformat(), "lunch", [{"dish_id": "d_huhn_reis"}])
    meals = manager.today_meals(next(iter(manager.profiles)))
    assert meals["lunch"][0]["image_url"] == f"/api/essensplaner/images/{image_id}"


async def test_ingredient_checklist(
    hass: HomeAssistant, manager: EssensplanerManager, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    anna, ben = manager.profiles

    msg = await _call(client, type="essensplaner/profile/ingredients", profile_id=anna)
    assert msg["success"], msg
    items = {i["name"]: i for i in msg["result"]}
    assert items["Reis"]["state"] == "tolerated" and items["Reis"]["explicit"]
    assert items["Rindfleisch"]["state"] == "unknown"
    assert msg["result"][0]["count"] >= msg["result"][-1]["count"]

    # Gulasch passt für Anna nicht (Zwiebeln, Rindfleisch unbekannt)
    assert not manager.profiles[anna].not_tolerated == []
    for name, state in (("Rindfleisch", "tolerated"), ("Zwiebeln", "tolerated")):
        msg = await _call(
            client,
            type="essensplaner/profile/set_ingredient",
            profile_id=anna,
            name=name,
            state=state,
        )
        assert msg["success"], msg
    profile = manager.profiles[anna]
    assert "Zwiebel" not in profile.not_tolerated
    assert {"Rindfleisch", "Zwiebeln"} <= set(profile.tolerated)
    msg = await _call(client, type="essensplaner/compat/all")
    assert msg["result"]["d_gulasch"][anna] == "ok"

    # Nur wenig mit Limit, dann zurück auf offen
    msg = await _call(
        client,
        type="essensplaner/profile/set_ingredient",
        profile_id=anna,
        name="Butter",
        state="small",
        max_amount=10,
        unit="g",
    )
    butter = next(i for i in msg["result"] if i["name"] == "Butter")
    assert butter["state"] == "small" and butter["max_amount"] == 10
    msg = await _call(
        client,
        type="essensplaner/profile/set_ingredient",
        profile_id=anna,
        name="Butter",
        state="unknown",
    )
    assert all(i["name"] != "Butter" for i in msg["result"])  # in keinem Gericht, nicht mehr gelistet
    assert manager.profiles[anna].small_amounts == []

    msg = await _call(
        client, type="essensplaner/profile/ingredients", profile_id="gibt es nicht"
    )
    assert not msg["success"]
