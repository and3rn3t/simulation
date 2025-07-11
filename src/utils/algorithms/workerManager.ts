import { ErrorHandler, ErrorSeverity, SimulationError } from '../system/errorHandler';
import type { OrganismType } from '../../models/organismTypes';

// Import worker types
export interface WorkerMessage {
  id: string;
  type: 'PREDICT_POPULATION' | 'CALCULATE_STATISTICS' | 'BATCH_PROCESS';
  data: any;
}

export interface WorkerResponse {
  id: string;
  type: 'PREDICTION_RESULT' | 'STATISTICS_RESULT' | 'BATCH_RESULT' | 'ERROR';
  data: any;
}

export interface PopulationPredictionData {
  currentPopulation: number;
  organismTypes: OrganismType[];
  simulationTime: number;
  environmentalFactors: {
    temperature: number;
    resources: number;
    space: number;
  };
  predictionSteps: number;
}

export interface StatisticsData {
  organisms: {
    x: number;
    y: number;
    age: number;
    type: string;
  }[];
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Manager for Web Worker-based algorithm processing
 * Handles multithreaded calculations without blocking the main thread
 */
export class AlgorithmWorkerManager {
  private workers: Worker[] = [];
  private workerCount: number;
  private currentWorkerIndex: number = 0;
  private pendingTasks: Map<
    string,
    {
      resolve: (result: any) => void;
      reject: (error: Error) => void;
      timeout: NodeJS.Timeout;
    }
  > = new Map();
  private isInitialized: boolean = false;

  /**
   * Creates a new algorithm worker manager
   * @param workerCount - Number of worker threads to create
   */
  constructor(workerCount: number = navigator.hardwareConcurrency || 4) {
    this.workerCount = Math.max(1, Math.min(workerCount, 8)); // Limit to 8 workers
  }

  /**
   * Initializes the worker pool
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        return;
      }

      // Create worker pool
      for (let i = 0; i < this.workerCount; i++) {
        // Use a string path instead of URL constructor for compatibility
        const workerScript = `
          import('./simulationWorker.ts').then(module => {
            // Worker initialization will be handled by the module
          });
        `;
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob), { type: 'module' });

        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          this.handleWorkerMessage(e.data);
        };

        worker.onerror = error => {
          ErrorHandler.getInstance().handleError(
            new SimulationError(`Worker error: ${error.message}`, 'WORKER_ERROR'),
            ErrorSeverity.HIGH,
            'AlgorithmWorkerManager'
          );
        };

        this.workers.push(worker);
      }

      this.isInitialized = true;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error
          ? error
          : new SimulationError('Failed to initialize worker pool', 'WORKER_INIT_ERROR'),
        ErrorSeverity.HIGH,
        'AlgorithmWorkerManager initialization'
      );
      throw error;
    }
  }

  /**
   * Predicts population growth using worker threads
   * @param data - Population prediction data
   * @returns Promise resolving to prediction results
   */
  async predictPopulation(data: PopulationPredictionData): Promise<{
    logistic: number[];
    competition: { totalPopulation: number[]; byType: Record<string, number[]> };
  }> {
    await this.initialize();

    return this.sendTaskToWorker('PREDICT_POPULATION', data);
  }

  /**
   * Calculates statistics using worker threads
   * @param data - Statistics data
   * @returns Promise resolving to statistics results
   */
  async calculateStatistics(data: StatisticsData): Promise<{
    spatial: {
      density: number[];
      clusters: { x: number; y: number; count: number }[];
      dispersion: number;
    };
    age: {
      histogram: number[];
      mean: number;
      median: number;
      standardDeviation: number;
    };
  }> {
    await this.initialize();

    return this.sendTaskToWorker('CALCULATE_STATISTICS', data);
  }

  /**
   * Sends a task to an available worker
   * @param type - Task type
   * @param data - Task data
   * @returns Promise resolving to task result
   */
  private async sendTaskToWorker(type: WorkerMessage['type'], data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const taskId = this.generateTaskId();
      const worker = this.getNextWorker();

      // Set up task timeout
      const timeout = setTimeout(() => {
        this.pendingTasks.delete(taskId);
        reject(new SimulationError('Worker task timeout', 'WORKER_TIMEOUT'));
      }, 10000); // 10 second timeout

      // Store task promise handlers
      this.pendingTasks.set(taskId, {
        resolve,
        reject,
        timeout,
      });

      // Send task to worker
      const message: WorkerMessage = {
        id: taskId,
        type,
        data,
      };

      worker.postMessage(message);
    });
  }

  /**
   * Handles messages from worker threads
   * @param response - Worker response
   */
  private handleWorkerMessage(response: WorkerResponse): void {
    const task = this.pendingTasks.get(response.id);

    if (!task) {
      return; // Task may have timed out
    }

    clearTimeout(task.timeout);
    this.pendingTasks.delete(response.id);

    if (response.type === 'ERROR') {
      task.reject(new SimulationError(response.data.message, 'WORKER_TASK_ERROR'));
    } else {
      task.resolve(response.data);
    }
  }

  /**
   * Gets the next available worker using round-robin
   * @returns Next worker instance
   */
  private getNextWorker(): Worker {
    const worker = this.workers[this.currentWorkerIndex];
    if (!worker) {
      throw new Error('No workers available');
    }
    this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  /**
   * Generates a unique task ID
   * @returns Unique task identifier
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets the number of active workers
   * @returns Worker count
   */
  getWorkerCount(): number {
    return this.workers.length;
  }

  /**
   * Gets the number of pending tasks
   * @returns Pending task count
   */
  getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * Terminates all worker threads
   */
  terminate(): void {
    try {
      this.workers.forEach(worker => worker.terminate());
      this.workers = [];

      // Reject all pending tasks
      this.pendingTasks.forEach(task => {
        clearTimeout(task.timeout);
        task.reject(new SimulationError('Worker pool terminated', 'WORKER_TERMINATED'));
      });

      this.pendingTasks.clear();
      this.isInitialized = false;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error
          ? error
          : new SimulationError('Failed to terminate workers', 'WORKER_TERMINATION_ERROR'),
        ErrorSeverity.MEDIUM,
        'AlgorithmWorkerManager terminate'
      );
    }
  }

  /**
   * Gets performance statistics for the worker pool
   * @returns Performance statistics
   */
  getPerformanceStats(): {
    workerCount: number;
    pendingTasks: number;
    averageTaskTime: number;
    tasksCompleted: number;
  } {
    // This is a simplified version - you could extend this to track more detailed metrics
    return {
      workerCount: this.workers.length,
      pendingTasks: this.pendingTasks.size,
      averageTaskTime: 0, // Would need to track task completion times
      tasksCompleted: 0, // Would need to track total completed tasks
    };
  }
}

/**
 * Singleton instance for global worker management
 */
export const algorithmWorkerManager = new AlgorithmWorkerManager();
