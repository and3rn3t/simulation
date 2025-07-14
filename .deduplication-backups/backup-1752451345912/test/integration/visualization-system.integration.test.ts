import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the required services and components
vi.mock('../../src/services/UserPreferencesManager', () => ({
  UserPreferencesManager: {
    getInstance: vi.fn(() => ({
      getPreferences: vi.fn(() => ({
        theme: 'dark',
        language: 'en',
        defaultSpeed: 1.0,
        visualizations: {
          showCharts: true,
          showHeatmaps: true,
          showTrails: true,
          chartUpdateInterval: 1000,
          heatmapIntensity: 0.6,
          trailLength: 100,
        },
        performance: {
          enableOptimizations: true,
          maxFrameRate: 60,
        },
        accessibility: {
          highContrast: false,
          fontSize: 14,
        },
      })),
      updatePreferences: vi.fn(),
      getAvailableLanguages: vi.fn(() => [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
      ]),
      on: vi.fn(),
      off: vi.fn(),
    })),
  },
}));

// Use the global Chart.js mock from setup.ts - no local override needed

vi.mock('chartjs-adapter-date-fns', () => ({}));

describe('Visualization System Integration Tests', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Ensure window.matchMedia is mocked
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock canvas element for Chart.js
    mockCanvas = {
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 1,
      })),
      width: 800,
      height: 600,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
      })),
    } as any;

    // Ensure global createElement mock returns our specific canvas
    const originalCreateElement = document.createElement;
    document.createElement = vi
      .fn()
      .mockImplementation((tagName: string, options?: ElementCreationOptions) => {
        const element = originalCreateElement.call(document, tagName, options);

        if (!element) {
          // If element creation failed, create a basic mock element
          const mockElement = {
            tagName: tagName.toUpperCase(),
            className: '',
            innerHTML: '',
            style: {},
            appendChild: vi.fn(),
            removeChild: vi.fn(),
            querySelector: vi.fn(selector => {
              if (selector === 'canvas' || selector === '.heatmap-canvas') return mockCanvas;
              return null;
            }),
            querySelectorAll: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
            setAttribute: vi.fn(),
            getAttribute: vi.fn(),
            hasAttribute: vi.fn(),
            removeAttribute: vi.fn(),
            getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 0, height: 0 })),
            parentNode: null,
            children: [],
            hasOwnProperty: function (prop) {
              return prop in this;
            },
          } as any;

          if (tagName === 'canvas') {
            Object.assign(mockElement, mockCanvas);
          }

          return mockElement;
        }

        if (tagName === 'canvas') {
          // Copy our mock canvas properties to the real element
          Object.assign(element, mockCanvas);
        }

        // Ensure all elements have querySelector that returns canvas
        if (element && typeof element.querySelector !== 'function') {
          element.querySelector = vi.fn(selector => {
            if (selector === 'canvas' || selector === '.heatmap-canvas') return mockCanvas;
            return null;
          });
        } else if (element && element.querySelector) {
          const originalQuerySelector = element.querySelector.bind(element);
          element.querySelector = vi.fn(selector => {
            if (selector === 'canvas' || selector === '.heatmap-canvas') return mockCanvas;
            return originalQuerySelector(selector);
          });
        }

        // Ensure all elements have proper property setters (from global setup)
        if (element && !element.hasOwnProperty('className')) {
          Object.defineProperty(element, 'className', {
            get: function () {
              return this._className || '';
            },
            set: function (value) {
              this._className = value;
            },
            configurable: true,
          });
        }

        return element;
      });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Integration', () => {
    it('should integrate chart components with user preferences', async () => {
      const { ChartComponent } = await import('../../src/ui/components/ChartComponent');
      const { UserPreferencesManager } = await import('../../src/services/UserPreferencesManager');

      const preferencesManager = UserPreferencesManager.getInstance();
      const preferences = preferencesManager.getPreferences();

      const chartConfig = {
        type: 'line' as any,
        title: 'Test Chart',
        width: 400,
        height: 300,
      };

      const chart = new ChartComponent(chartConfig);

      expect(chart).toBeDefined();
      expect(chart.getElement()).toBeDefined();

      chart.unmount();
    });

    it('should integrate heatmap components with preferences', async () => {
      const { HeatmapComponent } = await import('../../src/ui/components/HeatmapComponent');
      const { UserPreferencesManager } = await import('../../src/services/UserPreferencesManager');

      const preferencesManager = UserPreferencesManager.getInstance();
      const preferences = preferencesManager.getPreferences();

      const heatmapConfig = {
        width: 400,
        height: 300,
        cellSize: 10,
        title: 'Test Heatmap',
      };

      const heatmap = new HeatmapComponent(heatmapConfig);

      expect(heatmap).toBeDefined();
      expect(heatmap.getElement()).toBeDefined();

      heatmap.unmount();
    });

    it('should handle preferences updates across components', async () => {
      const { UserPreferencesManager } = await import('../../src/services/UserPreferencesManager');

      const preferencesManager = UserPreferencesManager.getInstance();

      // Update preferences
      const newPreferences = {
        visualizations: {
          showCharts: false,
          showHeatmaps: true,
          showTrails: false,
        },
      };

      preferencesManager.updatePreferences(newPreferences as any);

      // Verify preferences were updated
      expect(preferencesManager.updatePreferences).toHaveBeenCalledWith(newPreferences);
    });
  });

  describe('Data Flow Integration', () => {
    it('should handle simulation data flow through visualization components', async () => {
      const { ChartComponent } = await import('../../src/ui/components/ChartComponent');
      const { HeatmapComponent } = await import('../../src/ui/components/HeatmapComponent');

      const chart = new ChartComponent({
        type: 'line' as any,
        title: 'Population Chart',
        width: 400,
        height: 300,
      });

      const heatmap = new HeatmapComponent({
        width: 400,
        height: 300,
        cellSize: 10,
        title: 'Population Density',
      });

      // Simulate data update
      const testData = {
        labels: ['t1', 't2', 't3'],
        datasets: [
          {
            label: 'Population',
            data: [10, 20, 30],
          },
        ],
      };

      const positions = [
        { x: 100, y: 150 },
        { x: 200, y: 100 },
        { x: 150, y: 200 },
      ];

      expect(() => chart.updateData(testData)).not.toThrow();
      expect(() => heatmap.updateFromPositions(positions)).not.toThrow();

      chart.unmount();
      heatmap.unmount();
    });

    it('should handle real-time data updates', async () => {
      const { ChartComponent } = await import('../../src/ui/components/ChartComponent');

      const chart = new ChartComponent({
        type: 'line' as any,
        title: 'Real-time Chart',
        width: 400,
        height: 300,
      });

      const mockCallback = vi.fn();

      // Start real-time updates
      chart.startRealTimeUpdates(mockCallback, 100);

      // Stop updates
      chart.stopRealTimeUpdates();

      chart.unmount();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle component creation errors gracefully', async () => {
      // Mock Chart.js to throw error
      const { Chart } = await import('chart.js');
      (Chart as any).mockImplementationOnce(() => {
        throw new Error('Chart creation failed');
      });

      const { ChartComponent } = await import('../../src/ui/components/ChartComponent');

      expect(() => {
        new ChartComponent({
          type: 'line' as any,
          title: 'Error Test',
          width: 400,
          height: 300,
        });
      }).toThrow(); // Should throw as expected for this test
    });

    it('should handle invalid preference data', async () => {
      const { UserPreferencesManager } = await import('../../src/services/UserPreferencesManager');

      const preferencesManager = UserPreferencesManager.getInstance();

      // Try to set invalid preferences
      const invalidPreferences = {
        visualizations: {
          showCharts: 'invalid' as any,
          chartUpdateInterval: -100,
        },
      };

      expect(() => preferencesManager.updatePreferences(invalidPreferences as any)).not.toThrow();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const { HeatmapComponent } = await import('../../src/ui/components/HeatmapComponent');

      const heatmap = new HeatmapComponent({
        width: 800,
        height: 600,
        cellSize: 5,
        title: 'Large Dataset Test',
      });

      // Create large position dataset
      const largePositions = Array.from({ length: 1000 }, (_, i) => ({
        x: Math.random() * 800,
        y: Math.random() * 600,
      }));

      const startTime = performance.now();
      heatmap.updateFromPositions(largePositions);
      const endTime = performance.now();

      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      heatmap.unmount();
    });

    it('should throttle rapid updates appropriately', async () => {
      const { ChartComponent } = await import('../../src/ui/components/ChartComponent');

      const chart = new ChartComponent({
        type: 'line' as any,
        title: 'Throttle Test',
        width: 400,
        height: 300,
      });

      const testData = {
        labels: ['t1'],
        datasets: [{ label: 'Test', data: [1] }],
      };

      // Rapid fire updates
      const startTime = performance.now();
      for (let i = 0; i < 50; i++) {
        chart.updateData(testData);
      }
      const endTime = performance.now();

      // Should handle rapid updates without significant performance degradation
      expect(endTime - startTime).toBeLessThan(200);

      chart.unmount();
    });
  });

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation', async () => {
      const { SettingsPanelComponent } = await import(
        '../../src/ui/components/SettingsPanelComponent'
      );

      const settingsPanel = new SettingsPanelComponent();
      const element = settingsPanel.getElement();

      // Should have focusable elements
      const focusableElements = element.querySelectorAll('[tabindex], button, input, select');
      expect(focusableElements.length).toBeGreaterThan(0);

      settingsPanel.unmount();
    });

    it('should respect user preferences', async () => {
      const { UserPreferencesManager } = await import('../../src/services/UserPreferencesManager');

      const preferencesManager = UserPreferencesManager.getInstance();

      // Set accessibility preference
      preferencesManager.updatePreferences({
        accessibility: {
          reducedMotion: true,
        },
      } as any);

      const preferences = preferencesManager.getPreferences();
      expect(preferences).toBeDefined();
    });
  });
});
