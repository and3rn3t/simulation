import { updateElementText } from '../../ui/domHelpers';
import type { GameStats } from '../../types/gameTypes';

/**
 * Manages the display and updating of statistics in the UI
 * @class StatisticsManager
 */
export class StatisticsManager {
  /**
   * Updates all statistics elements in the UI
   * @param stats - The game statistics to display
   */
  updateAllStats(stats: GameStats & {
    birthsThisSecond: number;
    deathsThisSecond: number;
    achievements: any[];
  }): void {
    // Basic stats
    updateElementText('population-count', stats.population.toString());
    updateElementText('generation-count', stats.generation.toString());
    updateElementText('time-elapsed', `${stats.timeElapsed}s`);
    
    // Rates
    updateElementText('birth-rate', stats.birthsThisSecond.toString());
    updateElementText('death-rate', stats.deathsThisSecond.toString());
    
    // Age stats
    updateElementText('avg-age', Math.round(stats.averageAge).toString());
    updateElementText('oldest-organism', Math.round(stats.oldestAge).toString());
    
    // Population metrics
    this.updatePopulationDensity(stats.population);
    this.updatePopulationStability(stats.totalBirths, stats.totalDeaths);
    
    // Game stats
    updateElementText('score', stats.score.toString());
    this.updateAchievementCount(stats.achievements);
  }

  /**
   * Updates population density display
   * @param population - Current population
   */
  private updatePopulationDensity(population: number): void {
    const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
    if (canvas) {
      const area = canvas.width * canvas.height;
      const density = Math.round((population / area) * 1000);
      updateElementText('population-density', density.toString());
    }
  }

  /**
   * Updates population stability ratio
   * @param totalBirths - Total births since start
   * @param totalDeaths - Total deaths since start
   */
  private updatePopulationStability(totalBirths: number, totalDeaths: number): void {
    const ratio = totalDeaths > 0 ? (totalBirths / totalDeaths).toFixed(2) : 'N/A';
    updateElementText('population-stability', ratio);
  }

  /**
   * Updates achievement count display
   * @param achievements - Array of achievements
   */
  private updateAchievementCount(achievements: any[]): void {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    updateElementText('achievement-count', `${unlockedCount}/${achievements.length}`);
  }
}
