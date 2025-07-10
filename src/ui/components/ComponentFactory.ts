import { BaseComponent } from './BaseComponent';
import { Button } from './Button';
import { Panel } from './Panel';
import { Modal } from './Modal';
import { Input } from './Input';
import { Toggle } from './Toggle';
import type { ButtonConfig } from './Button';
import type { PanelConfig } from './Panel';
import type { ModalConfig } from './Modal';
import type { InputConfig } from './Input';
import type { ToggleConfig } from './Toggle';

/**
 * UI Component Factory
 * Provides a centralized way to create and manage UI components
 */
export class ComponentFactory {
  private static components: Map<string, BaseComponent> = new Map();

  /**
   * Create a button component
   */
  static createButton(config: ButtonConfig, id?: string): Button {
    const button = new Button(config);
    if (id) {
      this.components.set(id, button);
    }
    return button;
  }

  /**
   * Create a panel component
   */
  static createPanel(config: PanelConfig = {}, id?: string): Panel {
    const panel = new Panel(config);
    if (id) {
      this.components.set(id, panel);
    }
    return panel;
  }

  /**
   * Create a modal component
   */
  static createModal(config: ModalConfig = {}, id?: string): Modal {
    const modal = new Modal(config);
    if (id) {
      this.components.set(id, modal);
    }
    return modal;
  }

  /**
   * Create an input component
   */
  static createInput(config: InputConfig = {}, id?: string): Input {
    const input = new Input(config);
    if (id) {
      this.components.set(id, input);
    }
    return input;
  }

  /**
   * Create a toggle component
   */
  static createToggle(config: ToggleConfig = {}, id?: string): Toggle {
    const toggle = new Toggle(config);
    if (id) {
      this.components.set(id, toggle);
    }
    return toggle;
  }

  /**
   * Get a component by ID
   */
  static getComponent<T extends BaseComponent>(id: string): T | undefined {
    return this.components.get(id) as T;
  }

  /**
   * Remove a component by ID
   */
  static removeComponent(id: string): boolean {
    const component = this.components.get(id);
    if (component) {
      component.unmount();
      this.components.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Remove all components
   */
  static removeAllComponents(): void {
    this.components.forEach(component => component.unmount());
    this.components.clear();
  }

  /**
   * Get all component IDs
   */
  static getComponentIds(): string[] {
    return Array.from(this.components.keys());
  }
}

/**
 * Theme Manager
 * Manages component themes and design system variables
 */
export class ThemeManager {
  private static currentTheme: 'light' | 'dark' = 'dark';

  /**
   * Set the application theme
   */
  static setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update CSS custom properties based on theme
    if (theme === 'light') {
      this.applyLightTheme();
    } else {
      this.applyDarkTheme();
    }
  }

  /**
   * Get current theme
   */
  static getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /**
   * Toggle between light and dark themes
   */
  static toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  private static applyLightTheme(): void {
    const root = document.documentElement;
    root.style.setProperty('--ui-dark-bg', '#ffffff');
    root.style.setProperty('--ui-dark-surface', '#f5f5f5');
    root.style.setProperty('--ui-dark-surface-elevated', '#ffffff');
    root.style.setProperty('--ui-dark-text', '#212121');
    root.style.setProperty('--ui-dark-text-secondary', '#757575');
  }

  private static applyDarkTheme(): void {
    const root = document.documentElement;
    root.style.setProperty('--ui-dark-bg', '#1a1a1a');
    root.style.setProperty('--ui-dark-surface', '#2d2d2d');
    root.style.setProperty('--ui-dark-surface-elevated', '#3a3a3a');
    root.style.setProperty('--ui-dark-text', 'rgba(255, 255, 255, 0.87)');
    root.style.setProperty('--ui-dark-text-secondary', 'rgba(255, 255, 255, 0.6)');
  }

  /**
   * Initialize theme from user preference or system preference
   */
  static initializeTheme(): void {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('ui-theme') as 'light' | 'dark' | null;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem('ui-theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  /**
   * Save theme preference to localStorage
   */
  static saveThemePreference(): void {
    localStorage.setItem('ui-theme', this.currentTheme);
  }
}

/**
 * Accessibility Manager
 * Provides utilities for accessibility features
 */
export class AccessibilityManager {
  /**
   * Announce message to screen readers
   */
  static announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Set focus trap for modal dialogs
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if user prefers high contrast
   */
  static prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }
}

// Auto-initialize theme on module load
if (typeof window !== 'undefined') {
  ThemeManager.initializeTheme();
}
