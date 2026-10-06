"""WebSocket-API für Panel und Karte."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN, MAX_ALTERNATIVES, MAX_PLAN_DAYS
from .images import InvalidImage, image_url
from .logic.compat import check_dish
from .logic.groups import GROUP_IDS, GROUPS
from .logic.ingredients import STATES
from .logic.normalize import parse_ingredient_line
from .logic.models import MEAL_TYPES
from .manager import EssensplanerManager
from .schemas import ASSIGNMENT_SCHEMA, DISH_SCHEMA, PROFILE_SCHEMA

_RANGE = {
    vol.Required("start_date"): cv.date,
    vol.Optional("days", default=7): vol.All(vol.Coerce(int), vol.Range(min=1, max=MAX_PLAN_DAYS)),
}


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    """Alle WebSocket-Befehle registrieren."""
    for handler in (
        ws_data,
        ws_dish_save,
        ws_dish_delete,
        ws_dish_check,
        ws_profile_save,
        ws_profile_delete,
        ws_plan_get,
        ws_plan_set_meal,
        ws_plan_generate,
        ws_shopping_preview,
        ws_shopping_push,
        ws_image_from_url,
        ws_subscribe,
        ws_compat_all,
        ws_parse_ingredients,
        ws_profile_ingredients,
        ws_profile_set_ingredient,
        ws_profile_set_groups,
        ws_profile_groups,
        ws_plan_choose,
    ):
        websocket_api.async_register_command(hass, handler)


def _manager(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg_id: int) -> EssensplanerManager | None:
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is ConfigEntryState.LOADED:
            return entry.runtime_data
    connection.send_error(msg_id, "not_loaded", "Essensplaner ist nicht geladen")
    return None


def _with_manager(func):
    """Manager auflösen und Fehler einheitlich als WebSocket-Fehler melden."""

    async def _wrapper(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
        if (manager := _manager(hass, connection, msg["id"])) is None:
            return
        try:
            result = await func(manager, msg)
        except HomeAssistantError as err:
            connection.send_error(msg["id"], "invalid", str(err))
            return
        connection.send_result(msg["id"], result)

    return _wrapper


def _data(manager: EssensplanerManager) -> dict[str, Any]:
    return {
        "profiles": [p.to_dict() for p in manager.profiles.values()],
        "dishes": [d.to_dict() for d in manager.dishes.values()],
        "meal_types": list(MEAL_TYPES),
        "default_meal_types": manager.default_meal_types,
        "shopping_list": manager.shopping_list_entity,
        "groups": [g.to_dict() for g in GROUPS.values()],
        "alternatives": manager.default_alternatives,
    }


@websocket_api.websocket_command({vol.Required("type"): "essensplaner/data"})
@websocket_api.async_response
@_with_manager
async def ws_data(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    return _data(manager)


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/dish/save", vol.Required("dish"): DISH_SCHEMA}
)
@websocket_api.async_response
@_with_manager
async def ws_dish_save(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    return manager.save_dish(msg["dish"]).to_dict()


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/dish/delete", vol.Required("dish_id"): str}
)
@websocket_api.async_response
@_with_manager
async def ws_dish_delete(manager: EssensplanerManager, msg: dict[str, Any]) -> None:
    manager.delete_dish(msg["dish_id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/dish/check", vol.Required("dish_id"): str}
)
@websocket_api.async_response
@_with_manager
async def ws_dish_check(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    dish = manager.dishes[manager.resolve_dish(msg["dish_id"])]
    return {pid: check_dish(dish, p).to_dict() for pid, p in manager.profiles.items()}


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/profile/save", vol.Required("profile"): PROFILE_SCHEMA}
)
@websocket_api.async_response
@_with_manager
async def ws_profile_save(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    return manager.save_profile(msg["profile"]).to_dict()


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/profile/delete", vol.Required("profile_id"): str}
)
@websocket_api.async_response
@_with_manager
async def ws_profile_delete(manager: EssensplanerManager, msg: dict[str, Any]) -> None:
    manager.delete_profile(msg["profile_id"])


@websocket_api.websocket_command({vol.Required("type"): "essensplaner/plan/get", **_RANGE})
@websocket_api.async_response
@_with_manager
async def ws_plan_get(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    return manager.days_view(msg["start_date"], msg["days"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "essensplaner/plan/set_meal",
        vol.Required("date"): cv.date,
        vol.Required("meal_type"): vol.In(MEAL_TYPES),
        vol.Required("assignments"): [ASSIGNMENT_SCHEMA],
    }
)
@websocket_api.async_response
@_with_manager
async def ws_plan_set_meal(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    manager.set_meal(msg["date"].isoformat(), msg["meal_type"], msg["assignments"])
    return manager.days_view(msg["date"], 1)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "essensplaner/plan/generate",
        **_RANGE,
        vol.Optional("meal_types"): [vol.In(MEAL_TYPES)],
        vol.Optional("profiles"): [str],
        vol.Optional("overwrite", default=False): bool,
        # Mahlzeiten je Tag: {"2026-10-06": ["lunch", "dinner"], ...}
        vol.Optional("meals"): {cv.string: [vol.In(MEAL_TYPES)]},
        vol.Optional("alternatives"): vol.All(vol.Coerce(int), vol.Range(min=0, max=MAX_ALTERNATIVES)),
    }
)
@websocket_api.async_response
@_with_manager
async def ws_plan_generate(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    meals = msg.get("meals")
    if meals is not None:
        meals = {cv.date(day).isoformat(): types for day, types in meals.items()}
    result = manager.generate_plan(
        msg["start_date"],
        msg["days"],
        msg.get("meal_types"),
        msg.get("profiles"),
        msg["overwrite"],
        meals_by_date=meals,
        alternatives=msg.get("alternatives"),
    )
    return {
        "days": manager.days_view(msg["start_date"], msg["days"]),
        "warnings": result.warnings,
    }


@websocket_api.websocket_command({vol.Required("type"): "essensplaner/shopping/preview", **_RANGE})
@websocket_api.async_response
@_with_manager
async def ws_shopping_preview(manager: EssensplanerManager, msg: dict[str, Any]) -> list[dict[str, Any]]:
    return [i.to_dict() for i in manager.shopping_items(msg["start_date"], msg["days"])]


@websocket_api.websocket_command(
    {
        vol.Required("type"): "essensplaner/shopping/push",
        **_RANGE,
        vol.Optional("entity_id"): cv.entity_domain("todo"),
        vol.Optional("skip_existing", default=True): bool,
        vol.Optional("keys"): [str],
    }
)
@websocket_api.async_response
@_with_manager
async def ws_shopping_push(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    return await manager.async_push_shopping_list(
        msg["start_date"],
        msg["days"],
        msg.get("entity_id"),
        msg["skip_existing"],
        keys=msg.get("keys"),
    )


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/image/from_url", vol.Required("url"): str}
)
@websocket_api.async_response
@_with_manager
async def ws_image_from_url(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    try:
        image_id = await manager.images.async_save_from_url(msg["url"])
    except InvalidImage as err:
        raise HomeAssistantError(str(err)) from err
    image = {"id": image_id, "source": "url", "origin": msg["url"]}
    return {**image, "url": image_url(image)}


@websocket_api.websocket_command({vol.Required("type"): "essensplaner/subscribe"})
@callback
def ws_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Meldet jede Datenänderung (Panel und Karte laden dann neu)."""
    if (manager := _manager(hass, connection, msg["id"])) is None:
        return

    @callback
    def _changed() -> None:
        connection.send_message(websocket_api.event_message(msg["id"], {"changed": True}))

    connection.subscriptions[msg["id"]] = manager.async_add_listener(_changed)
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "essensplaner/compat/all"})
@websocket_api.async_response
@_with_manager
async def ws_compat_all(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    """Status je Gericht und Profil: {dish_id: {profile_id: "ok"|"warn"|"excluded"}}."""
    return {
        dish_id: {pid: check_dish(dish, p).status for pid, p in manager.profiles.items()}
        for dish_id, dish in manager.dishes.items()
    }


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/parse_ingredients", vol.Required("text"): str}
)
@websocket_api.async_response
@_with_manager
async def ws_parse_ingredients(
    manager: EssensplanerManager, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Zutatenzeilen ("250 g Reis #beilage") in strukturierte Zutaten umwandeln."""
    result = []
    for line in msg["text"].splitlines():
        if (ingredient := parse_ingredient_line(line)) is not None:
            result.append(ingredient.to_dict())
    return result


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/profile/ingredients", vol.Required("profile_id"): str}
)
@websocket_api.async_response
@_with_manager
async def ws_profile_ingredients(
    manager: EssensplanerManager, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Alle Zutaten mit Zustand für die Klick-Liste eines Profils."""
    return manager.ingredient_overview(msg["profile_id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "essensplaner/profile/set_ingredient",
        vol.Required("profile_id"): str,
        vol.Required("name"): vol.All(str, vol.Strip, vol.Length(min=1)),
        vol.Required("state"): vol.In(STATES),
        vol.Optional("max_amount"): vol.Any(None, vol.All(vol.Coerce(float), vol.Range(min=0))),
        vol.Optional("unit"): vol.Any(None, str),
    }
)
@websocket_api.async_response
@_with_manager
async def ws_profile_set_ingredient(
    manager: EssensplanerManager, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Eine Zutat markieren; liefert die aktualisierte Liste."""
    manager.set_ingredient_state(
        msg["profile_id"], msg["name"], msg["state"], msg.get("max_amount"), msg.get("unit")
    )
    return manager.ingredient_overview(msg["profile_id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "essensplaner/profile/set_groups",
        vol.Required("profile_id"): str,
        vol.Required("excluded_groups"): [vol.In(GROUP_IDS)],
    }
)
@websocket_api.async_response
@_with_manager
async def ws_profile_set_groups(
    manager: EssensplanerManager, msg: dict[str, Any]
) -> list[dict[str, Any]]:
    """Ausgeschlossene Gruppen (Fleischsorten, Allergene) setzen; liefert die Zutatenliste."""
    manager.set_excluded_groups(msg["profile_id"], msg["excluded_groups"])
    return manager.ingredient_overview(msg["profile_id"])


@websocket_api.websocket_command(
    {vol.Required("type"): "essensplaner/profile/groups", vol.Required("profile_id"): str}
)
@websocket_api.async_response
@_with_manager
async def ws_profile_groups(manager: EssensplanerManager, msg: dict[str, Any]) -> list[dict[str, Any]]:
    """Allergene und Fleischsorten mit Zustand und betroffenen Zutaten."""
    return manager.group_overview(msg["profile_id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "essensplaner/plan/choose",
        vol.Required("date"): cv.date,
        vol.Required("meal_type"): vol.In(MEAL_TYPES),
        vol.Required("index"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Required("dish_id"): str,
    }
)
@websocket_api.async_response
@_with_manager
async def ws_plan_choose(manager: EssensplanerManager, msg: dict[str, Any]) -> dict[str, Any]:
    """Vorgeschlagenes Gericht oder Alternative auswählen."""
    manager.choose_dish(msg["date"].isoformat(), msg["meal_type"], msg["index"], msg["dish_id"])
    return manager.days_view(msg["date"], 1)
