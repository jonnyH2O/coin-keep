import CounterSection from '../components/CounterSection';
import styles from './Tracker.module.css';

interface TrackerProps {
  combat: number;
  gold: number;
  onAdjustCombat: (delta: number) => void;
  onAdjustGold: (delta: number) => void;
}

export default function Tracker({ combat, gold, onAdjustCombat, onAdjustGold }: TrackerProps) {
  return (
    <main className={styles.tracker}>
      <CounterSection label="COMBAT" value={combat} onAdjust={onAdjustCombat} accent="combat" />
      <CounterSection label="GOLD" value={gold} onAdjust={onAdjustGold} accent="gold" />
    </main>
  );
}
