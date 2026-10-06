// Gerichte-Datenbank: Suche, Filter, Liste.
import { html, css } from "lit";
import { EpElement } from "../base.js";
import { MEAL_TYPES } from "../api.js";
import { sharedStyles } from "../styles.js";

const PAGE = 60;

class DishesView extends EpElement {
  static properties = {
    ...EpElement.properties,
    _query: { state: true },
    _meal: { state: true },
    _fits: { state: true },
    _limit: { state: true },
  };

  constructor() {
    super();
    this._query = "";
    this._meal = "";
    this._fits = "";
    this._limit = PAGE;
  }

  get _filtered() {
    const words = this._query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.dishes
      .filter((d) => !this._meal || d.meal_types.includes(this._meal))
      .filter((d) => {
        if (!this._fits) return true;
        const status = (this.compat[d.id] || {})[this._fits];
        return status === "ok" || status === "warn";
      })
      .filter((d) => {
        if (!words.length) return true;
        const text = [d.name, ...d.tags, ...d.ingredients.map((i) => i.name)].join(" ").toLowerCase();
        return words.every((w) => text.includes(w));
      })
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  }

  _setQuery(ev) {
    this._query = ev.target.value;
    this._limit = PAGE;
  }

  render() {
    const list = this._filtered;
    return html`
      <div class="filters">
        <input type="search" .value=${this._query} @input=${this._setQuery} placeholder=${this.t("dishes.search")} />
        <div class="row wrap">
          <div class="chips">
            <button class="chip ${this._meal ? "" : "on"}" @click=${() => (this._meal = "")}>
              ${this.t("dishes.all_meals")}
            </button>
            ${MEAL_TYPES.map(
              (m) => html`<button class="chip ${this._meal === m ? "on" : ""}" @click=${() => (this._meal = m)}>
                ${this.t(`meal.${m}`)}
              </button>`
            )}
          </div>
          <span class="spacer"></span>
          <label class="fits">
            <span class="muted">${this.t("dishes.fits")}</span>
            <select @change=${(e) => (this._fits = e.target.value)}>
              <option value="">${this.t("dishes.anyone")}</option>
              ${this.profiles.map(
                (p) => html`<option value=${p.id} ?selected=${this._fits === p.id}>${p.name}</option>`
              )}
            </select>
          </label>
        </div>
        <div class="row">
          <span class="muted">${this.t("dishes.count", { n: list.length })}</span>
          <span class="spacer"></span>
          <button class="btn" @click=${() => this.emit("ep-open", { type: "dish", dishId: null })}>
            <ha-icon icon="mdi:plus"></ha-icon>${this.t("dishes.new")}
          </button>
        </div>
      </div>
      ${list.length
        ? html`<div class="grid">
            ${list.slice(0, this._limit).map((d) => this._renderDish(d))}
          </div>`
        : html`<p class="muted">${this.t("dishes.none")}</p>`}
      ${list.length > this._limit
        ? html`<div class="more">
            <button class="btn outline" @click=${() => (this._limit += PAGE)}>
              + ${Math.min(PAGE, list.length - this._limit)}
            </button>
          </div>`
        : ""}
    `;
  }

  _renderDish(d) {
    return html`
      <button class="card dish" @click=${() => this.emit("ep-open", { type: "recipe", dishId: d.id })}>
        ${this.thumb(d, 64)}
        <span class="info">
          <span class="name">${d.name}</span>
          <span class="meta muted">
            ${d.duration_min ? this.t("dish.minutes", { n: d.duration_min }) : ""}
            ${d.meal_types.map((m) => this.t(`meal.${m}`)).join(" · ")}
          </span>
          <span class="dots">${this.compatDots(d.id)}</span>
        </span>
      </button>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .filters {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 12px;
      }
      .wrap {
        flex-wrap: wrap;
      }
      .fits {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fits select {
        width: auto;
        min-width: 140px;
      }
      .grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
      .dish {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 10px;
        text-align: left;
        color: inherit;
        width: 100%;
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
      }
      .dots {
        display: flex;
        gap: 4px;
      }
      .more {
        text-align: center;
        margin-top: 12px;
      }
    `,
  ];
}

customElements.define("ep-dishes-view", DishesView);
