import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as domHelpers from '../../../src/ui/domHelpers';
import { StatisticsManager } from '../../../src/utils/game/statisticsManager';

// Mock domHelpers
vi.mock('../../../src/ui/domHelpers', () => ({
  updateElementText: vi.fn(),
}));

describe('StatisticsManager', () => {
  let statisticsManager: StatisticsManager;
  let mockCanvas: HTMLCanvasElement;

  const createMockStats = (overrides: any = {}) => ({
    population: 100,
    generation: 1,
    timeElapsed: 60,
    birthsThisSecond: 2,
    deathsThisSecond: 0,
    averageAge: 20,
    oldestAge: 45,
    totalBirths: 100,
    totalDeaths: 0,
    maxPopulation: 100,
    score: 500,
    achievements: [],
    ...overrides,
  });

  beforeEach(() => {
    statisticsManager = new StatisticsManager();

    // Mock canvas element
    mockCanvas = {
      width: 800,
      height: 600,
    } as HTMLCanvasElement;

    // Mock DOM methods
    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'simulation-canvas') {
        return mockCanvas;
      }
      return null;
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('updateAllStats', () => {
    it('should update all basic statistics', () => {
      const stats = createMockStats({
        population: 150,
        generation: 5,
        timeElapsed: 120,
        birthsThisSecond: 3,
        deathsThisSecond: 1,
        averageAge: 25.7,
        oldestAge: 89.3,
        totalBirths: 200,
        totalDeaths: 50,
        maxPopulation: 200,
        score: 1500,
        achievements: [
          { unlocked: true, name: 'First Colony' },
          { unlocked: true, name: 'Population Boom' },
          { unlocked: false, name: 'Extinction Event' },
        ],
      });

      statisticsManager.updateAllStats(stats);

      // Check basic stats
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('population-count', '150');
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('generation-count', '5');
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('time-elapsed', '120s');

      // Check rates
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('birth-rate', '3');
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('death-rate', '1');

      // Check age stats
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('avg-age', '26');
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('oldest-organism', '89');

      // Check score
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('score', '1500');
    });

    it('should update population density when canvas is available', () => {
      const stats = createMockStats({
        population: 100,
      });

      statisticsManager.updateAllStats(stats);

      // Population density = (100 / (800 * 600)) * 1000 = 0.208... rounds to 0
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('population-density', '0');
    });

    it('should handle higher population density correctly', () => {
      const stats = createMockStats({
        population: 10000,
      });

      statisticsManager.updateAllStats(stats);

      // Population density = (10000 / (800 * 600)) * 1000 = 20.83... rounds to 21
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('population-density', '21');
    });

    it('should handle missing canvas gracefully', () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null);

      const stats = createMockStats();

      expect(() => {
        statisticsManager.updateAllStats(stats);
      }).not.toThrow();
    });

    it('should update population stability ratio', () => {
      const stats = createMockStats({
        totalBirths: 150,
        totalDeaths: 50,
      });

      statisticsManager.updateAllStats(stats);

      // Stability ratio = 150 / 50 = 3.00
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('population-stability', '3.00');
    });

    it('should handle zero deaths for population stability', () => {
      const stats = createMockStats({
        totalBirths: 150,
        totalDeaths: 0,
      });

      statisticsManager.updateAllStats(stats);

      expect(domHelpers.updateElementText).toHaveBeenCalledWith('population-stability', 'N/A');
    });

    it('should update achievement count correctly', () => {
      const stats = createMockStats({
        achievements: [
          { unlocked: true, name: 'Achievement 1' },
          { unlocked: false, name: 'Achievement 2' },
          { unlocked: true, name: 'Achievement 3' },
          { unlocked: false, name: 'Achievement 4' },
        ],
      });

      statisticsManager.updateAllStats(stats);

      expect(domHelpers.updateElementText).toHaveBeenCalledWith('achievement-count', '2/4');
    });

    it('should handle empty achievements array', () => {
      const stats = createMockStats({
        achievements: [],
      });

      statisticsManager.updateAllStats(stats);

      expect(domHelpers.updateElementText).toHaveBeenCalledWith('achievement-count', '0/0');
    });

    it('should round age values appropriately', () => {
      const stats = createMockStats({
        averageAge: 25.7,
        oldestAge: 89.3,
      });

      statisticsManager.updateAllStats(stats);

      expect(domHelpers.updateElementText).toHaveBeenCalledWith('avg-age', '26');
      expect(domHelpers.updateElementText).toHaveBeenCalledWith('oldest-organism', '89');
    });
  });
});
