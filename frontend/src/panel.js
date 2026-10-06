// Panel in der Seitenleiste: Wochenplan, Gerichte, Personen, Einkauf.
import { LitElement, html, css } from "lit";
import { Api } from "./api.js";
import { localize } from "./i18n.js";
import { sharedStyles } from "./styles.js";
import "./views/plan-view.js";
import "./views/dishes-view.js";
import "./views/profiles-view.js";
import "./views/shopping-view.js";
import "./components/recipe-dialog.js";
import "./components/dish-editor.js";
import "./components/slot-editor.js";
import "./components/generate-dialog.js";
import "./components/profile-editor.js";

const TABS = [
  { id: "plan", icon: "mdi:calendar-week" },
  { id: "dishes", icon: "mdi:silverware-fork-knife" },
  { id: "profiles", icon: "mdi:account-heart" },
  { id: "shopping", icon: "mdi:cart" },
];

class EssensplanerPanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    route: { attribute: false },
    panel: { attribute: false },
    _tab: { state: true },
    _data: { state: true },
    _compat: { state: true },
    _revision: { state: true },
    _dialog: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this._tab = "plan";
    this._data = null;
    this._compat = {};
    this._revision = 0;
    this._dialog = null;
    this._error = null;
    this._unsub = null;
    this._api = null;
  }

  t(key, params) {
    return localize(this.hass, key, params);
  }

  connectedCallback() {
    super.connectedCallback();
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") && TABS.some((t) => t.id === params.get("tab"))) {
      this._tab = params.get("tab");
    }
    this._openDishId = params.get("dish");
    if (this.hass) this._start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsub) {
      this._unsub.then((unsub) => unsub()).catch(() => {});
      this._unsub = null;
    }
  }

  updated(changed) {
    if (changed.has("hass") && this.hass) {
      if (!this._api) this._start();
      else this._api.hass = this.hass;
    }
  }

  _start() {
    if (this._unsub || !this.hass) return;
    this._api = new Api(this.hass);
    this._load();
    this._unsub = this._api.subscribe(() => this._load());
  }

  async _load() {
    try {
      const [data, compat] = await Promise.all([this._api.data(), this._api.compat()]);
      this._data = data;
      this._compat = compat;
      this._revision += 1;
      this._error = null;
      if (this._openDishId && data.dishes.some((d) => d.id === this._openDishId)) {
        this._dialog = { type: "recipe", dishId: this._openDishId };
        this._openDishId = null;
      }
    } catch (err) {
      this._error = err.message || String(err);
    }
  }

  _toggleMenu() {
    this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
  }

  _setTab(tab) {
    this._tab = tab;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.delete("dish");
    history.replaceState(null, "", url);
  }

  _onOpen(ev) {
    this._dialog = ev.detail;
  }

  _closeDialog() {
    this._dialog = null;
  }

  render() {
    if (!this.hass) return html``;
    const common = {
      hass: this.hass,
      api: this._api,
      data: this._data,
      compat: this._compat,
    };
    return html`
      <div class="toolbar">
        ${this.narrow
          ? html`<button class="icon-btn menu" @click=${this._toggleMenu} aria-label="Menu">
              <ha-icon icon="mdi:menu"></ha-icon>
            </button>`
          : ""}
        <div class="title">${this.t("title")}</div>
      </div>
      <nav class="tabs" role="tablist">
        ${TABS.map(
          (tab) => html`<button
            role="tab"
            class="tab ${this._tab === tab.id ? "active" : ""}"
            aria-selected=${this._tab === tab.id}
            @click=${() => this._setTab(tab.id)}
          >
            <ha-icon icon=${tab.icon}></ha-icon><span>${this.t(`tab.${tab.id}`)}</span>
          </button>`
        )}
      </nav>
      <main @ep-open=${this._onOpen}>
        ${this._error ? html`<p class="error">${this.t("common.error", { msg: this._error })}</p>` : ""}
        ${!this._data
          ? html`<p class="muted loading">${this.t("common.loading")}</p>`
          : this._renderView(common)}
      </main>
      <div @ep-close=${this._closeDialog} @ep-open=${this._onOpen}>${this._renderDialog(common)}</div>
    `;
  }

  _renderView(c) {
    switch (this._tab) {
      case "dishes":
        return html`<ep-dishes-view .hass=${c.hass} .api=${c.api} .data=${c.data} .compat=${c.compat}></ep-dishes-view>`;
      case "profiles":
        return html`<ep-profiles-view .hass=${c.hass} .api=${c.api} .data=${c.data} .compat=${c.compat}></ep-profiles-view>`;
      case "shopping":
        return html`<ep-shopping-view
          .hass=${c.hass}
          .api=${c.api}
          .data=${c.data}
          .compat=${c.compat}
          .revision=${this._revision}
        ></ep-shopping-view>`;
      default:
        return html`<ep-plan-view
          .hass=${c.hass}
          .api=${c.api}
          .data=${c.data}
          .compat=${c.compat}
          .revision=${this._revision}
        ></ep-plan-view>`;
    }
  }

  _renderDialog(c) {
    const d = this._dialog;
    if (!d || !this._data) return "";
    switch (d.type) {
      case "recipe":
        return html`<ep-recipe-dialog .hass=${c.hass} .api=${c.api} .data=${c.data} .compat=${c.compat}
          .dishId=${d.dishId} .servings=${d.servings}></ep-recipe-dialog>`;
      case "dish":
        return html`<ep-dish-editor .hass=${c.hass} .api=${c.api} .data=${c.data} .compat=${c.compat}
          .dishId=${d.dishId}></ep-dish-editor>`;
      case "slot":
        return html`<ep-slot-editor .hass=${c.hass} .api=${c.api} .data=${c.data} .compat=${c.compat}
          .date=${d.date} .mealType=${d.mealType} .assignments=${d.assignments}></ep-slot-editor>`;
      case "generate":
        return html`<ep-generate-dialog .hass=${c.hass} .api=${c.api} .data=${c.data} .compat=${c.compat}
          .start=${d.start}></ep-generate-dialog>`;
      case "profile":
        return html`<ep-profile-editor .hass=${c.hass} .api=${c.api} .data=${c.data} .compat=${c.compat}
          .profileId=${d.profileId}></ep-profile-editor>`;
      default:
        return "";
    }
  }

  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        min-height: 100vh;
        background: var(--primary-background-color);
      }
      .toolbar {
        display: flex;
        align-items: center;
        height: var(--header-height, 56px);
        padding: 0 12px;
        background: var(--app-header-background-color, var(--primary-color));
        color: var(--app-header-text-color, #fff);
        padding-top: env(safe-area-inset-top);
        box-sizing: content-box;
      }
      .toolbar .menu {
        color: inherit;
      }
      .title {
        font-size: 20px;
        margin-left: 8px;
      }
      .tabs {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        background: var(--app-header-background-color, var(--primary-color));
        overflow-x: auto;
        scrollbar-width: none;
      }
      .tab {
        flex: 1;
        min-width: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 8px 4px 6px;
        border: none;
        border-bottom: 3px solid transparent;
        background: transparent;
        color: var(--app-header-text-color, #fff);
        opacity: 0.75;
        font-size: 13px;
      }
      .tab.active {
        opacity: 1;
        border-bottom-color: var(--app-header-text-color, #fff);
      }
      main {
        max-width: 1100px;
        margin: 0 auto;
        padding: 16px 12px calc(32px + env(safe-area-inset-bottom));
      }
      .loading {
        text-align: center;
        padding: 40px 0;
      }
      @media (min-width: 870px) {
        .tab {
          flex-direction: row;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }
      }
    `,
  ];
}

customElements.define("essensplaner-panel", EssensplanerPanel);
