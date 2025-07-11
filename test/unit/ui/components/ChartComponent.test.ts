import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartComponent, ChartComponentConfig } from '../../../../src/ui/components/ChartComponent';
import { PopulationChartComponent } from '../../../../src/ui/components/ChartComponent';
import { OrganismDistributionChart } from '../../../../src/ui/components/ChartComponent';

// Mock Chart.js
const mockChart = {
  destroy: vi.fn(),
  update: vi.fn(),
  resize: vi.fn(),
  data: { labels: [], datasets: [{ data: [] }] },
  options: {},
};

vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(() => mockChart),
  registerables: [],
  ChartConfiguration: {},
  ChartData: {},
  ChartOptions: {},
  ChartType: {},
}));

vi.mock('chartjs-adapter-date-fns', () => ({}));

describe('ChartComponent', () => {
  let component: ChartComponent;
  let config: ChartComponentConfig;

  beforeEach(() => {
    config = {
      type: 'line' as any,
      title: 'Test Chart',
      width: 400,
      height: 300,
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (component) {
      component.unmount();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should create chart component with default config', () => {
      component = new ChartComponent(config);

      expect(component).toBeDefined();
      expect(component.getElement()).toBeDefined();
    });

    it('should merge custom config with defaults', () => {
      const customConfig = {
        ...config,
        responsive: false,
        backgroundColor: '#ff0000',
      };

      component = new ChartComponent(customConfig);
      expect(component).toBeDefined();
    });

    it('should create canvas element with correct dimensions', () => {
      component = new ChartComponent(config);
      const element = component.getElement();
      const canvas = element.querySelector('canvas');

      expect(canvas).toBeDefined();
    });
  });

  describe('Chart Management', () => {
    beforeEach(() => {
      component = new ChartComponent(config);
    });

    it('should update chart data', () => {
      const newData = {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Test Data',
            data: [10, 20, 30],
          },
        ],
      };

      component.updateData(newData);
      // Chart.update should be called on mock
      expect(mockChart.update).toHaveBeenCalled();
    });

    it('should add single data points', () => {
      component.addDataPoint('Test Label', 0, 42);

      // Should update the chart
      expect(mockChart.update).toHaveBeenCalled();
    });

    it('should handle real-time updates', () => {
      const mockCallback = vi.fn();
      component.startRealTimeUpdates(mockCallback, 100);

      // Should be able to stop updates without error
      component.stopRealTimeUpdates();
      expect(() => component.stopRealTimeUpdates()).not.toThrow();
    });

    it('should clear chart data', () => {
      component.clear();
      expect(mockChart.update).toHaveBeenCalled();
    });

    it('should resize chart', () => {
      component.resize();
      expect(mockChart.resize).toHaveBeenCalled();
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      component = new ChartComponent(config);
    });

    it('should mount and unmount properly', () => {
      const container = document.createElement('div');
      component.mount(container);

      expect(container.children.length).toBeGreaterThan(0);

      component.unmount();
      expect(component.getElement().parentNode).toBeNull();
    });

    it('should clean up resources on unmount', () => {
      component.startRealTimeUpdates(vi.fn(), 100);
      component.unmount();

      // Should destroy chart
      expect(mockChart.destroy).toHaveBeenCalled();
    });
  });
});

describe('PopulationChartComponent', () => {
  let component: PopulationChartComponent;

  afterEach(() => {
    if (component) {
      component.unmount();
    }
  });

  it('should create population chart with correct configuration', () => {
    component = new PopulationChartComponent();

    expect(component).toBeDefined();
    expect(component.getElement()).toBeDefined();
  });

  it('should update with simulation data', () => {
    component = new PopulationChartComponent();

    const mockData = {
      timestamp: new Date(),
      population: 100,
      births: 15,
      deaths: 5,
    };

    component.updateSimulationData(mockData);
    // Should update chart without errors
    expect(mockChart.update).toHaveBeenCalled();
  });

  it('should handle empty simulation data', () => {
    component = new PopulationChartComponent();

    const mockData = {
      timestamp: new Date(),
      population: 0,
      births: 0,
      deaths: 0,
    };

    expect(() => component.updateSimulationData(mockData)).not.toThrow();
  });
});

describe('OrganismDistributionChart', () => {
  let component: OrganismDistributionChart;

  afterEach(() => {
    if (component) {
      component.unmount();
    }
  });

  it('should create distribution chart', () => {
    component = new OrganismDistributionChart();

    expect(component).toBeDefined();
    expect(component.getElement()).toBeDefined();
  });

  it('should update distribution data', () => {
    component = new OrganismDistributionChart();

    const distribution = {
      bacteria: 45,
      virus: 35,
      fungi: 20,
    };

    component.updateDistribution(distribution);
    expect(mockChart.update).toHaveBeenCalled();
  });

  it('should handle zero distribution values', () => {
    component = new OrganismDistributionChart();

    const distribution = {
      bacteria: 0,
      virus: 0,
      fungi: 0,
    };

    expect(() => component.updateDistribution(distribution)).not.toThrow();
  });
});
