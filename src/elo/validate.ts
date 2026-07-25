import type { Match } from './types';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidCalendarDate(date: string): boolean {
  if (!DATE_PATTERN.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Validates a full match log and throws one error listing every problem
 * found, so a hand-editor fixes everything in one pass instead of
 * re-running after each fix. See docs/ARCHITECTURE.md §7.
 */
export function validateMatches(matches: Match[]): void {
  const problems: string[] = [];

  matches.forEach((match, index) => {
    const label = `matches[${index}] (${match.date ?? 'no date'})`;

    if (!match.date || !isValidCalendarDate(match.date)) {
      problems.push(`${label}: "date" must be a real calendar date in YYYY-MM-DD format, got ${JSON.stringify(match.date)}.`);
    }

    if (!Array.isArray(match.players) || match.players.length < 2) {
      problems.push(`${label}: "players" must list at least 2 participants.`);
    } else {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      for (const player of match.players) {
        if (seen.has(player)) duplicates.add(player);
        seen.add(player);
      }
      if (duplicates.size > 0) {
        problems.push(`${label}: duplicate name(s) in "players": ${[...duplicates].join(', ')}.`);
      }

      if (!match.winner) {
        problems.push(`${label}: "winner" is missing.`);
      } else if (!match.players.includes(match.winner)) {
        problems.push(
          `${label}: "winner" (${JSON.stringify(match.winner)}) is not in "players" (${match.players.map((p) => JSON.stringify(p)).join(', ')}) — check for a typo.`,
        );
      }
    }
  });

  const namesByNormalized = new Map<string, Set<string>>();
  for (const match of matches) {
    if (!Array.isArray(match.players)) continue;
    for (const name of match.players) {
      const key = normalizeName(name);
      if (!namesByNormalized.has(key)) namesByNormalized.set(key, new Set());
      namesByNormalized.get(key)!.add(name);
    }
  }
  for (const variants of namesByNormalized.values()) {
    if (variants.size > 1) {
      problems.push(
        `Likely typo: these names differ only by case/whitespace and are probably meant to be the same player: ${[...variants].map((v) => JSON.stringify(v)).join(', ')}.`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(`Match log validation failed with ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  }

  let lastDate: string | null = null;
  matches.forEach((match, index) => {
    if (lastDate && match.date < lastDate) {
      console.warn(
        `matches[${index}] (${match.date}) is dated earlier than a previous entry (${lastDate}). ` +
          `Matches are processed in array order, not date order — this is likely a misplaced insert.`,
      );
    }
    lastDate = match.date;
  });
}
