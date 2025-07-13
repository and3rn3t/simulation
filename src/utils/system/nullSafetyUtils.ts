/**
 * Null Safety Utilities for SonarCloud Reliability
 * Provides safe access patterns without breaking existing code
 */

export class NullSafetyUtils {
  /**
   * Safe property access with optional chaining fallback
   */
  static safeGet<T>(obj: any, path: string, fallback?: T): T | undefined {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Safe function call
   */
  static safeCall<T>(fn: Function | undefined | null, ...args: any[]): T | undefined {
    try {
      if (typeof fn === 'function') {
        return fn(...args);
      }
    } catch (error) {
      console.warn('Safe call failed:', error);
    }
    return undefined;
  }

  /**
   * Safe DOM element access
   */
  static safeDOMQuery<T extends Element>(selector: string): T | null {
    try {
      return document?.querySelector<T>(selector) || null;
    } catch {
      return null;
    }
  }

  /**
   * Safe DOM element by ID
   */
  static safeDOMById<T extends Element>(id: string): T | null {
    try {
      const element = document?.getElementById(id);
      return (element as unknown as T) || null;
    } catch {
      return null;
    }
  }

  /**
   * Safe array access
   */
  static safeArrayGet<T>(array: T[] | undefined | null, index: number): T | undefined {
    try {
      if (Array.isArray(array) && index >= 0 && index < array.length) {
        return array[index];
      }
    } catch {
      // Handle any unexpected errors
    }
    return undefined;
  }

  /**
   * Safe object property setting
   */
  static safeSet(obj: any, path: string, value: any): boolean {
    try {
      if (!obj || typeof obj !== 'object') return false;

      const keys = path.split('.');
      const lastKey = keys.pop();
      if (!lastKey) return false;

      const target = keys.reduce((current, key) => {
        if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
        }
        return current[key];
      }, obj);

      target[lastKey] = value;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safe JSON parse
   */
  static safeJSONParse<T>(json: string, fallback?: T): T | undefined {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  }

  /**
   * Safe localStorage access
   */
  static safeLocalStorageGet(key: string): string | null {
    try {
      return localStorage?.getItem(key) || null;
    } catch {
      return null;
    }
  }

  static safeLocalStorageSet(key: string, value: string): boolean {
    try {
      localStorage?.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}

export default NullSafetyUtils;
