// Zugriff auf die WebSocket-API und den Bild-Upload der Integration.

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export class Api {
  constructor(hass) {
    this.hass = hass;
  }

  call(type, data = {}) {
    return this.hass.callWS({ type: `essensplaner/${type}`, ...data });
  }

  data() {
    return this.call("data");
  }

  compat() {
    return this.call("compat/all");
  }

  dishCheck(dishId) {
    return this.call("dish/check", { dish_id: dishId });
  }

  saveDish(dish) {
    return this.call("dish/save", { dish });
  }

  deleteDish(dishId) {
    return this.call("dish/delete", { dish_id: dishId });
  }

  saveProfile(profile) {
    return this.call("profile/save", { profile });
  }

  deleteProfile(profileId) {
    return this.call("profile/delete", { profile_id: profileId });
  }

  profileIngredients(profileId) {
    return this.call("profile/ingredients", { profile_id: profileId });
  }

  profileGroups(profileId) {
    return this.call("profile/groups", { profile_id: profileId });
  }

  setGroups(profileId, excludedGroups) {
    return this.call("profile/set_groups", { profile_id: profileId, excluded_groups: excludedGroups });
  }

  setIngredient(params) {
    return this.call("profile/set_ingredient", params);
  }

  parseIngredients(text) {
    return this.call("parse_ingredients", { text });
  }

  plan(startDate, days) {
    return this.call("plan/get", { start_date: startDate, days });
  }

  setMeal(date, mealType, assignments) {
    return this.call("plan/set_meal", { date, meal_type: mealType, assignments });
  }

  choose(date, mealType, index, dishId) {
    return this.call("plan/choose", { date, meal_type: mealType, index, dish_id: dishId });
  }

  generate(params) {
    return this.call("plan/generate", params);
  }

  shoppingPreview(startDate, days) {
    return this.call("shopping/preview", { start_date: startDate, days });
  }

  shoppingPush(params) {
    return this.call("shopping/push", params);
  }

  imageFromUrl(url) {
    return this.call("image/from_url", { url });
  }

  async uploadImage(file) {
    const body = new FormData();
    body.append("file", file);
    const resp = await this.hass.fetchWithAuth("/api/essensplaner/upload", {
      method: "POST",
      body,
    });
    const result = await resp.json();
    if (!resp.ok) throw new Error(result.message || resp.statusText);
    return { id: result.id, source: result.source };
  }

  /** Bei jeder Datenänderung ``callback`` aufrufen. Liefert eine Abmeldefunktion. */
  subscribe(callback) {
    return this.hass.connection.subscribeMessage(callback, { type: "essensplaner/subscribe" });
  }
}

export function imageUrl(image) {
  return image && image.id ? `/api/essensplaner/images/${image.id}` : null;
}

// ------------------------------------------------------------------ Datum

export function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIso(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (result.getDay() + 6) % 7; // Montag = 0
  return addDays(result, -day);
}

export function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// ------------------------------------------------------------- Zutaten

const ROLE_MARK = { protein: "#protein", side: "#beilage", veg: "#gemuese" };

export function formatNumber(value) {
  if (value === null || value === undefined) return "";
  const rounded = Math.round(value * 100) / 100;
  return String(rounded).replace(".", ",");
}

export function ingredientLine(ing) {
  const parts = [];
  if (ing.amount !== null && ing.amount !== undefined) {
    parts.push(formatNumber(ing.amount));
    if (ing.unit) parts.push(ing.unit);
  }
  parts.push(ing.name);
  if (ROLE_MARK[ing.role]) parts.push(ROLE_MARK[ing.role]);
  return parts.join(" ");
}

/** Menge für die Anzeige skalieren und sinnvoll runden. */
export function scaledAmount(ing, factor) {
  if (ing.amount === null || ing.amount === undefined) return "";
  let amount = ing.amount * factor;
  if (["g", "ml"].includes(ing.unit) && amount >= 20) amount = Math.round(amount / 5) * 5;
  else if (!ing.unit || ["Stk", "Zehe", "Dose", "Pkg", "Bund", "Becher", "Glas"].includes(ing.unit)) {
    amount = Math.round(amount * 2) / 2;
  }
  if (ing.unit === "g" && amount >= 1000) return `${formatNumber(amount / 1000)} kg`;
  if (ing.unit === "ml" && amount >= 1000) return `${formatNumber(amount / 1000)} l`;
  return ing.unit ? `${formatNumber(amount)} ${ing.unit}` : formatNumber(amount);
}

export function fireEvent(node, type, detail = {}) {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

export function navigate(path) {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
}
