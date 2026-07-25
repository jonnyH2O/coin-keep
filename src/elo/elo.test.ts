import { describe, expect, it } from 'vitest';
import { ELO_MAX, ELO_MIN, ELO_START, applyMatch, computeStandings, expectedScore } from './elo';
import type { Match } from './types';

describe('expectedScore', () => {
  it('is 0.5 when ratings are equal', () => {
    expect(expectedScore(50, 50)).toBeCloseTo(0.5, 10);
  });

  it('favors the higher-rated player', () => {
    expect(expectedScore(60, 50)).toBeGreaterThan(0.5);
    expect(expectedScore(50, 60)).toBeLessThan(0.5);
  });

  it('is symmetric', () => {
    expect(expectedScore(60, 50)).toBeCloseTo(1 - expectedScore(50, 60), 10);
  });
});

describe('applyMatch — 4-player worked example (docs/ARCHITECTURE.md §5.4)', () => {
  const ratings = { Alice: 50, Bob: 60, Carol: 45, Dave: 55 };
  const match: Match = { date: '2026-01-01', players: ['Alice', 'Bob', 'Carol', 'Dave'], winner: 'Alice' };
  const result = applyMatch(ratings, match);

  it('matches the documented result exactly', () => {
    expect(result).toEqual({ Alice: 54, Bob: 58, Carol: 44, Dave: 53 });
  });

  it('costs Bob (the opponent Alice was least favored against) the most, and Carol (most favored against) the least', () => {
    expect(60 - result.Bob).toBeGreaterThan(45 - result.Carol);
  });
});

describe('applyMatch — 2-player match', () => {
  it('reduces to a plain pairwise update (K_match = K_base)', () => {
    const ratings = { Alice: 54, Bob: 49 };
    const match: Match = { date: '2026-01-02', players: ['Alice', 'Bob'], winner: 'Bob' };
    expect(applyMatch(ratings, match)).toEqual({ Alice: 49, Bob: 54 });
  });
});

describe('applyMatch — clamping', () => {
  it('never produces a rating below ELO_MIN', () => {
    const ratings = { Underdog: 1, Champ: 100 };
    const match: Match = { date: '2026-01-01', players: ['Underdog', 'Champ'], winner: 'Champ' };
    expect(applyMatch(ratings, match).Underdog).toBeGreaterThanOrEqual(ELO_MIN);
  });

  it('never produces a rating above ELO_MAX', () => {
    const ratings = { Underdog: 1, Champ: 100 };
    const match: Match = { date: '2026-01-01', players: ['Underdog', 'Champ'], winner: 'Underdog' };
    expect(applyMatch(ratings, match).Underdog).toBeLessThanOrEqual(ELO_MAX);
  });
});

describe('computeStandings', () => {
  const matches: Match[] = [
    { date: '2026-01-01', players: ['Alice', 'Bob', 'Carol', 'Dave'], winner: 'Alice' },
    { date: '2026-01-02', players: ['Alice', 'Bob'], winner: 'Bob' },
  ];

  it('produces the documented standings.json example (docs/ARCHITECTURE.md §4.2)', () => {
    const standings = computeStandings(matches, '2026-07-25T14:03:00Z');
    expect(standings.sourceMatchCount).toBe(2);
    expect(standings.players).toEqual([
      { name: 'Bob', elo: 54, wins: 1, losses: 1, gamesPlayed: 2, winRate: 0.5 },
      { name: 'Alice', elo: 49, wins: 1, losses: 1, gamesPlayed: 2, winRate: 0.5 },
      { name: 'Carol', elo: 49, wins: 0, losses: 1, gamesPlayed: 1, winRate: 0 },
      { name: 'Dave', elo: 49, wins: 0, losses: 1, gamesPlayed: 1, winRate: 0 },
    ]);
  });

  it('is deterministic — same log in, same standings out', () => {
    const a = computeStandings(matches, '2026-07-25T14:03:00Z');
    const b = computeStandings(matches, '2026-07-25T14:03:00Z');
    expect(a).toEqual(b);
  });

  it('starts unseen players at ELO_START the moment they first appear', () => {
    const standings = computeStandings([
      { date: '2026-01-01', players: ['Alice', 'Bob'], winner: 'Alice' },
    ]);
    const bob = standings.players.find((p) => p.name === 'Bob')!;
    expect(bob.elo).toBeLessThan(ELO_START);
  });

  it('throws on a malformed log instead of producing partial output', () => {
    expect(() =>
      computeStandings([{ date: '2026-01-01', players: ['Alice', 'Bob'], winner: 'Nobody' }]),
    ).toThrow();
  });

  it('returns an empty player list for an empty log', () => {
    expect(computeStandings([]).players).toEqual([]);
  });
});
