// filters.js — which trophies the tracker shows, and the spoiler rule.
// Kinds follow the official descriptions: story missions and chapters, missable moments, collectibles and
// long counters, activities, crime & partner set-pieces, and money & property. The spoiler shield hides the
// name and official description of a story trophy until that trophy is earned; guides stay readable so a
// stuck player can still plan without seeing the story beat named.

export function trophyMatchesFilters(trophy, state) {
  const { filters, progress } = state;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.missableOnly && !trophy.missable) return false;
  const isEarned = progress.earned.has(trophy.name);
  if (filters.status === 'earned' && !isEarned) return false;
  if (filters.status === 'unearned' && isEarned) return false;
  if (filters.search) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

export function isSpoilerHidden(trophy, state) {
  return Boolean(
    state.filters.spoiler && trophy.kind === 'story' && !state.progress.earned.has(trophy.name),
  );
}

export function displayName(trophy, state) {
  return isSpoilerHidden(trophy, state) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, state) {
  return isSpoilerHidden(trophy, state)
    ? 'Name and description hidden by the spoiler shield until this story trophy is earned.'
    : trophy.description;
}
