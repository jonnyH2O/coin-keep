import styles from './AdjustButton.module.css';

interface AdjustButtonProps {
  delta: number;
  onPress: (delta: number) => void;
}

export default function AdjustButton({ delta, onPress }: AdjustButtonProps) {
  const label = delta > 0 ? `+${delta}` : `${delta}`;
  return (
    <button type="button" className={styles.button} onClick={() => onPress(delta)}>
      {label}
    </button>
  );
}
