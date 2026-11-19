// main.js — boot and wiring for Leonida Platinum.
// Loads the trophy data from a relative file (the app's only request, served from app/ itself, so the guide
// works with the network off), restores saved progress, and connects the controls: search, grade / kind /
// status filters, the missable-only switch, the spoiler shield, export / import / reset, the three views
// (tracker, roadmap, missables) and the counted-progress inputs in the guide pane.

import { trophyMatchesFilters } from './filters.js';
import { renderDetail, renderList, renderMissables, renderProgress, renderRoadmap } from './render.js';
import { exportProgress, loadProgress, parseImportedProgress, saveProgress } from './store.js';

const doc = await (await fetch('data/trophies.json')).json();
const validNames = new Set(doc.trophies.map((t) => t.name));

const state = {
  progress: loadProgress(),
  selected: doc.trophies[0].name,
  view: 'tracker',
  filters: { grade: 'all', kind: 'all', status: 'all', search: '', missableOnly: false, spoiler: false },
};

const elements = {
  list: document.getElementById('list'),
  detail: document.getElementById('detail'),
  showing: document.getElementById('showing'),
  progressText: document.getElementById('progress-text'),
  progressBar: document.getElementById('progress-bar'),
  gradeText: document.getElementById('grade-text'),
  roadmap: document.getElementById('roadmap-list'),
  missables: document.getElementById('missable-list'),
};

const handlers = {
  matches: (trophy) => trophyMatchesFilters(trophy, state),
  toggleEarned(name, checked) {
    if (checked) state.progress.earned.add(name);
    else state.progress.earned.delete(name);
    saveProgress(state.progress);
    renderAll();
  },
  select(name) {
    state.selected = name;
    renderAll();
  },
  setCount(name, value) {
    if (Number.isFinite(value) && value >= 0) state.progress.counts[name] = value;
    saveProgress(state.progress);
    renderAll();
  },
  openInTracker(name) {
    state.selected = name;
    switchView('tracker');
  },
};

function renderAll() {
  renderProgress(doc, state.progress, elements);
  renderList(doc, state, elements, handlers);
  renderDetail(doc, state, elements, handlers);
  renderRoadmap(doc, elements);
  renderMissables(doc, state, elements, handlers);
}

function switchView(view) {
  state.view = view;
  for (const tab of document.querySelectorAll('#tabs .tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  document.getElementById('view-tracker').hidden = view !== 'tracker';
  document.getElementById('view-roadmap').hidden = view !== 'roadmap';
  document.getElementById('view-missables').hidden = view !== 'missables';
  renderAll();
}

for (const tab of document.querySelectorAll('#tabs .tab')) {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
}
document.getElementById('search').addEventListener('input', (e) => {
  state.filters.search = e.target.value;
  renderAll();
});
document.getElementById('filter-grade').addEventListener('change', (e) => {
  state.filters.grade = e.target.value;
  renderAll();
});
document.getElementById('filter-kind').addEventListener('change', (e) => {
  state.filters.kind = e.target.value;
  renderAll();
});
document.getElementById('filter-status').addEventListener('change', (e) => {
  state.filters.status = e.target.value;
  renderAll();
});
document.getElementById('filter-missable').addEventListener('change', (e) => {
  state.filters.missableOnly = e.target.checked;
  renderAll();
});
document.getElementById('spoiler').addEventListener('change', (e) => {
  state.filters.spoiler = e.target.checked;
  renderAll();
});
document.getElementById('export').addEventListener('click', () => exportProgress(state.progress));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    state.progress = parseImportedProgress(await file.text(), validNames);
    saveProgress(state.progress);
    renderAll();
  } catch {
    document.getElementById('showing').textContent = 'That file could not be imported as progress.';
  }
});
document.getElementById('reset').addEventListener('click', () => {
  state.progress = { earned: new Set(), counts: {} };
  saveProgress(state.progress);
  renderAll();
});

// Revision note (second pass): an earlier draft seeded four "demo" earned trophies on a first visit so the
// first paint looked busy. That was removed — a tracker must never claim a trophy its user did not tick.
// A first visit now honestly starts at 0 of 55; screenshots for this entry seed progress in the browser
// session that takes them, never in the shipped code.
renderAll();
