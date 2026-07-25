import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeStandings } from '../src/elo/elo';
import type { MatchLog, Standings } from '../src/elo/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MATCHES_PATH = resolve(__dirname, '../data/matches.json');
const STANDINGS_PATH = resolve(__dirname, '../data/standings.json');

function loadMatches(): MatchLog['matches'] {
  const raw = readFileSync(MATCHES_PATH, 'utf-8');
  const log: MatchLog = JSON.parse(raw);
  return log.matches;
}

function serialize(standings: Standings): string {
  return `${JSON.stringify(standings, null, 2)}\n`;
}

/** True if `a` and `b` have the same computed data, ignoring the generatedAt timestamp. */
function sameData(a: Standings, b: Standings): boolean {
  return a.sourceMatchCount === b.sourceMatchCount && JSON.stringify(a.players) === JSON.stringify(b.players);
}

function main(): void {
  const checkOnly = process.argv.includes('--check');
  let matches: MatchLog['matches'];

  try {
    matches = loadMatches();
  } catch (error) {
    console.error(`Failed to read ${MATCHES_PATH}:\n${(error as Error).message}`);
    process.exit(1);
  }

  let fresh: Standings;
  try {
    fresh = computeStandings(matches);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }

  if (!checkOnly) {
    writeFileSync(STANDINGS_PATH, serialize(fresh));
    console.log(`Wrote ${STANDINGS_PATH} from ${matches.length} match(es).`);
    return;
  }

  let committed: Standings;
  try {
    committed = JSON.parse(readFileSync(STANDINGS_PATH, 'utf-8'));
  } catch {
    console.error(
      `${STANDINGS_PATH} does not exist or is not valid JSON. Run "npm run generate:standings" and commit the result.`,
    );
    process.exit(1);
  }

  if (!sameData(fresh, committed)) {
    console.error(
      `${STANDINGS_PATH} is stale relative to ${MATCHES_PATH}.\n` +
        `Run "npm run generate:standings" and commit the updated file.`,
    );
    process.exit(1);
  }

  console.log('data/standings.json is up to date.');
}

main();
