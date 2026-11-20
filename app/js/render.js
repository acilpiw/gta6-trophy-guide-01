// render.js — all DOM construction for Leonida Platinum.
//
// Rule of the house: trophy text reaches the page through textContent only.
// Nothing from the data file is ever parsed as HTML, so a name or guide
// paragraph renders character-for-character as written.
//
// The detail pane is the heart of the screen: grade pill, official wording,
// kind/position line, an optional counter editor for counted trophies, the
// guide prose, numbered steps, and a source line linking both public lists.

import { displayDescription, displayName, isSpoilerHidden } from './filters.js';

const SOURCE_LINKS = [
  ['Exophase list', 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/'],
  ['PSNProfiles list', 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi'],
];

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function pillFor(trophy) {
  return el('span', `pill ${trophy.grade}`, trophy.grade);
}

function missableBadge(longForm) {
  return el('span', 'miss-tag', longForm ? 'MISSABLE — do it when the moment appears' : 'MISSABLE');
}

export function renderProgress(data, progress, els) {
  const byGrade = new Map();
  let earnedTotal = 0;
  for (const trophy of data.trophies) {
    const bucket = byGrade.get(trophy.grade) || { got: 0, all: 0 };
    bucket.all += 1;
    if (progress.earned.has(trophy.name)) {
      bucket.got += 1;
      earnedTotal += 1;
    }
    byGrade.set(trophy.grade, bucket);
  }
  const total = data.trophies.length;
  const pct = total === 0 ? 0 : Math.round((earnedTotal / total) * 100);
  els.progressText.textContent = `${earnedTotal} of ${total} earned · ${pct}%`;
  els.progressBar.style.width = `${pct}%`;
  const g = (grade) => byGrade.get(grade) || { got: 0, all: 0 };
  els.gradeText.textContent =
    `Platinum ${g('platinum').got}/${g('platinum').all} · ` +
    `Gold ${g('gold').got}/${g('gold').all} · ` +
    `Silver ${g('silver').got}/${g('silver').all} · ` +
    `Bronze ${g('bronze').got}/${g('bronze').all}`;
}

export function renderList(data, ui, els, actions) {
  const visible = data.trophies.filter(actions.matches);
  els.showing.textContent = `Showing ${visible.length} of ${data.trophies.length} trophies`;

  const rows = visible.map((trophy) => {
    const row = el('button', 'trophy-row' + (ui.selected === trophy.name ? ' is-selected' : ''));
    row.type = 'button';

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = ui.progress.earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => actions.toggleEarned(trophy.name, box.checked));

    const main = el('span');
    const nameLine = el('span', 'trophy-name', displayName(trophy, ui));
    if (trophy.missable) nameLine.append(missableBadge(false));
    main.append(nameLine, el('span', 'trophy-desc', displayDescription(trophy, ui)));
    if (trophy.target) {
      const current = ui.progress.counts[trophy.name] ?? 0;
      main.append(el('span', 'trophy-count',
        `Progress: ${current} / ${trophy.target} ${trophy.targetLabel || ''}`.trim()));
    }

    row.append(box, main, pillFor(trophy));
    row.addEventListener('click', () => actions.select(trophy.name));
    return row;
  });

  els.list.replaceChildren(...rows);
}

export function renderDetail(data, ui, els, actions) {
  const trophy = data.trophies.find((t) => t.name === ui.selected) || data.trophies[0];
  const children = [pillFor(trophy)];

  if (trophy.missable) children.push(missableBadge(true));
  children.push(el('h2', null, displayName(trophy, ui)));
  children.push(el('p', 'official-line', `Official description: “${displayDescription(trophy, ui)}”`));
  children.push(el('p', 'meta-line', `Kind: ${trophy.kind} · Trophy #${trophy.id} of 55`));

  if (trophy.target) {
    const strip = el('div', 'counter-strip');
    strip.append(el('span', null, `Counted progress — ${trophy.targetLabel || 'progress'}: `));
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target);
    input.value = String(ui.progress.counts[trophy.name] ?? 0);
    input.setAttribute('aria-label', `Counted progress for ${trophy.name}`);
    input.addEventListener('change', () => actions.setCount(trophy.name, Number(input.value)));
    strip.append(input, el('span', null, ` / ${trophy.target}`));
    children.push(strip);
  }

  children.push(el('h3', null, 'Guide — in our own words, with sources'));
  children.push(el('p', null, trophy.guide));

  if (Array.isArray(trophy.steps) && trophy.steps.length > 0) {
    children.push(el('h3', null, 'Steps'));
    const list = el('ol');
    for (const step of trophy.steps) list.append(el('li', null, step));
    children.push(list);
  }

  const source = el('p', 'source-line');
  source.append(document.createTextNode(`Sources: ${trophy.sources} `));
  if (!isSpoilerHidden(trophy, ui)) {
    SOURCE_LINKS.forEach(([label, href], index) => {
      if (index > 0) source.append(document.createTextNode(' · '));
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.textContent = label;
      source.append(anchor);
    });
  }
  children.push(source);

  els.detail.replaceChildren(...children);
}

export function renderRoadmap(data, els) {
  const cards = (data.roadmap || []).map((stage) => {
    const card = el('section', 'stage-card');
    card.append(
      el('h3', null, `Stage ${stage.stage}: ${stage.title}`),
      el('span', 'stage-hours', stage.hours),
      el('p', null, stage.text),
    );
    const chips = el('div', 'chip-row');
    for (const name of stage.trophies || []) chips.append(el('span', 'chip', name));
    card.append(chips);
    return card;
  });
  els.roadmap.replaceChildren(...cards);
}

export function renderMissables(data, ui, els, actions) {
  const cards = [];
  for (const trophy of data.trophies) {
    if (!trophy.missable) continue;
    const card = el('section', 'missable-card');
    const heading = el('h3', null, trophy.name);
    heading.append(missableBadge(false));
    const openButton = el('button', 'open-btn', 'Open in tracker');
    openButton.type = 'button';
    openButton.addEventListener('click', () => actions.openInTracker(trophy.name));
    card.append(
      heading,
      el('p', 'official-line', `Official description: “${trophy.description}” · Grade: ${trophy.grade}`),
      el('p', null, trophy.guide),
      openButton,
    );
    cards.push(card);
  }
  els.missables.replaceChildren(...cards);
}
