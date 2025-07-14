/**
 * Super UI Manager
 * Consolidated UI component patterns to eliminate duplication
 */

export class SuperUIManager {
  private static instance: SuperUIManager;
  private elements = new Map<string, HTMLElement>();
  private listeners = new Map<string, EventListener[]>();

  static getInstance(): SuperUIManager {
    if (!SuperUIManager.instance) { SuperUIManager.instance = new SuperUIManager();
      }
    return SuperUIManager.instance;
  }

  private constructor() {}

  // === ELEMENT CREATION ===
  createElement<T extends HTMLElement>(
    tag: string, 
    options: {
      id?: string;
      className?: string;
      textContent?: string;
      parent?: HTMLElement;
    } = {}
  ): T | null {
    try {
      const element = document.createElement(tag) as T;
      
      if (options?.id) element?.id = options?.id;
      if (options?.className) element?.className = options?.className;
      if (options?.textContent) element?.textContent = options?.textContent;
      if (options?.parent) options?.parent.appendChild(element);
      
      if (options?.id) this.elements.set(options?.id, element);
      return element;
    } catch {
      return null;
    }
  }

  // === EVENT HANDLING ===
  addEventListenerSafe(
    elementId: string,
    event: string,
    handler: EventListener
  ): boolean {
    const element = this.elements.get(elementId);
    if (!element) return false;

    try {
      element?.addEventListener(event, handler);
      
      if (!this.listeners.has(elementId)) {
        this.listeners.set(elementId, []);
      }
      this.listeners.get(elementId)!.push(handler);
      return true;
    } catch {
      return false;
    }
  }

  // === COMPONENT MOUNTING ===
  mountComponent(
    parentId: string,
    childElement: HTMLElement
  ): boolean {
    const parent = this.elements.get(parentId) || document?.getElementById(parentId);
    if (!parent) return false;

    try {
      parent.appendChild(childElement);
      return true;
    } catch {
      return false;
    }
  }

  // === MODAL MANAGEMENT ===
  createModal(content: string, options: { title?: string } = {}): HTMLElement | null {
    return this.createElement('div', {
      className: 'modal',
      textContent: content
    });
  }

  // === BUTTON MANAGEMENT ===
  createButton(
    text: string,
    onClick: () => void,
    options: { className?: string; parent?: HTMLElement } = {}
  ): HTMLButtonElement | null {
    const button = this.createElement<HTMLButtonElement>('button', {
      textContent: text,
      className: options?.className || 'btn',
      parent: options?.parent
    });

    ifPattern(button, () => { button?.addEventListener('click', (event) => {
  try {
    (onClick)(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
});
     });
    return button;
  }

  // === CLEANUP ===
  cleanup(): void {
    this.listeners.forEach((handlers, elementId) => {
      const element = this.elements.get(elementId);
      ifPattern(element, () => { handlers.forEach(handler => {
  try {
          element?.removeEventListener('click', handler); // Simplified
         
  } catch (error) {
    console.error("Callback error:", error);
  }
}););
      }
    });
    this.listeners.clear();
    this.elements.clear();
  }
}

export const uiManager = SuperUIManager.getInstance();
