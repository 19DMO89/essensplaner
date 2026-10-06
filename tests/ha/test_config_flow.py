"""Tests für Config Flow und Options Flow."""

from __future__ import annotations

from homeassistant import config_entries
from homeassistant.core import HomeAssistant, SupportsResponse
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.util import dt as dt_util

from custom_components.essensplaner.const import (
    CONF_IMPORT_STARTER,
    CONF_INITIAL_PROFILES,
    CONF_MEAL_TYPES,
    CONF_SHOPPING_LIST,
    DOMAIN,
)
from custom_components.essensplaner.manager import EssensplanerManager


async def test_user_flow_creates_profiles(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_INITIAL_PROFILES: " "}
    )
    assert result["errors"] == {CONF_INITIAL_PROFILES: "no_profiles"}

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_INITIAL_PROFILES: "Anna\n\nBen\n"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"] == {CONF_INITIAL_PROFILES: ["Anna", "Ben"], CONF_IMPORT_STARTER: True}
    await hass.async_block_till_done()

    entry = result["result"]
    assert [p.name for p in entry.runtime_data.profiles.values()] == ["Anna", "Ben"]
    # Startpaket wurde importiert
    assert len(entry.runtime_data.dishes) >= 150


async def test_user_flow_without_starter(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_INITIAL_PROFILES: "Anna", CONF_IMPORT_STARTER: False}
    )
    await hass.async_block_till_done()
    assert result["result"].runtime_data.dishes == {}


async def test_single_instance(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


async def _open_menu(hass: HomeAssistant, manager: EssensplanerManager, step: str):
    result = await hass.config_entries.options.async_init(manager.entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    return await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": step}
    )


async def test_options_settings(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    result = await _open_menu(hass, manager, "settings")
    assert result["step_id"] == "settings"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {CONF_SHOPPING_LIST: "todo.anders", CONF_MEAL_TYPES: ["dinner"]}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert manager.default_meal_types == ["dinner"]
    assert manager.shopping_list_entity == "todo.anders"


async def test_options_add_and_edit_profile(
    hass: HomeAssistant, manager: EssensplanerManager
) -> None:
    result = await _open_menu(hass, manager, "profile_add")
    assert result["step_id"] == "profile"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "name": "Familie",
            "servings": 3,
            "unknown_ingredients": "warn",
            "tolerated": "Reis, Nudeln\nKartoffeln",
            "small_amounts": "10 g Butter\nKnoblauch",
            "dislikes": "Fenchel",
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    family = next(p for p in manager.profiles.values() if p.name == "Familie")
    assert family.servings == 3
    assert family.tolerated == ["Reis", "Nudeln", "Kartoffeln"]
    assert [(s.name, s.max_amount, s.unit) for s in family.small_amounts] == [
        ("Butter", 10, "g"),
        ("Knoblauch", None, None),
    ]
    assert family.max_duration is None

    # Bearbeiten: vorhandene Werte werden vorgeschlagen, Änderungen gespeichert
    result = await _open_menu(hass, manager, "profile_edit")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"profile": family.id}
    )
    assert result["step_id"] == "profile"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"name": "Familie", "servings": 4, "unknown_ingredients": "allow", "max_duration": 30},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert manager.profiles[family.id].servings == 4
    assert manager.profiles[family.id].max_duration == 30

    # Löschen
    result = await _open_menu(hass, manager, "profile_edit")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"profile": family.id}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"name": "Familie", "servings": 4, "unknown_ingredients": "allow", "delete": True},
    )
    assert family.id not in manager.profiles


async def test_options_add_dish(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    anna_id = next(iter(manager.profiles))
    result = await _open_menu(hass, manager, "dish_add")
    assert result["step_id"] == "dish"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "name": "Kartoffelpüree",
            "meal_types": ["lunch"],
            "suitable_for": [anna_id],
            "base_servings": 2,
            "ingredients": "500 g Kartoffeln #beilage\n100 ml Milch\nSalz",
            "steps": "Kochen\nStampfen",
            "tags": "mild, schnell",
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    dish = next(d for d in manager.dishes.values() if d.name == "Kartoffelpüree")
    assert dish.suitable_for == [anna_id]
    assert [(i.name, i.amount, i.unit, i.role) for i in dish.ingredients] == [
        ("Kartoffeln", 500, "g", "side"),
        ("Milch", 100, "ml", "other"),
        ("Salz", None, None, "other"),
    ]
    assert dish.steps == ["Kochen", "Stampfen"]
    assert dish.tags == ["mild", "schnell"]


async def test_options_import_todo(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    hass.states.async_set("todo.gerichte", "2")

    async def get_items(call):
        return {
            "todo.gerichte": {
                "items": [
                    {"summary": "Gulasch", "uid": "1", "status": "needs_action"},
                    {"summary": "Linsencurry", "uid": "2", "status": "completed"},
                ]
            }
        }

    hass.services.async_register(
        "todo", "get_items", get_items, supports_response=SupportsResponse.ONLY
    )
    result = await _open_menu(hass, manager, "import_todo")
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"entity_id": "todo.gerichte"}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "import_done"
    assert result["description_placeholders"] == {"count": "1"}  # Gulasch existiert schon
    assert any(d.name == "Linsencurry" and not d.ingredients for d in manager.dishes.values())


async def test_options_import_starter(hass: HomeAssistant, manager: EssensplanerManager) -> None:
    result = await _open_menu(hass, manager, "import_starter")
    assert result["step_id"] == "import_starter"
    result = await hass.config_entries.options.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.ABORT
    count = int(result["description_placeholders"]["count"])
    assert count >= 150
    assert len(manager.dishes) == count + 2
    assert all("Startpaket" in d.tags for d in manager.dishes.values() if d.id not in ("d_huhn_reis", "d_gulasch"))

    # Zweiter Import legt nichts doppelt an
    result = await _open_menu(hass, manager, "import_starter")
    result = await hass.config_entries.options.async_configure(result["flow_id"], {})
    assert result["description_placeholders"] == {"count": "0"}

    # Mit dem Startpaket lässt sich eine ganze Woche für alle Mahlzeiten planen
    ben = list(manager.profiles)[1]
    plan = manager.generate_plan(
        dt_util.now().date(), 7, ["breakfast", "lunch", "dinner", "snack"], [ben], seed=1
    )
    assert plan.warnings == []
    assert len(plan.filled) == 28
