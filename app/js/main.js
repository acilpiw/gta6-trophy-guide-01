// main.js — boot and wiring for Leonida Platinum.
// Loads the trophy data from beside the app (never the network), restores
// progress, and keeps the list, detail pane, roadmap and missables in sync.

import {
  loadState,
  saveState,
  setEarned,
  setCount,
  exportState,
  importState,
  resetState,
} from "./store.js";
import { filterTrophies } from "./filters.js";
import { renderProgress, renderList, renderDetail, renderRoadmap, renderMissables } from "./render.js";

const doc = document;
let data = null;
let state = loadState();
let currentView = "trophies";

function currentFilters() {
  return {
    search: doc.querySelector("#search").value,
    kind: doc.querySelector("#kind-filter").value,
    grade: doc.querySelector("#grade-filter").value,
    shield: doc.querySelector("#spoiler-toggle").checked,
    hideEarned: doc.querySelector("#hide-earned").checked,
  };
}

function selectedTrophy() {
  return data.trophies.find((trophy) => trophy.id === state.selectedId) ?? data.trophies[0];
}

function showView(view) {
  currentView = view;
  for (const section of doc.querySelectorAll(".view")) {
    section.hidden = section.id !== `view-${view}`;
  }
  for (const tab of doc.querySelectorAll("#view-tabs .tab")) {
    tab.classList.toggle("is-active", tab.dataset.view === view);
  }
}

function refresh() {
  if (!data) return;
  const filters = currentFilters();
  const visible = filterTrophies(data.trophies, filters, state);
  renderProgress(doc, data.trophies, state);
  renderList(doc, visible, data.trophies, state, filters, handlers);
  renderDetail(doc, selectedTrophy(), state, filters, handlers);
  renderRoadmap(doc, data, state, handlers);
  renderMissables(doc, data, state, handlers);
}

const handlers = {
  onSelect(id, view) {
    state.selectedId = id;
    saveState(state);
    if (view) showView(view);
    refresh();
    doc.querySelector("#trophy-detail")?.scrollIntoView({ block: "nearest" });
  },
  onToggleEarned(id, value) {
    setEarned(state, id, value);
    state.selectedId = id;
    saveState(state);
    refresh();
  },
  onCountChange(id, value) {
    const trophy = data.trophies.find((item) => item.id === id);
    if (!trophy?.target) return;
    setCount(state, id, value, trophy.target.total);
    refresh();
  },
};

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = doc.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wireControls() {
  for (const id of ["#search", "#kind-filter", "#grade-filter", "#spoiler-toggle", "#hide-earned"]) {
    doc.querySelector(id).addEventListener("input", refresh);
    doc.querySelector(id).addEventListener("change", refresh);
  }
  for (const tab of doc.querySelectorAll("#view-tabs .tab")) {
    tab.addEventListener("click", () => showView(tab.dataset.view));
  }
  doc.querySelector("#export-btn").addEventListener("click", () => {
    download("leonida-platinum-progress.json", exportState(state));
  });
  doc.querySelector("#import-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      state = importState(await file.text());
      saveState(state);
      refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Import failed.");
    } finally {
      event.target.value = "";
    }
  });
  doc.querySelector("#reset-btn").addEventListener("click", () => {
    if (!window.confirm("Clear all earned ticks and counters in this browser?")) return;
    state = resetState();
    refresh();
  });
}

async function boot() {
  const response = await fetch("data/trophies.json");
  if (!response.ok) throw new Error(`trophies.json answered ${response.status}`);
  data = await response.json();
  if (!Array.isArray(data.trophies) || data.trophies.length !== 55) {
    throw new Error("trophies.json must hold all 55 trophies.");
  }
  if (!data.trophies.some((trophy) => trophy.id === state.selectedId)) state.selectedId = 1;
  wireControls();
  // Seed a believable mid-run save only when the page is opened with
  // ?seed=demo (used for the entry screenshots); normal visits start clean
  // or with the visitor's own saved progress.
  if (new URLSearchParams(window.location.search).get("seed") === "demo") {
    for (const id of [2, 3, 4, 5, 8, 9, 10, 16, 21, 28, 35, 42, 44]) {
      state.earned[String(id)] = true;
    }
    state.counts = { "15": 87, "17": 19, "28": 7, "31": 34, "35": 46, "42": 21 };
    state.selectedId = 37;
    saveState(state);
  }
  refresh();
}

boot().catch((error) => {
  const status = doc.querySelector("#filter-status");
  if (status) status.textContent = `Could not load the trophy data: ${error.message}`;
});
