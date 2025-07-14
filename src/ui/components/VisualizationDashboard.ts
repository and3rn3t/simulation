class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
import { UserPreferencesManager } from '../../services/UserPreferencesManager';
import { BaseComponent } from './BaseComponent';
import { OrganismDistributionChart, PopulationChartComponent } from './ChartComponent';
import { ComponentFactory } from './ComponentFactory';
import { PopulationDensityHeatmap } from './HeatmapComponent';
import { OrganismTrailComponent } from './OrganismTrailComponent';

export interface VisualizationData {
  timestamp: Date;
  population: number;
  births: number;
  deaths: number;
  organismTypes: { [type: string]: number };
  positions: { x: number; y: number; id: string; type: string }[];
}

/**
 * Visualization Dashboard Component
 * Central hub for all data visualization components
 */
export class VisualizationDashboard extends BaseComponent {
  private preferencesManager: UserPreferencesManager;
  private populationChart: PopulationChartComponent;
  private distributionChart: OrganismDistributionChart;
  private densityHeatmap: PopulationDensityHeatmap;
  private trailComponent: OrganismTrailComponent;
  private simulationCanvas: HTMLCanvasElement;
  private isVisible: boolean = true;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(simulationCanvas: HTMLCanvasElement, id?: string) {
    super(id);
    this.simulationCanvas = simulationCanvas;
    this.preferencesManager = UserPreferencesManager.getInstance();

    this.createElement();
    this.initializeComponents();
    this.setupControls();
    this.applyPreferences();
  }

