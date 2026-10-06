"""Gemeinsame Testdaten für die Logik-Tests."""

from logic.models import (
    MEAL_BREAKFAST,
    MEAL_DINNER,
    MEAL_LUNCH,
    UNKNOWN_ALLOW,
    UNKNOWN_EXCLUDE,
    Dish,
    Profile,
    SmallAmount,
)
from logic.normalize import parse_ingredient_line


def dish(dish_id: str, name: str, lines: list[str], **kwargs) -> Dish:
    return Dish(
        id=dish_id,
        name=name,
        ingredients=[parse_ingredient_line(line) for line in lines],
        **kwargs,
    )


def profile_a() -> Profile:
    """Stark eingeschränktes Profil, unbekannte Zutaten ausgeschlossen."""
    return Profile(
        id="a",
        name="Anna",
        tolerated=["Reis", "Hühnerbrust", "Karotte", "Kartoffel", "Salz", "Haferflocken", "Banane"],
        not_tolerated=["Zwiebel", "Paprika"],
        small_amounts=[SmallAmount("Butter", 10, "g")],
        unknown_ingredients=UNKNOWN_EXCLUDE,
    )


def profile_b() -> Profile:
    return Profile(
        id="b",
        name="Ben",
        likes=["Paprika"],
        dislikes=["Banane"],
        unknown_ingredients=UNKNOWN_ALLOW,
    )


def sample_dishes() -> list[Dish]:
    return [
        dish(
            "d_huhn_reis",
            "Hühnerreis",
            ["250 g Hühnerbrust #protein", "150 g Reis #beilage", "2 Karotten", "1 Prise Salz"],
            meal_types=[MEAL_LUNCH, MEAL_DINNER],
        ),
        dish(
            "d_huhn_paprika",
            "Paprikahuhn mit Reis",
            ["250 g Hühnerbrust #protein", "150 g Reis #beilage", "2 Paprika", "1 Zwiebel"],
            meal_types=[MEAL_LUNCH, MEAL_DINNER],
        ),
        dish(
            "d_gulasch",
            "Gulasch",
            ["500 g Rindfleisch #protein", "3 Zwiebeln", "1 EL Paprikapulver"],
            meal_types=[MEAL_LUNCH, MEAL_DINNER],
        ),
        dish(
            "d_porridge",
            "Porridge",
            ["80 g Haferflocken #beilage", "1 Banane"],
            meal_types=[MEAL_BREAKFAST],
            base_servings=1,
        ),
        dish(
            "d_muesli",
            "Müsli mit Joghurt",
            ["60 g Haferflocken #beilage", "150 g Joghurt"],
            meal_types=[MEAL_BREAKFAST],
            base_servings=1,
        ),
    ]
