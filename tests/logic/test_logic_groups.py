"""Tests für Zutatengruppen (Fleischsorten, Allergene)."""

import pytest
from helpers import dish

from logic.compat import check_dish
from logic.groups import GROUPS, in_group
from logic.ingredients import ingredient_overview, set_ingredient_state
from logic.models import Profile


@pytest.mark.parametrize(
    ("name", "groups"),
    [
        ("Faschiertes", {"meat_beef", "meat_pork"}),
        ("Schweinefaschiertes", {"meat_pork"}),
        ("Rinderhackfleisch", {"meat_beef"}),
        ("Putenbrust", {"meat_poultry"}),
        ("Hähnchenbrust", {"meat_poultry"}),
        ("Lachsfilet", {"fish"}),
        ("Garnelen", {"seafood", "crustaceans"}),
        ("Weißwein", {"sulphites"}),
        ("Palatschinken", {"gluten", "eggs", "milk"}),
        ("Schlagobers", {"milk"}),
        ("Topfen", {"milk"}),
        ("Haselnüsse", {"nuts"}),
        ("Eier", {"eggs"}),
        # Fehltreffer, die ausgeschlossen sein müssen
        ("Leberkäse", {"meat_beef", "meat_pork"}),
        ("Kokosmilch", set()),
        ("Erdnussbutter", {"peanuts"}),
        ("Eierschwammerl", set()),
        ("speckige Erdäpfel", set()),
        ("mehlige Erdäpfel", set()),
        ("Reisnudeln", set()),
        ("Tamarindenpaste", set()),
        ("Flammkuchenteig", {"gluten"}),
        ("Studentenfutter", {"nuts"}),
        ("Muskatnuss", set()),
        ("Weintrauben", set()),
        ("Sojasprossen", set()),
        ("Milchreis", set()),
        ("Butterschmalz", {"milk"}),
    ],
)
def test_group_membership(name: str, groups: set[str]) -> None:
    assert {g for g in GROUPS if in_group(g, name)} == groups


def test_excluded_group_makes_dish_unsuitable() -> None:
    profile = Profile(id="p", name="P", unknown_ingredients="allow", excluded_groups=["gluten"])
    pasta = dish("d", "Pasta", ["400 g Spaghetti #beilage", "1 Dose Tomaten"])
    result = check_dish(pasta, profile)
    assert result.status == "excluded"
    assert result.reasons[0] == {
        "code": "group_excluded",
        "status": "excluded",
        "ingredient": "Spaghetti",
        "group": "gluten",
    }


def test_explicit_tolerated_overrides_group() -> None:
    profile = Profile(id="p", name="P", unknown_ingredients="allow", excluded_groups=["gluten"])
    pasta = dish("d", "Pasta", ["400 g Spaghetti #beilage"])
    set_ingredient_state(profile, "Spaghetti", "tolerated")  # z. B. glutenfreie
    assert check_dish(pasta, profile).status == "ok"
    # aber nur genau diese Zutat, nicht alle Nudeln
    assert check_dish(dish("e", "X", ["200 g Penne"]), profile).status == "excluded"


def test_not_tolerated_beats_tolerated_term_via_group() -> None:
    profile = Profile(id="p", name="P", tolerated=["Nudeln"], excluded_groups=["eggs"])
    # "Nudeln" deckt Bandnudeln nur indirekt ab -> Eier-Gruppe greift
    assert check_dish(dish("d", "X", ["200 g Bandnudeln"]), profile).status == "excluded"


def test_overview_shows_group_reason() -> None:
    profile = Profile(id="p", name="P", excluded_groups=["meat_pork"])
    items = {i["name"]: i for i in ingredient_overview([dish("d", "X", ["100 g Speck", "Salz"])], profile)}
    assert items["Speck"]["state"] == "not_tolerated"
    assert items["Speck"]["group"] == "meat_pork"
    assert not items["Speck"]["explicit"]
    assert items["Salz"]["group"] is None
