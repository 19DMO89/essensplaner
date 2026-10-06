// Person anlegen/bearbeiten.
import { html } from "lit";
import { EpDialog } from "./dialog.js";
import { formatNumber } from "../api.js";

const LISTS = ["tolerated", "not_tolerated", "likes", "dislikes"];
const MODES = ["exclude", "warn", "allow"];

function splitLines(text) {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

class ProfileEditor extends EpDialog {
  static properties = {
    ...EpDialog.properties,
    profileId: { attribute: false },
    _form: { state: true },
    _busy: { state: true },
    _error: { state: true },
    _confirmDelete: { state: true },
  };

  constructor() {
    super();
    this._form = null;
    this._busy = false;
    this._error = null;
    this._confirmDelete = false;
    this._initFor = undefined;
  }

  willUpdate() {
    if (this.data && this._initFor !== this.profileId) {
      this._initFor = this.profileId;
      const p = this.profileId ? this.profiles.find((x) => x.id === this.profileId) : null;
      this._form = {
        name: p ? p.name : "",
        servings: p ? p.servings : 1,
        unknown_ingredients: p ? p.unknown_ingredients : "exclude",
        max_duration: p && p.max_duration ? p.max_duration : "",
        small_amounts: p
          ? p.small_amounts
              .map((s) => (s.max_amount !== null && s.max_amount !== undefined
                ? [formatNumber(s.max_amount), s.unit, s.name].filter(Boolean).join(" ")
                : s.name))
              .join("\n")
          : "",
        ...Object.fromEntries(LISTS.map((k) => [k, p ? p[k].join("\n") : ""])),
      };
    }
  }

  _set(key, value) {
    this._form = { ...this._form, [key]: value };
  }

  async _save() {
    const f = this._form;
    if (!f.name.trim()) {
      this._error = `${this.t("profile.name")}?`;
      return;
    }
    this._busy = true;
    this._error = null;
    try {
      // Kleine Mengen: Zeilen wie "10 g Butter" mit dem Zutatenparser lesen.
      const small = await this.api.parseIngredients(f.small_amounts);
      const profile = {
        name: f.name.trim(),
        servings: Number(f.servings) || 1,
        unknown_ingredients: f.unknown_ingredients,
        max_duration: f.max_duration ? Number(f.max_duration) : null,
        small_amounts: small.map((i) => ({ name: i.name, max_amount: i.amount, unit: i.unit })),
        ...Object.fromEntries(LISTS.map((k) => [k, splitLines(f[k])])),
      };
      if (this.profileId) profile.id = this.profileId;
      const saved = await this.api.saveProfile(profile);
      if (this.profileId) this.close();
      // Neue Person: gleich mit der Zutatenliste weitermachen.
      else this.emit("ep-open", { type: "ingredients", profileId: saved.id });
    } catch (err) {
      this._error = err.message || String(err);
      this._busy = false;
    }
  }

  async _delete() {
    if (!this._confirmDelete) {
      this._confirmDelete = true;
      return;
    }
    this._busy = true;
    try {
      await this.api.deleteProfile(this.profileId);
      this.close();
    } catch (err) {
      this._error = err.message || String(err);
      this._busy = false;
    }
  }

  _textarea(key, help) {
    return html`<label class="field">
      <span>${this.t(`profile.${key}`)}</span>
      <textarea rows="4" .value=${this._form[key]} @input=${(e) => this._set(key, e.target.value)}></textarea>
      <div class="help">${help}</div>
    </label>`;
  }

  render() {
    const f = this._form;
    if (!f) return "";
    const body = html`
      <label class="field">
        <span>${this.t("profile.name")}</span>
        <input type="text" .value=${f.name} @input=${(e) => this._set("name", e.target.value)} />
      </label>
      <div class="row">
        <label class="field" style="flex:1">
          <span>${this.t("profile.servings")}</span>
          <input type="number" min="0.5" step="0.5" inputmode="decimal" .value=${String(f.servings)}
            @input=${(e) => this._set("servings", e.target.value)} />
        </label>
        <label class="field" style="flex:2">
          <span>${this.t("profile.max_duration")}</span>
          <input type="number" min="0" step="5" inputmode="numeric" .value=${String(f.max_duration)}
            @input=${(e) => this._set("max_duration", e.target.value)} />
        </label>
      </div>
      <label class="field">
        <span>${this.t("profile.unknown")}</span>
        <select @change=${(e) => this._set("unknown_ingredients", e.target.value)}>
          ${MODES.map(
            (m) => html`<option value=${m} ?selected=${f.unknown_ingredients === m}>${this.t(`profile.unknown.${m}`)}</option>`
          )}
        </select>
      </label>
      ${this._textarea("likes", this.t("profile.list_help"))}
      ${this._textarea("dislikes", this.t("profile.list_help"))}
      <details>
        <summary>${this.t("profile.as_text")}</summary>
        <p class="help">${this.t("profile.as_text_help")}</p>
        ${this._textarea("tolerated", this.t("profile.list_help"))}
        ${this._textarea("not_tolerated", this.t("profile.list_help"))}
        ${this._textarea("small_amounts", this.t("profile.small_help"))}
      </details>
      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
    `;
    const footer = html`
      ${this.profileId
        ? html`<button class="btn ${this._confirmDelete ? "danger" : "flat"}" ?disabled=${this._busy} @click=${this._delete}>
            ${this._confirmDelete ? this.t("common.confirm_delete") : this.t("common.delete")}
          </button>`
        : ""}
      <span class="spacer"></span>
      <button class="btn flat" @click=${() => this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy} @click=${this._save}>${this.t("common.save")}</button>
    `;
    return this.shell(this.profileId ? this.t("profile.title") : this.t("profile.new"), body, footer);
  }
}

customElements.define("ep-profile-editor", ProfileEditor);
