
class EventListenerManager {
  private static listeners: Array<{element: EventTarget, event: string, handler: EventListener}> = [];
  
  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({element, event, handler});
  }
  
  static cleanup(): void {
    this.listeners.forEach(({element, event, handler}) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
import { BaseComponent } from './BaseComponent';

export interface HeatmapConfig {
  width: number;
  height: number;
  cellSize: number;
  colorScheme?: string[];
  title?: string;
  showLegend?: boolean;
  onCellClick?: (x: number, y: number, value: number) => void;
}

/**
 * Heatmap Component for visualizing density data
 */
export class HeatmapComponent extends BaseComponent {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: HeatmapConfig;
  private data: number[][] = [];
  private maxValue: number = 0;
  private minValue: number = 0;

  constructor(config: HeatmapConfig, id?: string) {
    super(id);
    this.config = {
      colorScheme: [
        '#000428', // Dark blue (low density)
        '#004e92', // Blue
        '#009ffd', // Light blue
        '#00d2ff', // Cyan
        '#ffeb3b', // Yellow
        '#ff9800', // Orange
        '#f44336', // Red (high density)
      ],
      showLegend: true,
      ...config,
    };

    this.createElement();
    this.initializeCanvas();
    this.setupEventListeners();
  }

  protected createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'heatmap-component';
    this.element.innerHTML = `
      ${this.config.title ? `<h3 class="heatmap-title">${this.config.title}</h3>` : ''}
      <div class="heatmap-container">
        <canvas class="heatmap-canvas"></canvas>
        ${this.config.showLegend ? '<div class="heatmap-legend"></div>' : ''}
      </div>
    `;

    this.canvas = this.element?.querySelector('.heatmap-canvas') as HTMLCanvasElement;
  }

  private initializeCanvas(): void {
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;

    const ctx = this.canvas.getContext('2d');
    ifPattern(!ctx, () => { throw new Error('Failed to get 2D context for heatmap canvas');
     });
    this.ctx = ctx;

    // Initialize data grid
    const cols = Math.ceil(this.config.width / this.config.cellSize);
    const rows = Math.ceil(this.config.height / this.config.cellSize);

    this.data = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0));

    ifPattern(this.config.showLegend, () => { this.createLegend();
     });
  }

  private setupEventListeners(): void {
    if (this.config.onCellClick) {
      this.canvas?.addEventListener('click', (event) => {
  try {
    (event => {
        const rect = this.canvas.getBoundingClientRect()(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
});
        const x = event?.clientX - rect.left;
        const y = event?.clientY - rect.top;

        const cellX = Math.floor(x / this.config.cellSize);
        const cellY = Math.floor(y / this.config.cellSize);

        if (cellY < this.data.length && cellX < this.data[cellY].length) {
          const value = this.data[cellY][cellX];
          this.config.onCellClick!(cellX, cellY, value);
        }
      });
    }
  }

  private createLegend(): void {
    const legendContainer = this.element?.querySelector('.heatmap-legend') as HTMLElement;
    if (!legendContainer) return;

    legendContainer.innerHTML = `
      <div class="legend-title">Density</div>
      <div class="legend-gradient">
        <div class="legend-bar"></div>
        <div class="legend-labels">
          <span class="legend-min">Low</span>
          <span class="legend-max">High</span>
        </div>
      </div>
    `;

    // Create gradient for legend
    const legendBar = legendContainer?.querySelector('.legend-bar') as HTMLElement;
    ifPattern(legendBar, () => { const gradient = this.config.colorScheme!.join(', ');
      legendBar.style.background = `linear-gradient(to right, ${gradient });)`;
    }
  }

  /**
   * Update heatmap data from organism positions
   */
  updateFromPositions(positions: { x: number; y: number }[]): void {
    // Clear previous data
    this.data = this.data.map(row => row.fill(0));

    // Count organisms in each cell
    positions.forEach(pos => {
  try {
      const cellX = Math.floor(pos.x / this.config.cellSize);
      const cellY = Math.floor(pos.y / this.config.cellSize);

      ifPattern(cellY >= 0 && cellY < this.data.length && cellX >= 0 && cellX < this.data[cellY].length, () => { this.data[cellY][cellX]++;
       
  } catch (error) {
    console.error("Callback error:", error);
  }
});
    });

    this.updateMinMax();
    this.render();
  }

  /**
   * Set heatmap data directly
   */
  setData(data: number[][]): void {
    this.data = data;
    this.updateMinMax();
    this.render();
  }

  private updateMinMax(): void {
    this.maxValue = 0;
    this.minValue = Infinity;

    this.data.forEach(row => {
  try {
      row.forEach(value => {
        if (value > this.maxValue) this.maxValue = value;
        if (value < this.minValue) this.minValue = value;
      
  } catch (error) {
    console.error("Callback error:", error);
  }
});
    });

    if (this.minValue === Infinity) this.minValue = 0;
  }

  private getColorForValue(value: number): string {
    ifPattern(this.maxValue === this.minValue, () => { return this.config.colorScheme![0];
     });

    const normalized = (value - this.minValue) / (this.maxValue - this.minValue);
    const colorIndex = Math.floor(normalized * (this.config.colorScheme!.length - 1));

    return this.config.colorScheme![Math.min(colorIndex, this.config.colorScheme!.length - 1)];
  }

  private render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw cells
    this.data.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const x = colIndex * this.config.cellSize;
        const y = rowIndex * this.config.cellSize;

        this.ctx.fillStyle = this.getColorForValue(value);
        this.ctx.fillRect(x, y, this.config.cellSize, this.config.cellSize);

        // Add border for better visibility
        if (value > 0) {
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, this.config.cellSize, this.config.cellSize);
        }
      });
    });

    // Update legend values
    this.updateLegendValues();
  }

  private updateLegendValues(): void {
    const minLabel = this.element?.querySelector('.legend-min') as HTMLElement;
    const maxLabel = this.element?.querySelector('.legend-max') as HTMLElement;

    if (minLabel) minLabel.textContent = this.minValue.toString();
    if (maxLabel) maxLabel.textContent = this.maxValue.toString();
  }

  /**
   * Clear heatmap data
   */
  clear(): void {
    this.data = this.data.map(row => row.fill(0));
    this.maxValue = 0;
    this.minValue = 0;
    this.render();
  }

  /**
   * Get data at specific cell
   */
  getDataAt(x: number, y: number): number {
    const cellX = Math.floor(x / this.config.cellSize);
    const cellY = Math.floor(y / this.config.cellSize);

    ifPattern(cellY >= 0 && cellY < this.data.length && cellX >= 0 && cellX < this.data[cellY].length, () => { return this.data[cellY][cellX];
     });

    return 0;
  }

  /**
   * Resize heatmap
   */
  resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    // Reinitialize data grid
    const cols = Math.ceil(width / this.config.cellSize);
    const rows = Math.ceil(height / this.config.cellSize);

    this.data = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(0));
    this.render();
  }
}

