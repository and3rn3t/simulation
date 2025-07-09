import { log } from '../system/logger';
import { ErrorHandler, ErrorSeverity } from '../system/errorHandler';

/**
 * Memory usage information interface
 */
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

/**
 * Memory threshold configuration
 */
export interface MemoryThresholds {
  warning: number;    // Percentage of heap limit
  critical: number;   // Percentage of heap limit
  emergency: number;  // Percentage of heap limit
}

/**
 * Memory monitoring and management system
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private isSupported: boolean;
  private memoryHistory: MemoryInfo[] = [];
  private maxHistorySize = 100;
  private monitoringInterval: number | null = null;
  private thresholds: MemoryThresholds = {
    warning: 70,   // 70% of heap limit
    critical: 85,  // 85% of heap limit
    emergency: 95  // 95% of heap limit
  };
  private lastAlertTime = 0;
  private alertCooldown = 5000; // 5 seconds between alerts

  private constructor() {
    this.isSupported = 'memory' in performance;
    
    if (!this.isSupported) {
      log.logSystem('Memory monitoring not supported in this browser');
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  /**
   * Get current memory usage information
   */
  getCurrentMemoryInfo(): MemoryInfo | null {
    if (!this.isSupported) {
      return null;
    }

    try {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now()
      };
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error('Failed to get memory info'),
        ErrorSeverity.LOW,
        'MemoryMonitor.getCurrentMemoryInfo'
      );
      return null;
    }
  }

  /**
   * Calculate memory usage percentage
   */
  getMemoryUsagePercentage(): number {
    const memInfo = this.getCurrentMemoryInfo();
    if (!memInfo) return 0;
    
    return (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
  }

  /**
   * Check if memory usage is within safe limits
   */
  isMemoryUsageSafe(): boolean {
    const percentage = this.getMemoryUsagePercentage();
    return percentage < this.thresholds.warning;
  }

  /**
   * Get memory usage level
   */
  getMemoryUsageLevel(): 'safe' | 'warning' | 'critical' | 'emergency' {
    const percentage = this.getMemoryUsagePercentage();
    
    if (percentage >= this.thresholds.emergency) return 'emergency';
    if (percentage >= this.thresholds.critical) return 'critical';
    if (percentage >= this.thresholds.warning) return 'warning';
    return 'safe';
  }

  /**
   * Start continuous memory monitoring
   */
  startMonitoring(intervalMs: number = 1000): void {
    if (this.monitoringInterval !== null) {
      this.stopMonitoring();
    }

    this.monitoringInterval = window.setInterval(() => {
      this.updateMemoryHistory();
      this.checkMemoryThresholds();
    }, intervalMs);

    log.logSystem('Memory monitoring started', { intervalMs });
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval !== null) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      log.logSystem('Memory monitoring stopped');
    }
  }

  /**
   * Update memory history
   */
  private updateMemoryHistory(): void {
    const memInfo = this.getCurrentMemoryInfo();
    if (!memInfo) return;

    this.memoryHistory.push(memInfo);
    
    // Keep history size manageable
    if (this.memoryHistory.length > this.maxHistorySize) {
      this.memoryHistory.shift();
    }
  }

  /**
   * Check memory thresholds and trigger alerts
   */
  private checkMemoryThresholds(): void {
    const level = this.getMemoryUsageLevel();
    const now = Date.now();
    
    // Avoid alert spam with cooldown
    if (now - this.lastAlertTime < this.alertCooldown) {
      return;
    }

    const memInfo = this.getCurrentMemoryInfo();
    if (!memInfo) return;

    const percentage = this.getMemoryUsagePercentage();

    switch (level) {
      case 'warning':
        log.logSystem('Memory usage warning', {
          percentage: percentage.toFixed(1),
          usedMB: (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(1),
          limitMB: (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)
        });
        this.lastAlertTime = now;
        break;

      case 'critical':
        log.logSystem('Memory usage critical', {
          percentage: percentage.toFixed(1),
          usedMB: (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(1),
          limitMB: (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)
        });
        this.triggerMemoryCleanup();
        this.lastAlertTime = now;
        break;

      case 'emergency':
        log.logSystem('Memory usage emergency - forcing cleanup', {
          percentage: percentage.toFixed(1),
          usedMB: (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(1),
          limitMB: (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)
        });
        this.forceMemoryCleanup();
        this.lastAlertTime = now;
        break;
    }
  }

  /**
   * Trigger memory cleanup procedures
   */
  private triggerMemoryCleanup(): void {
    // Notify other systems to clean up
    window.dispatchEvent(new CustomEvent('memory-cleanup', {
      detail: { level: 'normal' }
    }));
  }

  /**
   * Force aggressive memory cleanup
   */
  private forceMemoryCleanup(): void {
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
        log.logSystem('Forced garbage collection');
      } catch (error) {
        // Ignore errors
      }
    }

    // Notify other systems to do aggressive cleanup
    window.dispatchEvent(new CustomEvent('memory-cleanup', {
      detail: { level: 'aggressive' }
    }));
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    current: MemoryInfo | null;
    percentage: number;
    level: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    averageUsage: number;
  } {
    const current = this.getCurrentMemoryInfo();
    const percentage = this.getMemoryUsagePercentage();
    const level = this.getMemoryUsageLevel();
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let averageUsage = 0;

    if (this.memoryHistory.length > 5) {
      const recent = this.memoryHistory.slice(-5);
      const older = this.memoryHistory.slice(-10, -5);
      
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.reduce((sum, info) => sum + info.usedJSHeapSize, 0) / recent.length;
        const olderAvg = older.reduce((sum, info) => sum + info.usedJSHeapSize, 0) / older.length;
        
        const changePct = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (changePct > 5) trend = 'increasing';
        else if (changePct < -5) trend = 'decreasing';
        else trend = 'stable';
      }
    }

    if (this.memoryHistory.length > 0) {
      averageUsage = this.memoryHistory.reduce((sum, info) => 
        sum + (info.usedJSHeapSize / info.jsHeapSizeLimit), 0
      ) / this.memoryHistory.length * 100;
    }

    return {
      current,
      percentage,
      level,
      trend,
      averageUsage
    };
  }

  /**
   * Set memory thresholds
   */
  setThresholds(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    log.logSystem('Memory thresholds updated', this.thresholds);
  }

  /**
   * Clear memory history
   */
  clearHistory(): void {
    this.memoryHistory = [];
    log.logSystem('Memory history cleared');
  }

  /**
   * Export memory history for analysis
   */
  exportHistory(): MemoryInfo[] {
    return [...this.memoryHistory];
  }

  /**
   * Get memory recommendations
   */
  getMemoryRecommendations(): string[] {
    const stats = this.getMemoryStats();
    const recommendations: string[] = [];

    if (stats.level === 'critical' || stats.level === 'emergency') {
      recommendations.push('Reduce maximum population limit');
      recommendations.push('Clear object pools');
      recommendations.push('Pause simulation to allow cleanup');
    }

    if (stats.level === 'warning') {
      recommendations.push('Consider reducing simulation complexity');
      recommendations.push('Monitor memory usage closely');
    }

    if (stats.trend === 'increasing') {
      recommendations.push('Memory usage is trending upward - investigate memory leaks');
      recommendations.push('Check for objects not being properly released');
    }

    if (stats.averageUsage > 60) {
      recommendations.push('Average memory usage is high - consider optimizations');
    }

    return recommendations;
  }
}

