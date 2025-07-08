import { Organism } from './organism';
import type { OrganismType } from './organismTypes';
import { ACHIEVEMENTS, CHALLENGES, type Achievement, type GameStats } from './gameSystem';
import { UNLOCKABLE_ORGANISMS } from './unlockables';
import { CanvasUtils } from './utils/canvasUtils';
import { showNotification } from './utils/domHelpers';
import { 
  ErrorHandler, 
  ErrorSeverity, 
  CanvasError, 
  ConfigurationError
} from './utils/errorHandler';

/**
 * Main simulation class that manages organisms, rendering, and game state
 * @class OrganismSimulation
 */
export class OrganismSimulation {
  /** Array of all organisms in the simulation */
  private organisms: Organism[] = [];
  /** HTML canvas element for rendering */
  private canvas: HTMLCanvasElement;
  /** Canvas 2D rendering context */
  private ctx: CanvasRenderingContext2D;
  /** Canvas utilities for rendering operations */
  private canvasUtils: CanvasUtils;
  /** Whether the simulation is currently running */
  private isRunning = false;
  /** Simulation speed multiplier */
  private speed = 5;
  /** Timestamp when simulation started */
  private startTime = 0;
  /** Total time spent paused */
  private pausedTime = 0;
  /** Current generation number */
  private generation = 0;
  /** Currently selected organism type for placement */
  private selectedOrganismType: OrganismType;
  /** Whether the simulation is in placement mode */
  private placementMode = true;
  /** Maximum allowed population */
  private maxPopulation = 1000;
  
  // Additional stats tracking
  /** Number of births in the current second */
  private birthsThisSecond = 0;
  /** Number of deaths in the current second */
  private deathsThisSecond = 0;
  /** Total births since simulation started */
  private totalBirths = 0;
  /** Total deaths since simulation started */
  private totalDeaths = 0;
  /** Timestamp of last stats update */
  private lastStatsUpdate = 0;
  
  // Game system
  /** Current player score */
  private score = 0;
  /** Array of achievements with their states */
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  /** Maximum population ever reached */
  private maxPopulationReached = 0;
  
