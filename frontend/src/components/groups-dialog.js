// Allergene & Fleisch pro Person: Gruppen per Schalter ausschließen.
import { html, css } from "lit";
import { EpDialog } from "./dialog.js";

const PREVIEW = 6;

class GroupsDialog extends EpDialog {
  static properties = {
    ...EpDialog.properties,
    profileId: { attribute: false },
    back: { attribute: false },
    _groups: { state: true },
    _expanded: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  constructor() {
    super();
    this._groups = null;
    this._expanded = new Set();
    this._busy = false;
    this._error = null;
    this._loadedFor = null;
  }

  updated() {
    if (this.api && this.profileId && this._loadedFor !== this.profileId) {
      this._loadedFor = this.profileId;
      this._load();
    }
  }

  async _load() {
    try {
      this._groups = await this.api.profileGroups(this.profileId);
    } catch (err) {
      this._error = err.message || String(err);
    }
  }

  close() {
    // Aus der Zutatenliste geöffnet: dorthin zurück.
    if (this.back) this.emit("ep-open", this.back);
    else super.close();
  }

  async _toggle(group) {
    const excluded = this._groups.filter((g) => g.excluded).map((g) => g.id);
    const next = group.excluded ? excluded.filter((id) => id !== group.id) : [...excluded, group.id];
    // Sofort anzeigen, dann speichern.
    this._groups = this._groups.map((g) => (g.id === group.id ? { ...g, excluded: !g.excluded } : g));
    this._busy = true;
    this._error = null;
    try {
      await this.api.setGroups(this.profileId, next);
    } catch (err) {
      this._error = err.message || String(err);
      await this._load();
    }
    this._busy = false;
  }

  _toggleExpand(id) {
    const expanded = new Set(this._expanded);
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    this._expanded = expanded;
  }

  _row(group) {
    const expanded = this._expanded.has(group.id);
    const members = expanded ? group.members : group.members.slice(0, PREVIEW);
    return html`<li class="row-item ${group.excluded ? "excluded" : ""}">
      <button class="switch-row" role="switch" aria-checked=${group.excluded} ?disabled=${this._busy}
        @click=${() => this._toggle(group)}>
        <span class="text">
          <span class="name">${this.groupLabel(group.id)}</span>
          <span class="sub muted">
            ${group.count === 1
              ? this.t("groups.affects_one")
              : group.count
              ? this.t("groups.affects", { n: group.count })
              : this.t("groups.affects_none")}
          </span>
        </span>
        <span class="switch ${group.excluded ? "on" : ""}" aria-hidden="true"><span class="knob"></span></span>
      </button>
      ${group.count
        ? html`<div class="members muted">
            ${members.join(", ")}${!expanded && group.count > PREVIEW
              ? html` … <button class="link" @click=${() => this._toggleExpand(group.id)}>
                  ${this.t("groups.show_all", { n: group.count })}</button>`
              : ""}
          </div>`
        : ""}
    </li>`;
  }

  render() {
    const profile = this.profiles.find((p) => p.id === this.profileId);
    if (!profile) return "";
    const title = this.t("groups.title", { name: profile.name });
    if (!this._groups) {
      return this.shell(title, html`<p class="muted">${this._error || this.t("common.loading")}</p>`);
    }
    const allergens = this._groups.filter((g) => g.kind === "allergen");
    const meat = this._groups.filter((g) => g.kind === "meat");
    const active = this._groups.filter((g) => g.excluded).length;
    const body = html`
      <p class="help intro">${this.t("groups.intro")}</p>
      <h3>${this.t("groups.allergens_title")}</h3>
      <ul class="list">${allergens.map((g) => this._row(g))}</ul>
      <h3>${this.t("groups.meat_title")}</h3>
      <ul class="list">${meat.map((g) => this._row(g))}</ul>
      <p class="help">${this.t("groups.disclaimer")}</p>
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
    `;
    const footer = html`
      <span class="muted count">${this.t("groups.active", { n: active })}</span>
      <span class="spacer"></span>
      ${this.back
        ? html`<button class="btn" @click=${() => this.close()}>${this.t("groups.back")}</button>`
        : html`
            <button class="btn flat" @click=${() => this.emit("ep-open", { type: "ingredients", profileId: this.profileId })}>
              ${this.t("ingr.open")}
            </button>
            <button class="btn" @click=${() => this.close()}>${this.t("ingr.done")}</button>
          `}
    `;
    return this.shell(title, body, footer);
  }

  static styles = [
    ...EpDialog.styles,
    css`
      .intro {
        margin-top: 0;
      }
      h3 {
        font-size: 15px;
        margin: 18px 0 6px;
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .row-item {
        border-bottom: 1px solid var(--divider-color, #eee);
        padding: 4px 0 8px;
      }
      .switch-row {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 52px;
        padding: 4px 0;
        border: none;
        background: transparent;
        color: inherit;
        text-align: left;
      }
      .text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .name {
        font-weight: 500;
        font-size: 15px;
      }
      .excluded .name {
        color: var(--ep-bad);
      }
      .sub {
        font-size: 12px;
      }
      .switch {
        flex: none;
        width: 48px;
        height: 28px;
        border-radius: 14px;
        background: var(--divider-color, #ccc);
        position: relative;
        transition: background 0.15s;
      }
      .switch .knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        transition: left 0.15s;
      }
      .switch.on {
        background: var(--ep-bad);
      }
      .switch.on .knob {
        left: 23px;
      }
      .members {
        font-size: 12px;
        line-height: 1.4;
      }
      .link {
        border: none;
        background: none;
        padding: 0;
        color: var(--primary-color);
        font-size: 12px;
      }
      .count {
        font-size: 13px;
        align-self: center;
      }
    `,
  ];
}

customElements.define("ep-groups-dialog", GroupsDialog);
