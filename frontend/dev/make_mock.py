"""Erzeugt dev/mock-data.json für die Entwicklungsseite (echte Logik, Startpaket).

Aufruf aus dem Repo-Wurzelverzeichnis:
    python frontend/dev/make_mock.py
"""

from __future__ import annotations

from datetime import date, timedelta
import json
from pathlib import Path
import random
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "custom_components" / "essensplaner"))

from logic.compat import check_dish  # noqa: E402
from logic.ingredients import ingredient_overview  # noqa: E402
from logic.models import Dish, Profile, plan_to_dict  # noqa: E402
from logic.planner import Planner, shared_base  # noqa: E402
from logic.shopping import build_shopping_list  # noqa: E402
from logic.starter import parse_dish_file  # noqa: E402

dishes = []
for path in sorted((ROOT / "custom_components" / "essensplaner" / "data" / "starter").glob("*.txt")):
    for i, data in enumerate(parse_dish_file(path.read_text(encoding="utf-8"), path.name)):
        data["id"] = f"d_{path.stem[:2]}_{i:02d}"
        dishes.append(Dish.from_dict(data))

profiles = [
    Profile.from_dict(
        {
            "id": "p_anna",
            "name": "Anna",
            "unknown_ingredients": "exclude",
            "tolerated": [
                "Reis", "Hühnerbrust", "Hühnerkeulen", "Pute", "Karotte", "Kartoffel", "Salz", "Öl",
                "Butter", "Zucchini", "Haferflocken", "Banane", "Lachs", "Petersilie", "Wasser",
                "Hühnersuppe", "Nudeln", "Spaghetti", "Penne", "Ei", "Milch", "Topfen", "Brot",
                "Semmel", "Gemüsesuppe", "Kürbis", "Sellerie", "Grieß", "Zucker", "Prise Salz",
            ],
            "not_tolerated": ["Zwiebel", "Knoblauch", "Paprika", "Chili", "Kohl", "Bohnen"],
            "small_amounts": [{"name": "Butter", "max_amount": 15, "unit": "g"}],
        }
    ),
    Profile.from_dict({"id": "p_ben", "name": "Ben", "unknown_ingredients": "allow", "likes": ["Gulasch"]}),
]

monday = date.today() - timedelta(days=date.today().weekday())
days = [(monday + timedelta(days=i)).isoformat() for i in range(7)]
planner = Planner(dishes, profiles, random.Random(4))
result = planner.generate({}, {d: ["lunch", "dinner"] for d in days})
plan = result.plan
by_id = {d.id: d for d in dishes}


def days_view(start_days):
    view = {}
    for day in start_days:
        meals = plan.get(day, {})
        view[day] = {
            meal: {
                "assignments": [
                    {**a.to_dict(), "dish_name": by_id[a.dish_id].name, "image_url": None}
                    for a in assignments
                ],
                "shared_base": shared_base(by_id[a.dish_id] for a in assignments),
            }
            for meal, assignments in meals.items()
        }
    return view


mock = {
    "data": {
        "profiles": [p.to_dict() for p in profiles],
        "dishes": [d.to_dict() for d in dishes],
        "meal_types": ["breakfast", "lunch", "dinner", "snack"],
        "default_meal_types": ["lunch", "dinner"],
        "shopping_list": "todo.einkaufsliste",
    },
    "compat": {d.id: {p.id: check_dish(d, p).status for p in profiles} for d in dishes},
    "checks": {d.id: {p.id: check_dish(d, p).to_dict() for p in profiles} for d in dishes},
    "plan": days_view(days),
    "plan_raw": plan_to_dict(plan),
    "warnings": result.warnings,
    "shopping": [i.to_dict() for i in build_shopping_list(plan, by_id, days)],
    "ingredients": {p.id: ingredient_overview(dishes, p) for p in profiles},
}
out = Path(__file__).with_name("mock-data.json")
out.write_text(json.dumps(mock, ensure_ascii=False), encoding="utf-8")
print(f"{out} geschrieben: {len(dishes)} Gerichte, {len(result.filled)} Zuweisungen")
