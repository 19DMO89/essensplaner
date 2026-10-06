# Essensplaner für Home Assistant

Custom Integration (HACS) für Wochen-Essenspläne mit Einkaufsliste und **beliebig vielen
Ernährungsprofilen**. Pro Mahlzeit wird möglichst ein Gericht für alle gekocht. Wo das wegen
Unverträglichkeiten nicht geht, bekommt jede Person ein eigenes Gericht, bevorzugt mit
gemeinsamer Basis (gleiches Protein oder gleiche Beilage).

> **Stand: Phase 2** – Gerichte, Profile, Planer, Einkaufsliste, Panel, Karte, Bilder.
> KI-Rezeptsuche folgt in Phase 3, Preisvergleich in Phase 4.

## Installation

1. HACS → Integrationen → ⋮ → *Benutzerdefinierte Repositories* → dieses Repository
   als Typ *Integration* hinzufügen.
2. „Essensplaner“ installieren und Home Assistant neu starten.
3. *Einstellungen → Geräte & Dienste → Integration hinzufügen → Essensplaner*.
   - Personen eintragen (eine pro Zeile).
   - Startpaket importieren (Standard: an): über 300 fertige Gerichte, siehe unten.
   - Optional: Gerichte aus einer To-do-Liste (z. B. `todo.gerichte`) importieren.
     Es werden nur die Namen übernommen.

Manuell: Ordner `custom_components/essensplaner` nach `config/custom_components/` kopieren.

## Panel

Nach der Einrichtung erscheint **Essensplaner** in der Seitenleiste (auch in der HA-App am Handy):

- **Wochenplan**: Woche vor/zurück, pro Tag und Mahlzeit die Gerichte je Person. Ein Tippen auf
  das Stift-Symbol öffnet die Mahlzeit: Personen wählen, Gericht suchen (passende zuerst),
  Portionen anpassen. *Woche planen* füllt die Woche automatisch; pro Tag lässt sich
  festlegen, welche Mahlzeiten gebraucht werden.
- **Gerichte**: Suche, Filter nach Mahlzeit und „passt für“, Rezeptansicht mit
  Portionsrechner und Begründung, warum ein Gericht für eine Person (nicht) passt.
  Gerichte anlegen und bearbeiten, inklusive Foto (Upload oder Bild-URL übernehmen).
- **Personen**: *Zutaten anklicken* öffnet eine Liste aller Zutaten (häufigste zuerst), in der
  jede Zutat mit einem Klick als verträglich, nur in kleinen Mengen oder nicht verträglich
  markiert wird. Der Knopf **Allergene** (auf der Personenkarte und in der Zutatenliste)
  öffnet die 14 Hauptallergene und die Fleischsorten (Rind, Kalb, Schwein, Geflügel, Lamm,
  Wild, Fisch, Meeresfrüchte) als Schalter, jeweils mit den betroffenen Zutaten. Ein Schalter
  schließt alle typischen Zutaten der Gruppe aus, auch in später hinzugefügten Gerichten;
  einzelne Zutaten lassen sich trotzdem freigeben. Die Gruppen sind eine Auswahlhilfe und ersetzen
  keine Allergenkennzeichnung verarbeiteter Produkte.
- **Einkauf**: Zeitraum wählen, Einträge an- oder abwählen und in eine To-do-Liste übertragen.

Bilder werden lokal unter `config/essensplaner/images/` gespeichert und auf 1280 px verkleinert.

## Karte „Was gibt's heute?“

Die Karte steht im Karten-Dialog des Dashboards unter *Essensplaner – Heute* bereit; eine
Ressource muss nicht angelegt werden.

```yaml
type: custom:essensplaner-today-card
title: Heute bei uns        # optional
show_images: true           # optional
day_offset: 1               # optional: 1 = morgen
profiles: [p_abc123]        # optional: nur diese Personen
```

Ein Tippen auf ein Gericht öffnet das Rezept im Panel.

## Bedienung über die Optionen

*Einstellungen → Geräte & Dienste → Essensplaner → Konfigurieren* öffnet ein Menü:

| Menüpunkt | Zweck |
|---|---|
| Einstellungen | Ziel-Einkaufsliste (`todo.*`), Standard-Mahlzeiten pro Tag |
| Person hinzufügen / bearbeiten | Verträglich, nicht verträglich, nur in kleinen Mengen, Vorlieben, Abneigungen, max. Zubereitungszeit, Portionen |
| Gericht hinzufügen / bearbeiten | Zutaten, Zubereitung, Mahlzeitentyp, Portionen, Dauer, Tags, „nur für“ |
| Startpaket importieren | Mitgelieferte Gerichte übernehmen (gleichnamige werden übersprungen) |
| Gerichte importieren | Namen aus einer To-do-Liste übernehmen |

### Startpaket

Über 300 Gerichte mit Zutaten, Mengen, Zubereitung, Dauer und Tags. Dazu gehören
österreichische und deutsche Hausmannskost, Italienisch, Asiatisch, International, Fisch,
Vegetarisch/Vegan, Suppen, Salate, Süßspeisen, Frühstück und Snacks, außerdem:

