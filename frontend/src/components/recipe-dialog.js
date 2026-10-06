// Rezeptansicht: Bild, Zutaten (skalierbar), Zubereitung, Verträglichkeit.
import { html, css } from "lit";
import { EpDialog } from "./dialog.js";
import { imageUrl, scaledAmount } from "../api.js";

class RecipeDialog extends EpDialog {
  static properties = {
    ...EpDialog.properties,
    dishId: { attribute: false },
    servings: { attribute: false },
    _servings: { state: true },
    _check: { state: true },
  };

  constructor() {
    super();
    this._servings = null;
    this._check = null;
    this._checkedId = null;
  }

  updated(changed) {
    if (this.dishId && this.dishId !== this._checkedId && this.api) {
      this._checkedId = this.dishId;
      this._servings = null;
      this.api.dishCheck(this.dishId).then((r) => (this._check = r)).catch(() => (this._check = {}));
    }
  }

  _reason(r) {
    return this.t(`reason.${r.code}`, r);
  }

  render() {
    const dish = this.dish(this.dishId);
    if (!dish) return "";
    const servings = this._servings ?? this.servings ?? dish.base_servings;
    const factor = servings / (dish.base_servings || 1);
    const url = imageUrl(dish.image);
    const body = html`
      ${url ? html`<img class="hero" src=${url} alt="" />` : ""}
      <div class="meta row">
        ${dish.duration_min
          ? html`<span class="row"><ha-icon icon="mdi:timer-outline"></ha-icon>${this.t("dish.minutes", { n: dish.duration_min })}</span>`
          : ""}
        <span class="spacer"></span>
        <span class="muted">${this.t("dish.servings")}</span>
        <button class="icon-btn" @click=${() => (this._servings = Math.max(0.5, servings - (servings > 1 ? 1 : 0.5)))}>
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <strong>${String(servings).replace(".", ",")}</strong>
        <button class="icon-btn" @click=${() => (this._servings = servings + 1)}>
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
      ${dish.tags.length ? html`<div class="chips">${dish.tags.map((t) => html`<span class="chip small">${t}</span>`)}</div>` : ""}

      <h3>${this.t("dish.ingredients")}</h3>
      <ul class="ingredients">
        ${dish.ingredients.map(
          (i) => html`<li><span class="amount">${scaledAmount(i, factor)}</span><span>${i.name}</span></li>`
        )}
      </ul>

      ${dish.steps.length
        ? html`<h3>${this.t("dish.steps")}</h3>
            <ol class="steps">
              ${dish.steps.map((s) => html`<li>${s}</li>`)}
            </ol>`
        : ""}
      ${dish.source_url
        ? html`<p><a href=${dish.source_url} target="_blank" rel="noopener">${this.t("dish.source")}</a></p>`
        : ""}

      <h3>${this.t("dish.compat")}</h3>
      ${!this._check
        ? html`<p class="muted">${this.t("common.loading")}</p>`
        : this.profiles.map((p) => {
            const c = this._check[p.id] || { status: "excluded", reasons: [] };
            const reasons = c.reasons.filter((r) => r.status !== "ok");
            return html`<div class="compat">
              <div class="row">
                <span class="dot ${c.status}">${p.name.slice(0, 1).toUpperCase()}</span>
                <strong>${p.name}</strong>
                <span class="status-${c.status}">${this.t(`status.${c.status}`)}</span>
              </div>
              ${reasons.length
                ? html`<ul class="reasons">
                    ${reasons.map((r) => html`<li class="status-${r.status}">${this._reason(r)}</li>`)}
                  </ul>`
                : ""}
            </div>`;
          })}
    `;
    const footer = html`
      <button class="btn flat" @click=${() => this.close()}>${this.t("common.close")}</button>
      <button class="btn" @click=${() => this.emit("ep-open", { type: "dish", dishId: dish.id })}>
        <ha-icon icon="mdi:pencil"></ha-icon>${this.t("dish.edit")}
      </button>
    `;
    return this.shell(dish.name, body, footer);
  }

  static styles = [
    ...EpDialog.styles,
    css`
      .hero {
        width: 100%;
        max-height: 260px;
        object-fit: cover;
        border-radius: 10px;
        margin-bottom: 8px;
      }
      .meta {
        margin-bottom: 8px;
      }
      h3 {
        font-size: 15px;
        margin: 18px 0 8px;
      }
      .ingredients {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .ingredients li {
        display: flex;
        gap: 12px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color, #eee);
      }
      .amount {
        flex: 0 0 80px;
        text-align: right;
        font-weight: 500;
      }
      .steps {
        padding-left: 22px;
        margin: 0;
      }
      .steps li {
        padding: 4px 0;
        line-height: 1.45;
      }
      .compat {
        margin-bottom: 10px;
      }
      .reasons {
        margin: 4px 0 0 30px;
        padding: 0;
        font-size: 13px;
      }
    `,
  ];
}

customElements.define("ep-recipe-dialog", RecipeDialog);
