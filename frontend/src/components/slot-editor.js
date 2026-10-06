// Eine Mahlzeit bearbeiten: Gerichte je Person(en) zuweisen.
import { html, css } from "lit";
import { EpDialog } from "./dialog.js";
import { parseIso } from "../api.js";
import { dayLabel } from "../i18n.js";

const RANK = { ok: 0, warn: 1, excluded: 2 };
const LIMIT = 40;

class SlotEditor extends EpDialog {
  static properties = {
    ...EpDialog.properties,
    date: { attribute: false },
    mealType: { attribute: false },
    assignments: { attribute: false },
    _list: { state: true },
    _for: { state: true },
    _query: { state: true },
    _allMeals: { state: true },
    _unsuitable: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this._list = null;
    this._for = [];
    this._query = "";
    this._allMeals = false;
    this._unsuitable = false;
    this._busy = false;
    this._error = null;
  }

  willUpdate() {
    if (this._list === null && this.data) {
      this._list = (this.assignments || []).map((a) => ({
        dish_id: a.dish_id,
        profiles: [...a.profiles],
        servings: a.servings,
      }));
      this._resetFor();
    }
  }

  _resetFor() {
    const covered = new Set(this._list.flatMap((a) => a.profiles));
    const open = this.profiles.map((p) => p.id).filter((id) => !covered.has(id));
    // Alle versorgt: zum Ersetzen alle vorauswählen.
    this._for = open.length ? open : this.profiles.map((p) => p.id);
  }

  _servingsFor(profileIds) {
    return profileIds.reduce((sum, id) => {
      const p = this.profiles.find((x) => x.id === id);
      return sum + (p ? p.servings : 1);
    }, 0);
  }

  _toggleFor(id) {
    this._for = this._for.includes(id) ? this._for.filter((x) => x !== id) : [...this._for, id];
  }

  _status(dishId) {
    const status = (this.compat && this.compat[dishId]) || {};
    return this._for.reduce((worst, id) => {
      const s = status[id] || "excluded";
      return RANK[s] > RANK[worst] ? s : worst;
    }, "ok");
  }

  get _candidates() {
    const words = this._query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.dishes
      .filter((d) => this._allMeals || d.meal_types.includes(this.mealType))
      .filter((d) => !words.length || words.every((w) => d.name.toLowerCase().includes(w)))
      .map((d) => ({ dish: d, status: this._status(d.id) }))
      .filter((c) => this._unsuitable || c.status !== "excluded")
      .sort((a, b) => RANK[a.status] - RANK[b.status] || a.dish.name.localeCompare(b.dish.name, "de"));
  }

  _choose(dish) {
    if (!this._for.length) return;
    // Gewählte Personen aus bestehenden Zuweisungen lösen.
    const list = this._list
      .map((a) => ({ ...a, profiles: a.profiles.filter((p) => !this._for.includes(p)) }))
      .filter((a) => a.profiles.length)
      .map((a) => ({ ...a, servings: this._servingsFor(a.profiles) }));
    list.push({ dish_id: dish.id, profiles: [...this._for], servings: this._servingsFor(this._for) });
    this._list = list;
    this._query = "";
    this._resetFor();
  }

  _remove(index) {
    this._list = this._list.filter((_, i) => i !== index);
    this._resetFor();
  }

  _setServings(index, value) {
    const list = [...this._list];
    list[index] = { ...list[index], servings: Math.max(0.5, Number(value) || 1) };
    this._list = list;
  }

  async _save() {
    this._busy = true;
    this._error = null;
    try {
      await this.api.setMeal(this.date, this.mealType, this._list);
      this.close();
    } catch (err) {
      this._error = err.message || String(err);
      this._busy = false;
    }
  }

