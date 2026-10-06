"""Normalisierung von Zutatennamen und Einheiten sowie Parsen von Zutatenzeilen."""

from __future__ import annotations

from fractions import Fraction
import math
import re

from .models import ROLE_OTHER, ROLE_PROTEIN, ROLE_SIDE, ROLE_VEG, Ingredient

# --------------------------------------------------------------------------- Namen

_UMLAUTS = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "é": "e", "è": "e"})

# Regionale Varianten (v. a. österreichisch) -> gemeinsame Form. Wird auf
# Wortteile angewendet, daher werden z. B. auch "Paradeisersauce" erkannt.
# Reine Sprachvarianten, keine Ernährungsregeln.
SYNONYMS: dict[str, str] = {
    "paradeiser": "tomate",
    "erdaepfel": "kartoffel",
    "erdapfel": "kartoffel",
    "topfen": "quark",
    "schlagobers": "schlagsahne",
    "obers": "sahne",
    "faschiertes": "hackfleisch",
    "faschierte": "hackfleisch",
    "faschiert": "hackfleisch",
    "karfiol": "blumenkohl",
    "melanzani": "aubergine",
    "kren": "meerrettich",
    "marillen": "aprikose",
    "marille": "aprikose",
    "schwammerl": "pilz",
    "mohrruebe": "karotte",
    "moehre": "karotte",
    "haehnchen": "huhn",
    "huehner": "huhn",
    "haendl": "huhn",
    "kohlsprossen": "rosenkohl",
    "kukuruz": "mais",
    "ribisel": "johannisbeere",
    "fisolen": "bohne",
    "fisole": "bohne",
}
_SYNONYM_KEYS = sorted(SYNONYMS, key=len, reverse=True)

# Unregelmäßige Plurale (Wortende -> Ersatz).
_IRREGULAR_SUFFIXES: tuple[tuple[str, str], ...] = (
    ("aepfel", "apfel"),
    ("nuesse", "nuss"),
    ("eier", "ei"),
)

_NON_WORD = re.compile(r"[^a-z0-9 ]+")
_SPACES = re.compile(r"\s+")


def _stem(token: str) -> str:
    """Sehr einfache Grundform für deutsche Zutatenwörter.

    Ziel ist nur, dass Singular und Plural auf dieselbe Form fallen
    ("Karotten"/"Karotte", "Zwiebeln"/"Zwiebel"), nicht linguistische Korrektheit.
    """
    for suffix, replacement in _IRREGULAR_SUFFIXES:
        if token.endswith(suffix):
            return token[: -len(suffix)] + replacement
    if len(token) > 4 and token.endswith("n"):
        token = token[:-1]
    if len(token) > 3 and token.endswith("e"):
        token = token[:-1]
    return token


def _apply_synonyms(token: str) -> str:
    for key in _SYNONYM_KEYS:
        if key in token:
            token = token.replace(key, SYNONYMS[key])
    return token


def normalize_tokens(name: str, stem: bool = True) -> tuple[str, ...]:
    """Zerlege einen Zutatennamen in normalisierte Wort-Stämme (oder ganze Wörter)."""
    text = name.lower().translate(_UMLAUTS).replace("-", " ")
    text = _NON_WORD.sub(" ", text)
    tokens = (_apply_synonyms(t) for t in _SPACES.split(text.strip()) if t)
    return tuple(_stem(t) if stem else t for t in tokens)


def normalize_name(name: str) -> str:
    """Normalisierter Schlüssel eines Zutatennamens (z. B. zum Zusammenfassen)."""
    return " ".join(normalize_tokens(name))


def matches_strict(term: str, ingredient: str) -> bool:
    """Positiver Abgleich (z. B. "verträglich"): genau oder als Wortende.

    "Reis" passt auf "Basmatireis", aber nicht auf "Reisnudeln" oder "Haferbrei".
    Begriffe unter 4 Zeichen müssen exakt einem Wort entsprechen.
    """
    term_tokens = normalize_tokens(term)
    ing_tokens = normalize_tokens(ingredient)
    if not term_tokens or not ing_tokens:
        return False
    if term_tokens == ing_tokens:
        return True
    if len(term_tokens) == 1:
        t = term_tokens[0]
        if len(t) < 4:
            return t in ing_tokens
        return any(tok.endswith(t) for tok in ing_tokens)
    return " ".join(term_tokens) in " ".join(ing_tokens)


