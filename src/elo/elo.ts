import { validateMatches } from './validate';
import type { Match, PlayerStanding, Standings } from './types';

export const ELO_START = 50;
export const ELO_MIN = 1;
export const ELO_MAX = 100;
export const ELO_K_BASE = 8;
export const ELO_EXPECTATION_DIVISOR = 40;

/** Probability that `self` beats `opponent`, on the 1-100 scale (see docs/ARCHITECTURE.md §5.1). */
export function expectedScore(self: number, opponent: number): number {
  return 1 / (1 + 10 ** ((opponent - self) / ELO_EXPECTATION_DIVISOR));
}

/**
 * Applies one match to a ratings map and returns a new map. Decomposes the
 * match into (N-1) winner-vs-loser pairings, each scaled by K_base/(N-1) so
 * a win's total impact doesn't grow with table size (see docs/ARCHITECTURE.md §5.2).
 * Deltas are summed per player across all their pairings in this match, then
 * rounded and clamped once. Pure: same inputs always produce the same output.
 */
export function applyMatch(
  ratings: Readonly<Record<string, number>>,
  match: Match,
): Record<string, number> {
  const n = match.players.length;
  const kMatch = ELO_K_BASE / (n - 1);
  const deltas: Record<string, number> = {};

  for (const player of match.players) {
    if (player === match.winner) continue;
    const eWinner = expectedScore(ratings[match.winner], ratings[player]);
    const delta = kMatch * (1 - eWinner);
    deltas[match.winner] = (deltas[match.winner] ?? 0) + delta;
    deltas[player] = (deltas[player] ?? 0) - delta;
  }

  const next = { ...ratings };
  for (const [name, delta] of Object.entries(deltas)) {
    next[name] = Math.min(ELO_MAX, Math.max(ELO_MIN, Math.round(next[name] + delta)));
  }
  return next;
}

function comparePlayers(a: PlayerStanding, b: PlayerStanding): number {
  if (b.winRate !== a.winRate) return b.winRate - a.winRate;
  if (b.elo !== a.elo) return b.elo - a.elo;
  if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
  return a.name.localeCompare(b.name);
}

/**
 * Folds `applyMatch` over the log in array order, validating first so a
 * malformed entry fails loudly instead of producing partial output.
 */
export function computeStandings(matches: Match[], generatedAt: string = new Date().toISOString()): Standings {
  validateMatches(matches);

  const ratings: Record<string, number> = {};
  const wins: Record<string, number> = {};
  const losses: Record<string, number> = {};

  for (const match of matches) {
    for (const player of match.players) {
      if (!(player in ratings)) {
        ratings[player] = ELO_START;
        wins[player] = 0;
        losses[player] = 0;
      }
    }

    for (const player of match.players) {
      if (player === match.winner) {
        wins[player] += 1;
      } else {
        losses[player] += 1;
      }
    }

    Object.assign(ratings, applyMatch(ratings, match));
  }

  const players: PlayerStanding[] = Object.keys(ratings)
    .map((name) => {
      const gamesPlayed = wins[name] + losses[name];
      return {
        name,
        elo: ratings[name],
        wins: wins[name],
        losses: losses[name],
        gamesPlayed,
        winRate: gamesPlayed > 0 ? wins[name] / gamesPlayed : 0,
      };
    })
    .sort(comparePlayers);

  return {
    generatedAt,
    sourceMatchCount: matches.length,
    players,
  };
}
