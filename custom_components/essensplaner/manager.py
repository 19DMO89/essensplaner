"""Zentrale Datenhaltung des Essensplaners (Gerichte, Profile, Plan)."""

from __future__ import annotations

from collections.abc import Callable
from datetime import date, datetime, timedelta
import logging
from pathlib import Path
import random
from typing import Any

from homeassistant.components.todo import TodoListEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_SUPPORTED_FEATURES
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CONF_IMPORT_STARTER,
    CONF_IMPORT_TODO,
    CONF_INITIAL_PROFILES,
    CONF_MEAL_TYPES,
    CONF_SHOPPING_LIST,
    DEFAULT_MEAL_TYPES,
    DOMAIN,
    PLAN_HISTORY_DAYS,
    SAVE_DELAY,
    STORAGE_KEY_DISHES,
    STORAGE_KEY_PLAN,
    STORAGE_KEY_PROFILES,
    STORAGE_VERSION,
    STARTER_TAG,
)
from .images import ImageStore, image_url
from .logic.models import (
    MEAL_TYPES,
    Assignment,
    Dish,
    Plan,
    Profile,
    plan_from_dict,
    plan_to_dict,
)
from .logic.groups import GROUP_IDS
from .logic.ingredients import ingredient_overview, set_ingredient_state
from .logic.normalize import normalize_name
from .logic.planner import Planner, PlanResult, shared_base
from .logic.shopping import ShoppingItem, build_shopping_list
from .logic.starter import parse_dish_file

_LOGGER = logging.getLogger(__name__)


STARTER_DIR = Path(__file__).parent / "data" / "starter"


def read_starter_dishes() -> list[dict[str, Any]]:
    """Gerichte des Startpakets lesen (blockierend, im Executor aufrufen)."""
    dishes: list[dict[str, Any]] = []
    for path in sorted(STARTER_DIR.glob("*.txt")):
        dishes.extend(parse_dish_file(path.read_text(encoding="utf-8"), path.name))
    return dishes


def date_range(start: date, days: int) -> list[str]:
    """ISO-Daten von ``start`` an für ``days`` Tage."""
    return [(start + timedelta(days=i)).isoformat() for i in range(days)]


