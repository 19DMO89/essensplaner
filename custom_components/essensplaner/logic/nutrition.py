"""Ernährungsrichtungen (proteinreich, ballaststoffreich, …) und grobe Nährwertschätzung.

Ob ein Gericht zu einer Richtung passt, steht in seinen Tags ("proteinreich",
"low carb", …). Die Tags lassen sich von Hand setzen; ``estimate_dish`` schlägt
sie anhand der Zutaten vor. Die Schätzung nutzt eine kleine Tabelle typischer
Nährwerte je 100 g und Standardgewichte für Stück, Dose, Löffel usw. – sie ist
eine Orientierung, keine Nährwertberechnung.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass
from functools import lru_cache
from typing import Any

from .groups import _joined, _loose
from .models import MEAL_DINNER, MEAL_LUNCH, Dish, Ingredient
from .normalize import normalize_name, normalize_unit, to_base

DIR_PROTEIN = "protein"
DIR_FIBER = "fiber"
DIR_LOW_CARB = "low_carb"
DIR_LIGHT = "light"
DIR_LOW_FAT = "low_fat"
DIRECTIONS: tuple[str, ...] = (DIR_PROTEIN, DIR_FIBER, DIR_LOW_CARB, DIR_LIGHT, DIR_LOW_FAT)

# Tag, der beim Gericht gesetzt wird, und weitere Schreibweisen, die erkannt werden.
DIRECTION_TAGS: dict[str, str] = {
    DIR_PROTEIN: "proteinreich",
    DIR_FIBER: "ballaststoffreich",
    DIR_LOW_CARB: "low carb",
    DIR_LIGHT: "leicht",
    DIR_LOW_FAT: "fettarm",
}
TAG_ALIASES: dict[str, str] = {
    "eiweissreich": DIR_PROTEIN,
    "high protein": DIR_PROTEIN,
    "lowcarb": DIR_LOW_CARB,
    "kohlenhydratarm": DIR_LOW_CARB,
    "kalorienarm": DIR_LIGHT,
    "light": DIR_LIGHT,
    "low fat": DIR_LOW_FAT,
    "wenig fett": DIR_LOW_FAT,
}
_TAG_TO_DIRECTION: dict[str, str] = {
    normalize_name(tag): direction
    for tag, direction in (
        *((t, d) for d, t in DIRECTION_TAGS.items()),
        *TAG_ALIASES.items(),
    )
}


def tag_direction(tag: str) -> str | None:
    """Richtung, für die ein Tag steht (oder None)."""
    return _TAG_TO_DIRECTION.get(normalize_name(tag))


def dish_directions(dish: Dish) -> set[str]:
    """Richtungen eines Gerichts laut seinen Tags."""
    return {d for t in dish.tags if (d := tag_direction(t))}


def with_direction_tags(tags: list[str], directions: Iterable[str]) -> list[str]:
    """Tags um fehlende Richtungs-Tags ergänzen (vorhandene bleiben unverändert)."""
    have = {tag_direction(t) for t in tags}
    return [*tags, *(DIRECTION_TAGS[d] for d in DIRECTIONS if d in directions and d not in have)]


# ------------------------------------------------------------------ Nährwerte


@dataclass(frozen=True)
class Food:
    """Typische Nährwerte je 100 g und Standardgewichte in Gramm."""

    terms: tuple[str, ...]
    kcal: float
    protein: float
    fat: float
    carbs: float
    fiber: float
    piece: float = 100  # 1 Stück
    can: float = 0  # 1 Dose / 1 Glas (Abtropfgewicht)
    slice: float = 25  # 1 Scheibe
    pkg: float = 250  # 1 Packung


def _f(terms: str, kcal: float, protein: float, fat: float, carbs: float, fiber: float, **kw: float) -> Food:
    return Food(tuple(t.strip() for t in terms.split(",")), kcal, protein, fat, carbs, fiber, **kw)


# Werte gerundet nach üblichen Nährwerttabellen; Nudeln, Reis, Linsen usw. roh.
# Bei mehreren passenden Einträgen gewinnt der längste Begriff
# ("Erdnussbutter" vor "Butter", "Süßkartoffel" vor "Kartoffel").
FOODS: tuple[Food, ...] = (
    # --- Fleisch
    _f("Huhn, Hühnerbrust, Hähnchenbrust, Pute, Putenbrust, Putenschnitzel, Truthahn", 110, 23, 1.5, 0, 0, piece=150),
    _f("Hühnerkeule, Hühnerkeulen ohne Knochen, Hühnerteile, Hendl", 170, 18, 11, 0, 0, piece=250),
    _f("Putenfaschiertes, Putenhackfleisch", 150, 20, 8, 0, 0),
    _f("Rind, Rindfleisch, Rinderhüfte, Beiried, Tafelspitz, Rindsrouladen, Rindswadschinken, Suppenfleisch, Kalb, Kalbfleisch, Kalbsschulter",
       140, 21, 6, 0, 0, piece=150, slice=180),
    _f("Kalbsschnitzel", 105, 21, 2, 0, 0, piece=130),
    _f("Hackfleisch, Rinderhackfleisch", 240, 19, 18, 0, 0),
    _f("Schweinefaschiertes, Schweinehackfleisch, Lammfaschiertes", 260, 17, 21, 0, 0),
    _f("Schwein, Schweinsschnitzel, Schweinsschulter, Schweinsbraten, Lamm, Lammschulter", 200, 19, 14, 0, 0, piece=150),
    _f("Schweinsripperl", 290, 17, 25, 0, 0),
    _f("Rindsleber, Leber", 130, 20, 4, 4, 0),
    _f("Speck, Frühstücksspeck, Geselchtes, Selchfleisch", 380, 15, 35, 0, 0, slice=10),
    _f("Schinken, Putenschinken, Kochschinken", 120, 20, 4, 1, 0, slice=20),
    _f("Rohschinken", 250, 25, 17, 0, 0, slice=15),
    _f("Wurst, Würstel, Bratwürstel, Bratwurst, Frankfurter, Extrawurst, Salami",
       290, 13, 26, 1, 0, piece=60, slice=25),
    _f("Leberkäse", 290, 12, 26, 1, 0, slice=100),
    # --- Fisch
    _f("Fisch, Kabeljau, Kabeljaufilet, Seelachs, Seelachsfilet, Zander, Zanderfilet, Forelle, Forellenfilet, Lachsforellenfilet, Dorsch",
       90, 19, 1.5, 0, 0, piece=150),
    _f("Lachs, Lachsfilet", 200, 20, 13, 0, 0, piece=125),
    _f("Thunfisch", 110, 25, 1, 0, 0, can=140),
    _f("Garnele, Shrimps", 85, 18, 1, 1, 0),
    _f("Fischstäbchen", 190, 12, 8, 17, 1, piece=30),
    # --- Eier, Milchprodukte
    _f("=Ei", 140, 12.5, 10, 0.5, 0, piece=55),
    _f("Milch", 64, 3.4, 3.5, 4.8, 0),
    _f("Haferdrink", 45, 0.7, 1.5, 7, 0.8),
    _f("Joghurt, Naturjoghurt", 65, 4, 3.5, 4.5, 0, can=250),
    _f("griechischer Joghurt", 120, 6, 10, 4, 0, can=250),
    _f("Quark, Topfen", 75, 12, 0.3, 4, 0, pkg=250),
    _f("Hüttenkäse", 100, 12, 4, 3, 0, pkg=200),
    _f("Ricotta", 150, 9, 11, 3, 0),
    _f("Sahne, Schlagsahne, Schlagobers", 300, 2.4, 31, 3.3, 0, can=200),
    _f("Sauerrahm, Crème fraîche, Schmand", 190, 3, 18, 4, 0, can=250),
    _f("Vanillesauce", 110, 3, 3, 18, 0),
    _f("Butter", 740, 0.7, 82, 0.6, 0),
    _f("Käse, Bergkäse, Pinzgauer Käse, Cheddar, Gouda, Emmentaler, Camembert, Ziegenkäse",
       370, 26, 29, 0, 0, piece=125, slice=20),
    _f("Parmesan", 390, 33, 28, 0, 0),
    _f("Mozzarella", 250, 18, 19, 1, 0, piece=125),
    _f("Feta", 260, 17, 21, 0, 0, pkg=200),
    _f("Frischkäse", 250, 6, 23, 3, 0),
    _f("Liptauer", 230, 10, 19, 4, 0),
    # --- Pflanzliche Eiweißquellen
    _f("Tofu", 125, 13, 7, 2, 1, pkg=200),
    _f("Seidentofu", 55, 5, 3, 1.5, 0.3, pkg=300),
    _f("rote Linsen", 340, 25, 1.5, 48, 11),
    _f("Linsen, Berglinsen, Tellerlinsen", 320, 24, 1.5, 48, 17),
    _f("Kichererbse", 130, 7, 2.5, 16, 6, can=240),
    _f("Kidneybohne, schwarze Bohne, weiße Bohne, Käferbohne", 100, 7, 0.5, 13, 6.5, can=250),
    _f("getrocknete Erbsen, Schälerbsen", 330, 23, 1.5, 50, 16),
    _f("Edamame", 120, 11, 5, 9, 5),
    _f("Hummus", 230, 7, 17, 13, 5),
    _f("Erdnussbutter", 600, 25, 50, 15, 6),
    _f("Erdnüsse, Mandeln, Haselnüsse, Walnüsse, Nüsse, Studentenfutter, Pinienkerne", 600, 20, 52, 10, 8),
    _f("Kürbiskerne, Sesam, Leinsamen, Chiasamen, Sonnenblumenkerne, Mohn, Tahini", 520, 22, 42, 10, 20),
    _f("Kokosraspel", 650, 6, 62, 7, 16),
    # --- Getreide, Beilagen (roh)
    _f("Nudeln, Spaghetti, Penne, Fusilli, Bandnudeln, Tagliatelle, Linguine, Makkaroni, Cannelloni, Lasagneblätter, Fleckerl, Fadennudeln, Suppennudeln, kleine Nudeln, Mie-Nudeln, Ramen-Nudeln, Udon-Nudeln",
       355, 12, 1.5, 70, 3),
    _f("Vollkornnudeln, Soba-Nudeln", 340, 13, 2.5, 62, 8),
    _f("Reisnudeln, Reisbandnudeln, Glasnudeln, Reispapierblätter", 360, 6, 0.5, 80, 1, piece=10),
    _f("Tortellini, Gnocchi, Spätzle, Nockerl", 200, 7, 4, 35, 2),
    _f("Reis, Basmatireis, Jasminreis, Risottoreis, Paellareis, Sushireis, Milchreis", 350, 7, 0.6, 78, 1.4),
    _f("Naturreis, Vollkornreis", 350, 7.5, 2.5, 73, 3.5),
    _f("Couscous, Bulgur, Grieß, Polenta", 355, 12, 1.5, 70, 5),
    _f("Quinoa, Buchweizen, Hirse", 360, 13, 5, 64, 7),
    _f("Haferflocken, Müsli", 370, 13, 7, 59, 10),
    _f("Granola", 450, 9, 17, 62, 7),
    _f("Cornflakes", 380, 7, 1, 84, 3),
    _f("Popcornmais", 375, 11, 4, 64, 13),
    _f("Mehl, Weizenmehl, Speisestärke, Semmelbrösel", 350, 10, 1, 72, 3),
    _f("Vollkornmehl, Buchweizenmehl", 330, 12, 2, 61, 10),
    _f("Brot, Weißbrot, Toastbrot, Brötchen, Knödelbrot",
       260, 8.5, 2.5, 50, 3, piece=60, slice=35),
    _f("Baguette, Ciabatta, Fladenbrot", 260, 8.5, 2.5, 50, 3, piece=250),
    _f("Semmel, Burgerbrötchen", 270, 8.5, 2.5, 52, 3, piece=55),
    _f("Zwieback", 390, 10, 5, 75, 5, piece=10),
    _f("Vollkornbrot, Schwarzbrot, Bauernbrot", 220, 7, 1.5, 40, 7.5, piece=60, slice=45),
    _f("Tortilla, Taco-Schalen, Wraps", 300, 8, 7, 50, 3, piece=60),
    _f("Vollkorn-Tortillas", 290, 9, 7, 45, 7, piece=60),
    _f("Nachos, Cracker, Reiswaffeln", 470, 7, 20, 64, 4, piece=8),
    _f("Semmelknödel", 210, 7, 6, 32, 2, piece=90),
    _f("Palatschinken", 200, 7, 7, 27, 1, piece=60),
    _f("Blätterteig, Mürbteig, Strudelteig, Flammkuchenteig", 380, 6, 22, 40, 2, pkg=270),
    _f("Kartoffel, Erdäpfelteig", 75, 2, 0.1, 16, 2, piece=150),
    _f("Süßkartoffel", 86, 1.6, 0.1, 20, 3, piece=300),
    # --- Gemüse, Pilze
    _f("Gemüse, Zucchini, Gurke, Paprika, Kirschtomate, Melanzani, Aubergine, Sellerie, Fenchel, Lauch, Radieschen, Pak Choi, Sojasprossen, Spargel",
       22, 1.2, 0.2, 3.5, 1.5, piece=200),
    _f("Tomate", 18, 1, 0.2, 2.6, 1.2, piece=100, can=400),
    _f("passierte Tomaten, gehackte Tomaten", 25, 1.3, 0.2, 4, 1.2, can=400),
    _f("Tomatenmark, Ajvar, Salsa", 80, 3, 1, 13, 3),
    _f("Spinat, Blattspinat, Babyspinat, Rucola, Salat, Häuptelsalat, Römersalat, Vogerlsalat, Eisbergsalat, Kresse",
       18, 2, 0.3, 1.5, 2, piece=300),
    _f("Brokkoli, Blumenkohl, Rosenkohl, Weißkraut, Rotkraut, Kohl, Sauerkraut", 28, 2.8, 0.3, 3, 3, piece=500),
    _f("Bohne, grüne Bohnen, Zuckerschoten", 32, 2.4, 0.2, 5, 3),
    _f("Erbse", 80, 6, 0.5, 11, 5),
    _f("Mais", 85, 3, 1.2, 15, 3, can=140),
    _f("Karotte, gelbe Rübe, Pastinake, Petersilienwurzel, rote Rübe", 38, 1, 0.2, 7, 3, piece=80),
    _f("Kürbis, Hokkaidokürbis", 40, 1.5, 0.2, 8, 2.5),
    _f("Zwiebel, rote Zwiebel, Frühlingszwiebel", 30, 1.2, 0.1, 5, 1.8, piece=80),
    _f("Pilz, Champignon", 22, 3, 0.3, 0.5, 2, piece=40),
    _f("Avocado", 200, 2, 20, 2, 7, piece=150),
    _f("Oliven", 140, 1, 14, 1, 4),
    _f("Essiggurke, Kapern", 15, 0.6, 0.2, 2, 1, piece=30),
    _f("Wakame, Algen", 45, 3, 0.6, 9, 0.5),
    # --- Obst
    _f("Obst, Apfel, Äpfel, Birne, Orange, Mango, Kiwi, Marille, Aprikose, Ananas, Weintraube, Beere, Erdbeere, Zwetschke, Pflaume",
       55, 0.6, 0.3, 12, 2.5, piece=150, can=260),
    _f("Banane", 90, 1.2, 0.2, 20, 2, piece=120),
    _f("Zitrone, Limette", 35, 0.7, 0.3, 3, 1, piece=80),
    _f("Apfelmus, Zwetschkenröster, Powidl", 90, 0.4, 0.2, 21, 2),
    _f("Datteln, Rosinen", 290, 2.5, 0.5, 66, 8),
    # --- Fette, Saucen, Süßes
    _f("=Öl, Olivenöl, Sesamöl, Kürbiskernöl, Rapsöl, Sonnenblumenöl, Pflanzenöl, Speiseöl, Kokosöl, Butterschmalz, Schmalz",
       890, 0, 99, 0, 0),
    _f("Kokosmilch", 180, 1.8, 18, 3, 0, can=400),
    _f("Mayonnaise", 680, 1, 75, 2, 0),
    _f("Pesto", 450, 5, 45, 5, 2, can=190),
    _f("Ketchup", 110, 1.5, 0.2, 25, 0.5),
    _f("Currypaste, Misopaste, Gochujang, Chili-Bohnenpaste", 150, 5, 6, 18, 4),
    _f("Zucker, Honig, Ahornsirup, Marmelade, Preiselbeeren", 330, 0.2, 0, 82, 0.5, piece=3, pkg=8),
    _f("Schokolade", 530, 6, 31, 54, 6),
    _f("Kakao", 380, 20, 21, 10, 33),
    _f("Bier", 42, 0.5, 0, 3, 0),
    _f("Apfelsaft", 46, 0.1, 0.1, 11, 0),
    _f("Weißwein, Rotwein", 75, 0, 0, 2.5, 0),
    _f("Suppe, Hühnersuppe, Rindsuppe, Gemüsesuppe, Brühe, Fond", 5, 0.5, 0.2, 0.5, 0),
    # Würzmittel und Kräuter zählen nicht.
    _f("Salz, Pfeffer, Wasser, Essig, Balsamico, Mirin, Sojasauce, Fischsauce, Austernsauce, Senf, Kren, Meerrettich, Tamarindenpaste, "
       "Trockenhefe, Hefe, Backpulver, Natron, Vanillezucker, Safran, Ingwer, Knoblauch, Gewürz, Currypulver, Chilipulver, "
       "Paprikapulver, Kreuzkümmel, Kurkuma, Zimt, Oregano, Thymian, Majoran, Rosmarin, Muskat, Garam Masala, Chiliflocken, "
       "Pfefferkörner, Kümmel, Sternanis, Lorbeer, Dill, Petersilie, Schnittlauch, Basilikum, Koriander, Minze, Kerbel, Salbei, Kräuter",
       0, 0, 0, 0, 0),
)

# Gramm je Einheit, die nicht vom Lebensmittel abhängt.
_UNIT_GRAMS: dict[str, float] = {
    "EL": 12, "TL": 4, "Prise": 0, "Msp": 0, "Zehe": 4,
    "Bund": 30, "Handvoll": 30, "Becher": 200, "Tasse": 150,
}


@lru_cache(maxsize=1)
def _food_patterns() -> tuple[tuple[Any, int, Food], ...]:
    """Normalisierte Begriffe mit ihrer Länge (für "längster Treffer gewinnt")."""
    result = []
    for food in FOODS:
        for term in food.terms:
            pattern = _joined(term)
            result.append((pattern, len(pattern[1] or "".join(pattern[0])), food))
    return tuple(result)


@lru_cache(maxsize=8192)
def find_food(name: str) -> Food | None:
    """Tabelleneintrag für eine Zutat (oder None, wenn unbekannt)."""
    ingredient = _joined(name)
    best: tuple[int, Food] | None = None
    for pattern, length, food in _food_patterns():
        if (best is None or length > best[0]) and _loose(pattern, ingredient):
            best = (length, food)
    return best[1] if best else None


def ingredient_grams(ingredient: Ingredient, food: Food | None) -> float:
    """Ungefähres Gewicht einer Zutatenangabe in Gramm (0 = ohne Menge)."""
    if ingredient.amount is None:
        return 0
    amount, unit = to_base(ingredient.amount, ingredient.unit)
    if unit in ("g", "ml"):
        return amount
    unit = normalize_unit(unit) or "Stk"
    if unit in _UNIT_GRAMS:
        return amount * _UNIT_GRAMS[unit]
    piece = food.piece if food else 100
    if unit in ("Dose", "Glas"):
        return amount * (food.can if food and food.can else 250)
    if unit == "Scheibe":
        return amount * (food.slice if food else 25)
    if unit == "Pkg":
        return amount * (food.pkg if food else 250)
    return amount * piece


@dataclass
class Nutrition:
    """Geschätzte Nährwerte je Portion."""

    kcal: float = 0
    protein: float = 0
    fat: float = 0
    carbs: float = 0
    fiber: float = 0
    # Anteil der Zutaten (nach Gewicht), die in der Tabelle gefunden wurden.
    known: float = 1.0

    def share(self, grams: float, kcal_per_gram: float) -> float:
        """Energieanteil eines Nährstoffs."""
        return grams * kcal_per_gram / self.kcal if self.kcal else 0

    def to_dict(self) -> dict[str, float]:
        return {
            "kcal": round(self.kcal),
            "protein": round(self.protein, 1),
            "fat": round(self.fat, 1),
            "carbs": round(self.carbs, 1),
            "fiber": round(self.fiber, 1),
            "known": round(self.known, 2),
        }


def estimate_nutrition(ingredients: Iterable[Ingredient], servings: float) -> Nutrition:
    """Nährwerte je Portion aus den Zutaten schätzen."""
    total = Nutrition()
    known = unknown = 0.0
    for ingredient in ingredients:
        food = find_food(ingredient.name)
        grams = ingredient_grams(ingredient, food)
        if food is None:
            unknown += grams
            continue
        known += grams
        factor = grams / 100
        total.kcal += food.kcal * factor
        total.protein += food.protein * factor
        total.fat += food.fat * factor
        total.carbs += food.carbs * factor
        total.fiber += food.fiber * factor
    servings = servings or 1
    return Nutrition(
        kcal=total.kcal / servings,
        protein=total.protein / servings,
        fat=total.fat / servings,
        carbs=total.carbs / servings,
        fiber=total.fiber / servings,
        known=known / (known + unknown) if known + unknown else 0,
    )


# Grenzwerte je Portion: (Hauptmahlzeit, Frühstück/Snack).
PROTEIN_MIN_G = (25, 12)
PROTEIN_MIN_SHARE = 0.20
FIBER_MIN_G = (8, 5)
CARBS_MAX_G = (25, 15)
KCAL_MAX = (500, 300)
FAT_MAX_SHARE = 0.30
FAT_MAX_G = (18, 8)
MIN_KNOWN = 0.7  # Mindestens so viel muss bekannt sein, sonst keine Einstufung


def classify(nutrition: Nutrition, main_meal: bool = True) -> set[str]:
    """Passende Richtungen zu geschätzten Nährwerten je Portion."""
    if nutrition.kcal <= 0 or nutrition.known < MIN_KNOWN:
        return set()
    i = 0 if main_meal else 1
    result: set[str] = set()
    if nutrition.protein >= PROTEIN_MIN_G[i] and nutrition.share(nutrition.protein, 4) >= PROTEIN_MIN_SHARE:
        result.add(DIR_PROTEIN)
    if nutrition.fiber >= FIBER_MIN_G[i]:
        result.add(DIR_FIBER)
    if nutrition.carbs <= CARBS_MAX_G[i]:
        result.add(DIR_LOW_CARB)
    if nutrition.kcal <= KCAL_MAX[i]:
        result.add(DIR_LIGHT)
    if nutrition.fat <= FAT_MAX_G[i] and nutrition.share(nutrition.fat, 9) <= FAT_MAX_SHARE:
        result.add(DIR_LOW_FAT)
    return result


def is_main_meal(meal_types: Iterable[str]) -> bool:
    """Hauptmahlzeit (Mittag/Abend) – sonst gelten die kleineren Grenzwerte."""
    return bool({MEAL_LUNCH, MEAL_DINNER} & set(meal_types))


def estimate_dish(dish: Dish) -> tuple[Nutrition, set[str]]:
    """Nährwerte je Portion und vorgeschlagene Richtungen eines Gerichts."""
    nutrition = estimate_nutrition(dish.ingredients, dish.base_servings)
    return nutrition, classify(nutrition, is_main_meal(dish.meal_types))
