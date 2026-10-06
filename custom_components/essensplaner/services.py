"""Services (Aktionen) des Essensplaners."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    callback,
)
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util
import voluptuous as vol

from .const import (
    ATTR_ALTERNATIVES,
    ATTR_DATE,
    ATTR_DAYS,
    ATTR_DISH,
    ATTR_INDEX,
    ATTR_MEAL_TYPE,
    ATTR_MEAL_TYPES,
    ATTR_OVERWRITE,
    ATTR_PROFILES,
    ATTR_SEED,
    ATTR_SERVINGS,
    ATTR_SKIP_EXISTING,
    ATTR_START_DATE,
    DOMAIN,
    MAX_ALTERNATIVES,
    MAX_PLAN_DAYS,
    SERVICE_CHOOSE_MEAL,
    SERVICE_GENERATE_PLAN,
    SERVICE_PUSH_SHOPPING_LIST,
    SERVICE_SET_MEAL,
)
from .logic.models import MEAL_TYPES
from .manager import EssensplanerManager

_DAYS = vol.All(vol.Coerce(int), vol.Range(min=1, max=MAX_PLAN_DAYS))

GENERATE_PLAN_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_START_DATE): cv.date,
        vol.Optional(ATTR_DAYS, default=7): _DAYS,
        vol.Optional(ATTR_MEAL_TYPES): vol.All(cv.ensure_list, [vol.In(MEAL_TYPES)]),
        vol.Optional(ATTR_PROFILES): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(ATTR_OVERWRITE, default=False): cv.boolean,
        vol.Optional(ATTR_SEED): vol.Coerce(int),
        vol.Optional(ATTR_ALTERNATIVES): vol.All(
            vol.Coerce(int), vol.Range(min=0, max=MAX_ALTERNATIVES)
        ),
    }
)

CHOOSE_MEAL_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DATE): cv.date,
        vol.Required(ATTR_MEAL_TYPE): vol.In(MEAL_TYPES),
        vol.Required(ATTR_DISH): cv.string,
        vol.Optional(ATTR_INDEX, default=0): vol.All(vol.Coerce(int), vol.Range(min=0)),
    }
)

PUSH_SHOPPING_LIST_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_START_DATE): cv.date,
        vol.Optional(ATTR_DAYS, default=7): _DAYS,
        vol.Optional("entity_id"): cv.entity_domain("todo"),
        vol.Optional(ATTR_SKIP_EXISTING, default=True): cv.boolean,
    }
)

SET_MEAL_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_DATE): cv.date,
        vol.Required(ATTR_MEAL_TYPE): vol.In(MEAL_TYPES),
        vol.Optional(ATTR_DISH): cv.string,
        vol.Optional(ATTR_PROFILES): vol.All(cv.ensure_list, [cv.string]),
        vol.Optional(ATTR_SERVINGS): vol.All(vol.Coerce(float), vol.Range(min=0.5)),
    }
)


def get_manager(hass: HomeAssistant) -> EssensplanerManager:
    """Manager des geladenen Config Entries."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is ConfigEntryState.LOADED:
            return entry.runtime_data
    raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")


@callback
def async_register_services(hass: HomeAssistant) -> None:
    """Services registrieren (einmalig in async_setup)."""

    async def generate_plan(call: ServiceCall) -> ServiceResponse:
        manager = get_manager(hass)
        start = call.data.get(ATTR_START_DATE) or dt_util.now().date()
        days = call.data[ATTR_DAYS]
        result = manager.generate_plan(
            start,
            days,
            call.data.get(ATTR_MEAL_TYPES),
            call.data.get(ATTR_PROFILES),
            call.data[ATTR_OVERWRITE],
            call.data.get(ATTR_SEED),
            alternatives=call.data.get(ATTR_ALTERNATIVES),
        )
        return {"days": manager.days_view(start, days), "warnings": result.warnings}

    async def push_shopping_list(call: ServiceCall) -> ServiceResponse:
        manager = get_manager(hass)
        return await manager.async_push_shopping_list(
            call.data.get(ATTR_START_DATE) or dt_util.now().date(),
            call.data[ATTR_DAYS],
            call.data.get("entity_id"),
            call.data[ATTR_SKIP_EXISTING],
        )

    async def set_meal(call: ServiceCall) -> ServiceResponse:
        manager = get_manager(hass)
        day = call.data[ATTR_DATE]
        manager.assign_dish(
            day.isoformat(),
            call.data[ATTR_MEAL_TYPE],
            call.data.get(ATTR_DISH),
            call.data.get(ATTR_PROFILES),
            call.data.get(ATTR_SERVINGS),
        )
        return manager.days_view(day, 1)

    async def choose_meal(call: ServiceCall) -> ServiceResponse:
        manager = get_manager(hass)
        day = call.data[ATTR_DATE]
        manager.choose_dish(
            day.isoformat(), call.data[ATTR_MEAL_TYPE], call.data[ATTR_INDEX], call.data[ATTR_DISH]
        )
        return manager.days_view(day, 1)

    hass.services.async_register(
        DOMAIN,
        SERVICE_CHOOSE_MEAL,
        choose_meal,
        schema=CHOOSE_MEAL_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_GENERATE_PLAN,
        generate_plan,
        schema=GENERATE_PLAN_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_PUSH_SHOPPING_LIST,
        push_shopping_list,
        schema=PUSH_SHOPPING_LIST_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_MEAL,
        set_meal,
        schema=SET_MEAL_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
