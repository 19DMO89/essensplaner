"""Fixtures für die Home-Assistant-Tests."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse

from custom_components.essensplaner.const import (
    CONF_INITIAL_PROFILES,
    CONF_MEAL_TYPES,
    CONF_SHOPPING_LIST,
    DOMAIN,
)
from custom_components.essensplaner.manager import EssensplanerManager

TODO_ENTITY = "todo.einkauf"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations: Any) -> Generator[None]:
    """Custom Integrations in allen Tests erlauben."""
    yield


@pytest.fixture
def mock_entry() -> MockConfigEntry:
    return MockConfigEntry(
        domain=DOMAIN,
        title="Essensplaner",
        data={CONF_INITIAL_PROFILES: ["Anna", "Ben"]},
        options={CONF_MEAL_TYPES: ["lunch", "dinner"], CONF_SHOPPING_LIST: TODO_ENTITY},
    )


@pytest.fixture
async def manager(hass: HomeAssistant, mock_entry: MockConfigEntry) -> EssensplanerManager:
    """Eingerichtete Integration mit zwei Profilen und Beispielgerichten."""
    mock_entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(mock_entry.entry_id)
    await hass.async_block_till_done()
    mgr: EssensplanerManager = mock_entry.runtime_data
    anna, ben = mgr.profiles.values()
    mgr.save_profile(
        {
            **anna.to_dict(),
            "tolerated": ["Reis", "Hühnerbrust", "Karotte", "Salz"],
            "not_tolerated": ["Zwiebel", "Paprika"],
            "unknown_ingredients": "exclude",
        }
    )
    mgr.save_profile({**ben.to_dict(), "unknown_ingredients": "allow"})
    mgr.save_dish(
        {
            "id": "d_huhn_reis",
            "name": "Hühnerreis",
            "base_servings": 2,
            "ingredients": [
                {"name": "Hühnerbrust", "amount": 250, "unit": "g", "role": "protein"},
                {"name": "Reis", "amount": 150, "unit": "g", "role": "side"},
                {"name": "Karotten", "amount": 2},
                {"name": "Salz"},
            ],
        }
    )
    mgr.save_dish(
        {
            "id": "d_gulasch",
            "name": "Gulasch",
            "base_servings": 4,
            "ingredients": [
                {"name": "Rindfleisch", "amount": 500, "unit": "g", "role": "protein"},
                {"name": "Zwiebeln", "amount": 3},
            ],
        }
    )
    await hass.async_block_till_done()
    return mgr


@pytest.fixture
def todo_calls(hass: HomeAssistant) -> list[ServiceCall]:
    """Einfache To-do-Liste: zeichnet add_item auf, get_items liefert 'Salz'."""
    calls: list[ServiceCall] = []
    hass.states.async_set(TODO_ENTITY, "1", {"supported_features": 0})

    async def add_item(call: ServiceCall) -> None:
        calls.append(call)

    async def get_items(call: ServiceCall) -> dict[str, Any]:
        return {
            TODO_ENTITY: {
                "items": [{"summary": "Salz", "uid": "1", "status": "needs_action"}]
            }
        }

    hass.services.async_register("todo", "add_item", add_item)
    hass.services.async_register(
        "todo", "get_items", get_items, supports_response=SupportsResponse.ONLY
    )
    return calls
