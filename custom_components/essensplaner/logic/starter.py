"""Lesen der Gerichte-Textdateien (Startpaket).

Format je Gericht::

    = Name
    mahlzeit: mittag, abend
    portionen: 4
    dauer: 30
    tags: schnell, kinder
    quelle: https://...
    - 250 g Hühnerbrust #protein
    1. Zubereitungsschritt

Zeilen mit ``#`` am Anfang sind Kommentare.
"""

from __future__ import annotations

import re
from typing import Any

from .models import MEAL_BREAKFAST, MEAL_DINNER, MEAL_LUNCH, MEAL_SNACK
from .normalize import parse_ingredient_line

MEAL_ALIASES: dict[str, str] = {
    "frühstück": MEAL_BREAKFAST,
    "fruehstueck": MEAL_BREAKFAST,
    "breakfast": MEAL_BREAKFAST,
    "mittag": MEAL_LUNCH,
    "mittagessen": MEAL_LUNCH,
    "lunch": MEAL_LUNCH,
    "abend": MEAL_DINNER,
    "abendessen": MEAL_DINNER,
    "dinner": MEAL_DINNER,
    "snack": MEAL_SNACK,
}

_STEP_RE = re.compile(r"^\d+\.\s+(.+)$")


class DishFileError(ValueError):
    """Fehler beim Lesen einer Gerichte-Datei."""


def _csv(value: str) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()]


def parse_dish_file(text: str, source: str = "") -> list[dict[str, Any]]:
    """Gerichte aus dem Textformat lesen (Ergebnis passt zu ``Dish.from_dict``)."""
    dishes: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    for number, raw in enumerate(text.splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        where = f"{source}:{number}"
        if line.startswith("= "):
            current = {"name": line[2:].strip(), "ingredients": [], "steps": [], "tags": []}
            dishes.append(current)
            continue
        if current is None:
            raise DishFileError(f"{where}: Zeile vor dem ersten Gericht: {line}")
        if line.startswith("- "):
            ingredient = parse_ingredient_line(line[2:])
            if ingredient is None:
                raise DishFileError(f"{where}: Zutat nicht lesbar: {line}")
            current["ingredients"].append(ingredient.to_dict())
            continue
        if step := _STEP_RE.match(line):
            current["steps"].append(step.group(1).strip())
            continue
        key, sep, value = line.partition(":")
        if not sep:
            raise DishFileError(f"{where}: Zeile nicht erkannt: {line}")
        key = key.strip().lower()
        value = value.strip()
        try:
            if key == "mahlzeit":
                meals = []
                for alias in _csv(value):
                    if alias.lower() not in MEAL_ALIASES:
                        raise DishFileError(f"{where}: Unbekannte Mahlzeit: {alias}")
                    meals.append(MEAL_ALIASES[alias.lower()])
                current["meal_types"] = meals
            elif key == "portionen":
                current["base_servings"] = float(value.replace(",", "."))
            elif key == "dauer":
                current["duration_min"] = int(value)
            elif key == "tags":
                current["tags"] = _csv(value)
            elif key == "quelle":
                current["source_url"] = value
            else:
                raise DishFileError(f"{where}: Unbekannter Schlüssel: {key}")
        except ValueError as err:
            if isinstance(err, DishFileError):
                raise
            raise DishFileError(f"{where}: Ungültiger Wert: {line}") from err
    return dishes
