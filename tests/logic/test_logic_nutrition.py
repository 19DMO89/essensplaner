"""Tests für Ernährungsrichtungen, Nährwertschätzung und deren Einfluss auf den Planer."""

from pathlib import Path
import random

from helpers import dish, profile_a, profile_b, sample_dishes

from logic.models import MEAL_BREAKFAST, MEAL_LUNCH, Dish, Profile
from logic.nutrition import (
    DIR_FIBER,
    DIR_LIGHT,
    DIR_LOW_CARB,
    DIR_LOW_FAT,
    DIR_PROTEIN,
    dish_directions,
    estimate_dish,
    find_food,
    ingredient_grams,
    tag_direction,
    with_direction_tags,
)
from logic.normalize import parse_ingredient_line
from logic.planner import Planner
from logic.starter import parse_dish_file

DAYS = [f"2026-10-{d:02d}" for d in range(5, 12)]
STARTER = Path(__file__).parents[2] / "custom_components" / "essensplaner" / "data" / "starter"


def test_tag_direction_and_aliases() -> None:
    assert tag_direction("proteinreich") == DIR_PROTEIN
    assert tag_direction("Eiweißreich") == DIR_PROTEIN
    assert tag_direction("Low-Carb") == DIR_LOW_CARB
    assert tag_direction("kalorienarm") == DIR_LIGHT
    assert tag_direction("vegetarisch") is None
    tags = with_direction_tags(["schnell", "Low Carb"], {DIR_LOW_CARB, DIR_FIBER})
    assert tags == ["schnell", "Low Carb", "ballaststoffreich"]
    assert dish_directions(Dish(id="x", name="x", tags=tags)) == {DIR_LOW_CARB, DIR_FIBER}


def test_longest_food_term_wins() -> None:
    assert find_food("Erdnussbutter").fat == 50
    assert find_food("Butter").fat == 82
    assert find_food("Süßkartoffeln").carbs == 20
    assert find_food("Erdäpfel").carbs == 16
    assert find_food("Palatschinken").carbs == 27  # kein Schinken
    assert find_food("Hühnersuppe").kcal == 5  # Brühe, kein Huhn
    assert find_food("Eier").protein == 12.5
    assert find_food("Reisessig").kcal == 0
    assert find_food("Fantasiezutat") is None


def test_ingredient_grams() -> None:
    def grams(line: str) -> float:
        ing = parse_ingredient_line(line)
        return ingredient_grams(ing, find_food(ing.name))

    assert grams("1,5 kg Erdäpfel") == 1500
    assert grams("1 Dose Kichererbsen") == 240
    assert grams("2 EL Olivenöl") == 24
    assert grams("1 Prise Salz") == 0
    assert grams("Pfeffer") == 0
    assert grams("2 Eier") == 110
    assert grams("3 Scheiben Vollkornbrot") == 135


def _estimate(lines: list[str], servings: float = 2, meal_types=None) -> set[str]:
    d = dish("x", "x", lines, base_servings=servings, meal_types=meal_types or [MEAL_LUNCH])
    return estimate_dish(d)[1]


def test_estimate_directions() -> None:
    chicken = _estimate(["300 g Hühnerbrust", "120 g Reis", "300 g Brokkoli", "1 EL Öl"])
    assert {DIR_PROTEIN, DIR_LIGHT, DIR_LOW_FAT} <= chicken
    oats = _estimate(["80 g Haferflocken", "1 Apfel", "2 EL Leinsamen"], servings=1,
                     meal_types=[MEAL_BREAKFAST])
    assert DIR_FIBER in oats and DIR_PROTEIN not in oats
    salad = _estimate(["200 g Vogerlsalat", "1 Gurke", "2 Eier", "1 EL Olivenöl"])
    assert {DIR_LOW_CARB, DIR_LIGHT} <= salad
    creamy = _estimate(["400 g Spaghetti", "200 ml Schlagobers", "150 g Speck", "100 g Parmesan"])
    assert not creamy & {DIR_LIGHT, DIR_LOW_FAT, DIR_LOW_CARB}


def test_estimate_needs_known_ingredients() -> None:
    assert _estimate(["500 g Zauberpulver", "50 g Reis"]) == set()
    assert _estimate(["Salz", "Pfeffer"]) == set()


def test_small_meals_use_lower_limits() -> None:
    lines = ["150 g Topfen", "1 Banane"]
    assert DIR_PROTEIN in _estimate(lines, servings=1, meal_types=[MEAL_BREAKFAST])
    assert DIR_PROTEIN not in _estimate(lines, servings=1, meal_types=[MEAL_LUNCH])


def test_starter_tags_contain_estimate() -> None:
    """Die Tags im Startpaket entsprechen (mindestens) der aktuellen Schätzung."""
    for path in sorted(STARTER.glob("*.txt")):
        for data in parse_dish_file(path.read_text(encoding="utf-8"), path.name):
            d = Dish.from_dict(data)
            missing = estimate_dish(d)[1] - dish_directions(d)
            assert not missing, f"{path.name}: {d.name} fehlt {missing}"


# ------------------------------------------------------------------ Planer


def _tagged(dishes: list[Dish], dish_id: str, tag: str) -> list[Dish]:
    for d in dishes:
        if d.id == dish_id:
            d.tags.append(tag)
    return dishes


def test_planner_prefers_direction() -> None:
    ben = Profile(id="b", name="Ben", unknown_ingredients="allow")
    picks = set()
    for seed in range(10):
        dishes = _tagged(sample_dishes(), "d_gulasch", "proteinreich")
        planner = Planner(dishes, [ben], random.Random(seed))
        result = planner.generate({}, {DAYS[0]: [MEAL_LUNCH]}, directions={"b": ["protein"]})
        picks.add(result.plan[DAYS[0]][MEAL_LUNCH][0].dish_id)
    assert picks == {"d_gulasch"}


def test_shared_dish_beats_direction_of_one_person() -> None:
    # Gulasch passt nur für Ben (Zwiebeln); der gemeinsame Hühnerreis bleibt Favorit.
    dishes = _tagged(sample_dishes(), "d_gulasch", "proteinreich")
    planner = Planner(dishes, [profile_a(), profile_b()], random.Random(1))
    result = planner.generate(
        {}, {DAYS[0]: [MEAL_LUNCH]}, directions={"b": ["protein", "fiber", "light"]}
    )
    slot = result.plan[DAYS[0]][MEAL_LUNCH]
    assert len(slot) == 1 and slot[0].dish_id == "d_huhn_reis"
