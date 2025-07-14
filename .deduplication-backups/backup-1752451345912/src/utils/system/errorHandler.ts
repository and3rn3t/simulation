class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}

import { ifPattern } from '../UltimatePatternConsolidator';

/**
 * Error handling utilities for the organism simulation
 */

/**
 * Custom error types for the simulation
 */
export class SimulationError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'SimulationError';
    this.code = code;
  }
}

export class CanvasError extends SimulationError {
  constructor(message: string) {
    super(message, 'CANVAS_ERROR');
    this.name = 'CanvasError';
  }
}

export class OrganismError extends SimulationError {
  constructor(message: string) {
    super(message, 'ORGANISM_ERROR');
    this.name = 'OrganismError';
  }
}

export class ConfigurationError extends SimulationError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigurationError';
  }
}

export class DOMError extends SimulationError {
  constructor(message: string) {
    super(message, 'DOM_ERROR');
    this.name = 'DOMError';
  }
}

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type ErrorSeverityType = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/**
 * Error information interface
 */
export interface ErrorInfo {
  error: Error;
  severity: ErrorSeverityType;
  context?: string;
  timestamp: Date;
  userAgent?: string;
  stackTrace?: string;
}

/**
 * Global error handler for the simulation
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorInfo[] = [];
  private maxQueueSize = 50;
  private isLoggingEnabled = true;

  private constructor() {}

  /**
   * Get the singleton instance of ErrorHandler
   */
  static getInstance(): ErrorHandler {
    ifPattern(!ErrorHandler.instance, () => {
      ErrorHandler.instance = new ErrorHandler();
    });
    return ErrorHandler.instance;
  }

  /**
   * Handle an error with context and severity
   * @param error - The error to handle
   * @param severity - The severity level
   * @param context - Additional context information
   */
  handleError(
    error: Error,
    severity: ErrorSeverityType = ErrorSeverity.MEDIUM,
    context?: string
  ): void {
    const errorInfo: ErrorInfo = {
      error,
      severity,
      context: context ?? '',
      timestamp: new Date(),
      userAgent: navigator?.userAgent,
      stackTrace: error.stack,
    };

    // Add to error queue
    this.addToQueue(errorInfo);

    // Log the error
    ifPattern(this.isLoggingEnabled, () => {
      this.logError(errorInfo);
    });

    // Only show user notification for critical errors, and only if it's not during initial app startup
    ifPattern(severity === ErrorSeverity.CRITICAL && context !== 'Application startup', () => {
      this.showCriticalErrorNotification(errorInfo);
    });
  }

  /**
   * Add error to the internal queue
   * @param errorInfo - Error information to add
   */
  private addToQueue(errorInfo: ErrorInfo): void {
    this.errorQueue.push(errorInfo);

    // Keep queue size manageable
    ifPattern(this.errorQueue.length > this.maxQueueSize, () => {
      this.errorQueue.shift();
    });
  }

  /**
   * Log error to console with appropriate level
   * @param errorInfo - Error information to log
   */
  private logError(errorInfo: ErrorInfo): void {
    const _logMessage = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.error.name}: ${errorInfo.error.message}`;
    const _contextMessage = errorInfo.context ? ` (Context: ${errorInfo.context})` : '';

    switch (errorInfo.severity) {
      case ErrorSeverity.LOW:
        break;
      case ErrorSeverity.MEDIUM:
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        if (errorInfo.stackTrace) {
          // TODO: Handle stack trace display
        }
        break;
    }
  }

  /**
   * Show critical error notification to user
   * @param errorInfo - Critical error information
   */
  private showCriticalErrorNotification(errorInfo: ErrorInfo): void {
    // Try to show a user-friendly notification
    try {
      const notification = document.createElement('div');
      notification.className = 'error-notification critical';

      // Create elements safely without innerHTML
      const content = document.createElement('div');
      content.className = 'error-content';

      const title = document.createElement('h3');
      title.textContent = '⚠️ Critical Error';

      const description = document.createElement('p');
      description.textContent =
        'The simulation encountered a critical error and may not function properly.';

      const errorMessage = document.createElement('p');
      const errorLabel = document.createElement('strong');
      errorLabel.textContent = 'Error: ';
      errorMessage.appendChild(errorLabel);
      // Safely set error message to prevent XSS
      const errorText = document.createTextNode(errorInfo.error.message || 'Unknown error');
      errorMessage.appendChild(errorText);

      const actions = document.createElement('div');
      actions.className = 'error-actions';

      const dismissBtn = document.createElement('button');
      dismissBtn.textContent = 'Dismiss';
      dismissBtn.addEventListener('click', () => {
        notification.remove();
      });

      const reloadBtn = document.createElement('button');
      reloadBtn.textContent = 'Reload Page';
      reloadBtn.addEventListener('click', () => {
        window.location.reload();
      });

      actions.appendChild(dismissBtn);
      actions.appendChild(reloadBtn);

      content.appendChild(title);
      content.appendChild(description);
      content.appendChild(errorMessage);
      content.appendChild(actions);

      notification.appendChild(content);

      // Add styles
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        font-family: Arial, sans-serif;
      `;

      // Style the buttons
      const buttons = notification.querySelectorAll('button');
      buttons.forEach(button => {
        try {
          (button as HTMLButtonElement).style.cssText = `
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 12px;
          margin: 5px;
          border-radius: 4px;
          cursor: pointer;
        `;
        } catch (error) {
          console.error('Callback error:', error);
        }
      });

      document.body.appendChild(notification);

      // Auto-remove after 15 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 15000);
    } catch {
      // Fallback to alert if DOM manipulation fails
      const shouldReload = confirm(
        `Critical Error: ${errorInfo.error.message}\n\nWould you like to reload the page?`
      );
      if (shouldReload) {
        window.location.reload();
      }
    }
  }

  /**
   * Get recent errors from the queue
   * @param count - Number of recent errors to return
   */
  getRecentErrors(count = 10): ErrorInfo[] {
    return this.errorQueue.slice(-count);
  }

  /**
   * Clear the error queue
   */
  clearErrors(): void {
    this.errorQueue = [];
  }

  /**
   * Enable or disable error logging
   * @param enabled - Whether to enable logging
   */
  setLogging(enabled: boolean): void {
    this.isLoggingEnabled = enabled;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { total: number; bySeverity: Record<ErrorSeverityType, number> } {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0,
      },
    };

    this.errorQueue.forEach(errorInfo => {
      try {
        stats.bySeverity[errorInfo.severity]++;
      } catch (error) {
        console.error('Callback error:', error);
      }
    });

    return stats;
  }
}

