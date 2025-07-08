/**
 * Enhanced logging system for the organism simulation
 * Provides structured logging with different categories and levels
 */

/**
 * Log levels for different types of information
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  USER_ACTION: 'user_action',
  SYSTEM: 'system'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

/**
 * Log categories for organizing different types of logs
 */
export const LogCategory = {
  // Application lifecycle
  INIT: 'initialization',
  SHUTDOWN: 'shutdown',
  
  // Simulation events
  SIMULATION: 'simulation',
  ORGANISM: 'organism',
  RENDERING: 'rendering',
  
  // User interactions
  USER_INPUT: 'user_input',
  UI_INTERACTION: 'ui_interaction',
  
  // Performance and metrics
  PERFORMANCE: 'performance',
  METRICS: 'metrics',
  
  // System events
  SYSTEM: 'system',
  BROWSER: 'browser',
  
  // Game features
  ACHIEVEMENTS: 'achievements',
  CHALLENGES: 'challenges',
  POWERUPS: 'powerups',
  
  // Error handling
  ERROR: 'error'
} as const;

export type LogCategory = typeof LogCategory[keyof typeof LogCategory];

/**
 * Structured log entry interface
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  context?: string;
  sessionId?: string;
  userId?: string;
  userAgent?: string;
  url?: string;
}

/**
 * Enhanced logger class with structured logging capabilities
 */
export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogSize = 1000;
  private sessionId: string;
  private isEnabled = true;
  private logLevels: Set<LogLevel> = new Set([
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
    LogLevel.PERFORMANCE,
    LogLevel.USER_ACTION,
    LogLevel.SYSTEM
  ]);

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Main logging method
   */
  log(level: LogLevel, category: LogCategory, message: string, data?: any, context?: string): void {
    if (!this.isEnabled || !this.logLevels.has(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data,
      context,
      sessionId: this.sessionId,
      userAgent: navigator?.userAgent,
      url: window?.location?.href
    };

    this.addToLogs(logEntry);
    this.outputToConsole(logEntry);
  }

  /**
   * Log application initialization events
   */
  logInit(message: string, data?: any): void {
    this.log(LogLevel.INFO, LogCategory.INIT, message, data);
  }

  /**
   * Log simulation events
   */
  logSimulation(message: string, data?: any): void {
    this.log(LogLevel.INFO, LogCategory.SIMULATION, message, data);
  }

  /**
   * Log organism-related events
   */
  logOrganism(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, LogCategory.ORGANISM, message, data);
  }

  /**
   * Log user actions
   */
  logUserAction(action: string, data?: any): void {
    this.log(LogLevel.USER_ACTION, LogCategory.USER_INPUT, action, data);
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, value: number, unit?: string): void {
    this.log(LogLevel.PERFORMANCE, LogCategory.PERFORMANCE, metric, {
      value,
      unit: unit || 'ms'
    });
  }

  /**
   * Log system information
   */
  logSystem(message: string, data?: any): void {
    this.log(LogLevel.SYSTEM, LogCategory.SYSTEM, message, data);
  }

  /**
   * Log achievement unlocks
   */
  logAchievement(achievementName: string, data?: any): void {
    this.log(LogLevel.INFO, LogCategory.ACHIEVEMENTS, `Achievement unlocked: ${achievementName}`, data);
  }

  /**
   * Log challenge events
   */
  logChallenge(message: string, data?: any): void {
    this.log(LogLevel.INFO, LogCategory.CHALLENGES, message, data);
  }

  /**
   * Log power-up events
   */
  logPowerUp(message: string, data?: any): void {
    this.log(LogLevel.INFO, LogCategory.POWERUPS, message, data);
  }

  /**
   * Log errors (integrates with ErrorHandler)
   */
  logError(error: Error, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, LogCategory.ERROR, error.message, {
      name: error.name,
      stack: error.stack,
      ...data
    }, context);
  }

  /**
   * Add log entry to internal storage
   */
  private addToLogs(logEntry: LogEntry): void {
    this.logs.push(logEntry);
    
    // Keep logs manageable
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
  }

  /**
   * Output log to console with appropriate formatting
   */
  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.category.toUpperCase()}]`;
    const message = logEntry.context ? `${logEntry.message} (${logEntry.context})` : logEntry.message;
    
    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, logEntry.data);
        break;
      case LogLevel.INFO:
      case LogLevel.SYSTEM:
        console.info(prefix, message, logEntry.data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, logEntry.data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, logEntry.data);
        break;
      case LogLevel.PERFORMANCE:
        console.info(`⚡ ${prefix}`, message, logEntry.data);
        break;
      case LogLevel.USER_ACTION:
        console.info(`👤 ${prefix}`, message, logEntry.data);
        break;
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set which log levels to output
   */
  setLogLevels(levels: LogLevel[]): void {
    this.logLevels = new Set(levels);
  }

  /**
   * Get logging statistics
   */
  getLogStats(): { total: number; byLevel: Record<string, number>; byCategory: Record<string, number> } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get system information for logging
   */
  getSystemInfo(): any {
    return {
      userAgent: navigator?.userAgent,
      platform: navigator?.platform,
      language: navigator?.language,
      cookieEnabled: navigator?.cookieEnabled,
      onLine: navigator?.onLine,
      screenResolution: `${screen?.width}x${screen?.height}`,
      colorDepth: screen?.colorDepth,
      timezoneOffset: new Date().getTimezoneOffset(),
      url: window?.location?.href,
      referrer: document?.referrer,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceLogger {
  private static instance: PerformanceLogger;
  private logger: Logger;
  private performanceMarks: Map<string, number> = new Map();

  private constructor() {
    this.logger = Logger.getInstance();
  }

  static getInstance(): PerformanceLogger {
    if (!PerformanceLogger.instance) {
      PerformanceLogger.instance = new PerformanceLogger();
    }
    return PerformanceLogger.instance;
  }

  /**
   * Start timing an operation
   */
  startTiming(operation: string): void {
    this.performanceMarks.set(operation, performance.now());
  }

  /**
   * End timing an operation and log the result
   */
  endTiming(operation: string, logMessage?: string): number {
    const startTime = this.performanceMarks.get(operation);
    if (!startTime) {
      this.logger.logError(new Error(`No start time found for operation: ${operation}`));
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.logger.logPerformance(
      logMessage || `Operation: ${operation}`,
      duration,
      'ms'
    );

    this.performanceMarks.delete(operation);
    return duration;
  }

  /**
   * Log frame rate
   */
  logFrameRate(fps: number): void {
    this.logger.logPerformance('Frame Rate', fps, 'fps');
  }

  /**
   * Log memory usage (if available)
   */
  logMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.logger.logPerformance('Memory Usage', memory.usedJSHeapSize, 'bytes');
    }
  }
}

// Export convenience functions
export const log = Logger.getInstance();
export const perf = PerformanceLogger.getInstance();
