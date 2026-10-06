// Lovelace-Karte "Was gibt's heute?".
import { LitElement, html, css } from "lit";
import { Api, MEAL_TYPES, addDays, imageUrl, isoDate, navigate } from "./api.js";
import { localize } from "./i18n.js";
import { sharedStyles } from "./styles.js";

class EssensplanerTodayCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _data: { state: true },
    _day: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this._config = {};
    this._data = null;
    this._day = null;
    this._error = null;
    this._unsub = null;
    this._api = null;
    this._loadedDate = null;
  }

  static getStubConfig() {
    return { show_images: true };
  }

  static getConfigElement() {
    return document.createElement("essensplaner-today-card-editor");
  }

  setConfig(config) {
    this._config = { show_images: true, day_offset: 0, ...config };
    this._loadedDate = null;
  }

  getCardSize() {
    return 3;
  }

  t(key, params) {
    return localize(this.hass, key, params);
  }

  get _date() {
    return isoDate(addDays(new Date(), Number(this._config.day_offset) || 0));
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.hass) this._start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsub) {
      this._unsub.then((u) => u()).catch(() => {});
      this._unsub = null;
    }
  }

  updated(changed) {
    if (changed.has("hass") && this.hass) {
      if (!this._unsub) this._start();
      else this._api.hass = this.hass;
      // Tageswechsel: neu laden, sobald sich das Datum ändert.
      if (this._loadedDate && this._loadedDate !== this._date) this._load();
    }
  }

  _start() {
    this._api = new Api(this.hass);
    this._load();
    this._unsub = this._api.subscribe(() => this._load());
    this._unsub.catch((err) => (this._error = err.message || String(err)));
  }

  async _load() {
    const date = this._date;
    this._loadedDate = date;
    try {
      const [data, plan] = await Promise.all([this._api.data(), this._api.plan(date, 1)]);
      this._data = data;
      this._day = plan[date] || {};
      this._error = null;
    } catch (err) {
      this._error = err.code === "unknown_command" || err.code === "not_loaded" ? this.t("card.not_loaded") : err.message;
    }
  }

  _open(dishId) {
    navigate(`/essensplaner?dish=${encodeURIComponent(dishId)}`);
  }

  _profileName(id) {
    const p = this._data && this._data.profiles.find((x) => x.id === id);
    return p ? p.name : "?";
  }

  render() {
    const offset = Number(this._config.day_offset) || 0;
    const title = this._config.title || this.t(offset === 1 ? "card.tomorrow" : "card.title");
    const filter = this._config.profiles;
    return html`
      <ha-card>
        <div class="header">${title}</div>
        <div class="content">
          ${this._error
            ? html`<p class="muted">${this._error}</p>`
            : !this._day
            ? html`<p class="muted">${this.t("common.loading")}</p>`
            : this._renderDay(filter)}
        </div>
      </ha-card>
    `;
  }

  _renderDay(filter) {
    const meals = MEAL_TYPES.filter((m) => this._day[m]);
    const sections = meals
      .map((m) => ({
        meal: m,
        assignments: this._day[m].assignments.filter(
          (a) => !filter || !filter.length || a.profiles.some((p) => filter.includes(p))
        ),
      }))
      .filter((s) => s.assignments.length);
    if (!sections.length) return html`<p class="muted">${this.t("card.nothing")}</p>`;
    const dishes = Object.fromEntries((this._data.dishes || []).map((d) => [d.id, d]));
    return sections.map(
      (s) => html`
        <div class="meal">
          <div class="meal-name">${this.t(`meal.${s.meal}`)}</div>
          ${s.assignments.map((a) => {
            const url = this._config.show_images ? imageUrl(dishes[a.dish_id] && dishes[a.dish_id].image) : null;
            return html`<button class="dish" @click=${() => this._open(a.dish_id)}>
              ${this._config.show_images
                ? url
                  ? html`<img class="thumb" src=${url} alt="" loading="lazy" />`
                  : html`<span class="thumb"><ha-icon icon="mdi:silverware-fork-knife"></ha-icon></span>`
                : ""}
              <span class="text">
                <span class="name">${a.dish_name}</span>
                ${!a.chosen && a.alternative_dishes && a.alternative_dishes.length
                  ? html`<span class="alt">${this.t("plan.or")} ${a.alternative_dishes.map((x) => x.dish_name).join(", ")}</span>`
                  : ""}
                <span class="who">${a.profiles.map((p) => this._profileName(p)).join(", ")}</span>
              </span>
            </button>`;
          })}
        </div>
      `
    );
  }

  static styles = [
    sharedStyles,
    css`
      .header {
        padding: 16px 16px 4px;
        font-size: 20px;
        font-weight: 500;
      }
      .content {
        padding: 4px 16px 16px;
      }
      .meal + .meal {
        margin-top: 8px;
      }
      .meal-name {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin: 6px 0 2px;
      }
      .dish {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 6px 0;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
      }
      .thumb {
        width: 52px;
        height: 52px;
      }
      .text {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .name {
        font-weight: 500;
      }
      .who {
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .alt {
        font-size: 13px;
        font-style: italic;
        color: var(--secondary-text-color);
      }
    `,
  ];
}

class EssensplanerTodayCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _profiles: { state: true },
  };

  constructor() {
    super();
    this._config = {};
    this._profiles = [];
  }

  setConfig(config) {
    this._config = config;
  }

  updated(changed) {
    if (changed.has("hass") && this.hass && !this._loaded) {
      this._loaded = true;
      new Api(this.hass)
        .data()
        .then((d) => (this._profiles = d.profiles))
        .catch(() => {});
    }
  }

  _change(key, value) {
    const config = { ...this._config, [key]: value };
    if (value === "" || value === undefined || (Array.isArray(value) && !value.length)) delete config[key];
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  _toggleProfile(id) {
    const list = this._config.profiles || [];
    this._change("profiles", list.includes(id) ? list.filter((p) => p !== id) : [...list, id]);
  }

  render() {
    const t = (k) => localize(this.hass, k);
    const selected = this._config.profiles || [];
    return html`
      <label class="field">
        <span>${t("card.title_label")}</span>
        <input type="text" .value=${this._config.title || ""} @input=${(e) => this._change("title", e.target.value)} />
      </label>
      <label class="row field">
        <input type="checkbox" .checked=${this._config.show_images !== false}
          @change=${(e) => this._change("show_images", e.target.checked)} />
        <span>${t("edit.image")}</span>
      </label>
      <label class="row field">
        <input type="checkbox" .checked=${Number(this._config.day_offset) === 1}
          @change=${(e) => this._change("day_offset", e.target.checked ? 1 : 0)} />
        <span>${t("card.tomorrow")}</span>
      </label>
      <div class="field">
        <span class="muted">${t("tab.profiles")}</span>
        <div class="chips">
          ${this._profiles.map(
            (p) => html`<button class="chip ${selected.includes(p.id) ? "on" : ""}" @click=${() => this._toggleProfile(p.id)}>
              ${p.name}
            </button>`
          )}
        </div>
      </div>
    `;
  }

  static styles = [sharedStyles];
}

// Doppeltes Laden (z. B. zusätzlich als Dashboard-Ressource) abfangen.
if (!customElements.get("essensplaner-today-card")) {
  customElements.define("essensplaner-today-card", EssensplanerTodayCard);
  customElements.define("essensplaner-today-card-editor", EssensplanerTodayCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "essensplaner-today-card",
    name: "Essensplaner – Heute",
    description: "Zeigt, was es heute gibt.",
    preview: true,
  });
}
