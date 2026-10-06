"""Einkaufsliste aus einem Plan zusammenstellen."""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass, field
from typing import Any

from .models import Dish, Plan
from .normalize import format_amount, normalize_name, round_for_shopping, to_base
from .planner import scale_factor


@dataclass
class ShoppingItem:
    """Eine zusammengefasste Zutat der Einkaufsliste."""

    key: str
    name: str
    amounts: dict[str, float] = field(default_factory=dict)  # Basiseinheit -> Menge
    without_amount: bool = False
    dishes: list[str] = field(default_factory=list)

    @property
    def amount_text(self) -> str:
        parts = [
            format_amount(round_for_shopping(amount, unit), unit)
            for unit, amount in sorted(
                self.amounts.items(), key=lambda kv: (kv[0] not in ("g", "ml"), kv[0])
            )
        ]
        return " + ".join(parts)

    @property
    def summary(self) -> str:
        """Text für den To-do-Eintrag, z. B. "Reis – 450 g"."""
        text = self.amount_text
        return f"{self.name} – {text}" if text else self.name

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "name": self.name,
            "amounts": {
                unit: round_for_shopping(amount, unit) for unit, amount in self.amounts.items()
            },
            "amount_text": self.amount_text,
            "summary": self.summary,
            "dishes": self.dishes,
        }


def build_shopping_list(
    plan: Plan, dishes: dict[str, Dish], dates: Iterable[str]
) -> list[ShoppingItem]:
    """Fasse alle Zutaten der Gerichte an den angegebenen Tagen zusammen.

    Mengen werden auf die Portionen der Zuweisung skaliert, in Basiseinheiten
    (g, ml) umgerechnet und gleiche Zutaten addiert.
    """
    items: dict[str, ShoppingItem] = {}
    for day in dates:
        for assignments in plan.get(day, {}).values():
            for assignment in assignments:
                dish = dishes.get(assignment.dish_id)
                if dish is None:
                    continue
                factor = scale_factor(dish, assignment.servings)
                for ing in dish.ingredients:
                    key = normalize_name(ing.name)
                    if not key:
                        continue
                    item = items.setdefault(key, ShoppingItem(key=key, name=ing.name))
                    if dish.name not in item.dishes:
                        item.dishes.append(dish.name)
                    if ing.amount is None:
                        item.without_amount = True
                        continue
                    amount, unit = to_base(ing.amount * factor, ing.unit)
                    item.amounts[unit] = item.amounts.get(unit, 0.0) + amount
    return sorted(items.values(), key=lambda i: i.name.lower())
