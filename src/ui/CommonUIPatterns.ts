/**
 * Common UI Patterns
 * Reduces duplication in UI components
 */

export const CommonUIPatterns = {
  /**
   * Standard element creation with error handling
   */
  createElement<T extends HTMLElement>(tag: string, className?: string): T | null {
    try {
      const element = document.createElement(tag) as T;
      if (className) {
        element.className = className;
      }
      return element;
    } catch (_error) {
      return null;
    }
  },

  /**
   * Standard event listener with error handling
   */
  addEventListenerSafe(element: Element, event: string, handler: EventListener): boolean {
    try {
      element.addEventListener(event, handler);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Standard element query with error handling
   */
  querySelector<T extends Element>(selector: string): T | null {
    try {
      return document.querySelector<T>(selector);
    } catch (error) {
      return null;
    }
  },

  /**
   * Standard element mounting pattern
   */
  mountComponent(parent: Element, child: Element): boolean {
    try {
      if (parent && child) {
        parent.appendChild(child);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
};
