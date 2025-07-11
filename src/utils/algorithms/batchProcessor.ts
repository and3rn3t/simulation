import { Organism } from '../../core/organism';
import { ErrorHandler, ErrorSeverity, SimulationError } from '../system/errorHandler';

/**
 * Batch processing configuration
 */
export interface BatchConfig {
  /** Size of each batch */
  batchSize: number;
  /** Maximum processing time per frame (ms) */
  maxFrameTime: number;
  /** Whether to use time-slicing */
  useTimeSlicing: boolean;
}

/**
 * Batch processing result
 */
export interface BatchResult {
  /** Number of organisms processed */
  processed: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Whether all organisms were processed */
  completed: boolean;
  /** Number of remaining organisms */
  remaining: number;
}

/**
 * Batch processor for efficient organism updates
 * Implements time-slicing to maintain consistent frame rates
 */
export class OrganismBatchProcessor {
  private config: BatchConfig;
  private currentBatch: number = 0;
  private processingStartTime: number = 0;

  /**
   * Creates a new batch processor
   * @param config - Batch processing configuration
   */
  constructor(config: BatchConfig) {
    this.config = {
      batchSize: Math.max(1, config.batchSize),
      maxFrameTime: Math.max(1, config.maxFrameTime),
      useTimeSlicing: config.useTimeSlicing
    };
  }

  /**
   * Processes organisms in batches
   * @param organisms - Array of organisms to process
   * @param updateFn - Function to call for each organism
   * @param deltaTime - Time elapsed since last update
   * @param canvasWidth - Canvas width for bounds checking
   * @param canvasHeight - Canvas height for bounds checking
   * @returns Batch processing result
   */
  processBatch(
    organisms: Organism[],
    updateFn: (organism: Organism, deltaTime: number, canvasWidth: number, canvasHeight: number) => void,
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number
  ): BatchResult {
    try {
      this.processingStartTime = performance.now();
      let processed = 0;
      const totalOrganisms = organisms.length;
      
      if (totalOrganisms === 0) {
        return {
          processed: 0,
          processingTime: 0,
          completed: true,
          remaining: 0
        };
      }

      // Reset batch counter if we've processed all organisms
      if (this.currentBatch >= totalOrganisms) {
        this.currentBatch = 0;
      }

      const startIndex = this.currentBatch;
      const endIndex = Math.min(startIndex + this.config.batchSize, totalOrganisms);

      // Process organisms in current batch
      for (let i = startIndex; i < endIndex; i++) {
        if (this.config.useTimeSlicing && this.shouldYieldFrame()) {
          break;
        }

        try {
          const organism = organisms[i];
          if (organism) {
            updateFn(organism, deltaTime, canvasWidth, canvasHeight);
            processed++;
          }
        } catch (error) {
          ErrorHandler.getInstance().handleError(
            error instanceof Error ? error : new SimulationError('Failed to update organism in batch', 'BATCH_UPDATE_ERROR'),
            ErrorSeverity.MEDIUM,
            'Batch organism update'
          );
          // Continue processing other organisms
        }
      }

      this.currentBatch = startIndex + processed;
      const completed = this.currentBatch >= totalOrganisms;
      
      if (completed) {
        this.currentBatch = 0;
      }

      const processingTime = performance.now() - this.processingStartTime;

      return {
        processed,
        processingTime,
        completed,
        remaining: totalOrganisms - this.currentBatch
      };
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new SimulationError('Failed to process organism batch', 'BATCH_PROCESS_ERROR'),
        ErrorSeverity.HIGH,
        'OrganismBatchProcessor processBatch'
      );
      
      return {
        processed: 0,
        processingTime: 0,
        completed: false,
        remaining: organisms.length
      };
    }
  }

  /**
   * Processes organisms for reproduction in batches
   * @param organisms - Array of organisms to check
   * @param reproductionFn - Function to call for reproduction
   * @param maxPopulation - Maximum allowed population
   * @returns Array of new organisms and batch result
   */
  processReproduction(
    organisms: Organism[],
    reproductionFn: (organism: Organism) => Organism | null,
    maxPopulation: number
  ): { newOrganisms: Organism[]; result: BatchResult } {
    try {
      this.processingStartTime = performance.now();
      const newOrganisms: Organism[] = [];
      let processed = 0;
      const totalOrganisms = organisms.length;

      if (totalOrganisms === 0) {
        return {
          newOrganisms: [],
          result: {
            processed: 0,
            processingTime: 0,
            completed: true,
            remaining: 0
          }
        };
      }

      // Reset batch counter if we've processed all organisms
      if (this.currentBatch >= totalOrganisms) {
        this.currentBatch = 0;
      }

      const startIndex = this.currentBatch;
      const endIndex = Math.min(startIndex + this.config.batchSize, totalOrganisms);

      // Process organisms in current batch
      for (let i = startIndex; i < endIndex; i++) {
        if (this.config.useTimeSlicing && this.shouldYieldFrame()) {
          break;
        }

        if (organisms.length + newOrganisms.length >= maxPopulation) {
          break;
        }

        try {
          const organism = organisms[i];
          if (organism) {
            const newOrganism = reproductionFn(organism);
            if (newOrganism) {
              newOrganisms.push(newOrganism);
            }
            processed++;
          }
        } catch (error) {
          ErrorHandler.getInstance().handleError(
            error instanceof Error ? error : new SimulationError('Failed to process organism reproduction', 'BATCH_REPRODUCTION_ERROR'),
            ErrorSeverity.MEDIUM,
            'Batch reproduction processing'
          );
          // Continue processing other organisms
        }
      }

      this.currentBatch = startIndex + processed;
      const completed = this.currentBatch >= totalOrganisms;
      
      if (completed) {
        this.currentBatch = 0;
      }

      const processingTime = performance.now() - this.processingStartTime;

      return {
        newOrganisms,
        result: {
          processed,
          processingTime,
          completed,
          remaining: totalOrganisms - this.currentBatch
        }
      };
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new SimulationError('Failed to process reproduction batch', 'BATCH_REPRODUCTION_PROCESS_ERROR'),
        ErrorSeverity.HIGH,
        'OrganismBatchProcessor processReproduction'
      );
      
      return {
        newOrganisms: [],
        result: {
          processed: 0,
          processingTime: 0,
          completed: false,
          remaining: organisms.length
        }
      };
    }
  }

  /**
   * Checks if the current frame should yield processing time
   * @returns True if processing should yield, false otherwise
   */
  private shouldYieldFrame(): boolean {
    const elapsed = performance.now() - this.processingStartTime;
    return elapsed >= this.config.maxFrameTime;
  }

  /**
   * Resets the batch processor state
   */
  reset(): void {
    this.currentBatch = 0;
    this.processingStartTime = 0;
  }

  /**
   * Updates the batch configuration
   * @param config - New batch configuration
   */
  updateConfig(config: Partial<BatchConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      batchSize: Math.max(1, config.batchSize || this.config.batchSize),
      maxFrameTime: Math.max(1, config.maxFrameTime || this.config.maxFrameTime)
    };
  }

  /**
   * Gets the current batch processing progress
   * @param totalOrganisms - Total number of organisms
   * @returns Progress information
   */
  getProgress(totalOrganisms: number): { current: number; total: number; percentage: number } {
    return {
      current: this.currentBatch,
      total: totalOrganisms,
      percentage: totalOrganisms > 0 ? (this.currentBatch / totalOrganisms) * 100 : 0
    };
  }

  /**
   * Gets the current configuration
   * @returns Current batch configuration
   */
  getConfig(): BatchConfig {
    return { ...this.config };
  }
}

