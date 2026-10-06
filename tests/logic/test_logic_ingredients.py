"""Tests für die Zutatenübersicht je Profil."""

from helpers import dish, profile_a, sample_dishes

from logic.compat import check_dish
from logic.ingredients import ingredient_overview, set_ingredient_state
from logic.models import Profile


def _by_name(items):
    return {i["name"]: i for i in items}


def test_overview_counts_and_states() -> None:
    items = ingredient_overview(sample_dishes(), profile_a())
    by = _by_name(items)
    # Zutaten aus je zwei Gerichten stehen vorne
    assert {i["name"] for i in items[:3]} == {"Haferflocken", "Hühnerbrust", "Reis"}
    assert by["Hühnerbrust"]["count"] == 2
    assert by["Reis"]["state"] == "tolerated" and by["Reis"]["explicit"]
    assert by["Zwiebel"]["state"] == "not_tolerated" and by["Zwiebel"]["explicit"]
    # abgeleitet: Paprikapulver durch "Paprika"
    assert by["Paprikapulver"]["state"] == "not_tolerated"
    assert by["Paprikapulver"]["by"] == "Paprika"
    assert not by["Paprikapulver"]["explicit"]
    assert by["Joghurt"]["state"] == "unknown"


def test_overview_includes_profile_terms_without_dish() -> None:
    by = _by_name(ingredient_overview(sample_dishes(), profile_a()))
    # "Butter" steht nur im Profil (kleine Mengen), in keinem Gericht
    assert by["Butter"]["count"] == 0
    assert by["Butter"]["state"] == "small"
    assert by["Butter"]["max_amount"] == 10 and by["Butter"]["unit"] == "g"


def test_set_state_moves_between_lists() -> None:
    profile = Profile(id="x", name="X", tolerated=["Zwiebeln"])
    set_ingredient_state(profile, "Zwiebel", "not_tolerated")
    assert profile.tolerated == [] and profile.not_tolerated == ["Zwiebel"]
    set_ingredient_state(profile, "zwiebeln", "small", 5, "g")
    assert profile.not_tolerated == []
    assert [(s.name, s.max_amount, s.unit) for s in profile.small_amounts] == [("zwiebeln", 5, "g")]
    set_ingredient_state(profile, "Zwiebel", "unknown")
    assert not profile.tolerated and not profile.not_tolerated and not profile.small_amounts


def test_clicking_all_ingredients_makes_dish_suitable() -> None:
    profile = Profile(id="x", name="X", unknown_ingredients="exclude")
    d = dish("d", "Suppe", ["1 l Wasser", "2 Karotten", "Salz"])
    assert not check_dish(d, profile).usable
    for item in ingredient_overview([d], profile):
        set_ingredient_state(profile, item["name"], "tolerated")
    assert check_dish(d, profile).status == "ok"
