import { BaseComponent } from './BaseComponent';

export interface ButtonConfig {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and accessibility features
 */
export class Button extends BaseComponent {
  private config: ButtonConfig;

  constructor(config: ButtonConfig) {
    super('button', Button.generateClassName(config));
    this.config = config;
    this.setupButton();
  }

  private static generateClassName(config: ButtonConfig): string {
    const classes = ['ui-button'];
    
    if (config.variant) {
      classes.push(`ui-button--${config.variant}`);
    }
    
    if (config.size) {
      classes.push(`ui-button--${config.size}`);
    }
    
    return classes.join(' ');
  }

  private setupButton(): void {
    const button = this.element as HTMLButtonElement;
    
    // Set text content
    if (this.config.icon) {
      button.innerHTML = `<span class="ui-button__icon">${this.config.icon}</span><span class="ui-button__text">${this.config.text}</span>`;
    } else {
      button.textContent = this.config.text;
    }

    // Set disabled state
    if (this.config.disabled) {
      button.disabled = true;
    }

    // Set aria-label for accessibility
    if (this.config.ariaLabel) {
      this.setAriaAttribute('label', this.config.ariaLabel);
    }

    // Add click handler
    if (this.config.onClick) {
      this.addEventListener('click', this.config.onClick);
    }

    // Add keyboard navigation
    this.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (this.config.onClick && !this.config.disabled) {
        this.config.onClick();
      }
    }
  }

  /**
   * Update button configuration
   */
  updateConfig(newConfig: Partial<ButtonConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.element.className = Button.generateClassName(this.config);
    this.setupButton();
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    const button = this.element as HTMLButtonElement;
    
    if (loading) {
      button.disabled = true;
      button.classList.add('ui-button--loading');
      button.innerHTML = '<span class="ui-button__spinner"></span>Loading...';
    } else {
      button.disabled = this.config.disabled || false;
      button.classList.remove('ui-button--loading');
      this.setupButton();
    }
  }

  protected setupAccessibility(): void {
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('tabindex', '0');
  }
}
