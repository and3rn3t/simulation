import type { OrganismType } from "../models/organismTypes";
import { ErrorHandler, ErrorSeverity, OrganismError, CanvasError } from '../utils/system/errorHandler';
import { log } from '../utils/system/logger';

/**
 * Represents an individual organism in the simulation
 * @class Organism
 */
export class Organism {
  /** X position on the canvas */
  x: number;
  /** Y position on the canvas */
  y: number;
  /** Current age of the organism */
  age: number;
  /** Type definition for this organism */
  type: OrganismType;
  /** Whether this organism has reproduced */
  reproduced: boolean;

  /**
   * Creates a new organism
   * @param x - Initial X position
   * @param y - Initial Y position
   * @param type - The organism type definition
   */
  constructor(x: number, y: number, type: OrganismType) {
    try {
      if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        throw new OrganismError('Invalid position coordinates provided');
      }
      
      if (!type) {
        throw new OrganismError('Organism type is required');
      }
      
      this.x = x;
      this.y = y;
      this.age = 0;
      this.type = type;
      this.reproduced = false;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new OrganismError('Failed to create organism'),
        ErrorSeverity.HIGH,
        'Organism constructor'
      );
      throw error; // Re-throw to prevent invalid organism state
    }
  }

  /**
   * Updates the organism's state each frame
   * @param deltaTime - Time elapsed since last update
   * @param canvasWidth - Width of the canvas for boundary checking
   * @param canvasHeight - Height of the canvas for boundary checking
   */
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    try {
      if (deltaTime < 0 || isNaN(deltaTime)) {
        throw new OrganismError('Invalid deltaTime provided');
      }
      
      if (canvasWidth <= 0 || canvasHeight <= 0) {
        throw new OrganismError('Invalid canvas dimensions provided');
      }
      
      this.age += deltaTime;

      // Simple random movement
      this.x += (Math.random() - 0.5) * 2;
      this.y += (Math.random() - 0.5) * 2;

      // Keep within bounds
      const size = this.type.size;
      this.x = Math.max(size, Math.min(canvasWidth - size, this.x));
      this.y = Math.max(size, Math.min(canvasHeight - size, this.y));
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new OrganismError('Failed to update organism'),
        ErrorSeverity.MEDIUM,
        'Organism update'
      );
      // Don't re-throw; allow organism to continue with current state
    }
  }

  /**
   * Checks if the organism can reproduce
   * @returns True if the organism can reproduce, false otherwise
   */
  canReproduce(): boolean {
    try {
      return this.age > 20 && !this.reproduced && Math.random() < this.type.growthRate * 0.01;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new OrganismError('Failed to check reproduction'),
        ErrorSeverity.LOW,
        'Organism reproduction check'
      );
      return false; // Safe fallback
    }
  }

  /**
   * Checks if the organism should die
   * @returns True if the organism should die, false otherwise
   */
  shouldDie(): boolean {
    try {
      return this.age > this.type.maxAge || Math.random() < this.type.deathRate * 0.001;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new OrganismError('Failed to check death condition'),
        ErrorSeverity.LOW,
        'Organism death check'
      );
      return false; // Safe fallback - keep organism alive
    }
  }

  /**
   * Creates a new organism through reproduction
   * @returns A new organism instance
   */
  reproduce(): Organism {
    try {
      this.reproduced = true;
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      const newOrganism = new Organism(this.x + offsetX, this.y + offsetY, this.type);
      
      // Log reproduction events for long-lived organisms
      if (this.age > 50) {
        log.logOrganism('Long-lived organism reproduced', {
          parentAge: this.age,
          organismType: this.type.name,
          position: { x: this.x, y: this.y }
        });
      }
      
      return newOrganism;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new OrganismError('Failed to reproduce organism'),
        ErrorSeverity.MEDIUM,
        'Organism reproduction'
      );
      throw error; // Re-throw to prevent invalid reproduction
    }
  }

  /**
   * Draws the organism on the canvas
   * @param ctx - Canvas 2D rendering context
   */
  draw(ctx: CanvasRenderingContext2D): void {
    try {
      if (!ctx) {
        throw new CanvasError('Canvas context is required for drawing');
      }
      
      ctx.fillStyle = this.type.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.type.size, 0, Math.PI * 2);
      ctx.fill();
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new CanvasError('Failed to draw organism'),
        ErrorSeverity.MEDIUM,
        'Organism drawing'
      );
      // Don't re-throw; allow simulation to continue without this organism being drawn
    }
  }
}
