import type { OrganismType } from './organismTypes';

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
  
  update(deltaTime: number): void {
    this.age += deltaTime;
    
    // Random movement
    this.x += (Math.random() - 0.5) * 2;
    this.y += (Math.random() - 0.5) * 2;
    
    // Keep within bounds
    this.x = Math.max(this.type.size, Math.min(800 - this.type.size, this.x));
    this.y = Math.max(this.type.size, Math.min(500 - this.type.size, this.y));
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
    
    // Draw age indicator (opacity based on age)
    const opacity = Math.max(0.3, 1 - (this.age / this.type.maxAge));
    ctx.fillStyle = this.type.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
    ctx.fill();
  }
}
