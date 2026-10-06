// Klick-Liste: pro Person jede Zutat als verträglich / nur wenig / nicht verträglich markieren.
import { html, css } from "lit";
import { EpDialog } from "./dialog.js";
import { formatNumber } from "../api.js";

const FILTERS = ["all", "unknown", "tolerated", "small", "not_tolerated"];
const BUTTONS = [
  { state: "tolerated", icon: "mdi:check", cls: "ok" },
  { state: "small", icon: "mdi:approximately-equal", cls: "warn" },
  { state: "not_tolerated", icon: "mdi:close", cls: "bad" },
];
const PAGE = 80;

function parseLimit(text) {
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*(.*)$/.exec(text || "");
  if (!m) return { max_amount: null, unit: null };
  return { max_amount: Number(m[1].replace(",", ".")), unit: m[2].trim() || null };
}

class IngredientDialog extends EpDialog {
  static properties = {
    ...EpDialog.properties,
    profileId: { attribute: false },
    _items: { state: true },
    _filter: { state: true },
    _query: { state: true },
    _limit: { state: true },
    _pending: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this._items = null;
    this._filter = "all";
    this._query = "";
    this._limit = PAGE;
    this._pending = new Set();
    this._error = null;
    this._loadedFor = null;
  }

  updated() {
    if (this.api && this.profileId && this._loadedFor !== this.profileId) {
      this._loadedFor = this.profileId;
      this.api
        .profileIngredients(this.profileId)
        .then((items) => (this._items = items))
        .catch((err) => (this._error = err.message || String(err)));
    }
  }

  get _profile() {
    return this.profiles.find((p) => p.id === this.profileId);
  }

  get _visible() {
    const words = this._query.toLowerCase().split(/\s+/).filter(Boolean);
    return (this._items || [])
      .filter((i) => this._filter === "all" || i.state === this._filter)
      .filter((i) => !words.length || words.every((w) => i.name.toLowerCase().includes(w)));
  }

  async _set(item, state, limit = {}) {
    // Erneuter Klick auf den aktiven Zustand setzt die Zutat zurück auf "offen".
    const target = item.explicit && item.state === state && !limit.keep ? "unknown" : state;
    this._pending = new Set([...this._pending, item.name]);
    this._error = null;
    try {
      this._items = await this.api.setIngredient({
        profile_id: this.profileId,
        name: item.name,
        state: target,
        max_amount: limit.max_amount ?? item.max_amount ?? null,
        unit: limit.unit ?? item.unit ?? null,
      });
    } catch (err) {
      this._error = err.message || String(err);
    }
    const pending = new Set(this._pending);
    pending.delete(item.name);
    this._pending = pending;
  }

  _setLimit(item, text) {
    const limit = parseLimit(text);
    this._set(item, "small", { ...limit, keep: true });
  }

  _addNew(state) {
    const name = this._query.trim();
    if (!name) return;
    this._set({ name, state: "unknown", explicit: false }, state);
    this._query = "";
  }

  _counts() {
    const counts = Object.fromEntries(FILTERS.map((f) => [f, 0]));
    for (const i of this._items || []) {
      counts.all += 1;
      counts[i.state] += 1;
    }
    return counts;
  }

  render() {
    const profile = this._profile;
    if (!profile) return "";
    const title = this.t("ingr.title", { name: profile.name });
    if (!this._items) {
      return this.shell(title, html`<p class="muted">${this._error || this.t("common.loading")}</p>`);
    }
    const counts = this._counts();
    const visible = this._visible;
    const query = this._query.trim().toLowerCase();
    const exact = query && this._items.some((i) => i.name.toLowerCase() === query);
    const body = html`
      ${profile.unknown_ingredients === "exclude"
        ? html`<p class="hint">${this.t("ingr.hint_exclude")}</p>`
        : ""}
      <div class="sticky">
        <input type="search" placeholder=${this.t("ingr.search")} .value=${this._query}
          @input=${(e) => {
            this._query = e.target.value;
            this._limit = PAGE;
          }} />
        <div class="chips filters">
          ${FILTERS.map(
            (f) => html`<button class="chip small ${this._filter === f ? "on" : ""}"
              @click=${() => {
                this._filter = f;
                this._limit = PAGE;
              }}>${this.t(`ingr.filter.${f}`)} (${counts[f]})</button>`
          )}
        </div>
        <div class="legend muted">
          <span><span class="mini ok">✓</span>${this.t("ingr.state.tolerated")}</span>
          <span><span class="mini warn">≈</span>${this.t("ingr.state.small")}</span>
          <span><span class="mini bad">✕</span>${this.t("ingr.state.not_tolerated")}</span>
        </div>
      </div>

      ${query && !exact
        ? html`<div class="item new">
            <span class="text"><span class="name">„${this._query.trim()}“ ${this.t("ingr.add")}</span></span>
            ${this._buttons({ name: this._query.trim(), state: "unknown", explicit: false }, (s) => this._addNew(s))}
          </div>`
        : ""}

      <ul class="list">
        ${visible.slice(0, this._limit).map((item) => this._renderItem(item))}
      </ul>
      ${visible.length > this._limit
        ? html`<div class="more"><button class="btn outline" @click=${() => (this._limit += PAGE)}>
            + ${Math.min(PAGE, visible.length - this._limit)}</button></div>`
        : ""}
      ${!visible.length && !query ? html`<p class="muted">${this.t("ingr.none")}</p>` : ""}
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
    `;
    const footer = html`<button class="btn" @click=${() => this.close()}>${this.t("ingr.done")}</button>`;
    return this.shell(title, body, footer);
  }

