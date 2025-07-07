import type { OrganismType } from "./organismTypes";

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
    this.x = x;
    this.y = y;
    this.age = 0;
    this.type = type;
    this.reproduced = false;
  }

  /**
   * Updates the organism's state each frame
   * @param deltaTime - Time elapsed since last update
   * @param canvasWidth - Width of the canvas for boundary checking
   * @param canvasHeight - Height of the canvas for boundary checking
   */
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    this.age += deltaTime;

    // Simple random movement
    this.x += (Math.random() - 0.5) * 2;
    this.y += (Math.random() - 0.5) * 2;

    // Keep within bounds
    const size = this.type.size;
    this.x = Math.max(size, Math.min(canvasWidth - size, this.x));
    this.y = Math.max(size, Math.min(canvasHeight - size, this.y));
  }

  /**
   * Checks if the organism can reproduce
   * @returns True if the organism can reproduce, false otherwise
   */
  canReproduce(): boolean {
    return this.age > 20 && !this.reproduced && Math.random() < this.type.growthRate * 0.01;
  }

  /**
   * Checks if the organism should die
   * @returns True if the organism should die, false otherwise
   */
  shouldDie(): boolean {
    return this.age > this.type.maxAge || Math.random() < this.type.deathRate * 0.001;
  }

  /**
   * Creates a new organism through reproduction
   * @returns A new organism instance
   */
  reproduce(): Organism {
    this.reproduced = true;
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    return new Organism(this.x + offsetX, this.y + offsetY, this.type);
  }

  /**
   * Draws the organism on the canvas
   * @param ctx - Canvas 2D rendering context
   */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.type.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.type.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
