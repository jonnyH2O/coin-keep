import type { CSSProperties } from 'react';
import { ELO_MAX, ELO_MIN } from '../elo/elo';
import type { PlayerStanding } from '../elo/types';
import { eloTier, iconUrl } from './eloTiers';
import styles from './LeaderboardRow.module.css';

interface LeaderboardRowProps {
  rank: number;
  player: PlayerStanding;
}

const MEDAL_CLASS: Record<number, string> = { 1: 'gold', 2: 'silver', 3: 'bronze' };

// Keeps the badge's own half-width from overflowing past the line's ends
// at the extremes of the Elo range.
const LINE_POSITION_MIN_PERCENT = 10;
const LINE_POSITION_MAX_PERCENT = 88;

/**
 * Where the Elo badge sits along the leader line: a pure function of the
 * rating itself, so a higher Elo always sits further right, a lower Elo
 * further left, and two equal ratings land at the exact same spot.
 * Clamped a few percent in from each end so the badge's own width never
 * overflows the line at the 1/100 extremes.
 */
function eloLinePosition(elo: number): number {
  const fraction = (elo - ELO_MIN) / (ELO_MAX - ELO_MIN);
  const percent = fraction * 100;
  return Math.min(LINE_POSITION_MAX_PERCENT, Math.max(LINE_POSITION_MIN_PERCENT, percent));
}

export default function LeaderboardRow({ rank, player }: LeaderboardRowProps) {
  const medal = MEDAL_CLASS[rank];
  const tier = eloTier(player.elo);
  const badgeStyle = {
    '--tier-glow': tier.glow,
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
        <div className={styles.eloBadge} style={badgeStyle}>
          <img className={styles.eloIcon} src={iconUrl(tier.icon)} alt={tier.name} />
          <span className={styles.eloNumber}>{player.elo}</span>
        </div>
      </div>
      <div className={styles.winRate}>{Math.round(player.winRate * 100)}%</div>
    </li>
  );
}
