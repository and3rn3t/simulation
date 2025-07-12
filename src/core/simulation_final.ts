import { AchievementSystem } from '../achievement/AchievementSystem.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { ChallengeManager } from '../challenge/ChallengeManager.js';
import { EcosystemManager } from '../ecosystem/EcosystemManager.js';
import { EventSystem } from '../events/EventSystem.js';
import { ParticleSystem } from '../graphics/ParticleSystem.js';
import { SoundManager } from '../sound/SoundManager.js';
import { OrganismType } from '../types/OrganismType.js';
import { Position } from '../types/Position.js';
import { SimulationStats } from '../types/SimulationStats.js';
import { UserInteraction } from '../ui/UserInteraction.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { Logger } from '../utils/Logger.js';
import { MobileCanvasManager } from '../utils/mobile/MobileCanvasManager.js';
import { StatisticsManager } from '../utils/StatisticsManager.js';

// Advanced Mobile Features
import { AdvancedMobileGestures } from '../utils/mobile/AdvancedMobileGestures.js';
import { MobileAnalyticsManager } from '../utils/mobile/MobileAnalyticsManager.js';
import { MobilePWAManager } from '../utils/mobile/MobilePWAManager.js';
import { MobileSocialManager } from '../utils/mobile/MobileSocialManager.js';
import { MobileVisualEffects } from '../utils/mobile/MobileVisualEffects.js';

export class OrganismSimulation extends EventEmitter {
  private canvasManager: CanvasManager;
  private ecosystemManager: EcosystemManager;
  private statisticsManager: StatisticsManager;
  private mobileCanvasManager: MobileCanvasManager;
  private achievementSystem: AchievementSystem;
  private challengeManager: ChallengeManager;
  private eventSystem: EventSystem;
  private soundManager: SoundManager;
  private particleSystem: ParticleSystem;
  private userInteraction: UserInteraction;

  // Advanced Mobile Features
  private advancedMobileGestures?: AdvancedMobileGestures;
  private mobileVisualEffects?: MobileVisualEffects;
  private mobilePWAManager?: MobilePWAManager;
  private mobileAnalyticsManager?: MobileAnalyticsManager;
  private mobileSocialManager?: MobileSocialManager;

  private isRunning = false;
  private currentSpeed = 1;
  private currentOrganismType: string = 'basic';
  private maxPopulation = 100;
  private animationId?: number;
  private lastUpdateTime = 0;
  private updateInterval = 16; // 60 FPS

  constructor(canvasElement?: HTMLCanvasElement | string) {
    super();

    try {
      this.canvasManager = new CanvasManager(canvasElement);
      this.ecosystemManager = new EcosystemManager();
      this.statisticsManager = new StatisticsManager();
      this.mobileCanvasManager = new MobileCanvasManager(this.canvasManager);
      this.achievementSystem = new AchievementSystem();
      this.challengeManager = new ChallengeManager();
      this.eventSystem = new EventSystem();
      this.soundManager = new SoundManager();
      this.particleSystem = new ParticleSystem(this.canvasManager.context);
      this.userInteraction = new UserInteraction();

      this.initializeAdvancedMobileFeatures();
      this.initializeEventListeners();
      this.logInitialization();
    } catch (error) {
      ErrorHandler.handleError(error, 'OrganismSimulation constructor');
      throw error;
    }
  }

