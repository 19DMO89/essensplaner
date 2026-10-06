// Basis für Dialoge: Vollbild am Handy, Escape/Hintergrund schließt.
import { html } from "lit";
import { EpElement } from "../base.js";
import { dialogStyles, sharedStyles } from "../styles.js";

export class EpDialog extends EpElement {
  static styles = [sharedStyles, dialogStyles];

  constructor() {
    super();
    this._onKey = (ev) => {
      if (ev.key === "Escape") this.close();
    };
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }

  close() {
    this.emit("ep-close");
  }

  /** Dialoggerüst: Titel, Inhalt, Fußzeile mit Aktionen. */
  shell(title, body, footer = "") {
    return html`
      <div class="backdrop" @click=${(e) => e.target === e.currentTarget && this.close()}>
        <div class="dialog" role="dialog" aria-modal="true" aria-label=${title}>
          <header>
            <h2>${title}</h2>
            <button class="icon-btn" @click=${() => this.close()} aria-label=${this.t("common.close")}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </header>
          <div class="body">${body}</div>
          ${footer ? html`<footer>${footer}</footer>` : ""}
        </div>
      </div>
    `;
  }
}
