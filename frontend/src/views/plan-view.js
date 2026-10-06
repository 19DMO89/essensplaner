// Wochenplan: 7 Tage mit Mahlzeiten, Wochen-Navigation, Planen.
import { html, css } from "lit";
import { EpElement } from "../base.js";
import { MEAL_TYPES, addDays, isoDate, isoWeek, parseIso, startOfWeek } from "../api.js";
import { dayLabel } from "../i18n.js";
import { sharedStyles } from "../styles.js";

class PlanView extends EpElement {
  static properties = {
    ...EpElement.properties,
    revision: { type: Number },
    _offset: { state: true },
    _days: { state: true },
    _extraMeals: { state: true },
  };

  constructor() {
    super();
    this._offset = 0;
    this._days = null;
    this._extraMeals = {};
    this._loadedKey = null;
  }

  get _start() {
    return addDays(startOfWeek(new Date()), this._offset * 7);
  }

  updated(changed) {
    const key = `${this.revision}|${this._offset}`;
    if (this.api && key !== this._loadedKey) {
      this._loadedKey = key;
      this._load();
    }
  }

  async _load() {
    const start = isoDate(this._start);
    try {
      const days = await this.api.plan(start, 7);
      if (start === isoDate(this._start)) this._days = days;
    } catch (err) {
      this._days = {};
    }
  }

  _shift(delta) {
    this._offset += delta;
    this._days = null;
  }

  _mealsFor(day, meals) {
    const defaults = (this.data && this.data.default_meal_types) || ["lunch", "dinner"];
    const extra = this._extraMeals[day] || [];
    return MEAL_TYPES.filter((m) => defaults.includes(m) || meals[m] || extra.includes(m));
  }

  _addMeal(day, meal) {
    this._extraMeals = { ...this._extraMeals, [day]: [...(this._extraMeals[day] || []), meal] };
    this._editSlot(day, meal, []);
  }

  _editSlot(day, meal, assignments) {
    this.emit("ep-open", { type: "slot", date: day, mealType: meal, assignments });
  }

  render() {
    const start = this._start;
    const end = addDays(start, 6);
    const today = isoDate(new Date());
    return html`
      <div class="weekbar">
        <button class="icon-btn" @click=${() => this._shift(-1)} aria-label="prev">
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <div class="week">
          <div class="kw">${this.t("plan.week", { week: isoWeek(start) })}</div>
          <div class="muted range">${dayLabel(this.hass, start)} – ${dayLabel(this.hass, end)}</div>
        </div>
        <button class="icon-btn" @click=${() => this._shift(1)} aria-label="next">
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
        <span class="spacer"></span>
        <button class="btn" @click=${() => this.emit("ep-open", { type: "generate", start: isoDate(start) })}>
          <ha-icon icon="mdi:auto-fix"></ha-icon>${this.t("plan.generate")}
        </button>
      </div>
      ${!this._days
        ? html`<p class="muted center">${this.t("common.loading")}</p>`
        : html`<div class="days">
            ${[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const date = addDays(start, i);
              const day = isoDate(date);
              return this._renderDay(day, date, this._days[day] || {}, day === today);
            })}
          </div>`}
    `;
  }

  _renderDay(day, date, meals, isToday) {
    const shown = this._mealsFor(day, meals);
    const hidden = MEAL_TYPES.filter((m) => !shown.includes(m));
    return html`
      <section class="card day ${isToday ? "today" : ""}">
        <h3>
          ${dayLabel(this.hass, date)}
          ${isToday ? html`<span class="chip small on">${this.t("plan.today")}</span>` : ""}
        </h3>
        ${shown.map((meal) => this._renderMeal(day, meal, meals[meal]))}
        ${hidden.length
          ? html`<div class="chips add">
              ${hidden.map(
                (m) => html`<button class="chip small" @click=${() => this._addMeal(day, m)}>
                  + ${this.t(`meal.${m}`)}
                </button>`
              )}
            </div>`
          : ""}
      </section>
    `;
  }

  _renderMeal(day, meal, slot) {
    const assignments = (slot && slot.assignments) || [];
    return html`
      <div class="meal">
        <div class="meal-head">
          <span class="meal-name">${this.t(`meal.${meal}`)}</span>
          ${slot && slot.shared_base && slot.shared_base.length && assignments.length > 1
            ? html`<span class="shared">${this.t("plan.shared", { items: slot.shared_base.join(", ") })}</span>`
            : ""}
          <span class="spacer"></span>
          <button class="icon-btn small" @click=${() => this._editSlot(day, meal, assignments)} aria-label="edit">
            <ha-icon icon=${assignments.length ? "mdi:pencil" : "mdi:plus"}></ha-icon>
          </button>
        </div>
        ${assignments.length
          ? assignments.map((a) => this._renderAssignment(a))
          : html`<button class="empty" @click=${() => this._editSlot(day, meal, [])}>
              ${this.t("plan.empty")}
            </button>`}
      </div>
    `;
  }

  _renderAssignment(a) {
    const dish = this.dish(a.dish_id);
    return html`
      <button
        class="assignment"
        @click=${() => this.emit("ep-open", { type: "recipe", dishId: a.dish_id, servings: a.servings })}
      >
        ${this.thumb(dish, 44)}
        <span class="text">
          <span class="dish-name">${a.dish_name || "?"}</span>
          <span class="who">
            ${a.profiles.map((p) => html`<span class="chip small">${this.profileName(p)}</span>`)}
            <span class="muted">${this.t("plan.servings", { n: a.servings })}</span>
          </span>
        </span>
      </button>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .weekbar {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .week {
        text-align: center;
        min-width: 120px;
      }
      .kw {
        font-weight: 600;
      }
      .range {
        font-size: 13px;
      }
      .center {
        text-align: center;
      }
      .days {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
      .day {
        padding: 12px;
      }
      .day.today {
        border-color: var(--primary-color);
        border-width: 2px;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .meal {
        border-top: 1px solid var(--divider-color, #eee);
        padding: 6px 0;
      }
      .meal-head {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
      }
      .meal-name {
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
      }
      .shared {
        font-size: 12px;
        color: var(--ep-ok);
      }
      .icon-btn.small {
        width: 36px;
        height: 36px;
      }
      .assignment,
      .empty {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 6px 4px;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
        border-radius: 8px;
      }
      .assignment:hover,
      .empty:hover {
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      }
      .empty {
        color: var(--secondary-text-color);
        font-style: italic;
        min-height: 40px;
      }
      .text {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .dish-name {
        font-weight: 500;
      }
      .who {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
        font-size: 12px;
      }
      .add {
        margin-top: 6px;
      }
      @media (max-width: 600px) {
        .btn {
          flex: 1 0 100%;
        }
      }
    `,
  ];
}

customElements.define("ep-plan-view", PlanView);