  /**
   * Initialize advanced mobile features
   */
  private initializeAdvancedMobileFeatures(): void {
    try {
      if (this.mobileCanvasManager.isMobileDevice()) {
        Logger.info('Initializing advanced mobile features');

        // Initialize Advanced Mobile Gestures
        this.advancedMobileGestures = new AdvancedMobileGestures(this.canvasManager.canvas, {
          onSwipe: (direction, velocity) => {
            Logger.info(`Advanced swipe detected: ${direction} at ${velocity}px/s`);
            this.handleAdvancedSwipe(direction, velocity);
          },
          onRotation: (angle, velocity) => {
            Logger.info(`Rotation gesture: ${angle}° at ${velocity}°/s`);
            this.handleRotationGesture(angle, velocity);
          },
          onMultiFinger: (fingerCount, center) => {
            Logger.info(`Multi-finger gesture: ${fingerCount} fingers`);
            this.handleMultiFingerGesture(fingerCount, center);
          },
          onEdgeSwipe: (edge, startPosition) => {
            Logger.info(`Edge swipe from ${edge}`);
            this.handleEdgeSwipe(edge, startPosition);
          },
          onForceTouch: (force, position) => {
            Logger.info(`Force touch: ${force} at`, position);
            this.handleForceTouch(force, position);
          },
        });

        // Initialize Mobile Visual Effects
        this.mobileVisualEffects = new MobileVisualEffects(this.canvasManager.context, {
          quality: 'auto', // Auto-adjust based on device performance
          maxParticles: 50,
          enableBloom: true,
          enableTrails: true,
        });

        // Initialize PWA Manager
        this.mobilePWAManager = new MobilePWAManager({
          onInstallPrompt: () => {
            this.emit('pwa:installPrompt');
          },
          onInstalled: () => {
            Logger.info('PWA installed successfully');
            this.emit('pwa:installed');
          },
          onOffline: () => {
            Logger.info('App is now offline');
            this.emit('app:offline');
          },
          onOnline: () => {
            Logger.info('App is back online');
            this.emit('app:online');
          },
        });

        // Initialize Analytics Manager
        this.mobileAnalyticsManager = new MobileAnalyticsManager({
          trackPerformance: true,
          trackTouchHeatmap: true,
          trackBattery: true,
          sampleRate: 0.1, // Track 10% of sessions
        });

        // Initialize Social Manager
        this.mobileSocialManager = new MobileSocialManager({
          enableNativeSharing: true,
          enableScreenCapture: true,
          enableVideoRecording: true,
          platforms: ['twitter', 'facebook', 'instagram', 'tiktok'],
        });

        // Start tracking user interaction
        this.mobileAnalyticsManager.trackEvent('mobile_features_initialized', {
          device_type: 'mobile',
          timestamp: Date.now(),
        });

        Logger.info('Advanced mobile features initialized successfully');
      }
    } catch (error) {
      ErrorHandler.handleError(error, 'Advanced mobile features initialization');
    }
  }

  /**
   * Handle advanced swipe gestures
   */
  private handleAdvancedSwipe(direction: string, velocity: number): void {
    // High velocity swipes trigger special actions
    if (velocity > 1000) {
      switch (direction) {
        case 'up':
          this.setSpeed(Math.min(this.currentSpeed + 2, 10));
          break;
        case 'down':
          this.setSpeed(Math.max(this.currentSpeed - 2, 0.1));
          break;
        case 'left':
          this.previousOrganismType();
          break;
        case 'right':
          this.nextOrganismType();
          break;
      }
    }
  }

  /**
   * Handle rotation gestures
   */
  private handleRotationGesture(angle: number, velocity: number): void {
    // Rotate view or adjust zoom based on rotation
    if (this.mobileVisualEffects) {
      this.mobileVisualEffects.addRotationEffect(angle, velocity);
    }
  }

  /**
   * Handle multi-finger gestures
   */
  private handleMultiFingerGesture(fingerCount: number, _center: Position): void {
    switch (fingerCount) {
      case 3:
        // Three finger tap - toggle fullscreen
        this.toggleFullscreen();
        break;
      case 4:
        // Four finger tap - show/hide UI
        this.toggleUI();
        break;
      case 5:
        // Five finger tap - reset simulation
        this.reset();
        break;
    }
  }

  /**
   * Handle edge swipes
   */
  private handleEdgeSwipe(edge: string, _startPosition: Position): void {
    switch (edge) {
      case 'left':
        // Show statistics panel
        this.emit('ui:showStats');
        break;
      case 'right':
        // Show controls panel
        this.emit('ui:showControls');
        break;
      case 'top':
        // Show menu
        this.emit('ui:showMenu');
        break;
      case 'bottom':
        // Show sharing options
        this.showSharingOptions();
        break;
    }
  }

  /**
   * Handle force touch
   */
  private handleForceTouch(force: number, position: Position): void {
    if (force > 0.7) {
      // Strong force touch - create organism at position
      this.placeOrganismAt(position);
    } else if (force > 0.4) {
      // Medium force touch - add visual effect
      if (this.mobileVisualEffects) {
        this.mobileVisualEffects.addTouchEffect(position, force);
      }
    }
  }

  /**
   * Show sharing options
   */
  private showSharingOptions(): void {
    if (this.mobileSocialManager) {
      this.mobileSocialManager.showShareModal();
    }
  }

  /**
   * Toggle fullscreen mode
   */
  private toggleFullscreen(): void {
    this.mobileCanvasManager.toggleFullscreen();
  }

  /**
   * Toggle UI visibility
   */
  private toggleUI(): void {
    this.emit('ui:toggle');
  }

  /**
   * Place organism at specific position
   */
  private placeOrganismAt(position: Position): void {
    try {
      const organism = this.ecosystemManager.createOrganism(
        this.currentOrganismType,
        position.x,
        position.y
      );

      if (organism) {
        this.ecosystemManager.addOrganism(organism);

        // Add visual effect for organism placement
        if (this.mobileVisualEffects) {
          this.mobileVisualEffects.addOrganismSpawnEffect(position);
        }

        // Track organism placement
        if (this.mobileAnalyticsManager) {
          this.mobileAnalyticsManager.trackEvent('organism_placed', {
            type: this.currentOrganismType,
            position: position,
            method: 'force_touch',
          });
        }
      }
    } catch (error) {
      ErrorHandler.handleError(error, 'Place organism at position');
    }
  }

