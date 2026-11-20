// store.js — persistence for tracker progress.
//
// On disk (localStorage, one key) progress is plain JSON:
//   { "earned": ["Vice Got a Price!", ...], "counts": { "Cunning Stunts": 137 } }
// In memory the rest of the app uses { earned: Set, counts: Object } instead,
// because membership tests on a Set read better at every call site.
//
// Import is defensive on purpose: a file only contributes trophy names that
// exist on the official list and counts that are finite, non-negative
// numbers. Anything else in the file is ignored rather than trusted.

export const PROGRESS_KEY = 'leonida-platinum-progress-v1';

function emptyProgress() {
  return { earned: new Set(), counts: {} };
}

function cleanCounts(raw, knownNames) {
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [name, value] of Object.entries(raw)) {
    const n = Number(value);
    if (knownNames && !knownNames.has(name)) continue;
    if (Number.isFinite(n) && n >= 0) out[name] = n;
  }
  return out;
}

export function loadProgress() {
  let text = null;
  try {
    text = localStorage.getItem(PROGRESS_KEY);
  } catch {
    return emptyProgress();
  }
  if (!text) return emptyProgress();
  try {
    const parsed = JSON.parse(text);
    const earnedList = Array.isArray(parsed?.earned) ? parsed.earned : [];
    return { earned: new Set(earnedList), counts: cleanCounts(parsed?.counts, null) };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  const payload = JSON.stringify({
    earned: [...progress.earned],
    counts: progress.counts,
  });
  try {
    localStorage.setItem(PROGRESS_KEY, payload);
  } catch {
    // Private browsing or a full quota can make storage throw. Losing
    // persistence is acceptable; crashing the tracker is not.
  }
}

export function exportProgress(progress) {
  const doc = {
    game: 'Grand Theft Auto VI',
    earned: [...progress.earned],
    counts: progress.counts,
  };
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-platinum-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

export function parseImportedProgress(fileText, knownNames) {
  const parsed = JSON.parse(fileText);
  const earnedList = Array.isArray(parsed) ? parsed : parsed?.earned;
  if (!Array.isArray(earnedList)) {
    throw new Error('no earned array in import file');
  }
  const earned = new Set(earnedList.filter((name) => knownNames.has(name)));
  const counts = Array.isArray(parsed) ? {} : cleanCounts(parsed?.counts, knownNames);
  return { earned, counts };
}
