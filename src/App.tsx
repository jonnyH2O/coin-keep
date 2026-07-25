import { useState } from 'react';
import ClearAllButton from './components/ClearAllButton';
import PageToggle from './components/PageToggle';
import { useLocalStorageNumber } from './hooks/useLocalStorageNumber';
import Leaderboard from './pages/Leaderboard';
import Tracker from './pages/Tracker';
import styles from './App.module.css';

type Page = 'tracker' | 'leaderboard';

export default function App() {
  const [page, setPage] = useState<Page>('tracker');
  const [combat, setCombat] = useLocalStorageNumber('hrct:combat', 0);
  const [gold, setGold] = useLocalStorageNumber('hrct:gold', 0);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        {page === 'tracker' ? (
          <ClearAllButton
            onClear={() => {
              setCombat(0);
              setGold(0);
            }}
          />
        ) : (
          <span />
        )}
        <PageToggle page={page} onToggle={() => setPage(page === 'tracker' ? 'leaderboard' : 'tracker')} />
      </header>
      {page === 'tracker' ? (
        <Tracker
          combat={combat}
          gold={gold}
          onAdjustCombat={(delta) => setCombat(Math.max(0, combat + delta))}
          onAdjustGold={(delta) => setGold(Math.max(0, gold + delta))}
        />
      ) : (
        <Leaderboard />
      )}
    </div>
  );
}
