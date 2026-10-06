// Einkaufsliste: Vorschau, Auswahl, Übertragen in eine To-do-Liste.
import { html, css } from "lit";
import { EpElement } from "../base.js";
import { isoDate } from "../api.js";
import { sharedStyles } from "../styles.js";

class ShoppingView extends EpElement {
  static properties = {
    ...EpElement.properties,
    revision: { type: Number },
    _start: { state: true },
    _days: { state: true },
    _items: { state: true },
    _excluded: { state: true },
    _target: { state: true },
    _skip: { state: true },
    _busy: { state: true },
    _message: { state: true },
    _open: { state: true },
  };

  constructor() {
    super();
    this._start = isoDate(new Date());
    this._days = 7;
    this._items = null;
    this._excluded = new Set();
    this._target = null;
    this._skip = true;
    this._busy = false;
    this._message = null;
    this._open = 0;
    this._loadedKey = null;
  }

  get _todoLists() {
    return Object.keys((this.hass && this.hass.states) || {})
      .filter((id) => id.startsWith("todo."))
      .sort();
  }

  updated() {
    const key = `${this.revision}|${this._start}|${this._days}`;
    if (this.api && key !== this._loadedKey) {
      this._loadedKey = key;
      this._load();
    }
    if (this._target === null && this.data) {
      this._target = this.data.shopping_list || this._todoLists[0] || "";
    }
  }

  async _load() {
    try {
      const [items, plan] = await Promise.all([
        this.api.shoppingPreview(this._start, this._days),
        this.api.plan(this._start, this._days),
      ]);
      this._items = items;
      this._open = Object.values(plan)
        .flatMap((meals) => Object.values(meals))
        .flatMap((slot) => slot.assignments)
        .filter((a) => !a.chosen).length;
    } catch (err) {
      this._items = [];
      this._message = { error: true, text: this.t("common.error", { msg: err.message }) };
    }
  }

  _toggle(key) {
    const excluded = new Set(this._excluded);
    if (excluded.has(key)) excluded.delete(key);
    else excluded.add(key);
    this._excluded = excluded;
  }

  _selectAll(on) {
    this._excluded = on ? new Set() : new Set((this._items || []).map((i) => i.key));
  }

  async _push() {
    if (!this._target) {
      this._message = { error: true, text: this.t("shop.no_target") };
      return;
    }
    this._busy = true;
    this._message = null;
    try {
      const result = await this.api.shoppingPush({
        start_date: this._start,
        days: this._days,
        entity_id: this._target,
        skip_existing: this._skip,
        keys: this._items.filter((i) => !this._excluded.has(i.key)).map((i) => i.key),
      });
      this._message = {
        text: this.t("shop.result", { added: result.added.length, skipped: result.skipped.length }),
      };
    } catch (err) {
      this._message = { error: true, text: this.t("common.error", { msg: err.message }) };
    }
    this._busy = false;
  }

  _name(entityId) {
    const state = this.hass.states[entityId];
    return (state && state.attributes.friendly_name) || entityId;
  }

  render() {
    const items = this._items;
    const selected = items ? items.filter((i) => !this._excluded.has(i.key)).length : 0;
    return html`
      <div class="card settings">
        <div class="row wrap">
          <label class="field grow">
            <span>${this.t("shop.start")}</span>
            <input type="date" .value=${this._start} @change=${(e) => (this._start = e.target.value || this._start)} />
          </label>
          <label class="field days">
            <span>${this.t("shop.days")}</span>
            <select @change=${(e) => (this._days = Number(e.target.value))}>
              ${[1, 2, 3, 4, 5, 6, 7, 10, 14].map(
                (n) => html`<option value=${n} ?selected=${n === this._days}>${n}</option>`
              )}
            </select>
          </label>
        </div>
        <label class="field">
          <span>${this.t("shop.target")}</span>
          <select @change=${(e) => (this._target = e.target.value)}>
            ${this._todoLists.map(
              (id) => html`<option value=${id} ?selected=${id === this._target}>${this._name(id)}</option>`
            )}
          </select>
        </label>
        <label class="row check">
          <input type="checkbox" .checked=${this._skip} @change=${(e) => (this._skip = e.target.checked)} />
          <span>${this.t("shop.skip_existing")}</span>
        </label>
        <div class="row">
          ${this._message
            ? html`<span class=${this._message.error ? "error" : "status-ok"}>${this._message.text}</span>`
            : ""}
          <span class="spacer"></span>
          <button class="btn" ?disabled=${this._busy || !selected} @click=${this._push}>
            <ha-icon icon="mdi:cart-arrow-down"></ha-icon>${this.t("shop.push")} (${selected})
          </button>
        </div>
      </div>
      ${this._open ? html`<p class="open-hint">${this.t("shop.open_choices", { n: this._open })}</p>` : ""}
      ${!items
        ? html`<p class="muted">${this.t("common.loading")}</p>`
        : !items.length
        ? html`<p class="muted">${this.t("shop.empty")}</p>`
        : html`
            <div class="row select">
              <button class="chip small" @click=${() => this._selectAll(true)}>${this.t("shop.select_all")}</button>
              <button class="chip small" @click=${() => this._selectAll(false)}>${this.t("shop.select_none")}</button>
            </div>
            <ul class="card list">
              ${items.map(
                (i) => html`<li>
                  <label class="row item">
                    <input type="checkbox" .checked=${!this._excluded.has(i.key)} @change=${() => this._toggle(i.key)} />
                    <span class="text">
                      <span class="name">${i.name}</span>
                      <span class="muted small">${i.dishes.join(", ")}</span>
                    </span>
                    <span class="amount">${i.amount_text}</span>
                  </label>
                </li>`
              )}
            </ul>
          `}
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .settings {
        padding: 14px;
        margin-bottom: 12px;
      }
      .wrap {
        flex-wrap: wrap;
        align-items: flex-end;
      }
      .grow {
        flex: 1 1 180px;
      }
      .days {
        flex: 0 0 110px;
      }
      .check {
        margin-bottom: 12px;
      }
      input[type="checkbox"] {
        width: 22px;
        height: 22px;
        flex: none;
        accent-color: var(--primary-color);
      }
      .select {
        margin-bottom: 8px;
      }
      .open-hint {
        background: var(--secondary-background-color, #f3f3f3);
        border-left: 4px solid var(--ep-warn);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .list li + li {
        border-top: 1px solid var(--divider-color, #eee);
      }
      .item {
        padding: 10px 14px;
        min-height: 52px;
      }
      .text {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .small {
        font-size: 12px;
      }
      .amount {
        font-weight: 500;
        white-space: nowrap;
      }
    `,
  ];
}

customElements.define("ep-shopping-view", ShoppingView);