  /**
   * Go to previous organism type
   */
  private previousOrganismType(): void {
    const types = this.ecosystemManager.getAvailableOrganismTypes();
    const currentIndex = types.indexOf(this.currentOrganismType);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : types.length - 1;
    this.setOrganismType(types[previousIndex]);
  }

  /**
   * Go to next organism type
   */
  private nextOrganismType(): void {
    const types = this.ecosystemManager.getAvailableOrganismTypes();
    const currentIndex = types.indexOf(this.currentOrganismType);
    const nextIndex = currentIndex < types.length - 1 ? currentIndex + 1 : 0;
    this.setOrganismType(types[nextIndex]);
  }

  private initializeEventListeners(): void {
    this.canvasManager.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    this.canvasManager.canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));

    // Mobile-specific listeners are handled by the mobile gesture system
  }

  private logInitialization(): void {
    Logger.info('OrganismSimulation initialized successfully', {
      canvasSize: {
        width: this.canvasManager.canvas.width,
        height: this.canvasManager.canvas.height,
      },
      isMobile: this.mobileCanvasManager.isMobileDevice(),
      advancedMobileFeaturesEnabled: !!this.advancedMobileGestures,
    });
  }

  private handleCanvasClick(event: MouseEvent): void {
    try {
      const rect = this.canvasManager.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      this.placeOrganism(x, y);
    } catch (error) {
      ErrorHandler.handleError(error, 'Canvas click handler');
    }
  }

  private handleCanvasMouseMove(event: MouseEvent): void {
    // Handle mouse move events for desktop
  }

  initializePopulation(): void {
    try {
      this.ecosystemManager.initializePopulation(this.maxPopulation);
      Logger.info(`Population initialized with ${this.maxPopulation} organisms`);
    } catch (error) {
      ErrorHandler.handleError(error, 'Population initialization');
    }
  }

  start(): void {
    if (this.isRunning) return;

    try {
      this.isRunning = true;
      this.lastUpdateTime = performance.now();

      // Start mobile analytics if available
      if (this.mobileAnalyticsManager) {
        this.mobileAnalyticsManager.startSession();
      }

      this.animate();
      this.emit('simulation:started');
      Logger.info('Simulation started');
    } catch (error) {
      ErrorHandler.handleError(error, 'Simulation start');
      this.isRunning = false;
    }
  }

  pause(): void {
    if (!this.isRunning) return;

    try {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = undefined;
      }

      // Pause mobile analytics if available
      if (this.mobileAnalyticsManager) {
        this.mobileAnalyticsManager.pauseSession();
      }

      this.emit('simulation:paused');
      Logger.info('Simulation paused');
    } catch (error) {
      ErrorHandler.handleError(error, 'Simulation pause');
    }
  }

  reset(): void {
    try {
      const wasRunning = this.isRunning;
      this.pause();

      this.ecosystemManager.reset();
      this.canvasManager.clear();
      this.currentSpeed = 1;

      // Reset mobile effects if available
      if (this.mobileVisualEffects) {
        this.mobileVisualEffects.reset();
      }

      // Track reset event
      if (this.mobileAnalyticsManager) {
        this.mobileAnalyticsManager.trackEvent('simulation_reset', {
          was_running: wasRunning,
          duration: this.mobileAnalyticsManager.getSessionDuration(),
        });
      }

      if (wasRunning) {
        this.start();
      }

      this.emit('simulation:reset');
      Logger.info('Simulation reset');
    } catch (error) {
      ErrorHandler.handleError(error, 'Simulation reset');
    }
  }

  clear(): void {
    try {
      this.ecosystemManager.clear();
      this.canvasManager.clear();

      // Clear mobile effects if available
      if (this.mobileVisualEffects) {
        this.mobileVisualEffects.clear();
      }

      this.emit('simulation:cleared');
      Logger.info('Simulation cleared');
    } catch (error) {
      ErrorHandler.handleError(error, 'Simulation clear');
    }
  }

  setSpeed(speed: number): void {
    try {
      this.currentSpeed = Math.max(0.1, Math.min(10, speed));
      this.updateInterval = 16 / this.currentSpeed;

      // Update mobile performance settings if available
      if (this.mobileCanvasManager) {
        this.mobileCanvasManager.adjustPerformanceForSpeed(this.currentSpeed);
      }

      this.emit('simulation:speedChanged', this.currentSpeed);
      Logger.info(`Simulation speed set to ${this.currentSpeed}`);
    } catch (error) {
      ErrorHandler.handleError(error, 'Set simulation speed');
    }
  }

  setOrganismType(type: string): void {
    try {
      this.currentOrganismType = type;
      this.emit('simulation:organismTypeChanged', type);
      Logger.info(`Organism type set to ${type}`);
    } catch (error) {
      ErrorHandler.handleError(error, 'Set organism type');
    }
  }

  getOrganismTypeById(id: string): OrganismType | null {
    try {
      return this.ecosystemManager.getOrganismTypeById(id);
    } catch (error) {
      ErrorHandler.handleError(error, 'Get organism type by ID');
      return null;
    }
  }

  setMaxPopulation(limit: number): void {
    try {
      if (limit < 1 || limit > 5000) {
        throw new Error('Population limit must be between 1 and 5000');
      }
      this.maxPopulation = limit;
      this.emit('simulation:maxPopulationChanged', limit);
      Logger.info(`Max population set to ${limit}`);
    } catch (error) {
      ErrorHandler.handleError(error, 'Set max population');
    }
  }

  startChallenge(challengeId: string): void {
    try {
      this.challengeManager.startChallenge(challengeId);
      this.emit('challenge:started', challengeId);
      Logger.info(`Challenge started: ${challengeId}`);
    } catch (error) {
      ErrorHandler.handleError(error, 'Start challenge');
    }
  }

  getStats(): SimulationStats {
    try {
      return this.ecosystemManager.getStats();
    } catch (error) {
      ErrorHandler.handleError(error, 'Get simulation stats');
      return {
        population: 0,
        births: 0,
        deaths: 0,
        averageAge: 0,
        averageEnergy: 0,
        time: 0,
      };
    }
  }

  private placeOrganism(x: number, y: number): void {
    // TODO: Implement organism placement
  }

  private animate(): void {
    if (!this.isRunning) return;

    try {
      // Check if we should skip this frame for mobile performance
      const currentTime = performance.now();
      if (currentTime - this.lastUpdateTime < this.updateInterval) {
        this.animationId = requestAnimationFrame(() => this.animate());
        return;
      }

      this.lastUpdateTime = currentTime;

      // Update ecosystem
      this.ecosystemManager.update(this.currentSpeed);

      // Clear and render
      this.canvasManager.clear();
      this.ecosystemManager.render(this.canvasManager.context);

      // Render mobile visual effects if available
      if (this.mobileVisualEffects) {
        this.mobileVisualEffects.render();
      }

      // Update statistics
      this.statisticsManager.updateAllStats(this.getStats());

      // Continue animation loop
      this.animationId = requestAnimationFrame(() => this.animate());
    } catch (error) {
      ErrorHandler.handleError(error, 'Animation loop');
      this.pause();
    }
  }

  /**
   * Get advanced mobile features status
   */
  getMobileFeatureStatus(): Record<string, boolean> {
    return {
      isMobileDevice: this.mobileCanvasManager.isMobileDevice(),
      advancedGesturesEnabled: !!this.advancedMobileGestures,
      visualEffectsEnabled: !!this.mobileVisualEffects,
      pwaEnabled: !!this.mobilePWAManager,
      analyticsEnabled: !!this.mobileAnalyticsManager,
      socialSharingEnabled: !!this.mobileSocialManager,
    };
  }

  /**
   * Capture and share simulation state
   */
  async captureAndShare(options?: { includeVideo?: boolean }): Promise<void> {
    if (this.mobileSocialManager) {
      try {
        if (options?.includeVideo) {
          await this.mobileSocialManager.startVideoRecording();
          // Record for 5 seconds
          setTimeout(async () => {
            const videoBlob = await this.mobileSocialManager.stopVideoRecording();
            if (videoBlob) {
              await this.mobileSocialManager.shareVideo(videoBlob, {
                title: 'My Ecosystem Simulation',
                description: 'Check out my ecosystem simulation!',
              });
            }
          }, 5000);
        } else {
          const screenshot = await this.mobileSocialManager.captureScreenshot();
          if (screenshot) {
            await this.mobileSocialManager.shareImage(screenshot, {
              title: 'My Ecosystem Simulation',
              description: 'Check out my ecosystem simulation!',
            });
          }
        }
      } catch (error) {
        ErrorHandler.handleError(error, 'Capture and share');
      }
    }
  }

  /**
   * Cleanup method for proper disposal
   */
  dispose(): void {
    try {
      this.pause();

      // Dispose mobile features
      this.advancedMobileGestures?.dispose();
      this.mobileVisualEffects?.dispose();
      this.mobilePWAManager?.dispose();
      this.mobileAnalyticsManager?.dispose();
      this.mobileSocialManager?.dispose();

      // Dispose other components
      this.canvasManager?.dispose();
      this.ecosystemManager?.dispose();
      this.mobileCanvasManager?.dispose();

      Logger.info('OrganismSimulation disposed successfully');
    } catch (error) {
      ErrorHandler.handleError(error, 'Simulation disposal');
    }
  }
}
