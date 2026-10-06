"""Prüft Gerichte gegen Ernährungsprofile.

Einzige Grundlage sind die Listen im Profil. Es gibt keine eingebauten Diätregeln.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .models import UNKNOWN_ALLOW, UNKNOWN_EXCLUDE, Dish, Profile
from .normalize import matches_loose, matches_strict, normalize_unit, to_base

STATUS_OK = "ok"
STATUS_WARN = "warn"
STATUS_EXCLUDED = "excluded"
_RANK = {STATUS_OK: 0, STATUS_WARN: 1, STATUS_EXCLUDED: 2}


@dataclass
class CompatResult:
    """Ergebnis der Prüfung eines Gerichts für ein Profil."""

    status: str = STATUS_OK
    reasons: list[dict[str, Any]] = field(default_factory=list)
    likes: int = 0

    def add(self, status: str, code: str, **params: Any) -> None:
        self.reasons.append({"code": code, "status": status, **params})
        if _RANK[status] > _RANK[self.status]:
            self.status = status

    @property
    def usable(self) -> bool:
        return self.status != STATUS_EXCLUDED

    def to_dict(self) -> dict[str, Any]:
        return {"status": self.status, "reasons": self.reasons, "likes": self.likes}


def _unknown(result: CompatResult, profile: Profile, code: str, **params: Any) -> None:
    if profile.unknown_ingredients == UNKNOWN_ALLOW:
        return
    status = STATUS_EXCLUDED if profile.unknown_ingredients == UNKNOWN_EXCLUDE else STATUS_WARN
    result.add(status, code, **params)


def check_dish(dish: Dish, profile: Profile) -> CompatResult:
    """Prüfe, ob und wie gut ein Gericht zu einem Profil passt."""
    result = CompatResult()

    if dish.suitable_for and profile.id not in dish.suitable_for:
        result.add(STATUS_EXCLUDED, "not_suitable")
    if profile.max_duration and dish.duration_min and dish.duration_min > profile.max_duration:
        result.add(STATUS_EXCLUDED, "too_long", duration=dish.duration_min, max=profile.max_duration)

    texts = [dish.name, *dish.tags, *(i.name for i in dish.ingredients)]
    for term in profile.dislikes:
        if any(matches_loose(term, text) for text in texts):
            result.add(STATUS_EXCLUDED, "dislike", term=term)
    for term in profile.likes:
        if any(matches_loose(term, text) for text in texts):
            result.likes += 1

    if not dish.ingredients:
        _unknown(result, profile, "no_ingredients")

    for ing in dish.ingredients:
        bad = next((t for t in profile.not_tolerated if matches_loose(t, ing.name)), None)
        if bad is not None:
            result.add(STATUS_EXCLUDED, "not_tolerated", ingredient=ing.name, term=bad)
            continue

        small = next((s for s in profile.small_amounts if matches_loose(s.name, ing.name)), None)
        if small is not None:
            _check_small_amount(result, dish, ing.name, ing.amount, ing.unit, small)
            continue

        if any(matches_strict(t, ing.name) for t in profile.tolerated):
            continue

        _unknown(result, profile, "unknown_ingredient", ingredient=ing.name)

    return result


def _check_small_amount(
    result: CompatResult,
    dish: Dish,
    name: str,
    amount: float | None,
    unit: str | None,
    small: Any,
) -> None:
    if small.max_amount is None:
        result.add(STATUS_WARN, "small_amount", ingredient=name)
        return
    if amount is None:
        result.add(STATUS_WARN, "small_amount_unchecked", ingredient=name)
        return
    per_serving, base_unit = to_base(amount / dish.base_servings, unit)
    limit, limit_unit = to_base(small.max_amount, normalize_unit(small.unit))
    if base_unit != limit_unit:
        result.add(STATUS_WARN, "small_amount_unchecked", ingredient=name)
        return
    if per_serving > limit + 1e-9:
        result.add(
            STATUS_EXCLUDED,
            "small_amount_exceeded",
            ingredient=name,
            amount=round(per_serving, 2),
            max=limit,
            unit=base_unit,
        )
