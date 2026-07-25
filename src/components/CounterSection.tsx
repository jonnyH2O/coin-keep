import AdjustButton from './AdjustButton';
import styles from './CounterSection.module.css';

const DELTAS = [-5, -1, 1, 5];

interface CounterSectionProps {
  label: string;
  value: number;
  onAdjust: (delta: number) => void;
  accent: 'combat' | 'gold';
}

export default function CounterSection({ label, value, onAdjust, accent }: CounterSectionProps) {
  return (
    <section className={`${styles.section} ${accent === 'combat' ? styles.sectionCombat : styles.sectionGold}`} aria-label={label}>
      <div className={styles.frame}>
        <div className={`${styles.track} ${accent === 'combat' ? styles.trackCombat : styles.trackGold}`}>
          <div className={styles.label}>{label}</div>
          <div className={styles.readout}>{value}</div>
        </div>
      </div>
      <div className={styles.buttons}>
        {DELTAS.map((delta) => (
          <AdjustButton key={delta} delta={delta} onPress={onAdjust} />
        ))}
      </div>
    </section>
  );
}
