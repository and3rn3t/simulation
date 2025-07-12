import { ACHIEVEMENTS, type Achievement } from '../features/achievements';
import type { OrganismType } from '../models/organismTypes';
import { UNLOCKABLE_ORGANISMS } from '../models/unlockables';
import type { GameStats } from '../types/gameTypes';
import {
  AdaptiveBatchProcessor,
  PopulationPredictor,
  SpatialPartitioningManager,
  algorithmWorkerManager,
  type EnvironmentalFactors,
  type PopulationPrediction,
} from '../utils/algorithms';
import { CanvasManager } from '../utils/canvas/canvasManager';
import { CanvasUtils } from '../utils/canvas/canvasUtils';
import { MemoryMonitor, OrganismPool, OrganismSoA } from '../utils/memory';
import { AdvancedMobileGestures } from '../utils/mobile/AdvancedMobileGestures';
import { MobileAnalyticsManager } from '../utils/mobile/MobileAnalyticsManager';
import { MobileCanvasManager } from '../utils/mobile/MobileCanvasManager';
import { MobilePerformanceManager } from '../utils/mobile/MobilePerformanceManager';
import { MobilePWAManager } from '../utils/mobile/MobilePWAManager';
import { MobileSocialManager } from '../utils/mobile/MobileSocialManager';
import { MobileTouchHandler } from '../utils/mobile/MobileTouchHandler';
import { MobileUIEnhancer } from '../utils/mobile/MobileUIEnhancer';
import { MobileVisualEffects } from '../utils/mobile/MobileVisualEffects';
import {
  CanvasError,
  ConfigurationError,
  ErrorHandler,
  ErrorSeverity,
} from '../utils/system/errorHandler';
import { log, perf } from '../utils/system/logger';
import { Organism } from './organism';

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
    pH: 0.5,
  };

  // Mobile optimizations
  private mobileCanvasManager?: MobileCanvasManager;
  private mobileTouchHandler?: MobileTouchHandler;
  private mobilePerformanceManager: MobilePerformanceManager;
  private mobileUIEnhancer?: MobileUIEnhancer;

  // Advanced mobile features
  private advancedGestures?: AdvancedMobileGestures;
  private visualEffects?: MobileVisualEffects;
  private pwaManager?: MobilePWAManager;
  private analyticsManager?: MobileAnalyticsManager;
  private socialManager?: MobileSocialManager;

  // Animation frame tracking
  private animationId?: number;

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
          useTimeSlicing: true,
        },
        16.67 // 60 FPS target
      );

      this.populationPredictor = new PopulationPredictor(this.environmentalFactors);

      // Initialize worker manager
      algorithmWorkerManager.initialize().catch(error => {
        console.warn('Failed to initialize algorithm workers:', error);
      });

      // Initialize mobile optimizations
      this.mobilePerformanceManager = new MobilePerformanceManager();
      this.initializeMobileOptimizations();

      // Initialize mobile UI enhancements
      this.mobileUIEnhancer = new MobileUIEnhancer();

      // Initialize advanced mobile features
      this.initializeAdvancedMobileFeatures();

      this.initializeBackground();

      console.log('OrganismSimulation initialized successfully');
      log.logInit('OrganismSimulation initialized successfully', {
        canvasSize: { width: canvas.width, height: canvas.height },
        organismType: initialOrganismType.name,
        maxPopulation: this.maxPopulation,
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
          speed: this.speed,
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
        totalDeaths: this.totalDeaths,
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

  /**
   * Initialize advanced mobile features
   */
  private initializeAdvancedMobileFeatures(): void {
    if (!this.mobileCanvasManager?.isMobileDevice()) return;

    // Advanced gestures
    this.advancedGestures = new AdvancedMobileGestures(this.canvas, {
      onSwipe: this.handleSwipeGesture.bind(this),
      onRotate: this.handleRotateGesture.bind(this),
      onThreeFingerTap: this.handleThreeFingerTap.bind(this),
      onFourFingerTap: this.handleFourFingerTap.bind(this),
      onEdgeSwipe: this.handleEdgeSwipe.bind(this),
      onForceTouch: this.handleForceTouch.bind(this),
    });

    // Visual effects
    this.visualEffects = new MobileVisualEffects(this.canvas, {
      quality: this.mobilePerformanceManager?.getConfig().batterySaverMode ? 'low' : 'medium',
    });

    // PWA features
    this.pwaManager = new MobilePWAManager({
      enableOfflineMode: true,
      enableInstallPrompt: true,
      enableNotifications: true,
    });

    // Analytics
    this.analyticsManager = new MobileAnalyticsManager({
      enablePerformanceMonitoring: true,
      enableUserBehaviorTracking: true,
      enableErrorTracking: true,
      sampleRate: 0.1,
    });

    // Social features
    this.socialManager = new MobileSocialManager(this.canvas, {
      enableNativeSharing: true,
      enableScreenshots: true,
      enableVideoRecording: true,
      maxVideoLength: 30,
    });

    this.setupAdvancedMobileEventHandlers();
  }

  /**
   * Setup advanced mobile event handlers
   */
  private setupAdvancedMobileEventHandlers(): void {
    // TODO: Implement event system for mobile features
    // This is a placeholder for the event handling setup
  }

  /**
   * Handle swipe gestures
   */
  private handleSwipeGesture(direction: 'up' | 'down' | 'left' | 'right', velocity: number): void {
    // TODO: Implement camera system
    // For now, just track the event
    this.analyticsManager?.trackEvent('swipe_navigation', { direction, velocity });
  }

  /**
   * Handle rotation gestures
   */
  private handleRotateGesture(angle: number, center: { x: number; y: number }): void {
    // TODO: Implement rotation
    this.analyticsManager?.trackEvent('rotation_gesture', { angle, center });
  }

  /**
   * Handle three-finger tap
   */
  private handleThreeFingerTap(): void {
    // TODO: Implement camera reset
    this.analyticsManager?.trackEvent('three_finger_tap', {});
  }

  /**
   * Handle four-finger tap
   */
  private handleFourFingerTap(): void {
    // Toggle fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.canvas.requestFullscreen();
    }
    this.analyticsManager?.trackEvent('four_finger_tap', {});
  }

  /**
   * Handle edge swipe
   */
  private handleEdgeSwipe(edge: 'top' | 'bottom' | 'left' | 'right'): void {
    switch (edge) {
      case 'bottom':
        this.mobileUIEnhancer?.showBottomSheet();
        break;
      case 'top':
        // Show top menu or notifications
        break;
      case 'left':
      case 'right':
        // Show side panels
        break;
    }
    this.analyticsManager?.trackEvent('edge_swipe', { edge });
  }

  /**
   * Handle force touch (3D Touch)
   */
  private handleForceTouch(force: number, x: number, y: number): void {
    // Create special organism or menu based on force
    if (force > 0.8) {
      // Very strong press - create premium organism
      this.placeSpecialOrganism(x, y);
    } else if (force > 0.6) {
      // Medium press - show context menu
      this.showContextMenu(x, y);
    }

    this.analyticsManager?.trackEvent('force_touch', { force, position: { x, y } });
  }

  /**
   * Place special organism
   */
  private placeSpecialOrganism(x: number, y: number): void {
    // Implementation would place a special/rare organism
    this.visualEffects?.createSuccessEffect(x, y);
  }

  /**
   * Show context menu
   */
  private showContextMenu(x: number, y: number): void {
    // Implementation would show context-sensitive menu
    this.visualEffects?.createTouchRipple(x, y);
  }

  // Placeholder methods that need to be implemented or exist elsewhere
  private setupCanvasEvents(): void {
    // TODO: Implement canvas event setup
  }

  private setupMemoryCleanupHandlers(): void {
    // TODO: Implement memory cleanup handlers
  }

  private initializeBackground(): void {
    // TODO: Implement background initialization
  }

  private initializeMobileOptimizations(): void {
    try {
      // Setup responsive canvas management
      this.mobileCanvasManager = new MobileCanvasManager(this.canvas);

      // Setup advanced touch gestures
      this.mobileTouchHandler = new MobileTouchHandler(this.canvas, {
        onTap: (x, y) => {
          if (this.placementMode) {
            this.placeOrganism(x, y);
          }
        },
        onPinch: (scale, centerX, centerY) => {
          // Handle zoom
          console.log('Pinch detected:', scale, centerX, centerY);
        },
      });

      console.log('Mobile optimizations initialized');
      log.logInit('Mobile optimizations initialized', {
        maxOrganisms: this.maxPopulation,
        targetFPS: this.mobilePerformanceManager.getConfig().targetFPS,
        batterySaverMode: this.mobilePerformanceManager.getConfig().batterySaverMode,
      });
    } catch (error) {
      console.warn('Failed to initialize mobile optimizations:', error);
      log.logError('Failed to initialize mobile optimizations', { error: error.message });
    }
  }

  private placeOrganism(x: number, y: number): void {
    // TODO: Implement organism placement
  }

  private animate(): void {
    if (!this.isRunning) return;

    try {
      // Check if we should skip this frame for mobile performance
      if (this.mobilePerformanceManager?.shouldSkipFrame()) {
        this.animationId = requestAnimationFrame(() => this.animate());
        return;
      }

      this.update();
      this.draw();
      this.updateStats();

      // Update performance metrics
      this.analyticsManager?.trackEvent('frame_rendered', {
        organismCount: this.organisms.length,
        timestamp: Date.now(),
      });

      this.animationId = requestAnimationFrame(() => this.animate());
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

      // Update population prediction
      if (this.organisms.length > 10) {
        this.updatePopulationPrediction();
      }

      this.generation++;
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.HIGH,
        'Updating simulation'
      );
    }
  }

  private draw(): void {
    try {
      // Clear and redraw background
      this.ctx.fillStyle = '#000019';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
    // TODO: Implement stats update logic
  }

  private updateWithOptimizations(deltaTime: number): void {
    // TODO: Implement optimized update logic
  }

  private updateWithoutOptimizations(deltaTime: number): void {
    // Standard update loop for smaller populations
    this.organisms.forEach(organism => {
      organism.update(deltaTime, this.organisms);
    });

    // Remove dead organisms and return to pool
    this.organisms = this.organisms.filter(organism => {
      if (organism.shouldDie()) {
        this.deathsThisSecond++;
        this.totalDeaths++;
        this.destroyOrganism(organism);
        return false;
      }
      return true;
    });

    // Handle reproduction
    this.handleReproduction();
  }

  private handleReproduction(): void {
    // TODO: Implement reproduction logic
  }

  private updateScore(): void {
    // TODO: Implement score update logic
  }

  private checkAchievements(): void {
    // TODO: Implement achievement checking
  }

  private updatePopulationPrediction(): void {
    // TODO: Implement population prediction logic
  }

  private renderOrganisms(organisms: Organism[]): void {
    try {
      organisms.forEach(organism => {
        organism.render(this.ctx);
      });
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorSeverity.MEDIUM,
        'Rendering organisms'
      );
    }
  }

  private createOrganism(x: number, y: number, type: OrganismType, parent?: Organism): Organism {
    // Use object pooling to reduce memory allocations
    const organism = this.organismPool.acquire();

    if (organism) {
      organism.initialize(x, y, type, parent);
      return organism;
    } else {
      // Fallback if pool is empty
      return new Organism(x, y, type, parent);
    }
  }

  private destroyOrganism(organism: Organism): void {
    // Return organism to pool for reuse
    this.organismPool.release(organism);
  }

  private getAverageAge(): number {
    if (this.organisms.length === 0) return 0;
    const totalAge = this.organisms.reduce((sum, org) => sum + org.age, 0);
    return totalAge / this.organisms.length;
  }

  private getOldestAge(): number {
    if (this.organisms.length === 0) return 0;
    return Math.max(...this.organisms.map(org => org.age));
  }

  private getElapsedTime(): number {
    if (this.startTime === 0) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getGameStats(): GameStats {
    return {
      population: this.organisms.length,
      maxPopulation: this.maxPopulationReached,
      generations: this.generation,
      totalBirths: this.totalBirths,
      totalDeaths: this.totalDeaths,
      averageAge: this.getAverageAge(),
      oldestAge: this.getOldestAge(),
      elapsedTime: this.getElapsedTime(),
      score: this.score,
      unlockedAchievements: this.achievements.filter(a => a.unlocked).length,
    };
  }

  getOrganisms(): Organism[] {
    return [...this.organisms];
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  /**
   * Updates environmental factors that affect simulation
   * @param factors - Partial environmental factors to update
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
   * Gets memory usage statistics
   * @returns Memory usage information
   */
  getMemoryStats() {
    return {
      poolStats: this.organismPool.getStats(),
      memoryUsage: this.memoryMonitor.getCurrentUsage(),
      soaEnabled: this.useSoAOptimization,
    };
  }

  /**
   * Gets algorithm performance statistics
   * @returns Performance metrics for algorithms
   */
  getAlgorithmStats() {
    return {
      spatial: this.spatialPartitioning.getDebugInfo(),
      batch: this.batchProcessor.getPerformanceStats(),
      prediction: this.populationPredictor.getStats(),
      worker: algorithmWorkerManager.getPerformanceStats(),
    };
  }

  /**
   * Enables or disables Structure of Arrays optimization
   * @param enabled - Whether to enable SoA optimization
   */
  setSoAOptimization(enabled: boolean): void {
    this.useSoAOptimization = enabled;
    if (enabled && this.organisms.length > 0) {
      // Convert existing organisms to SoA format
      this.organismSoA.fromArray(this.organisms);
    }
  }

  public destroy(): void {
    // Stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Cleanup mobile features
    this.advancedGestures?.destroy();
    this.visualEffects?.clearEffects();
    this.pwaManager?.destroy();
    this.analyticsManager?.destroy();
    this.socialManager?.destroy();
    this.mobileCanvasManager?.destroy();
    this.mobileTouchHandler?.destroy();
    this.mobileUIEnhancer?.destroy();

    // Cleanup organisms
    this.organisms.forEach(organism => this.destroyOrganism(organism));
    this.organisms = [];

    // Stop monitoring
    this.memoryMonitor.stopMonitoring();
  }
}
