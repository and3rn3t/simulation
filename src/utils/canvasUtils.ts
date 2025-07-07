/**
 * Utility functions for canvas operations and rendering
 */

/**
 * Canvas configuration constants
 */
export const CANVAS_CONFIG = {
  BACKGROUND_COLOR: '#1a1a1a',
  GRID_COLOR: '#333',
  GRID_SIZE: 50,
  GRID_LINE_WIDTH: 0.5,
  INSTRUCTION_COLOR: 'rgba(255, 255, 255, 0.8)',
  INSTRUCTION_SUB_COLOR: 'rgba(255, 255, 255, 0.6)',
  PREVIEW_ALPHA: 0.5
} as const;

/**
 * Canvas utility class for common rendering operations
 * @class CanvasUtils
 */
export class CanvasUtils {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  /**
   * Clears the entire canvas with background color
   */
  clear(): void {
    this.ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws a grid on the canvas
   */
  drawGrid(): void {
    this.ctx.strokeStyle = CANVAS_CONFIG.GRID_COLOR;
    this.ctx.lineWidth = CANVAS_CONFIG.GRID_LINE_WIDTH;
    this.ctx.beginPath();

    // Draw vertical lines
    for (let x = 0; x <= this.canvas.width; x += CANVAS_CONFIG.GRID_SIZE) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.canvas.height; y += CANVAS_CONFIG.GRID_SIZE) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }

    this.ctx.stroke();
  }

  /**
   * Draws placement instructions on the canvas
   */
  drawPlacementInstructions(): void {
    this.clear();
    this.drawGrid();

    // Main instruction
    this.ctx.fillStyle = CANVAS_CONFIG.INSTRUCTION_COLOR;
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Click on the canvas to place organisms',
      this.canvas.width / 2,
      this.canvas.height / 2 - 20
    );

    // Sub instruction
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = CANVAS_CONFIG.INSTRUCTION_SUB_COLOR;
    this.ctx.fillText(
      'Click "Start" when ready to begin the simulation',
      this.canvas.width / 2,
      this.canvas.height / 2 + 20
    );
  }

  /**
   * Draws a preview organism at the specified position
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param color - Organism color
   * @param size - Organism size
   */
  drawPreviewOrganism(x: number, y: number, color: string, size: number): void {
    this.ctx.save();
    this.ctx.globalAlpha = CANVAS_CONFIG.PREVIEW_ALPHA;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Gets mouse coordinates relative to canvas
   * @param event - Mouse event
   * @returns Coordinates object
   */
  getMouseCoordinates(event: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}
