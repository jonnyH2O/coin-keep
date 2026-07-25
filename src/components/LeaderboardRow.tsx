import type { CSSProperties } from 'react';
import { ELO_MAX, ELO_MIN } from '../elo/elo';
import type { PlayerStanding } from '../elo/types';
import styles from './LeaderboardRow.module.css';

interface LeaderboardRowProps {
  rank: number;
  player: PlayerStanding;
}

const MEDAL_CLASS: Record<number, string> = { 1: 'gold', 2: 'silver', 3: 'bronze' };

// Keeps the pill's own half-width from overflowing past the line's ends
// at the extremes of the Elo range.
const LINE_POSITION_MIN_PERCENT = 10;
const LINE_POSITION_MAX_PERCENT = 88;

/**
 * Maps a 1-100 Elo rating onto the WoW item-quality color ramp, banded
 * into 6 roughly-even tiers. See docs/THEME.md §4 — this is the "Elo
 * sits like an item level" treatment, deliberately separate from the
 * literal gold/silver/bronze rank medals below.
 */
function eloTierColor(elo: number): string {
  if (elo <= 16) return 'var(--quality-poor)';
  if (elo <= 33) return 'var(--quality-common)';
  if (elo <= 50) return 'var(--quality-uncommon)';
  if (elo <= 67) return 'var(--quality-rare)';
  if (elo <= 84) return 'var(--quality-epic)';
  return 'var(--quality-legendary)';
}

/**
 * Where the Elo pill sits along the leader line: a pure function of the
 * rating itself, so a higher Elo always sits further right, a lower Elo
 * further left, and two equal ratings land at the exact same spot.
 * Clamped a few percent in from each end so the pill's own width never
 * overflows the line at the 1/100 extremes.
 */
function eloLinePosition(elo: number): number {
  const fraction = (elo - ELO_MIN) / (ELO_MAX - ELO_MIN);
  const percent = fraction * 100;
  return Math.min(LINE_POSITION_MAX_PERCENT, Math.max(LINE_POSITION_MIN_PERCENT, percent));
}

export default function LeaderboardRow({ rank, player }: LeaderboardRowProps) {
  const medal = MEDAL_CLASS[rank];
  const eloPillStyle = {
    '--tier-color': eloTierColor(player.elo),
    '--elo-position': `${eloLinePosition(player.elo)}%`,
  } as CSSProperties;

  return (
    <li className={styles.row}>
      <div className={`${styles.rank} ${medal ? styles[medal] : ''}`}>{rank}</div>
      <div className={styles.nameCol}>
        <div className={styles.name}>{player.name}</div>
        <div className={styles.record}>
          {player.wins}–{player.losses}
        </div>
      </div>
      <div className={styles.leaderLine}>
        <span className={styles.elo} style={eloPillStyle}>
          {player.elo}
        </span>
      </div>
      <div className={styles.winRate}>{Math.round(player.winRate * 100)}%</div>
    </li>
  );
}
