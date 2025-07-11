import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock ComponentFactory to prevent DOM access during module load
vi.mock('../../src/ui/components/ComponentFactory', () => ({
  ComponentFactory: {
    createButton: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      getElement: vi.fn(() => ({ style: {} }))
    })),
    createCard: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      getElement: vi.fn(() => ({ style: {} }))
    })),
    createModal: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      getElement: vi.fn(() => ({ style: {} }))
    })),
    createInput: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      getElement: vi.fn(() => ({ style: {} }))
    })),
    createToggle: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      getElement: vi.fn(() => ({ style: {} })),
      setValue: vi.fn(),
      getValue: vi.fn(() => false)
    })),
    getComponent: vi.fn(),
    removeComponent: vi.fn(),
    removeAllComponents: vi.fn(),
    getComponentIds: vi.fn(() => [])
  },
  ThemeManager: {
    setTheme: vi.fn(),
    getCurrentTheme: vi.fn(() => 'dark'),
    toggleTheme: vi.fn(),
    initializeTheme: vi.fn(),
    saveThemePreference: vi.fn()
  },
  AccessibilityManager: {
    announceToScreenReader: vi.fn(),
    trapFocus: vi.fn(() => () => {}),
    prefersReducedMotion: vi.fn(() => false),
    prefersHighContrast: vi.fn(() => false)
  }
}));

// Mock OrganismTrailComponent to avoid complex DOM dependencies
vi.mock('../../src/ui/components/OrganismTrailComponent', () => ({
  OrganismTrailComponent: class MockOrganismTrailComponent {
    mount = vi.fn();
    unmount = vi.fn();
    updateTrails = vi.fn();
    clearTrails = vi.fn();
    setVisibility = vi.fn();
    exportTrailData = vi.fn(() => ({ trails: [] }));
    getElement = vi.fn(() => ({
      style: {},
      className: 'organism-trail-component'
    }));
    destroy = vi.fn();
  }
}));

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class MockChart {
    constructor() {}
    destroy() {}
    update() {}
    resize() {}
    render() {}
    static register() {}
    data = { labels: [], datasets: [] };
    options = {};
    canvas = { width: 400, height: 300 };
    ctx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
    };
  },
  registerables: [],
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
  BarElement: vi.fn(),
  ArcElement: vi.fn(),
}));

vi.mock('chartjs-adapter-date-fns', () => ({}));

// Mock UserPreferencesManager
vi.mock('../../src/services/UserPreferencesManager', () => ({
  UserPreferencesManager: {
    getInstance: vi.fn(() => ({
      getPreferences: vi.fn(() => ({
        theme: 'auto',
        language: 'en',
        showCharts: true,
        showHeatmap: true,
        showTrails: true,
        chartUpdateInterval: 1000,
        maxDataPoints: 100,
        highContrast: false,
        reducedMotion: false,
        autoSave: true,
        soundEnabled: true
      })),
      updatePreference: vi.fn(),
      updatePreferences: vi.fn(),
      addChangeListener: vi.fn(),
      removeChangeListener: vi.fn(),
      applyTheme: vi.fn(),
      applyAccessibility: vi.fn(),
      exportPreferences: vi.fn(),
      importPreferences: vi.fn()
    }))
  }
}));

// Setup DOM environment for tests
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName: string) => {
      const element = {
        tagName: tagName.toUpperCase(),
        className: '',
        innerHTML: '',
        style: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        querySelector: vi.fn((selector: string) => {
          if (selector === 'canvas' || selector === '.heatmap-canvas') {
            return {
              tagName: 'CANVAS',
              width: 400,
              height: 300,
              getContext: vi.fn(() => ({
                clearRect: vi.fn(),
                fillRect: vi.fn(),
                strokeRect: vi.fn(),
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 1,
                beginPath: vi.fn(),
                moveTo: vi.fn(),
                lineTo: vi.fn(),
                arc: vi.fn(),
                fill: vi.fn(),
                stroke: vi.fn(),
                fillText: vi.fn(),
                measureText: vi.fn(() => ({ width: 100 })),
                save: vi.fn(),
                restore: vi.fn(),
                translate: vi.fn(),
                scale: vi.fn(),
                rotate: vi.fn(),
                createImageData: vi.fn(() => ({
                  data: new Uint8ClampedArray(16),
                  width: 2,
                  height: 2
                })),
                putImageData: vi.fn(),
                getImageData: vi.fn(() => ({
                  data: new Uint8ClampedArray(16),
                  width: 2,
                  height: 2
                }))
              })),
              style: {},
              addEventListener: vi.fn(),
              removeEventListener: vi.fn()
            };
          }
          // Return mock elements for any selector - be permissive
          return {
            tagName: 'DIV',
            appendChild: vi.fn(),
            removeChild: vi.fn(),
            querySelector: vi.fn((nestedSelector: string) => {
              // For nested querySelector calls within components
              if (nestedSelector.includes('input') || nestedSelector.includes('canvas')) {
                return {
                  tagName: nestedSelector.includes('input') ? 'INPUT' : 'CANVAS',
                  type: 'checkbox',
                  checked: false,
                  value: '',
                  width: 400,
                  height: 300,
                  addEventListener: vi.fn(),
                  removeEventListener: vi.fn(),
                  getContext: vi.fn(() => ({
                    clearRect: vi.fn(),
                    fillRect: vi.fn(),
                    strokeRect: vi.fn()
                  })),
                  style: {},
                  className: '',
                  textContent: ''
                };
              }
              return null;
            }),
            querySelectorAll: vi.fn(() => []),
            style: {
              display: '',
              setProperty: vi.fn(),
              removeProperty: vi.fn()
            },
            className: '',
            innerHTML: '',
            textContent: '',
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            // Add common element properties
            checked: false,
            value: '',
            type: 'checkbox'
          };
        }),
        querySelectorAll: vi.fn(() => []),
        getBoundingClientRect: vi.fn(() => ({
          left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100
        }))
      };

      if (tagName === 'canvas') {
        Object.assign(element, {
          width: 400,
          height: 300,
          getContext: vi.fn(() => ({
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            fillText: vi.fn(),
            measureText: vi.fn(() => ({ width: 100 })),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            scale: vi.fn(),
            rotate: vi.fn()
          }))
        });
      }

      return element;
    }),
    documentElement: {
      setAttribute: vi.fn(),
      style: {
        setProperty: vi.fn(),
        removeProperty: vi.fn(),
        getProperty: vi.fn()
      }
    },
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    getElementById: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => [])
  },
  configurable: true
});

