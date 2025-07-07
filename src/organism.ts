import type { OrganismType } from "./organismTypes";

export class Organism {
  x: number;
  y: number;
  age: number;
  type: OrganismType;
  reproduced: boolean;

  constructor(x: number, y: number, type: OrganismType) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.type = type;
    this.reproduced = false;
  }

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

  canReproduce(): boolean {
    return this.age > 20 && !this.reproduced && Math.random() < this.type.growthRate * 0.01;
  }

  shouldDie(): boolean {
    return this.age > this.type.maxAge || Math.random() < this.type.deathRate * 0.001;
  }

  reproduce(): Organism {
    this.reproduced = true;
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    return new Organism(this.x + offsetX, this.y + offsetY, this.type);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.type.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.type.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
