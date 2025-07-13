// Temporary index file to fix import issues
export { ComponentFactory } from './ComponentFactory';

// Temporary stub classes to satisfy imports until full implementation
export class ThemeManager {
  static getCurrentTheme(): string {
    return 'light';
  }

  static setTheme(_theme: string): void {
    // TODO: Implement theme switching
  }

  static saveThemePreference(): void {
    // TODO: Implement theme preference saving
  }
}

export class AccessibilityManager {
  static announceToScreenReader(_message: string): void {
    // TODO: Implement screen reader announcements
  }

  static prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  }

  static prefersHighContrast(): boolean {
    return window.matchMedia?.('(prefers-contrast: high)').matches || false;
  }
}