/**
 * Utility function to safely execute a function with error handling
 * @param fn - Function to execute
 * @param context - Context for error reporting
 * @param fallback - Fallback value if function fails
 */
export function safeExecute<T>(fn: () => T, context: string, fallback?: T): T | undefined {
  try {
    return fn();
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      context
    );
    return fallback;
  }
}

/**
 * Utility function to safely execute an async function with error handling
 * @param fn - Async function to execute
 * @param context - Context for error reporting
 * @param fallback - Fallback value if function fails
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      context
    );
    return fallback;
  }
}

/**
 * Wrap a function with automatic error handling
 * @param fn - Function to wrap
 * @param context - Context for error reporting
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  context: string
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    return safeExecute(() => fn(...args), context);
  };
}

/**
 * Initialize global error handlers
 */
export function initializeGlobalErrorHandlers(): void {
  const errorHandler = ErrorHandler.getInstance();

  // Handle uncaught errors
  window.addEventListener('error', event => {
    try {
      errorHandler.handleError(
        new Error(event.message),
        ErrorSeverity.HIGH,
        `Uncaught error at ${event.filename}:${event.lineno}:${event.colno}`
      );
    } catch (error) {
      console.error('Error handler failed:', error);
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', event => {
    try {
      errorHandler.handleError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        ErrorSeverity.HIGH,
        'Promise rejection'
      );
      // Prevent the default browser behavior
      event.preventDefault();
    } catch (error) {
      console.error('Error handler failed:', error);
    }
  });
}