  _buttons(item, onClick) {
    const busy = this._pending.has(item.name);
    return html`<span class="seg">
      ${BUTTONS.map((b) => {
        const active = item.state === b.state;
        const cls = active ? (item.explicit ? `on ${b.cls}` : `implied ${b.cls}`) : "";
        return html`<button class="segbtn ${cls}" ?disabled=${busy}
          aria-pressed=${active && item.explicit} aria-label=${this.t(`ingr.state.${b.state}`)}
          title=${this.t(`ingr.state.${b.state}`)}
          @click=${() => onClick(b.state)}>${b.cls === "ok" ? "✓" : b.cls === "warn" ? "≈" : "✕"}</button>`;
      })}
    </span>`;
  }

  _renderItem(item) {
    const limitText = item.max_amount !== null && item.max_amount !== undefined
      ? [formatNumber(item.max_amount), item.unit].filter(Boolean).join(" ")
      : "";
    return html`<li class="item">
      <span class="text">
        <span class="name">${item.name}</span>
        <span class="sub muted">
          ${item.count ? this.t("ingr.count", { n: item.count }) : this.t("ingr.no_dish")}
          ${!item.explicit && item.by
            ? html` · <span class="status-${item.state === "tolerated" ? "ok" : item.state === "small" ? "warn" : "excluded"}">
                ${this.t(`ingr.by.${item.state}`, { term: item.by })}</span>`
            : ""}
        </span>
        ${item.state === "small" && item.explicit
          ? html`<label class="limit">
              <span class="muted">${this.t("ingr.limit")}</span>
              <input type="text" placeholder="z. B. 10 g" .value=${limitText}
                @change=${(e) => this._setLimit(item, e.target.value)} />
            </label>`
          : ""}
      </span>
      ${this._buttons(item, (state) => this._set(item, state))}
    </li>`;
  }

  static styles = [
    ...EpDialog.styles,
    css`
      .hint {
        background: var(--secondary-background-color, #f3f3f3);
        border-left: 4px solid var(--ep-warn);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        margin: 0 0 12px;
      }
      .sticky {
        position: sticky;
        top: -16px;
        z-index: 1;
        background: var(--card-background-color, #fff);
        padding: 4px 0 8px;
      }
      .filters {
        margin-top: 8px;
      }
      .legend {
        display: flex;
        gap: 14px;
        font-size: 12px;
        margin-top: 8px;
        flex-wrap: wrap;
      }
      .legend > span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .mini {
        display: inline-flex;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
      }
      .mini.ok,
      .segbtn.on.ok {
        background: var(--ep-ok);
      }
      .mini.warn,
      .segbtn.on.warn {
        background: var(--ep-warn);
      }
      .mini.bad,
      .segbtn.on.bad {
        background: var(--ep-bad);
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .item.new {
        border-bottom: 2px solid var(--primary-color);
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .name {
        font-weight: 500;
        overflow-wrap: anywhere;
      }
      .sub {
        font-size: 12px;
      }
      .limit {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        margin-top: 4px;
      }
      .limit input {
        width: 110px;
        padding: 4px 8px;
        font-size: 14px;
      }
      .seg {
        display: inline-flex;
        flex: none;
        border: 1px solid var(--divider-color, #ccc);
        border-radius: 10px;
        overflow: hidden;
      }
      .segbtn {
        width: 44px;
        height: 40px;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 17px;
        font-weight: 600;
      }
      .segbtn + .segbtn {
        border-left: 1px solid var(--divider-color, #ccc);
      }
      .segbtn.on {
        color: #fff;
      }
      .segbtn.implied.ok {
        color: var(--ep-ok);
        box-shadow: inset 0 0 0 2px var(--ep-ok);
      }
      .segbtn.implied.warn {
        color: var(--ep-warn);
        box-shadow: inset 0 0 0 2px var(--ep-warn);
      }
      .segbtn.implied.bad {
        color: var(--ep-bad);
        box-shadow: inset 0 0 0 2px var(--ep-bad);
      }
      .segbtn[disabled] {
        opacity: 0.5;
      }
      .more {
        text-align: center;
        margin-top: 12px;
      }
    `,
  ];
}

customElements.define("ep-ingredient-dialog", IngredientDialog);
