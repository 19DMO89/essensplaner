"""Zutatenübersicht je Profil (Grundlage der Klick-Liste "Verträglichkeit")."""

from __future__ import annotations

from collections import Counter
from collections.abc import Iterable
from typing import Any

from .groups import matching_group
from .models import Dish, Profile, SmallAmount
from .normalize import matches_loose, matches_strict, normalize_name

STATE_TOLERATED = "tolerated"
STATE_NOT_TOLERATED = "not_tolerated"
STATE_SMALL = "small"
STATE_UNKNOWN = "unknown"
STATES = (STATE_TOLERATED, STATE_NOT_TOLERATED, STATE_SMALL, STATE_UNKNOWN)


def _state_for(
    name: str, profile: Profile
) -> tuple[str, str | None, SmallAmount | None, str | None]:
    """Zustand einer Zutat für ein Profil – gleiche Reihenfolge wie ``check_dish``.

    Liefert (Zustand, auslösender Eintrag, Kleinmengen-Eintrag, auslösende Gruppe).
    """
    for term in profile.not_tolerated:
        if matches_loose(term, name):
            return STATE_NOT_TOLERATED, term, None, None
    for small in profile.small_amounts:
        if matches_loose(small.name, name):
            return STATE_SMALL, small.name, small, None
    key = normalize_name(name)
    for term in profile.tolerated:
        if normalize_name(term) == key:
            return STATE_TOLERATED, term, None, None
    if (group := matching_group(profile.excluded_groups, name)) is not None:
        return STATE_NOT_TOLERATED, None, None, group
    for term in profile.tolerated:
        if matches_strict(term, name):
            return STATE_TOLERATED, term, None, None
    return STATE_UNKNOWN, None, None, None


def ingredient_overview(dishes: Iterable[Dish], profile: Profile) -> list[dict[str, Any]]:
    """Alle Zutaten der Datenbank mit ihrem Zustand für das Profil.

    ``explicit`` ist wahr, wenn die Zutat selbst in einer Liste steht; sonst
    ergibt sich der Zustand aus einem anderen Eintrag (``by``), z. B.
    "Zwiebelpulver" durch "Zwiebel".
    """
    names: dict[str, Counter[str]] = {}
    dish_count: Counter[str] = Counter()
    for dish in dishes:
        seen: set[str] = set()
        for ing in dish.ingredients:
            key = normalize_name(ing.name)
            if not key:
                continue
            names.setdefault(key, Counter())[ing.name] += 1
            if key not in seen:
                dish_count[key] += 1
                seen.add(key)

    # Einträge aus den Profillisten, die in keinem Gericht vorkommen, ebenfalls zeigen.
    for term in [*profile.tolerated, *profile.not_tolerated, *(s.name for s in profile.small_amounts)]:
        key = normalize_name(term)
        if key and key not in names:
            names[key] = Counter({term: 1})

    items = []
    for key, counter in names.items():
        name = counter.most_common(1)[0][0]
        state, by, small, group = _state_for(name, profile)
        items.append(
            {
                "key": key,
                "name": name,
                "count": dish_count[key],
                "state": state,
                "by": by,
                "group": group,
                "explicit": by is not None and normalize_name(by) == key,
                "max_amount": small.max_amount if small else None,
                "unit": small.unit if small else None,
            }
        )
    items.sort(key=lambda i: (-i["count"], i["name"].casefold()))
    return items


def set_ingredient_state(
    profile: Profile,
    name: str,
    state: str,
    max_amount: float | None = None,
    unit: str | None = None,
) -> None:
    """Zutat in genau eine Liste eintragen (oder mit ``unknown`` aus allen entfernen)."""
    key = normalize_name(name)
    profile.tolerated = [t for t in profile.tolerated if normalize_name(t) != key]
    profile.not_tolerated = [t for t in profile.not_tolerated if normalize_name(t) != key]
    profile.small_amounts = [s for s in profile.small_amounts if normalize_name(s.name) != key]
    if state == STATE_TOLERATED:
        profile.tolerated.append(name)
    elif state == STATE_NOT_TOLERATED:
        profile.not_tolerated.append(name)
    elif state == STATE_SMALL:
        profile.small_amounts.append(SmallAmount(name, max_amount, unit or None))
