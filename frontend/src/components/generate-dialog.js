// Woche automatisch planen: Mahlzeiten je Tag, Personen, Überschreiben.
import { html, css } from "lit";
import { EpDialog } from "./dialog.js";
import { MEAL_TYPES, addDays, isoDate, parseIso } from "../api.js";
import { dayLabel } from "../i18n.js";

class GenerateDialog extends EpDialog {
  static properties = {
    ...EpDialog.properties,
    start: { attribute: false },
    _meals: { state: true },
    _for: { state: true },
    _overwrite: { state: true },
    _busy: { state: true },
    _result: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this._meals = null;
    this._for = null;
    this._overwrite = false;
    this._busy = false;
    this._result = null;
    this._error = null;
  }

  get _days() {
    const start = parseIso(this.start);
    return [0, 1, 2, 3, 4, 5, 6].map((i) => isoDate(addDays(start, i)));
  }

  willUpdate() {
    if (this._meals === null && this.data && this.start) {
      const defaults = this.data.default_meal_types || ["lunch", "dinner"];
      this._meals = Object.fromEntries(this._days.map((d) => [d, [...defaults]]));
      this._for = this.profiles.map((p) => p.id);
    }
  }

  _toggleMeal(day, meal) {
    const list = this._meals[day];
    this._meals = {
      ...this._meals,
      [day]: list.includes(meal) ? list.filter((m) => m !== meal) : [...list, meal],
    };
  }

  _toggleColumn(meal) {
    const allOn = this._days.every((d) => this._meals[d].includes(meal));
    this._meals = Object.fromEntries(
      this._days.map((d) => {
        const list = this._meals[d].filter((m) => m !== meal);
        return [d, allOn ? list : [...list, meal]];
      })
    );
  }

  _toggleFor(id) {
    this._for = this._for.includes(id) ? this._for.filter((x) => x !== id) : [...this._for, id];
  }

  async _run() {
    this._busy = true;
    this._error = null;
    try {
      const result = await this.api.generate({
        start_date: this.start,
        days: 7,
        meals: this._meals,
        profiles: this._for,
        overwrite: this._overwrite,
      });
      this._result = result;
    } catch (err) {
      this._error = err.message || String(err);
    }
    this._busy = false;
  }

  _countPlanned(result) {
    let n = 0;
    for (const meals of Object.values(result.days)) {
      for (const slot of Object.values(meals)) n += slot.assignments.length;
    }
    return n;
  }

  render() {
    if (!this._meals) return "";
    if (this._result) return this._renderResult();
    const body = html`
      <h3>${this.t("gen.days")}</h3>
      <table class="grid">
        <thead>
          <tr>
            <th></th>
            ${MEAL_TYPES.map(
              (m) => html`<th><button class="colhead" @click=${() => this._toggleColumn(m)}>${this.t(`meal.${m}`)}</button></th>`
            )}
          </tr>
        </thead>
        <tbody>
          ${this._days.map(
            (d) => html`<tr>
              <th class="day">${dayLabel(this.hass, parseIso(d))}</th>
              ${MEAL_TYPES.map(
                (m) => html`<td>
                  <input type="checkbox" .checked=${this._meals[d].includes(m)} @change=${() => this._toggleMeal(d, m)}
                    aria-label="${d} ${m}" />
                </td>`
              )}
            </tr>`
          )}
        </tbody>
      </table>

      <h3>${this.t("gen.profiles")}</h3>
      <div class="chips">
        ${this.profiles.map(
          (p) => html`<button class="chip ${this._for.includes(p.id) ? "on" : ""}" @click=${() => this._toggleFor(p.id)}>
            ${p.name}
          </button>`
        )}
      </div>

      <label class="row overwrite">
        <input type="checkbox" .checked=${this._overwrite} @change=${(e) => (this._overwrite = e.target.checked)} />
        <span>${this.t("gen.overwrite")}</span>
      </label>
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
    `;
    const footer = html`
      <button class="btn flat" @click=${() => this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy || !this._for.length} @click=${this._run}>
        <ha-icon icon="mdi:auto-fix"></ha-icon>${this.t("gen.run")}
      </button>
    `;
    return this.shell(this.t("gen.title"), body, footer);
  }

  _renderResult() {
    const r = this._result;
    const body = html`
      <p class="status-ok">${this.t("gen.done", { n: this._countPlanned(r) })}</p>
      ${r.warnings.length
        ? html`<ul class="warnings">
            ${r.warnings.map(
              (w) => html`<li class="status-warn">
                ${this.t("gen.no_dish", {
                  day: dayLabel(this.hass, parseIso(w.date)),
                  meal: this.t(`meal.${w.meal_type}`),
                  profiles: w.profiles.map((p) => this.profileName(p)).join(", "),
                })}
              </li>`
            )}
          </ul>`
        : ""}
    `;
    return this.shell(
      this.t("gen.title"),
      body,
      html`<button class="btn" @click=${() => this.close()}>${this.t("common.close")}</button>`
    );
  }

  static styles = [
    ...EpDialog.styles,
    css`
      h3 {
        font-size: 15px;
        margin: 4px 0 8px;
      }
      h3 + .chips {
        margin-bottom: 16px;
      }
      .grid {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
      }
      .grid th,
      .grid td {
        text-align: center;
        padding: 4px 2px;
      }
      .grid .day {
        text-align: left;
        font-weight: 500;
        white-space: nowrap;
      }
      .colhead {
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 12px;
        padding: 4px;
      }
      input[type="checkbox"] {
        width: 22px;
        height: 22px;
        accent-color: var(--primary-color);
      }
      .overwrite {
        align-items: flex-start;
      }
      .warnings {
        padding-left: 18px;
      }
    `,
  ];
}

customElements.define("ep-generate-dialog", GenerateDialog);
