import { isMobileDevice } from './MobileDetection';

export interface AnalyticsConfig {
  trackingId?: string;
  enableDebugMode?: boolean;
  sampleRate?: number;
  sessionTimeout?: number;
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  deviceInfo: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    isMobile: boolean;
    touchSupport: boolean;
  };
}

/**
 * Mobile Analytics Manager - Simplified implementation for mobile analytics tracking
 */
export class MobileAnalyticsManager {
  private config: AnalyticsConfig;
  private sessionData: SessionData;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled: boolean = false;
  private touchStartTime: number = 0;
  private interactionCount: number = 0;

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      enableDebugMode: false,
      sampleRate: 1.0,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      ...config,
    };

    this.isEnabled = isMobileDevice() && this.shouldTrack();

    if (this.isEnabled) {
      this.initSession();
      this.setupEventListeners();
    }
  }

  /**
   * Initialize analytics session
   */
  private initSession(): void {
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        isMobile: isMobileDevice(),
        touchSupport: 'ontouchstart' in window,
      },
    };

    this.trackEvent({
      name: 'session_start',
      category: 'session',
      action: 'start',
      customData: {
        deviceInfo: this.sessionData.deviceInfo,
      },
    });
  }

  /**
   * Setup event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    // Track touch interactions
    document.addEventListener('touchstart', event => {
      this.touchStartTime = Date.now();
      this.updateActivity();
      this.trackTouch('touchstart', event);
    });

    document.addEventListener('touchend', event => {
      const duration = Date.now() - this.touchStartTime;
      this.trackTouch('touchend', event, { duration });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent({
          name: 'page_hidden',
          category: 'engagement',
          action: 'hide',
        });
      } else {
        this.trackEvent({
          name: 'page_visible',
          category: 'engagement',
          action: 'show',
        });
        this.updateActivity();
      }
    });

    // Track orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.trackEvent({
          name: 'orientation_change',
          category: 'device',
          action: 'orientation_change',
          customData: {
            orientation: screen.orientation?.angle || window.orientation,
          },
        });
      }, 100);
    });
  }

  /**
   * Track touch interactions
   */
  private trackTouch(type: string, event: TouchEvent, extra: any = {}): void {
    this.interactionCount++;

    this.trackEvent({
      name: 'touch_interaction',
      category: 'interaction',
      action: type,
      customData: {
        touchCount: event.touches.length,
        interactionSequence: this.interactionCount,
        ...extra,
      },
    });
  }

  /**
   * Track a custom event
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      customData: {
        ...event.customData,
        sessionDuration: this.getSessionDuration(),
      },
    };

    this.eventQueue.push(enrichedEvent);
    this.updateActivity();

    if (this.config.enableDebugMode) {
      console.log('Analytics Event:', enrichedEvent);
    }

    // Process events in batches or immediately for critical events
    if (this.eventQueue.length >= 10 || event.category === 'error') {
      this.flushEvents();
    }
  }

  /**
   * Track simulation-specific events
   */
  public trackSimulationEvent(action: string, data: Record<string, any> = {}): void {
    this.trackEvent({
      name: 'simulation_action',
      category: 'simulation',
      action,
      customData: data,
    });
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.trackEvent({
      name: 'performance_metric',
      category: 'performance',
      action: metric,
      value,
      customData: { unit },
    });
  }

  /**
   * Track user engagement
   */
  public trackEngagement(action: string, duration?: number): void {
    this.trackEvent({
      name: 'user_engagement',
      category: 'engagement',
      action,
      value: duration,
      customData: {
        sessionDuration: this.getSessionDuration(),
        interactionCount: this.interactionCount,
      },
    });
  }

  /**
   * Track errors
   */
  public trackError(error: Error, context: string = 'unknown'): void {
    this.trackEvent({
      name: 'error_occurred',
      category: 'error',
      action: 'javascript_error',
      label: error.message,
      customData: {
        errorStack: error.stack,
        context,
        url: window.location.href,
      },
    });
  }

  /**
   * Update last activity timestamp
   */
  private updateActivity(): void {
    this.sessionData.lastActivity = Date.now();
  }

  /**
   * Get current session duration
   */
  private getSessionDuration(): number {
    return Date.now() - this.sessionData.startTime;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if tracking should be enabled based on sampling
   */
  private shouldTrack(): boolean {
    return Math.random() < (this.config.sampleRate || 1.0);
  }

  /**
   * Flush queued events (in a real implementation, this would send to analytics service)
   */
  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;

    if (this.config.enableDebugMode) {
      console.log('Flushing analytics events:', this.eventQueue);
    }

    // In a real implementation, you would send these to your analytics service
    // For now, we'll just store them locally or log them
    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    // Store in localStorage for debugging/development
    try {
      const existingEvents = JSON.parse(localStorage.getItem('mobile_analytics') || '[]');
      const updatedEvents = [...existingEvents, ...eventsToFlush].slice(-100); // Keep last 100 events
      localStorage.setItem('mobile_analytics', JSON.stringify(updatedEvents));
    } catch (error) {
      console.warn('Failed to store analytics events:', error);
    }
  }

  /**
   * Get session information
   */
  public getSessionInfo(): SessionData {
    return { ...this.sessionData };
  }

  /**
   * Get analytics statistics
   */
  public getStats(): {
    sessionDuration: number;
    eventCount: number;
    interactionCount: number;
    isEnabled: boolean;
  } {
    return {
      sessionDuration: this.getSessionDuration(),
      eventCount: this.eventQueue.length,
      interactionCount: this.interactionCount,
      isEnabled: this.isEnabled,
    };
  }

  /**
   * Check if analytics is enabled
   */
  public isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Enable or disable analytics
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (enabled) {
      this.trackEvent({
        name: 'analytics_enabled',
        category: 'system',
        action: 'enable',
      });
    } else {
      this.flushEvents(); // Flush remaining events before disabling
    }
  }

  /**
   * Cleanup and dispose of resources
   */
  public dispose(): void {
    this.flushEvents();

    this.trackEvent({
      name: 'session_end',
      category: 'session',
      action: 'end',
      customData: {
        sessionDuration: this.getSessionDuration(),
        totalInteractions: this.interactionCount,
      },
    });

    this.flushEvents();
    this.isEnabled = false;
  }
}
