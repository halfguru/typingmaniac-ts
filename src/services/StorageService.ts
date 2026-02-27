const HIGH_SCORE_KEY = 'typingmaniac_highscore';
const HAS_PLAYED_KEY = 'typingmaniac_hasplayed';
const LEADERBOARD_KEY = 'typingmaniac_leaderboard';
const MAX_LEADERBOARD_ENTRIES = 5;

export interface LeaderboardEntry {
  score: number;
  level: number;
  date: string;
}

export const storageService = {
  getHighScore(): number {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  },

  setHighScore(score: number): boolean {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      return true;
    }
    return false;
  },

  hasPlayedBefore(): boolean {
    return localStorage.getItem(HAS_PLAYED_KEY) === 'true';
  },

  markAsPlayed(): void {
    localStorage.setItem(HAS_PLAYED_KEY, 'true');
  },

  getLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(LEADERBOARD_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  },

  addToLeaderboard(score: number, level: number): number {
    const leaderboard = this.getLeaderboard();
    const entry: LeaderboardEntry = {
      score,
      level,
      date: new Date().toLocaleDateString(),
    };
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    const trimmed = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
    
    try {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    } catch {
      // Ignore storage errors
    }
    
    return trimmed.findIndex(e => e.score === score && e.date === entry.date);
  },

  isNewHighScore(score: number): boolean {
    const leaderboard = this.getLeaderboard();
    if (leaderboard.length === 0) return score > 0;
    return score > leaderboard[0].score;
  },
};
