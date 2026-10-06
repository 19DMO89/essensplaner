// Basisklasse: Übersetzung und gemeinsame Daten für alle Ansichten.
import { LitElement, html } from "lit";
import { localize } from "./i18n.js";
import { imageUrl } from "./api.js";

export class EpElement extends LitElement {
  static properties = {
    hass: { attribute: false },
    api: { attribute: false },
    data: { attribute: false },
    compat: { attribute: false },
  };

  t(key, params) {
    return localize(this.hass, key, params);
  }

  get profiles() {
    return (this.data && this.data.profiles) || [];
  }

  get dishes() {
    return (this.data && this.data.dishes) || [];
  }

  dish(id) {
    return this.dishes.find((d) => d.id === id);
  }

  profileName(id) {
    const profile = this.profiles.find((p) => p.id === id);
    return profile ? profile.name : "?";
  }

  get groups() {
    return (this.data && this.data.groups) || [];
  }

  groupLabel(id) {
    const group = this.groups.find((g) => g.id === id);
    if (!group) return id;
    const lang = (this.hass && this.hass.language) || "de";
    return lang.startsWith("de") ? group.label_de : group.label_en;
  }

  /** Schnellauswahl: Fleischsorten (an = isst es) und Allergene (an = ausgeschlossen). */
  groupChips(excluded, onToggle, disabled = false) {
    const meat = this.groups.filter((g) => g.kind === "meat");
    const allergens = this.groups.filter((g) => g.kind === "allergen");
    return html`
      <div class="group-block">
        <div class="group-title">${this.t("groups.meat")}</div>
        <div class="chips">
          ${meat.map((g) => {
            const eats = !excluded.includes(g.id);
            return html`<button class="chip ${eats ? "on" : "off-strike"}" ?disabled=${disabled}
              aria-pressed=${eats} @click=${() => onToggle(g.id)}>${eats ? "✓ " : ""}${this.groupLabel(g.id)}</button>`;
          })}
        </div>
      </div>
      <div class="group-block">
        <div class="group-title">${this.t("groups.allergens")}</div>
        <div class="chips">
          ${allergens.map((g) => {
            const ex = excluded.includes(g.id);
            return html`<button class="chip ${ex ? "on bad" : ""}" ?disabled=${disabled}
              aria-pressed=${ex} @click=${() => onToggle(g.id)}>${ex ? "✕ " : ""}${this.groupLabel(g.id)}</button>`;
          })}
        </div>
      </div>
    `;
  }

  /** Bild oder Platzhalter-Icon. */
  thumb(dish, size = 48) {
    const url = dish && imageUrl(dish.image);
    const style = `width:${size}px;height:${size}px`;
    return url
      ? html`<img class="thumb" style=${style} src=${url} alt="" loading="lazy" />`
      : html`<span class="thumb" style=${style}><ha-icon icon="mdi:silverware-fork-knife"></ha-icon></span>`;
  }

  /** Farbige Punkte mit Initialen je Profil (passt / Hinweis / passt nicht). */
  compatDots(dishId) {
    const status = (this.compat && this.compat[dishId]) || {};
    return html`${this.profiles.map(
      (p) => html`<span
        class="dot ${status[p.id] || "excluded"}"
        title="${p.name}: ${this.t(`status.${status[p.id] || "excluded"}`)}"
        >${p.name.slice(0, 1).toUpperCase()}</span
      >`
    )}`;
  }

  emit(type, detail = {}) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }
}
