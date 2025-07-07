import { Organism } from './organism';
import type { OrganismType } from './organismTypes';
import { ACHIEVEMENTS, CHALLENGES, type Achievement, type GameStats } from './gameSystem';
import { UNLOCKABLE_ORGANISMS } from './unlockables';

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
  private maxPopulation = 1000;
  
  // Additional stats tracking
  private birthsThisSecond = 0;
  private deathsThisSecond = 0;
  private totalBirths = 0;
  private totalDeaths = 0;
  private lastStatsUpdate = 0;
  
  // Game system
  private score = 0;
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  private maxPopulationReached = 0;
  
  constructor(canvas: HTMLCanvasElement, initialOrganismType: OrganismType) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.selectedOrganismType = initialOrganismType;
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
    
    // Reset additional stats
    this.birthsThisSecond = 0;
    this.deathsThisSecond = 0;
    this.totalBirths = 0;
    this.totalDeaths = 0;
    this.lastStatsUpdate = 0;
    
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
  
  // New method to get organism type by ID (including unlockable ones)
  getOrganismTypeById(id: string): OrganismType | null {
    // Check unlockable organisms first
    const unlockableOrganism = UNLOCKABLE_ORGANISMS.find(org => org.id === id);
    if (unlockableOrganism && unlockableOrganism.unlocked) {
      return unlockableOrganism;
    }
    
    // Return null if not found or not unlocked
    return null;
  }
  
  setMaxPopulation(limit: number): void {
    this.maxPopulation = limit;
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
    const currentTime = Date.now();
    
    // Reset per-second counters every second
    if (currentTime - this.lastStatsUpdate >= 1000) {
      this.birthsThisSecond = 0;
      this.deathsThisSecond = 0;
      this.lastStatsUpdate = currentTime;
    }
    
    // Update existing organisms (backwards to allow safe removal)
    for (let i = this.organisms.length - 1; i >= 0; i--) {
      const organism = this.organisms[i];
      organism.update(deltaTime, this.canvas.width, this.canvas.height);
      
      // Check for reproduction
      if (organism.canReproduce() && this.organisms.length < this.maxPopulation) {
        newOrganisms.push(organism.reproduce());
        this.generation++;
        this.birthsThisSecond++;
        this.totalBirths++;
      }
      
      // Check for death
      if (organism.shouldDie()) {
        this.organisms.splice(i, 1);
        this.deathsThisSecond++;
        this.totalDeaths++;
      }
    }
    
    // Add new organisms
    this.organisms.push(...newOrganisms);
    
    // Track max population
    this.maxPopulationReached = Math.max(this.maxPopulationReached, this.organisms.length);
    
    // Update score based on population and survival
    this.updateScore();
    
    // Check achievements
    this.checkAchievements();
    
    // Limit population
    if (this.organisms.length > this.maxPopulation) {
      const removed = this.organisms.length - this.maxPopulation;
      this.organisms.splice(0, removed);
      this.totalDeaths += removed;
    }
  }
  
  private draw(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw organisms
    this.organisms.forEach(organism => organism.draw(this.ctx));
    
    // Show placement instructions if in placement mode and no organisms
    if (this.placementMode && this.organisms.length === 0) {
      this.showPlacementInstructions();
    }
  }
  
  private updateStats(): void {
    const populationElement = document.getElementById('population-count');
    const generationElement = document.getElementById('generation-count');
    const timeElement = document.getElementById('time-elapsed');
    const birthRateElement = document.getElementById('birth-rate');
    const deathRateElement = document.getElementById('death-rate');
    const avgAgeElement = document.getElementById('avg-age');
    const oldestElement = document.getElementById('oldest-organism');
    const densityElement = document.getElementById('population-density');
    const stabilityElement = document.getElementById('population-stability');
    const scoreElement = document.getElementById('score');
    const achievementCountElement = document.getElementById('achievement-count');
    
    if (populationElement) {
      populationElement.textContent = this.organisms.length.toString();
    }
    
    if (generationElement) {
      generationElement.textContent = this.generation.toString();
    }
    
    if (timeElement) {
      const elapsed = this.getElapsedTime();
      timeElement.textContent = `${elapsed}s`;
    }
    
    // Birth rate (births per second)
    if (birthRateElement) {
      birthRateElement.textContent = this.birthsThisSecond.toString();
    }
    
    // Death rate (deaths per second)
    if (deathRateElement) {
      deathRateElement.textContent = this.deathsThisSecond.toString();
    }
    
    // Average age
    if (avgAgeElement) {
      const avgAge = Math.round(this.getAverageAge());
      avgAgeElement.textContent = avgAge.toString();
    }
    
    // Oldest organism
    if (oldestElement) {
      const oldest = Math.round(this.getOldestAge());
      oldestElement.textContent = oldest.toString();
    }
    
    // Population density (organisms per 1000 square pixels)
    if (densityElement) {
      const area = this.canvas.width * this.canvas.height;
      const density = Math.round((this.organisms.length / area) * 1000);
      densityElement.textContent = density.toString();
    }
    
    // Population stability (birth/death ratio)
    if (stabilityElement) {
      const ratio = this.totalDeaths > 0 ? (this.totalBirths / this.totalDeaths).toFixed(2) : 'N/A';
      stabilityElement.textContent = ratio.toString();
    }
    
    // Score
    if (scoreElement) {
      scoreElement.textContent = this.score.toString();
    }
    
    // Achievement count
    if (achievementCountElement) {
      const unlockedCount = this.achievements.filter(a => a.unlocked).length;
      achievementCountElement.textContent = `${unlockedCount}/${this.achievements.length}`;
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
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    
    // Draw vertical lines
    for (let x = 0; x <= this.canvas.width; x += 50) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= this.canvas.height; y += 50) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
    }
    
    this.ctx.stroke();
  }
  
  private updateScore(): void {
    // Calculate score based on various factors
    const populationBonus = this.organisms.length * 2;
    const survivalBonus = Math.floor(this.getElapsedTime() / 10);
    const generationBonus = this.generation;
    
    this.score = populationBonus + survivalBonus + generationBonus;
  }
  
  private checkAchievements(): void {
    const stats: GameStats = {
      population: this.organisms.length,
      generation: this.generation,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
      maxPopulation: this.maxPopulationReached,
      timeElapsed: this.getElapsedTime(),
      averageAge: this.getAverageAge(),
      oldestAge: this.getOldestAge(),
      score: this.score
    };
    
    for (const achievement of this.achievements) {
      if (!achievement.unlocked && achievement.condition(stats)) {
        achievement.unlocked = true;
        this.score += achievement.points;
        this.showAchievementNotification(achievement);
      }
    }
  }
  
  private getElapsedTime(): number {
    return this.isRunning ? 
      Math.floor((Date.now() - this.startTime) / 1000) : 
      Math.floor(this.pausedTime / 1000);
  }
  
  private getAverageAge(): number {
    return this.organisms.length > 0 ? 
      this.organisms.reduce((sum, org) => sum + org.age, 0) / this.organisms.length : 0;
  }
  
  private getOldestAge(): number {
    return this.organisms.length > 0 ? 
      Math.max(...this.organisms.map(org => org.age)) : 0;
  }
  
  private showAchievementNotification(achievement: Achievement): void {
    // Create achievement notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-content">
        <span class="achievement-icon">${achievement.icon}</span>
        <div class="achievement-text">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
          <div class="achievement-points">+${achievement.points} points</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 4000);
  }
  
  startChallenge(): void {
    if (CHALLENGES.length > 0) {
      const availableChallenges = CHALLENGES.filter(c => !c.completed);
      if (availableChallenges.length > 0) {
        // For now, just log that a challenge was started
        console.log('Challenge started:', availableChallenges[0].name);
      }
    }
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
