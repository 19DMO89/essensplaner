"""Tests für den Planer und die Einkaufsliste."""

import random

from helpers import dish, profile_a, profile_b, sample_dishes

from logic.models import MEAL_BREAKFAST, MEAL_DINNER, MEAL_LUNCH, Assignment, Profile
from logic.planner import Planner, shared_base
from logic.shopping import build_shopping_list

DAYS = [f"2026-10-{d:02d}" for d in range(5, 12)]


def _planner(seed: int = 1, profiles=None) -> Planner:
    return Planner(
        sample_dishes(), profiles or [profile_a(), profile_b()], random.Random(seed)
    )


def test_shared_dish_preferred_when_compatible() -> None:
    planner = _planner()
    result = planner.generate({}, {DAYS[0]: [MEAL_LUNCH]})
    slot = result.plan[DAYS[0]][MEAL_LUNCH]
    # Hühnerreis passt für beide -> ein Gericht für alle
    assert len(slot) == 1
    assert slot[0].dish_id == "d_huhn_reis"
    assert set(slot[0].profiles) == {"a", "b"}
    assert slot[0].servings == 2


def test_split_with_shared_base() -> None:
    dishes = [d for d in sample_dishes() if d.id != "d_huhn_reis"]
    dishes.append(
        dish("d_huhn_kart", "Huhn mit Kartoffeln", ["250 g Hühnerbrust #protein", "300 g Kartoffeln #beilage"],
             suitable_for=["a"])
    )
    planner = Planner(dishes, [profile_a(), profile_b()], random.Random(3))
    result = planner.generate({}, {DAYS[0]: [MEAL_DINNER]})
    slot = result.plan[DAYS[0]][MEAL_DINNER]
    by_profile = {p: a.dish_id for a in slot for p in a.profiles}
    assert by_profile["a"] == "d_huhn_kart"
    # B bekommt ein Gericht mit gemeinsamer Basis (Hühnerbrust) statt Gulasch
    assert by_profile["b"] == "d_huhn_paprika"
    assert shared_base(planner.dishes[a.dish_id] for a in slot) == ["Hühnerbrust"]


def test_breakfast_split_per_profile() -> None:
    planner = _planner()
    result = planner.generate({}, {DAYS[0]: [MEAL_BREAKFAST]})
    by_profile = {p: a.dish_id for a in result.plan[DAYS[0]][MEAL_BREAKFAST] for p in a.profiles}
    # A verträgt kein Joghurt (unbekannt), B mag keine Banane
    assert by_profile == {"a": "d_porridge", "b": "d_muesli"}
    assert result.warnings == []


def test_missing_dish_reported() -> None:
    dishes = [d for d in sample_dishes() if d.id == "d_gulasch"]
    planner = Planner(dishes, [profile_a(), profile_b()], random.Random(1))
    result = planner.generate({}, {DAYS[0]: [MEAL_DINNER, MEAL_BREAKFAST]})
    assert result.plan[DAYS[0]] == {MEAL_DINNER: [Assignment("d_gulasch", ["b"], 1)]}
    assert result.warnings == [
        {"date": DAYS[0], "meal_type": MEAL_DINNER, "code": "no_dish", "profiles": ["a"]},
        {"date": DAYS[0], "meal_type": MEAL_BREAKFAST, "code": "no_dish", "profiles": ["a", "b"]},
    ]


def test_variety_across_week() -> None:
    dishes = [dish(f"d{i}", f"Gericht {i}", ["100 g Reis"]) for i in range(7)]
    planner = Planner(dishes, [profile_a()], random.Random(5))
    result = planner.generate({}, {d: [MEAL_LUNCH] for d in DAYS})
    used = [result.plan[d][MEAL_LUNCH][0].dish_id for d in DAYS]
    assert len(set(used)) == 7


def test_existing_and_locked_respected() -> None:
    planner = _planner()
    plan = {
        DAYS[0]: {MEAL_LUNCH: [Assignment("d_gulasch", ["b"], 1, locked=True)]},
        DAYS[1]: {MEAL_LUNCH: [Assignment("d_gulasch", ["a", "b"], 2)]},
    }
    meals = {DAYS[0]: [MEAL_LUNCH], DAYS[1]: [MEAL_LUNCH]}

    kept = planner.generate(plan, meals, overwrite=False).plan
    assert kept[DAYS[0]] == plan[DAYS[0]]
    assert kept[DAYS[1]] == plan[DAYS[1]]

    replaced = planner.generate(plan, meals, overwrite=True).plan
    day0 = replaced[DAYS[0]][MEAL_LUNCH]
    assert day0[0] == Assignment("d_gulasch", ["b"], 1, locked=True)
    assert [a.profiles for a in day0[1:]] == [["a"]]
    assert all(a.dish_id != "d_gulasch" for a in replaced[DAYS[1]][MEAL_LUNCH])


