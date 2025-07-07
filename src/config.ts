export interface SimulationConfig {
  maxPopulation: number;
  frameRate: number;
  initialPopulation: number;
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  reproductionAge: number;
  movementSpeed: number;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  maxPopulation: 1000,
  frameRate: 60,
  initialPopulation: 5,
  canvasWidth: 800,
  canvasHeight: 500,
  gridSize: 50,
  reproductionAge: 20,
  movementSpeed: 2
};

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private updateCount = 0;
  private renderCount = 0;
  
  update(): void {
    this.updateCount++;
  }
  
  render(): void {
    this.renderCount++;
  }
  
  tick(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // Reset counters
      this.updateCount = 0;
      this.renderCount = 0;
    }
  }
  
  getFPS(): number {
    return this.fps;
  }
}
