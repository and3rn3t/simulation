class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
import type { Position } from '../types/Position';
import type { SimulationStats } from '../types/SimulationStats';
import { StatisticsManager } from '../utils/game/statisticsManager';
import { MobileCanvasManager } from '../utils/mobile/MobileCanvasManager';
import { ErrorHandler } from '../utils/system/errorHandler';
import { Logger } from '../utils/system/logger';
import { ifPattern } from '../utils/UltimatePatternConsolidator';

// Advanced Mobile Features
import { AdvancedMobileGestures } from '../utils/mobile/AdvancedMobileGestures.js';
import { MobileAnalyticsManager } from '../utils/mobile/MobileAnalyticsManager.js';
import { MobilePWAManager } from '../utils/mobile/MobilePWAManager.js';
import { MobileSocialManager } from '../utils/mobile/MobileSocialManager.js';
import { MobileVisualEffects } from '../utils/mobile/MobileVisualEffects.js';

export class OrganismSimulation {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private statisticsManager: StatisticsManager;
  private mobileCanvasManager: MobileCanvasManager;

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
  private organisms: any[] = [];

  constructor(canvasElement?: HTMLCanvasElement | string) {
    try {
      // Get or create canvas
      if (typeof canvasElement === 'string') {
        this.canvas = document?.getElementById(canvasElement) as HTMLCanvasElement;
      } else if (canvasElement instanceof HTMLCanvasElement) {
        this.canvas = canvasElement;
      } else {
        this.canvas = document?.getElementById('simulation-canvas') as HTMLCanvasElement;
      }

      if (!this.canvas) {
        throw new Error('Canvas element not found');
      }

      this.context = this.canvas.getContext('2d')!;
      this.statisticsManager = new StatisticsManager();
      this.mobileCanvasManager = new MobileCanvasManager(this.canvas);

      this.initializeAdvancedMobileFeatures();
      this.initializeEventListeners();
      this.logInitialization();
    } catch (error) {
      ErrorHandler.getInstance().handleError(error as Error);
      throw error;
    }
  }

  /**
   * Initialize advanced mobile features
   */
  private initializeAdvancedMobileFeatures(): void {
    try {
      // TODO: Implement isMobileDevice method in MobileCanvasManager
      // For now, check for mobile device using alternative method
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      if (isMobile) {
        Logger.getInstance().logSystem('Initializing advanced mobile features');

        // Initialize Advanced Mobile Gestures
        this.advancedMobileGestures = new AdvancedMobileGestures(this.canvas, {
          onSwipe: (direction, velocity) => {
            Logger.getInstance().logUserAction(
              `Advanced swipe detected: ${direction} at ${velocity}px/s`
            );
            this.handleAdvancedSwipe(direction, velocity);
          },
          onRotate: (angle, center) => {
            Logger.getInstance().logUserAction(
              `Rotation gesture: ${angle}° at center ${center.x},${center.y}`
            );
            this.handleRotationGesture(angle, center);
          },
          onEdgeSwipe: edge => {
            Logger.getInstance().logUserAction(`Edge swipe from ${edge}`);
            this.handleEdgeSwipe(edge);
          },
          onForceTouch: (force, x, y) => {
            Logger.getInstance().logUserAction(`Force touch: ${force} at ${x},${y}`);
            this.handleForceTouch(force, { x, y });
          },
        });

        // Initialize Mobile Visual Effects
        this.mobileVisualEffects = new MobileVisualEffects(this.canvas, {
          quality: 'medium',
        });

        // Initialize PWA Manager
        this.mobilePWAManager = new MobilePWAManager({
          enableInstallPrompt: true,
          enableOfflineMode: true,
          enableNotifications: true,
        });

        // Initialize Analytics Manager
        this.mobileAnalyticsManager = new MobileAnalyticsManager({
          enablePerformanceMonitoring: true,
          enableUserBehaviorTracking: true,
          enableErrorTracking: true,
          sampleRate: 0.1,
        });

        // Initialize Social Manager
        this.mobileSocialManager = new MobileSocialManager(this.canvas);

        // TODO: Implement trackEvent method in MobileAnalyticsManager
        // this.mobileAnalyticsManager.trackEvent('mobile_features_initialized', {
        //   device_type: 'mobile',
        //   timestamp: Date.now(),
        // });

        Logger.getInstance().logSystem('Advanced mobile features initialized successfully');
      }
    } catch (error) {
      this.handleError(error);
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

    // Dispatch gesture event for test interface
    window.dispatchEvent(
      new CustomEvent('mobile-gesture-detected', {
        detail: { type: 'swipe', direction, velocity, timestamp: new Date().toLocaleTimeString() },
      })
    );
  }

  /**
   * Handle rotation gestures
   */
  private handleRotationGesture(angle: number, _center: { x: number; y: number }): void {
    // Dispatch gesture event for test interface
    window.dispatchEvent(
      new CustomEvent('mobile-gesture-detected', {
        detail: { type: 'rotation', angle, timestamp: new Date().toLocaleTimeString() },
      })
    );
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
        // Four finger tap - toggle UI
        this.toggleUI();
        break;
      case 5:
        // Five finger tap - reset simulation
        this.reset();
        break;
    }

    // Dispatch gesture event for test interface
    window.dispatchEvent(
      new CustomEvent('mobile-gesture-detected', {
        detail: { type: 'multi-finger', fingerCount, timestamp: new Date().toLocaleTimeString() },
      })
    );
  }

