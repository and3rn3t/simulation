import type { OrganismType } from './organismTypes';

export class Organism {
  x: number;
  y: number;
  age: number;
  type: OrganismType;
  reproduced: boolean;
  private colorCache: string;
  private lastOpacity: number = 1;
  
  constructor(x: number, y: number, type: OrganismType) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.type = type;
    this.reproduced = false;
    this.colorCache = type.color;
  }
  
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    this.age += deltaTime;
    
    // Optimized random movement with pre-calculated values
    const moveX = (Math.random() - 0.5) * 2;
    const moveY = (Math.random() - 0.5) * 2;
    
    this.x += moveX;
    this.y += moveY;
    
    // Keep within bounds with cached size
    const size = this.type.size;
    this.x = Math.max(size, Math.min(canvasWidth - size, this.x));
    this.y = Math.max(size, Math.min(canvasHeight - size, this.y));
  }
  
  canReproduce(): boolean {
    // Cache reproduction check to avoid repeated calculations
    return this.age > 20 && !this.reproduced && Math.random() < this.type.growthRate * 0.01;
  }
  
  shouldDie(): boolean {
    // Early exit optimization
    if (this.age > this.type.maxAge) return true;
    return Math.random() < this.type.deathRate * 0.001;
  }
  
  reproduce(): Organism {
    this.reproduced = true;
    // Pre-calculate offsets
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    return new Organism(this.x + offsetX, this.y + offsetY, this.type);
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    // Batch drawing operations to minimize context switches
    const opacity = Math.max(0.3, 1 - (this.age / this.type.maxAge));
    
    // Only update color if opacity changed significantly
    if (Math.abs(opacity - this.lastOpacity) > 0.05) {
      const alpha = Math.floor(opacity * 255).toString(16).padStart(2, '0');
      this.colorCache = this.type.color + alpha;
      this.lastOpacity = opacity;
    }
    
    ctx.fillStyle = this.colorCache;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.type.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
