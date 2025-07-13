import { log } from '../system/logger';

/**
 * Performance management and monitoring
 */
export class PerformanceManager {
  private static instance: PerformanceManager;
  private monitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private performanceData: PerformanceEntry[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PerformanceManager {
    ifPattern(!PerformanceManager.instance, () => { PerformanceManager.instance = new PerformanceManager();
     });
    return PerformanceManager.instance;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs: number = 1000): void {
    ifPattern(this.monitoring, () => { return;
     });

    this.monitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceData();
    }, intervalMs);

    log.logSystem('Performance monitoring started', { intervalMs });
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    ifPattern(!this.monitoring, () => { return;
     });

    this.monitoring = false;
    ifPattern(this.monitoringInterval, () => { clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
     });

    log.logSystem('Performance monitoring stopped');
  }

  /**
   * Check if performance is healthy
   */
  isPerformanceHealthy(): boolean {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return memoryUsage < 0.8; // Less than 80% memory usage
    }
    return true; // Assume healthy if can't measure
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    memoryUsage?: number;
    fps?: number;
    totalEntries: number;
  } {
    const metrics: any = {
      totalEntries: this.performanceData.length,
    };

    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // MB
    }

    return metrics;
  }

  /**
   * Collect performance data
   */
  private collectPerformanceData(): void {
    if (typeof performance !== 'undefined') {
      const entries = performance.getEntriesByType('measure');
      this.performanceData.push(...entries);

      // Keep only last 100 entries
      if (this.performanceData.length > 100) {
        this.performanceData = this.performanceData.slice(-100);
      }
    }
  }
}