def test_profile_servings_and_subset() -> None:
    family = Profile(id="f", name="Familie", servings=3, unknown_ingredients="allow")
    planner = _planner(profiles=[profile_a(), family])
    result = planner.generate({}, {DAYS[0]: [MEAL_LUNCH]}, profile_ids=["f"])
    slot = result.plan[DAYS[0]][MEAL_LUNCH]
    assert len(slot) == 1 and slot[0].profiles == ["f"] and slot[0].servings == 3


def test_shopping_list_scales_and_merges() -> None:
    dishes = {d.id: d for d in sample_dishes()}
    plan = {
        DAYS[0]: {MEAL_LUNCH: [Assignment("d_huhn_reis", ["a", "b"], 4)]},  # Faktor 2
        DAYS[1]: {
            MEAL_DINNER: [Assignment("d_huhn_paprika", ["b"], 1)],  # Faktor 0,5
            MEAL_BREAKFAST: [Assignment("d_porridge", ["a"], 1)],
        },
        DAYS[2]: {MEAL_LUNCH: [Assignment("d_gulasch", ["b"], 2)]},  # außerhalb
    }
    items = {i.key: i for i in build_shopping_list(plan, dishes, DAYS[:2])}
    assert items["reis"].summary == "Reis – 375 g"
    assert items["huhnbrust"].summary == "Hühnerbrust – 625 g"
    assert items["karott"].summary == "Karotten – 4 Stk"
    assert items["salz"].summary == "Salz – 2 Prise"
    assert items["paprika"].summary == "Paprika – 1 Stk"
    assert "rindfleisch" not in items
    assert items["reis"].dishes == ["Hühnerreis", "Paprikahuhn mit Reis"]


def test_shopping_list_mixed_units() -> None:
    dishes = {
        "x": dish("x", "X", ["1 kg Kartoffeln", "Petersilie"], base_servings=1),
        "y": dish("y", "Y", ["500 g Erdäpfel", "2 Kartoffeln"], base_servings=1),
    }
    plan = {DAYS[0]: {MEAL_LUNCH: [Assignment("x", ["a"], 1), Assignment("y", ["b"], 1)]}}
    items = {i.key: i for i in build_shopping_list(plan, dishes, DAYS)}
    assert items["kartoffel"].summary == "Kartoffeln – 1,5 kg + 2 Stk"
    assert items["petersili"].summary == "Petersilie"


def test_alternatives_offered_for_same_profiles() -> None:
    planner = _planner(seed=2)
    result = planner.generate({}, {d: [MEAL_LUNCH, MEAL_DINNER] for d in DAYS[:3]}, alternatives=1)
    for day in DAYS[:3]:
        for slot in result.plan[day].values():
            for a in slot:
                assert len(a.alternatives) <= 1
                assert a.dish_id not in a.alternatives
                assert a.chosen == (not a.alternatives)
                for alt in a.alternatives:
                    # Alternative passt für alle Personen der Zuweisung
                    assert all(planner.compat(alt, p).usable for p in a.profiles)
                    assert MEAL_LUNCH in planner.dishes[alt].meal_types


def test_alternatives_vary_and_can_be_zero() -> None:
    dishes = [dish(f"d{i}", f"Gericht {i}", ["100 g Reis"]) for i in range(10)]
    planner = Planner(dishes, [profile_a()], random.Random(1))
    result = planner.generate({}, {d: [MEAL_LUNCH] for d in DAYS}, alternatives=1)
    alts = [result.plan[d][MEAL_LUNCH][0].alternatives[0] for d in DAYS]
    mains = [result.plan[d][MEAL_LUNCH][0].dish_id for d in DAYS]
    assert len(set(alts)) >= 5  # Alternativen wiederholen sich kaum
    assert all(a != m for a, m in zip(alts, mains))

    none = Planner(dishes, [profile_a()], random.Random(1)).generate({}, {DAYS[0]: [MEAL_LUNCH]})
    assert none.plan[DAYS[0]][MEAL_LUNCH][0].alternatives == []
    assert none.plan[DAYS[0]][MEAL_LUNCH][0].chosen


def test_assignment_backwards_compatible() -> None:
    old = Assignment.from_dict({"dish_id": "x", "profiles": ["a"], "servings": 1})
    assert old.alternatives == [] and old.chosen
    new = Assignment.from_dict({"dish_id": "x", "profiles": ["a"], "servings": 1, "alternatives": ["y"]})
    assert not new.chosen