/**
 * Adaptive batch processor that adjusts batch size based on performance
 */
export class AdaptiveBatchProcessor extends OrganismBatchProcessor {
  private performanceHistory: number[] = [];
  private targetFrameTime: number;
  private adjustmentFactor: number = 1.2;
  private minBatchSize: number = 1;
  private maxBatchSize: number = 1000;

  /**
   * Creates a new adaptive batch processor
   * @param config - Initial batch configuration
   * @param targetFrameTime - Target frame time in milliseconds
   */
  constructor(config: BatchConfig, targetFrameTime: number = 16.67) {
    super(config);
    this.targetFrameTime = targetFrameTime;
  }

  /**
   * Processes organisms and adapts batch size based on performance
   * @param organisms - Array of organisms to process
   * @param updateFn - Function to call for each organism
   * @param deltaTime - Time elapsed since last update
   * @param canvasWidth - Canvas width for bounds checking
   * @param canvasHeight - Canvas height for bounds checking
   * @returns Batch processing result
   */
  override processBatch(
    organisms: Organism[],
    updateFn: (organism: Organism, deltaTime: number, canvasWidth: number, canvasHeight: number) => void,
    deltaTime: number,
    canvasWidth: number,
    canvasHeight: number
  ): BatchResult {
    const result = super.processBatch(organisms, updateFn, deltaTime, canvasWidth, canvasHeight);
    
    // Track performance and adjust batch size
    this.trackPerformance(result.processingTime);
    this.adaptBatchSize();
    
    return result;
  }

  /**
   * Tracks processing performance
   * @param processingTime - Time taken to process the batch
   */
  private trackPerformance(processingTime: number): void {
    this.performanceHistory.push(processingTime);
    
    // Keep only recent performance data
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Adapts batch size based on performance history
   */
  private adaptBatchSize(): void {
    if (this.performanceHistory.length < 3) {
      return;
    }

    const avgProcessingTime = this.performanceHistory.reduce((sum, time) => sum + time, 0) / this.performanceHistory.length;
    const config = this.getConfig();
    let newBatchSize = config.batchSize;

    if (avgProcessingTime > this.targetFrameTime) {
      // Processing is too slow, reduce batch size
      newBatchSize = Math.max(this.minBatchSize, Math.floor(config.batchSize / this.adjustmentFactor));
    } else if (avgProcessingTime < this.targetFrameTime * 0.7) {
      // Processing is fast, increase batch size
      newBatchSize = Math.min(this.maxBatchSize, Math.ceil(config.batchSize * this.adjustmentFactor));
    }

    if (newBatchSize !== config.batchSize) {
      this.updateConfig({ batchSize: newBatchSize });
    }
  }

  /**
   * Sets the target frame time for adaptation
   * @param targetFrameTime - Target frame time in milliseconds
   */
  setTargetFrameTime(targetFrameTime: number): void {
    this.targetFrameTime = Math.max(1, targetFrameTime);
  }

  /**
   * Gets performance statistics
   * @returns Performance statistics object
   */
  getPerformanceStats(): {
    averageProcessingTime: number;
    minProcessingTime: number;
    maxProcessingTime: number;
    targetFrameTime: number;
    currentBatchSize: number;
  } {
    const config = this.getConfig();
    
    if (this.performanceHistory.length === 0) {
      return {
        averageProcessingTime: 0,
        minProcessingTime: 0,
        maxProcessingTime: 0,
        targetFrameTime: this.targetFrameTime,
        currentBatchSize: config.batchSize
      };
    }

    return {
      averageProcessingTime: this.performanceHistory.reduce((sum, time) => sum + time, 0) / this.performanceHistory.length,
      minProcessingTime: Math.min(...this.performanceHistory),
      maxProcessingTime: Math.max(...this.performanceHistory),
      targetFrameTime: this.targetFrameTime,
      currentBatchSize: config.batchSize
    };
  }
}
