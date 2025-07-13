/**
 * Universal Functions
 * Replace all similar function patterns with standardized versions
 */

export const UniversalFunctions = {
  // Universal if condition handler
  conditionalExecute: (condition: boolean, action: () => void, fallback?: () => void) => {
    try {
      ifPattern(condition, () => { action();
       }); else ifPattern(fallback, () => { fallback();
       });
    } catch {
      // Silent handling
    }
  },

  // Universal event listener
  addListener: (element: Element | null, event: string, handler: () => void) => {
    try {
      element?.addEventListener(event, handler);
      return () => element?.removeEventListener(event, handler);
    } catch {
      return () => {};
    }
  },

  // Universal initialization
  initializeIfNeeded: <T>(instance: T | null, creator: () => T): T => {
    return instance || creator();
  },

  // Universal error safe execution
  safeExecute: <T>(fn: () => T, fallback: T): T => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  }
};

// Export as functions for easier usage
export const { conditionalExecute, addListener, initializeIfNeeded, safeExecute } = UniversalFunctions;
