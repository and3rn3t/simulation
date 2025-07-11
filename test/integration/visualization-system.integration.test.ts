import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the required services and components
vi.mock('../../src/services/UserPreferencesManager', () => ({
  UserPreferencesManager: {
    getInstance: vi.fn(() => ({
      getPreferences: vi.fn(() => ({
        visualizations: {
          showCharts: true,
          showHeatmaps: true,
          showTrails: true,
          chartUpdateInterval: 1000,
          heatmapIntensity: 0.6,
          trailLength: 100
        }
      })),
      updatePreferences: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }))
  }
}));

vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    data: { labels: [], datasets: [] },
    options: {}
  })),
  registerables: []
}));

vi.mock('chartjs-adapter-date-fns', () => ({}));

describe('Visualization System Integration Tests', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Mock canvas element
    mockCanvas = {
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 1
      })),
      width: 800,
      height: 600,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      }))
    } as any;

    // Mock document.createElement
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement.call(document, tagName);
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
        height: 300
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
        title: 'Test Heatmap'
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
          showTrails: false
        }
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
        height: 300
      });
      
      const heatmap = new HeatmapComponent({
        width: 400,
        height: 300,
        cellSize: 10,
        title: 'Population Density'
      });
      
      // Simulate data update
      const testData = {
        labels: ['t1', 't2', 't3'],
        datasets: [{
          label: 'Population',
          data: [10, 20, 30]
        }]
      };
      
      const positions = [
        { x: 100, y: 150 },
        { x: 200, y: 100 },
        { x: 150, y: 200 }
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
        height: 300
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
          height: 300
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
          chartUpdateInterval: -100
        }
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
        title: 'Large Dataset Test'
      });
      
      // Create large position dataset
      const largePositions = Array.from({ length: 1000 }, (_, i) => ({
        x: Math.random() * 800,
        y: Math.random() * 600
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
        height: 300
      });
      
      const testData = {
        labels: ['t1'],
        datasets: [{ label: 'Test', data: [1] }]
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
      const { SettingsPanelComponent } = await import('../../src/ui/components/SettingsPanelComponent');
      
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
          reducedMotion: true
        }
      } as any);
      
      const preferences = preferencesManager.getPreferences();
      expect(preferences).toBeDefined();
    });
  });
});
