import type { Achievement } from '../../features/achievements/achievements';
import type { LeaderboardManager } from '../../features/leaderboard/leaderboard';
import type { PowerUpManager } from '../../features/powerups/powerups';
import type { UnlockableOrganismManager } from '../../models/unlockables';

/**
 * Manages the overall game state and coordinates between different systems
 * @class GameStateManager
 */
export class GameStateManager {
  private powerUpManager: PowerUpManager;
  private leaderboardManager: LeaderboardManager;
  private unlockableManager: UnlockableOrganismManager;

  constructor(
    powerUpManager: PowerUpManager,
    leaderboardManager: LeaderboardManager,
    unlockableManager: UnlockableOrganismManager
  ) {
    this.powerUpManager = powerUpManager;
    this.leaderboardManager = leaderboardManager;
    this.unlockableManager = unlockableManager;
  }

  /**
   * Updates all game systems based on current simulation stats
   * @param stats - Current simulation statistics
   * @param achievements - Current achievements array
   */
  updateGameSystems(stats: any, achievements: Achievement[]): void {
    // Update power-up manager with current score
    this.powerUpManager.updateScore(stats.population);

    // Update power-ups (check for expired ones)
    this.powerUpManager.updatePowerUps();

    // Check for unlocks
    const newlyUnlocked = this.unlockableManager.checkUnlocks(
      achievements,
      stats.population,
      stats.population
    );

    // Show unlock notifications
    newlyUnlocked.forEach(organism => {
      this.unlockableManager.showUnlockNotification(organism);
    });
  }

  /**
   * Handles game over scenario
   * @param finalStats - Final simulation statistics
   */
  handleGameOver(finalStats: any): void {
    this.leaderboardManager.addEntry({
      score: finalStats.population,
      population: finalStats.population,
      generation: finalStats.generation,
      timeElapsed: finalStats.timeElapsed || 0,
    });

    // Update leaderboard display
    this.leaderboardManager.updateLeaderboardDisplay();
  }

  /**
   * Gets the current high score
   * @returns The highest score
   */
  getHighScore(): number {
    return this.leaderboardManager.getHighScore();
  }

  /**
   * Attempts to purchase a power-up
   * @param powerUpId - The ID of the power-up to purchase
   * @returns True if purchase was successful
   */
  buyPowerUp(powerUpId: string): boolean {
    const powerUp = this.powerUpManager.buyPowerUp(powerUpId);
    return powerUp !== null;
  }
}
