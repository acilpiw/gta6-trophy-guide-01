// filters.js — pure filtering and spoiler rules for Leonida Platinum.
// No DOM here: main.js gathers the control values, render.js draws results.

import { isEarned } from "./store.js";

export function isStoryTrophy(trophy) {
  return trophy.kinds.includes("story");
}

// The spoiler shield hides a story trophy's name and description until the
// player has earned it. Hidden (secret) trophies that are not story
// trophies keep their real text: the shield is about story spoilers only.
export function isShielded(trophy, shieldOn, state) {
  if (!shieldOn) return false;
  if (!isStoryTrophy(trophy)) return false;
  return !isEarned(state, trophy.id);
}

export function shownName(trophy, shieldOn, state) {
  return isShielded(trophy, shieldOn, state) ? "Hidden story trophy" : trophy.name;
}

export function shownDescription(trophy, shieldOn, state) {
  return isShielded(trophy, shieldOn, state)
    ? "Shielded by the spoiler setting. Earn this story trophy to reveal it, or turn the shield off."
    : trophy.description;
}

export function matchesKind(trophy, kind) {
  if (kind === "all") return true;
  if (kind === "missable") return trophy.missable === true;
  return trophy.kinds.includes(kind);
}

export function matchesGrade(trophy, grade) {
  return grade === "all" || trophy.grade === grade;
}

export function matchesSearch(trophy, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kinds.join(" "), `stage ${trophy.stage}`]
    .join(" ")
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function filterTrophies(trophies, filters, state) {
  return trophies.filter((trophy) => {
    if (!matchesKind(trophy, filters.kind)) return false;
    if (!matchesGrade(trophy, filters.grade)) return false;
    if (!matchesSearch(trophy, filters.search)) return false;
    if (filters.hideEarned && isEarned(state, trophy.id)) return false;
    return true;
  });
}

export function nextUnearned(trophies, state) {
  const ordered = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
  return ordered.find((trophy) => !isEarned(state, trophy.id)) ?? null;
}

export function stageProgress(trophies, state, stage) {
  const inStage = trophies.filter((trophy) => trophy.stage === stage);
  const done = inStage.filter((trophy) => isEarned(state, trophy.id)).length;
  return { done, total: inStage.length, trophies: inStage };
}
