
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
 * Base UI Component Class
 * Provides common functionality for all UI components
 */
export abstract class BaseComponent {
  protected element: HTMLElement;
  protected mounted: boolean = false;

  constructor(tagName: string = 'div', className?: string) {
    this.element = document.createElement(tagName);
    if (className) { this.element.className = className;
      }
    this.setupAccessibility();
  }

  /**
   * Mount the component to a parent element
   */
  mount(parent: HTMLElement): void {
    if (this.mounted) { return;
      }

    parent.appendChild(this.element);
    this.mounted = true;
    this.onMount();
  }

  /**
   * Unmount the component from its parent
   */
  unmount(): void {
    if (!this.mounted || !this.element.parentNode) { return;
      }

    this.element.parentNode.removeChild(this.element);
    this.mounted = false;
    this.onUnmount();
  }

  /**
   * Get the root element of the component
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Set accessibility attributes
   */
  protected setupAccessibility(): void {
    // Override in subclasses for specific accessibility needs
  }

  /**
   * Add event listener with automatic cleanup
   */
  protected addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.element?.addEventListener(type, listener, options);
  }

  /**
   * Set ARIA attributes
   */
  protected setAriaAttribute(name: string, value: string): void {
    this.element.setAttribute(`aria-${name}`, value);
  }

  /**
   * Lifecycle hook called when component is mounted
   */
  protected onMount(): void {
    // Override in subclasses
  }

  /**
   * Lifecycle hook called when component is unmounted
   */
  protected onUnmount(): void {
    // Override in subclasses
  }

  /**
   * Update component state and trigger re-render if needed
   */
  protected update(): void {
    // Override in subclasses for reactive updates
  }
}
