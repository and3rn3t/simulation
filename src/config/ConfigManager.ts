import type { AppConfig } from '../types/appTypes';

/**
 * Configuration manager for environment-specific settings
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor(config: AppConfig) {
    this.config = config;
  }

  public static initialize(config: AppConfig): ConfigManager {
    if (ConfigManager.instance) {
      throw new Error('ConfigManager already initialized');
    }
    ConfigManager.instance = new ConfigManager(config);
    return ConfigManager.instance;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      throw new Error('ConfigManager not initialized. Call initialize() first.');
    }
    return ConfigManager.instance;
  }

  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  public getFeature(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  public getEnvironment(): AppConfig['environment'] {
    return this.config.environment;
  }

  public isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public isTesting(): boolean {
    return this.config.environment === 'testing';
  }

  public getSimulationConfig(): AppConfig['simulation'] {
    return this.config.simulation;
  }

  public getUIConfig(): AppConfig['ui'] {
    return this.config.ui;
  }

  /**
   * Update configuration at runtime (for testing purposes)
   */
  public updateConfig(updates: Partial<AppConfig>): void {
    if (this.isProduction()) {
      throw new Error('Configuration updates not allowed in production');
    }
    
    this.config = { ...this.config, ...updates };
  }

  /**
   * Export current configuration (for debugging)
   */
  public exportConfig(): AppConfig {
    return { ...this.config };
  }
}
