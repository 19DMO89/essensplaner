"""Zutatengruppen für die Schnellauswahl: Fleischsorten und Allergene.

Eine Gruppe ist eine Liste typischer Zutatenbegriffe (Begriff im Namen enthalten;
mit "=" davor nur als ganzes Wort) plus Ausnahmen gegen Fehltreffer.
Schließt eine Person eine Gruppe aus, gelten alle passenden Zutaten als nicht
verträglich – außer sie sind einzeln ausdrücklich als verträglich markiert.

Die Listen sind eine Hilfe für die Auswahl, keine vollständige Allergenkennzeichnung
verarbeiteter Produkte.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

from .normalize import normalize_tokens

KIND_MEAT = "meat"
KIND_ALLERGEN = "allergen"


@dataclass(frozen=True)
class Group:
    """Zutatengruppe."""

    id: str
    kind: str
    label_de: str
    label_en: str
    terms: tuple[str, ...]
    exceptions: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, str]:
        return {"id": self.id, "kind": self.kind, "label_de": self.label_de, "label_en": self.label_en}


_GROUPS: tuple[Group, ...] = (
    # ------------------------------------------------------------ Fleisch & Fisch
    Group(
        "meat_beef", KIND_MEAT, "Rind", "Beef",
        ("Rind", "Beiried", "Tafelspitz", "Hackfleisch", "Leberkäse", "Extrawurst", "Roastbeef",
         "Rostbraten", "Ochsen"),
        ("Schweinefaschiertes", "Schweinehackfleisch", "Lammfaschiertes",
         "Lammhackfleisch", "Putenhackfleisch", "Tamarinde"),
    ),
    Group("meat_veal", KIND_MEAT, "Kalb", "Veal", ("Kalb",)),
    Group(
        "meat_pork", KIND_MEAT, "Schwein", "Pork",
        ("Schwein", "Speck", "Schinken", "Selchfleisch", "Geselchtes", "Leberkäse", "Frankfurter",
         "Bratwurst", "Würstel", "Wurst", "Extrawurst", "Salami", "Hackfleisch", "Kassler",
         "Chorizo", "Pancetta", "Prosciutto", "Mortadella", "Cabanossi", "Debreziner", "Leberwurst",
         "Schmalz", "Grammeln"),
        ("speckig", "Butterschmalz", "Gänseschmalz", "Entenschmalz", "Palatschinken", "Rindswadschinken", "Wadschinken", "Rinderhackfleisch", "Rindshackfleisch",
         "Lammfaschiertes", "Lammhackfleisch", "Putenhackfleisch", "Putenschinken", "Putenwurst",
         "Geflügelwurst", "Hühnerwurst"),
    ),
    Group(
        "meat_poultry", KIND_MEAT, "Geflügel", "Poultry",
        ("Huhn", "Pute", "Truthahn", "=Ente", "Entenbrust", "Entenkeule", "Gans", "Gänse", "Geflügel", "Chicken", "Backhendl",
         "Hendl"),
        ("Entenei",),
    ),
    Group(
        "meat_lamb", KIND_MEAT, "Lamm & Schaf", "Lamb & mutton",
        ("Lamm", "Schaf", "Hammel"),
        ("Flammkuchen", "Schafgarbe"),
    ),
    Group(
        "meat_game", KIND_MEAT, "Wild", "Game",
        ("Wild", "Reh", "Rehrücken", "Rehkeule", "Rehragout", "Hirsch", "Hase", "Kaninchen", "Wildschwein", "Gams", "Fasan"),
        ("Wildreis", "Wildkräuter", "Haselnuss", "Haselnüsse", "Wildlachs"),
    ),
    Group(
        "fish", KIND_MEAT, "Fisch", "Fish",
        ("Fisch", "Lachs", "Forelle", "Zander", "Kabeljau", "Seelachs", "Thunfisch", "Dorsch",
         "Hering", "Makrele", "Sardine", "Sardelle", "Karpfen", "Saibling", "Scholle", "Tilapia",
         "Pangasius", "Heilbutt", "Rotbarsch", "Sardellen", "Anchovis", "Wels", "Barsch"),
        ("Lachsschinken",),
    ),
    Group(
        "seafood", KIND_MEAT, "Meeresfrüchte", "Seafood",
        ("Garnele", "Shrimp", "Krabbe", "Krebs", "Hummer", "Languste", "Scampi", "Muschel",
         "Tintenfisch", "Calamari", "Oktopus", "Austern", "Meeresfrüchte"),
    ),
    # ------------------------------------------------------------------ Allergene
    Group(
        "gluten", KIND_ALLERGEN, "Gluten (Weizen, Dinkel, Roggen, Gerste, Hafer)",
        "Gluten (wheat, spelt, rye, barley, oats)",
        ("Weizen", "Dinkel", "Roggen", "Gerste", "Hafer", "Mehl", "Grieß", "Brot", "Semmel", "Brösel",
         "Nudel", "Spaghetti", "Penne", "Fusilli", "Linguine", "Tagliatelle", "Makkaroni", "Lasagne",
         "Cannelloni", "Tortellini", "Ravioli", "Gnocchi", "Spätzle", "Fleckerl", "Knödel", "Nockerl",
         "Couscous", "Bulgur", "Baguette", "Ciabatta", "Toast", "Tortilla", "Pizza", "Teig", "Cracker",
         "Granola", "Müsli", "Bier", "Sojasauce", "Brötchen", "Cornflakes", "Ramen", "Palatschinken",
         "Croutons", "Zwieback", "Keks", "Kuchen", "Panko", "Seitan", "Malz", "Graupen", "Pasta",
         "Wraps", "Kaiserschmarrn", "Strudel", "japanische Currypaste"),
        ("Reisnudel", "Reisbandnudel", "Glasnudel", "Schmalz", "Reismehl", "Maismehl", "Kichererbsenmehl", "Buchweizen",
         "Reispapier", "mehlig", "glutenfrei", "Kartoffelmehl"),
    ),
    Group(
        "crustaceans", KIND_ALLERGEN, "Krebstiere", "Crustaceans",
        ("Garnele", "Shrimp", "Krabbe", "Krebs", "Hummer", "Languste", "Scampi"),
    ),
    Group(
        "eggs", KIND_ALLERGEN, "Eier", "Eggs",
        ("Ei", "Eier", "Eigelb", "Eiklar", "Eiweiß", "Dotter", "Mayonnaise", "Aioli", "Eiernudeln",
         "Bandnudeln", "Tagliatelle", "Fleckerl", "Spätzle", "Tortellini", "Nockerl", "Palatschinken",
         "Semmelknödel", "Spinatknödel", "Eierlikör", "Baiser"),
        ("Eierschwammerl", "Reisbandnudel"),
    ),
    Group("peanuts", KIND_ALLERGEN, "Erdnüsse", "Peanuts", ("Erdnuss", "Erdnüsse")),
    Group(
        "soy", KIND_ALLERGEN, "Soja", "Soy",
        ("Soja", "Tofu", "Edamame", "Miso", "Tempeh", "Teriyaki", "Gochujang"),
        ("Sojasprossen",),
    ),
    Group(
        "milk", KIND_ALLERGEN, "Milch (inkl. Laktose)", "Milk (incl. lactose)",
        ("Milch", "Sahne", "Rahm", "Butter", "Käse", "Joghurt", "Quark", "Crème fraîche", "Schmand",
         "Mascarpone", "Mozzarella", "Parmesan", "Feta", "Ricotta", "Cheddar", "Gouda", "Emmentaler",
         "Frischkäse", "Molke", "Kefir", "Ghee", "Liptauer", "Vanillesauce", "Schokolade", "Pesto",
         "Palatschinken", "Burrata", "Halloumi", "Pecorino", "Gorgonzola", "Camembert", "Brie"),
        ("Kokosmilch", "Mandelmilch", "Hafermilch", "Sojamilch", "Reismilch", "Erdnussbutter",
         "Kakaobutter", "Leberkäse", "Milchreis", "laktosefrei", "vegan"),
    ),
    Group(
        "nuts", KIND_ALLERGEN, "Schalenfrüchte (Nüsse)", "Tree nuts",
        ("Nuss", "Nüsse", "Mandel", "Cashew", "Pistazie", "Pekan", "Macadamia", "Studentenfutter",
         "Marzipan", "Nougat", "Krokant"),
        ("Erdnuss", "Erdnüsse", "Muskat", "Kokos"),
    ),
    Group(
        "celery", KIND_ALLERGEN, "Sellerie", "Celery",
        ("Sellerie", "Gemüsesuppe", "Rindsuppe", "Hühnersuppe", "Suppenwürfel", "Suppenwürze",
         "Brühe", "Fond"),
    ),
    Group("mustard", KIND_ALLERGEN, "Senf", "Mustard", ("Senf", "Mayonnaise", "Remoulade")),
    Group("sesame", KIND_ALLERGEN, "Sesam", "Sesame", ("Sesam", "Tahini", "Hummus")),
    Group(
        "sulphites", KIND_ALLERGEN, "Sulfite (Wein, Trockenobst)", "Sulphites (wine, dried fruit)",
        ("Wein", "Sekt", "Balsamico", "Rosinen", "Trockenobst", "getrocknete Marillen",
         "getrocknete Aprikosen"),
        ("Weintrauben", "Schwein", "Weinblätter"),
    ),
    Group("lupin", KIND_ALLERGEN, "Lupinen", "Lupin", ("Lupine",)),
    Group(
        "molluscs", KIND_ALLERGEN, "Weichtiere", "Molluscs",
        ("Muschel", "Tintenfisch", "Calamari", "Oktopus", "Schnecke", "Austern"),
    ),
)

GROUPS: dict[str, Group] = {g.id: g for g in _GROUPS}
GROUP_IDS: tuple[str, ...] = tuple(GROUPS)


_Normalized = tuple[tuple[str, ...], str]


def _joined(name: str) -> _Normalized:
    """Wortstämme (für Ganzwort-Vergleich) und zusammengefügte ganze Wörter.

    Ein "=" am Anfang erzwingt den Ganzwort-Vergleich (leerer zweiter Wert).
    """
    if name.startswith("="):
        return normalize_tokens(name[1:]), ""
    return normalize_tokens(name), "".join(normalize_tokens(name, stem=False))


@lru_cache(maxsize=None)
def _group_patterns(group_id: str) -> tuple[tuple[_Normalized, ...], tuple[_Normalized, ...]]:
    group = GROUPS[group_id]
    return tuple(_joined(t) for t in group.terms), tuple(_joined(t) for t in group.exceptions)


def _loose(pattern: _Normalized, ingredient: _Normalized) -> bool:
    """Begriff im Zutatennamen enthalten.

    Ohne Stammbildung verglichen, damit z. B. "Puten" in "Putenbrust" und "Wein"
    in "Weißwein" gefunden werden. Begriffe unter 4 Zeichen ("Ei", "Reh") müssen
    einem ganzen Wort entsprechen.
    """
    term_stems, term_raw = pattern
    ing_stems, ing_raw = ingredient
    if not term_stems or not ing_stems:
        return False
    if len(term_raw) < 4:
        return len(term_stems) == 1 and term_stems[0] in ing_stems
    return term_raw in ing_raw


@lru_cache(maxsize=16384)
def in_group(group_id: str, ingredient_name: str) -> bool:
    """Gehört die Zutat zur Gruppe?"""
    if group_id not in GROUPS:
        return False
    ingredient = _joined(ingredient_name)
    terms, exceptions = _group_patterns(group_id)
    if any(_loose(e, ingredient) for e in exceptions):
        return False
    return any(_loose(t, ingredient) for t in terms)


def matching_group(group_ids: list[str], ingredient_name: str) -> str | None:
    """Erste der Gruppen, zu der die Zutat gehört."""
    return next((g for g in group_ids if in_group(g, ingredient_name)), None)


def group_overview(ingredient_names: Iterable[str], excluded: list[str]) -> list[dict[str, Any]]:
    """Alle Gruppen mit Anzahl und Beispielen der betroffenen Zutaten."""
    names = sorted(set(ingredient_names), key=str.casefold)
    result = []
    for group in GROUPS.values():
        members = [n for n in names if in_group(group.id, n)]
        result.append(
            {
                **group.to_dict(),
                "excluded": group.id in excluded,
                "count": len(members),
                "members": members,
            }
        )
    return result
