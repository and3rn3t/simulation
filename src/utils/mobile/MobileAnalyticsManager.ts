/**
 * Mobile Analytics Manager - Advanced analytics and performance monitoring for mobile
 */

import { generateSecureSessionId, getSecureAnalyticsSample } from '../system/secureRandom';

export interface MobileAnalyticsConfig {
  enablePerformanceMonitoring: boolean;
  enableUserBehaviorTracking: boolean;
  enableErrorTracking: boolean;
  enableHeatmaps: boolean;
  sampleRate: number; // 0.0 to 1.0
  batchSize: number;
  flushInterval: number; // milliseconds
}

export interface TouchEvent extends Event {
  touches: TouchList;
  targetTouches: TouchList;
  changedTouches: TouchList;
}

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data: any;
  sessionId: string;
  userId?: string;
}

export class MobileAnalyticsManager {
  private config: MobileAnalyticsConfig;
  private sessionId: string;
  private userId?: string;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();
  private touchHeatmap: { x: number; y: number; timestamp: number }[] = [];
  private flushTimer?: number;
  private startTime: number = Date.now();

  constructor(config: Partial<MobileAnalyticsConfig> = {}) {
    this.config = {
      enablePerformanceMonitoring: true,
      enableUserBehaviorTracking: true,
      enableErrorTracking: true,
      enableHeatmaps: true,
      sampleRate: 0.1, // 10% sampling by default
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.initializeAnalytics();
  }

  /**
   * Initialize analytics tracking
   */
  private initializeAnalytics(): void {
    if (getSecureAnalyticsSample() > this.config.sampleRate) {
      return;
    }

    this.trackSessionStart();
    this.setupPerformanceMonitoring();
    this.setupUserBehaviorTracking();
    this.setupErrorTracking();
    this.setupHeatmapTracking();
    this.startFlushTimer();
  }

  /**
   * Generate unique session ID using cryptographically secure random values
   */
  private generateSessionId(): string {
    // Use secure random utility for cryptographically secure session ID generation
    return generateSecureSessionId('mobile');
  }

  /**
   * Track session start
   */
  private trackSessionStart(): void {
    const deviceInfo = this.getDeviceInfo();
    this.trackEvent('session_start', {
      device: deviceInfo,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
      },
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    // Monitor FPS
    this.monitorFPS();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor touch responsiveness
    this.monitorTouchResponsiveness();

    // Monitor page load performance
    this.monitorPageLoadPerformance();
  }

  /**
   * Monitor FPS
   */
  private monitorFPS(): void {
    let lastTime = performance.now();
    let frameCount = 0;
    const fpsHistory: number[] = [];

    const measureFPS = (currentTime: number) => {
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        // Every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        fpsHistory.push(fps);

        this.recordMetric('fps', fps);

        // Keep only last 60 seconds of data
        if (fpsHistory.length > 60) {
          fpsHistory.shift();
        }

        // Alert on poor performance
        if (fps < 20) {
          this.trackEvent('performance_warning', {
            type: 'low_fps',
            fps,
            timestamp: currentTime,
          });
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor memory usage
   */
  private monitorMemoryUsage(): void {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };

        this.recordMetric('memory_used', memoryUsage.used);
        this.recordMetric('memory_total', memoryUsage.total);

        // Warning if memory usage is high
        const usagePercentage = (memoryUsage.used / memoryUsage.limit) * 100;
        if (usagePercentage > 80) {
          this.trackEvent('performance_warning', {
            type: 'high_memory_usage',
            usage: memoryUsage,
            percentage: usagePercentage,
          });
        }
      }
    };

    setInterval(checkMemory, 10000); // Every 10 seconds
  }

  /**
   * Monitor touch responsiveness
   */
  private monitorTouchResponsiveness(): void {
    let touchStartTime: number;

    document.addEventListener(
      'touchstart',
      () => {
        touchStartTime = performance.now();
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      () => {
        if (touchStartTime) {
          const responseTime = performance.now() - touchStartTime;
          this.recordMetric('touch_response_time', responseTime);

          if (responseTime > 100) {
            // > 100ms is slow
            this.trackEvent('performance_warning', {
              type: 'slow_touch_response',
              responseTime,
            });
          }
        }
      },
      { passive: true }
    );
  }

  /**
   * Monitor page load performance
   */
  private monitorPageLoadPerformance(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;

        this.trackEvent('page_load_performance', {
          domContentLoaded:
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart,
          dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcpConnect: navigation.connectEnd - navigation.connectStart,
          serverResponse: navigation.responseEnd - navigation.requestStart,
        });
      }, 1000);
    });
  }

  /**
   * Setup user behavior tracking
   */
  private setupUserBehaviorTracking(): void {
    if (!this.config.enableUserBehaviorTracking) return;

    this.trackTouchInteractions();
    this.trackScrollBehavior();
    this.trackOrientationChanges();
    this.trackAppVisibility();
  }

  /**
   * Track touch interactions
   */
  private trackTouchInteractions(): void {
    let touchSession = {
      startTime: 0,
      touches: 0,
      gestures: [] as string[],
    };

    document.addEventListener(
      'touchstart',
      event => {
        const e = event as unknown as TouchEvent;
        if (touchSession.startTime === 0) {
          touchSession.startTime = Date.now();
        }
        touchSession.touches++;

        // Detect gesture types
        if (e.touches.length === 1) {
          touchSession.gestures.push('tap');
        } else if (e.touches.length === 2) {
          touchSession.gestures.push('pinch');
        } else if (e.touches.length >= 3) {
          touchSession.gestures.push('multi_touch');
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      () => {
        // Track session after inactivity
        setTimeout(() => {
          if (touchSession.touches > 0) {
            this.trackEvent('touch_session', {
              duration: Date.now() - touchSession.startTime,
              touches: touchSession.touches,
              gestures: [...new Set(touchSession.gestures)], // Unique gestures
            });

            touchSession = { startTime: 0, touches: 0, gestures: [] };
          }
        }, 1000);
      },
      { passive: true }
    );
  }

  /**
   * Track scroll behavior
   */
  private trackScrollBehavior(): void {
    let scrollData = {
      startTime: 0,
      distance: 0,
      direction: 'none' as 'up' | 'down' | 'none',
      lastY: 0,
    };

    document.addEventListener(
      'scroll',
      () => {
        const currentY = window.scrollY;

        if (scrollData.startTime === 0) {
          scrollData.startTime = Date.now();
          scrollData.lastY = currentY;
          return;
        }

        const deltaY = currentY - scrollData.lastY;
        scrollData.distance += Math.abs(deltaY);
        scrollData.direction = deltaY > 0 ? 'down' : 'up';
        scrollData.lastY = currentY;
      },
      { passive: true }
    );

    // Track scroll session end
    let scrollTimeout: number;
    document.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(() => {
          if (scrollData.startTime > 0) {
            this.trackEvent('scroll_session', {
              duration: Date.now() - scrollData.startTime,
              distance: scrollData.distance,
              direction: scrollData.direction,
            });

            scrollData = { startTime: 0, distance: 0, direction: 'none', lastY: 0 };
          }
        }, 150);
      },
      { passive: true }
    );
  }

  /**
   * Track orientation changes
   */
  private trackOrientationChanges(): void {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.trackEvent('orientation_change', {
          orientation: screen.orientation?.angle || window.orientation,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        });
      }, 500); // Wait for orientation to settle
    });
  }

  /**
   * Track app visibility
   */
  private trackAppVisibility(): void {
    let visibilityStart = Date.now();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('app_background', {
          duration: Date.now() - visibilityStart,
        });
      } else {
        visibilityStart = Date.now();
        this.trackEvent('app_foreground', {});
      }
    });
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;

    window.addEventListener('error', event => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', event => {
      this.trackEvent('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      });
    });
  }

  /**
   * Setup heatmap tracking
   */
  private setupHeatmapTracking(): void {
    if (!this.config.enableHeatmaps) return;

    document.addEventListener(
      'touchstart',
      event => {
        const e = event as unknown as TouchEvent;
        for (let i = 0; i < e.touches.length; i++) {
          const touch = e.touches[i];
          this.touchHeatmap.push({
            x: touch.clientX,
            y: touch.clientY,
            timestamp: Date.now(),
          });
        }

        // Keep only recent touches (last 1000)
        if (this.touchHeatmap.length > 1000) {
          this.touchHeatmap = this.touchHeatmap.slice(-1000);
        }
      },
      { passive: true }
    );
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = window.setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  /**
   * Track custom event
   */
  public trackEvent(type: string, data: any): void {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Record performance metric
   */
  private recordMetric(name: string, value: number): void {
    if (!this.performanceMetrics.has(name)) {
      this.performanceMetrics.set(name, []);
    }

    const metrics = this.performanceMetrics.get(name)!;
    metrics.push(value);

    // Keep only last 100 values
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      memory: (navigator as any).deviceMemory,
      cores: navigator.hardwareConcurrency,
      connection: (navigator as any).connection?.effectiveType,
      pixelRatio: window.devicePixelRatio,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
    };
  }

  /**
   * Flush events to server
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Add performance summary
      const performanceSummary = this.getPerformanceSummary();
      events.push({
        type: 'performance_summary',
        timestamp: Date.now(),
        data: performanceSummary,
        sessionId: this.sessionId,
        userId: this.userId,
      });

      // Add heatmap data
      if (this.touchHeatmap.length > 0) {
        events.push({
          type: 'touch_heatmap',
          timestamp: Date.now(),
          data: { touches: [...this.touchHeatmap] },
          sessionId: this.sessionId,
          userId: this.userId,
        });
        this.touchHeatmap = []; // Clear after sending
      }

      await this.sendEvents(events);
    } catch { /* handled */ }
  }

  /**
   * Get performance summary
   */
  private getPerformanceSummary(): any {
    const summary: any = {};

    for (const [name, values] of this.performanceMetrics) {
      if (values.length > 0) {
        summary[name] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    }

    return summary;
  }

  /**
   * Send events to analytics server
   */
  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would send to your analytics service
    // Store in localStorage for offline mode
    const storedEvents = localStorage.getItem('offline_analytics') || '[]';
    let parsedEvents: any[] = [];

    try {
      parsedEvents = JSON.parse(storedEvents);
      // Validate that it's actually an array
      if (!Array.isArray(parsedEvents)) {
        parsedEvents = [];
      }
    } catch (error) {
      parsedEvents = [];
    }

    const allEvents = [...parsedEvents, ...events];
    localStorage.setItem('offline_analytics', JSON.stringify(allEvents));
  }

  /**
   * Set user ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get session analytics
   */
  public getSessionAnalytics(): any {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.startTime,
      events: this.eventQueue.length,
      performance: this.getPerformanceSummary(),
      touchPoints: this.touchHeatmap.length,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MobileAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents(); // Flush remaining events
  }
}