  /**
   * Handle edge swipes
   */
  private handleEdgeSwipe(edge: string): void {
    // Dispatch gesture event for test interface
    window.dispatchEvent(
      new CustomEvent('mobile-gesture-detected', {
        detail: { type: 'edge-swipe', edge, timestamp: new Date().toLocaleTimeString() },
      })
    );
  }

  /**
   * Handle force touch
   */
  private handleForceTouch(force: number, position: Position): void {
    ifPattern(force > 0.7, () => {
      // Strong force touch - create organism at position
      this.placeOrganismAt(position);
    });

    // Dispatch gesture event for test interface
    window.dispatchEvent(
      new CustomEvent('mobile-gesture-detected', {
        detail: { type: 'force-touch', force, timestamp: new Date().toLocaleTimeString() },
      })
    );
  }

  /**
   * Toggle fullscreen mode
   */
  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  /**
   * Toggle UI visibility
   */
  private toggleUI(): void {
    const controls = document?.querySelector('.controls') as HTMLElement;
    const stats = document?.querySelector('.stats') as HTMLElement;

    if (controls && stats) {
      const isHidden = controls.style.display === 'none';
      controls.style.display = isHidden ? 'block' : 'none';
      stats.style.display = isHidden ? 'block' : 'none';
    }
  }

