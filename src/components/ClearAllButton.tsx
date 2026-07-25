import styles from './ClearAllButton.module.css';

interface ClearAllButtonProps {
  onClear: () => void;
}

export default function ClearAllButton({ onClear }: ClearAllButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={onClear}>
      Clear All
    </button>
  );
}
