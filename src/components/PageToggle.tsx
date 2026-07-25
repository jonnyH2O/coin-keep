import styles from './PageToggle.module.css';

interface PageToggleProps {
  page: 'tracker' | 'leaderboard';
  onToggle: () => void;
}

export default function PageToggle({ page, onToggle }: PageToggleProps) {
  return (
    <button type="button" className={styles.button} onClick={onToggle}>
      {page === 'tracker' ? 'Leaderboard' : 'Tracker'}
    </button>
  );
}