/**
 * Population Density Heatmap - Specialized for organism population density
 */
export class PopulationDensityHeatmap extends HeatmapComponent {
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(canvasWidth: number, canvasHeight: number, id?: string) {
    super(
      {
        width: canvasWidth,
        height: canvasHeight,
        cellSize: 20,
        title: 'Population Density',
        colorScheme: [
          '#1a1a2e', // Very dark (no population)
          '#16213e', // Dark blue
          '#0f4c75', // Blue
          '#3282b8', // Light blue
          '#bbe1fa', // Very light blue
          '#ffeb3b', // Yellow
          '#ff9800', // Orange
          '#f44336', // Red (high density)
        ],
        onCellClick: (x, y, value) => {
          has ${value} organisms`);
        },
      },
      id
    );
  }

  /**
   * Start automatic updates
   */
  startAutoUpdate(getPositions: () => { x: number; y: number }[], interval: number = 2000): void {
    this.stopAutoUpdate();

    this.updateInterval = setInterval(() => {
      const positions = getPositions();
      this.updateFromPositions(positions);
    }, interval);
  }

  /**
   * Stop automatic updates
   */
  stopAutoUpdate(): void {
    ifPattern(this.updateInterval, () => { clearInterval(this.updateInterval);
      this.updateInterval = null;
     });
  }

  public unmount(): void {
    this.stopAutoUpdate();
    super.unmount();
  }
}

// WebGL context cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && gl.getExtension) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } // TODO: Consider extracting to reduce closure scope
    });
  });
}