  protected createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'visualization-dashboard';
    this.element.innerHTML = `
      <div class="dashboard-header">
        <h2 class="dashboard-title">📊 Data Visualization</h2>
        <div class="dashboard-controls">
          <button class="dashboard-toggle" title="Toggle Dashboard">
            <span class="toggle-icon">🔽</span>
          </button>
        </div>
      </div>
      <div class="dashboard-content">
        <div class="visualization-controls">
          <div class="control-group">
            <span class="control-label">Display Options</span>
            <div class="display-toggles"></div>
          </div>
          <div class="control-group">
            <span class="control-label">Update Frequency</span>
            <div class="frequency-control"></div>
          </div>
        </div>
        <div class="visualization-grid">
          <div class="chart-section">
            <div id="population-chart-container"></div>
            <div id="distribution-chart-container"></div>
          </div>
          <div class="analysis-section">
            <div id="heatmap-container"></div>
            <div id="trail-controls-container"></div>
          </div>
        </div>
        <div class="stats-summary">
          <div class="stat-card">
            <span class="stat-label">Total Data Points</span>
            <span class="stat-value" id="total-data-points">0</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Update Rate</span>
            <span class="stat-value" id="update-rate">1.0s</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Memory Usage</span>
            <span class="stat-value" id="memory-usage">0 MB</span>
          </div>
        </div>
      </div>
    `;
  }

  private initializeComponents(): void {
    // Population chart
    this.populationChart = new PopulationChartComponent('population-chart');
    const chartContainer = this.element?.querySelector(
      '#population-chart-container'
    ) as HTMLElement;
    this.populationChart.mount(chartContainer);

    // Distribution chart
    this.distributionChart = new OrganismDistributionChart('distribution-chart');
    const distributionContainer = this.element?.querySelector(
      '#distribution-chart-container'
    ) as HTMLElement;
    this.distributionChart.mount(distributionContainer);

    // Density heatmap
    this.densityHeatmap = new PopulationDensityHeatmap(
      this.simulationCanvas.width,
      this.simulationCanvas.height,
      'density-heatmap'
    );
    const heatmapContainer = this.element?.querySelector('#heatmap-container') as HTMLElement;
    this.densityHeatmap.mount(heatmapContainer);

    // Organism trails
    this.trailComponent = new OrganismTrailComponent(
      this.simulationCanvas,
      {
        maxTrailLength: 50,
        trailFadeRate: 0.02,
        trailWidth: 2,
        showTrails: true,
      },
      'organism-trails'
    );
    const trailContainer = this.element?.querySelector('#trail-controls-container') as HTMLElement;
    this.trailComponent.mount(trailContainer);
  }

  private setupControls(): void {
    // Dashboard toggle
    const dashboardToggle = this.element?.querySelector('.dashboard-toggle') as HTMLButtonElement;
    const toggleIcon = this.element?.querySelector('.toggle-icon') as HTMLElement;
    const dashboardContent = this.element?.querySelector('.dashboard-content') as HTMLElement;

    dashboardToggle?.addEventListener('click', _event => {
      try {
        this.isVisible = !this.isVisible;
        dashboardContent.style.display = this.isVisible ? 'block' : 'none';
        toggleIcon.textContent = this.isVisible ? '🔽' : '🔼';

        if (this.isVisible) {
          this.startUpdates();
        } else {
          this.stopUpdates();
        }
      } catch (error) {
        console.error('Dashboard toggle error:', error);
      }
    });

    // Display toggles
    const displayToggles = this.element?.querySelector('.display-toggles') as HTMLElement;

    const chartsToggle = ComponentFactory.createToggle({
      label: 'Charts',
      checked: this.preferencesManager.getPreferences().showCharts,
      onChange: checked => {
        this.toggleCharts(checked);
        this.preferencesManager.updatePreference('showCharts', checked);
      },
    });
    chartsToggle.mount(displayToggles);

    const heatmapToggle = ComponentFactory.createToggle({
      label: 'Heatmap',
      checked: this.preferencesManager.getPreferences().showHeatmap,
      onChange: checked => {
        this.toggleHeatmap(checked);
        this.preferencesManager.updatePreference('showHeatmap', checked);
      },
    });
    heatmapToggle.mount(displayToggles);

    const trailsToggle = ComponentFactory.createToggle({
      label: 'Trails',
      checked: this.preferencesManager.getPreferences().showTrails,
      onChange: checked => {
        this.toggleTrails(checked);
        this.preferencesManager.updatePreference('showTrails', checked);
      },
    });
    trailsToggle.mount(displayToggles);

    // Update frequency control
    const frequencyControl = this.element?.querySelector('.frequency-control') as HTMLElement;
    const frequencySlider = document.createElement('input');
    frequencySlider.type = 'range';
    frequencySlider.min = '500';
    frequencySlider.max = '5000';
    frequencySlider.step = '100';
    frequencySlider.value = this.preferencesManager.getPreferences().chartUpdateInterval.toString();
    frequencySlider.className = 'ui-slider';

    const frequencyValue = document.createElement('span');
    frequencyValue.textContent = `${this.preferencesManager.getPreferences().chartUpdateInterval}ms`;

    frequencySlider?.addEventListener('input', event => {
      try {
        const target = event.target as HTMLInputElement;
        const value = parseInt(target.value);
        frequencyValue.textContent = `${value}ms`;
        this.preferencesManager.updatePreference('chartUpdateInterval', value);
        if (this.updateInterval) {
          this.restartUpdates();
        }
      } catch (error) {
        console.error('Event listener error for input:', error);
      }
    });

    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    sliderContainer.appendChild(frequencySlider);
    sliderContainer.appendChild(frequencyValue);
    frequencyControl.appendChild(sliderContainer);
  }

  private applyPreferences(): void {
    const preferences = this.preferencesManager.getPreferences();

    this.toggleCharts(preferences.showCharts);
    this.toggleHeatmap(preferences.showHeatmap);
    this.toggleTrails(preferences.showTrails);
  }

  private toggleCharts(show: boolean): void {
    const chartSection = this.element?.querySelector('.chart-section') as HTMLElement;
    chartSection.style.display = show ? 'block' : 'none';
  }

  private toggleHeatmap(show: boolean): void {
    const heatmapContainer = this.element?.querySelector('#heatmap-container') as HTMLElement;
    heatmapContainer.style.display = show ? 'block' : 'none';
  }

  private toggleTrails(show: boolean): void {
    // Trail visibility is handled by the trail component itself
    // This just controls the visibility of the trail controls
    const trailContainer = this.element?.querySelector('#trail-controls-container') as HTMLElement;
    trailContainer.style.display = show ? 'block' : 'none';
  }

  /**
   * Update visualization with new data
   */
  updateVisualization(data: VisualizationData): void {
    if (!this.isVisible) return;

    try {
      // Update population chart
      this.populationChart.updateSimulationData({
        timestamp: data.timestamp,
        population: data.population,
        births: data.births,
        deaths: data.deaths,
      });

      // Update distribution chart
      this.distributionChart.updateDistribution(data.organismTypes);

      // Update heatmap
      const positions = data.positions.map(pos => ({ x: pos.x, y: pos.y }));
      this.densityHeatmap.updateFromPositions(positions);

      // Update trails
      data.positions.forEach(pos => {
        try {
          this.trailComponent.updateOrganismPosition(pos.id, pos.x, pos.y, pos.type);
        } catch (error) {
          console.error('Callback error:', error);
        }
      });

      // Update stats
      this.updateStats(data);
    } catch {
      /* handled */
    }
  }

  private updateStats(data: VisualizationData): void {
    // Total data points
    const totalDataPointsElement = this.element?.querySelector('#total-data-points') as HTMLElement;
    if (totalDataPointsElement) {
      totalDataPointsElement.textContent = data.positions.length.toString();
    }

    // Update rate
    const updateRateElement = this.element?.querySelector('#update-rate') as HTMLElement;
    if (updateRateElement) {
      const interval = this.preferencesManager.getPreferences().chartUpdateInterval;
      updateRateElement.textContent = `${(interval / 1000).toFixed(1)}s`;
    }

    // Memory usage (estimated)
    const memoryUsageElement = this.element?.querySelector('#memory-usage') as HTMLElement;
    if (memoryUsageElement) {
      const estimatedMemory = this.estimateMemoryUsage(data);
      memoryUsageElement.textContent = `${estimatedMemory.toFixed(1)} MB`;
    }
  }

  private estimateMemoryUsage(data: VisualizationData): number {
    // Rough estimation of memory usage for visualization data
    const chartDataSize = this.populationChart ? 0.1 : 0; // ~100KB for chart data
    const trailDataSize = data.positions.length * 0.001; // ~1KB per position
    const heatmapDataSize = 0.05; // ~50KB for heatmap

    return chartDataSize + trailDataSize + heatmapDataSize;
  }

  /**
   * Start automatic updates
   */
  startUpdates(): void {
    if (this.updateInterval) return;

    const interval = this.preferencesManager.getPreferences().chartUpdateInterval;
    this.updateInterval = setInterval(() => {
      // This would be called by the simulation to provide data
      // For now, we just update the timestamp display
      this.updateStats({
        timestamp: new Date(),
        population: 0,
        births: 0,
        deaths: 0,
        organismTypes: {}, // TODO: Consider extracting to reduce closure scope
        positions: [],
      });
    }, interval);
  }

  /**
   * Stop automatic updates
   */
  stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private restartUpdates(): void {
    this.stopUpdates();
    if (this.isVisible) {
      this.startUpdates();
    }
  }

  /**
   * Clear all visualization data
   */
  clearData(): void {
    this.populationChart.clear();
    this.distributionChart.clear();
    this.densityHeatmap.clear();
    this.trailComponent.clearAllTrails();
  }

  /**
   * Export visualization data
   */
  exportData(): {
    charts: any;
    trails: any;
    timestamp: string;
  } {
    return {
      charts: {
        population: this.populationChart,
        distribution: this.distributionChart,
      },
      trails: this.trailComponent.exportTrailData(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Resize all visualization components
   */
  resize(): void {
    this.populationChart.resize();
    this.distributionChart.resize();

    if (this.simulationCanvas) {
      this.densityHeatmap.resize(this.simulationCanvas.width, this.simulationCanvas.height);
    }
  }

  /**
   * Set visibility of the entire dashboard
   */
  setVisible(visible: boolean): void {
    this.element.style.display = visible ? 'block' : 'none';
    if (visible && this.isVisible) {
      this.startUpdates();
    } else {
      this.stopUpdates();
    }
  }

  public unmount(): void {
    this.stopUpdates();
    this.populationChart.unmount();
    this.distributionChart.unmount();
    this.densityHeatmap.unmount();
    this.trailComponent.unmount();
    super.unmount();
  }
}
