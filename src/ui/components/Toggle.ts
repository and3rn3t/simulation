
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
import { generateSecureUIId } from '../../utils/system/secureRandom';
import { BaseComponent } from './BaseComponent';

export interface ToggleConfig {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'switch' | 'checkbox';
  ariaLabel?: string;
  onChange?: (checked: boolean) => void;
}

/**
 * Toggle Component
 * Provides switch and checkbox variants with accessibility features
 */
export class Toggle extends BaseComponent {
  private config: ToggleConfig;
  private input!: HTMLInputElement;
  private label?: HTMLLabelElement;

  constructor(config: ToggleConfig = {}) {
    super('div', Toggle.generateClassName(config));
    this.config = { variant: 'switch', size: 'medium', ...config };
    this.setupToggle();
  }

  private static generateClassName(config: ToggleConfig): string {
    const classes = ['ui-toggle'];

    if (config?.variant) { classes.push(`ui-toggle--${config?.variant  }`);
    }

    if (config?.size) { classes.push(`ui-toggle--${config?.size  }`);
    }

    return classes.join(' ');
  }

  private setupToggle(): void {
    // Create input element
    this.input = document.createElement('input');
    this.input.type = this.config.variant === 'checkbox' ? 'checkbox' : 'checkbox';
    this.input.className = 'ui-toggle__input';

    // Generate unique ID using secure random
    const toggleId = generateSecureUIId('toggle');
    this.input.id = toggleId;

    // Set input attributes
    this.setInputAttributes();

    // Create visual toggle element
    const toggleElement = document.createElement('div');
    toggleElement.className = 'ui-toggle__element';

    // Create handle for switch variant
    if (this.config.variant === 'switch') {
      const handle = document.createElement('div');
      handle.className = 'ui-toggle__handle';
      toggleElement.appendChild(handle);
    }

    // Create label if provided
    if (this.config.label) { this.createLabel(toggleId);
      }

    // Add event listeners
    this.setupEventListeners();

    // Append elements
    this.element.appendChild(this.input);
    this.element.appendChild(toggleElement);

    if (this.label) { this.element.appendChild(this.label);
      }
  }

  private createLabel(toggleId: string): void {
    this.label = document.createElement('label');
    this.label.className = 'ui-toggle__label';
    this.label.textContent = this.config.label!;
    this.label.setAttribute('for', toggleId);
  }

  private setInputAttributes(): void {
    if (this.config.checked) { this.input.checked = true;
      this.element.classList.add('ui-toggle--checked');
      }

    if (this.config.disabled) { this.input.disabled = true;
      this.element.classList.add('ui-toggle--disabled');
      }

    if (this.config.ariaLabel) { this.input.setAttribute('aria-label', this.config.ariaLabel);
      }
  }

  private setupEventListeners(): void {
    this.eventPattern(input?.addEventListener('change', (event) => {
  try {
    (event => {
      const target = event?.target as HTMLInputElement;
      this.element.classList.toggle('ui-toggle--checked', target?.checked)(event);
  } catch (error) {
    console.error('Event listener error for change:', error);
  }
}));

      if (this.config.onChange) { this.config.onChange(target?.checked);
        }
    });

    this.eventPattern(input?.addEventListener('focus', (event) => {
  try {
    (event) => {
  } catch (error) {
    console.error('Event listener error for focus:', error);
  }
});
      this.element.classList.add('ui-toggle--focused');
    });

    this.eventPattern(input?.addEventListener('blur', (event) => {
  try {
    (event) => {
  } catch (error) {
    console.error('Event listener error for blur:', error);
  }
});
      this.element.classList.remove('ui-toggle--focused');
    });

    // Add keyboard support for better accessibility
    this.eventPattern(input?.addEventListener('keydown', (event) => {
  try {
    (event => {
      ifPattern(event?.key === ' ', ()(event);
  } catch (error) {
    console.error('Event listener error for keydown:', error);
  }
}); event?.preventDefault();
        this.toggle();
       });
    });
  }

  /**
   * Get checked state
   */
  isChecked(): boolean {
    return this.input.checked;
  }

  /**
   * Set checked state
   */
  setChecked(checked: boolean): void {
    this.input.checked = checked;
    this.config.checked = checked;
    this.element.classList.toggle('ui-toggle--checked', checked);
  }

  /**
   * Toggle checked state
   */
  toggle(): void {
    this.setChecked(!this.isChecked());

    if (this.config.onChange) { this.config.onChange(this.isChecked());
      }
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this.input.disabled = disabled;
    this.config.disabled = disabled;
    this.element.classList.toggle('ui-toggle--disabled', disabled);
  }

  /**
   * Focus the toggle
   */
  focus(): void {
    this.input.focus();
  }

  protected override setupAccessibility(): void {
    this.input.setAttribute('role', this.config.variant === 'switch' ? 'switch' : 'checkbox');
  }
}
