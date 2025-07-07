export interface LeaderboardEntry {
  score: number;
  date: string;
  population: number;
  generation: number;
  timeElapsed: number;
}

export class LeaderboardManager {
  private readonly STORAGE_KEY = 'organism-simulation-leaderboard';
  private entries: LeaderboardEntry[] = [];

  constructor() {
    this.loadLeaderboard();
  }

  addEntry(entry: Omit<LeaderboardEntry, 'date'>): void {
    const newEntry: LeaderboardEntry = {
      ...entry,
      date: new Date().toLocaleDateString()
    };

    this.entries.push(newEntry);
    this.entries.sort((a, b) => b.score - a.score);
    
    // Keep only top 10 entries
    this.entries = this.entries.slice(0, 10);
    
    this.saveLeaderboard();
    this.updateLeaderboardDisplay();
  }

  getHighScore(): number {
    return this.entries.length > 0 ? this.entries[0].score : 0;
  }

  getEntries(): LeaderboardEntry[] {
    return [...this.entries];
  }

  private loadLeaderboard(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.entries = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load leaderboard:', error);
      this.entries = [];
    }
  }

  private saveLeaderboard(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries));
    } catch (error) {
      console.warn('Failed to save leaderboard:', error);
    }
  }

  updateLeaderboardDisplay(): void {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    if (this.entries.length === 0) {
      leaderboardList.innerHTML = '<p style="text-align: center; color: rgba(255, 255, 255, 0.6);">No scores yet!</p>';
      return;
    }

    leaderboardList.innerHTML = this.entries
      .map((entry, index) => `
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
      `)
      .join('');
  }
}
