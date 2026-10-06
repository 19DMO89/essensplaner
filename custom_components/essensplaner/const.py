"""Konstanten der Essensplaner-Integration."""

from __future__ import annotations

from typing import Final

from .logic.models import MEAL_DINNER, MEAL_LUNCH

DOMAIN: Final = "essensplaner"

# Config-Entry-Daten (nur beim ersten Einrichten genutzt)
CONF_INITIAL_PROFILES: Final = "profiles"
CONF_IMPORT_TODO: Final = "import_todo"

# Optionen
CONF_SHOPPING_LIST: Final = "shopping_list"
CONF_MEAL_TYPES: Final = "meal_types"
DEFAULT_MEAL_TYPES: Final = [MEAL_LUNCH, MEAL_DINNER]
DEFAULT_PROFILES: Final = ["Person A", "Person B"]
DEFAULT_IMPORT_TODO: Final = "todo.gerichte"

STORAGE_VERSION: Final = 1
STORAGE_KEY_DISHES: Final = f"{DOMAIN}.dishes"
STORAGE_KEY_PROFILES: Final = f"{DOMAIN}.profiles"
STORAGE_KEY_PLAN: Final = f"{DOMAIN}.plan"
SAVE_DELAY: Final = 2

# Vergangene Plantage werden nach dieser Zeit verworfen.
PLAN_HISTORY_DAYS: Final = 60
MAX_PLAN_DAYS: Final = 28

ATTR_START_DATE: Final = "start_date"
ATTR_DAYS: Final = "days"
ATTR_MEAL_TYPES: Final = "meal_types"
ATTR_PROFILES: Final = "profiles"
ATTR_OVERWRITE: Final = "overwrite"
ATTR_SEED: Final = "seed"
ATTR_SKIP_EXISTING: Final = "skip_existing"
ATTR_DATE: Final = "date"
ATTR_MEAL_TYPE: Final = "meal_type"
ATTR_DISH: Final = "dish"
ATTR_SERVINGS: Final = "servings"

SERVICE_GENERATE_PLAN: Final = "generate_plan"
SERVICE_PUSH_SHOPPING_LIST: Final = "push_shopping_list"
SERVICE_SET_MEAL: Final = "set_meal"