/**
 * Memory-aware cache implementation
 */
export class MemoryAwareCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  private memoryMonitor: MemoryMonitor;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    this.memoryMonitor = MemoryMonitor.getInstance();
    
    // Listen for memory cleanup events
    window.addEventListener('memory-cleanup', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.level === 'aggressive') {
        this.clear();
      } else {
        this.evictOldEntries();
      }
    });
  }

  /**
   * Get value from cache
   */
  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  /**
   * Set value in cache with memory awareness
   */
  set(key: K, value: V): void {
    // Check memory usage before adding
    if (!this.memoryMonitor.isMemoryUsageSafe() && !this.cache.has(key)) {
      // Skip caching if memory is tight and this is a new entry
      return;
    }

    this.cache.set(key, value);
    
    // Evict entries if needed
    if (this.cache.size > this.maxSize) {
      this.evictOldEntries();
    }
  }

  /**
   * Check if key exists in cache
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete entry from cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Evict old entries to free memory
   */
  private evictOldEntries(): void {
    const entries = Array.from(this.cache.entries());
    const evictCount = Math.max(1, Math.floor(entries.length * 0.25)); // Evict 25%
    
    for (let i = 0; i < evictCount; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }
    
    log.logSystem('Cache evicted entries', { evictCount, remainingSize: this.cache.size });
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Could implement hit tracking if needed
    };
  }
}
