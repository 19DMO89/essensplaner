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
            <button class="card profile" @click=${() => this.emit("ep-open", { type: "profile", profileId: p.id })}>
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
                <span class="small">
                  ${this.t(`profile.unknown.${p.unknown_ingredients}`)} ·
                  <strong>${this.t("profile.fitting", { n: this._fitting(p.id) })}</strong>
                </span>
              </span>
              <ha-icon icon="mdi:chevron-right" class="muted"></ha-icon>
            </button>
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
        align-items: center;
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
    `,
  ];
}

customElements.define("ep-profiles-view", ProfilesView);