def matches_loose(term: str, ingredient: str) -> bool:
    """Vorsichtiger Abgleich (z. B. "nicht verträglich"): Begriff irgendwo enthalten.

    "Zwiebel" passt auch auf "Zwiebelpulver". Begriffe unter 4 Zeichen müssen
    exakt einem Wort entsprechen, damit z. B. "Ei" nicht in "Reis" gefunden wird.
    """
    term_tokens = normalize_tokens(term)
    ing_tokens = normalize_tokens(ingredient)
    if not term_tokens or not ing_tokens:
        return False
    if len(term_tokens) == 1 and len(term_tokens[0]) < 4:
        return term_tokens[0] in ing_tokens
    return "".join(term_tokens) in "".join(ing_tokens)


# ------------------------------------------------------------------------ Einheiten

_UNIT_ALIASES: dict[str, str] = {
    "g": "g", "gr": "g", "gramm": "g",
    "kg": "kg", "kilo": "kg", "kilogramm": "kg",
    "mg": "mg",
    "ml": "ml", "milliliter": "ml",
    "cl": "cl", "dl": "dl",
    "l": "l", "liter": "l",
    "el": "EL", "essl": "EL", "essloeffel": "EL",
    "tl": "TL", "teel": "TL", "teeloeffel": "TL",
    "stk": "Stk", "st": "Stk", "stueck": "Stk", "stuck": "Stk",
    "prise": "Prise", "prisen": "Prise",
    "bund": "Bund",
    "dose": "Dose", "dosen": "Dose",
    "pkg": "Pkg", "pck": "Pkg", "packung": "Pkg", "packungen": "Pkg", "pkt": "Pkg",
    "zehe": "Zehe", "zehen": "Zehe",
    "scheibe": "Scheibe", "scheiben": "Scheibe",
    "becher": "Becher",
    "tasse": "Tasse", "tassen": "Tasse",
    "handvoll": "Handvoll",
    "glas": "Glas", "glaeser": "Glas",
    "msp": "Msp",
}

# Einheit -> (Basiseinheit, Faktor)
_BASE_UNITS: dict[str, tuple[str, float]] = {
    "g": ("g", 1), "kg": ("g", 1000), "mg": ("g", 0.001),
    "ml": ("ml", 1), "l": ("ml", 1000), "cl": ("ml", 10), "dl": ("ml", 100),
}

# Einheiten, die beim Einkaufen nur ganz gekauft werden können.
_WHOLE_UNITS = {"Stk", "Dose", "Pkg", "Bund", "Zehe", "Becher", "Glas", "Scheibe"}


def normalize_unit(unit: str | None) -> str | None:
    """Vereinheitliche eine Einheitenangabe; unbekannte Einheiten bleiben erhalten."""
    if unit is None:
        return None
    key = unit.strip().lower().translate(_UMLAUTS).rstrip(".")
    if not key:
        return None
    return _UNIT_ALIASES.get(key, unit.strip())


def is_known_unit(unit: str) -> bool:
    return unit.strip().lower().translate(_UMLAUTS).rstrip(".") in _UNIT_ALIASES


def to_base(amount: float, unit: str | None) -> tuple[float, str]:
    """Rechne eine Menge in die Basiseinheit um (g, ml oder die Einheit selbst)."""
    unit = normalize_unit(unit) or "Stk"
    if unit in _BASE_UNITS:
        base, factor = _BASE_UNITS[unit]
        return amount * factor, base
    return amount, unit


def round_for_shopping(amount: float, unit: str) -> float:
    """Runde eine Einkaufsmenge sinnvoll (ganze Stück, ganze Gramm, halbe Löffel)."""
    if unit in _WHOLE_UNITS:
        return float(math.ceil(amount - 1e-9))
    if unit in ("g", "ml"):
        return float(math.ceil(amount - 1e-9))
    return math.ceil(amount * 2 - 1e-9) / 2


