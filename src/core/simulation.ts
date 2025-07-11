import { Organism } from './organism';
import type { OrganismType } from '../models/organismTypes';
import { ACHIEVEMENTS, type Achievement } from '../features/achievements';
import { CHALLENGES } from '../features/challenges';
import type { GameStats } from '../types/gameTypes';
import { UNLOCKABLE_ORGANISMS } from '../models/unlockables';
import { CanvasUtils } from '../utils/canvas/canvasUtils';
import { showNotification } from '../ui/domHelpers';
import { 
  ErrorHandler, 
  ErrorSeverity, 
  CanvasError, 
  ConfigurationError,
  SimulationError
} from '../utils/system/errorHandler';
import { log, perf } from '../utils/system/logger';
import { CanvasManager } from '../utils/canvas/canvasManager';
import { 
  OrganismPool, 
  MemoryMonitor, 
  OrganismSoA
} from '../utils/memory';
import { 
  SpatialPartitioningManager,
  AdaptiveBatchProcessor,
  PopulationPredictor,
  algorithmWorkerManager,
  type EnvironmentalFactors,
  type PopulationPrediction
} from '../utils/algorithms';

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
  
  // Memory management
  /** Object pool for organism instances */
  private organismPool: OrganismPool;
  /** Memory monitor for tracking usage */
  private memoryMonitor: MemoryMonitor;
  /** Structure of Arrays for cache-optimized organism storage */
  private organismSoA: OrganismSoA;
  /** Whether to use SoA optimization */
  private useSoAOptimization = false;
  
  private canvasManager: CanvasManager;
  private backgroundContext: CanvasRenderingContext2D;
  private organismsContext: CanvasRenderingContext2D;
  
  // Algorithm optimizations
  private spatialPartitioning: SpatialPartitioningManager;
  private batchProcessor: AdaptiveBatchProcessor;
  private populationPredictor: PopulationPredictor;
  private useOptimizations: boolean = true;
  private lastPrediction: PopulationPrediction | null = null;
  private environmentalFactors: EnvironmentalFactors = {
    temperature: 0.5,
    resources: 0.8,
    space: 0.9,
    toxicity: 0.0,
    pH: 0.5
  };
  
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
      
      // Initialize CanvasManager for layered rendering
      const container = document.getElementById('canvas-container');
      if (!container) {
        throw new Error('Canvas container element not found');
      }
      this.canvasManager = new CanvasManager(container);
      this.canvasManager.createLayer('background', 0);
      this.canvasManager.createLayer('organisms', 1);
      this.backgroundContext = this.canvasManager.getContext('background');
      this.organismsContext = this.canvasManager.getContext('organisms');
      
      // Initialize memory management
      this.organismPool = OrganismPool.getInstance();
      this.memoryMonitor = MemoryMonitor.getInstance();
      this.organismSoA = new OrganismSoA(this.maxPopulation);
      
      // Pre-fill organism pool for better performance
      this.organismPool.preFill(100);
      
      // Start memory monitoring
      this.memoryMonitor.startMonitoring(2000); // Check every 2 seconds
      
      // Set up memory cleanup handlers
      this.setupMemoryCleanupHandlers();
      
      // Initialize algorithm optimizations
      this.spatialPartitioning = new SpatialPartitioningManager(
        canvas.width,
        canvas.height,
        10 // quadtree capacity
      );
      
      this.batchProcessor = new AdaptiveBatchProcessor(
        {
          batchSize: 50,
          maxFrameTime: 16, // 60 FPS target
          useTimeSlicing: true
        },
        16.67 // 60 FPS target
      );
      
      this.populationPredictor = new PopulationPredictor(this.environmentalFactors);
      
      // Initialize worker manager
      algorithmWorkerManager.initialize().catch(error => {
        console.warn('Failed to initialize algorithm workers:', error);
      });
      
      this.initializeBackground();
      
      console.log('OrganismSimulation initialized successfully');
      log.logInit('OrganismSimulation initialized successfully', {
        canvasSize: { width: canvas.width, height: canvas.height },
        organismType: initialOrganismType.name,
        maxPopulation: this.maxPopulation
      });
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
    // Start with a few organisms using object pooling
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (this.canvas.width - 20) + 10;
      const y = Math.random() * (this.canvas.height - 20) + 10;
      this.organisms.push(this.createOrganism(x, y, this.selectedOrganismType));
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
          log.logSimulation('Default population initialized', { count: 5 });
        }
        this.placementMode = false;
        log.logSimulation('Placement mode disabled');
      }
      
      if (!this.isRunning) {
        this.isRunning = true;
        this.startTime = Date.now() - this.pausedTime;
        this.animate();
        
        log.logSimulation('Simulation started', {
          organisms: this.organisms.length,
          generation: this.generation,
          speed: this.speed
        });
        
        // Start performance monitoring
        perf.startTiming('simulation-run');
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
      
      const runTime = perf.endTiming('simulation-run', 'Simulation run duration');
      log.logSimulation('Simulation paused', {
        runTime,
        organisms: this.organisms.length,
        generation: this.generation,
        totalBirths: this.totalBirths,
        totalDeaths: this.totalDeaths
      });
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
      
      // Return all organisms to pool before clearing
      this.organisms.forEach(organism => this.destroyOrganism(organism));
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
      // Return all organisms to pool before clearing
      this.organisms.forEach(organism => this.destroyOrganism(organism));
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
      const currentTime = Date.now();
      
      // Reset per-second counters every second
      if (currentTime - this.lastStatsUpdate >= 1000) {
        this.birthsThisSecond = 0;
        this.deathsThisSecond = 0;
        this.lastStatsUpdate = currentTime;
      }
      
      if (this.useOptimizations && this.organisms.length > 100) {
        this.updateWithOptimizations(deltaTime);
      } else {
        this.updateWithoutOptimizations(deltaTime);
      }
      
      // Update score based on population and survival
      this.updateScore();
      
      // Check achievements
      this.checkAchievements();
      
      // Limit population
      if (this.organisms.length > this.maxPopulation) {
        const removeCount = this.organisms.length - this.maxPopulation;
        const removedOrganisms = this.organisms.splice(0, removeCount);
        
        // Return removed organisms to pool
        removedOrganisms.forEach(organism => this.destroyOrganism(organism));
        
        this.totalDeaths += removeCount;
        
        log.logSimulation('Population capped', { 
          removed: removeCount,
          maxPopulation: this.maxPopulation 
        });
      }
      
      // Update population predictor with current data
      this.populationPredictor.addHistoricalData(currentTime, this.organisms.length);
      
      // Generate predictions periodically
      if (currentTime % 5000 < 100) { // Every 5 seconds
        this.generatePopulationPrediction();
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
      
      // Render organisms on the organisms layer
      this.renderOrganisms(this.organisms);
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
      // Mouse events for desktop
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

      // Touch events for mobile
      this.canvas.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Prevent default touch behavior
        if (this.placementMode) {
          this.placeOrganismTouch(event);
        }
      });

      this.canvas.addEventListener('touchmove', (event) => {
        event.preventDefault(); // Prevent scrolling
        if (this.placementMode) {
          this.showPreviewTouch(event);
        }
      });

      // Prevent context menu on long press
      this.canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
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
      
      // Add organism at clicked position using object pooling
      this.organisms.push(this.createOrganism(coords.x, coords.y, this.selectedOrganismType));
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
  
  private placeOrganismTouch(event: TouchEvent): void {
    try {
      const coords = this.canvasUtils.getTouchCoordinates(event);
      
      // Add organism at touched position using object pooling
      this.organisms.push(this.createOrganism(coords.x, coords.y, this.selectedOrganismType));
      this.draw();
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Placing organism via touch'
      );
    }
  }

  private showPreviewTouch(event: TouchEvent): void {
    try {
      const coords = this.canvasUtils.getTouchCoordinates(event);
      
      // Clear the canvas and redraw with preview
      this.draw();
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
        'Showing touch preview'
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
        
        log.logAchievement(achievement.name, {
          points: achievement.points,
          description: achievement.description,
          newScore: this.score
        });
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
        const firstChallenge = availableChallenges[0];
        if (firstChallenge) {
          // For now, just log that a challenge was started
          console.log('Challenge started:', firstChallenge.name);
          log.logChallenge('Challenge started', {
            challengeName: firstChallenge.name,
            availableChallenges: availableChallenges.length
          });
        }
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
  
  private initializeBackground(): void {
    this.backgroundContext.fillStyle = 'lightgreen';
    this.backgroundContext.fillRect(0, 0, this.backgroundContext.canvas.width, this.backgroundContext.canvas.height);
  }

  public renderOrganisms(organisms: any[]): void {
    // Clear organisms layer
    this.canvasManager.clearLayer('organisms');

    // Render each organism
    organisms.forEach(organism => {
      this.organismsContext.fillStyle = organism.color;
      this.organismsContext.beginPath();
      this.organismsContext.arc(organism.x, organism.y, organism.size, 0, Math.PI * 2);
      this.organismsContext.fill();
    });
  }

  public resize(): void {
    this.canvasManager.resizeAll();
    this.initializeBackground(); // Reinitialize background after resizing
  }
  
  /**
   * Set up memory cleanup event handlers
   */
  private setupMemoryCleanupHandlers(): void {
    window.addEventListener('memory-cleanup', (event: Event) => {
      const customEvent = event as CustomEvent;
      const level = customEvent.detail?.level || 'normal';
      
      log.logSystem('Memory cleanup triggered', { level, currentPopulation: this.organisms.length });
      
      if (level === 'aggressive') {
        // Aggressive cleanup: reduce population and clear caches
        this.performAggressiveMemoryCleanup();
      } else {
        // Normal cleanup: just clean up pools
        this.performNormalMemoryCleanup();
      }
    });
  }
  
  /**
   * Perform normal memory cleanup
   */
  private performNormalMemoryCleanup(): void {
    // Clear unused organisms from pool (keep some for future use)
    const poolStats = this.organismPool.getStats();
    if (poolStats.poolSize > 50) {
      this.organismPool.clear();
      this.organismPool.preFill(25); // Keep a smaller pool
    }
    
    log.logSystem('Normal memory cleanup completed', { 
      poolSize: this.organismPool.getStats().poolSize 
    });
  }
  
  /**
   * Perform aggressive memory cleanup
   */
  private performAggressiveMemoryCleanup(): void {
    // Reduce population if memory is critical
    if (this.organisms.length > 500) {
      const removeCount = Math.floor(this.organisms.length * 0.3);
      const removed = this.organisms.splice(0, removeCount);
      
      // Return removed organisms to pool
      removed.forEach(organism => this.organismPool.releaseOrganism(organism));
      
      this.totalDeaths += removeCount;
      
      log.logSystem('Population reduced due to memory pressure', { 
        removed: removeCount, 
        remaining: this.organisms.length 
      });
    }
    
    // Clear all pools
    this.organismPool.clear();
    this.organismSoA.clear();
    
    // Compact arrays if using SoA
    if (this.useSoAOptimization) {
      this.organismSoA.compact();
    }
    
    log.logSystem('Aggressive memory cleanup completed');
  }
  
  /**
   * Create an organism using object pooling
   */
  private createOrganism(x: number, y: number, type: OrganismType): Organism {
    try {
      // Check memory usage before creating
      if (!this.memoryMonitor.isMemoryUsageSafe() && this.organisms.length > 100) {
        // Skip creation if memory is tight and we have enough organisms
        throw new Error('Memory usage too high, skipping organism creation');
      }
      
      return this.organismPool.acquireOrganism(x, y, type);
    } catch (error) {
      // Fallback to regular creation if pool fails
      log.logSystem('Falling back to regular organism creation', { reason: error });
      return new Organism(x, y, type);
    }
  }
  
  /**
   * Destroy an organism and return it to the pool
   */
  private destroyOrganism(organism: Organism): void {
    try {
      this.organismPool.releaseOrganism(organism);
    } catch (error) {
      // If pool release fails, just let it be garbage collected
      log.logSystem('Failed to return organism to pool', { error });
    }
  }
  
  /**
   * Toggle between regular array and Structure of Arrays optimization
   */
  public toggleSoAOptimization(enable: boolean): void {
    if (enable === this.useSoAOptimization) {
      return;
    }
    
    this.useSoAOptimization = enable;
    
    if (enable) {
      // Convert to SoA
      this.organismSoA.fromOrganismArray(this.organisms);
      log.logSystem('Switched to Structure of Arrays optimization', {
        organismCount: this.organisms.length,
        memoryUsage: this.organismSoA.getMemoryUsage()
      });
    } else {
      // Convert back to regular array
      this.organisms = this.organismSoA.toOrganismArray();
      this.organismSoA.clear();
      log.logSystem('Switched back to regular array storage');
    }
  }
  
  /**
   * Get memory statistics
   */
  public getMemoryStats(): {
    memoryMonitor: any;
    organismPool: any;
    organismSoA: any;
    totalOrganisms: number;
    usingSoA: boolean;
  } {
    return {
      memoryMonitor: this.memoryMonitor.getMemoryStats(),
      organismPool: this.organismPool.getStats(),
      organismSoA: this.organismSoA.getStats(),
      totalOrganisms: this.organisms.length,
      usingSoA: this.useSoAOptimization
    };
  }
  
  /**
   * Updates organisms using batch processing and spatial partitioning optimizations
   * @param deltaTime - Time elapsed since last update
   */
  private updateWithOptimizations(deltaTime: number): void {
    try {
      // Rebuild spatial partitioning structure
      this.spatialPartitioning.rebuild(this.organisms);
      
      // Process organism updates in batches
      this.batchProcessor.processBatch(
        this.organisms,
        (organism, dt, canvasWidth, canvasHeight) => {
          organism.update(dt, canvasWidth, canvasHeight);
        },
        deltaTime,
        this.canvas.width,
        this.canvas.height
      );
      
      // Process reproduction in batches
      const reproductionResult = this.batchProcessor.processReproduction(
        this.organisms,
        (organism) => {
          if (organism.canReproduce() && this.organisms.length < this.maxPopulation) {
            const child = this.createOrganism(
              organism.x + (Math.random() - 0.5) * 20,
              organism.y + (Math.random() - 0.5) * 20,
              organism.type
            );
            organism.reproduced = true;
            this.generation++;
            this.birthsThisSecond++;
            this.totalBirths++;
            
            // Log significant population milestones
            if (this.totalBirths % 100 === 0) {
              log.logSimulation('Birth milestone reached', { 
                totalBirths: this.totalBirths,
                currentPopulation: this.organisms.length 
              });
            }
            
            return child;
          }
          return null;
        },
        this.maxPopulation
      );
      
      // Add new organisms
      this.organisms.push(...reproductionResult.newOrganisms);
      
      // Check for death (still needs to be done for all organisms)
      for (let i = this.organisms.length - 1; i >= 0; i--) {
        const organism = this.organisms[i];
        if (organism && organism.shouldDie()) {
          const removed = this.organisms.splice(i, 1)[0];
          if (removed) {
            this.destroyOrganism(removed);
            this.deathsThisSecond++;
            this.totalDeaths++;
          }
        }
      }
      
      // Track max population
      this.maxPopulationReached = Math.max(this.maxPopulationReached, this.organisms.length);
      
      // Log population peaks
      if (this.organisms.length > this.maxPopulationReached * 0.95) {
        log.logSimulation('Population peak reached', { 
          currentPopulation: this.organisms.length,
          maxPopulation: this.maxPopulationReached 
        });
      }
      
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new SimulationError('Failed to update with optimizations', 'UPDATE_OPTIMIZATION_ERROR'),
        ErrorSeverity.HIGH,
        'OrganismSimulation updateWithOptimizations'
      );
      
      // Fall back to non-optimized update
      this.updateWithoutOptimizations(deltaTime);
    }
  }
  
  /**
   * Updates organisms using traditional method (fallback)
   * @param deltaTime - Time elapsed since last update
   */
  private updateWithoutOptimizations(deltaTime: number): void {
    try {
      const newOrganisms: Organism[] = [];
      
      // Update existing organisms (backwards to allow safe removal)
      for (let i = this.organisms.length - 1; i >= 0; i--) {
        const organism = this.organisms[i];
        if (!organism) continue;
        
        organism.update(deltaTime, this.canvas.width, this.canvas.height);
        
        // Check for reproduction
        if (organism.canReproduce() && this.organisms.length < this.maxPopulation) {
          // Create new organism using object pooling instead of reproduce method
          const child = this.createOrganism(
            organism.x + (Math.random() - 0.5) * 20,
            organism.y + (Math.random() - 0.5) * 20,
            organism.type
          );
          newOrganisms.push(child);
          organism.reproduced = true; // Mark parent as reproduced
          
          this.generation++;
          this.birthsThisSecond++;
          this.totalBirths++;
          
          // Log significant population milestones
          if (this.totalBirths % 100 === 0) {
            log.logSimulation('Birth milestone reached', { 
              totalBirths: this.totalBirths,
              currentPopulation: this.organisms.length 
            });
          }
        }
        
        // Check for death
        if (organism.shouldDie()) {
          const removed = this.organisms.splice(i, 1)[0];
          if (removed) {
            this.destroyOrganism(removed); // Return to pool
            this.deathsThisSecond++;
            this.totalDeaths++;
          }
        }
      }
      
      // Add new organisms
      this.organisms.push(...newOrganisms);
      
      // Track max population
      this.maxPopulationReached = Math.max(this.maxPopulationReached, this.organisms.length);
      
      // Log population peaks
      if (this.organisms.length > this.maxPopulationReached * 0.95) {
        log.logSimulation('Population peak reached', { 
          currentPopulation: this.organisms.length,
          maxPopulation: this.maxPopulationReached 
        });
      }
      
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new SimulationError('Failed to update without optimizations', 'UPDATE_FALLBACK_ERROR'),
        ErrorSeverity.HIGH,
        'OrganismSimulation updateWithoutOptimizations'
      );
    }
  }
  
  /**
   * Generates population prediction using algorithms
   */
  private async generatePopulationPrediction(): Promise<void> {
    try {
      if (this.organisms.length === 0) {
        return;
      }
      
      this.lastPrediction = await this.populationPredictor.predictPopulationGrowth(
        this.organisms,
        50, // 50 time steps ahead
        this.organisms.length > 200 // Use workers for large populations
      );
      
      // You could dispatch an event or update UI with the prediction
      // For now, we'll just log it
      if (this.lastPrediction.confidence > 0.5) {
        log.logSimulation('Population prediction generated', {
          peakPopulation: this.lastPrediction.peakPopulation,
          peakTime: this.lastPrediction.peakTime,
          confidence: this.lastPrediction.confidence
        });
      }
      
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new SimulationError('Failed to generate population prediction', 'PREDICTION_ERROR'),
        ErrorSeverity.LOW,
        'OrganismSimulation generatePopulationPrediction'
      );
    }
  }

  /**
   * Toggles algorithm optimizations on/off
   * @param enabled - Whether to enable optimizations
   */
  setOptimizationsEnabled(enabled: boolean): void {
    this.useOptimizations = enabled;
  }
  
  /**
   * Gets the current population prediction
   * @returns Current population prediction or null
   */
  getPopulationPrediction(): PopulationPrediction | null {
    return this.lastPrediction;
  }
  
  /**
   * Updates environmental factors
   * @param factors - New environmental factors
   */
  updateEnvironmentalFactors(factors: Partial<EnvironmentalFactors>): void {
    this.environmentalFactors = { ...this.environmentalFactors, ...factors };
    this.populationPredictor.updateEnvironmentalFactors(factors);
  }
  
  /**
   * Gets current environmental factors
   * @returns Current environmental factors
   */
  getEnvironmentalFactors(): EnvironmentalFactors {
    return { ...this.environmentalFactors };
  }
  
  /**
   * Gets algorithm performance statistics
   * @returns Performance statistics
   */
  getAlgorithmPerformanceStats(): {
    spatialPartitioning: any;
    batchProcessor: any;
    workerManager: any;
  } {
    return {
      spatialPartitioning: this.spatialPartitioning.getDebugInfo(),
      batchProcessor: this.batchProcessor.getPerformanceStats(),
      workerManager: algorithmWorkerManager.getPerformanceStats()
    };
  }
}
