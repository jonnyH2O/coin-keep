export interface Match {
  date: string; // "YYYY-MM-DD"
  players: string[]; // length >= 2, unique
  winner: string; // must equal one entry in players
}

export interface MatchLog {
  matches: Match[];
}

export interface PlayerStanding {
  name: string;
  elo: number; // integer, 1..100
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number; // wins / gamesPlayed, 0..1
}

export interface Standings {
  generatedAt: string; // ISO datetime
  sourceMatchCount: number;
  players: PlayerStanding[]; // sorted: winRate desc, elo desc, gamesPlayed desc, name asc
}
