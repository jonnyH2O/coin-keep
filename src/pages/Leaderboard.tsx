import standingsData from '../../data/standings.json';
import LeaderboardRow from '../components/LeaderboardRow';
import type { Standings } from '../elo/types';
import styles from './Leaderboard.module.css';

const standings = standingsData as Standings;

export default function Leaderboard() {
  return (
    <main className={styles.leaderboard}>
      {standings.players.length === 0 ? (
        <p className={styles.empty}>No matches logged yet.</p>
      ) : (
        <ul className={styles.list}>
          {standings.players.map((player, index) => (
            <LeaderboardRow key={player.name} rank={index + 1} player={player} />
          ))}
        </ul>
      )}
    </main>
  );
}
