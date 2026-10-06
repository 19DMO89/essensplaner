"""Sensoren: heutige Mahlzeiten je Profil."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from . import EssensplanerConfigEntry
from .const import DOMAIN
from .manager import EssensplanerManager

MAX_STATE_LENGTH = 255


async def async_setup_entry(
    hass: HomeAssistant,
    entry: EssensplanerConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Sensoren für alle Profile anlegen und bei neuen Profilen ergänzen."""
    manager = entry.runtime_data
    known: dict[str, TodayMealsSensor] = {}

    @callback
    def _sync_profiles() -> None:
        new = [
            TodayMealsSensor(manager, entry.entry_id, pid)
            for pid in manager.profiles
            if pid not in known
        ]
        for sensor in new:
            known[sensor.profile_id] = sensor
        if new:
            async_add_entities(new)

        registry = er.async_get(hass)
        for pid in [p for p in known if p not in manager.profiles]:
            sensor = known.pop(pid)
            if sensor.entity_id and registry.async_get(sensor.entity_id):
                registry.async_remove(sensor.entity_id)

    _sync_profiles()
    entry.async_on_unload(manager.async_add_listener(_sync_profiles))


class TodayMealsSensor(SensorEntity):
    """Was es heute für ein Profil gibt."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_translation_key = "today"

    def __init__(self, manager: EssensplanerManager, entry_id: str, profile_id: str) -> None:
        self.manager = manager
        self.profile_id = profile_id
        self._attr_unique_id = f"{entry_id}_today_{profile_id}"
        self._attr_translation_placeholders = {"profile": manager.profiles[profile_id].name}
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Essensplaner",
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.manager.async_add_listener(self._handle_update))

    @callback
    def _handle_update(self) -> None:
        if self.profile_id in self.manager.profiles:
            self.async_write_ha_state()

    @property
    def native_value(self) -> str | None:
        meals = self.manager.today_meals(self.profile_id)
        if not meals:
            return None
        text = " · ".join(e["name"] for entries in meals.values() for e in entries)
        return text if len(text) <= MAX_STATE_LENGTH else text[: MAX_STATE_LENGTH - 1] + "…"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        profile = self.manager.profiles.get(self.profile_id)
        return {
            "date": dt_util.now().date().isoformat(),
            "profile_id": self.profile_id,
            "profile_name": profile.name if profile else None,
            "meals": self.manager.today_meals(self.profile_id),
        }
