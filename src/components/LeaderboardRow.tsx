import type { PlayerStanding } from '../elo/types';
import styles from './LeaderboardRow.module.css';

interface LeaderboardRowProps {
  rank: number;
  player: PlayerStanding;
}

const MEDAL_CLASS: Record<number, string> = { 1: 'gold', 2: 'silver', 3: 'bronze' };

export default function LeaderboardRow({ rank, player }: LeaderboardRowProps) {
  const medal = MEDAL_CLASS[rank];

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
        <span className={styles.elo}>{player.elo}</span>
      </div>
      <div className={styles.winRate}>{Math.round(player.winRate * 100)}%</div>
    </li>
  );
}
