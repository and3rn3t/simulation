
class EventListenerManager {
  private static listeners: Array<{element: EventTarget, event: string, handler: EventListener}> = [];
  
  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({element, event, handler});
  }
  
  static cleanup(): void {
    this.listeners.forEach(({element, event, handler}) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
/**
 * Universal Functions
 * Replace all similar function patterns with standardized versions
 */

export const ifPattern = (condition: any, action: () => void): void => {
  ifPattern(condition, () => { action();
   });
};

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
      ifPattern(element, () => { element?.addEventListener(event, handler);
       });
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
