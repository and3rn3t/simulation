import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartType,
  registerables,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { BaseComponent } from './BaseComponent';

Chart.register(...registerables);

export interface ChartComponentConfig {
  type: ChartType;
  title?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  data?: ChartData;
  options?: Partial<ChartOptions>;
  onDataUpdate?: (chart: Chart) => void;
}

/**
 * Chart Component for data visualization
 * Supports line charts, bar charts, doughnut charts, and more
 */
export class ChartComponent extends BaseComponent {
  protected chart: Chart | null = null;
  private canvas: HTMLCanvasElement;
  private config: ChartComponentConfig;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: ChartComponentConfig, id?: string) {
    super(id);
    this.config = {
      responsive: true,
      maintainAspectRatio: false,
      width: 400,
      height: 300,
      ...config,
    };

    this.createElement();
    this.initializeChart();
  }

  protected createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'chart-component';
    this.element.innerHTML = `
      ${this.config.title ? `<h3 class="chart-title">${this.config.title}</h3>` : ''}
      <div class="chart-container">
        <canvas></canvas>
      </div>
    `;

    this.canvas = this.element.querySelector('canvas') as HTMLCanvasElement;

    if (this.config.width && this.config.height) {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
    }
  }

  private initializeChart(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const chartConfig: ChartConfiguration = {
      type: this.config.type,
      data: this.config.data || this.getDefaultData(),
      options: {
        responsive: this.config.responsive,
        maintainAspectRatio: this.config.maintainAspectRatio,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'rgba(255, 255, 255, 0.87)',
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'rgba(255, 255, 255, 0.87)',
            bodyColor: 'rgba(255, 255, 255, 0.87)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
          },
        },
        scales: this.getScalesConfig(),
        ...this.config.options,
      },
    };

    this.chart = new Chart(ctx, chartConfig);
  }

  private getDefaultData(): ChartData {
    return {
      labels: [],
      datasets: [
        {
          label: 'Data',
          data: [],
          backgroundColor: this.config.backgroundColor || 'rgba(76, 175, 80, 0.2)',
          borderColor: this.config.borderColor || 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    };
  }

  private getScalesConfig(): any {
    if (this.config.type === 'line' || this.config.type === 'bar') {
      return {
        x: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        y: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.6)',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      };
    }
    return {};
  }

  /**
   * Update chart data
   */
  updateData(data: ChartData): void {
    if (!this.chart) return;

    this.chart.data = data;
    this.chart.update('none');
  }

  /**
   * Add a single data point
   */
  addDataPoint(label: string, datasetIndex: number, value: number): void {
    if (!this.chart) return;

    this.chart.data.labels?.push(label);
    this.chart.data.datasets[datasetIndex].data.push(value);

    // Keep only last 50 points for performance
    if (this.chart.data.labels!.length > 50) {
      this.chart.data.labels?.shift();
      this.chart.data.datasets[datasetIndex].data.shift();
    }

    this.chart.update('none');
  }

  /**
   * Start real-time updates
   */
  startRealTimeUpdates(callback: () => void, interval: number = 1000): void {
    this.stopRealTimeUpdates();
    this.updateInterval = setInterval(() => {
      callback();
      if (this.config.onDataUpdate && this.chart) {
        this.config.onDataUpdate(this.chart);
      }
    }, interval);
  }

  /**
   * Stop real-time updates
   */
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Clear chart data
   */
  clear(): void {
    if (!this.chart) return;

    this.chart.data.labels = [];
    this.chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });
    this.chart.update();
  }

  /**
   * Resize the chart
   */
  resize(): void {
    if (this.chart) {
      this.chart.resize();
    }
  }

  public unmount(): void {
    this.stopRealTimeUpdates();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    super.unmount();
  }
}

/**
 * Population Chart - Specialized chart for population data
 */
export class PopulationChartComponent extends ChartComponent {
  constructor(id?: string) {
    super(
      {
        type: 'line',
        title: 'Population Over Time',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Total Population',
              data: [],
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              borderColor: 'rgba(76, 175, 80, 1)',
              borderWidth: 2,
              fill: true,
            },
            {
              label: 'Births',
              data: [],
              backgroundColor: 'rgba(33, 150, 243, 0.2)',
              borderColor: 'rgba(33, 150, 243, 1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: 'Deaths',
              data: [],
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              borderColor: 'rgba(244, 67, 54, 1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                displayFormats: {
                  second: 'HH:mm:ss',
                },
              },
              title: {
                display: true,
                text: 'Time',
                color: 'rgba(255, 255, 255, 0.87)',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Count',
                color: 'rgba(255, 255, 255, 0.87)',
              },
            },
          },
        },
      },
      id
    );
  }

  /**
   * Update with simulation statistics
   */
  updateSimulationData(stats: {
    timestamp: Date;
    population: number;
    births: number;
    deaths: number;
  }): void {
    const timeLabel = stats.timestamp;

    this.addDataPoint(timeLabel.toString(), 0, stats.population);
    this.addDataPoint(timeLabel.toString(), 1, stats.births);
    this.addDataPoint(timeLabel.toString(), 2, stats.deaths);
  }
}

/**
 * Organism Type Distribution Chart
 */
export class OrganismDistributionChart extends ChartComponent {
  constructor(id?: string) {
    super(
      {
        type: 'doughnut',
        title: 'Organism Type Distribution',
        data: {
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [
                'rgba(76, 175, 80, 0.8)',
                'rgba(33, 150, 243, 0.8)',
                'rgba(244, 67, 54, 0.8)',
                'rgba(255, 152, 0, 0.8)',
                'rgba(156, 39, 176, 0.8)',
                'rgba(255, 193, 7, 0.8)',
              ],
              borderColor: [
                'rgba(76, 175, 80, 1)',
                'rgba(33, 150, 243, 1)',
                'rgba(244, 67, 54, 1)',
                'rgba(255, 152, 0, 1)',
                'rgba(156, 39, 176, 1)',
                'rgba(255, 193, 7, 1)',
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: 'right',
            },
          },
        },
      },
      id
    );
  }

  /**
   * Update organism type distribution
   */
  updateDistribution(distribution: { [type: string]: number }): void {
    const labels = Object.keys(distribution);
    const data = Object.values(distribution);

    this.updateData({
      labels,
      datasets: [
        {
          ...this.chart!.data.datasets[0],
          data,
        },
      ],
    });
  }
}
