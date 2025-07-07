import { Organism } from './organism';
import type { OrganismType } from './organismTypes';

export class OrganismSimulation {
  private organisms: Organism[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isRunning = false;
  private speed = 5;
  private startTime = 0;
  private pausedTime = 0;
  private generation = 0;
  private selectedOrganismType: OrganismType;
  private placementMode = true;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;
  private maxPopulation = 1000;
  
  // Pre-allocated arrays for better memory management
  private newOrganisms: Organism[] = [];
  private toRemove: number[] = [];
  
  // Canvas caching
  private canvasWidth: number;
  private canvasHeight: number;
  
  constructor(canvas: HTMLCanvasElement, initialOrganismType: OrganismType) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.selectedOrganismType = initialOrganismType;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.setupCanvasEvents();
    this.clearCanvas();
    this.showPlacementInstructions();
  }
  
  private initializePopulation(): void {
    this.organisms = [];
    // Start with a few organisms
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (this.canvas.width - 20) + 10;
      const y = Math.random() * (this.canvas.height - 20) + 10;
      this.organisms.push(new Organism(x, y, this.selectedOrganismType));
    }
  }
  
  start(): void {
    if (this.placementMode) {
      // If no organisms were placed, add a few default ones
      if (this.organisms.length === 0) {
        this.initializePopulation();
      }
      this.placementMode = false;
    }
    
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.pausedTime;
      this.animate();
    }
  }
  
  pause(): void {
    this.isRunning = false;
    this.pausedTime = Date.now() - this.startTime;
  }
  
  reset(): void {
    this.isRunning = false;
    this.placementMode = true;
    this.startTime = 0;
    this.pausedTime = 0;
    this.generation = 0;
    this.organisms = [];
    this.showPlacementInstructions();
    this.updateStats();
  }
  
  clear(): void {
    this.organisms = [];
    this.generation = 0;
    this.showPlacementInstructions();
    this.updateStats();
  }
  
  setSpeed(speed: number): void {
    this.speed = speed;
  }
  
  setOrganismType(type: OrganismType): void {
    this.selectedOrganismType = type;
    if (this.placementMode) {
      // Keep existing organisms, just change the type for new placements
      this.draw();
    } else {
      // If simulation is running, reset with new type
      this.reset();
    }
  }
  
  setMaxPopulation(limit: number): void {
    this.maxPopulation = limit;
  }
  
  private animate(): void {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Limit frame rate to 60 FPS for better performance
    if (deltaTime >= 16.67) {
      this.update();
      this.draw();
      this.updateStats();
      this.lastFrameTime = currentTime;
      
      // Calculate FPS
      this.frameCount++;
      if (this.frameCount % 60 === 0) {
        this.fps = Math.round(1000 / deltaTime);
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  private update(): void {
    const deltaTime = this.speed * 0.1;
    
    // Clear reusable arrays
    this.newOrganisms.length = 0;
    this.toRemove.length = 0;
    
    // Update existing organisms with optimized loop
    for (let i = 0; i < this.organisms.length; i++) {
      const organism = this.organisms[i];
      organism.update(deltaTime, this.canvasWidth, this.canvasHeight);
      
      // Check for reproduction
      if (organism.canReproduce() && this.organisms.length < this.maxPopulation) {
        this.newOrganisms.push(organism.reproduce());
        this.generation++;
      }
      
      // Check for death - collect indices to remove
      if (organism.shouldDie()) {
        this.toRemove.push(i);
      }
    }
    
    // Remove dead organisms in reverse order to maintain indices
    for (let i = this.toRemove.length - 1; i >= 0; i--) {
      const index = this.toRemove[i];
      this.organisms.splice(index, 1);
    }
    
    // Add new organisms
    if (this.newOrganisms.length > 0) {
      this.organisms.push(...this.newOrganisms);
      
      // Limit population to prevent performance issues
      if (this.organisms.length > this.maxPopulation) {
        this.organisms.splice(0, this.organisms.length - this.maxPopulation);
      }
    }
  }
  
  private draw(): void {
    // Clear canvas with a single operation
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw grid (cached)
    this.drawGrid();
    
    // Batch similar organisms for optimized drawing
    const organismsByType = new Map<OrganismType, Organism[]>();
    
    for (const organism of this.organisms) {
      const type = organism.type;
      if (!organismsByType.has(type)) {
        organismsByType.set(type, []);
      }
      organismsByType.get(type)!.push(organism);
    }
    
    // Draw organisms grouped by type to minimize context switches
    for (const [type, organisms] of organismsByType) {
      this.ctx.fillStyle = type.color;
      this.ctx.beginPath();
      
      for (const organism of organisms) {
        this.ctx.moveTo(organism.x + type.size, organism.y);
        this.ctx.arc(organism.x, organism.y, type.size, 0, Math.PI * 2);
      }
      this.ctx.fill();
    }
    
    // Show placement instructions if in placement mode and no organisms
    if (this.placementMode && this.organisms.length === 0) {
      this.showPlacementInstructions();
    }
  }
  
  private updateStats(): void {
    const populationElement = document.getElementById('population-count');
    const generationElement = document.getElementById('generation-count');
    const timeElement = document.getElementById('time-elapsed');
    const fpsElement = document.getElementById('fps-count');
    
    if (populationElement) {
      populationElement.textContent = this.organisms.length.toString();
    }
    
    if (generationElement) {
      generationElement.textContent = this.generation.toString();
    }
    
    if (timeElement) {
      const elapsed = this.isRunning ? 
        Math.floor((Date.now() - this.startTime) / 1000) : 
        Math.floor(this.pausedTime / 1000);
      timeElement.textContent = `${elapsed}s`;
    }
    
    if (fpsElement) {
      fpsElement.textContent = `${this.fps} FPS`;
    }
  }
  
  private setupCanvasEvents(): void {
    this.canvas.addEventListener('click', (event) => {
      if (this.placementMode) {
        this.placeOrganism(event);
      }
    });
    
    this.canvas.addEventListener('mousemove', (event) => {
      if (this.placementMode) {
        this.showPreview(event);
      }
    });
  }
  
  private placeOrganism(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Add organism at clicked position
    this.organisms.push(new Organism(x, y, this.selectedOrganismType));
    this.draw();
  }
  
  private showPreview(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Redraw canvas with preview
    this.draw();
    
    // Draw preview organism
    this.ctx.save();
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = this.selectedOrganismType.color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.selectedOrganismType.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
  
  private clearCanvas(): void {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
  }
  
  private showPlacementInstructions(): void {
    this.clearCanvas();
    
    // Draw instructions
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Click on the canvas to place organisms', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    this.ctx.font = '14px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fillText('Click "Start" when ready to begin the simulation', this.canvas.width / 2, this.canvas.height / 2 + 20);
  }
  
  private drawGrid(): void {
    // Use a more efficient grid drawing method
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    
    // Draw vertical lines
    for (let x = 0; x <= this.canvasWidth; x += 50) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= this.canvasHeight; y += 50) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
    }
    
    this.ctx.stroke();
  }
  
  getStats() {
    return {
      population: this.organisms.length,
      generation: this.generation,
      isRunning: this.isRunning,
      placementMode: this.placementMode
    };
  }
}
