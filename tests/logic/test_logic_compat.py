"""Tests für die Verträglichkeitsprüfung."""

from helpers import dish, profile_a, profile_b, sample_dishes

from logic.compat import STATUS_EXCLUDED, STATUS_OK, STATUS_WARN, check_dish
from logic.models import UNKNOWN_ALLOW, UNKNOWN_WARN, SmallAmount


def _by_id(dish_id: str):
    return next(d for d in sample_dishes() if d.id == dish_id)


def _codes(result) -> set[str]:
    return {r["code"] for r in result.reasons}


def test_tolerated_dish_is_ok() -> None:
    result = check_dish(_by_id("d_huhn_reis"), profile_a())
    assert result.status == STATUS_OK, result.reasons


def test_not_tolerated_excludes() -> None:
    result = check_dish(_by_id("d_huhn_paprika"), profile_a())
    assert result.status == STATUS_EXCLUDED
    terms = {r.get("term") for r in result.reasons if r["code"] == "not_tolerated"}
    assert terms == {"Zwiebel", "Paprika"}


def test_loose_match_catches_compound() -> None:
    # "Paprikapulver" fällt unter "Paprika"
    result = check_dish(_by_id("d_gulasch"), profile_a())
    ingredients = {r.get("ingredient") for r in result.reasons if r["code"] == "not_tolerated"}
    assert "Paprikapulver" in ingredients


def test_unknown_ingredient_modes() -> None:
    muesli = _by_id("d_muesli")
    prof = profile_a()
    assert check_dish(muesli, prof).status == STATUS_EXCLUDED
    assert "unknown_ingredient" in _codes(check_dish(muesli, prof))
    prof.unknown_ingredients = UNKNOWN_WARN
    assert check_dish(muesli, prof).status == STATUS_WARN
    prof.unknown_ingredients = UNKNOWN_ALLOW
    assert check_dish(muesli, prof).status == STATUS_OK


def test_dish_without_ingredients_follows_unknown_mode() -> None:
    bare = dish("d_x", "Nur Name", [])
    assert check_dish(bare, profile_a()).status == STATUS_EXCLUDED
    assert check_dish(bare, profile_b()).status == STATUS_OK


def test_small_amount_limit_per_serving() -> None:
    prof = profile_a()
    ok = dish("d1", "x", ["20 g Butter", "100 g Reis"], base_servings=2)  # 10 g/Portion
    too_much = dish("d2", "y", ["30 g Butter", "100 g Reis"], base_servings=2)  # 15 g
    in_kg = dish("d3", "z", ["0,01 kg Butter"], base_servings=1)
    assert check_dish(ok, prof).status == STATUS_OK
    assert check_dish(too_much, prof).status == STATUS_EXCLUDED
    assert "small_amount_exceeded" in _codes(check_dish(too_much, prof))
    assert check_dish(in_kg, prof).status == STATUS_OK


def test_small_amount_without_limit_or_unit_warns() -> None:
    prof = profile_a()
    prof.small_amounts = [SmallAmount("Butter"), SmallAmount("Knoblauch", 1, "Stk")]
    assert check_dish(dish("d1", "x", ["20 g Butter"]), prof).status == STATUS_WARN
    result = check_dish(dish("d2", "y", ["2 Zehen Knoblauch"]), prof)
    assert result.status == STATUS_WARN
    assert "small_amount_unchecked" in _codes(result)


def test_suitable_for_restricts() -> None:
    d = _by_id("d_huhn_reis")
    d.suitable_for = ["b"]
    assert "not_suitable" in _codes(check_dish(d, profile_a()))
    assert check_dish(d, profile_b()).status == STATUS_OK


def test_dislike_excludes_and_like_counts() -> None:
    prof = profile_b()
    assert check_dish(_by_id("d_porridge"), prof).status == STATUS_EXCLUDED
    assert check_dish(_by_id("d_huhn_paprika"), prof).likes == 1


def test_max_duration() -> None:
    prof = profile_b()
    prof.max_duration = 30
    d = _by_id("d_gulasch")
    d.duration_min = 90
    assert "too_long" in _codes(check_dish(d, prof))
