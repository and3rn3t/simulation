/**
 * Resource Cleanup Utilities for SonarCloud Reliability
 * Prevents memory leaks and resource exhaustion
 */

export class ResourceCleanupManager {
  private static instance: ResourceCleanupManager;
  private cleanupTasks: Array<() => void> = [];
  private timers: Set<number> = new Set();
  private intervals: Set<number> = new Set();
  private eventListeners: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }> = [];
  private isInitialized = false;

  static getInstance(): ResourceCleanupManager {
    if (!ResourceCleanupManager.instance) {
      ResourceCleanupManager.instance = new ResourceCleanupManager();
    }
    return ResourceCleanupManager.instance;
  }

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    // Auto-cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Cleanup on visibility change (mobile backgrounds)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.partialCleanup();
      }
    });

    this.isInitialized = true;
  }

  // Safe timer creation with auto-cleanup
  safeSetTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.warn('Timer callback error:', error);
      } finally {
        this.timers.delete(id);
      }
    }, delay);

    this.timers.add(id);
    return id;
  }

  safeSetInterval(callback: () => void, interval: number): number {
    const id = window.setInterval(() => {
      try {
        callback();
      } catch (error) {
        console.warn('Interval callback error:', error);
      }
    }, interval);

    this.intervals.add(id);
    return id;
  }

  // Safe event listener management
  safeAddEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): () => void {
    const safeHandler: EventListener = e => {
      try {
        handler(e);
      } catch (error) {
        console.warn(`Event handler error for ${event}:`, error);
      }
    };

    element.addEventListener(event, safeHandler, options);

    const listenerRecord = { element, event, handler: safeHandler };
    this.eventListeners.push(listenerRecord);

    // Return cleanup function
    return () => {
      element.removeEventListener(event, safeHandler, options);
      const index = this.eventListeners.indexOf(listenerRecord);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  // Register custom cleanup task
  addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  // Partial cleanup for performance (background tabs)
  partialCleanup(): void {
    try {
      // Clear timers
      this.timers.forEach(id => clearTimeout(id));
      this.timers.clear();

      console.log('✅ Partial cleanup completed');
    } catch (error) {
      console.warn('Partial cleanup error:', error);
    }
  }

  // Full cleanup
  cleanup(): void {
    try {
      // Clear all timers
      this.timers.forEach(id => clearTimeout(id));
      this.timers.clear();

      // Clear all intervals
      this.intervals.forEach(id => clearInterval(id));
      this.intervals.clear();

      // Remove all event listeners
      this.eventListeners.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          console.warn('Error removing event listener:', error);
        }
      });
      this.eventListeners = [];

      // Run custom cleanup tasks
      this.cleanupTasks.forEach(task => {
        try {
          task();
        } catch (error) {
          console.warn('Custom cleanup task error:', error);
        }
      });
      this.cleanupTasks = [];

      console.log('✅ Full resource cleanup completed');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  // Get resource usage stats
  getStats(): {
    timers: number;
    intervals: number;
    eventListeners: number;
    cleanupTasks: number;
  } {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      eventListeners: this.eventListeners.length,
      cleanupTasks: this.cleanupTasks.length,
    };
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  setTimeout(() => {
    ResourceCleanupManager.getInstance().init();
  }, 0);
}

export default ResourceCleanupManager;
