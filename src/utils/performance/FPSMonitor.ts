import type { FPSStats } from './index';

/**
 * FPS monitoring utility
 */
export class FPSMonitor {
  private static instance: FPSMonitor;
  private frames: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private startTime: number = 0;
  private maxSamples: number = 100;

  private constructor() {
    this.startTime = performance.now();
  }

  public static getInstance(): FPSMonitor {
    if (!FPSMonitor.instance) {
      FPSMonitor.instance = new FPSMonitor();
    }
    return FPSMonitor.instance;
  }

  /**
   * Record a frame
   */
  public recordFrame(): void {
    const currentTime = performance.now();
    
    if (this.lastFrameTime > 0) {
      const deltaTime = currentTime - this.lastFrameTime;
      const fps = 1000 / deltaTime;
      
      this.frames.push(fps);
      
      // Keep only recent frames
      if (this.frames.length > this.maxSamples) {
        this.frames.shift();
      }
    }
    
    this.lastFrameTime = currentTime;
    this.frameCount++;
  }

  /**
   * Get current FPS statistics
   */
  public getFPSStats(): FPSStats {
    if (this.frames.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        frames: this.frameCount,
      };
    }

    const current = this.frames[this.frames.length - 1] || 0;
    const average = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    const min = Math.min(...this.frames);
    const max = Math.max(...this.frames);

    return {
      current: Math.round(current),
      average: Math.round(average),
      min: Math.round(min),
      max: Math.round(max),
      frames: this.frameCount,
    };
  }

  /**
   * Check if FPS is stable
   */
  public isFPSStable(targetFPS: number = 60, tolerance: number = 5): boolean {
    const stats = this.getFPSStats();
    return Math.abs(stats.average - targetFPS) <= tolerance;
  }

  /**
   * Get performance grade based on FPS
   */
  public getPerformanceGrade(): 'excellent' | 'good' | 'fair' | 'poor' {
    const stats = this.getFPSStats();
    
    if (stats.average >= 55) return 'excellent';
    if (stats.average >= 45) return 'good';
    if (stats.average >= 30) return 'fair';
    return 'poor';
  }

  /**
   * Reset FPS tracking
   */
  public reset(): void {
    this.frames = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.startTime = performance.now();
  }

  /**
   * Get uptime in seconds
   */
  public getUptime(): number {
    return (performance.now() - this.startTime) / 1000;
  }
}
