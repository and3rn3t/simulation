/**
 * Master Reliability Utilities
 * Single entry point for all reliability improvements
 */

import GlobalReliabilityManager from './globalReliabilityManager';
import NullSafetyUtils from './nullSafetyUtils';
import PromiseSafetyUtils from './promiseSafetyUtils';
import ResourceCleanupManager from './resourceCleanupManager';

export class ReliabilityKit {
  private static isInitialized = false;

  /**
   * Initialize all reliability systems
   */
  static init(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize global error handling
      GlobalReliabilityManager.getInstance().init();
      
      // Initialize resource cleanup
      ResourceCleanupManager.getInstance().init();
      
      this.isInitialized = true;
      console.log('✅ ReliabilityKit initialized successfully');
    } catch (error) {
      console.error('ReliabilityKit initialization failed:', error);
    }
  }

  /**
   * Get overall system health
   */
  static getSystemHealth(): {
    globalErrors: number;
    resourceUsage: any;
    isHealthy: boolean;
  } {
    try {
      const globalStats = GlobalReliabilityManager.getInstance().getStats();
      const resourceStats = ResourceCleanupManager.getInstance().getStats();
      
      return {
        globalErrors: globalStats.errorCount,
        resourceUsage: resourceStats,
        isHealthy: globalStats.isHealthy && resourceStats.timers < 50
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        globalErrors: -1,
        resourceUsage: {},
        isHealthy: false
      };
    }
  }

  // Re-export all utilities for convenience
  static get Safe() {
    return {
      execute: GlobalReliabilityManager.getInstance().safeExecute.bind(
        GlobalReliabilityManager.getInstance()
      ),
      executeAsync: GlobalReliabilityManager.getInstance().safeExecuteAsync.bind(
        GlobalReliabilityManager.getInstance()
      ),
      get: NullSafetyUtils.safeGet,
      call: NullSafetyUtils.safeCall,
      query: NullSafetyUtils.safeDOMQuery,
      promise: PromiseSafetyUtils.safePromise,
      promiseAll: PromiseSafetyUtils.safePromiseAll,
      setTimeout: ResourceCleanupManager.getInstance().safeSetTimeout.bind(
        ResourceCleanupManager.getInstance()
      ),
      addEventListener: ResourceCleanupManager.getInstance().safeAddEventListener.bind(
        ResourceCleanupManager.getInstance()
      )
    };
  }
}

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  ReliabilityKit.init();
}

// Export individual utilities
export {
  GlobalReliabilityManager,
  NullSafetyUtils,
  PromiseSafetyUtils,
  ResourceCleanupManager
};

export default ReliabilityKit;
