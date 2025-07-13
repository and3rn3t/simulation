/**
 * Common Error Handling Utilities
 *
 * Shared patterns to reduce code duplication across the application
 */

import { ErrorHandler, ErrorSeverity, type ErrorSeverityType } from './errorHandler';

/**
 * Common error handling wrapper for canvas operations
 */
export function withCanvasErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  operationName: string,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        `Canvas operation: ${operationName}`
      );
      return fallback;
    }
  };
}

/**
 * Common error handling wrapper for simulation operations
 */
export function withSimulationErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  operationName: string,
  severity: ErrorSeverityType = ErrorSeverity.MEDIUM,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        severity,
        `Simulation: ${operationName}`
      );
      return fallback;
    }
  };
}

/**
 * Common error handling wrapper for organism operations
 */
export function withOrganismErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  operationName: string,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.LOW,
        `Organism: ${operationName}`
      );
      return fallback;
    }
  };
}

/**
 * Common error handling wrapper for mobile operations
 */
export function withMobileErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  operationName: string,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        `Mobile: ${operationName}`
      );
      return fallback;
    }
  };
}

/**
 * Common error handling wrapper for UI operations
 */
export function withUIErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  operationName: string,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        `UI: ${operationName}`
      );
      return fallback;
    }
  };
}

/**
 * Standardized async error handling wrapper
 */
export function withAsyncErrorHandling<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string,
  severity: ErrorSeverityType = ErrorSeverity.MEDIUM,
  fallback?: R
): (...args: T) => Promise<R | undefined> {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await operation(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        severity,
        `Async: ${operationName}`
      );
      return fallback;
    }
  };
}

/**
 * Common initialization error handler
 */
export function handleInitializationError(
  component: string,
  error: unknown,
  severity: ErrorSeverityType = ErrorSeverity.HIGH
): void {
  ErrorHandler.getInstance().handleError(
    error instanceof Error ? error : new Error(String(error)),
    severity,
    `${component} initialization`
  );
}

/**
 * Common validation error handler
 */
export function handleValidationError(field: string, value: unknown, expectedType: string): void {
  ErrorHandler.getInstance().handleError(
    new Error(`Invalid ${field}: expected ${expectedType}, got ${typeof value}`),
    ErrorSeverity.MEDIUM,
    `Parameter validation`
  );
}

/**
 * DOM operation error handler
 */
export function withDOMErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  elementDescription: string,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        `DOM operation: ${elementDescription}`
      );
      return fallback;
    }
  };
}

/**
 * Event handler error wrapper
 */
export function withEventErrorHandling<T extends Event>(
  handler: (event: T) => void,
  eventType: string
): (event: T) => void {
  return (event: T): void => {
    try {
      handler(event);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.LOW,
        `Event handler: ${eventType}`
      );
    }
  };
}

/**
 * Animation frame error wrapper
 */
export function withAnimationErrorHandling(
  animationFunction: (timestamp: number) => void,
  animationName: string
): (timestamp: number) => void {
  return (timestamp: number): void => {
    try {
      animationFunction(timestamp);
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        `Animation: ${animationName}`
      );
    }
  };
}

/**
 * Performance-critical operation wrapper (lighter error handling)
 */
export function withPerformanceCriticalErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  operationName: string,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      // Only log to console for performance-critical operations
      return fallback;
    }
  };
}
