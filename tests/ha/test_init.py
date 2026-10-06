"""Tests für Einrichtung, Entladen und Speicherung."""

from __future__ import annotations

from typing import Any

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant

from custom_components.essensplaner.const import (
    CONF_IMPORT_TODO,
    CONF_INITIAL_PROFILES,
    DOMAIN,
    STORAGE_KEY_DISHES,
    STORAGE_KEY_PLAN,
    STORAGE_KEY_PROFILES,
)
from custom_components.essensplaner.manager import EssensplanerManager


async def test_setup_and_unload_persists(
    hass: HomeAssistant, manager: EssensplanerManager, hass_storage: dict[str, Any]
) -> None:
    entry = manager.entry
    assert entry.state is ConfigEntryState.LOADED
    assert hass.services.has_service(DOMAIN, "generate_plan")

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.NOT_LOADED

    dishes = hass_storage[STORAGE_KEY_DISHES]["data"]["dishes"]
    assert {d["name"] for d in dishes} == {"Hühnerreis", "Gulasch"}
    profiles = hass_storage[STORAGE_KEY_PROFILES]["data"]
    assert [p["name"] for p in profiles["profiles"]] == ["Anna", "Ben"]
    assert profiles["meta"]["initialized"] is True

    # Erneut laden: Daten kommen aus dem Speicher, Profile werden nicht doppelt angelegt
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    reloaded: EssensplanerManager = entry.runtime_data
    assert [p.name for p in reloaded.profiles.values()] == ["Anna", "Ben"]
    assert reloaded.profiles[next(iter(reloaded.profiles))].not_tolerated == [
        "Zwiebel",
        "Paprika",
    ]
    assert set(reloaded.dishes) == {"d_huhn_reis", "d_gulasch"}


async def test_old_plan_days_pruned(hass: HomeAssistant, hass_storage: dict[str, Any]) -> None:
    hass_storage[STORAGE_KEY_PLAN] = {
        "version": 1,
        "minor_version": 1,
        "key": STORAGE_KEY_PLAN,
        "data": {
            "days": {
                "2000-01-01": {"lunch": [{"dish_id": "x", "profiles": ["p"], "servings": 1}]},
                "2999-01-01": {"lunch": [{"dish_id": "x", "profiles": ["p"], "servings": 1}]},
            }
        },
    }
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_INITIAL_PROFILES: ["Anna"]})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert list(entry.runtime_data.plan) == ["2999-01-01"]


async def test_initial_import_failure_does_not_block(hass: HomeAssistant) -> None:
    # todo-Dienst existiert nicht -> Import schlägt fehl, Einrichtung klappt trotzdem
    entry = MockConfigEntry(
        domain=DOMAIN,
        data={CONF_INITIAL_PROFILES: ["Anna"], CONF_IMPORT_TODO: "todo.gerichte"},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED
    assert entry.runtime_data.meta["initialized"] is True
