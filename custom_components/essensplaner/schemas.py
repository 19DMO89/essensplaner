"""Voluptuous-Schemas für WebSocket-API und Services."""

from __future__ import annotations

import voluptuous as vol

from .logic.models import MEAL_TYPES, ROLES, UNKNOWN_MODES

_STR_LIST = [vol.All(str, vol.Strip)]

INGREDIENT_SCHEMA = vol.Schema(
    {
        vol.Required("name"): vol.All(str, vol.Strip, vol.Length(min=1)),
        vol.Optional("amount"): vol.Any(None, vol.All(vol.Coerce(float), vol.Range(min=0))),
        vol.Optional("unit"): vol.Any(None, str),
        vol.Optional("role"): vol.In(ROLES),
    }
)

SMALL_AMOUNT_SCHEMA = vol.Schema(
    {
        vol.Required("name"): vol.All(str, vol.Strip, vol.Length(min=1)),
        vol.Optional("max_amount"): vol.Any(None, vol.All(vol.Coerce(float), vol.Range(min=0))),
        vol.Optional("unit"): vol.Any(None, str),
    }
)

DISH_SCHEMA = vol.Schema(
    {
        vol.Optional("id"): str,
        vol.Required("name"): vol.All(str, vol.Strip, vol.Length(min=1)),
        vol.Optional("meal_types"): [vol.In(MEAL_TYPES)],
        vol.Optional("suitable_for"): [str],
        vol.Optional("base_servings"): vol.All(vol.Coerce(float), vol.Range(min=0.5)),
        vol.Optional("duration_min"): vol.Any(None, vol.All(vol.Coerce(int), vol.Range(min=0))),
        vol.Optional("tags"): _STR_LIST,
        vol.Optional("ingredients"): [INGREDIENT_SCHEMA],
        vol.Optional("steps"): _STR_LIST,
        vol.Optional("image"): vol.Any(None, dict),
        vol.Optional("source_url"): vol.Any(None, str),
    }
)

PROFILE_SCHEMA = vol.Schema(
    {
        vol.Optional("id"): str,
        vol.Required("name"): vol.All(str, vol.Strip, vol.Length(min=1)),
        vol.Optional("servings"): vol.All(vol.Coerce(float), vol.Range(min=0.5)),
        vol.Optional("tolerated"): _STR_LIST,
        vol.Optional("not_tolerated"): _STR_LIST,
        vol.Optional("small_amounts"): [SMALL_AMOUNT_SCHEMA],
        vol.Optional("likes"): _STR_LIST,
        vol.Optional("dislikes"): _STR_LIST,
        vol.Optional("max_duration"): vol.Any(None, vol.All(vol.Coerce(int), vol.Range(min=0))),
        vol.Optional("unknown_ingredients"): vol.In(UNKNOWN_MODES),
    }
)

ASSIGNMENT_SCHEMA = vol.Schema(
    {
        vol.Required("dish_id"): str,
        vol.Optional("profiles"): [str],
        vol.Optional("servings"): vol.Any(None, vol.All(vol.Coerce(float), vol.Range(min=0.5))),
    }
)