  render() {
    if (!this._list) return "";
    const title = this.t("slot.title", {
      day: dayLabel(this.hass, parseIso(this.date)),
      meal: this.t(`meal.${this.mealType}`),
    });
    const candidates = this._candidates;
    const body = html`
      ${this._list.length
        ? html`<ul class="current">
            ${this._list.map((a, i) => {
              const dish = this.dish(a.dish_id);
              return html`<li class="row">
                ${this.thumb(dish, 40)}
                <span class="text">
                  <span class="name">${dish ? dish.name : "?"}</span>
                  <span class="chips">${a.profiles.map((p) => html`<span class="chip small">${this.profileName(p)}</span>`)}</span>
                </span>
                <input class="servings" type="number" min="0.5" step="0.5" inputmode="decimal"
                  .value=${String(a.servings)} @change=${(e) => this._setServings(i, e.target.value)}
                  aria-label=${this.t("dish.servings")} />
                <button class="icon-btn" @click=${() => this._remove(i)} aria-label=${this.t("slot.remove")}>
                  <ha-icon icon="mdi:delete-outline"></ha-icon>
                </button>
              </li>`;
            })}
          </ul>`
        : html`<p class="muted">${this.t("slot.nothing")}</p>`}

      <h3>${this.t("slot.add")}</h3>
      <div class="row for">
        <span class="muted">${this.t("slot.for")}:</span>
        <div class="chips">
          ${this.profiles.map(
            (p) => html`<button class="chip ${this._for.includes(p.id) ? "on" : ""}" @click=${() => this._toggleFor(p.id)}>
              ${p.name}
            </button>`
          )}
        </div>
      </div>
      <input type="search" placeholder=${this.t("slot.search")} .value=${this._query}
        @input=${(e) => (this._query = e.target.value)} />
      <div class="row toggles">
        <label class="row"><input type="checkbox" .checked=${this._allMeals}
          @change=${(e) => (this._allMeals = e.target.checked)} />${this.t("slot.show_all_meals")}</label>
        <label class="row"><input type="checkbox" .checked=${this._unsuitable}
          @change=${(e) => (this._unsuitable = e.target.checked)} />${this.t("slot.show_unsuitable")}</label>
      </div>
      ${!this._for.length
        ? html`<p class="muted">${this.t("slot.no_profiles")}</p>`
        : html`<ul class="candidates">
            ${candidates.slice(0, LIMIT).map(
              (c) => html`<li>
                <button class="candidate" @click=${() => this._choose(c.dish)}>
                  ${this.thumb(c.dish, 40)}
                  <span class="text">
                    <span class="name">${c.dish.name}</span>
                    <span class="small status-${c.status}">${this.t(`status.${c.status}`)}</span>
                  </span>
                  <span class="dots">${this.compatDots(c.dish.id)}</span>
                </button>
              </li>`
            )}
          </ul>
          ${candidates.length > LIMIT ? html`<p class="muted small">+ ${candidates.length - LIMIT} …</p>` : ""}`}
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
    `;
    const footer = html`
      <button class="btn flat" @click=${() => this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy} @click=${this._save}>${this.t("common.save")}</button>
    `;
    return this.shell(title, body, footer);
  }

  static styles = [
    ...EpDialog.styles,
    css`
      h3 {
        font-size: 15px;
        margin: 16px 0 8px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .current li {
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
      }
      input.servings {
        width: 64px;
        flex: none;
        padding: 8px;
      }
      .current .chips {
        gap: 4px;
      }
      .for {
        margin-bottom: 8px;
        flex-wrap: wrap;
      }
      .toggles {
        flex-wrap: wrap;
        gap: 16px;
        margin: 8px 0;
        font-size: 14px;
      }
      input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: var(--primary-color);
      }
      .candidate {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 4px;
        border: none;
        border-bottom: 1px solid var(--divider-color, #eee);
        background: transparent;
        color: inherit;
        text-align: left;
      }
      .candidate:hover {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      }
      .small {
        font-size: 12px;
      }
      .dots {
        display: flex;
        gap: 3px;
      }
    `,
  ];
}

customElements.define("ep-slot-editor", SlotEditor);
