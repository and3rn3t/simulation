/**
 * Mobile Performance Manager - Optimizes simulation performance for mobile devices
 */

export interface MobilePerformanceConfig {
  maxOrganisms: number;
  targetFPS: number;
  enableObjectPooling: boolean;
  enableBatching: boolean;
  reducedEffects: boolean;
  batterySaverMode: boolean;
}

export class MobilePerformanceManager {
  private static instance: MobilePerformanceManager | null = null;
  private config: MobilePerformanceConfig;
  private performanceMonitoringId: number | null = null;
  private isDestroyed = false;
  private frameTime: number = 0;
  private lastFrameTime: number = 0;
  private frameSkipCounter: number = 0;
  private batteryLevel: number = 1;
  private isLowPowerMode: boolean = false;

  constructor(config?: Partial<MobilePerformanceConfig>) {
    this.config = {
      maxOrganisms: this.getOptimalOrganismCount(),
      targetFPS: this.getOptimalTargetFPS(),
      enableObjectPooling: true,
      enableBatching: true,
      reducedEffects: this.shouldReduceEffects(),
      batterySaverMode: false,
      ...config,
    };

    this.initializeBatteryAPI();
    this.setupPerformanceMonitoring();
  }

  /**
   * Get optimal organism count based on device capabilities
   */
  private getOptimalOrganismCount(): number {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!isMobile) return 1000; // Desktop default

    // Mobile device optimization
    const memory = (navigator as any).deviceMemory || 4; // GB, fallback to 4GB
    const cores = navigator.hardwareConcurrency || 4;

    // Calculate based on device specs
    if (memory <= 2) return 200; // Low-end device
    if (memory <= 4) return 400; // Mid-range device
    if (memory <= 6) return 600; // High-end device
    return 800; // Premium device
  }

  /**
   * Get optimal target FPS based on device and battery
   */
  private getOptimalTargetFPS(): number {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!isMobile) return 60; // Desktop default

    // Check for battery saver mode or low battery
    if (this.isLowPowerMode || this.batteryLevel < 0.2) {
      return 30; // Power saving mode
    }

    // Check device refresh rate capability
    const refreshRate = (screen as any).refreshRate || 60;
    return Math.min(60, refreshRate);
  }

  /**
   * Check if effects should be reduced
   */
  private shouldReduceEffects(): boolean {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!isMobile) return false;

    // Reduce effects on lower-end devices
    const memory = (navigator as any).deviceMemory || 4;
    return memory <= 3;
  }

  /**
   * Initialize Battery API if available
   */
  private async initializeBatteryAPI(): Promise<void> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();

        this.batteryLevel = battery.level;
        this.isLowPowerMode = this.batteryLevel < 0.2;

        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level;
          this.adjustPerformanceForBattery();
        });

        battery.addEventListener('chargingchange', () => {
          this.adjustPerformanceForBattery();
        });
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        // Every second
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;

        // Adjust performance based on actual FPS
        this.adjustPerformanceForFPS(fps);
      }

      if (!this.isDestroyed) {
        this.performanceMonitoringId = requestAnimationFrame(measurePerformance);
      }
    };

    this.performanceMonitoringId = requestAnimationFrame(measurePerformance);
  }

  /**
   * Adjust performance settings based on battery level
   */
  private adjustPerformanceForBattery(): void {
    const wasBatterySaver = this.config.batterySaverMode;

    this.config.batterySaverMode = this.batteryLevel < 0.15 || this.isLowPowerMode;

    if (this.config.batterySaverMode && !wasBatterySaver) {
      // Entering battery saver mode
      this.config.targetFPS = 20;
      this.config.maxOrganisms = Math.floor(this.config.maxOrganisms * 0.5);
      this.config.reducedEffects = true;

      console.log('📱 Entered battery saver mode');
    } else if (!this.config.batterySaverMode && wasBatterySaver) {
      // Exiting battery saver mode
      this.config.targetFPS = this.getOptimalTargetFPS();
      this.config.maxOrganisms = this.getOptimalOrganismCount();
      this.config.reducedEffects = this.shouldReduceEffects();

      console.log('📱 Exited battery saver mode');
    }
  }

  /**
   * Adjust performance settings based on actual FPS
   */
  private adjustPerformanceForFPS(actualFPS: number): void {
    const targetFPS = this.config.targetFPS;
    const fpsRatio = actualFPS / targetFPS;

    if (fpsRatio < 0.8) {
      // Performance is poor
      // Reduce quality settings
      this.config.maxOrganisms = Math.max(100, Math.floor(this.config.maxOrganisms * 0.9));
      this.config.reducedEffects = true;

      console.log(`📱 Reduced performance settings (FPS: ${actualFPS}/${targetFPS})`);
    } else if (fpsRatio > 1.2 && actualFPS > targetFPS) {
      // Performance is good
      // Can potentially increase quality
      if (this.config.maxOrganisms < this.getOptimalOrganismCount()) {
        this.config.maxOrganisms = Math.min(
          this.getOptimalOrganismCount(),
          Math.floor(this.config.maxOrganisms * 1.1)
        );
      }
    }
  }

  /**
   * Check if frame should be skipped for performance
   */
  public shouldSkipFrame(): boolean {
    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    const targetFrameTime = 1000 / this.config.targetFPS;

    if (this.frameTime < targetFrameTime * 0.8) {
      this.frameSkipCounter++;
      return this.frameSkipCounter % 2 === 0; // Skip every other frame if running too fast
    }

    this.frameSkipCounter = 0;
    return false;
  }

  /**
   * Get current performance configuration
   */
  public getConfig(): MobilePerformanceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MobilePerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get performance recommendations
   */
  public getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.batteryLevel < 0.2) {
      recommendations.push('Battery low - consider reducing simulation complexity');
    }

    if (this.config.maxOrganisms > 500) {
      recommendations.push('High organism count may impact performance on mobile');
    }

    if (!this.config.enableObjectPooling) {
      recommendations.push('Enable object pooling for better memory management');
    }

    if (!this.config.reducedEffects && this.shouldReduceEffects()) {
      recommendations.push('Consider reducing visual effects for better performance');
    }

    return recommendations;
  }

  /**
   * Get device performance info
   */
  public getDeviceInfo(): object {
    return {
      memory: (navigator as any).deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 'unknown',
      batteryLevel: this.batteryLevel,
      isLowPowerMode: this.isLowPowerMode,
      userAgent: navigator.userAgent,
      currentConfig: this.config,
    };
  }

  /**
   * Stop performance monitoring and cleanup resources
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.performanceMonitoringId) {
      cancelAnimationFrame(this.performanceMonitoringId);
      this.performanceMonitoringId = null;
    }
  }
}
