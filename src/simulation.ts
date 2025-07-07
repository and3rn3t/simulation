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
  
  constructor(canvas: HTMLCanvasElement, initialOrganismType: OrganismType) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.selectedOrganismType = initialOrganismType;
    this.initializePopulation();
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
    this.startTime = 0;
    this.pausedTime = 0;
    this.generation = 0;
    this.initializePopulation();
    this.draw();
  }
  
  setSpeed(speed: number): void {
    this.speed = speed;
  }
  
  setOrganismType(type: OrganismType): void {
    this.selectedOrganismType = type;
    this.reset();
  }
  
  private animate(): void {
    if (!this.isRunning) return;
    
    this.update();
    this.draw();
    this.updateStats();
    
    requestAnimationFrame(() => this.animate());
  }
  
  private update(): void {
    const deltaTime = this.speed * 0.1;
    const newOrganisms: Organism[] = [];
    
    // Update existing organisms
    for (let i = this.organisms.length - 1; i >= 0; i--) {
      const organism = this.organisms[i];
      organism.update(deltaTime);
      
      // Check for reproduction
      if (organism.canReproduce()) {
        newOrganisms.push(organism.reproduce());
        this.generation++;
      }
      
      // Check for death
      if (organism.shouldDie()) {
        this.organisms.splice(i, 1);
      }
    }
    
    // Add new organisms
    this.organisms.push(...newOrganisms);
    
    // Limit population to prevent performance issues
    if (this.organisms.length > 1000) {
      this.organisms = this.organisms.slice(-1000);
    }
  }
  
  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    // Draw organisms
    this.organisms.forEach(organism => organism.draw(this.ctx));
  }
  
  private updateStats(): void {
    const populationElement = document.getElementById('population-count');
    const generationElement = document.getElementById('generation-count');
    const timeElement = document.getElementById('time-elapsed');
    
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
  }
  
  getStats() {
    return {
      population: this.organisms.length,
      generation: this.generation,
      isRunning: this.isRunning
    };
  }
}
