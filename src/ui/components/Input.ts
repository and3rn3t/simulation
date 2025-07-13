import { generateSecureUIId } from '../../utils/system/secureRandom';
import { BaseComponent } from './BaseComponent';

export interface InputConfig {
  type?: 'text' | 'number' | 'email' | 'password' | 'search' | 'url' | 'tel';
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  ariaLabel?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

/**
 * Input Component
 * Provides a styled and accessible form input with validation states
 */
export class Input extends BaseComponent {
  private config: InputConfig;
  private input!: HTMLInputElement;
  private label?: HTMLLabelElement;
  private helperElement?: HTMLElement;
  private hasError: boolean = false;

  constructor(config: InputConfig = {}) {
    super('div', 'ui-input');
    this.config = { type: 'text', ...config };
    this.setupInput();
  }

  private setupInput(): void {
    // Create label if provided
    if (this.config.label) {
      this.createLabel();
    }

    // Create input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'ui-input__wrapper';

    // Create input element
    this.input = document.createElement('input');
    this.input.className = 'ui-input__field';
    this.input.type = this.config.type || 'text';

    // Set input attributes
    this.setInputAttributes();

    // Add event listeners
    this.setupEventListeners();

    inputWrapper.appendChild(this.input);
    this.element.appendChild(inputWrapper);

    // Create helper text if provided
    if (this.config.helperText || this.config.errorText) {
      this.createHelperText();
    }
  }

  private createLabel(): void {
    this.label = document.createElement('label');
    this.label.className = 'ui-input__label';
    this.label.textContent = this.config.label!;

    // Generate unique ID for input using secure random
    const inputId = generateSecureUIId('input');
    this.input.id = inputId;
    this.label.setAttribute('for', inputId);

    // Mark as required
    if (this.config.required) {
      this.label.innerHTML += ' <span class="ui-input__required">*</span>';
    }

    this.element.appendChild(this.label);
  }

  private createHelperText(): void {
    this.helperElement = document.createElement('div');
    this.helperElement.className = 'ui-input__helper';

    const helperId = generateSecureUIId('helper');
    this.helperElement.id = helperId;
    this.input.setAttribute('aria-describedby', helperId);

    this.updateHelperText();
    this.element.appendChild(this.helperElement);
  }

  private updateHelperText(): void {
    if (!this.helperElement) return;

    if (this.hasError && this.config.errorText) {
      this.helperElement.textContent = this.config.errorText;
      this.helperElement.className = 'ui-input__helper ui-input__helper--error';
    } else if (this.config.helperText) {
      this.helperElement.textContent = this.config.helperText;
      this.helperElement.className = 'ui-input__helper';
    }
  }

  private setInputAttributes(): void {
    if (this.config.placeholder) {
      this.input.placeholder = this.config.placeholder;
    }

    if (this.config.value !== undefined) {
      this.input.value = this.config.value;
    }

    if (this.config.disabled) {
      this.input.disabled = true;
    }

    if (this.config.required) {
      this.input.required = true;
    }

    if (this.config.min !== undefined) {
      this.input.min = this.config.min.toString();
    }

    if (this.config.max !== undefined) {
      this.input.max = this.config.max.toString();
    }

    if (this.config.step !== undefined) {
      this.input.step = this.config.step.toString();
    }

    if (this.config.pattern) {
      this.input.pattern = this.config.pattern;
    }

    if (this.config.ariaLabel) {
      this.input.setAttribute('aria-label', this.config.ariaLabel);
    }
  }

  private setupEventListeners(): void {
    this.input.addEventListener('input', event => {
      const target = event.target as HTMLInputElement;
      if (this.config.onChange) {
        this.config.onChange(target.value);
      }
    });

    this.input.addEventListener('focus', () => {
      this.element.classList.add('ui-input--focused');
      if (this.config.onFocus) {
        this.config.onFocus();
      }
    });

    this.input.addEventListener('blur', () => {
      this.element.classList.remove('ui-input--focused');
      this.validateInput();
      if (this.config.onBlur) {
        this.config.onBlur();
      }
    });
  }

  private validateInput(): void {
    const isValid = this.input.checkValidity();
    this.setError(!isValid);
  }

  /**
   * Get input value
   */
  getValue(): string {
    return this.input.value;
  }

  /**
   * Set input value
   */
  setValue(value: string): void {
    this.input.value = value;
    this.config.value = value;
  }

  /**
   * Set error state
   */
  setError(hasError: boolean, errorText?: string): void {
    this.hasError = hasError;

    if (errorText) {
      this.config.errorText = errorText;
    }

    this.element.classList.toggle('ui-input--error', hasError);
    this.updateHelperText();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.setError(false);
  }

  /**
   * Focus the input
   */
  focus(): void {
    this.input.focus();
  }

  /**
   * Check if input is valid
   */
  isValid(): boolean {
    return this.input.checkValidity();
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled: boolean): void {
    this.input.disabled = disabled;
    this.config.disabled = disabled;
    this.element.classList.toggle('ui-input--disabled', disabled);
  }

  protected override setupAccessibility(): void {
    // Accessibility is handled through proper labeling and ARIA attributes
    // in the setupInput method
  }
}
