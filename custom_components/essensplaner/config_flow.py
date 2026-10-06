"""Config Flow und Options Flow des Essensplaners."""

from __future__ import annotations

import re
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigEntryState,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .const import (
    CONF_IMPORT_TODO,
    CONF_INITIAL_PROFILES,
    CONF_MEAL_TYPES,
    CONF_SHOPPING_LIST,
    DEFAULT_IMPORT_TODO,
    DEFAULT_MEAL_TYPES,
    DEFAULT_PROFILES,
    DOMAIN,
)
from .logic.models import MEAL_TYPES, UNKNOWN_EXCLUDE, UNKNOWN_MODES, Dish, Profile
from .logic.normalize import format_ingredient_line, parse_ingredient_line
from .manager import EssensplanerManager

MULTILINE = TextSelector(TextSelectorConfig(multiline=True))
TODO_ENTITY = EntitySelector(EntitySelectorConfig(domain="todo"))
MEAL_TYPE_SELECTOR = SelectSelector(
    SelectSelectorConfig(
        options=list(MEAL_TYPES),
        multiple=True,
        mode=SelectSelectorMode.LIST,
        translation_key="meal_type",
    )
)

_LIST_SPLIT = re.compile(r"[\n,;]+")


def _split(text: str | None, commas: bool = True) -> list[str]:
    if not text:
        return []
    parts = _LIST_SPLIT.split(text) if commas else text.splitlines()
    return [p.strip() for p in parts if p.strip()]


def _join(items: list[str]) -> str:
    return "\n".join(items)


class EssensplanerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Ersteinrichtung."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        errors: dict[str, str] = {}
        if user_input is not None:
            profiles = _split(user_input.get(CONF_INITIAL_PROFILES), commas=False)
            if not profiles:
                errors[CONF_INITIAL_PROFILES] = "no_profiles"
            else:
                data: dict[str, Any] = {CONF_INITIAL_PROFILES: profiles}
                if user_input.get(CONF_IMPORT_TODO):
                    data[CONF_IMPORT_TODO] = user_input[CONF_IMPORT_TODO]
                return self.async_create_entry(
                    title="Essensplaner",
                    data=data,
                    options={CONF_MEAL_TYPES: list(DEFAULT_MEAL_TYPES)},
                )

        import_suggestion = (
            DEFAULT_IMPORT_TODO if self.hass.states.get(DEFAULT_IMPORT_TODO) else None
        )
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_INITIAL_PROFILES, default=_join(list(DEFAULT_PROFILES))
                ): MULTILINE,
                vol.Optional(
                    CONF_IMPORT_TODO, description={"suggested_value": import_suggestion}
                ): TODO_ENTITY,
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> EssensplanerOptionsFlow:
        return EssensplanerOptionsFlow()


