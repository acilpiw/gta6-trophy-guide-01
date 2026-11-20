// store.js — progress persistence for Leonida Platinum.
// Everything lives under one localStorage key; export and import move the
// same JSON shape so a backup file can travel between browsers.

export const STORAGE_KEY = "leonida-platinum-v1";

export function emptyState() {
  return { earned: {}, counts: {}, selectedId: 1 };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyState();
    return {
      earned: parsed.earned && typeof parsed.earned === "object" ? parsed.earned : {},
      counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      selectedId: Number.isInteger(parsed.selectedId) ? parsed.selectedId : 1,
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). The tracker keeps
    // working in memory for the session rather than failing the page.
  }
}

export function isEarned(state, id) {
  return state.earned[String(id)] === true;
}

export function setEarned(state, id, value) {
  if (value) state.earned[String(id)] = true;
  else delete state.earned[String(id)];
  saveState(state);
}

export function getCount(state, id) {
  const value = Number(state.counts[String(id)]);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function setCount(state, id, value, total) {
  const clamped = Math.max(0, Math.min(Math.floor(Number(value) || 0), total));
  state.counts[String(id)] = clamped;
  saveState(state);
  return clamped;
}

export function earnedTotal(state, trophies) {
  return trophies.reduce((sum, trophy) => sum + (isEarned(state, trophy.id) ? 1 : 0), 0);
}

export function pointsTotal(state, trophies) {
  return trophies.reduce((sum, trophy) => sum + (isEarned(state, trophy.id) ? trophy.points : 0), 0);
}

export function exportState(state) {
  return JSON.stringify(
    { app: "leonida-platinum", version: 1, exportedAt: new Date().toISOString(), earned: state.earned, counts: state.counts },
    null,
    2,
  );
}

export function importState(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") throw new Error("That file is not a progress export.");
  const earned = parsed.earned && typeof parsed.earned === "object" ? parsed.earned : null;
  if (!earned) throw new Error("That file has no earned list.");
  const counts = parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {};
  const cleanEarned = {};
  for (const key of Object.keys(earned)) {
    const id = Number(key);
    if (Number.isInteger(id) && id >= 1 && id <= 55 && earned[key] === true) cleanEarned[String(id)] = true;
  }
  const cleanCounts = {};
  for (const key of Object.keys(counts)) {
    const id = Number(key);
    const value = Number(counts[key]);
    if (Number.isInteger(id) && id >= 1 && id <= 55 && Number.isFinite(value) && value > 0) {
      cleanCounts[String(id)] = Math.floor(value);
    }
  }
  return { earned: cleanEarned, counts: cleanCounts, selectedId: 1 };
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
  return emptyState();
}
