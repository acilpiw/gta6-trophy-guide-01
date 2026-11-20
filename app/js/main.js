// main.js — application entry point for Leonida Platinum.
//
// Startup sequence: fetch the trophy data (a relative file inside app/, so the
// guide keeps working with the network switched off), restore any saved
// progress, build the UI state, wire every control, and render once.
//
// Controls wired here: the three view tabs, text search, the grade / kind /
// status selects, the missable-only and spoiler-shield toggles, export /
// import / reset, and — through the actions object passed to render.js —
// earning toggles, selection, counter edits and "open in tracker" jumps.
//
// First-visit behaviour: progress starts empty, honestly at 0 of 55. Nothing
// is pre-ticked; any seeded progress seen in screenshots was seeded only in
// the browser session that captured them, never in this shipped code.

import { trophyMatchesFilters } from './filters.js';
import {
  renderDetail,
  renderList,
  renderMissables,
  renderProgress,
  renderRoadmap,
} from './render.js';
import { exportProgress, loadProgress, parseImportedProgress, saveProgress } from './store.js';

const response = await fetch('data/trophies.json');
const data = await response.json();
const knownNames = new Set(data.trophies.map((t) => t.name));

const ui = {
  progress: loadProgress(),
  selected: data.trophies[0].name,
  view: 'tracker',
  filters: {
    grade: 'all',
    kind: 'all',
    status: 'all',
    search: '',
    missableOnly: false,
    spoiler: false,
  },
};

const els = {
  list: document.getElementById('list'),
  detail: document.getElementById('detail'),
  showing: document.getElementById('showing'),
  progressText: document.getElementById('progress-text'),
  progressBar: document.getElementById('progress-bar'),
  gradeText: document.getElementById('grade-text'),
  roadmap: document.getElementById('roadmap-list'),
  missables: document.getElementById('missable-list'),
};

function refresh() {
  renderProgress(data, ui.progress, els);
  renderList(data, ui, els, actions);
  renderDetail(data, ui, els, actions);
  renderRoadmap(data, els);
  renderMissables(data, ui, els, actions);
}

function showView(name) {
  ui.view = name;
  document.querySelectorAll('.view-tabs .tab').forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.view === name);
  });
  document.getElementById('view-tracker').hidden = name !== 'tracker';
  document.getElementById('view-roadmap').hidden = name !== 'roadmap';
  document.getElementById('view-missables').hidden = name !== 'missables';
  refresh();
}

const actions = {
  matches: (trophy) => trophyMatchesFilters(trophy, ui),
  toggleEarned(name, on) {
    if (on) ui.progress.earned.add(name);
    else ui.progress.earned.delete(name);
    saveProgress(ui.progress);
    refresh();
  },
  select(name) {
    ui.selected = name;
    refresh();
  },
  setCount(name, value) {
    if (Number.isFinite(value) && value >= 0) ui.progress.counts[name] = value;
    saveProgress(ui.progress);
    refresh();
  },
  openInTracker(name) {
    ui.selected = name;
    showView('tracker');
  },
};

document.querySelectorAll('.view-tabs .tab').forEach((tab) => {
  tab.addEventListener('click', () => showView(tab.dataset.view));
});

const bind = (id, event, apply) => {
  document.getElementById(id).addEventListener(event, (e) => {
    apply(e);
    refresh();
  });
};
bind('search', 'input', (e) => { ui.filters.search = e.target.value; });
bind('filter-grade', 'change', (e) => { ui.filters.grade = e.target.value; });
bind('filter-kind', 'change', (e) => { ui.filters.kind = e.target.value; });
bind('filter-status', 'change', (e) => { ui.filters.status = e.target.value; });
bind('filter-missable', 'change', (e) => { ui.filters.missableOnly = e.target.checked; });
bind('spoiler', 'change', (e) => { ui.filters.spoiler = e.target.checked; });

document.getElementById('export').addEventListener('click', () => {
  exportProgress(ui.progress);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    ui.progress = parseImportedProgress(await file.text(), knownNames);
    saveProgress(ui.progress);
    refresh();
  } catch {
    els.showing.textContent = 'That file could not be imported as progress.';
  } finally {
    e.target.value = '';
  }
});

document.getElementById('reset').addEventListener('click', () => {
  ui.progress = { earned: new Set(), counts: {} };
  saveProgress(ui.progress);
  refresh();
});

refresh();
