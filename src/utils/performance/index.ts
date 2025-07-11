// Performance utilities exports
export { PerformanceManager } from './PerformanceManager';
export { MemoryTracker } from './MemoryTracker';
export { FPSMonitor } from './FPSMonitor';

// Type exports - define inline to avoid import issues
export interface PerformanceMetrics {
  memory: MemoryStats;
  fps: FPSStats;
  timestamp: number;
}

export interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  utilizationPercent: number;
}

export interface FPSStats {
  current: number;
  average: number;
  min: number;
  max: number;
  frames: number;
}
