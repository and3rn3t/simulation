/**
 * Global Error Handler for SonarCloud Reliability
 * Catches all unhandled errors and promise rejections
 */

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorCount = 0;
  private readonly maxErrors = 100;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  init(): void {
    if (typeof window === 'undefined') return;

    // Handle uncaught exceptions
    window.addEventListener('error', event => {
      this.handleError('Uncaught Exception', event.error || event.message);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.handleError('Unhandled Promise Rejection', event.reason);
      event.preventDefault(); // Prevent console error
    });

    // Handle resource loading errors
    window.addEventListener(
      'error',
      event => {
        if (event.target !== window) {
          this.handleError('Resource Loading Error', `Failed to load: ${event.target}`);
        }
      },
      true
    );
  }

  private handleError(type: string, error: any): void {
    this.errorCount++;

    if (this.errorCount > this.maxErrors) {
      console.warn('Maximum error count reached, stopping error logging');
      return;
    }

    console.error(`[${type}]`, error);

    // Optional: Send to monitoring service
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(
          '/api/errors',
          JSON.stringify({
            type,
            error: error?.toString?.() || error,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          })
        );
      } catch {
        // Ignore beacon errors
      }
    }
  }
}

// Initialize global error handler
if (typeof window !== 'undefined') {
  GlobalErrorHandler.getInstance().init();
}

export { GlobalErrorHandler };
