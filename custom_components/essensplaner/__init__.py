"""Essensplaner: Wochen-Essenspläne mit mehreren Ernährungsprofilen."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN
from .manager import EssensplanerManager
from .services import async_register_services
from .websocket_api import async_register_websocket

PLATFORMS: list[Platform] = [Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

EssensplanerConfigEntry = ConfigEntry[EssensplanerManager]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Services und WebSocket-Befehle einmalig registrieren."""
    async_register_services(hass)
    async_register_websocket(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: EssensplanerConfigEntry) -> bool:
    """Daten laden und Plattformen starten."""
    manager = EssensplanerManager(hass, entry)
    await manager.async_load()
    entry.runtime_data = manager
    await manager.async_initialize()
    entry.async_on_unload(manager.async_start())
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: EssensplanerConfigEntry) -> bool:
    """Plattformen entladen und ausstehende Änderungen speichern."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        await entry.runtime_data.async_shutdown()
    return unload_ok
