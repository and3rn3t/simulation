import { ConfigManager } from '../config/ConfigManager';
import { AppConfig, createConfigFromEnv } from '../types/appTypes';
import { MemoryPanelComponent } from '../ui/components/MemoryPanelComponent';
import { PerformanceManager } from '../utils/performance/PerformanceManager';
import { ErrorHandler, initializeGlobalErrorHandlers } from '../utils/system/errorHandler';
import { Logger } from '../utils/system/logger';

/**
 * Main application class that orchestrates initialization and lifecycle
 * Consolidates logic from multiple main.ts files into a single, clean entry point
 */
export class App {
  private static instance: App;
  private initialized: boolean = false;
  private memoryPanelComponent?: MemoryPanelComponent;
  private logger: Logger;
  private configManager: ConfigManager;
  private performanceManager: PerformanceManager;

  private constructor(private config: AppConfig) {
    this.logger = Logger.getInstance();
    this.configManager = ConfigManager.initialize(config);
    this.performanceManager = PerformanceManager.getInstance();
  }

  public static getInstance(config?: AppConfig): App {
    if (!App.instance) {
      const finalConfig = config || createConfigFromEnv();
      App.instance = new App(finalConfig);
    }
    return App.instance;
  }

  /**
   * Initialize the application with error handling and component setup
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize global error handlers first
      initializeGlobalErrorHandlers();

      // Start performance monitoring if enabled
      if (this.configManager.getFeature('performanceMonitoring')) {
        this.performanceManager.startMonitoring(1000);
      }

      // Initialize core components based on configuration
      if (this.configManager.getFeature('memoryPanel')) {
        this.memoryPanelComponent = new MemoryPanelComponent();
      }

      // Load environment-specific features
      if (this.configManager.isDevelopment()) {
        await this.initializeDevelopmentFeatures();
      }

      // Initialize simulation core
      await this.initializeSimulation();

      this.initialized = true;

      // Log configuration summary
      this.logConfigurationSummary();
    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error('Unknown initialization error'),
        'HIGH' as any,
        'App initialization'
      );
      throw error;
    }
  }

  /**
   * Initialize development-specific features
   */
  private async initializeDevelopmentFeatures(): Promise<void> {
    if (this.configManager.getFeature('debugMode')) {
      try {
        await import('../dev/debugMode');
        // Initialize debug mode
      } catch (_error) {
        /* handled */
      }
    }

    if (this.configManager.get('ui').enableVisualDebug) {
      // Initialize visual debugging
    }
  }

  /**
   * Initialize core simulation
   */
  private async initializeSimulation(): Promise<void> {
    try {
      // Import and initialize simulation components
      await import('../core/simulation');

      // Configure simulation based on app config
      const _simulationConfig = this.configManager.getSimulationConfig();
    } catch (_error) {
      /* handled */
    }
  }

  /**
   * Log configuration summary
   */
  private logConfigurationSummary(): void {
    const config = this.configManager.exportConfig();
    const enabledFeatures = Object.entries(config.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature);
    console.log({
      enabledFeatures,
      simulation: config.simulation,
      ui: config.ui,
    });
  }

  /**
   * Get performance health status
   */
  public getPerformanceHealth(): { healthy: boolean; issues: string[] } {
    const isHealthy = this.performanceManager.isPerformanceHealthy();
    return {
      healthy: isHealthy,
      issues: isHealthy ? [] : ['Performance may be degraded'],
    };
  }

  /**
   * Get current configuration
   */
  public getConfig(): AppConfig {
    return this.configManager.exportConfig();
  }

  /**
   * Check if feature is enabled
   */
  public isFeatureEnabled(
    feature:
      | 'memoryPanel'
      | 'debugMode'
      | 'performanceMonitoring'
      | 'visualTesting'
      | 'errorReporting'
      | 'devTools'
      | 'hotReload'
      | 'analytics'
  ): boolean {
    return this.configManager.getFeature(feature);
  }

  /**
   * Cleanup and shutdown the application
   */
  public shutdown(): void {
    // Stop performance monitoring
    if (this.performanceManager) {
      this.performanceManager.stopMonitoring();
    }

    // Cleanup memory panel component
    if (this.memoryPanelComponent) {
      // Cleanup memory panel component
    }

    this.initialized = false;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}
