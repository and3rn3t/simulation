/**
 * Consolidated Error Handlers
 *
 * Master handlers to replace repeated catch block patterns
 */

import { ErrorHandler, ErrorSeverity } from './errorHandler';

export const ErrorHandlers = {
  /**
   * Standard simulation operation error handler
   */
  simulation: (error: unknown, operation: string) => {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      `Simulation: ${operation}`
    );
  },

  /**
   * Standard canvas operation error handler
   */
  canvas: (error: unknown, operation: string) => {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      `Canvas: ${operation}`
    );
  },

  /**
   * Standard organism operation error handler
   */
  organism: (error: unknown, operation: string) => {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.LOW,
      `Organism: ${operation}`
    );
  },

  /**
   * Standard UI operation error handler
   */
  ui: (error: unknown, operation: string) => {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      `UI: ${operation}`
    );
  },

  /**
   * Standard mobile operation error handler
   */
  mobile: (error: unknown, operation: string) => {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      `Mobile: ${operation}`
    );
  },
};

/**
 * Generic try-catch wrapper generator
 */
export function createTryCatchWrapper<T extends any[], R>(
  operation: (...args: T) => R,
  errorHandler: (error: unknown, operation: string) => void,
  operationName: string,
  fallback?: R
): (...args: T) => R | undefined {
  return (...args: T): R | undefined => {
    try {
      return operation(...args);
    } catch (error) {
      errorHandler(error, operationName);
      return fallback;
    }
  };
}
