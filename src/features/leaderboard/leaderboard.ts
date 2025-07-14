/**
 * Represents a leaderboard entry
 * @interface LeaderboardEntry
 */
export interface LeaderboardEntry {
  /** Player's score */
  score: number;
  /** Date when the score was achieved */
  date: string;
  /** Population reached */
  population: number;
  /** Generation reached */
  generation: number;
  /** Time survived in seconds */
  timeElapsed: number;
}

/**
 * Manages the leaderboard, storing and displaying top scores
 * @class LeaderboardManager
 */
export class LeaderboardManager {
  /** Key for localStorage */
  private readonly STORAGE_KEY = 'organism-simulation-leaderboard';
  /** Array of leaderboard entries */
  private entries: LeaderboardEntry[] = [];

  /**
   * Initializes the leaderboard manager and loads saved data
   */
  constructor() {
    this.loadLeaderboard();
  }

  /**
   * Adds a new entry to the leaderboard
   * @param entry - The entry to add (date will be auto-generated)
   */
  addEntry(entry: Omit<LeaderboardEntry, 'date'>): void {
    const newEntry: LeaderboardEntry = {
      ...entry,
      date: new Date().toLocaleDateString(),
    };

    this.entries.push(newEntry);
    this.entries.sort((a, b) => b.score - a.score);

    // Keep only top 10 entries
    this.entries = this.entries.slice(0, 10);

    this.saveLeaderboard();
    this.updateLeaderboardDisplay();
  }

  /**
   * Gets the highest score on the leaderboard
   * @returns The highest score, or 0 if no entries exist
   */
  getHighScore(): number {
    return this.entries.length > 0 ? (this.entries[0]?.score ?? 0) : 0;
  }

  /**
   * Gets a copy of all leaderboard entries
   * @returns Array of leaderboard entries
   */
  getEntries(): LeaderboardEntry[] {
    return [...this.entries];
  }

  /**
   * Loads the leaderboard from localStorage
   * @private
   */
  private loadLeaderboard(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) { this.entries = JSON.parse(saved);
        }
    } catch (_error) {
      this.entries = [];
    }
  }

  /**
   * Saves the leaderboard to localStorage
   * @private
   */
  private saveLeaderboard(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries));
    } catch (_error) {
      /* handled */
    }
  }

  /**
   * Updates the leaderboard display in the UI
   */
  updateLeaderboardDisplay(): void {
    const leaderboardList = document?.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    if (this.entries.length === 0) {
      leaderboardList.innerHTML =
        '<p style="text-align: center; color: rgba(255, 255, 255, 0.6);">No scores yet!</p>';
      return;
    }

    leaderboardList.innerHTML = this.entries
      .map(
        (entry, index) => `
        <div class="leaderboard-item ${index === 0 ? 'current' : ''}">
          <span class="leaderboard-rank">#${index + 1}</span>
          <div class="leaderboard-info">
            <div class="leaderboard-score">${entry.score}</div>
            <div class="leaderboard-details">
              Pop: ${entry.population} | Gen: ${entry.generation} | Time: ${entry.timeElapsed}s
            </div>
          </div>
          <span class="leaderboard-date">${entry.date}</span>
        </div>
      `
      )
      .join('');
  }
}