- **Schonkost** (Tag `schonkost`): mild, wenig Fett, ohne Zwiebel, Knoblauch und Schärfe,
  mit kurzen Zutatenlisten – passt dadurch auch bei stark eingeschränkten Personen öfter.
- **Gesund & ausgewogen** (Tag `gesund`): Vollkorn, Hülsenfrüchte, Gemüse, Fisch, Bowls.

Die Tags beschreiben die Gerichte nur (Suche „schonkost“ im Reiter Gerichte); ob ein Gericht
für eine Person passt, entscheiden ausschließlich ihre Listen. Importierte Gerichte
tragen den Tag „Startpaket“ und lassen sich frei bearbeiten oder löschen. Die Rezepte liegen
als Textdateien in `custom_components/essensplaner/data/starter/`. Ergänzungen per Pull
Request sind willkommen; `pytest tests/logic` prüft das Format.

### Zutaten eingeben

Eine Zutat pro Zeile, Mengen beziehen sich auf die „Portionen im Rezept“:

```
250 g Hühnerbrust #protein
150 g Reis #beilage
2 Karotten
1/2 TL Salz
Petersilie
```

`#protein` und `#beilage` markieren die Basis, über die zwei Gerichte als
„gemeinsam kochbar“ erkannt werden.

### Wie Profile ausgewertet werden

Grundlage sind **ausschließlich die Listen im Profil**, es gibt keine eingebauten Diätregeln.

- **Nicht verträglich** schließt ein Gericht aus. Der Abgleich ist vorsichtig: „Zwiebel“
  trifft auch „Zwiebelpulver“.
- **Nur in kleinen Mengen**: optional mit Höchstmenge pro Portion (`10 g Butter`).
  Wird die Menge überschritten, ist das Gericht ausgeschlossen. Ohne Limit oder bei nicht
  vergleichbarer Einheit gibt es eine Warnung.
- **Verträglich**: Treffer auf ganze Wörter oder Wortenden („Reis“ → „Basmatireis“, aber
  nicht „Reisnudeln“).
- **Zutaten, die in keiner Liste stehen**: je Profil *erlauben*, *warnen* oder
  *ausschließen* (Standard). Bei *ausschließen* müssen auch Grundzutaten wie Salz oder
  Wasser als verträglich eingetragen sein. Gerichte ohne Zutaten gelten als unbekannt.
- **Abneigungen** schließen Gerichte aus (Zutat, Tag oder Namensteil),
  **Vorlieben** werden bevorzugt.
- Singular/Plural und österreichische Bezeichnungen werden zusammengeführt
  (Paradeiser/Tomate, Erdäpfel/Kartoffel, Topfen/Quark, Obers/Sahne …).

## Aktionen (Services)

```yaml
# Plan für 7 Tage ab heute (Mittag + Abend laut Einstellungen)
action: essensplaner.generate_plan
data:
  days: 7
  overwrite: false       # true: neu planen, manuell gesetzte Mahlzeiten bleiben

# Gericht manuell setzen (nur für eine Person; die anderen behalten ihr Gericht)
action: essensplaner.set_meal
data:
  date: "2026-10-07"
  meal_type: dinner
  dish: Hühnerreis
  profiles: [Anna]

# Einkaufsliste übertragen (gleiche Zutaten addiert, Einheiten vereinheitlicht)
action: essensplaner.push_shopping_list
data:
  days: 7
  entity_id: todo.einkaufsliste   # optional, sonst aus den Einstellungen
```

Alle drei Aktionen liefern auf Wunsch eine Antwort (`response_variable`) mit dem Plan bzw.
den hinzugefügten Einträgen.

## Entitäten

- `sensor.essensplaner_heute_<person>`: Gerichte von heute; Attribute `meals` je
  Mahlzeitentyp. Wird um Mitternacht automatisch aktualisiert.

## Daten

Gespeichert in `.storage/essensplaner.dishes`, `.storage/essensplaner.profiles` und
`.storage/essensplaner.plan`. Vergangene Plantage werden nach 60 Tagen entfernt.
Beim Entfernen der Integration bleiben die Daten erhalten.

## Entwicklung

```bash
pip install -r requirements_test.txt
pytest
```

Die reine Planungslogik (`custom_components/essensplaner/logic`) hängt nicht von Home
Assistant ab. `pytest tests/logic` läuft daher auch ohne HA-Testumgebung (z. B. unter Windows).

Frontend (Lit, gebündelt mit esbuild nach `custom_components/essensplaner/frontend/`):

```bash
cd frontend
npm ci
npm run build          # oder: npm run watch
python dev/make_mock.py   # Testdaten aus dem Startpaket
```

`frontend/dev/index.html` zeigt Panel und Karte mit simuliertem Home Assistant
(z. B. `python -m http.server` im Repo-Wurzelverzeichnis, dann `/frontend/dev/` öffnen).
