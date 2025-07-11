// Main application exports
export { App } from './app/App';

// Configuration exports
export { ConfigManager } from './config/ConfigManager';
export type { AppConfig } from './types/appTypes';
export { 
  developmentConfig, 
  productionConfig, 
  testingConfig,
  stagingConfig,
  createConfigFromEnv 
} from './types/appTypes';

// Core exports - only export what exists and works
// export * from './core';

// Model exports - only export what exists and works  
// export * from './models';

// Feature exports - only export what exists and works
// export * from './features';

// UI exports - only export what exists and works
// export * from './ui';

// Service exports - only export what exists and works
// export * from './services';

// Type exports
export * from './types';

// Utility exports (selective to avoid conflicts)
export { ErrorHandler } from './utils/system/errorHandler';
export { Logger } from './utils/system/logger';
export { StatisticsManager } from './utils/game/statisticsManager';
export * from './utils/performance';
export * from './utils/algorithms';
export * from './utils/memory';
