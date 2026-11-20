// render.js — all DOM drawing for Leonida Platinum.
// Data in, elements out; every user-visible string from trophies.json is
// inserted with textContent so guide text can never become markup.

import { getCount, isEarned, pointsTotal, earnedTotal } from "./store.js";
import { isShielded, shownDescription, shownName, nextUnearned, stageProgress } from "./filters.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function renderProgress(doc, trophies, state) {
  const done = earnedTotal(state, trophies);
  const points = pointsTotal(state, trophies);
  doc.querySelector("#progress-text").textContent = `${done} of ${trophies.length} earned`;
  doc.querySelector("#progress-bar").style.width = `${Math.round((done / trophies.length) * 100)}%`;
  doc.querySelector("#points-text").textContent = `${points} trophy points`;
  const next = nextUnearned(trophies, state);
  doc.querySelector("#next-tip").textContent = next
    ? `Next up: Stage ${next.stage} — ${next.name}.`
    : "Platinum earned. Leonida is yours.";
}

function chip(text, extraClass) {
  return el("span", `chip ${extraClass ?? ""}`.trim(), text);
}

export function renderList(doc, visible, all, state, filters, handlers) {
  const list = doc.querySelector("#trophy-list");
  list.replaceChildren();
  const status = doc.querySelector("#filter-status");
  status.textContent =
    visible.length === all.length
      ? `Showing all ${all.length} trophies.`
      : `Showing ${visible.length} of ${all.length} trophies.`;
  if (visible.length === 0) {
    list.append(el("li", "empty-note", "No trophies match those filters. Loosen the search or reset a filter."));
    return;
  }
  for (const trophy of visible) {
    const earned = isEarned(state, trophy.id);
    const shielded = isShielded(trophy, filters.shield, state);
    const row = el("li");
    const button = el("button", "trophy-row");
    button.type = "button";
    if (earned) button.classList.add("is-earned");
    if (state.selectedId === trophy.id) button.classList.add("is-selected");
    button.setAttribute("aria-label", `Open guide for ${shownName(trophy, filters.shield, state)}`);
    button.addEventListener("click", (event) => {
      if (event.target instanceof HTMLInputElement) return;
      handlers.onSelect(trophy.id);
    });

    const pick = document.createElement("input");
    pick.type = "checkbox";
    pick.className = "pick";
    pick.checked = earned;
    pick.title = earned ? "Mark as not earned" : "Mark as earned";
    pick.setAttribute("aria-label", `Earned: ${trophy.name}`);
    pick.addEventListener("click", (event) => event.stopPropagation());
    pick.addEventListener("change", () => handlers.onToggleEarned(trophy.id, pick.checked));
    button.append(pick);

    const main = el("span", "row-main");
    main.append(el("span", "row-name", shownName(trophy, filters.shield, state)));
    main.append(el("span", "row-desc", shownDescription(trophy, filters.shield, state)));
    main.style.display = "block";
    const meta = el("span", "row-meta");
    meta.style.display = "flex";
    meta.append(chip(gradeLabel(trophy.grade), `grade-${trophy.grade}`));
    meta.append(chip(`Stage ${trophy.stage}`));
    for (const kind of trophy.kinds) meta.append(chip(kind));
    if (trophy.hidden) meta.append(chip("Hidden on PSN"));
    if (trophy.missable) meta.append(chip("Missable — flagged", "miss"));
    if (earned) meta.append(chip("Earned", "done"));
    if (shielded) meta.append(chip("Spoiler shielded"));
    main.append(meta);
    button.append(main);

    if (trophy.target) {
      const count = getCount(state, trophy.id);
      button.append(el("span", "counter-mini", `${count} / ${trophy.target.total}`));
    }
    row.append(button);
    list.append(row);
  }
}

