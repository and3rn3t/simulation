/**
 * Performance monitoring and optimization manager
 * Centralizes performance tracking and optimization strategies
 */
export class PerformanceManager {
  private static instance: PerformanceManager;
  private metrics: Map<string, number[]> = new Map();
  private isMonitoring: boolean = false;
  private monitoringInterval?: number;

  private constructor() {}

  public static getInstance(): PerformanceManager {
    if (!PerformanceManager.instance) {
      PerformanceManager.instance = new PerformanceManager();
    }
    return PerformanceManager.instance;
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(intervalMs: number = 1000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Collect performance metrics
   */
  private collectMetrics(): void {
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric('memory.used', memory.usedJSHeapSize / 1024 / 1024);
      this.recordMetric('memory.total', memory.totalJSHeapSize / 1024 / 1024);
      this.recordMetric('memory.limit', memory.jsHeapSizeLimit / 1024 / 1024);
    }

    // Frame rate estimation
    const now = performance.now();
    this.recordMetric('timestamp', now);
  }

  /**
   * Record a performance metric
   */
  public recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values to prevent memory leaks
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get metric statistics
   */
  public getMetricStats(name: string): {
    current: number;
    average: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const current = values[values.length - 1];
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { current, average, min, max, count: values.length };
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    this.metrics.forEach((values, key) => {
      result[key] = [...values];
    });
    return result;
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Check if performance is within acceptable ranges
   */
  public isPerformanceHealthy(): {
    healthy: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check memory usage
    const memoryUsed = this.getMetricStats('memory.used');
    if (memoryUsed && memoryUsed.current > 100) { // 100MB threshold
      issues.push(`High memory usage: ${memoryUsed.current.toFixed(1)}MB`);
    }

    // Check for memory leaks
    if (memoryUsed && memoryUsed.count > 10) {
      const trend = this.calculateTrend('memory.used');
      if (trend > 0.1) { // Growing by more than 0.1MB per sample
        issues.push('Potential memory leak detected');
      }
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Calculate trend for a metric (positive = increasing, negative = decreasing)
   */
  private calculateTrend(metricName: string): number {
    const values = this.metrics.get(metricName);
    if (!values || values.length < 2) return 0;

    const recent = values.slice(-10); // Last 10 values
    if (recent.length < 2) return 0;

    const first = recent[0];
    const last = recent[recent.length - 1];
    
    return (last - first) / recent.length;
  }
}
