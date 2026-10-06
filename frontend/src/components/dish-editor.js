// Gericht anlegen/bearbeiten inkl. Bild (Upload oder URL).
import { html, css } from "lit";
import { EpDialog } from "./dialog.js";
import { MEAL_TYPES, imageUrl, ingredientLine } from "../api.js";

class DishEditor extends EpDialog {
  static properties = {
    ...EpDialog.properties,
    dishId: { attribute: false },
    _form: { state: true },
    _busy: { state: true },
    _imageBusy: { state: true },
    _error: { state: true },
    _confirmDelete: { state: true },
    _imageUrlInput: { state: true },
  };

  constructor() {
    super();
    this._form = null;
    this._busy = false;
    this._imageBusy = false;
    this._error = null;
    this._confirmDelete = false;
    this._imageUrlInput = "";
    this._initFor = undefined;
  }

  willUpdate() {
    if (this.data && this._initFor !== this.dishId) {
      this._initFor = this.dishId;
      const d = this.dishId ? this.dish(this.dishId) : null;
      this._form = {
        name: d ? d.name : "",
        meal_types: d ? [...d.meal_types] : ["lunch", "dinner"],
        suitable_for: d ? [...d.suitable_for] : [],
        base_servings: d ? d.base_servings : 2,
        duration_min: d && d.duration_min ? d.duration_min : "",
        tags: d ? d.tags.join(", ") : "",
        ingredients: d ? d.ingredients.map(ingredientLine).join("\n") : "",
        steps: d ? d.steps.join("\n") : "",
        source_url: (d && d.source_url) || "",
        image: d ? d.image : null,
      };
    }
  }

  _set(key, value) {
    this._form = { ...this._form, [key]: value };
  }

