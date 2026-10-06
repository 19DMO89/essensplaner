// Simuliertes hass-Objekt für die Entwicklungsseite (ohne Home Assistant).
// Start: im Repo-Wurzelverzeichnis `python -m http.server 8123x` o. ä. und
// http://localhost:<port>/frontend/dev/ öffnen.

const ICONS = {
  "mdi:menu": "☰", "mdi:chevron-left": "‹", "mdi:chevron-right": "›", "mdi:plus": "+",
  "mdi:minus": "−", "mdi:pencil": "✎", "mdi:close": "✕", "mdi:auto-fix": "✨",
  "mdi:calendar-week": "📅", "mdi:silverware-fork-knife": "🍴", "mdi:account-heart": "👤",
  "mdi:cart": "🛒", "mdi:cart-arrow-down": "🛒", "mdi:delete-outline": "🗑", "mdi:camera": "📷",
  "mdi:image-outline": "🖼", "mdi:timer-outline": "⏱", "mdi:account-plus": "➕",
};

customElements.define(
  "ha-icon",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["icon"];
    }
    attributeChangedCallback() {
      this.textContent = ICONS[this.getAttribute("icon")] || "•";
      this.style.cssText = "display:inline-flex;width:22px;justify-content:center;font-style:normal";
    }
  }
);

const mock = await (await fetch("./mock-data.json")).json();
const listeners = new Set();
const notify = () => setTimeout(() => listeners.forEach((cb) => cb({ changed: true })), 50);

async function callWS(msg) {
  const type = msg.type.replace("essensplaner/", "");
  console.log("[mock] callWS", type, msg);
  switch (type) {
    case "data":
      return structuredClone(mock.data);
    case "compat/all":
      return mock.compat;
    case "dish/check":
      return mock.checks[msg.dish_id] || {};
    case "plan/get": {
      const out = {};
      const start = new Date(msg.start_date);
      for (let i = 0; i < msg.days; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        out[iso] = mock.plan[iso] || {};
      }
      return out;
    }
    case "plan/set_meal": {
      const day = (mock.plan[msg.date] = mock.plan[msg.date] || {});
      const names = Object.fromEntries(mock.data.dishes.map((d) => [d.id, d.name]));
      if (msg.assignments.length) {
        day[msg.meal_type] = {
          assignments: msg.assignments.map((a) => ({ ...a, locked: true, dish_name: names[a.dish_id] })),
          shared_base: [],
        };
      } else delete day[msg.meal_type];
      notify();
      return {};
    }
    case "plan/generate":
      notify();
      return { days: mock.plan, warnings: mock.warnings };
    case "shopping/preview":
      return mock.shopping;
    case "shopping/push":
      return { added: mock.shopping.filter((i) => msg.keys.includes(i.key)).map((i) => i.summary), skipped: [] };
    case "profile/ingredients":
      return structuredClone(mock.ingredients[msg.profile_id] || []);
    case "profile/set_groups": {
      const profile = mock.data.profiles.find((p) => p.id === msg.profile_id);
      profile.excluded_groups = msg.excluded_groups;
      for (const item of mock.ingredients[msg.profile_id] || []) {
        if (item.explicit) continue;
        const group = msg.excluded_groups.find((g) => (mock.group_members[g] || []).includes(item.name));
        if (group) Object.assign(item, { state: "not_tolerated", group, by: null });
        else if (item.group) Object.assign(item, { state: "unknown", group: null });
      }
      notify();
      return structuredClone(mock.ingredients[msg.profile_id]);
    }
    case "profile/set_ingredient": {
      const list = (mock.ingredients[msg.profile_id] = mock.ingredients[msg.profile_id] || []);
      let item = list.find((i) => i.name.toLowerCase() === msg.name.toLowerCase());
      if (!item) list.unshift((item = { name: msg.name, key: msg.name.toLowerCase(), count: 0 }));
      Object.assign(item, {
        state: msg.state,
        explicit: msg.state !== "unknown",
        by: msg.state !== "unknown" ? msg.name : null,
        max_amount: msg.max_amount,
        unit: msg.unit,
      });
      return structuredClone(list);
    }
    case "parse_ingredients":
      return msg.text
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => ({ name: l.trim(), amount: null, unit: null, role: "other" }));
    case "dish/save": {
      const dish = { ...msg.dish, id: msg.dish.id || `d_new_${Date.now()}`, tags: msg.dish.tags || [] };
      const idx = mock.data.dishes.findIndex((d) => d.id === dish.id);
      if (idx >= 0) mock.data.dishes[idx] = { ...mock.data.dishes[idx], ...dish };
      else mock.data.dishes.push(dish);
      notify();
      return dish;
    }
    case "dish/delete":
      mock.data.dishes = mock.data.dishes.filter((d) => d.id !== msg.dish_id);
      notify();
      return null;
    case "profile/save": {
      const profile = { ...msg.profile, id: msg.profile.id || `p_${Date.now()}` };
      const idx = mock.data.profiles.findIndex((p) => p.id === profile.id);
      if (idx >= 0) mock.data.profiles[idx] = profile;
      else mock.data.profiles.push(profile);
      notify();
      return profile;
    }
    case "profile/delete":
      mock.data.profiles = mock.data.profiles.filter((p) => p.id !== msg.profile_id);
      notify();
      return null;
    default:
      throw new Error(`mock: ${type} nicht implementiert`);
  }
}

const hass = {
  language: "de",
  states: {
    "todo.einkaufsliste": { attributes: { friendly_name: "Einkaufsliste" } },
    "todo.gerichte": { attributes: { friendly_name: "Gerichte" } },
  },
  callWS,
  connection: {
    subscribeMessage: async (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  },
  fetchWithAuth: async () => new Response(JSON.stringify({ message: "kein Upload im Mock" }), { status: 400 }),
};

await import("../../custom_components/essensplaner/frontend/essensplaner-panel.js");
await import("../../custom_components/essensplaner/frontend/essensplaner-card.js");

window.show = (what) => {
  const host = document.getElementById("host");
  host.innerHTML = "";
  if (what === "card") {
    const wrap = document.createElement("div");
    wrap.id = "cardhost";
    const card = document.createElement("essensplaner-today-card");
    card.setConfig({ type: "custom:essensplaner-today-card" });
    card.hass = hass;
    wrap.appendChild(card);
    host.appendChild(wrap);
  } else {
    const panel = document.createElement("essensplaner-panel");
    panel.hass = hass;
    panel.narrow = window.innerWidth < 870;
    host.appendChild(panel);
  }
};
window.show(new URLSearchParams(location.search).get("view") || "panel");
