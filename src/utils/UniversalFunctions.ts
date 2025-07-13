/**
 * Universal Functions
 * Replace all similar function patterns with standardized versions
 */

export const ifPattern = (condition: any, action: () => void): void => {
  if (condition) {
    action();
  }
};

export const UniversalFunctions = {
  // Universal if condition handler
  conditionalExecute: (condition: boolean, action: () => void, fallback?: () => void) => {
    try {
      if (condition) {
        action();
      } else if (fallback) {
        fallback();
      }
    } catch {
      // Silent handling
    }
  },

  // Universal event listener
  addListener: (element: Element | null, event: string, handler: () => void) => {
    try {
      if (element) {
        element.addEventListener(event, handler);
      }
    } catch {
      // Silent handling
    }
  },

  // Universal null-safe accessor
  initializeIfNeeded: <T>(instance: T | null, creator: () => T): T => {
    return instance || creator();
  },

  // Universal safe execution
  safeExecute: <T>(fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  },
};
