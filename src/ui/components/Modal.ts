
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
import { BaseComponent } from './BaseComponent';

export interface ModalConfig {
  title?: string;
  closable?: boolean;
  className?: string;
  backdrop?: boolean;
  keyboard?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
  onOpen?: () => void;
}

/**
 * Modal Component
 * Provides an accessible modal dialog with backdrop and keyboard navigation
 */
export class Modal extends BaseComponent {
  private config: ModalConfig;
  private backdrop?: HTMLElement;
  private dialog!: HTMLElement;
  private content!: HTMLElement;
  private isOpen: boolean = false;
  private previousFocus?: HTMLElement;

  constructor(config: ModalConfig = {}) {
    super('div', `ui-modal ${config?.className || ''}`);
    this.config = { backdrop: true, keyboard: true, ...config };
    this.setupModal();
  }

  private setupModal(): void  { try { // Create backdrop if enabled
    if (this.config.backdrop) {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'ui-modal__backdrop';
      this.eventPattern(backdrop?.addEventListener('click', (event) => {
  try {
    (this.handleBackdropClick.bind(this)(event);
   } catch (error) { /* handled */ } }
})));
      this.element.appendChild(this.backdrop);
    }

    // Create dialog
    this.dialog = document.createElement('div');
    this.dialog.className = `ui-modal__dialog ${this.config.size ? `ui-modal__dialog--${this.config.size}` : ''}`;
    this.element.appendChild(this.dialog);

    // Create header if title or closable
    if (this.config.title || this.config.closable) { this.createHeader();
      }

    // Create content area
    this.content = document.createElement('div');
    this.content.className = 'ui-modal__content';
    this.dialog.appendChild(this.content);

    // Set up keyboard navigation
    ifPattern(this.config.keyboard, () => { eventPattern(this?.addEventListener('keydown', (event) => {
  try {
    (this.handleKeydown.bind(this)(event);
  } catch (error) {
    console.error('Event listener error for keydown:', error);
  }
})));
     });

    // Initially hidden
    this.element.style.display = 'none';
  }

  private createHeader(): void {
    const header = document.createElement('div');
    header.className = 'ui-modal__header';

    // Add title
    if (this.config.title) {
      const title = document.createElement('h2');
      title.className = 'ui-modal__title';
      title.textContent = this.config.title;
      title.id = 'modal-title';
      header.appendChild(title);
    }

    // Add close button
    if (this.config.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'ui-modal__close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close modal');
      eventPattern(closeBtn?.addEventListener('click', (event) => {
  try {
    (this.close.bind(this)(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
})));
      header.appendChild(closeBtn);
    }

    this.dialog.appendChild(header);
  }

  private handleBackdropClick(event: MouseEvent): void {
    if (event?.target === this.backdrop) { this.close();
      }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event?.key === 'Escape' && this.isOpen) { this.close();
      }

    // Trap focus within modal
    if (event?.key === 'Tab') { this.trapFocus(event);
      }
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusableElements = this.dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event?.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event?.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) { firstElement.focus();
        event?.preventDefault();
        }
    }
  }

  /**
   * Open the modal
   */
  open(): void {
    if (this.isOpen) return;

    // Store current focus
    this.previousFocus = document.activeElement as HTMLElement;

    // Show modal
    this.element.style.display = 'flex';
    this.isOpen = true;

    // Add body class to prevent scrolling
    document.body.classList.add('ui-modal-open');

    // Focus first focusable element or close button
    requestAnimationFrame(() => {
      const firstFocusable = this.dialog?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      ifPattern(firstFocusable, () => { firstFocusable.focus();
       } // TODO: Consider extracting to reduce closure scope);
    });

    // Trigger open callback
    if (this.config.onOpen) { this.config.onOpen();
      }
  }

  /**
   * Close the modal
   */
  close(): void {
    if (!this.isOpen) return;

    this.element.style.display = 'none';
    this.isOpen = false;

    // Remove body class
    document.body.classList.remove('ui-modal-open');

    // Restore previous focus
    if (this.previousFocus) { this.previousFocus.focus();
      }

    // Trigger close callback
    if (this.config.onClose) { this.config.onClose();
      }
  }

  /**
   * Add content to the modal
   */
  addContent(content: HTMLElement | string): void {
    if (typeof content === 'string') { this.content.innerHTML = content;
      } else {
      this.content.appendChild(content);
    }
  }

  /**
   * Clear modal content
   */
  clearContent(): void {
    this.content.innerHTML = '';
  }

  /**
   * Get the content container
   */
  getContent(): HTMLElement {
    return this.content;
  }

  /**
   * Check if modal is open
   */
  getIsOpen(): boolean {
    return this.isOpen;
  }

  protected override setupAccessibility(): void {
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('tabindex', '-1');

    if (this.config && this.config.title) { this.element.setAttribute('aria-labelledby', 'modal-title');
      }
  }

  protected override onUnmount(): void {
    if (this.isOpen) { this.close();
      }
  }
}
