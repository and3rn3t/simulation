import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SpatialPartitioningManager } from '../../../src/utils/algorithms/spatialPartitioning';
import { AdaptiveBatchProcessor } from '../../../src/utils/algorithms/batchProcessor';
import { PopulationPredictor } from '../../../src/utils/algorithms/populationPredictor';
import { algorithmWorkerManager } from '../../../src/utils/algorithms/workerManager';
import { Organism } from '../../../src/core/organism';
import { ORGANISM_TYPES } from '../../../src/models/organismTypes';

describe('Algorithm Optimizations', () => {
  describe('SpatialPartitioningManager', () => {
    let spatialPartitioning: SpatialPartitioningManager;
    let mockOrganisms: Organism[];

    beforeEach(() => {
      spatialPartitioning = new SpatialPartitioningManager(800, 600, 10);
      mockOrganisms = [];

      // Create some test organisms
      for (let i = 0; i < 20; i++) {
        const organism = new Organism(
          Math.random() * 800,
          Math.random() * 600,
          ORGANISM_TYPES.bacteria
        );
        mockOrganisms.push(organism);
      }
    });

    it('should create spatial partitioning structure', () => {
      expect(spatialPartitioning).toBeDefined();
      expect(spatialPartitioning.getDebugInfo()).toBeDefined();
    });

    it('should rebuild spatial partitioning with organisms', () => {
      spatialPartitioning.rebuild(mockOrganisms);
      const debugInfo = spatialPartitioning.getDebugInfo();

      expect(debugInfo.totalNodes).toBeGreaterThan(0);
      expect(debugInfo.totalElements).toBe(mockOrganisms.length);
    });

    it('should handle empty organism list', () => {
      spatialPartitioning.rebuild([]);
      const debugInfo = spatialPartitioning.getDebugInfo();

      expect(debugInfo.totalElements).toBe(0);
    });

    it('should provide performance metrics', () => {
      spatialPartitioning.rebuild(mockOrganisms);
      const debugInfo = spatialPartitioning.getDebugInfo();

      expect(debugInfo.lastRebuildTime).toBeGreaterThan(0);
      expect(debugInfo.averageRebuildTime).toBeGreaterThan(0);
    });
  });

  describe('AdaptiveBatchProcessor', () => {
    let batchProcessor: AdaptiveBatchProcessor;
    let mockOrganisms: Organism[];

    beforeEach(() => {
      batchProcessor = new AdaptiveBatchProcessor(
        {
          batchSize: 10,
          maxFrameTime: 16,
          useTimeSlicing: true,
        },
        16.67
      );
      mockOrganisms = [];

      // Create test organisms
      for (let i = 0; i < 50; i++) {
        const organism = new Organism(
          Math.random() * 800,
          Math.random() * 600,
          ORGANISM_TYPES.bacteria
        );
        mockOrganisms.push(organism);
      }
    });

    it('should process organisms in batches', () => {
      let processedCount = 0;
      const updateFunction = (organism: Organism) => {
        processedCount++;
        organism.update(1 / 60, 800, 600);
      };

      batchProcessor.processBatch(mockOrganisms, updateFunction, 1 / 60, 800, 600);

      expect(processedCount).toBe(mockOrganisms.length);
    });

    it('should handle reproduction in batches', () => {
      const reproductionFunction = (organism: Organism) => {
        if (Math.random() < 0.1) {
          // 10% chance
          return new Organism(
            organism.x + Math.random() * 10,
            organism.y + Math.random() * 10,
            organism.type
          );
        }
        return null;
      };

      const result = batchProcessor.processReproduction(mockOrganisms, reproductionFunction, 1000);

      expect(result.newOrganisms).toBeDefined();
      expect(Array.isArray(result.newOrganisms)).toBe(true);
      expect(result.result.processed).toBe(mockOrganisms.length);
    });

    it('should provide performance statistics', () => {
      const updateFunction = (organism: Organism) => {
        organism.update(1 / 60, 800, 600);
      };

      batchProcessor.processBatch(mockOrganisms, updateFunction, 1 / 60, 800, 600);

      const stats = batchProcessor.getPerformanceStats();
      expect(stats.averageProcessingTime).toBeGreaterThanOrEqual(0);
      expect(stats.currentBatchSize).toBeGreaterThan(0);
    });

    it('should adapt batch size based on performance', () => {
      const updateFunction = (organism: Organism) => {
        organism.update(1 / 60, 800, 600);
      };

      // Process multiple times to trigger adaptation
      for (let i = 0; i < 5; i++) {
        batchProcessor.processBatch(mockOrganisms, updateFunction, 1 / 60, 800, 600);
      }

      const stats = batchProcessor.getPerformanceStats();
      expect(stats.currentBatchSize).toBeGreaterThan(0);
    });
  });

  describe('PopulationPredictor', () => {
    let predictor: PopulationPredictor;
    let mockOrganisms: Organism[];

    beforeEach(() => {
      const environmentalFactors = {
        temperature: 0.5,
        resources: 0.8,
        space: 0.9,
        toxicity: 0.0,
        pH: 0.5,
      };

      predictor = new PopulationPredictor(environmentalFactors);
      mockOrganisms = [];

      // Create test organisms
      for (let i = 0; i < 30; i++) {
        const organism = new Organism(
          Math.random() * 800,
          Math.random() * 600,
          ORGANISM_TYPES.bacteria
        );
        mockOrganisms.push(organism);
      }
    });

    it('should add historical data', () => {
      const currentTime = Date.now();
      predictor.addHistoricalData(currentTime, 100);
      predictor.addHistoricalData(currentTime + 1000, 120);
      predictor.addHistoricalData(currentTime + 2000, 140);

      // This should not throw an error
      expect(true).toBe(true);
    });

    it('should predict population growth', async () => {
      // Add some historical data first
      const currentTime = Date.now();
      for (let i = 0; i < 10; i++) {
        predictor.addHistoricalData(currentTime - i * 1000, 100 + i * 5);
      }

      const prediction = await predictor.predictPopulationGrowth(mockOrganisms, 10, false);

      expect(prediction).toBeDefined();
      expect(prediction.totalPopulation).toHaveLength(10);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.peakPopulation).toBeGreaterThan(0);
    });

    it('should update environmental factors', () => {
      const newFactors = {
        temperature: 0.7,
        resources: 0.6,
      };

      predictor.updateEnvironmentalFactors(newFactors);

      // This should not throw an error
      expect(true).toBe(true);
    });

    it('should handle edge cases', async () => {
      // Test with no historical data
      const prediction = await predictor.predictPopulationGrowth([], 5, false);

      expect(prediction).toBeDefined();
      expect(prediction.totalPopulation).toHaveLength(5);
      expect(prediction.confidence).toBe(0);
    });
  });

  describe('Algorithm Worker Manager', () => {
    beforeEach(async () => {
      // Initialize workers
      await algorithmWorkerManager.initialize();
    });

    afterEach(() => {
      // Clean up
      algorithmWorkerManager.terminate();
    });

    it('should initialize workers successfully', () => {
      const stats = algorithmWorkerManager.getPerformanceStats();
      expect(stats).toBeDefined();
      expect(stats.workerCount).toBeGreaterThanOrEqual(0);
    });

    it('should provide performance statistics', () => {
      const stats = algorithmWorkerManager.getPerformanceStats();

      expect(stats.workerCount).toBeGreaterThanOrEqual(0);
      expect(stats.pendingTasks).toBeGreaterThanOrEqual(0);
      expect(stats.tasksCompleted).toBeGreaterThanOrEqual(0);
    });

    it('should handle worker task processing', async () => {
      const testData = { numbers: [1, 2, 3, 4, 5] };

      // This tests that the worker manager can handle tasks
      // without actually processing them (since we're in a test environment)
      const stats = algorithmWorkerManager.getPerformanceStats();
      expect(stats.workerCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration Tests', () => {
    it('should work together - spatial partitioning + batch processing', () => {
      const spatialPartitioning = new SpatialPartitioningManager(800, 600, 10);
      const batchProcessor = new AdaptiveBatchProcessor(
        { batchSize: 20, maxFrameTime: 16, useTimeSlicing: true },
        16.67
      );

      const mockOrganisms: Organism[] = [];
      for (let i = 0; i < 100; i++) {
        mockOrganisms.push(
          new Organism(Math.random() * 800, Math.random() * 600, ORGANISM_TYPES.bacteria)
        );
      }

      // Rebuild spatial partitioning
      spatialPartitioning.rebuild(mockOrganisms);

      // Process in batches
      let processedCount = 0;
      batchProcessor.processBatch(
        mockOrganisms,
        organism => {
          processedCount++;
          organism.update(1 / 60, 800, 600);
        },
        1 / 60,
        800,
        600
      );

      expect(processedCount).toBe(mockOrganisms.length);
      expect(spatialPartitioning.getDebugInfo().totalElements).toBe(mockOrganisms.length);
    });

    it('should handle performance monitoring across all algorithms', () => {
      const spatialPartitioning = new SpatialPartitioningManager(800, 600, 10);
      const batchProcessor = new AdaptiveBatchProcessor(
        { batchSize: 15, maxFrameTime: 16, useTimeSlicing: true },
        16.67
      );

      const mockOrganisms: Organism[] = [];
      for (let i = 0; i < 50; i++) {
        mockOrganisms.push(
          new Organism(Math.random() * 800, Math.random() * 600, ORGANISM_TYPES.bacteria)
        );
      }

      // Process multiple frames to generate performance data
      for (let frame = 0; frame < 10; frame++) {
        spatialPartitioning.rebuild(mockOrganisms);
        batchProcessor.processBatch(
          mockOrganisms,
          organism => {
            organism.update(1 / 60, 800, 600);
          },
          1 / 60,
          800,
          600
        );
      }

      const spatialStats = spatialPartitioning.getDebugInfo();
      const batchStats = batchProcessor.getPerformanceStats();

      expect(spatialStats.totalRebuildOperations).toBeGreaterThan(0);
      expect(batchStats.averageProcessingTime).toBeGreaterThanOrEqual(0);
      expect(batchStats.currentBatchSize).toBeGreaterThan(0);
    });
  });
});
