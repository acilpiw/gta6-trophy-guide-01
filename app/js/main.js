// main.js — Leonida Platinum entry point.
//
// Boot order: pull the trophy catalogue (a relative path inside app/, so the
// guide works with the network cable pulled), restore saved progress, build
// the single UI state object, attach every control, then paint.
//
// Wiring summary:
//   - the three view tabs switch tracker / roadmap / missables sections
//   - search, grade, kind and status filters plus the missable-only and
//     spoiler-shield toggles all funnel into one refresh()
//   - export / import / reset act on the store module
//   - list interactions (earn checkbox, row selection, counter edits,
//     "open in tracker" jumps) arrive through the actions object below
//
// Honest-start note: a first visit begins at 0 of 55. Nothing is pre-ticked
// in the shipped code; demo progress in screenshots was seeded only inside
// the capturing browser session.

import { trophyMatchesFilters } from './filters.js';
import {
  renderDetail,
  renderList,
  renderMissables,
  renderProgress,
  renderRoadmap,
} from './render.js';
import {
  exportProgress,
  loadProgress,
  parseImportedProgress,
  saveProgress,
} from './store.js';

const catalogueResponse = await fetch('data/trophies.json');
const data = await catalogueResponse.json();
const validNames = new Set(data.trophies.map((t) => t.name));

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

function switchView(viewName) {
  ui.view = viewName;
  for (const tab of document.querySelectorAll('.view-tabs .tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === viewName);
  }
  document.getElementById('view-tracker').hidden = viewName !== 'tracker';
  document.getElementById('view-roadmap').hidden = viewName !== 'roadmap';
  document.getElementById('view-missables').hidden = viewName !== 'missables';
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
    if (Number.isFinite(value) && value >= 0) {
      ui.progress.counts[name] = value;
    }
    saveProgress(ui.progress);
    refresh();
  },

  openInTracker(name) {
    ui.selected = name;
    switchView('tracker');
  },
};

for (const tab of document.querySelectorAll('.view-tabs .tab')) {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
}

function wireFilter(id, eventName, apply) {
  document.getElementById(id).addEventListener(eventName, (event) => {
    apply(event);
    refresh();
  });
}

wireFilter('search', 'input', (e) => { ui.filters.search = e.target.value; });
wireFilter('filter-grade', 'change', (e) => { ui.filters.grade = e.target.value; });
wireFilter('filter-kind', 'change', (e) => { ui.filters.kind = e.target.value; });
wireFilter('filter-status', 'change', (e) => { ui.filters.status = e.target.value; });
wireFilter('filter-missable', 'change', (e) => { ui.filters.missableOnly = e.target.checked; });
wireFilter('spoiler', 'change', (e) => { ui.filters.spoiler = e.target.checked; });

document.getElementById('export').addEventListener('click', () => {
  exportProgress(ui.progress);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    ui.progress = parseImportedProgress(await file.text(), validNames);
    saveProgress(ui.progress);
    refresh();
  } catch {
    els.showing.textContent = 'That file could not be imported as progress.';
  } finally {
    event.target.value = '';
  }
});

document.getElementById('reset').addEventListener('click', () => {
  ui.progress = { earned: new Set(), counts: {} };
  saveProgress(ui.progress);
  refresh();
});

refresh();
