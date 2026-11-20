// filters.js — pure predicates that decide what the tracker list shows.
//
// The UI state object is owned by main.js and passed in whole:
//   ui.filters  -> { grade, kind, status, search, missableOnly, spoiler }
//   ui.progress -> { earned: Set<string>, counts: Object }
//
// Kind notes: the select offers story / collectibles / activities / crime /
// money / platinum, plus a special "missable" value. That value is not a
// stored kind on any trophy — it is treated here as a shortcut meaning
// "only trophies flagged missable".
//
// Spoiler shield: with the shield switched on, an unearned story trophy is
// presented under a placeholder name and description. The guide body is
// deliberately left readable so a stuck player can still plan.

function haystack(trophy) {
  return `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
}

export function trophyMatchesFilters(trophy, ui) {
  const f = ui.filters;
  const isEarned = ui.progress.earned.has(trophy.name);

  if (f.grade !== 'all' && trophy.grade !== f.grade) return false;

  if (f.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (f.kind !== 'all' && trophy.kind !== f.kind) {
    return false;
  }

  if (f.missableOnly && !trophy.missable) return false;

  if (f.status === 'earned' && !isEarned) return false;
  if (f.status === 'unearned' && isEarned) return false;

  const needle = String(f.search || '').trim().toLowerCase();
  if (needle && !haystack(trophy).includes(needle)) return false;

  return true;
}

export function isSpoilerHidden(trophy, ui) {
  return Boolean(
    ui.filters.spoiler &&
    trophy.kind === 'story' &&
    !ui.progress.earned.has(trophy.name),
  );
}

export function displayName(trophy, ui) {
  return isSpoilerHidden(trophy, ui) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, ui) {
  if (!isSpoilerHidden(trophy, ui)) return trophy.description;
  return 'Hidden by the spoiler shield — earn this story trophy to reveal its name and description.';
}
