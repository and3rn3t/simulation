/**
 * Global Error Handler for SonarCloud Reliability
 * Catches all unhandled errors without breaking existing code
 */

export class GlobalReliabilityManager {
  private static instance: GlobalReliabilityManager;
  private errorCount = 0;
  private readonly maxErrors = 100;
  private isInitialized = false;

  static getInstance(): GlobalReliabilityManager {
    if (!GlobalReliabilityManager.instance) {
      GlobalReliabilityManager.instance = new GlobalReliabilityManager();
    }
    return GlobalReliabilityManager.instance;
  }

  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Handle uncaught exceptions
      window.addEventListener('error', event => {
        this.logError('Uncaught Exception', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', event => {
        this.logError('Unhandled Promise Rejection', event.reason);
        // Prevent default to avoid console errors
        event.preventDefault();
      });

      // Handle resource loading errors
      document.addEventListener(
        'error',
        event => {
          if (event.target && event.target !== window) {
            const target = event.target as HTMLElement & { src?: string; href?: string };
            this.logError('Resource Loading Error', {
              element: target.tagName,
              source: target.src || target.href,
            });
          }
        },
        true
      );

      this.isInitialized = true;
      console.log('✅ Global reliability manager initialized');
    } catch (error) {
      console.error('Failed to initialize global error handling:', error);
    }
  }

  private logError(type: string, details: any): void {
    this.errorCount++;

    if (this.errorCount > this.maxErrors) {
      return; // Stop logging after limit
    }

    const errorInfo = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator?.userAgent || 'unknown',
      url: window?.location?.href || 'unknown',
    };

    console.error(`[Reliability] ${type}`, errorInfo);

    // Optional: Send to monitoring service (safe implementation)
    this.safelySendToMonitoring(errorInfo);
  }

  private safelySendToMonitoring(errorInfo: any): void {
    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const payload = JSON.stringify(errorInfo);
        // Only send if endpoint exists (won't cause errors if it doesn't)
        navigator.sendBeacon('/api/errors', payload);
      }
    } catch {
      // Silently ignore beacon errors to avoid cascading failures
    }
  }

  // Safe wrapper for potentially unsafe operations
  safeExecute<T>(operation: () => T, fallback?: T, context?: string): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.logError('Safe Execute Error', {
        context: context || 'unknown operation',
        error: error instanceof Error ? error.message : error,
      });
      return fallback;
    }
  }

  // Safe async wrapper
  async safeExecuteAsync<T>(
    operation: () => Promise<T>,
    fallback?: T,
    context?: string
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.logError('Safe Async Execute Error', {
        context: context || 'unknown async operation',
        error: error instanceof Error ? error.message : error,
      });
      return fallback;
    }
  }

  // Get reliability statistics
  getStats(): { errorCount: number; isHealthy: boolean } {
    return {
      errorCount: this.errorCount,
      isHealthy: this.errorCount < 10,
    };
  }
}

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Use a small delay to ensure DOM is ready
  setTimeout(() => {
    GlobalReliabilityManager.getInstance().init();
  }, 0);
}

export default GlobalReliabilityManager;
