"""Datenmodelle für Gerichte, Profile und Wochenpläne."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any
import uuid

MEAL_BREAKFAST = "breakfast"
MEAL_LUNCH = "lunch"
MEAL_DINNER = "dinner"
MEAL_SNACK = "snack"
MEAL_TYPES: tuple[str, ...] = (MEAL_BREAKFAST, MEAL_LUNCH, MEAL_DINNER, MEAL_SNACK)

ROLE_PROTEIN = "protein"
ROLE_SIDE = "side"
ROLE_VEG = "veg"
ROLE_OTHER = "other"
ROLES: tuple[str, ...] = (ROLE_PROTEIN, ROLE_SIDE, ROLE_VEG, ROLE_OTHER)
# Rollen, über die zwei Gerichte eine "gemeinsame Basis" haben können.
BASE_ROLES: tuple[str, ...] = (ROLE_PROTEIN, ROLE_SIDE)

UNKNOWN_ALLOW = "allow"
UNKNOWN_WARN = "warn"
UNKNOWN_EXCLUDE = "exclude"
UNKNOWN_MODES: tuple[str, ...] = (UNKNOWN_ALLOW, UNKNOWN_WARN, UNKNOWN_EXCLUDE)


def new_id(prefix: str) -> str:
    """Erzeuge eine kurze, eindeutige ID."""
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def _str_list(value: Any) -> list[str]:
    if not value:
        return []
    return [str(v).strip() for v in value if str(v).strip()]


def _opt_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    return float(value)


@dataclass
class Ingredient:
    """Eine Zutat eines Gerichts, bezogen auf die Basisportionen."""

    name: str
    amount: float | None = None
    unit: str | None = None
    role: str = ROLE_OTHER

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Ingredient:
        role = data.get("role") or ROLE_OTHER
        return cls(
            name=str(data["name"]).strip(),
            amount=_opt_float(data.get("amount")),
            unit=(data.get("unit") or None),
            role=role if role in ROLES else ROLE_OTHER,
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class SmallAmount:
    """Zutat, die nur in kleinen Mengen vertragen wird (Limit pro Portion)."""

    name: str
    max_amount: float | None = None
    unit: str | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> SmallAmount:
        return cls(
            name=str(data["name"]).strip(),
            max_amount=_opt_float(data.get("max_amount")),
            unit=(data.get("unit") or None),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Profile:
    """Ernährungsprofil einer Person (oder einer Gruppe mit gleichem Essen)."""

    id: str
    name: str
    servings: float = 1
    tolerated: list[str] = field(default_factory=list)
    not_tolerated: list[str] = field(default_factory=list)
    small_amounts: list[SmallAmount] = field(default_factory=list)
    likes: list[str] = field(default_factory=list)
    dislikes: list[str] = field(default_factory=list)
    max_duration: int | None = None
    unknown_ingredients: str = UNKNOWN_EXCLUDE
    # Ausgeschlossene Zutatengruppen (Fleischsorten, Allergene), siehe groups.py
    excluded_groups: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Profile:
        mode = data.get("unknown_ingredients") or UNKNOWN_EXCLUDE
        max_duration = data.get("max_duration")
        return cls(
            id=data.get("id") or new_id("p"),
            name=str(data["name"]).strip(),
            servings=float(data.get("servings") or 1),
            tolerated=_str_list(data.get("tolerated")),
            not_tolerated=_str_list(data.get("not_tolerated")),
            small_amounts=[
                SmallAmount.from_dict(s) for s in data.get("small_amounts") or []
            ],
            likes=_str_list(data.get("likes")),
            dislikes=_str_list(data.get("dislikes")),
            max_duration=int(max_duration) if max_duration else None,
            unknown_ingredients=mode if mode in UNKNOWN_MODES else UNKNOWN_EXCLUDE,
            excluded_groups=_str_list(data.get("excluded_groups")),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Dish:
    """Ein Gericht der Datenbank."""

    id: str
    name: str
    meal_types: list[str] = field(default_factory=lambda: [MEAL_LUNCH, MEAL_DINNER])
    suitable_for: list[str] = field(default_factory=list)  # leer = alle Profile
    base_servings: float = 2
    duration_min: int | None = None
    tags: list[str] = field(default_factory=list)
    ingredients: list[Ingredient] = field(default_factory=list)
    steps: list[str] = field(default_factory=list)
    image: dict[str, Any] | None = None
    source_url: str | None = None
    created: str | None = None
    updated: str | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Dish:
        meal_types = [m for m in data.get("meal_types") or [] if m in MEAL_TYPES]
        duration = data.get("duration_min")
        return cls(
            id=data.get("id") or new_id("d"),
            name=str(data["name"]).strip(),
            meal_types=meal_types or [MEAL_LUNCH, MEAL_DINNER],
            suitable_for=_str_list(data.get("suitable_for")),
            base_servings=float(data.get("base_servings") or 2),
            duration_min=int(duration) if duration else None,
            tags=_str_list(data.get("tags")),
            ingredients=[Ingredient.from_dict(i) for i in data.get("ingredients") or []],
            steps=_str_list(data.get("steps")),
            image=data.get("image") or None,
            source_url=data.get("source_url") or None,
            created=data.get("created"),
            updated=data.get("updated"),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class Assignment:
    """Ein Gericht in einer Mahlzeit, gekocht für ein oder mehrere Profile."""

    dish_id: str
    profiles: list[str]
    servings: float
    locked: bool = False  # manuell gesetzt -> wird beim Generieren nicht ersetzt

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Assignment:
        return cls(
            dish_id=str(data["dish_id"]),
            profiles=_str_list(data.get("profiles")),
            servings=float(data.get("servings") or 1),
            locked=bool(data.get("locked", False)),
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# Ein Plan ist ein Mapping: ISO-Datum -> Mahlzeitentyp -> Liste von Assignments.
DayPlan = dict[str, list[Assignment]]
Plan = dict[str, DayPlan]


def plan_from_dict(data: dict[str, Any]) -> Plan:
    """Lade einen Plan aus der gespeicherten Form."""
    return {
        day: {
            meal: [Assignment.from_dict(a) for a in assignments]
            for meal, assignments in meals.items()
            if meal in MEAL_TYPES
        }
        for day, meals in data.items()
    }


def plan_to_dict(plan: Plan) -> dict[str, Any]:
    """Wandle einen Plan in die speicherbare Form um."""
    return {
        day: {meal: [a.to_dict() for a in assignments] for meal, assignments in meals.items()}
        for day, meals in plan.items()
    }