  /**
   * Place organism at specific position
   */
  private placeOrganismAt(position: Position): void {
    try {
      // Simple organism creation for demo
      const organism = {
        id: Date.now(),
        x: position.x,
        y: position.y,
        type: this.currentOrganismType,
        energy: 100,
        age: 0,
      };

      this.organisms.push(organism);

      // Track organism placement
      if (this.mobileAnalyticsManager) {
        // TODO: Implement trackEvent method in MobileAnalyticsManager
        // this.mobileAnalyticsManager.trackEvent('organism_placed', {
        //   type: this.currentOrganismType,
        //   position,
        //   method: 'force_touch',
        // });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Go to previous organism type
   */
  private previousOrganismType(): void {
    const types = ['bacteria', 'virus', 'algae', 'yeast'];
    const currentIndex = types.indexOf(this.currentOrganismType);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : types.length - 1;
    this.setOrganismType(types[previousIndex]);
  }

  /**
   * Go to next organism type
   */
  private nextOrganismType(): void {
    const types = ['bacteria', 'virus', 'algae', 'yeast'];
    const currentIndex = types.indexOf(this.currentOrganismType);
    const nextIndex = currentIndex < types.length - 1 ? currentIndex + 1 : 0;
    this.setOrganismType(types[nextIndex]);
  }

  private initializeEventListeners(): void {
    this.canvas?.addEventListener('click', event => {
      try {
        this.handleCanvasClick.bind(this)(event);
      } catch (error) {
        console.error('Event listener error for click:', error);
      }
    });
  }

  private logInitialization(): void {
    Logger.getInstance().logSystem('OrganismSimulation initialized successfully', {
      canvasSize: {
        width: this.canvas.width,
        height: this.canvas.height,
      },
      // TODO: Implement isMobileDevice method in MobileCanvasManager
      // isMobile: this.mobileCanvasManager.isMobileDevice(),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
      advancedMobileFeaturesEnabled: !!this.advancedMobileGestures,
    });
  }

  private handleCanvasClick(event: MouseEvent): void {
    try {
      const rect = this.canvas.getBoundingClientRect();
      const x = event?.clientX - rect.left;
      const y = event?.clientY - rect.top;

      this.placeOrganismAt({ x, y });
    } catch (error) {
      this.handleError(error);
    }
  }

  initializePopulation(): void {
    try {
      // Simple population initialization
      for (let i = 0; i < this.maxPopulation; i++) {
        const organism = {
          id: Date.now() + i,
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          type: this.currentOrganismType,
          energy: 50 + Math.random() * 50,
          age: 0,
        };
        this.organisms.push(organism);
      }
      Logger.getInstance().logSystem(`Population initialized with ${this.maxPopulation} organisms`);
    } catch (error) {
      this.handleError(error);
    }
  }

  start(): void {
    if (this.isRunning) return;

    try {
      this.isRunning = true;
      this.lastUpdateTime = performance.now();

      // Start mobile analytics if available
      if (this.mobileAnalyticsManager) {
        // TODO: Implement startSession method in MobileAnalyticsManager
        // this.mobileAnalyticsManager.startSession(); // Method doesn't exist yet
      }

      this.animate();
      Logger.getInstance().logSystem('Simulation started');
    } catch (error) {
      ErrorHandler.getInstance().handleError(error as Error);
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

      Logger.getInstance().logSystem('Simulation paused');
    } catch (error) {
      this.handleError(error);
    }
  }

  reset(): void {
    try {
      const _wasRunning = this.isRunning;
      this.pause();

      this.organisms = [];
      this.clearCanvas();
      this.currentSpeed = 1;

      // Track reset event
      if (this.mobileAnalyticsManager) {
        // TODO: Implement trackEvent method in MobileAnalyticsManager
        // this.mobileAnalyticsManager.trackEvent('simulation_reset', {
        //   was_running: wasRunning,
        //   // duration: this.mobileAnalyticsManager.getSessionDuration(), // Method doesn't exist yet
        // });
      }

      // Reset should leave the simulation in stopped state
      // ifPattern(wasRunning, () => { //   this.start();
      //  });

      Logger.getInstance().logSystem('Simulation reset');
    } catch (error) {
      this.handleError(error);
    }
  }

  clear(): void {
    try {
      this.organisms = [];
      this.clearCanvas();
      Logger.getInstance().logSystem('Simulation cleared');
    } catch (error) {
      this.handleError(error);
    }
  }

  private clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setSpeed(speed: number): void {
    try {
      this.currentSpeed = Math.max(0.1, Math.min(10, speed));
      this.updateInterval = 16 / this.currentSpeed;
      Logger.getInstance().logSystem(`Simulation speed set to ${this.currentSpeed}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  setOrganismType(type: string): void {
    try {
      this.currentOrganismType = type;
      Logger.getInstance().logSystem(`Organism type set to ${type}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  setMaxPopulation(limit: number): void {
    try {
      ifPattern(limit < 1 || limit > 5000, () => {
        throw new Error('Population limit must be between 1 and 5000');
      });
      this.maxPopulation = limit;
      Logger.getInstance().logSystem(`Max population set to ${limit}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  getStats(): SimulationStats {
    try {
      return {
        population: this.organisms.length,
        births: 0,
        deaths: 0,
        averageAge:
          this.organisms.reduce((sum, org) => sum + org.age, 0) /
          Math.max(this.organisms.length, 1),
        averageEnergy:
          this.organisms.reduce((sum, org) => sum + org.energy, 0) /
          Math.max(this.organisms.length, 1),
        time: performance.now(),
        generation: 0,
        isRunning: this.isRunning,
        placementMode: !this.isRunning,
      };
    } catch (error) {
      ErrorHandler.getInstance().handleError(error as Error);
      return {
        population: 0,
        births: 0,
        deaths: 0,
        averageAge: 0,
        averageEnergy: 0,
        time: 0,
        generation: 0,
        isRunning: false,
        placementMode: true,
      };
    }
  }

  private animate(): void {
    if (!this.isRunning) return;

    try {
      const currentTime = performance.now();
      ifPattern(currentTime - this.lastUpdateTime < this.updateInterval, () => {
        this.animationId = requestAnimationFrame(() => this.animate());
        return;
      });

      this.lastUpdateTime = currentTime;

      // Simple organism updates
      this.organisms.forEach(organism => {
        try {
          organism.age += 0.1;
          organism.x += (Math.random() - 0.5) * 2;
          organism.y += (Math.random() - 0.5) * 2;

          // Keep organisms in bounds
          organism.x = Math.max(0, Math.min(this.canvas.width, organism.x));
          organism.y = Math.max(0, Math.min(this.canvas.height, organism.y));
        } catch (error) {
          console.error('Callback error:', error);
        }
      });

      // Clear and render
      this.clearCanvas();

      // Render organisms
      this.organisms.forEach(organism => {
        try {
          this.context.fillStyle = this.getOrganismColor(organism.type);
          this.context.beginPath();
          this.context.arc(organism.x, organism.y, 3, 0, Math.PI * 2);
          this.context.fill();
        } catch (error) {
          console.error('Callback error:', error);
        }
      });

      // Render mobile visual effects if available
      if (this.mobileVisualEffects) {
        // TODO: Implement render method in MobileVisualEffects
        // this.mobileVisualEffects.render(); // Method doesn't exist yet
      }

      // Update statistics (commented out due to type mismatch)
      // this.statisticsManager.updateAllStats(this.getStats());

      // Continue animation loop
      this.animationId = requestAnimationFrame(() => this.animate());
    } catch {
      /* handled */
    }
  }

  private getOrganismColor(type: string): string {
    switch (type) {
      case 'bacteria':
        return '#4CAF50';
      case 'virus':
        return '#f44336';
      case 'algae':
        return '#2196F3';
      case 'yeast':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  }

  /**
   * Get advanced mobile features status
   */
  getMobileFeatureStatus(): Record<string, boolean> {
    return {
      // TODO: Implement isMobileDevice method in MobileCanvasManager
      // isMobileDevice: this.mobileCanvasManager.isMobileDevice(),
      isMobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
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
  async captureAndShare(_options?: { includeVideo?: boolean }): Promise<void> {
    if (this.mobileSocialManager) {
      try {
        // TODO: Implement these methods in MobileSocialManager
        // const screenshot = await this.mobileSocialManager.captureScreenshot();
        // if (screenshot) {
        //   await this.mobileSocialManager.shareImage(screenshot);
        // }
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  /**
   * Cleanup method for proper disposal
   */
  dispose(): void {
    try {
      this.pause();

      // TODO: Implement dispose methods in mobile feature classes
      // this.advancedMobileGestures?.dispose();
      // this.mobileVisualEffects?.dispose();
      // this.mobilePWAManager?.dispose();
      // this.mobileAnalyticsManager?.dispose();
      // this.mobileSocialManager?.dispose();

      Logger.getInstance().logSystem('OrganismSimulation disposed successfully');
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Centralized error handling for simulation operations
   */
  private handleError(error: unknown): void {
    ErrorHandler.getInstance().handleError(error as Error);
  }
}

// WebGL context cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && gl.getExtension) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } // TODO: Consider extracting to reduce closure scope
    });
  });
}
