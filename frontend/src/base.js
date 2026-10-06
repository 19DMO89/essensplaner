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
