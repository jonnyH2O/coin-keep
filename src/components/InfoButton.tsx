import styles from './InfoButton.module.css';

interface InfoButtonProps {
  onClick: () => void;
}

export default function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClick} aria-label="About ranks and Elo">
      <span className={styles.icon} />
    </button>
  );
}
