// render.js — turning trophy data plus UI state into DOM.
//
// Every node is built with createElement and textContent, never by injecting
// trophy text as markup, so names and descriptions render exactly as written.
// The detail pane is the centre of the app: grade pill, official description,
// category line, an optional counter editor for counted trophies, the guide,
// numbered steps, and the per-trophy source line with links to both lists.

import { displayDescription, displayName, isSpoilerHidden } from './filters.js';

const LIST_URLS = {
  exophase: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
  psnprofiles: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
};

function node(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text != null) n.textContent = text;
  return n;
}

function gradePill(trophy) {
  return node('span', `pill ${trophy.grade}`, trophy.grade);
}

export function renderProgress(data, progress, els) {
  const total = data.trophies.length;
  let done = 0;
  const tally = {};
  for (const t of data.trophies) {
    if (!tally[t.grade]) tally[t.grade] = { got: 0, all: 0 };
    tally[t.grade].all += 1;
    if (progress.earned.has(t.name)) {
      done += 1;
      tally[t.grade].got += 1;
    }
  }
  const pct = total ? Math.round((done / total) * 100) : 0;
  els.progressText.textContent = `${done} of ${total} earned · ${pct}%`;
  els.progressBar.style.width = pct + '%';
  els.gradeText.textContent =
    `Platinum ${tally.platinum.got}/${tally.platinum.all} · ` +
    `Gold ${tally.gold.got}/${tally.gold.all} · ` +
    `Silver ${tally.silver.got}/${tally.silver.all} · ` +
    `Bronze ${tally.bronze.got}/${tally.bronze.all}`;
}

export function renderList(data, ui, els, actions) {
  const visible = data.trophies.filter((t) => actions.matches(t));
  els.showing.textContent = `Showing ${visible.length} of ${data.trophies.length} trophies`;

  const rows = [];
  for (const trophy of visible) {
    const row = node('button', 'trophy-row' + (ui.selected === trophy.name ? ' is-selected' : ''));
    row.type = 'button';

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = ui.progress.earned.has(trophy.name);
    check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    check.addEventListener('click', (ev) => ev.stopPropagation());
    check.addEventListener('change', () => actions.toggleEarned(trophy.name, check.checked));

    const body = node('span');
    const title = node('span', 'trophy-name', displayName(trophy, ui));
    if (trophy.missable) title.append(node('span', 'miss-tag', 'MISSABLE'));
    body.append(title);
    body.append(node('span', 'trophy-desc', displayDescription(trophy, ui)));
    if (trophy.target) {
      const now = ui.progress.counts[trophy.name] ?? 0;
      body.append(
        node('span', 'trophy-count', `Progress: ${now} / ${trophy.target} ${trophy.targetLabel || ''}`),
      );
    }

    row.append(check, body, gradePill(trophy));
    row.addEventListener('click', () => actions.select(trophy.name));
    rows.push(row);
  }
  els.list.replaceChildren(...rows);
}

export function renderDetail(data, ui, els, actions) {
  const trophy = data.trophies.find((t) => t.name === ui.selected) || data.trophies[0];
  const pane = els.detail;
  const parts = [];

  parts.push(gradePill(trophy));
  if (trophy.missable) {
    parts.push(node('span', 'miss-tag', 'MISSABLE — do it when the moment appears'));
  }
  parts.push(node('h2', null, displayName(trophy, ui)));
  parts.push(node('p', 'official-line', `Official description: “${displayDescription(trophy, ui)}”`));
  parts.push(node('p', 'meta-line', `Kind: ${trophy.kind} · Trophy #${trophy.id} of 55`));

  if (trophy.target) {
    const strip = node('div', 'counter-strip');
    strip.append(node('span', null, `Counted progress — ${trophy.targetLabel || 'progress'}: `));
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target);
    input.value = String(ui.progress.counts[trophy.name] ?? 0);
    input.setAttribute('aria-label', `Counted progress for ${trophy.name}`);
    input.addEventListener('change', () => actions.setCount(trophy.name, Number(input.value)));
    strip.append(input, node('span', null, ` / ${trophy.target}`));
    parts.push(strip);
  }

  parts.push(node('h3', null, 'Guide — in our own words, with sources'));
  parts.push(node('p', null, trophy.guide));

  if (Array.isArray(trophy.steps) && trophy.steps.length) {
    parts.push(node('h3', null, 'Steps'));
    const ol = node('ol');
    for (const step of trophy.steps) ol.append(node('li', null, step));
    parts.push(ol);
  }

  const src = node('p', 'source-line');
  src.append(document.createTextNode(`Sources: ${trophy.sources} `));
  if (!isSpoilerHidden(trophy, ui)) {
    const a1 = document.createElement('a');
    a1.href = LIST_URLS.exophase;
    a1.textContent = 'Exophase list';
    const a2 = document.createElement('a');
    a2.href = LIST_URLS.psnprofiles;
    a2.textContent = 'PSNProfiles list';
    src.append(a1, document.createTextNode(' · '), a2);
  }
  parts.push(src);

  pane.replaceChildren(...parts);
}

export function renderRoadmap(data, els) {
  const cards = [];
  for (const stage of data.roadmap || []) {
    const card = node('section', 'stage-card');
    card.append(node('h3', null, `Stage ${stage.stage}: ${stage.title}`));
    card.append(node('span', 'stage-hours', stage.hours));
    card.append(node('p', null, stage.text));
    const chips = node('div', 'chip-row');
    for (const name of stage.trophies || []) chips.append(node('span', 'chip', name));
    card.append(chips);
    cards.push(card);
  }
  els.roadmap.replaceChildren(...cards);
}

export function renderMissables(data, ui, els, actions) {
  const cards = [];
  for (const trophy of data.trophies) {
    if (!trophy.missable) continue;
    const card = node('section', 'missable-card');
    const heading = node('h3', null, trophy.name);
    heading.append(node('span', 'miss-tag', 'MISSABLE'));
    card.append(heading);
    card.append(
      node('p', 'official-line', `Official description: “${trophy.description}” · Grade: ${trophy.grade}`),
    );
    card.append(node('p', null, trophy.guide));
    const open = node('button', 'open-btn', 'Open in tracker');
    open.type = 'button';
    open.addEventListener('click', () => actions.openInTracker(trophy.name));
    card.append(open);
    cards.push(card);
  }
  els.missables.replaceChildren(...cards);
}
