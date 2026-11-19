// render.js — drawing the checklist, the guide pane, the roadmap and the missables page.
// Everything is built with textContent / createElement so trophy text is never interpreted as markup.
// The guide pane is the heart of the entry: official name, description and grade, the original guide,
// numbered steps, a counter for counted trophies, and the sources for that trophy, all on one card.

import { displayDescription, displayName, isSpoilerHidden } from './filters.js';

const EXOPHASE_URL = 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/';
const PSNPROFILES_URL = 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderProgress(doc, progress, elements) {
  const total = doc.trophies.length;
  const earnedCount = doc.trophies.filter((t) => progress.earned.has(t.name)).length;
  const pct = total === 0 ? 0 : Math.round((earnedCount / total) * 100);
  elements.progressText.textContent = `${earnedCount} of ${total} earned · ${pct}%`;
  elements.progressBar.style.width = `${pct}%`;
  const byGrade = {};
  for (const t of doc.trophies) {
    byGrade[t.grade] ??= { have: 0, all: 0 };
    byGrade[t.grade].all += 1;
    if (progress.earned.has(t.name)) byGrade[t.grade].have += 1;
  }
  elements.gradeText.textContent =
    `Platinum ${byGrade.platinum.have}/${byGrade.platinum.all} · Gold ${byGrade.gold.have}/${byGrade.gold.all} · ` +
    `Silver ${byGrade.silver.have}/${byGrade.silver.all} · Bronze ${byGrade.bronze.have}/${byGrade.bronze.all}`;
}

export function renderList(doc, state, elements, handlers) {
  elements.list.replaceChildren();
  const visible = doc.trophies.filter((t) => handlers.matches(t));
  elements.showing.textContent = `Showing ${visible.length} of ${doc.trophies.length} trophies`;
  for (const trophy of visible) {
    const row = el('button', 'row' + (state.selected === trophy.name ? ' selected' : ''));
    row.type = 'button';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.progress.earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => handlers.toggleEarned(trophy.name, box.checked));
    const main = el('span');
    const nameLine = el('span', 'name', displayName(trophy, state));
    if (trophy.missable) {
      const flag = el('span', 'flag', 'MISSABLE');
      nameLine.append(flag);
    }
    main.append(nameLine, el('span', 'desc', displayDescription(trophy, state)));
    if (trophy.target) {
      const current = state.progress.counts[trophy.name] ?? 0;
      main.append(el('span', 'count', `Progress: ${current} / ${trophy.target} ${trophy.targetLabel ?? ''}`));
    }
    const badge = el('span', `badge ${trophy.grade}`, trophy.grade);
    row.append(box, main, badge);
    row.addEventListener('click', () => handlers.select(trophy.name));
    elements.list.append(row);
  }
}

export function renderDetail(doc, state, elements, handlers) {
  const trophy = doc.trophies.find((t) => t.name === state.selected) ?? doc.trophies[0];
  const pane = elements.detail;
  pane.replaceChildren();
  const badge = el('span', `badge ${trophy.grade}`, trophy.grade);
  pane.append(badge);
  if (trophy.missable) pane.append(el('span', 'flag', 'MISSABLE — do it when the moment appears'));
  pane.append(el('h2', '', displayName(trophy, state)));
  pane.append(el('p', 'official', `Official description: “${displayDescription(trophy, state)}”`));
  pane.append(el('p', '', `Kind: ${trophy.kind} · Trophy #${trophy.id} of 55`));

  if (trophy.target) {
    const counter = el('div', 'counter-box');
    const label = el('span', '', `Counted progress — ${trophy.targetLabel ?? 'progress'}: `);
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target);
    input.value = String(state.progress.counts[trophy.name] ?? 0);
    input.addEventListener('change', () => handlers.setCount(trophy.name, Number(input.value)));
    counter.append(label, input, el('span', '', ` / ${trophy.target}`));
    pane.append(counter);
  }

  pane.append(el('h3', '', 'Guide — in our own words, with sources'));
  pane.append(el('p', '', trophy.guide));
  if (Array.isArray(trophy.steps) && trophy.steps.length > 0) {
    pane.append(el('h3', '', 'Steps'));
    const list = el('ol');
    for (const step of trophy.steps) list.append(el('li', '', step));
    pane.append(list);
  }
  const sources = el('p', 'sources');
  sources.append(document.createTextNode(`Sources: ${trophy.sources} `));
  if (!isSpoilerHidden(trophy, state)) {
    const exo = document.createElement('a');
    exo.href = EXOPHASE_URL;
    exo.textContent = 'Exophase list';
    const psn = document.createElement('a');
    psn.href = PSNPROFILES_URL;
    psn.textContent = 'PSNProfiles list';
    sources.append(exo, document.createTextNode(' · '), psn);
  }
  pane.append(sources);
}

export function renderRoadmap(doc, elements) {
  elements.roadmap.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const card = el('section', 'stage');
    card.append(el('h3', '', `Stage ${stage.stage}: ${stage.title}`));
    card.append(el('span', 'hours', stage.hours));
    card.append(el('p', '', stage.text));
    const chips = el('div', 'chips');
    for (const name of stage.trophies ?? []) chips.append(el('span', 'chip', name));
    card.append(chips);
    elements.roadmap.append(card);
  }
}

export function renderMissables(doc, state, elements, handlers) {
  elements.missables.replaceChildren();
  for (const trophy of doc.trophies.filter((t) => t.missable)) {
    const card = el('section', 'miss-card');
    const title = el('h3', '', trophy.name);
    title.append(el('span', 'flag', 'MISSABLE'));
    card.append(title);
    card.append(el('p', 'official', `Official description: “${trophy.description}” · Grade: ${trophy.grade}`));
    card.append(el('p', '', trophy.guide));
    const open = el('button', 'tab', 'Open in tracker');
    open.type = 'button';
    open.addEventListener('click', () => handlers.openInTracker(trophy.name));
    card.append(open);
    elements.missables.append(card);
  }
}