  _toggle(key, value) {
    const list = this._form[key];
    this._set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async _upload(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    await this._withImageBusy(() => this.api.uploadImage(file));
    ev.target.value = "";
  }

  async _fromUrl() {
    const url = this._imageUrlInput.trim();
    if (!url) return;
    await this._withImageBusy(async () => {
      const r = await this.api.imageFromUrl(url);
      return { id: r.id, source: r.source, origin: r.origin };
    });
    this._imageUrlInput = "";
  }

  async _withImageBusy(fn) {
    this._imageBusy = true;
    this._error = null;
    try {
      this._set("image", await fn());
    } catch (err) {
      this._error = err.message || String(err);
    }
    this._imageBusy = false;
  }

  async _save() {
    const f = this._form;
    if (!f.name.trim()) {
      this._error = `${this.t("edit.name")}?`;
      return;
    }
    this._busy = true;
    this._error = null;
    try {
      const ingredients = await this.api.parseIngredients(f.ingredients);
      const dish = {
        name: f.name.trim(),
        meal_types: f.meal_types.length ? f.meal_types : ["lunch", "dinner"],
        suitable_for: f.suitable_for,
        base_servings: Number(f.base_servings) || 2,
        duration_min: f.duration_min ? Number(f.duration_min) : null,
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        ingredients,
        steps: f.steps.split("\n").map((s) => s.trim()).filter(Boolean),
        source_url: f.source_url.trim() || null,
        image: f.image || null,
      };
      if (this.dishId) dish.id = this.dishId;
      const saved = await this.api.saveDish(dish);
      this.emit("ep-open", { type: "recipe", dishId: saved.id });
    } catch (err) {
      this._error = err.message || String(err);
    }
    this._busy = false;
  }

  async _delete() {
    if (!this._confirmDelete) {
      this._confirmDelete = true;
      return;
    }
    this._busy = true;
    try {
      await this.api.deleteDish(this.dishId);
      this.close();
    } catch (err) {
      this._error = err.message || String(err);
      this._busy = false;
    }
  }

  render() {
    const f = this._form;
    if (!f) return "";
    const url = imageUrl(f.image);
    const body = html`
      <label class="field">
        <span>${this.t("edit.name")}</span>
        <input type="text" .value=${f.name} @input=${(e) => this._set("name", e.target.value)} />
      </label>

      <div class="field">
        <span class="label">${this.t("edit.image")}</span>
        <div class="image-row">
          ${url
            ? html`<img class="preview" src=${url} alt="" />`
            : html`<span class="thumb preview"><ha-icon icon="mdi:image-outline"></ha-icon></span>`}
          <div class="image-actions">
            <label class="btn outline upload">
              <ha-icon icon="mdi:camera"></ha-icon>${this.t("edit.upload")}
              <input type="file" accept="image/*" @change=${this._upload} hidden />
            </label>
            ${url
              ? html`<button class="btn flat" @click=${() => this._set("image", null)}>${this.t("edit.image_remove")}</button>`
              : ""}
          </div>
        </div>
        <div class="row url-row">
          <input
            type="url"
            placeholder=${this.t("edit.image_url")}
            .value=${this._imageUrlInput}
            @input=${(e) => (this._imageUrlInput = e.target.value)}
          />
          <button class="btn outline" ?disabled=${!this._imageUrlInput || this._imageBusy} @click=${this._fromUrl}>
            ${this.t("edit.image_from_url")}
          </button>
        </div>
        ${this._imageBusy ? html`<div class="help">${this.t("edit.uploading")}</div>` : ""}
      </div>

      <div class="field">
        <span class="label">${this.t("edit.meal_types")}</span>
        <div class="chips">
          ${MEAL_TYPES.map(
            (m) => html`<button class="chip ${f.meal_types.includes(m) ? "on" : ""}" @click=${() => this._toggle("meal_types", m)}>
              ${this.t(`meal.${m}`)}
            </button>`
          )}
        </div>
      </div>

      <div class="field">
        <span class="label">${this.t("edit.suitable_for")}</span>
        <div class="chips">
          ${this.profiles.map(
            (p) => html`<button class="chip ${f.suitable_for.includes(p.id) ? "on" : ""}" @click=${() => this._toggle("suitable_for", p.id)}>
              ${p.name}
            </button>`
          )}
        </div>
      </div>

      <div class="row two">
        <label class="field">
          <span>${this.t("edit.base_servings")}</span>
          <input type="number" min="0.5" step="0.5" inputmode="decimal" .value=${String(f.base_servings)}
            @input=${(e) => this._set("base_servings", e.target.value)} />
        </label>
        <label class="field">
          <span>${this.t("edit.duration")}</span>
          <input type="number" min="0" step="5" inputmode="numeric" .value=${String(f.duration_min)}
            @input=${(e) => this._set("duration_min", e.target.value)} />
        </label>
      </div>

      <label class="field">
        <span>${this.t("edit.ingredients")}</span>
        <textarea rows="8" .value=${f.ingredients} @input=${(e) => this._set("ingredients", e.target.value)}></textarea>
        <div class="help">${this.t("edit.ingredients_help")}</div>
      </label>

      <label class="field">
        <span>${this.t("edit.steps")}</span>
        <textarea rows="6" .value=${f.steps} @input=${(e) => this._set("steps", e.target.value)}></textarea>
      </label>

      <label class="field">
        <span>${this.t("edit.tags")}</span>
        <input type="text" .value=${f.tags} @input=${(e) => this._set("tags", e.target.value)} />
      </label>

      <label class="field">
        <span>${this.t("edit.source_url")}</span>
        <input type="url" .value=${f.source_url} @input=${(e) => this._set("source_url", e.target.value)} />
      </label>

      ${this._error ? html`<p class="error">${this._error}</p>` : ""}
    `;
    const footer = html`
      ${this.dishId
        ? html`<button class="btn ${this._confirmDelete ? "danger" : "flat"}" ?disabled=${this._busy} @click=${this._delete}>
            ${this._confirmDelete ? this.t("common.confirm_delete") : this.t("common.delete")}
          </button>`
        : ""}
      <span class="spacer"></span>
      <button class="btn flat" @click=${() => this.close()}>${this.t("common.cancel")}</button>
      <button class="btn" ?disabled=${this._busy || this._imageBusy} @click=${this._save}>${this.t("common.save")}</button>
    `;
    return this.shell(this.dishId ? this.t("edit.title") : this.t("edit.new_title"), body, footer);
  }

  static styles = [
    ...EpDialog.styles,
    css`
      .label {
        display: block;
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 6px;
      }
      .field {
        margin-bottom: 14px;
        display: block;
      }
      .image-row {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 8px;
      }
      .preview {
        width: 96px;
        height: 96px;
        border-radius: 10px;
        object-fit: cover;
      }
      .image-actions {
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: flex-start;
      }
      .upload {
        cursor: pointer;
      }
      .url-row input {
        flex: 1;
      }
      .two > * {
        flex: 1;
      }
    `,
  ];
}

customElements.define("ep-dish-editor", DishEditor);