class EssensplanerOptionsFlow(OptionsFlow):
    """Einstellungen sowie Profile und Gerichte (bis das Panel verfügbar ist)."""

    def __init__(self) -> None:
        self._edit_id: str | None = None

    @property
    def _manager(self) -> EssensplanerManager | None:
        if self.config_entry.state is not ConfigEntryState.LOADED:
            return None
        return self.config_entry.runtime_data

    def _finish(self) -> ConfigFlowResult:
        return self.async_create_entry(data=dict(self.config_entry.options))

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if self._manager is None:
            return self.async_abort(reason="not_loaded")
        return self.async_show_menu(
            step_id="init",
            menu_options=[
                "settings",
                "profile_add",
                "profile_edit",
                "dish_add",
                "dish_edit",
                "import_todo",
            ],
        )

    # ---------------------------------------------------------------- Settings

    async def async_step_settings(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            if not user_input.get(CONF_MEAL_TYPES):
                errors[CONF_MEAL_TYPES] = "no_meal_types"
            else:
                options = {CONF_MEAL_TYPES: user_input[CONF_MEAL_TYPES]}
                if user_input.get(CONF_SHOPPING_LIST):
                    options[CONF_SHOPPING_LIST] = user_input[CONF_SHOPPING_LIST]
                return self.async_create_entry(data=options)

        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_SHOPPING_LIST,
                    description={"suggested_value": options.get(CONF_SHOPPING_LIST)},
                ): TODO_ENTITY,
                vol.Required(
                    CONF_MEAL_TYPES, default=options.get(CONF_MEAL_TYPES, DEFAULT_MEAL_TYPES)
                ): MEAL_TYPE_SELECTOR,
            }
        )
        return self.async_show_form(step_id="settings", data_schema=schema, errors=errors)

    # ----------------------------------------------------------------- Profile

    async def async_step_profile_add(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        self._edit_id = None
        return await self.async_step_profile()

    async def async_step_profile_edit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        manager = self._manager
        if manager is None:
            return self.async_abort(reason="not_loaded")
        if not manager.profiles:
            return self.async_abort(reason="no_profiles")
        if user_input is not None:
            self._edit_id = user_input["profile"]
            return await self.async_step_profile()
        options = [SelectOptionDict(value=p.id, label=p.name) for p in manager.profiles.values()]
        schema = vol.Schema(
            {vol.Required("profile"): SelectSelector(SelectSelectorConfig(options=options))}
        )
        return self.async_show_form(step_id="profile_edit", data_schema=schema)

    async def async_step_profile(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        manager = self._manager
        if manager is None:
            return self.async_abort(reason="not_loaded")
        existing = manager.profiles.get(self._edit_id or "")
        errors: dict[str, str] = {}

        if user_input is not None:
            if existing and user_input.get("delete"):
                manager.delete_profile(existing.id)
                return self._finish()
            small_amounts = []
            for line in _split(user_input.get("small_amounts"), commas=False):
                parsed = parse_ingredient_line(line)
                if parsed is None:
                    continue
                small_amounts.append(
                    {"name": parsed.name, "max_amount": parsed.amount, "unit": parsed.unit}
                )
            data = {
                "id": existing.id if existing else None,
                "name": user_input["name"],
                "servings": user_input.get("servings") or 1,
                "unknown_ingredients": user_input.get("unknown_ingredients", UNKNOWN_EXCLUDE),
                "tolerated": _split(user_input.get("tolerated")),
                "not_tolerated": _split(user_input.get("not_tolerated")),
                "small_amounts": small_amounts,
                "likes": _split(user_input.get("likes")),
                "dislikes": _split(user_input.get("dislikes")),
                "max_duration": user_input.get("max_duration") or None,
            }
            if not str(data["name"]).strip():
                errors["name"] = "required"
            else:
                manager.save_profile(data)
                return self._finish()

        profile = existing or Profile(id="", name="")
        suggested = {
            "name": profile.name,
            "servings": profile.servings,
            "unknown_ingredients": profile.unknown_ingredients,
            "tolerated": _join(profile.tolerated),
            "not_tolerated": _join(profile.not_tolerated),
            "small_amounts": _join(
                [_format_small(s.name, s.max_amount, s.unit) for s in profile.small_amounts]
            ),
            "likes": _join(profile.likes),
            "dislikes": _join(profile.dislikes),
            "max_duration": profile.max_duration or 0,
        }
        fields: dict[Any, Any] = {
            vol.Required("name"): TextSelector(),
            vol.Required("servings"): NumberSelector(
                NumberSelectorConfig(min=0.5, max=20, step=0.5, mode=NumberSelectorMode.BOX)
            ),
            vol.Required("unknown_ingredients"): SelectSelector(
                SelectSelectorConfig(
                    options=list(UNKNOWN_MODES), translation_key="unknown_ingredients"
                )
            ),
            vol.Optional("tolerated"): MULTILINE,
            vol.Optional("not_tolerated"): MULTILINE,
            vol.Optional("small_amounts"): MULTILINE,
            vol.Optional("likes"): MULTILINE,
            vol.Optional("dislikes"): MULTILINE,
            vol.Optional("max_duration"): NumberSelector(
                NumberSelectorConfig(
                    min=0, max=600, step=5, mode=NumberSelectorMode.BOX, unit_of_measurement="min"
                )
            ),
        }
        if existing:
            fields[vol.Optional("delete", default=False)] = BooleanSelector()
        schema = self.add_suggested_values_to_schema(vol.Schema(fields), suggested)
        return self.async_show_form(
            step_id="profile",
            data_schema=schema,
            errors=errors,
            description_placeholders={"name": profile.name or "–"},
        )

    # ---------------------------------------------------------------- Gerichte

    async def async_step_dish_add(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        self._edit_id = None
        return await self.async_step_dish()

    async def async_step_dish_edit(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        manager = self._manager
        if manager is None:
            return self.async_abort(reason="not_loaded")
        if not manager.dishes:
            return self.async_abort(reason="no_dishes")
        if user_input is not None:
            self._edit_id = user_input["dish"]
            return await self.async_step_dish()
        options = [
            SelectOptionDict(value=d.id, label=d.name)
            for d in sorted(manager.dishes.values(), key=lambda d: d.name.casefold())
        ]
        schema = vol.Schema(
            {
                vol.Required("dish"): SelectSelector(
                    SelectSelectorConfig(options=options, mode=SelectSelectorMode.DROPDOWN)
                )
            }
        )
        return self.async_show_form(step_id="dish_edit", data_schema=schema)

    async def async_step_dish(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        manager = self._manager
        if manager is None:
            return self.async_abort(reason="not_loaded")
        existing = manager.dishes.get(self._edit_id or "")
        errors: dict[str, str] = {}

        if user_input is not None:
            if existing and user_input.get("delete"):
                manager.delete_dish(existing.id)
                return self._finish()
            ingredients = []
            for line in _split(user_input.get("ingredients"), commas=False):
                parsed = parse_ingredient_line(line)
                if parsed is not None:
                    ingredients.append(parsed.to_dict())
            if not str(user_input["name"]).strip():
                errors["name"] = "required"
            elif not user_input.get("meal_types"):
                errors["meal_types"] = "no_meal_types"
            else:
                manager.save_dish(
                    {
                        "id": existing.id if existing else None,
                        "name": user_input["name"],
                        "meal_types": user_input["meal_types"],
                        "suitable_for": user_input.get("suitable_for") or [],
                        "base_servings": user_input.get("base_servings") or 2,
                        "duration_min": user_input.get("duration_min") or None,
                        "tags": _split(user_input.get("tags")),
                        "ingredients": ingredients,
                        "steps": _split(user_input.get("steps"), commas=False),
                        "source_url": user_input.get("source_url") or None,
                    }
                )
                return self._finish()

        dish = existing or Dish(id="", name="")
        suggested = {
            "name": dish.name,
            "meal_types": dish.meal_types,
            "suitable_for": dish.suitable_for,
            "base_servings": dish.base_servings,
            "duration_min": dish.duration_min or 0,
            "tags": ", ".join(dish.tags),
            "ingredients": _join([format_ingredient_line(i) for i in dish.ingredients]),
            "steps": _join(dish.steps),
            "source_url": dish.source_url or "",
        }
        profile_options = [
            SelectOptionDict(value=p.id, label=p.name) for p in manager.profiles.values()
        ]
        fields: dict[Any, Any] = {
            vol.Required("name"): TextSelector(),
            vol.Required("meal_types"): MEAL_TYPE_SELECTOR,
            vol.Optional("suitable_for"): SelectSelector(
                SelectSelectorConfig(
                    options=profile_options, multiple=True, mode=SelectSelectorMode.LIST
                )
            ),
            vol.Required("base_servings"): NumberSelector(
                NumberSelectorConfig(min=0.5, max=20, step=0.5, mode=NumberSelectorMode.BOX)
            ),
            vol.Optional("duration_min"): NumberSelector(
                NumberSelectorConfig(
                    min=0, max=600, step=5, mode=NumberSelectorMode.BOX, unit_of_measurement="min"
                )
            ),
            vol.Optional("ingredients"): MULTILINE,
            vol.Optional("steps"): MULTILINE,
            vol.Optional("tags"): TextSelector(),
            vol.Optional("source_url"): TextSelector(TextSelectorConfig(type=TextSelectorType.URL)),
        }
        if existing:
            fields[vol.Optional("delete", default=False)] = BooleanSelector()
        schema = self.add_suggested_values_to_schema(vol.Schema(fields), suggested)
        return self.async_show_form(
            step_id="dish",
            data_schema=schema,
            errors=errors,
            description_placeholders={"name": dish.name or "–"},
        )

    # ------------------------------------------------------------------ Import

    async def async_step_import_todo(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        manager = self._manager
        if manager is None:
            return self.async_abort(reason="not_loaded")
        if user_input is not None:
            count = await manager.async_import_from_todo(user_input["entity_id"])
            return self.async_abort(
                reason="import_done", description_placeholders={"count": str(count)}
            )
        suggestion = DEFAULT_IMPORT_TODO if self.hass.states.get(DEFAULT_IMPORT_TODO) else None
        schema = vol.Schema(
            {vol.Required("entity_id", description={"suggested_value": suggestion}): TODO_ENTITY}
        )
        return self.async_show_form(step_id="import_todo", data_schema=schema)


def _format_small(name: str, amount: float | None, unit: str | None) -> str:
    if amount is None:
        return name
    number = str(int(amount)) if amount == int(amount) else str(amount).replace(".", ",")
    return " ".join(p for p in (number, unit, name) if p)
