"""Automatische Planung: passende Gerichte je Mahlzeit und Profil auswählen."""

from __future__ import annotations

from collections import Counter
from collections.abc import Iterable
from dataclasses import dataclass, field
import random
from typing import Any

from .compat import STATUS_WARN, CompatResult, check_dish
from .models import BASE_ROLES, Assignment, Dish, Plan, Profile
from .normalize import normalize_name

# Gewichte der Bewertung. Abdeckung mehrerer Profile mit einem Gericht zählt am
# meisten (nur einmal kochen), danach gemeinsame Basis und Abwechslung.
W_COVER = 20.0
W_WARN = 3.0
W_LIKE = 1.0
W_SHARED = 4.0
W_REPEAT_WEEK = 6.0
W_REPEAT_DAY = 4.0
W_RANDOM = 2.0


def base_components(dish: Dish) -> set[str]:
    """Normalisierte Namen der Basis-Zutaten (Protein, Beilage) eines Gerichts."""
    return {normalize_name(i.name) for i in dish.ingredients if i.role in BASE_ROLES}


def shared_base(dishes: Iterable[Dish]) -> list[str]:
    """Basis-Zutaten, die mindestens zwei der Gerichte gemeinsam haben."""
    counts: Counter[str] = Counter()
    names: dict[str, str] = {}
    for dish in dishes:
        for ing in dish.ingredients:
            if ing.role not in BASE_ROLES:
                continue
            key = normalize_name(ing.name)
            names.setdefault(key, ing.name)
        counts.update(base_components(dish))
    return sorted(names[k] for k, n in counts.items() if n >= 2)


@dataclass
class PlanResult:
    """Ergebnis eines Planungslaufs."""

    plan: Plan
    filled: list[dict[str, Any]] = field(default_factory=list)
    warnings: list[dict[str, Any]] = field(default_factory=list)


class Planner:
    """Wählt Gerichte für Mahlzeiten aus der Datenbank aus."""

    def __init__(
        self,
        dishes: Iterable[Dish],
        profiles: Iterable[Profile],
        rng: random.Random | None = None,
    ) -> None:
        self.dishes = {d.id: d for d in dishes}
        self.profiles = {p.id: p for p in profiles}
        self.rng = rng or random.Random()
        self._compat: dict[tuple[str, str], CompatResult] = {}
        self._base = {d.id: base_components(d) for d in self.dishes.values()}

    def compat(self, dish_id: str, profile_id: str) -> CompatResult:
        key = (dish_id, profile_id)
        if key not in self._compat:
            self._compat[key] = check_dish(self.dishes[dish_id], self.profiles[profile_id])
        return self._compat[key]

    def generate(
        self,
        plan: Plan,
        meals_by_date: dict[str, list[str]],
        profile_ids: list[str] | None = None,
        overwrite: bool = False,
    ) -> PlanResult:
        """Fülle die angefragten Mahlzeiten.

        Ohne ``overwrite`` bleiben belegte Mahlzeiten unverändert. Mit ``overwrite``
        werden nur manuell gesetzte (``locked``) Zuweisungen behalten.
        """
        profile_ids = [p for p in (profile_ids or list(self.profiles)) if p in self.profiles]
        new_plan: Plan = {day: dict(meals) for day, meals in plan.items()}
        result = PlanResult(plan=new_plan)

        dates = sorted(meals_by_date)
        week_usage: Counter[str] = Counter()
        for day in dates:
            for meal_type, assignments in new_plan.get(day, {}).items():
                if overwrite and meal_type in meals_by_date[day]:
                    assignments = [a for a in assignments if a.locked]
                week_usage.update(a.dish_id for a in assignments)

        for day in dates:
            day_plan = new_plan.setdefault(day, {})
            pending = set(meals_by_date[day]) if overwrite else set()
            for meal_type in meals_by_date[day]:
                pending.discard(meal_type)
                existing = day_plan.get(meal_type, [])
                if existing and not overwrite:
                    continue
                kept = [a for a in existing if a.locked] if overwrite else []
                covered = {p for a in kept for p in a.profiles}
                remaining = [p for p in profile_ids if p not in covered]
                # Andere Mahlzeiten des Tages; noch zu überschreibende zählen nur
                # mit ihren fixierten Zuweisungen.
                day_usage = Counter(
                    a.dish_id
                    for m, lst in day_plan.items()
                    if m != meal_type
                    for a in lst
                    if m not in pending or a.locked
                )
                chosen, missing = self._fill_slot(
                    meal_type, remaining, kept, week_usage, day_usage
                )
                for assignment in chosen:
                    week_usage[assignment.dish_id] += 1
                    result.filled.append(
                        {"date": day, "meal_type": meal_type, **assignment.to_dict()}
                    )
                if missing:
                    result.warnings.append(
                        {"date": day, "meal_type": meal_type, "code": "no_dish", "profiles": missing}
                    )
                if kept or chosen:
                    day_plan[meal_type] = kept + chosen
                else:
                    day_plan.pop(meal_type, None)
            if not day_plan:
                new_plan.pop(day, None)
        return result

    def _fill_slot(
        self,
        meal_type: str,
        remaining: list[str],
        kept: list[Assignment],
        week_usage: Counter[str],
        day_usage: Counter[str],
    ) -> tuple[list[Assignment], list[str]]:
        chosen: list[Assignment] = []
        slot_base: set[str] = set()
        for assignment in kept:
            if assignment.dish_id in self.dishes:
                slot_base |= self._base[assignment.dish_id]
        used_here = {a.dish_id for a in kept}
        remaining = list(remaining)

        while remaining:
            candidates: list[tuple[Dish, list[str]]] = []
            for dish in self.dishes.values():
                if meal_type not in dish.meal_types or dish.id in used_here:
                    continue
                covers = [p for p in remaining if self.compat(dish.id, p).usable]
                if covers:
                    candidates.append((dish, covers))

            best: tuple[float, Dish, list[str]] | None = None
            for dish, covers in candidates:
                score = W_COVER * len(covers)
                for p in covers:
                    res = self.compat(dish.id, p)
                    score += W_LIKE * res.likes
                    if res.status == STATUS_WARN:
                        score -= W_WARN
                base = self._base[dish.id]
                if slot_base:
                    score += W_SHARED * min(2, len(base & slot_base))
                # Vorausschau: Gibt es für die übrigen Profile ein Gericht mit
                # gemeinsamer Basis? Dann ist dieses Gericht ein guter Partner.
                rest = set(remaining) - set(covers)
                if rest and base:
                    score += W_SHARED * max(
                        (
                            min(2, len(base & self._base[other.id]))
                            for other, other_covers in candidates
                            if other.id != dish.id and rest & set(other_covers)
                        ),
                        default=0,
                    )
                score -= W_REPEAT_WEEK * week_usage[dish.id]
                score -= W_REPEAT_DAY * day_usage[dish.id]
                score += W_RANDOM * self.rng.random()
                if best is None or score > best[0]:
                    best = (score, dish, covers)
            if best is None:
                break
            _, dish, covers = best
            chosen.append(
                Assignment(
                    dish_id=dish.id,
                    profiles=covers,
                    servings=sum(self.profiles[p].servings for p in covers),
                )
            )
            used_here.add(dish.id)
            slot_base |= self._base[dish.id]
            remaining = [p for p in remaining if p not in covers]
        return chosen, remaining


def scale_factor(dish: Dish, servings: float) -> float:
    """Faktor, mit dem die Zutatenmengen für ``servings`` Portionen skaliert werden."""
    return servings / dish.base_servings if dish.base_servings else 1.0
