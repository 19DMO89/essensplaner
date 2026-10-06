"""Prüft das mitgelieferte Startpaket und den Datei-Parser."""

from collections import Counter
from pathlib import Path

import pytest

from logic.models import MEAL_TYPES, Dish
from logic.normalize import normalize_name, normalize_unit
from logic.starter import DishFileError, parse_dish_file

STARTER_DIR = (
    Path(__file__).parents[2] / "custom_components" / "essensplaner" / "data" / "starter"
)
KNOWN_UNITS = {
    "g", "kg", "mg", "ml", "l", "cl", "dl", "EL", "TL", "Stk", "Prise", "Bund", "Dose",
    "Pkg", "Zehe", "Scheibe", "Becher", "Tasse", "Handvoll", "Glas", "Msp",
}
# Wörter, die als Mengenangabe gemeint sind, aber nicht als Einheit erkannt würden.
PSEUDO_UNITS = {"stange", "kopf", "zweig", "würfel", "knolle", "blatt", "paar", "stück", "dosen"}


def _load_all() -> list[dict]:
    dishes = []
    for path in sorted(STARTER_DIR.glob("*.txt")):
        dishes.extend(parse_dish_file(path.read_text(encoding="utf-8"), path.name))
    return dishes


STARTER = _load_all()


def test_starter_size_and_coverage() -> None:
    assert len(STARTER) >= 150
    per_meal = Counter(m for d in STARTER for m in d["meal_types"])
    assert per_meal["breakfast"] >= 15
    assert per_meal["lunch"] >= 100
    assert per_meal["dinner"] >= 100
    assert per_meal["snack"] >= 15


def test_starter_names_unique() -> None:
    names = Counter(normalize_name(d["name"]) for d in STARTER)
    assert [n for n, c in names.items() if c > 1] == []


@pytest.mark.parametrize("data", STARTER, ids=lambda d: d["name"])
def test_starter_dish_complete(data: dict) -> None:
    dish = Dish.from_dict(data)
    assert data.get("meal_types"), "mahlzeit fehlt"
    assert set(dish.meal_types) <= set(MEAL_TYPES)
    assert "base_servings" in data and "duration_min" in data
    assert dish.tags
    assert len(dish.ingredients) >= 2
    assert dish.steps
    for ing in dish.ingredients:
        first = ing.name.split()[0].lower()
        assert not first[0].isdigit(), f"Menge im Namen: {ing.name}"
        assert first not in PSEUDO_UNITS, f"Einheit nicht erkannt: {ing.name}"
        assert ing.unit is None or normalize_unit(ing.unit) in KNOWN_UNITS, ing.unit
    if set(dish.meal_types) & {"lunch", "dinner"}:
        roles = {i.role for i in dish.ingredients}
        assert "protein" in roles or "side" in roles, "keine Basis markiert"


def test_parse_dish_file_format() -> None:
    text = """
# Kommentar
= Testgericht
mahlzeit: Mittag, abend
portionen: 2,5
dauer: 15
tags: a, b
quelle: https://example.org
- 100 g Reis #beilage
- Salz
1. Kochen.
2. Essen.
"""
    [dish] = parse_dish_file(text)
    assert dish == {
        "name": "Testgericht",
        "meal_types": ["lunch", "dinner"],
        "base_servings": 2.5,
        "duration_min": 15,
        "tags": ["a", "b"],
        "source_url": "https://example.org",
        "ingredients": [
            {"name": "Reis", "amount": 100.0, "unit": "g", "role": "side"},
            {"name": "Salz", "amount": None, "unit": None, "role": "other"},
        ],
        "steps": ["Kochen.", "Essen."],
    }


@pytest.mark.parametrize(
    "text",
    [
        "- 100 g Reis",
        "= X\nmahlzeit: mitternacht",
        "= X\nportionen: viele",
        "= X\nunbekannt: 1",
        "= X\nirgendwas",
    ],
)
def test_parse_dish_file_errors(text: str) -> None:
    with pytest.raises(DishFileError):
        parse_dish_file(text, "test.txt")
