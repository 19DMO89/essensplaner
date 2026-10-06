"""Tests für Namens-/Einheiten-Normalisierung und Zeilenparser."""

import pytest

from logic.models import ROLE_OTHER, ROLE_PROTEIN, ROLE_SIDE, Ingredient
from logic.normalize import (
    format_amount,
    format_ingredient_line,
    matches_loose,
    matches_strict,
    normalize_name,
    normalize_unit,
    parse_ingredient_line,
    round_for_shopping,
    to_base,
)


@pytest.mark.parametrize(
    ("a", "b"),
    [
        ("Karotten", "Karotte"),
        ("Zwiebeln", "zwiebel"),
        ("Tomaten", "Paradeiser"),
        ("Erdäpfel", "Kartoffeln"),
        ("Äpfel", "Apfel"),
        ("Eier", "Ei"),
        ("Hühnerbrust", "Hähnchenbrust"),
        ("Schlagobers", "Schlagsahne"),
    ],
)
def test_normalize_name_equivalent(a: str, b: str) -> None:
    assert normalize_name(a) == normalize_name(b)


def test_matches_strict() -> None:
    assert matches_strict("Reis", "Basmatireis")
    assert matches_strict("Reis", "Reis")
    assert not matches_strict("Reis", "Reisnudeln")
    assert not matches_strict("Reis", "Haferbrei")
    assert matches_strict("Ei", "Ei")
    assert not matches_strict("Ei", "Brei")
    assert matches_strict("Karotte", "Karotten")


def test_matches_loose() -> None:
    assert matches_loose("Zwiebel", "Zwiebelpulver")
    assert matches_loose("Zwiebeln", "Rote Zwiebel")
    assert matches_loose("Linsen", "Linsensuppe")
    assert not matches_loose("Ei", "Reis")
    assert matches_loose("Ei", "2 Ei")


def test_units() -> None:
    assert normalize_unit("Esslöffel") == "EL"
    assert normalize_unit("gr.") == "g"
    assert normalize_unit("Zehen") == "Zehe"
    assert normalize_unit("Hand") == "Hand"
    assert to_base(1.5, "kg") == (1500, "g")
    assert to_base(2, "l") == (2000, "ml")
    assert to_base(3, None) == (3, "Stk")
    assert to_base(1, "EL") == (1, "EL")


def test_round_and_format() -> None:
    assert round_for_shopping(1.2, "Stk") == 2
    assert round_for_shopping(0.3, "TL") == 0.5
    assert round_for_shopping(149.2, "g") == 150
    assert format_amount(1500, "g") == "1,5 kg"
    assert format_amount(250, "g") == "250 g"
    assert format_amount(2, "Stk") == "2 Stk"


@pytest.mark.parametrize(
    ("line", "expected"),
    [
        ("250 g Hühnerbrust #protein", Ingredient("Hühnerbrust", 250, "g", ROLE_PROTEIN)),
        ("2 Karotten", Ingredient("Karotten", 2, None, ROLE_OTHER)),
        ("1/2 TL Salz", Ingredient("Salz", 0.5, "TL", ROLE_OTHER)),
        ("1,5 kg Kartoffeln #beilage", Ingredient("Kartoffeln", 1.5, "kg", ROLE_SIDE)),
        ("2-3 Zehen Knoblauch", Ingredient("Knoblauch", 2, "Zehe", ROLE_OTHER)),
        ("Salz", Ingredient("Salz", None, None, ROLE_OTHER)),
        ("- 1 Dose Tomaten", Ingredient("Tomaten", 1, "Dose", ROLE_OTHER)),
        ("½ Bund Petersilie", Ingredient("Petersilie", 0.5, "Bund", ROLE_OTHER)),
    ],
)
def test_parse_ingredient_line(line: str, expected: Ingredient) -> None:
    assert parse_ingredient_line(line) == expected


def test_parse_empty_line() -> None:
    assert parse_ingredient_line("   ") is None


def test_format_roundtrip() -> None:
    ing = Ingredient("Reis", 150, "g", ROLE_SIDE)
    line = format_ingredient_line(ing)
    assert line == "150 g Reis #beilage"
    assert parse_ingredient_line(line) == ing
