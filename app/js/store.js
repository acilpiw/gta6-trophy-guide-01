// store.js — progress persistence for Leonida Platinum.
// Earned trophies and counted progress live in localStorage under one key, as a plain JSON object:
// { earned: [trophy names], counts: { trophy name: number } }. Export downloads that object as a file;
// import reads it back and validates every name against the official list before anything is stored.

export const STORAGE_KEY = 'leonida-platinum-progress-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: new Set(), counts: {} };
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
    };
  } catch {
    return { earned: new Set(), counts: {} };
  }
}

export function saveProgress(progress) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ earned: [...progress.earned], counts: progress.counts }),
  );
}

export function exportProgress(progress) {
  const payload = JSON.stringify(
    { game: 'Grand Theft Auto VI', earned: [...progress.earned], counts: progress.counts },
    null,
    2,
  );
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  link.download = 'leonida-platinum-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseImportedProgress(text, validNames) {
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('No earned list in that file.');
  const earned = new Set(names.filter((name) => validNames.has(name)));
  const counts = {};
  if (parsed && typeof parsed === 'object' && parsed.counts && typeof parsed.counts === 'object') {
    for (const [name, value] of Object.entries(parsed.counts)) {
      if (validNames.has(name) && Number.isFinite(Number(value))) counts[name] = Number(value);
    }
  }
  return { earned, counts };
}
