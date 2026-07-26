import { useMemo, useState } from 'react';
import standingsData from '../../data/standings.json';
import LeaderboardHeader, { type SortKey } from '../components/LeaderboardHeader';
import LeaderboardRow from '../components/LeaderboardRow';
import type { PlayerStanding, Standings } from '../elo/types';
import styles from './Leaderboard.module.css';

const standings = standingsData as Standings;

function compareByRank(a: PlayerStanding, b: PlayerStanding): number {
  if (b.elo !== a.elo) return b.elo - a.elo;
  if (b.winRate !== a.winRate) return b.winRate - a.winRate;
  if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
  return a.name.localeCompare(b.name);
}

function compareByWinRate(a: PlayerStanding, b: PlayerStanding): number {
  if (b.winRate !== a.winRate) return b.winRate - a.winRate;
  if (b.elo !== a.elo) return b.elo - a.elo;
  if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
  return a.name.localeCompare(b.name);
}

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortKey>('rank');

  const sortedPlayers = useMemo(() => {
    const comparator = sortBy === 'rank' ? compareByRank : compareByWinRate;
    return [...standings.players].sort(comparator);
  }, [sortBy]);

  return (
    <main className={styles.leaderboard}>
      {standings.players.length === 0 ? (
        <p className={styles.empty}>No matches logged yet.</p>
      ) : (
        <>
          <LeaderboardHeader sortBy={sortBy} onSortChange={setSortBy} />
          <ul className={styles.list}>
            {sortedPlayers.map((player, index) => (
              <LeaderboardRow key={player.name} rank={index + 1} player={player} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
