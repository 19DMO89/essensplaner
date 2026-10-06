"""Tests für die Services."""

from __future__ import annotations

from datetime import timedelta

import pytest

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError
from homeassistant.util import dt as dt_util

from custom_components.essensplaner.const import DOMAIN
from custom_components.essensplaner.manager import EssensplanerManager

from .conftest import TODO_ENTITY


def _ids(manager: EssensplanerManager) -> tuple[str, str]:
    anna, ben = manager.profiles
    return anna, ben


async def test_generate_plan(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    anna, ben = _ids(manager)
    start = dt_util.now().date()
    response = await hass.services.async_call(
        DOMAIN,
        "generate_plan",
        {"start_date": start.isoformat(), "days": 2, "meal_types": ["lunch"], "seed": 1},
        blocking=True,
        return_response=True,
    )
    day = response["days"][start.isoformat()]
    assert set(day) == {"lunch"}
    by_profile = {
        p: a["dish_name"] for a in day["lunch"]["assignments"] for p in a["profiles"]
    }
    assert by_profile[anna] == "Hühnerreis"  # Gulasch enthält Zwiebeln
    assert response["warnings"] == []

    # Ohne overwrite bleibt der Plan unverändert
    before = manager.days_view(start, 2)
    await hass.services.async_call(
        DOMAIN, "generate_plan", {"start_date": start.isoformat(), "days": 2}, blocking=True
    )
    assert manager.days_view(start, 2)[start.isoformat()]["lunch"] == before[start.isoformat()]["lunch"]
    # Standard-Mahlzeiten aus den Optionen: Abendessen kam dazu
    assert "dinner" in manager.days_view(start, 1)[start.isoformat()]


async def test_generate_plan_unknown_profile(
    hass: HomeAssistant, manager: EssensplanerManager
) -> None:
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "generate_plan", {"profiles": ["Niemand"]}, blocking=True
        )


async def test_set_meal_by_name(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    anna, ben = _ids(manager)
    day = (dt_util.now().date() + timedelta(days=1)).isoformat()
    await hass.services.async_call(
        DOMAIN,
        "set_meal",
        {"date": day, "meal_type": "dinner", "dish": "hühnerreis"},
        blocking=True,
    )
    await hass.services.async_call(
        DOMAIN,
        "set_meal",
        {"date": day, "meal_type": "dinner", "dish": "Gulasch", "profiles": ["Ben"], "servings": 3},
        blocking=True,
    )
    slot = manager.plan[day]["dinner"]
    assert [(a.dish_id, a.profiles, a.servings, a.locked) for a in slot] == [
        ("d_huhn_reis", [anna], 1.0, True),
        ("d_gulasch", [ben], 3.0, True),
    ]

    # Ohne Gericht: für Anna entfernen
    await hass.services.async_call(
        DOMAIN,
        "set_meal",
        {"date": day, "meal_type": "dinner", "profiles": ["Anna"]},
        blocking=True,
    )
    assert [a.dish_id for a in manager.plan[day]["dinner"]] == ["d_gulasch"]


async def test_push_shopping_list(
    hass: HomeAssistant, manager: EssensplanerManager, todo_calls: list[ServiceCall]
) -> None:
    day = dt_util.now().date().isoformat()
    manager.set_meal(day, "lunch", [{"dish_id": "d_huhn_reis", "servings": 4}])
    response = await hass.services.async_call(
        DOMAIN, "push_shopping_list", {"days": 1}, blocking=True, return_response=True
    )
    assert response == {
        "added": ["Hühnerbrust – 500 g", "Karotten – 4 Stk", "Reis – 300 g"],
        "skipped": ["Salz"],
    }
    assert [c.data["item"] for c in todo_calls] == response["added"]
    assert all(c.data["entity_id"] == [TODO_ENTITY] or c.data["entity_id"] == TODO_ENTITY for c in todo_calls)
    assert all("description" not in c.data for c in todo_calls)


async def test_push_shopping_list_without_target(
    hass: HomeAssistant, manager: EssensplanerManager
) -> None:
    hass.config_entries.async_update_entry(manager.entry, options={"meal_types": ["lunch"]})
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(DOMAIN, "push_shopping_list", {}, blocking=True)
