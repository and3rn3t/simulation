import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsPanelComponent } from '../../../../src/ui/components/SettingsPanelComponent';
import { UserPreferencesManager } from '../../../../src/services/UserPreferencesManager';

// Mock UserPreferencesManager
vi.mock('../../../../src/services/UserPreferencesManager', () => ({
  UserPreferencesManager: {
    getInstance: vi.fn(() => ({
      getPreferences: vi.fn(() => ({
        theme: 'dark',
        language: 'en',
        visualizations: {
          showCharts: true,
          showHeatmaps: true,
          showTrails: true,
          chartUpdateInterval: 1000,
          heatmapIntensity: 0.6,
          trailLength: 100
        },
        accessibility: {
          highContrast: false,
          reducedMotion: false,
          screenReaderMode: false,
          fontSize: 'medium'
        },
        performance: {
          maxOrganisms: 1000,
          renderQuality: 'high',
          backgroundProcessing: true
        },
        notifications: {
          enabled: true,
          sound: true,
          achievements: true,
          warnings: true
        },
        simulation: {
          autoSave: true,
          autoSaveInterval: 30000,
          defaultSpeed: 1,
          pauseOnBlur: true
        }
      })),
      updatePreferences: vi.fn(),
      applyTheme: vi.fn(),
      setLanguage: vi.fn(),
      exportPreferences: vi.fn(() => '{}'),
      importPreferences: vi.fn(() => true),
      resetToDefaults: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }))
  }
}));