def format_amount(amount: float, unit: str) -> str:
    """Formatiere eine Menge in Basiseinheit lesbar (1500 g -> "1,5 kg")."""
    if unit == "g" and amount >= 1000:
        amount, unit = amount / 1000, "kg"
    elif unit == "ml" and amount >= 1000:
        amount, unit = amount / 1000, "l"
    if amount == int(amount):
        text = str(int(amount))
    else:
        text = f"{amount:.2f}".rstrip("0").rstrip(".").replace(".", ",")
    return f"{text} {unit}"


# ----------------------------------------------------------------- Zutatenzeilen

_ROLE_MARKERS: dict[str, str] = {
    "protein": ROLE_PROTEIN, "eiweiss": ROLE_PROTEIN,
    "beilage": ROLE_SIDE, "side": ROLE_SIDE,
    "gemuese": ROLE_VEG, "veg": ROLE_VEG,
    "sonstiges": ROLE_OTHER, "other": ROLE_OTHER,
}
ROLE_LABELS_DE: dict[str, str] = {
    ROLE_PROTEIN: "protein", ROLE_SIDE: "beilage", ROLE_VEG: "gemuese",
}

_AMOUNT_RE = re.compile(
    r"^\s*(?P<amount>\d+\s+\d+/\d+|\d+(?:[.,]\d+)?(?:\s*/\s*\d+)?|[½¼¾])"
    r"(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?"  # Bereich "2-3": erster Wert zählt
    r"\s*(?P<rest>.*)$"
)
_ROLE_RE = re.compile(r"\s*#(\w+)\s*$")
_VULGAR = {"½": 0.5, "¼": 0.25, "¾": 0.75}


def _parse_number(text: str) -> float:
    text = text.strip()
    if text in _VULGAR:
        return _VULGAR[text]
    if " " in text and "/" in text:  # "1 1/2"
        whole, frac = text.split(None, 1)
        return float(whole) + float(Fraction(frac.replace(" ", "")))
    if "/" in text:
        return float(Fraction(text.replace(" ", "")))
    return float(text.replace(",", "."))


def parse_ingredient_line(line: str) -> Ingredient | None:
    """Lies eine Zutat aus einer Zeile wie "250 g Hühnerbrust #protein".

    Unterstützt: "2 Karotten", "1/2 TL Salz", "1,5 kg Kartoffeln", "Salz",
    "2-3 Zehen Knoblauch", optional eine Rolle als "#protein", "#beilage",
    "#gemuese" am Zeilenende.
    """
    text = line.strip().lstrip("-*•").strip()
    if not text:
        return None
    role = ROLE_OTHER
    role_match = _ROLE_RE.search(text)
    if role_match:
        marker = role_match.group(1).lower().translate(_UMLAUTS)
        if marker in _ROLE_MARKERS:
            role = _ROLE_MARKERS[marker]
            text = text[: role_match.start()].strip()

    amount: float | None = None
    unit: str | None = None
    match = _AMOUNT_RE.match(text)
    if match and match.group("rest"):
        amount = _parse_number(match.group("amount"))
        rest = match.group("rest").strip()
        first, _, remainder = rest.partition(" ")
        if remainder and is_known_unit(first):
            unit = normalize_unit(first)
            rest = remainder.strip()
        text = rest
    if not text:
        return None
    return Ingredient(name=text, amount=amount, unit=unit, role=role)


def format_ingredient_line(ingredient: Ingredient) -> str:
    """Gegenstück zu parse_ingredient_line (für Bearbeitungsformulare)."""
    parts: list[str] = []
    if ingredient.amount is not None:
        amount = ingredient.amount
        parts.append(
            str(int(amount)) if amount == int(amount) else str(amount).replace(".", ",")
        )
        if ingredient.unit:
            parts.append(ingredient.unit)
    parts.append(ingredient.name)
    if ingredient.role in ROLE_LABELS_DE:
        parts.append(f"#{ROLE_LABELS_DE[ingredient.role]}")
    return " ".join(parts)
