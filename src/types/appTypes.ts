/**
 * Application configuration interface
 */
export interface AppConfig {
  environment: 'development' | 'testing' | 'production' | 'staging';
  features: {
    memoryPanel: boolean;
    debugMode: boolean;
    performanceMonitoring: boolean;
    visualTesting: boolean;
    errorReporting: boolean;
    devTools: boolean;
    hotReload: boolean;
    analytics: boolean;
  };
  simulation: {
    defaultOrganismCount: number;
    maxOrganismCount: number;
    targetFPS: number;
    memoryLimitMB: number;
  };
  ui: {
    theme: 'light' | 'dark';
    showAdvancedControls: boolean;
    enableVisualDebug: boolean;
    enableGridOverlay: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
  };
}

/**
 * Create configuration from environment variables
 */
export function createConfigFromEnv(): AppConfig {
  // Use globalThis to access Vite environment variables safely
  const env = (globalThis as any).__VITE_ENV__ || {};

  return {
    environment: (env.VITE_APP_ENVIRONMENT as AppConfig['environment']) || 'development',
    features: {
      memoryPanel: env.VITE_ENABLE_MEMORY_PANEL === 'true',
      debugMode: env.VITE_ENABLE_DEBUG_MODE === 'true',
      performanceMonitoring: env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
      visualTesting: env.VITE_ENABLE_VISUAL_TESTING === 'true',
      errorReporting: env.VITE_ENABLE_ERROR_REPORTING === 'true',
      devTools: env.VITE_ENABLE_DEV_TOOLS === 'true',
      hotReload: env.VITE_ENABLE_HOT_RELOAD === 'true',
      analytics: env.VITE_ENABLE_ANALYTICS === 'true',
    },
    simulation: {
      defaultOrganismCount: parseInt(env.VITE_DEFAULT_ORGANISM_COUNT) || 25,
      maxOrganismCount: parseInt(env.VITE_MAX_ORGANISM_COUNT) || 500,
      targetFPS: parseInt(env.VITE_TARGET_FPS) || 60,
      memoryLimitMB: parseInt(env.VITE_MEMORY_LIMIT_MB) || 200,
    },
    ui: {
      theme: (env.VITE_UI_THEME as AppConfig['ui']['theme']) || 'light',
      showAdvancedControls: env.VITE_SHOW_ADVANCED_CONTROLS === 'true',
      enableVisualDebug: env.VITE_ENABLE_VISUAL_DEBUG === 'true',
      enableGridOverlay: env.VITE_ENABLE_GRID_OVERLAY === 'true',
    },
    logging: {
      level: (env.VITE_LOG_LEVEL as AppConfig['logging']['level']) || 'error',
      enableConsole: env.VITE_ENABLE_CONSOLE_LOGS === 'true',
    },
  };
}

/**
 * Development configuration
 */
export const developmentConfig: AppConfig = {
  environment: 'development',
  features: {
    memoryPanel: true,
    debugMode: true,
    performanceMonitoring: true,
    visualTesting: false,
    errorReporting: true,
    devTools: true,
    hotReload: true,
    analytics: false,
  },
  simulation: {
    defaultOrganismCount: 50,
    maxOrganismCount: 1000,
    targetFPS: 60,
    memoryLimitMB: 500,
  },
  ui: {
    theme: 'dark',
    showAdvancedControls: true,
    enableVisualDebug: true,
    enableGridOverlay: true,
  },
  logging: {
    level: 'debug',
    enableConsole: true,
  },
};

/**
 * Production configuration
 */
export const productionConfig: AppConfig = {
  environment: 'production',
  features: {
    memoryPanel: false,
    debugMode: false,
    performanceMonitoring: false,
    visualTesting: false,
    errorReporting: true,
    devTools: false,
    hotReload: false,
    analytics: true,
  },
  simulation: {
    defaultOrganismCount: 25,
    maxOrganismCount: 500,
    targetFPS: 60,
    memoryLimitMB: 200,
  },
  ui: {
    theme: 'light',
    showAdvancedControls: false,
    enableVisualDebug: false,
    enableGridOverlay: false,
  },
  logging: {
    level: 'error',
    enableConsole: false,
  },
};

/**
 * Staging configuration
 */
export const stagingConfig: AppConfig = {
  environment: 'staging',
  features: {
    memoryPanel: false,
    debugMode: false,
    performanceMonitoring: true,
    visualTesting: false,
    errorReporting: true,
    devTools: false,
    hotReload: false,
    analytics: true,
  },
  simulation: {
    defaultOrganismCount: 30,
    maxOrganismCount: 750,
    targetFPS: 60,
    memoryLimitMB: 300,
  },
  ui: {
    theme: 'light',
    showAdvancedControls: true,
    enableVisualDebug: false,
    enableGridOverlay: false,
  },
  logging: {
    level: 'warn',
    enableConsole: true,
  },
};

/**
 * Testing configuration
 */
export const testingConfig: AppConfig = {
  environment: 'testing',
  features: {
    memoryPanel: false,
    debugMode: false,
    performanceMonitoring: true,
    visualTesting: true,
    errorReporting: false,
    devTools: true,
    hotReload: false,
    analytics: false,
  },
  simulation: {
    defaultOrganismCount: 10,
    maxOrganismCount: 100,
    targetFPS: 30,
    memoryLimitMB: 100,
  },
  ui: {
    theme: 'light',
    showAdvancedControls: true,
    enableVisualDebug: true,
    enableGridOverlay: true,
  },
  logging: {
    level: 'debug',
    enableConsole: true,
  },
};