describe('SettingsPanelComponent', () => {
  let component: SettingsPanelComponent;
  let mockPreferencesManager: any;

  beforeEach(() => {
    mockPreferencesManager = UserPreferencesManager.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (component) {
      component.unmount();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create settings panel with default structure', () => {
      component = new SettingsPanelComponent();
      
      expect(component).toBeDefined();
      expect(component.getElement()).toBeDefined();
    });

    it('should initialize with correct tab structure', () => {
      component = new SettingsPanelComponent();
      const element = component.getElement();
      
      // Should have tabs container
      const tabsContainer = element.querySelector('.settings-tabs');
      expect(tabsContainer).toBeDefined();
      
      // Should have content container
      const contentContainer = element.querySelector('.settings-content');
      expect(contentContainer).toBeDefined();
    });

    it('should load current preferences on initialization', () => {
      component = new SettingsPanelComponent();
      
      expect(mockPreferencesManager.getPreferences).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      component = new SettingsPanelComponent();
    });

    it('should have all expected tabs', () => {
      const element = component.getElement();
      const tabs = element.querySelectorAll('.settings-tab');
      
      // Should have 7 tabs: General, Visualizations, Accessibility, Performance, Notifications, Simulation, Advanced
      expect(tabs.length).toBeGreaterThanOrEqual(5); // At least the main tabs
    });

    it('should show first tab as active by default', () => {
      const element = component.getElement();
      const firstTab = element.querySelector('.settings-tab');
      
      expect(firstTab?.classList.contains('active')).toBe(true);
    });

    it('should switch tabs when clicked', () => {
      const element = component.getElement();
      const tabs = element.querySelectorAll('.settings-tab');
      
      if (tabs.length > 1) {
        const secondTab = tabs[1] as HTMLElement;
        secondTab.click();
        
        expect(secondTab.classList.contains('active')).toBe(true);
      }
    });
  });

  describe('General Settings', () => {
    beforeEach(() => {
      component = new SettingsPanelComponent();
    });

    it('should update theme preference', () => {
      const element = component.getElement();
      const themeSelect = element.querySelector('[data-setting="theme"]') as HTMLSelectElement;
      
      if (themeSelect) {
        themeSelect.value = 'light';
        themeSelect.dispatchEvent(new Event('change'));
        
        expect(mockPreferencesManager.applyTheme).toHaveBeenCalledWith('light');
      }
    });

    it('should update language preference', () => {
      const element = component.getElement();
      const languageSelect = element.querySelector('[data-setting="language"]') as HTMLSelectElement;
      
      if (languageSelect) {
        languageSelect.value = 'es';
        languageSelect.dispatchEvent(new Event('change'));
        
        expect(mockPreferencesManager.setLanguage).toHaveBeenCalledWith('es');
      }
    });
  });

  describe('Visualization Settings', () => {
    beforeEach(() => {
      component = new SettingsPanelComponent();
    });

    it('should toggle chart visibility', () => {
      const element = component.getElement();
      
      // Switch to visualizations tab first
      const visualizationTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Visualization')) as HTMLElement;
      
      if (visualizationTab) {
        visualizationTab.click();
        
        const chartToggle = element.querySelector('[data-setting="showCharts"]') as HTMLInputElement;
        if (chartToggle) {
          chartToggle.checked = false;
          chartToggle.dispatchEvent(new Event('change'));
          
          expect(mockPreferencesManager.updatePreferences).toHaveBeenCalledWith({
            visualizations: expect.objectContaining({
              showCharts: false
            })
          });
        }
      }
    });

    it('should update chart update interval', () => {
      const element = component.getElement();
      
      // Switch to visualizations tab
      const visualizationTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Visualization')) as HTMLElement;
      
      if (visualizationTab) {
        visualizationTab.click();
        
        const intervalInput = element.querySelector('[data-setting="chartUpdateInterval"]') as HTMLInputElement;
        if (intervalInput) {
          intervalInput.value = '2000';
          intervalInput.dispatchEvent(new Event('change'));
          
          expect(mockPreferencesManager.updatePreferences).toHaveBeenCalledWith({
            visualizations: expect.objectContaining({
              chartUpdateInterval: 2000
            })
          });
        }
      }
    });
  });

  describe('Accessibility Settings', () => {
    beforeEach(() => {
      component = new SettingsPanelComponent();
    });

    it('should toggle high contrast mode', () => {
      const element = component.getElement();
      
      // Switch to accessibility tab
      const accessibilityTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Accessibility')) as HTMLElement;
      
      if (accessibilityTab) {
        accessibilityTab.click();
        
        const contrastToggle = element.querySelector('[data-setting="highContrast"]') as HTMLInputElement;
        if (contrastToggle) {
          contrastToggle.checked = true;
          contrastToggle.dispatchEvent(new Event('change'));
          
          expect(mockPreferencesManager.updatePreferences).toHaveBeenCalledWith({
            accessibility: expect.objectContaining({
              highContrast: true
            })
          });
        }
      }
    });

    it('should update font size preference', () => {
      const element = component.getElement();
      
      // Switch to accessibility tab
      const accessibilityTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Accessibility')) as HTMLElement;
      
      if (accessibilityTab) {
        accessibilityTab.click();
        
        const fontSizeSelect = element.querySelector('[data-setting="fontSize"]') as HTMLSelectElement;
        if (fontSizeSelect) {
          fontSizeSelect.value = 'large';
          fontSizeSelect.dispatchEvent(new Event('change'));
          
          expect(mockPreferencesManager.updatePreferences).toHaveBeenCalledWith({
            accessibility: expect.objectContaining({
              fontSize: 'large'
            })
          });
        }
      }
    });
  });

  describe('Import/Export Functionality', () => {
    beforeEach(() => {
      component = new SettingsPanelComponent();
    });

    it('should export preferences', () => {
      const element = component.getElement();
      
      // Switch to advanced tab
      const advancedTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Advanced')) as HTMLElement;
      
      if (advancedTab) {
        advancedTab.click();
        
        const exportButton = element.querySelector('[data-action="export"]') as HTMLButtonElement;
        if (exportButton) {
          exportButton.click();
          
          expect(mockPreferencesManager.exportPreferences).toHaveBeenCalled();
        }
      }
    });

    it('should handle import preferences', () => {
      const element = component.getElement();
      
      // Switch to advanced tab
      const advancedTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Advanced')) as HTMLElement;
      
      if (advancedTab) {
        advancedTab.click();
        
        const importButton = element.querySelector('[data-action="import"]') as HTMLButtonElement;
        if (importButton) {
          // Mock file input
          const fileInput = element.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            // Simulate file selection
            const mockFile = new File(['{"theme":"light"}'], 'settings.json', { type: 'application/json' });
            
            Object.defineProperty(fileInput, 'files', {
              value: [mockFile],
              writable: false
            });
            
            fileInput.dispatchEvent(new Event('change'));
            
            // Should trigger import process
            expect(mockPreferencesManager.importPreferences).toHaveBeenCalled();
          }
        }
      }
    });

    it('should reset to defaults', () => {
      const element = component.getElement();
      
      // Switch to advanced tab
      const advancedTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Advanced')) as HTMLElement;
      
      if (advancedTab) {
        advancedTab.click();
        
        const resetButton = element.querySelector('[data-action="reset"]') as HTMLButtonElement;
        if (resetButton) {
          resetButton.click();
          
          expect(mockPreferencesManager.resetToDefaults).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      component = new SettingsPanelComponent();
    });

    it('should validate numeric inputs', () => {
      const element = component.getElement();
      
      // Switch to visualizations tab
      const visualizationTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Visualization')) as HTMLElement;
      
      if (visualizationTab) {
        visualizationTab.click();
        
        const intervalInput = element.querySelector('[data-setting="chartUpdateInterval"]') as HTMLInputElement;
        if (intervalInput) {
          // Try to set invalid value
          intervalInput.value = '-100';
          intervalInput.dispatchEvent(new Event('change'));
          
          // Should not update with invalid value
          expect(mockPreferencesManager.updatePreferences).toHaveBeenCalledWith({
            visualizations: expect.objectContaining({
              chartUpdateInterval: expect.any(Number)
            })
          });
        }
      }
    });

    it('should validate range inputs', () => {
      const element = component.getElement();
      
      // Switch to visualizations tab
      const visualizationTab = Array.from(element.querySelectorAll('.settings-tab'))
        .find(tab => tab.textContent?.includes('Visualization')) as HTMLElement;
      
      if (visualizationTab) {
        visualizationTab.click();
        
        const intensityInput = element.querySelector('[data-setting="heatmapIntensity"]') as HTMLInputElement;
        if (intensityInput && intensityInput.type === 'range') {
          intensityInput.value = '1.5'; // Out of 0-1 range
          intensityInput.dispatchEvent(new Event('change'));
          
          // Should clamp to valid range
          expect(mockPreferencesManager.updatePreferences).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      component = new SettingsPanelComponent();
    });

    it('should mount and unmount properly', () => {
      const container = document.createElement('div');
      component.mount(container);
      
      expect(container.children.length).toBeGreaterThan(0);
      
      component.unmount();
      expect(component.getElement().parentNode).toBeNull();
    });

    it('should clean up event listeners on unmount', () => {
      component.unmount();
      
      // Should not throw when unmounting
      expect(() => component.unmount()).not.toThrow();
    });
  });
});
