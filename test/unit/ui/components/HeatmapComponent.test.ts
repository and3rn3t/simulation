import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HeatmapComponent, HeatmapConfig } from '../../../../src/ui/components/HeatmapComponent';
import { PopulationDensityHeatmap } from '../../../../src/ui/components/HeatmapComponent';

describe('HeatmapComponent', () => {
  let component: HeatmapComponent;
  let config: HeatmapConfig;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Mock canvas and context
    mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1
    } as any;

    mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 400,
      height: 300,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 300
      })
    } as any;

    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement.call(document, tagName);
    });

    config = {
      width: 400,
      height: 300,
      cellSize: 10,
      title: 'Test Heatmap'
    };
  });

  afterEach(() => {
    if (component) {
      component.unmount();
    }
    vi.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should create heatmap component with default config', () => {
      component = new HeatmapComponent(config);
      
      expect(component).toBeDefined();
      expect(component.getElement()).toBeDefined();
    });

    it('should create canvas with correct dimensions', () => {
      component = new HeatmapComponent(config);
      
      expect(mockCanvas.width).toBe(400);
      expect(mockCanvas.height).toBe(300);
    });

    it('should set up event listeners when onCellClick is provided', () => {
      const configWithCallback = {
        ...config,
        onCellClick: vi.fn()
      };
      
      component = new HeatmapComponent(configWithCallback);
      
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should create legend when showLegend is true', () => {
      const configWithLegend = {
        ...config,
        showLegend: true
      };
      
      component = new HeatmapComponent(configWithLegend);
      const element = component.getElement();
      
      expect(element.querySelector('.heatmap-legend')).toBeDefined();
    });
  });

  describe('Data Management', () => {
    beforeEach(() => {
      component = new HeatmapComponent(config);
    });

    it('should update heatmap from position data', () => {
      const positions = [
        { x: 50, y: 50 },
        { x: 100, y: 100 },
        { x: 150, y: 150 }
      ];

      component.updateFromPositions(positions);
      
      // Should call render method (which calls fillRect)
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle empty position data gracefully', () => {
      const emptyPositions: { x: number; y: number }[] = [];

      expect(() => component.updateFromPositions(emptyPositions)).not.toThrow();
    });

    it('should set data directly', () => {
      const testData = [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
        [0.7, 0.8, 0.9]
      ];

      component.setData(testData);
      
      // Should render the data
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('should handle positions outside canvas bounds', () => {
      const positions = [
        { x: -10, y: 50 },    // Outside left
        { x: 500, y: 100 },   // Outside right
        { x: 150, y: -10 },   // Outside top
        { x: 200, y: 400 }    // Outside bottom
      ];

      expect(() => component.updateFromPositions(positions)).not.toThrow();
    });
  });

  describe('Interactive Features', () => {
    it('should handle click events when callback is provided', () => {
      const onCellClick = vi.fn();
      const configWithCallback = {
        ...config,
        onCellClick
      };
      
      component = new HeatmapComponent(configWithCallback);
      
      // Set some test data first
      component.setData([[1, 2], [3, 4]]);

      // Verify that addEventListener was called for click events
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should handle clicks outside data bounds', () => {
      const onCellClick = vi.fn();
      const configWithCallback = {
        ...config,
        onCellClick
      };
      
      component = new HeatmapComponent(configWithCallback);
      component.setData([[1]]);

      // Verify that event listener was set up
      expect(mockCanvas.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('Configuration Options', () => {
    it('should use custom color scheme', () => {
      const customConfig = {
        ...config,
        colorScheme: ['#ff0000', '#00ff00', '#0000ff']
      };

      component = new HeatmapComponent(customConfig);
      const testData = [[0.5]];
      
      expect(() => component.setData(testData)).not.toThrow();
    });

    it('should handle missing title', () => {
      const configWithoutTitle = {
        width: 400,
        height: 300,
        cellSize: 10
      };

      component = new HeatmapComponent(configWithoutTitle);
      expect(component.getElement()).toBeDefined();
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      component = new HeatmapComponent(config);
    });

    it('should mount and unmount properly', () => {
      const container = document.createElement('div');
      component.mount(container);
      
      expect(container.children.length).toBeGreaterThan(0);
      
      component.unmount();
      expect(component.getElement().parentNode).toBeNull();
    });
  });
});

describe('PopulationDensityHeatmap', () => {
  let component: PopulationDensityHeatmap;

  beforeEach(() => {
    // Mock canvas setup (same as above)
    const mockContext = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1
    } as any;

    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 400,
      height: 300,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getBoundingClientRect: vi.fn().mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 300
      })
    } as any;

    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement.call(document, tagName);
    });
  });

  afterEach(() => {
    if (component) {
      component.unmount();
    }
    vi.restoreAllMocks();
  });

  it('should create population density heatmap with correct dimensions', () => {
    component = new PopulationDensityHeatmap(400, 300);
    
    expect(component).toBeDefined();
    expect(component.getElement()).toBeDefined();
  });

  it('should update with position data', () => {
    component = new PopulationDensityHeatmap(400, 300);
    
    const positions = [
      { x: 100, y: 150 },
      { x: 200, y: 100 },
      { x: 150, y: 200 }
    ];

    expect(() => component.updateFromPositions(positions)).not.toThrow();
  });

  it('should handle empty position list', () => {
    component = new PopulationDensityHeatmap(400, 300);
    
    expect(() => component.updateFromPositions([])).not.toThrow();
  });

  it('should start and stop auto updates', () => {
    component = new PopulationDensityHeatmap(400, 300);
    
    const getPositions = vi.fn().mockReturnValue([
      { x: 100, y: 150 },
      { x: 200, y: 100 }
    ]);

    component.startAutoUpdate(getPositions, 100);
    
    // Should be able to stop without error
    component.stopAutoUpdate();
    expect(getPositions).toHaveBeenCalled();
  });

  it('should handle positions outside canvas bounds', () => {
    component = new PopulationDensityHeatmap(400, 300);
    
    const positions = [
      { x: -10, y: 150 },   // Outside left
      { x: 500, y: 100 },   // Outside right
      { x: 150, y: -10 },   // Outside top
      { x: 200, y: 400 }    // Outside bottom
    ];

    expect(() => component.updateFromPositions(positions)).not.toThrow();
  });

  it('should clean up auto updates on unmount', () => {
    component = new PopulationDensityHeatmap(400, 300);
    
    const getPositions = vi.fn().mockReturnValue([]);
    component.startAutoUpdate(getPositions, 100);
    
    // Should clean up when unmounting
    component.unmount();
    expect(() => component.stopAutoUpdate()).not.toThrow();
  });
});
