// store.js — saving and restoring tracker progress.
//
// Progress is a small JSON object kept in localStorage under a single key:
//   { "earned": ["trophy name", ...], "counts": { "trophy name": 123 } }
// In memory it travels as { earned: Set, counts: Object } so lookups stay cheap.
// Export writes the same shape to a downloadable file; import reads a file back
// and drops any trophy name that is not on the official list before storing it.

export const PROGRESS_KEY = 'leonida-platinum-progress-v1';

function blankProgress() {
  return { earned: new Set(), counts: {} };
}

export function loadProgress() {
  let raw = null;
  try {
    raw = localStorage.getItem(PROGRESS_KEY);
  } catch {
    return blankProgress();
  }
  if (!raw) return blankProgress();
  try {
    const data = JSON.parse(raw);
    const earned = Array.isArray(data?.earned) ? data.earned : [];
    const counts =
      data?.counts && typeof data.counts === 'object' && !Array.isArray(data.counts)
        ? data.counts
        : {};
    return { earned: new Set(earned), counts };
  } catch {
    return blankProgress();
  }
}

export function saveProgress(progress) {
  const payload = { earned: Array.from(progress.earned), counts: progress.counts };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable (private mode, quota). The tracker still
    // works for the session; progress simply will not survive a reload.
  }
}

export function exportProgress(progress) {
  const text = JSON.stringify(
    {
      game: 'Grand Theft Auto VI',
      earned: Array.from(progress.earned),
      counts: progress.counts,
    },
    null,
    2,
  );
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leonida-platinum-progress.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportedProgress(fileText, knownNames) {
  const data = JSON.parse(fileText);
  const list = Array.isArray(data) ? data : data?.earned;
  if (!Array.isArray(list)) {
    throw new Error('import file has no earned list');
  }
  const earned = new Set();
  for (const name of list) {
    if (knownNames.has(name)) earned.add(name);
  }
  const counts = {};
  const rawCounts = !Array.isArray(data) ? data?.counts : null;
  if (rawCounts && typeof rawCounts === 'object') {
    for (const [name, value] of Object.entries(rawCounts)) {
      const num = Number(value);
      if (knownNames.has(name) && Number.isFinite(num) && num >= 0) counts[name] = num;
    }
  }
  return { earned, counts };
}