Object.defineProperty(global, 'window', {
  value: {
    matchMedia: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })),
    localStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }
  },
  configurable: true
});

// Mock Canvas API
Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class HTMLCanvasElement {
    constructor() {}
    getContext() {
      return {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({ width: 100 })),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn()
      };
    }
  },
  configurable: true
});

// Now import the component
import { VisualizationDashboard } from '../../src/ui/components/VisualizationDashboard';

describe('VisualizationDashboard Integration Tests', () => {
  let dashboard: VisualizationDashboard;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Mock canvas element
    mockCanvas = {
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        closePath: vi.fn(),
        measureText: vi.fn(() => ({ width: 12 })),
        fillText: vi.fn(),
        setTransform: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
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
        right: 800,
        bottom: 600,
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,'),
      style: {},
    } as any;

    vi.clearAllMocks();
  });

  afterEach(() => {
    if (dashboard) {
      dashboard.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('Dashboard Initialization', () => {
    it('should create dashboard with all visualization components', () => {
      dashboard = new VisualizationDashboard(mockCanvas);
      
      expect(dashboard).toBeDefined();
      expect(dashboard.getElement()).toBeDefined();
    });

    it('should initialize components based on preferences', () => {
      dashboard = new VisualizationDashboard(mockCanvas);
      
      const element = dashboard.getElement();
      
      // Should have dashboard structure
      expect(element.className).toContain('visualization-dashboard');
    });

    it('should create dashboard controls', () => {
      dashboard = new VisualizationDashboard(mockCanvas);
      
      const element = dashboard.getElement();
      
      expect(element).toBeDefined();
    });
  });

  describe('Data Updates', () => {
    beforeEach(() => {
      dashboard = new VisualizationDashboard(mockCanvas);
    });

    it('should update all components with visualization data', () => {
      const visualizationData = {
        timestamp: new Date(),
        population: 100,
        births: 5,
        deaths: 2,
        organismTypes: {
          bacteria: 60,
          virus: 40
        },
        positions: [
          { x: 100, y: 150, id: '1', type: 'bacteria' },
          { x: 200, y: 100, id: '2', type: 'virus' }
        ]
      };

      expect(() => dashboard.updateVisualization(visualizationData)).not.toThrow();
    });

    it('should handle empty visualization data', () => {
      const emptyData = {
        timestamp: new Date(),
        population: 0,
        births: 0,
        deaths: 0,
        organismTypes: {},
        positions: []
      };

      expect(() => dashboard.updateVisualization(emptyData)).not.toThrow();
    });
  });

  describe('Real-time Updates', () => {
    beforeEach(() => {
      dashboard = new VisualizationDashboard(mockCanvas);
    });

    it('should start real-time updates', () => {
      expect(() => dashboard.startUpdates()).not.toThrow();
    });

    it('should stop real-time updates', () => {
      dashboard.startUpdates();
      expect(() => dashboard.stopUpdates()).not.toThrow();
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      dashboard = new VisualizationDashboard(mockCanvas);
    });

    it('should export visualization data', () => {
      const exportData = dashboard.exportData();
      
      expect(exportData).toBeDefined();
      expect(exportData).toHaveProperty('timestamp');
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      dashboard = new VisualizationDashboard(mockCanvas);
    });

    it('should mount properly', () => {
      const container = document.createElement('div');
      dashboard.mount(container);
      
      expect(dashboard.getElement()).toBeDefined();
    });

    it('should unmount properly', () => {
      const container = document.createElement('div');
      dashboard.mount(container);
      dashboard.unmount();
      
      expect(dashboard.getElement()).toBeDefined();
    });
  });
});
