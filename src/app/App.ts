import { AppConfig, createConfigFromEnv } from '../types';
import { ErrorHandler, initializeGlobalErrorHandlers } from '../utils/system/errorHandler';
import { Logger } from '../utils/system/logger';
import { MemoryPanelComponent } from '../ui/components/MemoryPanelComponent';
import { ConfigManager } from '../config/ConfigManager';
import { PerformanceManager } from '../utils/performance/PerformanceManager';

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
      console.warn('App already initialized');
      return;
    }

    try {
      console.log('🚀 Starting application initialization...');

      // Initialize global error handlers first
      initializeGlobalErrorHandlers();

      // Start performance monitoring if enabled
      if (this.configManager.getFeature('performanceMonitoring')) {
        this.performanceManager.startMonitoring(1000);
        console.log('📊 Performance monitoring enabled');
      }

      // Initialize core components based on configuration
      if (this.configManager.getFeature('memoryPanel')) {
        this.memoryPanelComponent = new MemoryPanelComponent();
        console.log('🧠 Memory panel initialized');
      }

      // Load environment-specific features
      if (this.configManager.isDevelopment()) {
        await this.initializeDevelopmentFeatures();
      }

      // Initialize simulation core
      await this.initializeSimulation();

      this.initialized = true;
      console.log('✅ Application initialization complete');

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
    console.log('🔧 Initializing development features...');

    if (this.configManager.getFeature('debugMode')) {
      try {
        await import('../dev/debugMode');
        // Initialize debug mode
        console.log('🐛 Debug mode enabled');
      } catch (error) {
        console.warn('Debug mode not available:', error);
      }
    }

    if (this.configManager.get('ui').enableVisualDebug) {
      // Initialize visual debugging
      console.log('👁️ Visual debugging enabled');
    }
  }

  /**
   * Initialize core simulation
   */
  private async initializeSimulation(): Promise<void> {
    console.log('🧬 Initializing simulation core...');
    
    try {
      // Import and initialize simulation components
      await import('../core/simulation');
      
      // Configure simulation based on app config
      const simulationConfig = this.configManager.getSimulationConfig();
      console.log(`🎯 Simulation configured: ${simulationConfig.defaultOrganismCount} organisms, ${simulationConfig.targetFPS} FPS`);
    } catch (error) {
      console.warn('Simulation core not available:', error);
    }
  }

  /**
   * Log configuration summary
   */
  private logConfigurationSummary(): void {
    const config = this.configManager.exportConfig();
    console.log('📋 Configuration Summary:', {
      environment: config.environment,
      features: Object.entries(config.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
      simulation: config.simulation,
      ui: config.ui,
    });
  }

  /**
   * Get performance health status
   */
  public getPerformanceHealth(): { healthy: boolean; issues: string[] } {
    return this.performanceManager.isPerformanceHealthy();
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
    feature: 'memoryPanel' | 'debugMode' | 'performanceMonitoring' | 'visualTesting' | 'errorReporting' | 'devTools' | 'hotReload' | 'analytics'
  ): boolean {
    return this.configManager.getFeature(feature);
  }

  /**
   * Cleanup and shutdown the application
   */
  public shutdown(): void {
    console.log('🛑 Shutting down application...');
    
    // Stop performance monitoring
    if (this.performanceManager) {
      this.performanceManager.stopMonitoring();
    }

    // Cleanup memory panel component
    if (this.memoryPanelComponent) {
      // Cleanup memory panel component
    }

    this.initialized = false;
    console.log('✅ Application shutdown complete');
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}