class EssensplanerManager:
    """Hält alle Daten, speichert sie und benachrichtigt Entitäten bei Änderungen."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self._stores: dict[str, Store[dict[str, Any]]] = {
            key: Store(hass, STORAGE_VERSION, key)
            for key in (STORAGE_KEY_DISHES, STORAGE_KEY_PROFILES, STORAGE_KEY_PLAN)
        }
        self._dirty: set[str] = set()
        self._listeners: list[Callable[[], None]] = []
        self.dishes: dict[str, Dish] = {}
        self.profiles: dict[str, Profile] = {}
        self.plan: Plan = {}
        self.meta: dict[str, Any] = {}
        self.images = ImageStore(hass)

    # ------------------------------------------------------------ Lebenszyklus

    async def async_load(self) -> None:
        dishes = await self._stores[STORAGE_KEY_DISHES].async_load() or {}
        profiles = await self._stores[STORAGE_KEY_PROFILES].async_load() or {}
        plan = await self._stores[STORAGE_KEY_PLAN].async_load() or {}
        self.dishes = {d["id"]: Dish.from_dict(d) for d in dishes.get("dishes", [])}
        self.profiles = {p["id"]: Profile.from_dict(p) for p in profiles.get("profiles", [])}
        self.meta = profiles.get("meta", {})
        self.plan = plan_from_dict(plan.get("days", {}))
        self._prune_plan()

    async def async_initialize(self) -> None:
        """Einmalige Ersteinrichtung: Profile anlegen, optional Gerichte importieren."""
        if self.meta.get("initialized"):
            return
        if not self.profiles:
            for name in self.entry.data.get(CONF_INITIAL_PROFILES, []):
                self.save_profile({"name": name})
        if self.entry.data.get(CONF_IMPORT_STARTER):
            count = await self.async_import_starter()
            _LOGGER.info("%s Gerichte aus dem Startpaket importiert", count)
        if source := self.entry.data.get(CONF_IMPORT_TODO):
            try:
                count = await self.async_import_from_todo(source)
                _LOGGER.info("%s Gerichte aus %s importiert", count, source)
            except Exception:  # noqa: BLE001 - Import ist optional
                _LOGGER.warning("Import aus %s fehlgeschlagen", source, exc_info=True)
        self.meta["initialized"] = True
        self._changed(STORAGE_KEY_PROFILES)

    @callback
    def async_start(self) -> CALLBACK_TYPE:
        """Nach Mitternacht Entitäten aktualisieren (heutige Mahlzeiten)."""

        @callback
        def _midnight(_now: datetime) -> None:
            self._prune_plan()
            self._notify()

        return async_track_time_change(self.hass, _midnight, hour=0, minute=0, second=5)

    async def async_cleanup_images(self) -> None:
        """Bilder löschen, die zu keinem Gericht mehr gehören."""
        referenced = {d.image["id"] for d in self.dishes.values() if d.image and d.image.get("id")}
        removed = await self.images.async_cleanup(referenced)
        if removed:
            _LOGGER.debug("%s verwaiste Bilder gelöscht", removed)

    async def async_shutdown(self) -> None:
        """Ausstehende Änderungen sofort speichern."""
        for key in list(self._dirty):
            await self._stores[key].async_save(self._data_for(key))
        self._dirty.clear()

    # --------------------------------------------------------- Persistenz/Events

    def _data_for(self, key: str) -> dict[str, Any]:
        if key == STORAGE_KEY_DISHES:
            return {"dishes": [d.to_dict() for d in self.dishes.values()]}
        if key == STORAGE_KEY_PROFILES:
            return {"profiles": [p.to_dict() for p in self.profiles.values()], "meta": self.meta}
        return {"days": plan_to_dict(self.plan)}

    @callback
    def _changed(self, *keys: str) -> None:
        for key in keys:
            self._dirty.add(key)

            def _data(key: str = key) -> dict[str, Any]:
                self._dirty.discard(key)
                return self._data_for(key)

            self._stores[key].async_delay_save(_data, SAVE_DELAY)
        self._notify()

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> CALLBACK_TYPE:
        self._listeners.append(listener)

        @callback
        def _remove() -> None:
            self._listeners.remove(listener)

        return _remove

    def _prune_plan(self) -> None:
        cutoff = (dt_util.now().date() - timedelta(days=PLAN_HISTORY_DAYS)).isoformat()
        old = [day for day in self.plan if day < cutoff]
        for day in old:
            del self.plan[day]
        if old:
            self._changed(STORAGE_KEY_PLAN)

    # ------------------------------------------------------------------ Optionen

    @property
    def default_meal_types(self) -> list[str]:
        return list(self.entry.options.get(CONF_MEAL_TYPES, DEFAULT_MEAL_TYPES))

    @property
    def shopping_list_entity(self) -> str | None:
        return self.entry.options.get(CONF_SHOPPING_LIST)

    # ------------------------------------------------------------------- Profile

    def resolve_profile(self, ref: str) -> str:
        """Profil-ID aus ID oder Name (Groß-/Kleinschreibung egal)."""
        if ref in self.profiles:
            return ref
        for profile in self.profiles.values():
            if profile.name.casefold() == ref.strip().casefold():
                return profile.id
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="unknown_profile",
            translation_placeholders={"profile": ref},
        )

    @callback
    def save_profile(self, data: dict[str, Any]) -> Profile:
        profile = Profile.from_dict(data)
        self.profiles[profile.id] = profile
        self._changed(STORAGE_KEY_PROFILES)
        return profile

    @callback
    def delete_profile(self, profile_id: str) -> None:
        if self.profiles.pop(profile_id, None) is None:
            return
        # "suitable_for" der Gerichte bleibt unverändert: Ein Gericht nur für das
        # gelöschte Profil soll nicht plötzlich für alle gelten.
        for meals in self.plan.values():
            for meal_type, assignments in list(meals.items()):
                for a in assignments:
                    if profile_id in a.profiles:
                        a.profiles.remove(profile_id)
                meals[meal_type] = [a for a in assignments if a.profiles]
                if not meals[meal_type]:
                    del meals[meal_type]
        self._changed(STORAGE_KEY_PROFILES, STORAGE_KEY_PLAN)

    def ingredient_overview(self, profile_id: str) -> list[dict[str, Any]]:
        """Alle Zutaten mit Zustand für die Klick-Liste eines Profils."""
        return ingredient_overview(self.dishes.values(), self.profiles[self.resolve_profile(profile_id)])

    @callback
    def set_excluded_groups(self, profile_id: str, groups: list[str]) -> None:
        """Ausgeschlossene Zutatengruppen eines Profils setzen."""
        profile = self.profiles[self.resolve_profile(profile_id)]
        profile.excluded_groups = [g for g in GROUP_IDS if g in groups]
        self._changed(STORAGE_KEY_PROFILES)

    @callback
    def set_ingredient_state(
        self,
        profile_id: str,
        name: str,
        state: str,
        max_amount: float | None = None,
        unit: str | None = None,
    ) -> None:
        """Zutat als verträglich / nur wenig / nicht verträglich / offen markieren."""
        profile = self.profiles[self.resolve_profile(profile_id)]
        set_ingredient_state(profile, name.strip(), state, max_amount, unit)
        self._changed(STORAGE_KEY_PROFILES)

    # ------------------------------------------------------------------- Gerichte

    def resolve_dish(self, ref: str) -> str:
        """Gericht-ID aus ID oder Name."""
        if ref in self.dishes:
            return ref
        for dish in self.dishes.values():
            if dish.name.casefold() == ref.strip().casefold():
                return dish.id
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="unknown_dish",
            translation_placeholders={"dish": ref},
        )

    def _put_dish(self, data: dict[str, Any]) -> Dish:
        now = dt_util.utcnow().isoformat()
        existing = self.dishes.get(data.get("id") or "")
        dish = Dish.from_dict(data)
        dish.created = existing.created if existing else now
        dish.updated = now
        if existing and "image" not in data:
            dish.image = existing.image
        old_id = (existing.image or {}).get("id") if existing else None
        if old_id and old_id != (dish.image or {}).get("id"):
            self._delete_image(old_id)
        self.dishes[dish.id] = dish
        return dish

    @callback
    def _delete_image(self, image_id: str) -> None:
        self.hass.async_create_task(self.images.async_delete(image_id), eager_start=False)

    @callback
    def save_dish(self, data: dict[str, Any]) -> Dish:
        dish = self._put_dish(data)
        self._changed(STORAGE_KEY_DISHES)
        return dish

    @callback
    def add_dishes(self, dishes: list[dict[str, Any]], tag: str | None = None) -> int:
        """Mehrere neue Gerichte anlegen; gleichnamige werden übersprungen."""
        known = {normalize_name(d.name) for d in self.dishes.values()}
        count = 0
        for data in dishes:
            key = normalize_name(data["name"])
            if not key or key in known:
                continue
            known.add(key)
            data = {**data, "id": None}
            if tag:
                data["tags"] = [*data.get("tags", []), tag]
            self._put_dish(data)
            count += 1
        if count:
            self._changed(STORAGE_KEY_DISHES)
        return count

    async def async_import_starter(self) -> int:
        """Mitgeliefertes Startpaket importieren."""
        dishes = await self.hass.async_add_executor_job(read_starter_dishes)
        return self.add_dishes(dishes, tag=STARTER_TAG)

    @callback
    def delete_dish(self, dish_id: str) -> None:
        if (dish := self.dishes.pop(dish_id, None)) is None:
            return
        if dish.image and dish.image.get("id"):
            self._delete_image(dish.image["id"])
        for meals in self.plan.values():
            for meal_type, assignments in list(meals.items()):
                meals[meal_type] = [a for a in assignments if a.dish_id != dish_id]
                if not meals[meal_type]:
                    del meals[meal_type]
        self._changed(STORAGE_KEY_DISHES, STORAGE_KEY_PLAN)

    async def async_import_from_todo(self, entity_id: str) -> int:
        """Gerichtnamen aus einer To-do-Liste übernehmen (ohne Duplikate)."""
        response = await self.hass.services.async_call(
            "todo",
            "get_items",
            {"status": ["needs_action", "completed"]},
            target={"entity_id": entity_id},
            blocking=True,
            return_response=True,
        )
        items = (response or {}).get(entity_id, {}).get("items", [])
        return self.add_dishes(
            [{"name": str(item.get("summary", "")).strip()} for item in items]
        )

    # ----------------------------------------------------------------------- Plan

    def days_view(self, start: date, days: int) -> dict[str, Any]:
        """Plan für einen Zeitraum, angereichert mit Gericht- und Profilnamen."""
        result: dict[str, Any] = {}
        for day in date_range(start, days):
            meals = self.plan.get(day, {})
            result[day] = {
                meal_type: {
                    "assignments": [
                        {
                            **a.to_dict(),
                            "dish_name": self.dishes[a.dish_id].name
                            if a.dish_id in self.dishes
                            else None,
                            "image_url": image_url(self.dishes[a.dish_id].image)
                            if a.dish_id in self.dishes
                            else None,
                        }
                        for a in meals[meal_type]
                    ],
                    "shared_base": shared_base(
                        self.dishes[a.dish_id] for a in meals[meal_type] if a.dish_id in self.dishes
                    ),
                }
                for meal_type in MEAL_TYPES
                if meal_type in meals
            }
        return result

    @callback
    def set_meal(self, day: str, meal_type: str, assignments: list[dict[str, Any]]) -> None:
        """Mahlzeit manuell setzen (leere Liste = Mahlzeit entfernen)."""
        parsed: list[Assignment] = []
        for data in assignments:
            dish_id = self.resolve_dish(data["dish_id"])
            profiles = [self.resolve_profile(p) for p in data.get("profiles") or self.profiles]
            servings = data.get("servings") or sum(self.profiles[p].servings for p in profiles)
            parsed.append(Assignment(dish_id, profiles, float(servings), locked=True))
        meals = self.plan.setdefault(day, {})
        if parsed:
            meals[meal_type] = parsed
        else:
            meals.pop(meal_type, None)
            if not meals:
                del self.plan[day]
        self._changed(STORAGE_KEY_PLAN)

    @callback
    def assign_dish(
        self,
        day: str,
        meal_type: str,
        dish_ref: str | None,
        profile_refs: list[str] | None = None,
        servings: float | None = None,
    ) -> None:
        """Gericht für einzelne Profile setzen; andere Profile der Mahlzeit bleiben.

        Ohne ``dish_ref`` wird die Mahlzeit für diese Profile entfernt.
        """
        profiles = [self.resolve_profile(p) for p in profile_refs or self.profiles]
        dish_id = self.resolve_dish(dish_ref) if dish_ref else None
        result: list[Assignment] = []
        for a in self.plan.get(day, {}).get(meal_type, []):
            rest = [p for p in a.profiles if p not in profiles]
            if rest == a.profiles:
                result.append(a)
            elif rest:
                rest_servings = sum(self.profiles[p].servings for p in rest if p in self.profiles)
                result.append(Assignment(a.dish_id, rest, rest_servings or 1, a.locked))
        if dish_id:
            if not servings:
                servings = sum(self.profiles[p].servings for p in profiles)
            result.append(Assignment(dish_id, profiles, float(servings), locked=True))
        meals = self.plan.setdefault(day, {})
        if result:
            meals[meal_type] = result
        else:
            meals.pop(meal_type, None)
            if not meals:
                del self.plan[day]
        self._changed(STORAGE_KEY_PLAN)

    @callback
    def generate_plan(
        self,
        start: date,
        days: int,
        meal_types: list[str] | None = None,
        profile_refs: list[str] | None = None,
        overwrite: bool = False,
        seed: int | None = None,
        meals_by_date: dict[str, list[str]] | None = None,
    ) -> PlanResult:
        """Plan erzeugen. ``meals_by_date`` legt die Mahlzeiten je Tag einzeln fest."""
        meal_types = [m for m in MEAL_TYPES if m in (meal_types or self.default_meal_types)]
        if meals_by_date is None:
            meals_by_date = {day: meal_types for day in date_range(start, days)}
        else:
            meals_by_date = {
                day: [m for m in MEAL_TYPES if m in meals] for day, meals in meals_by_date.items()
            }
        profile_ids = [self.resolve_profile(p) for p in profile_refs] if profile_refs else None
        planner = Planner(self.dishes.values(), self.profiles.values(), random.Random(seed))
        result = planner.generate(self.plan, meals_by_date, profile_ids, overwrite)
        self.plan = result.plan
        self._changed(STORAGE_KEY_PLAN)
        return result

    def today_meals(self, profile_id: str) -> dict[str, list[dict[str, Any]]]:
        """Heutige Gerichte eines Profils je Mahlzeitentyp."""
        meals = self.plan.get(dt_util.now().date().isoformat(), {})
        result: dict[str, list[dict[str, Any]]] = {}
        for meal_type in MEAL_TYPES:
            entries = [
                {
                    "dish_id": a.dish_id,
                    "name": self.dishes[a.dish_id].name,
                    "servings": a.servings,
                    "image_url": image_url(self.dishes[a.dish_id].image),
                }
                for a in meals.get(meal_type, [])
                if profile_id in a.profiles and a.dish_id in self.dishes
            ]
            if entries:
                result[meal_type] = entries
        return result

    # ------------------------------------------------------------- Einkaufsliste

    def shopping_items(self, start: date, days: int) -> list[ShoppingItem]:
        return build_shopping_list(self.plan, self.dishes, date_range(start, days))

    async def async_push_shopping_list(
        self,
        start: date,
        days: int,
        entity_id: str | None = None,
        skip_existing: bool = True,
        keys: list[str] | None = None,
    ) -> dict[str, list[str]]:
        """Einkaufsliste in eine To-do-Liste schreiben."""
        entity_id = entity_id or self.shopping_list_entity
        if not entity_id:
            raise ServiceValidationError(
                translation_domain=DOMAIN, translation_key="no_shopping_list"
            )
        state = self.hass.states.get(entity_id)
        if state is None:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="entity_not_found",
                translation_placeholders={"entity_id": entity_id},
            )
        existing: set[str] = set()
        if skip_existing:
            response = await self.hass.services.async_call(
                "todo",
                "get_items",
                {"status": ["needs_action"]},
                target={"entity_id": entity_id},
                blocking=True,
                return_response=True,
            )
            for item in (response or {}).get(entity_id, {}).get("items", []):
                summary = str(item.get("summary", ""))
                existing.add(normalize_name(summary.split(" – ")[0]))

        supports_description = bool(
            int(state.attributes.get(ATTR_SUPPORTED_FEATURES, 0))
            & TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM
        )
        added: list[str] = []
        skipped: list[str] = []
        for item in self.shopping_items(start, days):
            if keys is not None and item.key not in keys:
                continue
            if item.key in existing:
                skipped.append(item.summary)
                continue
            data: dict[str, Any] = {"item": item.summary}
            if supports_description and item.dishes:
                data["description"] = ", ".join(item.dishes)
            await self.hass.services.async_call(
                "todo", "add_item", data, target={"entity_id": entity_id}, blocking=True
            )
            added.append(item.summary)
        return {"added": added, "skipped": skipped}