  /**
   * Creates a new simulation instance
   * @param canvas - HTML canvas element for rendering
   * @param initialOrganismType - Initial organism type to use
   */
  constructor(canvas: HTMLCanvasElement, initialOrganismType: OrganismType) {
    try {
      if (!canvas) {
        throw new CanvasError('Canvas element is required');
      }
      
      if (!initialOrganismType) {
        throw new ConfigurationError('Initial organism type is required');
      }

      this.canvas = canvas;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new CanvasError('Failed to get 2D rendering context from canvas');
      }
      this.ctx = ctx;
      
      this.canvasUtils = new CanvasUtils(canvas);
      this.selectedOrganismType = initialOrganismType;
      
      this.setupCanvasEvents();
      this.canvasUtils.drawPlacementInstructions();
      
      console.log('OrganismSimulation initialized successfully');
    } catch (error) {
      const errorHandler = ErrorHandler.getInstance();
      errorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.CRITICAL,
        'OrganismSimulation constructor'
      );
      throw error; // Re-throw to prevent invalid simulation state
    }
  }
  
  /**
   * Initializes the population with a few default organisms
   * @private
   */
  private initializePopulation(): void {
    this.organisms = [];
    // Start with a few organisms
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (this.canvas.width - 20) + 10;
      const y = Math.random() * (this.canvas.height - 20) + 10;
      this.organisms.push(new Organism(x, y, this.selectedOrganismType));
    }
  }
  
  /**
   * Starts the simulation
   */
  start(): void {
    try {
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
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.HIGH,
        'Starting simulation'
      );
      // Don't re-throw to allow graceful degradation
    }
  }
  
  /**
   * Pauses the simulation
   */
  pause(): void {
    try {
      this.isRunning = false;
      this.pausedTime = Date.now() - this.startTime;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Pausing simulation'
      );
    }
  }
    /**
   * Resets the simulation to initial state
   */
  reset(): void {
    try {
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
      
      this.canvasUtils.drawPlacementInstructions();
      this.updateStats();
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Resetting simulation'
      );
    }
  }

  /**
   * Clears all organisms from the simulation
   */
  clear(): void {
    try {
      this.organisms = [];
      this.generation = 0;
      this.canvasUtils.drawPlacementInstructions();
      this.updateStats();
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Clearing simulation'
      );
    }
  }
  
  /**
   * Sets the simulation speed
   * @param speed - Speed multiplier (1-10)
   */
  setSpeed(speed: number): void {
    try {
      if (speed < 1 || speed > 10) {
        throw new ConfigurationError('Speed must be between 1 and 10');
      }
      this.speed = speed;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Setting simulation speed'
      );
    }
  }
  
  /**
   * Sets the organism type for new placements
   * @param type - The organism type to use
   */
  setOrganismType(type: OrganismType): void {
    try {
      if (!type) {
        throw new ConfigurationError('Organism type is required');
      }
      
      this.selectedOrganismType = type;
      if (this.placementMode) {
        // Keep existing organisms, just change the type for new placements
        this.draw();
      } else {
        // If simulation is running, reset with new type
        this.reset();
      }
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Setting organism type'
      );
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
  
  /**
   * Sets the maximum population limit
   * @param limit - Maximum number of organisms allowed
   */
  setMaxPopulation(limit: number): void {
    try {
      if (limit < 1 || limit > 5000) {
        throw new ConfigurationError('Population limit must be between 1 and 5000');
      }
      this.maxPopulation = limit;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Setting maximum population'
      );
    }
  }
  
  private animate(): void {
    if (!this.isRunning) return;
    
    try {
      this.update();
      this.draw();
      this.updateStats();
      
      requestAnimationFrame(() => this.animate());
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.HIGH,
        'Animation loop'
      );
      // Stop animation on error to prevent infinite error loops
      this.isRunning = false;
    }
  }
  
  private update(): void {
    try {
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
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.HIGH,
        'Updating simulation state'
      );
    }
  }
  
  private draw(): void {
    try {
      // Clear canvas and draw grid
      this.canvasUtils.clear();
      this.canvasUtils.drawGrid();
      
      // Draw organisms
      this.organisms.forEach(organism => organism.draw(this.ctx));
      
      // Show placement instructions if in placement mode and no organisms
      if (this.placementMode && this.organisms.length === 0) {
        this.canvasUtils.drawPlacementInstructions();
      }
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.HIGH,
        'Drawing simulation'
      );
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
    try {
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
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.HIGH,
        'Setting up canvas events'
      );
    }
  }
    private placeOrganism(event: MouseEvent): void {
    try {
      const coords = this.canvasUtils.getMouseCoordinates(event);
      
      // Add organism at clicked position
      this.organisms.push(new Organism(coords.x, coords.y, this.selectedOrganismType));
      this.draw();
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Placing organism'
      );
    }
  }

  private showPreview(event: MouseEvent): void {
    try {
      const coords = this.canvasUtils.getMouseCoordinates(event);
      
      // Redraw canvas with preview
      this.draw();
      
      // Draw preview organism
      this.canvasUtils.drawPreviewOrganism(
        coords.x, 
        coords.y, 
        this.selectedOrganismType.color, 
        this.selectedOrganismType.size
      );
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.LOW,
        'Showing organism preview'
      );
    }
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
    const content = `
      <div class="achievement-content">
        <span class="achievement-icon">${achievement.icon}</span>
        <div class="achievement-text">
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-desc">${achievement.description}</div>
          <div class="achievement-points">+${achievement.points} points</div>
        </div>
      </div>
    `;
    
    showNotification('achievement-notification', content, 4000);
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
