import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateMatches } from './validate';
import type { Match } from './types';

describe('validateMatches', () => {
  it('accepts a well-formed log', () => {
    const matches: Match[] = [
      { date: '2026-01-01', players: ['Alice', 'Bob', 'Carol'], winner: 'Alice' },
      { date: '2026-01-02', players: ['Alice', 'Bob'], winner: 'Bob' },
    ];
    expect(() => validateMatches(matches)).not.toThrow();
  });

  it('accepts an empty log', () => {
    expect(() => validateMatches([])).not.toThrow();
  });

  it('rejects a match with fewer than 2 players', () => {
    const matches: Match[] = [{ date: '2026-01-01', players: ['Alice'], winner: 'Alice' }];
    expect(() => validateMatches(matches)).toThrow(/at least 2 participants/);
  });

  it('rejects a winner not present in players', () => {
    const matches: Match[] = [{ date: '2026-01-01', players: ['Alice', 'Bob'], winner: 'Carol' }];
    expect(() => validateMatches(matches)).toThrow(/is not in "players"/);
  });

  it('rejects duplicate names within one match', () => {
    const matches: Match[] = [{ date: '2026-01-01', players: ['Alice', 'Alice', 'Bob'], winner: 'Alice' }];
    expect(() => validateMatches(matches)).toThrow(/duplicate name/);
  });

  it('rejects a malformed date', () => {
    const matches: Match[] = [{ date: '2026-13-40', players: ['Alice', 'Bob'], winner: 'Alice' }];
    expect(() => validateMatches(matches)).toThrow(/real calendar date/);
  });

  it('rejects a date in the wrong format', () => {
    const matches: Match[] = [{ date: '07/20/2026', players: ['Alice', 'Bob'], winner: 'Alice' }];
    expect(() => validateMatches(matches)).toThrow(/real calendar date/);
  });

  it('rejects near-duplicate names differing only by case or whitespace', () => {
    const matches: Match[] = [
      { date: '2026-01-01', players: ['Alice', 'Bob'], winner: 'Alice' },
      { date: '2026-01-02', players: ['alice', 'Bob'], winner: 'Bob' },
    ];
    expect(() => validateMatches(matches)).toThrow(/Likely typo/);
  });

  it('reports every problem in the log in a single error, not just the first', () => {
    const matches: Match[] = [
      { date: 'not-a-date', players: ['Alice'], winner: 'Alice' },
      { date: '2026-01-02', players: ['Bob', 'Carol'], winner: 'Nobody' },
    ];
    try {
      validateMatches(matches);
      throw new Error('expected validateMatches to throw');
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toMatch(/real calendar date/);
      expect(message).toMatch(/at least 2 participants/);
      expect(message).toMatch(/is not in "players"/);
    }
  });

  describe('out-of-order dates', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('warns but does not throw when a later entry has an earlier date', () => {
      const matches: Match[] = [
        { date: '2026-01-10', players: ['Alice', 'Bob'], winner: 'Alice' },
        { date: '2026-01-05', players: ['Alice', 'Bob'], winner: 'Bob' },
      ];
      expect(() => validateMatches(matches)).not.toThrow();
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });
});
