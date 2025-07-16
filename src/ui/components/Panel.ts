class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
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

export interface PanelConfig {
  title?: string;
  closable?: boolean;
  collapsible?: boolean;
  className?: string;
  ariaLabel?: string;
  onClose?: () => void;
  onToggle?: (collapsed: boolean) => void;
}

/**
 * Reusable Panel Component
 * Provides a container with optional title, close button, and collapse functionality
 */
export class Panel extends BaseComponent {
  private config: PanelConfig;
  private content!: HTMLElement;
  private header?: HTMLElement;
  private collapsed: boolean = false;

  constructor(config: PanelConfig = {}) {
    super('div', `ui-panel ${config?.className || ''}`);
    this.config = config;
    this.setupPanel();
  }

  private setupPanel(): void {
    // Create header if title, closable, or collapsible
    if (this.config.title || this.config.closable || this.config.collapsible) {
      this.createHeader();
    }

    // Create content area
    this.content = document.createElement('div');
    this.content.className = 'ui-panel__content';
    this.element.appendChild(this.content);

    // Set up accessibility
    if (this.config.ariaLabel) {
      this.setAriaAttribute('label', this.config.ariaLabel);
    }
  }

  private createHeader(): void {
    this.header = document.createElement('div');
    this.header.className = 'ui-panel__header';

    // Add title
    if (this.config.title) {
      const title = document.createElement('h3');
      title.className = 'ui-panel__title';
      title.textContent = this.config.title;
      this.header.appendChild(title);
    }

    // Add controls container
    const controls = document.createElement('div');
    controls.className = 'ui-panel__controls';

    // Add collapse button
    if (this.config.collapsible) {
      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'ui-panel__collapse-btn';
      collapseBtn.innerHTML = '−';
      collapseBtn.setAttribute('aria-label', 'Toggle panel');
      collapseBtn?.addEventListener('click', event => {
        try {
          this.toggleCollapse.bind(this)(event);
        } catch (error) {
          console.error('Event listener error for click:', error);
        }
      });
      controls.appendChild(collapseBtn);
    }

    // Add close button
    if (this.config.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'ui-panel__close-btn';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Close panel');
      closeBtn?.addEventListener('click', event => {
        try {
          this.handleClose.bind(this)(event);
        } catch (error) {
          console.error('Event listener error for click:', error);
        }
      });
      controls.appendChild(closeBtn);
    }

    if (controls.children.length > 0) {
      this.header.appendChild(controls);
    }

    this.element.appendChild(this.header);
  }

  private toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.element.classList.toggle('ui-panel--collapsed', this.collapsed);

    if (this.header) {
      const collapseBtn = this.header?.querySelector('.ui-panel__collapse-btn');
      if (collapseBtn) {
        collapseBtn.innerHTML = this.collapsed ? '+' : '−';
      }
    }

    if (this.config.onToggle) {
      this.config.onToggle(this.collapsed);
    }
  }

  private handleClose(): void {
    if (this.config.onClose) {
      this.config.onClose();
    } else {
      this.unmount();
    }
  }

  /**
   * Add content to the panel
   */
  addContent(content: HTMLElement | string): void {
    if (typeof content === 'string') {
      this.content.innerHTML = content;
    } else {
      this.content.appendChild(content);
    }
  }

  /**
   * Clear panel content
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
   * Update panel title
   */
  setTitle(title: string): void {
    if (this.header) {
      const titleElement = this.header?.querySelector('.ui-panel__title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
    this.config.title = title;
  }

  /**
   * Check if panel is collapsed
   */
  isCollapsed(): boolean {
    return this.collapsed;
  }

  protected override setupAccessibility(): void {
    this.element.setAttribute('role', 'region');
  }
}
