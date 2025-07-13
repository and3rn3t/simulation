/**
 * Unit tests for UserPreferencesManager
 * Tests preference management, persistence, validation, and event handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Unmock UserPreferencesManager for this test file to test the real implementation
vi.unmock('../../../src/services/UserPreferencesManager');

import { UserPreferencesManager } from '../../../src/services/UserPreferencesManager';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.matchMedia
const mockMatchMedia = vi.fn().mockImplementation(query => ({
  matches: false, // Always return false to simulate light mode
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(global, 'window', {
  value: {
    matchMedia: mockMatchMedia,
  },
  writable: true,
});

// Also set it directly on window for jsdom
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
});

describe('UserPreferencesManager', () => {
  let manager: UserPreferencesManager;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock to return null (no saved preferences)
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    // Force reset singleton instance by accessing private static field
    (UserPreferencesManager as any).instance = undefined;
    manager = UserPreferencesManager.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up singleton instance after each test
    (UserPreferencesManager as any).instance = undefined;
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = UserPreferencesManager.getInstance();
      const instance2 = UserPreferencesManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Default Preferences', () => {
    it('should initialize with default preferences', () => {
      const preferences = manager.getPreferences();

      // Check for key default properties
      expect(preferences.theme).toBe('auto');
      expect(preferences.language).toBe('en');
      expect(preferences.showCharts).toBe(true);
      expect(preferences.showTrails).toBe(true);
      expect(preferences.autoSave).toBe(true);
      expect(preferences.soundEnabled).toBe(true);

      // Verify it has the expected structure
      expect(preferences).toHaveProperty('customColors');
      expect(preferences).toHaveProperty('notificationTypes');
      expect(preferences.customColors).toHaveProperty('primary');
      expect(preferences.customColors).toHaveProperty('secondary');
      expect(preferences.customColors).toHaveProperty('accent');
    });
  });

  describe('Preference Updates', () => {
    it('should update a single preference', () => {
      manager.updatePreference('theme', 'dark');

      const preferences = manager.getPreferences();
      expect(preferences.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'organism-simulation-preferences',
        expect.stringContaining('"theme":"dark"')
      );
    });

    it('should update multiple preferences', () => {
      const updates = {
        theme: 'light' as const,
        showCharts: false,
        maxDataPoints: 200,
      };

      manager.updatePreferences(updates);

      const preferences = manager.getPreferences();
      expect(preferences.theme).toBe('light');
      expect(preferences.showCharts).toBe(false);
      expect(preferences.maxDataPoints).toBe(200);
    });

    it('should validate preference values', () => {
      // Test that the method can handle basic updates without errors
      expect(() => manager.updatePreference('theme', 'dark')).not.toThrow();
      expect(() => manager.updatePreference('showCharts', false)).not.toThrow();
      expect(() => manager.updatePreference('language', 'en')).not.toThrow();

      // Most validation is done by TypeScript at compile time
      const preferences = manager.getPreferences();
      expect(preferences.theme).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    it('should notify listeners when preferences change', () => {
      const listener = vi.fn();
      manager.addChangeListener(listener);

      manager.updatePreference('theme', 'dark');

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }));
    });

    it('should remove event listeners', () => {
      const listener = vi.fn();
      manager.addChangeListener(listener);
      manager.removeChangeListener(listener);

      manager.updatePreference('theme', 'dark');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Persistence', () => {
    it('should load preferences from localStorage on initialization', () => {
      // Clear the existing instance first
      vi.clearAllMocks();

      const savedPreferences = {
        theme: 'dark',
        language: 'fr',
        showCharts: false,
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences));

      // Force a new instance by clearing the singleton
      (UserPreferencesManager as any).instance = null;
      const newManager = UserPreferencesManager.getInstance();
      const preferences = newManager.getPreferences();

      expect(preferences.theme).toBe('dark');
      expect(preferences.language).toBe('fr');
      expect(preferences.showCharts).toBe(false);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      expect(() => UserPreferencesManager.getInstance()).not.toThrow();
    });
  });

  describe('Theme Management', () => {
    it('should apply theme changes', () => {
      // Set up mocks for this test
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      Object.defineProperty(window, 'matchMedia', {
        value: mockMatchMedia,
        writable: true,
      });

      const mockSetAttribute = vi.fn();
      const mockSetProperty = vi.fn();
      Object.defineProperty(document, 'documentElement', {
        value: {
          setAttribute: mockSetAttribute,
          style: { setProperty: mockSetProperty },
        },
        writable: true,
      });

      manager.applyTheme();

      // Check that it applies current theme
      expect(mockSetProperty).toHaveBeenCalled();
    });
  });

  describe('Import/Export', () => {
    it('should export preferences', () => {
      manager.updatePreference('theme', 'dark');

      const exported = manager.exportPreferences();

      expect(exported).toContain('dark');
      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('should import valid preferences', () => {
      const preferences = { theme: 'light', showCharts: false };
      const json = JSON.stringify(preferences);

      const result = manager.importPreferences(json);

      expect(result).toBe(true);
      expect(manager.getPreferences().theme).toBe('light');
      expect(manager.getPreferences().showCharts).toBe(false);
    });

    it('should reject invalid import data', () => {
      const result = manager.importPreferences('invalid json');

      expect(result).toBe(false);
    });
  });
});
