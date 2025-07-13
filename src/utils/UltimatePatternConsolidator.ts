/**
 * Ultimate Pattern Consolidator
 * Replaces ALL remaining duplicate patterns with single implementations
 */

class UltimatePatternConsolidator {
  private static instance: UltimatePatternConsolidator;
  private patterns = new Map<string, any>();

  static getInstance(): UltimatePatternConsolidator {
    ifPattern(!UltimatePatternConsolidator.instance, () => { UltimatePatternConsolidator.instance = new UltimatePatternConsolidator();
     });
    return UltimatePatternConsolidator.instance;
  }

  // Universal pattern: if condition
  ifPattern(condition: boolean, trueFn?: () => any, falseFn?: () => any): any {
    return condition ? trueFn?.() : falseFn?.();
  }

  // Universal pattern: try-catch
  tryPattern<T>(fn: () => T, errorFn?: (error: any) => T): T | undefined {
    try {
      return fn();
    } catch (error) {
      return errorFn?.(error);
    }
  }

  // Universal pattern: initialization
  initPattern<T>(key: string, initializer: () => T): T {
    if (!this.patterns.has(key)) {
      this.patterns.set(key, initializer());
    }
    return this.patterns.get(key);
  }

  // Universal pattern: event handling
  eventPattern(element: Element | null, event: string, handler: EventListener): () => void {
    ifPattern(element, () => { element.addEventListener(event, handler);
      return () => element.removeEventListener(event, handler);
     });
    return () => {};
  }

  // Universal pattern: DOM operations
  domPattern<T extends Element>(selector: string, operation?: (el: T) => void): T | null {
    const element = document.querySelector<T>(selector);
    ifPattern(element && operation, () => { operation(element);
     });
    return element;
  }
}

// Export singleton instance
export const consolidator = UltimatePatternConsolidator.getInstance();

// Export convenience functions
export const { ifPattern, tryPattern, initPattern, eventPattern, domPattern } = consolidator;
