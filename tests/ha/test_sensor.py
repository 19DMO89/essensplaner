"""Tests für die Sensoren "Heute"."""

from __future__ import annotations

from freezegun.api import FrozenDateTimeFactory
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from custom_components.essensplaner.const import CONF_INITIAL_PROFILES, DOMAIN
from custom_components.essensplaner.manager import EssensplanerManager


def _entity_id(hass: HomeAssistant, manager: EssensplanerManager, profile_id: str) -> str | None:
    return er.async_get(hass).async_get_entity_id(
        "sensor", DOMAIN, f"{manager.entry.entry_id}_today_{profile_id}"
    )


async def test_today_sensor(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    anna, ben = manager.profiles
    entity_id = _entity_id(hass, manager, anna)
    assert entity_id is not None
    assert hass.states.get(entity_id).state == "unknown"

    today = dt_util.now().date().isoformat()
    manager.set_meal(today, "dinner", [{"dish_id": "d_gulasch", "profiles": [ben]}])
    manager.set_meal(today, "lunch", [{"dish_id": "d_huhn_reis", "profiles": [anna, ben]}])
    await hass.async_block_till_done()

    state = hass.states.get(entity_id)
    assert state.state == "Hühnerreis"
    assert state.attributes["profile_name"] == "Anna"
    assert state.attributes["meals"]["lunch"][0]["dish_id"] == "d_huhn_reis"
    assert hass.states.get(_entity_id(hass, manager, ben)).state == "Hühnerreis · Gulasch"


async def test_sensors_follow_profiles(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    profile = manager.save_profile({"name": "Gast"})
    await hass.async_block_till_done()
    entity_id = _entity_id(hass, manager, profile.id)
    assert entity_id is not None and hass.states.get(entity_id) is not None

    manager.delete_profile(profile.id)
    await hass.async_block_till_done()
    assert _entity_id(hass, manager, profile.id) is None
    assert hass.states.get(entity_id) is None


async def test_sensor_updates_at_midnight(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    freezer.move_to(dt_util.parse_datetime("2026-10-06T12:00:00-07:00"))
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_INITIAL_PROFILES: ["Anna"]})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    manager: EssensplanerManager = entry.runtime_data
    manager.save_dish({"id": "d1", "name": "Suppe"})
    manager.set_meal("2026-10-07", "lunch", [{"dish_id": "d1"}])
    await hass.async_block_till_done()

    entity_id = _entity_id(hass, manager, next(iter(manager.profiles)))
    assert hass.states.get(entity_id).state == "unknown"

    midnight = dt_util.parse_datetime("2026-10-07T00:00:06-07:00")
    freezer.move_to(midnight)
    async_fire_time_changed(hass, midnight)
    await hass.async_block_till_done()
    assert hass.states.get(entity_id).state == "Suppe"
