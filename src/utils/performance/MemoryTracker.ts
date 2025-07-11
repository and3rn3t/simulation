import type { MemoryStats } from './index';

/**
 * Memory tracking and monitoring utility
 */
export class MemoryTracker {
  private static instance: MemoryTracker;
  private samples: MemoryStats[] = [];
  private maxSamples: number = 100;

  private constructor() {}

  public static getInstance(): MemoryTracker {
    if (!MemoryTracker.instance) {
      MemoryTracker.instance = new MemoryTracker();
    }
    return MemoryTracker.instance;
  }

  /**
   * Get current memory statistics
   */
  public getCurrentMemoryStats(): MemoryStats | null {
    if (!('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    const total = memory.totalJSHeapSize / 1024 / 1024;
    const limit = memory.jsHeapSizeLimit / 1024 / 1024;

    return {
      used,
      total,
      limit,
      utilizationPercent: (used / limit) * 100,
    };
  }

  /**
   * Track memory usage over time
   */
  public trackMemory(): void {
    const stats = this.getCurrentMemoryStats();
    if (!stats) return;

    this.samples.push(stats);

    // Keep only recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Get memory trend (positive = increasing, negative = decreasing)
   */
  public getMemoryTrend(): number {
    if (this.samples.length < 2) return 0;

    const recent = this.samples.slice(-10);
    if (recent.length < 2) return 0;

    const first = recent[0].used;
    const last = recent[recent.length - 1].used;

    return (last - first) / recent.length;
  }

  /**
   * Check for potential memory leak
   */
  public detectMemoryLeak(): boolean {
    const trend = this.getMemoryTrend();
    return trend > 0.5; // Growing by more than 0.5MB per sample
  }

  /**
   * Get memory usage statistics
   */
  public getMemoryStatistics(): {
    current: MemoryStats | null;
    average: number;
    peak: number;
    trend: number;
    leakDetected: boolean;
  } {
    const current = this.getCurrentMemoryStats();
    const usedValues = this.samples.map(s => s.used);

    return {
      current,
      average: usedValues.length > 0 ? usedValues.reduce((a, b) => a + b, 0) / usedValues.length : 0,
      peak: usedValues.length > 0 ? Math.max(...usedValues) : 0,
      trend: this.getMemoryTrend(),
      leakDetected: this.detectMemoryLeak(),
    };
  }

  /**
   * Clear memory samples
   */
  public clearSamples(): void {
    this.samples = [];
  }
}
