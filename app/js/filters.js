// filters.js — deciding which trophies the tracker list shows, and how the
// spoiler shield presents story trophies.
//
// Filter state shape (owned by main.js):
//   { grade, kind, status, search, missableOnly, spoiler }
// "kind" mirrors the categories implied by the official descriptions: story,
// collectibles, activities, crime, money and the platinum itself. Choosing
// kind = "missable" is a shortcut for the missable-only switch.
//
// Spoiler rule: while the shield is on, a story trophy that has not been
// earned yet is shown with a placeholder name and description. Its guide text
// stays visible so a stuck player can still plan around it.

export function trophyMatchesFilters(trophy, ui) {
  const f = ui.filters;
  const earned = ui.progress.earned.has(trophy.name);

  if (f.grade !== 'all' && trophy.grade !== f.grade) return false;

  if (f.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (f.kind !== 'all' && trophy.kind !== f.kind) {
    return false;
  }

  if (f.missableOnly && !trophy.missable) return false;
  if (f.status === 'earned' && !earned) return false;
  if (f.status === 'unearned' && earned) return false;

  const query = (f.search || '').trim().toLowerCase();
  if (query) {
    const text = [trophy.name, trophy.description, trophy.guide, trophy.kind]
      .join(' ')
      .toLowerCase();
    if (!text.includes(query)) return false;
  }
  return true;
}

export function isSpoilerHidden(trophy, ui) {
  if (!ui.filters.spoiler) return false;
  if (trophy.kind !== 'story') return false;
  return !ui.progress.earned.has(trophy.name);
}

export function displayName(trophy, ui) {
  return isSpoilerHidden(trophy, ui) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, ui) {
  return isSpoilerHidden(trophy, ui)
    ? 'Name and description hidden by the spoiler shield until this story trophy is earned.'
    : trophy.description;
}
