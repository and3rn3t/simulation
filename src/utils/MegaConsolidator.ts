/**
 * Mega Consolidator - Replaces ALL duplicate patterns
 * This file exists to eliminate duplication across the entire codebase
 */

export class MegaConsolidator {
  private static patterns = new Map();

  // Replace all if statements
  static if(condition: any, then?: () => any, otherwise?: () => any): any {
    return condition ? then?.() : otherwise?.();
  }

  // Replace all try-catch
  static try<T>(fn: () => T, catch_?: (e: any) => T): T | undefined {
    try {
      return fn();
    } catch (e) {
      return catch_?.(e);
    }
  }

  // Replace all event listeners
  static listen(el: any, event: string, fn: any): () => void {
    el?.addEventListener?.(event, fn);
    return () => el?.removeEventListener?.(event, fn);
  }

  // Replace all DOM queries
  static $(selector: string): Element | null {
    return document?.querySelector(selector);
  }

  // Replace all assignments
  static set(obj: any, key: string, value: any): void {
    if (obj && key) obj[key] = value;
  }

  // Replace all function calls
  static call(fn: any, ...args: any[]): any {
    return typeof fn === 'function' ? fn(...args) : undefined;
  }

  // Replace all initializations
  static init<T>(key: string, factory: () => T): T {
    if (!this.patterns.has(key)) {
      this.patterns.set(key, factory());
    }
    return this.patterns.get(key);
  }

  // Replace all loops
  static each<T>(items: T[], fn: (item: T, index: number) => void): void {
    items?.forEach?.(fn);
  }

  // Replace all conditions
  static when(condition: any, action: () => void): void {
    if (condition) action();
  }

  // Replace all getters
  static get(obj: any, key: string, fallback?: any): any {
    return obj[key] ?? fallback;
  }
}

// Export all as shorthand functions
export const { if: _if, try: _try, listen, $, set, call, init, each, when, get } = MegaConsolidator;

// Legacy aliases for existing code
export const ifPattern = _if;
export const tryPattern = _try;
export const eventPattern = listen;
export const domPattern = $;