export function renderDetail(doc, trophy, state, filters, handlers) {
  const pane = doc.querySelector("#trophy-detail");
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el("p", "empty-note", "Pick a trophy to read its guide."));
    return;
  }
  const earned = isEarned(state, trophy.id);
  const shielded = isShielded(trophy, filters.shield, state);

  pane.append(el("p", "kicker", `Trophy ${trophy.id} of 55 · Stage ${trophy.stage} · ${gradeLabel(trophy.grade)} · ${trophy.points} points`));
  pane.append(el("h2", "", shownName(trophy, filters.shield, state)));
  pane.append(el("p", "official", `“${shownDescription(trophy, filters.shield, state)}” — official description`));

  const meta = el("p", "row-meta");
  for (const kind of trophy.kinds) meta.append(chip(kind));
  if (trophy.hidden) meta.append(chip("Hidden on PSN until earned"));
  if (trophy.missable) meta.append(chip("Missable — flagged", "miss"));
  pane.append(meta);

  if (trophy.missable) {
    const warn = el("p", "warn", "Flagged from the official wording: read the guide before passing this point in the game, and keep a manual save first.");
    pane.append(warn);
  }

  pane.append(el("h3", "", "Guide — in our own words"));
  pane.append(el("p", "", trophy.guide));

  pane.append(el("h3", "", "Steps"));
  const steps = el("ol");
  for (const step of trophy.steps) steps.append(el("li", "", step));
  pane.append(steps);

  if (trophy.target) {
    pane.append(el("h3", "", "Your counter"));
    const box = el("div", "counter-box");
    const count = getCount(state, trophy.id);
    box.append(el("span", "", `${trophy.target.label}:`));
    const minus = el("button", "", "−");
    minus.type = "button";
    minus.addEventListener("click", () => handlers.onCountChange(trophy.id, count - 1));
    const out = el("output", "", `${count} / ${trophy.target.total}`);
    const plus = el("button", "", "+");
    plus.type = "button";
    plus.addEventListener("click", () => handlers.onCountChange(trophy.id, count + 1));
    const doneBtn = el("button", "", "Set to total");
    doneBtn.type = "button";
    doneBtn.addEventListener("click", () => handlers.onCountChange(trophy.id, trophy.target.total));
    box.append(minus, out, plus, doneBtn);
    pane.append(box);
  }

  pane.append(el("h3", "", "Sources"));
  pane.append(el("p", "sources", trophy.sources));

  const toggle = el("button", "earn-toggle", earned ? "Earned — tap to undo" : "Mark as earned");
  toggle.type = "button";
  toggle.setAttribute("aria-pressed", String(earned));
  toggle.addEventListener("click", () => handlers.onToggleEarned(trophy.id, !earned));
  pane.append(toggle);
}

export function renderRoadmap(doc, data, state, handlers) {
  const host = doc.querySelector("#roadmap-list");
  host.replaceChildren();
  for (const stage of data.roadmap) {
    const progress = stageProgress(data.trophies, state, stage.stage);
    const card = el("section", "stage-card");
    const heading = el("h3");
    heading.append(el("span", "stage-no", `Stage ${stage.stage} · `));
    heading.append(document.createTextNode(stage.name));
    card.append(heading);
    card.append(el("p", "", stage.summary));
    card.append(el("p", "stage-progress", `${progress.done} of ${progress.total} trophies in this stage earned.`));
    const chips = el("div", "stage-trophies");
    for (const trophy of progress.trophies) {
      const c = chip(
        `${isEarned(state, trophy.id) ? "✓ " : ""}${trophy.name} (${gradeLabel(trophy.grade)})`,
        trophy.missable ? "miss" : "",
      );
      c.title = "Open this trophy in the tracker";
      c.addEventListener("click", () => handlers.onSelect(trophy.id, "trophies"));
      chips.append(c);
    }
    card.append(chips);
    host.append(card);
  }
}

export function renderMissables(doc, data, state, handlers) {
  const host = doc.querySelector("#missable-list");
  host.replaceChildren();
  const flagged = data.trophies.filter((trophy) => trophy.missable);
  for (const trophy of flagged) {
    const card = el("section", "miss-card");
    card.append(el("h3", "", `${trophy.name} — ${gradeLabel(trophy.grade)}, Stage ${trophy.stage}`));
    card.append(el("p", "official", `Official description: “${trophy.description}”`));
    card.append(el("p", "", trophy.guide));
    const open = el("button", "tab", isEarned(state, trophy.id) ? "Earned — open in tracker" : "Open in tracker");
    open.type = "button";
    open.addEventListener("click", () => handlers.onSelect(trophy.id, "trophies"));
    card.append(open);
    host.append(card);
  }
}
