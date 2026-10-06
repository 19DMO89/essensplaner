// Personen (Ernährungsprofile).
import { html, css } from "lit";
import { EpElement } from "../base.js";
import { sharedStyles } from "../styles.js";

class ProfilesView extends EpElement {
  _fitting(profileId) {
    return Object.values(this.compat || {}).filter((s) => s[profileId] === "ok" || s[profileId] === "warn")
      .length;
  }

  render() {
    return html`
      <div class="row top">
        <span class="spacer"></span>
        <button class="btn" @click=${() => this.emit("ep-open", { type: "profile", profileId: null })}>
          <ha-icon icon="mdi:account-plus"></ha-icon>${this.t("profile.new")}
        </button>
      </div>
      <div class="grid">
        ${this.profiles.map(
          (p) => html`
            <div class="card profile">
              <span class="avatar">${p.name.slice(0, 1).toUpperCase()}</span>
              <span class="info">
                <span class="name">${p.name}</span>
                <span class="muted small">
                  ${this.t("profile.summary", {
                    tol: p.tolerated.length,
                    not: p.not_tolerated.length,
                    small: p.small_amounts.length,
                  })}
                </span>
                ${(p.excluded_groups || []).length
                  ? html`<span class="chips">${p.excluded_groups.map(
                      (g) => html`<span class="chip small">${this.t("groups.without", { group: this.groupLabel(g) })}</span>`
                    )}</span>`
                  : ""}
                <span class="small">
                  ${this.t(`profile.unknown.${p.unknown_ingredients}`)} ·
                  <strong>${this.t("profile.fitting", { n: this._fitting(p.id) })}</strong>
                </span>
                <span class="actions">
                  <button class="btn" @click=${() => this.emit("ep-open", { type: "ingredients", profileId: p.id })}>
                    <ha-icon icon="mdi:format-list-checks"></ha-icon>${this.t("ingr.open")}
                  </button>
                  <button class="btn flat" @click=${() => this.emit("ep-open", { type: "profile", profileId: p.id })}>
                    <ha-icon icon="mdi:pencil"></ha-icon>${this.t("dish.edit")}
                  </button>
                </span>
              </span>
            </div>
          `
        )}
      </div>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .top {
        margin-bottom: 12px;
      }
      .grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }
      .profile {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px;
        text-align: left;
        color: inherit;
        width: 100%;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 18px;
        flex: none;
      }
      .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
        font-size: 16px;
      }
      .small {
        font-size: 13px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
    `,
  ];
}

customElements.define("ep-profiles-view", ProfilesView);
