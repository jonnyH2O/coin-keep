import styles from './LeaderboardHeader.module.css';

export type SortKey = 'rank' | 'winRate';

interface LeaderboardHeaderProps {
  sortBy: SortKey;
  onSortChange: (sortBy: SortKey) => void;
}

export default function LeaderboardHeader({ sortBy, onSortChange }: LeaderboardHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.rankSpacer} />
      <div className={styles.nameLabel}>Name (W/L)</div>
      <button
        type="button"
        className={`${styles.sortButton} ${styles.rankButton} ${sortBy === 'rank' ? styles.active : ''}`}
        onClick={() => onSortChange('rank')}
      >
        Rank
      </button>
      <button
        type="button"
        className={`${styles.sortButton} ${styles.winRateButton} ${sortBy === 'winRate' ? styles.active : ''}`}
        onClick={() => onSortChange('winRate')}
      >
        Win Rate
      </button>
    </div>
  );
}
