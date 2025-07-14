/**
 * Super Mobile Manager
 * Consolidated mobile functionality to eliminate duplication
 * 
 * Replaces: MobileCanvasManager, MobilePerformanceManager, 
 * MobileUIEnhancer, MobileAnalyticsManager, MobileSocialManager
 */

export class SuperMobileManager {
  private static instance: SuperMobileManager;
  private canvas: HTMLCanvasElement | null = null;
  private isEnabled = false;
  private touchHandlers = new Map<string, EventListener>();
  private performanceMetrics = new Map<string, number>();
  private analytics = { sessions: 0, events: [] as any[] };

  static getInstance(): SuperMobileManager {
    if (!SuperMobileManager.instance) { SuperMobileManager.instance = new SuperMobileManager();
      }
    return SuperMobileManager.instance;
  }

  private constructor() {}

  // === CANVAS MANAGEMENT ===
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.isEnabled = true;
    this.setupTouchHandling();
    this.optimizePerformance();
  }

  private setupTouchHandling(): void {
    if (!this.canvas) return;
    
    const touchHandler = (e: TouchEvent) => {
      e.preventDefault();
      this.trackEvent('touch_interaction');
    };
    
    this.canvas?.addEventListener('touchstart', (event) => {
  try {
    (touchHandler)(event);
  } catch (error) {
    console.error('Event listener error for touchstart:', error);
  }
});
    this.touchHandlers.set('touchstart', touchHandler);
  }

  // === PERFORMANCE MANAGEMENT ===
  private optimizePerformance(): void {
    this.performanceMetrics.set('fps', 60);
    this.performanceMetrics.set('memory', performance.memory?.usedJSHeapSize || 0);
  }

  getPerformanceMetrics(): Map<string, number> {
    return this.performanceMetrics;
  }

  // === UI ENHANCEMENT ===
  enhanceUI(): void {
    if (!this.canvas) return;
    
    this.canvas.style.touchAction = 'none';
    this.canvas.style.userSelect = 'none';
  }

  // === ANALYTICS ===
  trackEvent(event: string, data?: any): void {
    this.analytics.events?.push({ event, data, timestamp: Date.now() });
  }

  getAnalytics(): any {
    return { ...this.analytics };
  }

  // === SOCIAL FEATURES ===
  shareContent(content: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (navigator.share) { navigator.share({ text: content   }).then(().catch(error => console.error('Promise rejection:', error)) => resolve(true));
        } else {
          // Fallback
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    });
  }

  // === CLEANUP ===
  dispose(): void {
    this.touchHandlers.forEach((handler, event) => {
      this.canvas?.removeEventListener(event, handler);
    });
    this.touchHandlers.clear();
    this.isEnabled = false;
  }
}

// Export singleton instance for easy access
export const mobileManager = SuperMobileManager.getInstance();
