"""Tests für die WebSocket-API."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from custom_components.essensplaner.manager import EssensplanerManager


async def _call(client: Any, **msg: Any) -> dict[str, Any]:
    await client.send_json_auto_id(msg)
    return await client.receive_json()


async def test_data_and_crud(
    hass: HomeAssistant, manager: EssensplanerManager, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    anna, ben = manager.profiles

    msg = await _call(client, type="essensplaner/data")
    assert msg["success"]
    assert [p["name"] for p in msg["result"]["profiles"]] == ["Anna", "Ben"]
    assert msg["result"]["meal_types"] == ["breakfast", "lunch", "dinner", "snack"]

    msg = await _call(
        client,
        type="essensplaner/dish/save",
        dish={
            "name": "Reisbrei",
            "meal_types": ["breakfast"],
            "base_servings": 1,
            "ingredients": [{"name": "Reis", "amount": 50, "unit": "g", "role": "side"}],
        },
    )
    assert msg["success"]
    dish_id = msg["result"]["id"]
    assert manager.dishes[dish_id].name == "Reisbrei"

    msg = await _call(client, type="essensplaner/dish/check", dish_id="d_gulasch")
    assert msg["result"][anna]["status"] == "excluded"
    assert msg["result"][ben]["status"] == "ok"

    msg = await _call(
        client,
        type="essensplaner/profile/save",
        profile={"id": ben, "name": "Ben", "likes": ["Gulasch"], "unknown_ingredients": "allow"},
    )
    assert msg["success"]
    assert manager.profiles[ben].likes == ["Gulasch"]

    msg = await _call(client, type="essensplaner/dish/delete", dish_id=dish_id)
    assert msg["success"]
    assert dish_id not in manager.dishes

    msg = await _call(client, type="essensplaner/dish/save", dish={"name": ""})
    assert not msg["success"]


async def test_plan_and_shopping(
    hass: HomeAssistant, manager: EssensplanerManager, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)
    anna, ben = manager.profiles
    today = dt_util.now().date().isoformat()

    msg = await _call(
        client,
        type="essensplaner/plan/set_meal",
        date=today,
        meal_type="lunch",
        assignments=[
            {"dish_id": "d_huhn_reis", "profiles": [anna]},
            {"dish_id": "d_gulasch", "profiles": [ben], "servings": 4},
        ],
    )
    assert msg["success"]
    lunch = msg["result"][today]["lunch"]
    assert [a["dish_name"] for a in lunch["assignments"]] == ["Hühnerreis", "Gulasch"]
    assert lunch["shared_base"] == []

    msg = await _call(client, type="essensplaner/shopping/preview", start_date=today, days=1)
    assert msg["success"]
    summaries = {i["summary"] for i in msg["result"]}
    assert "Rindfleisch – 500 g" in summaries
    assert "Reis – 75 g" in summaries

    msg = await _call(
        client,
        type="essensplaner/plan/generate",
        start_date=today,
        days=3,
        meal_types=["dinner"],
        overwrite=True,
    )
    assert msg["success"]
    assert msg["result"]["days"][today]["lunch"]["assignments"][0]["locked"] is True
    assert "dinner" in msg["result"]["days"][today]

    msg = await _call(client, type="essensplaner/plan/get", start_date=today, days=1)
    assert set(msg["result"]) == {today}

    msg = await _call(
        client,
        type="essensplaner/plan/set_meal",
        date=today,
        meal_type="lunch",
        assignments=[{"dish_id": "gibt es nicht"}],
    )
    assert not msg["success"]
    assert msg["error"]["code"] == "invalid"
