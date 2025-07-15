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
/**
 * Utility functions for canvas operations and rendering
 */

import { ErrorHandler, ErrorSeverity, CanvasError } from '../system/errorHandler';

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
  PREVIEW_ALPHA: 0.5,
} as const;

/**
 * Canvas utility class for common rendering operations
 * @class CanvasUtils
 */
export class CanvasUtils {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    try {
      if (!canvas) {
        throw new CanvasError('Canvas element is required');
      }

      this.canvas = canvas;

      const ctx = canvas?.getContext('2d');
      if (!ctx) {
        throw new CanvasError('Failed to get 2D rendering context');
      }
      this.ctx = ctx;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new CanvasError('Failed to initialize CanvasUtils'),
        ErrorSeverity.CRITICAL,
        'CanvasUtils constructor'
      );
      throw error; // Re-throw to prevent invalid state
    }
  }

  /**
   * Clears the entire canvas with background color
   */
  clear(): void {
    try {
      this.ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } catch {
      /* handled */
    }
  }

  /**
   * Draws a grid on the canvas
   */
  drawGrid(): void {
    try {
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
    } catch {
      /* handled */
    }
  }

  /**
   * Draws placement instructions on the canvas
   */
  drawPlacementInstructions(): void {
    try {
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
    } catch {
      /* handled */
    }
  }

  /**
   * Draws a preview organism at the specified position
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param color - Organism color
   * @param size - Organism size
   */
  drawPreviewOrganism(x: number, y: number, color: string, size: number): void {
    try {
      if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        throw new CanvasError('Invalid coordinates provided for preview organism');
      }

      if (typeof size !== 'number' || size <= 0) {
        throw new CanvasError('Invalid size provided for preview organism');
      }

      this.ctx.save();
      this.ctx.globalAlpha = CANVAS_CONFIG.PREVIEW_ALPHA;
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    } catch {
      /* handled */
    }
  }

  /**
   * Gets mouse coordinates relative to canvas
   * @param event - Mouse event
   * @returns Coordinates object
   */
  getMouseCoordinates(event: MouseEvent): { x: number; y: number } {
    try {
      if (!event) {
        throw new CanvasError('Mouse event is required');
      }

      const rect = this.canvas.getBoundingClientRect();
      return {
        x: event?.clientX - rect.left,
        y: event?.clientY - rect.top,
      };
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new CanvasError('Failed to get mouse coordinates'),
        ErrorSeverity.MEDIUM,
        'Canvas mouse coordinates'
      );
      // Return fallback coordinates
      return { x: 0, y: 0 };
    }
  }

  /**
   * Gets touch coordinates relative to canvas
   * @param event - Touch event
   * @returns Coordinates object
   */
  getTouchCoordinates(event: TouchEvent): { x: number; y: number } {
    try {
      if (!event || !event?.touches || event?.touches.length === 0) {
        throw new CanvasError('Touch event with touches is required');
      }

      const rect = this.canvas.getBoundingClientRect();
      const touch = event?.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new CanvasError('Failed to get touch coordinates'),
        ErrorSeverity.MEDIUM,
        'Canvas touch coordinates'
      );
      // Return fallback coordinates
      return { x: 0, y: 0 };
    }
  }

  /**
   * Gets coordinates from either mouse or touch event
   * @param event - Mouse or touch event
   * @returns Coordinates object
   */
  getEventCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
    try {
      if (event instanceof MouseEvent) {
        return this.getMouseCoordinates(event);
      } else if (event instanceof TouchEvent) {
        return this.getTouchCoordinates(event);
      } else {
        throw new CanvasError('Event must be MouseEvent or TouchEvent');
      }
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new CanvasError('Failed to get event coordinates'),
        ErrorSeverity.MEDIUM,
        'Canvas event coordinates'
      );
      // Return fallback coordinates
      return { x: 0, y: 0 };
    }
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
