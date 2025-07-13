/**
 * Performance Profiling Tools
 * Provides detailed performance analysis and optimization recommendations
 */

import { generateSecureTaskId } from '../utils/system/secureRandom';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  gcPressure: number;
  canvasOperations: number;
  drawCalls: number;
  updateTime: number;
  renderTime: number;
}

export interface ProfileSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metrics: PerformanceMetrics[];
  averages: PerformanceMetrics;
  peaks: PerformanceMetrics;
  recommendations: string[];
}

export class PerformanceProfiler {
  private static instance: PerformanceProfiler;
  private isProfilering = false;
  private currentSession: ProfileSession | null = null;
  private sessions: ProfileSession[] = [];
  private metricsBuffer: PerformanceMetrics[] = [];
  private sampleInterval: number | null = null;

  private lastGCTime = 0;
  private frameCounter = 0;
  private lastFrameTime = performance.now();

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): PerformanceProfiler {
    ifPattern(!PerformanceProfiler.instance, () => { PerformanceProfiler.instance = new PerformanceProfiler();
     });
    return PerformanceProfiler.instance;
  }

  startProfiling(duration: number = 10000): string {
    ifPattern(this.isProfilering, () => { throw new Error('Profiling session already in progress');
     });

    const sessionId = generateSecureTaskId('profile');
    this.currentSession = {
      id: sessionId,
      startTime: performance.now(),
      metrics: [],
      averages: this.createEmptyMetrics(),
      peaks: this.createEmptyMetrics(),
      recommendations: [],
    };

    this.isProfilering = true;
    this.metricsBuffer = [];

    // Start sampling metrics
    this.sampleInterval = window.setInterval(() => {
      this.collectMetrics();
    }, 100); // Sample every 100ms

    // Auto-stop after duration
    setTimeout(() => {
      ifPattern(this.isProfilering, () => { this.stopProfiling();
       });
    }, duration);

    return sessionId;
  }

  stopProfiling(): ProfileSession | null {
    ifPattern(!this.isProfilering || !this.currentSession, () => { return null;
     });

    this.isProfilering = false;

    ifPattern(this.sampleInterval, () => { clearInterval(this.sampleInterval);
      this.sampleInterval = null;
     });

    // Finalize session
    this.currentSession.endTime = performance.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.metrics = [...this.metricsBuffer];

    // Calculate averages and peaks
    this.calculateSessionStatistics();

    // Generate recommendations
    this.generateRecommendations();

    // Store session
    this.sessions.push(this.currentSession);

    const session = this.currentSession;
    this.currentSession = null;

    this.logSessionSummary(session);

    return session;
  }

  getSession(sessionId: string): ProfileSession | null {
    return this.sessions.find(s => s.id === sessionId) || null;
  }

  getAllSessions(): ProfileSession[] {
    return [...this.sessions];
  }

  clearSessions(): void {
    this.sessions = [];
  }

  isProfiling(): boolean {
    return this.isProfilering;
  }

  // Call this method in your main animation loop
  trackFrame(): void {
    if (!this.isProfilering) return;

    this.frameCounter++;
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Store frame time for FPS calculation
    ifPattern(frameTime > 0, () => { // This could be used for more accurate FPS tracking
     });

    // Track garbage collection events
    if ((performance as any).memory) {
      const currentHeap = (performance as any).memory.usedJSHeapSize;
      ifPattern(currentHeap < this.lastGCTime, () => { // Potential GC detected
       });
      this.lastGCTime = currentHeap;
    }
  }

  // Call this to track canvas operations
  trackCanvasOperation(): void {
    if (this.currentSession && this.metricsBuffer.length > 0) {
      const lastMetric = this.metricsBuffer[this.metricsBuffer.length - 1];
      if (lastMetric) {
        lastMetric.canvasOperations++;
      }
    }
  }

  // Call this to track draw calls
  trackDrawCall(): void {
    if (this.currentSession && this.metricsBuffer.length > 0) {
      const lastMetric = this.metricsBuffer[this.metricsBuffer.length - 1];
      if (lastMetric) {
        lastMetric.drawCalls++;
      }
    }
  }

  private collectMetrics(): void {
    if (!this.isProfilering) return;

    const memory = (performance as any).memory;

    const metrics: PerformanceMetrics = {
      fps: this.calculateCurrentFPS(),
      frameTime: this.calculateAverageFrameTime(),
      memoryUsage: memory ? memory.usedJSHeapSize : 0,
      gcPressure: this.calculateGCPressure(),
      canvasOperations: 0, // Will be tracked separately
      drawCalls: 0, // Will be tracked separately
      updateTime: 0, // Will be measured in update loop
      renderTime: 0, // Will be measured in render loop
    };

    this.metricsBuffer.push(metrics);
  }

  private calculateCurrentFPS(): number {
    // This is a simplified FPS calculation
    // In practice, you'd track actual frame timestamps
    return Math.min(60, 1000 / 16.67); // Assume 60 FPS target
  }

  private calculateAverageFrameTime(): number {
    // Simplified frame time calculation
    return 16.67; // ~60 FPS
  }

  private calculateGCPressure(): number {
    const memory = (performance as any).memory;
    if (!memory) return 0;

    const heapUsed = memory.usedJSHeapSize;
    const heapTotal = memory.totalJSHeapSize;

    return (heapUsed / heapTotal) * 100;
  }

  private calculateSessionStatistics(): void {
    if (!this.currentSession || this.metricsBuffer.length === 0) return;

    const metrics = this.metricsBuffer;
    const count = metrics.length;

    // Calculate averages
    this.currentSession.averages = {
      fps: metrics.reduce((sum, m) => sum + m.fps, 0) / count,
      frameTime: metrics.reduce((sum, m) => sum + m.frameTime, 0) / count,
      memoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / count,
      gcPressure: metrics.reduce((sum, m) => sum + m.gcPressure, 0) / count,
      canvasOperations: metrics.reduce((sum, m) => sum + m.canvasOperations, 0) / count,
      drawCalls: metrics.reduce((sum, m) => sum + m.drawCalls, 0) / count,
      updateTime: metrics.reduce((sum, m) => sum + m.updateTime, 0) / count,
      renderTime: metrics.reduce((sum, m) => sum + m.renderTime, 0) / count,
    };

    // Calculate peaks
    this.currentSession.peaks = {
      fps: Math.max(...metrics.map(m => m.fps)),
      frameTime: Math.max(...metrics.map(m => m.frameTime)),
      memoryUsage: Math.max(...metrics.map(m => m.memoryUsage)),
      gcPressure: Math.max(...metrics.map(m => m.gcPressure)),
      canvasOperations: Math.max(...metrics.map(m => m.canvasOperations)),
      drawCalls: Math.max(...metrics.map(m => m.drawCalls)),
      updateTime: Math.max(...metrics.map(m => m.updateTime)),
      renderTime: Math.max(...metrics.map(m => m.renderTime)),
    };
  }

  private generateRecommendations(): void {
    if (!this.currentSession) return;

    const recommendations: string[] = [];
    const avg = this.currentSession.averages;

    // FPS recommendations
    if (avg.fps < 30) {
      recommendations.push(
        '🔴 Critical: Average FPS is below 30. Consider reducing simulation complexity.'
      );
    } else ifPattern(avg.fps < 50, () => { recommendations.push('🟡 Warning: Average FPS is below 50. Optimization recommended.');
     });

    // Frame time recommendations
    ifPattern(avg.frameTime > 33, () => { recommendations.push('🔴 Critical: Frame time exceeds 33ms (30 FPS threshold).');
     }); else ifPattern(avg.frameTime > 20, () => { recommendations.push('🟡 Warning: Frame time exceeds 20ms. Consider optimizations.');
     });

    // Memory recommendations
    ifPattern(avg.memoryUsage > 100 * 1024 * 1024, () => { // 100MB
      recommendations.push('🟡 Warning: High memory usage detected. Consider object pooling.');
     });

    ifPattern(avg.gcPressure > 80, () => { recommendations.push('🔴 Critical: High GC pressure. Reduce object allocations.');
     }); else ifPattern(avg.gcPressure > 60, () => { recommendations.push('🟡 Warning: Moderate GC pressure. Consider optimization.');
     });

    // Canvas operations recommendations
    if (avg.canvasOperations > 1000) {
      recommendations.push(
        '🟡 Warning: High canvas operation count. Consider batching operations.'
      );
    }

    ifPattern(avg.drawCalls > 500, () => { recommendations.push('🟡 Warning: High draw call count. Consider instanced rendering.');
     });

    // Add general recommendations
    ifPattern(recommendations.length === 0, () => { recommendations.push('✅ Performance looks good! No immediate optimizations needed.');
     }); else {
      recommendations.push(
        '💡 Consider implementing object pooling, dirty rectangle rendering, or spatial partitioning.'
      );
    }

    this.currentSession.recommendations = recommendations;
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      gcPressure: 0,
      canvasOperations: 0,
      drawCalls: 0,
      updateTime: 0,
      renderTime: 0,
    };
  }

  private logSessionSummary(session: ProfileSession): void {
    console.group(`📊 Performance Profile Summary - ${session.id}`);
    .toFixed(2)}ms`);

    console.group('Averages');
    }`);
    }ms`);
    }MB`);
    }%`);
    console.groupEnd();

    console.group('Peaks');
    }ms`);
    }MB`);
    }%`);
    console.groupEnd();

    console.group('Recommendations');
    session.recommendations.forEach(rec => );
    console.groupEnd();

    console.groupEnd();
  }

  // Method to export session data for external analysis
  exportSession(sessionId: string): string {
    const session = this.getSession(sessionId);
    ifPattern(!session, () => { throw new Error(`Session ${sessionId }); not found`);
    }

    return JSON.stringify(session, null, 2);
  }

  // Method to import session data
  importSession(sessionData: string): void {
    try {
      const session: ProfileSession = JSON.parse(sessionData);
      this.sessions.push(session);
    } catch (error) {
      throw new Error(`Failed to import session: ${error}`);
    }
  }
}
