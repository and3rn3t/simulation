import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  Logger, 
  PerformanceLogger,
  LogLevel, 
  LogCategory,
  log,
  perf
} from '../src/utils/system/logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = Logger.getInstance();
    logger.clearLogs();
    
    // Enable all log levels for testing
    logger.setLogLevels([LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.PERFORMANCE, LogLevel.USER_ACTION, LogLevel.SYSTEM]);
    
    // Mock console methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should use the same instance as the exported log', () => {
      expect(log).toBe(Logger.getInstance());
    });
  });

  describe('Basic Logging', () => {
    it('should log messages with different levels', () => {
      // Temporarily enable debug logging for this test
      logger.setLogLevels([LogLevel.DEBUG, LogLevel.INFO, LogLevel.ERROR]);
      
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Test info message');
      logger.log(LogLevel.ERROR, LogCategory.ERROR, 'Test error message');
      logger.log(LogLevel.DEBUG, LogCategory.SYSTEM, 'Test debug message');

      const logs = logger.getRecentLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].level).toBe(LogLevel.INFO);
      expect(logs[1].level).toBe(LogLevel.ERROR);
      expect(logs[2].level).toBe(LogLevel.DEBUG);
    });

    it('should include timestamp and session info', () => {
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Test message');
      
      const logs = logger.getRecentLogs();
      expect(logs[0].timestamp).toBeInstanceOf(Date);
      expect(logs[0].sessionId).toBeDefined();
      expect(typeof logs[0].sessionId).toBe('string');
    });

    it('should handle data and context', () => {
      const testData = { key: 'value', number: 42 };
      logger.log(LogLevel.INFO, LogCategory.SIMULATION, 'Test with data', testData, 'test context');
      
      const logs = logger.getRecentLogs();
      expect(logs[0].data).toEqual(testData);
      expect(logs[0].context).toBe('test context');
    });
  });

  describe('Convenience Methods', () => {
    it('should provide convenience methods for common log types', () => {
      // Enable all log levels for this test
      logger.setLogLevels([
        LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, 
        LogLevel.PERFORMANCE, LogLevel.USER_ACTION, LogLevel.SYSTEM
      ]);
      
      logger.logInit('Init message');
      logger.logSimulation('Simulation message');
      logger.logUserAction('User action');
      logger.logAchievement('Achievement unlocked');
      logger.logChallenge('Challenge started');
      logger.logPowerUp('Power-up used');
      logger.logSystem('System info');

      const logs = logger.getRecentLogs();
      expect(logs).toHaveLength(7);
      expect(logs[0].category).toBe(LogCategory.INIT);
      expect(logs[1].category).toBe(LogCategory.SIMULATION);
      expect(logs[2].category).toBe(LogCategory.USER_INPUT);
      expect(logs[3].category).toBe(LogCategory.ACHIEVEMENTS);
      expect(logs[4].category).toBe(LogCategory.CHALLENGES);
      expect(logs[5].category).toBe(LogCategory.POWERUPS);
      expect(logs[6].category).toBe(LogCategory.SYSTEM);
    });

    it('should log performance metrics', () => {
      // Enable performance logging for this test
      logger.setLogLevels([LogLevel.PERFORMANCE]);
      
      logger.logPerformance('Frame time', 16.67, 'ms');
      
      const logs = logger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.PERFORMANCE);
      expect(logs[0].data).toEqual({ value: 16.67, unit: 'ms' });
    });

    it('should log errors with stack traces', () => {
      const testError = new Error('Test error');
      logger.logError(testError, 'test context');
      
      const logs = logger.getRecentLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe(LogLevel.ERROR);
      expect(logs[0].data.name).toBe('Error');
      expect(logs[0].data.stack).toBeDefined();
    });
  });

  describe('Log Filtering', () => {
    it('should filter logs by category', () => {
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Init message');
      logger.log(LogLevel.INFO, LogCategory.SIMULATION, 'Simulation message');
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Another init message');
      
      const initLogs = logger.getLogsByCategory(LogCategory.INIT);
      expect(initLogs).toHaveLength(2);
      expect(initLogs.every(log => log.category === LogCategory.INIT)).toBe(true);
    });

    it('should filter logs by level', () => {
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Info message');
      logger.log(LogLevel.ERROR, LogCategory.ERROR, 'Error message');
      logger.log(LogLevel.INFO, LogCategory.SIMULATION, 'Another info message');
      
      const infoLogs = logger.getLogsByLevel(LogLevel.INFO);
      expect(infoLogs).toHaveLength(2);
      expect(infoLogs.every(log => log.level === LogLevel.INFO)).toBe(true);
    });
  });

  describe('Log Management', () => {
    it('should provide log statistics', () => {
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Message 1');
      logger.log(LogLevel.ERROR, LogCategory.ERROR, 'Message 2');
      logger.log(LogLevel.INFO, LogCategory.SIMULATION, 'Message 3');
      
      const stats = logger.getLogStats();
      expect(stats.total).toBe(3);
      expect(stats.byLevel[LogLevel.INFO]).toBe(2);
      expect(stats.byLevel[LogLevel.ERROR]).toBe(1);
      expect(stats.byCategory[LogCategory.INIT]).toBe(1);
      expect(stats.byCategory[LogCategory.ERROR]).toBe(1);
      expect(stats.byCategory[LogCategory.SIMULATION]).toBe(1);
    });

    it('should export logs as JSON', () => {
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Test message');
      
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].message).toBe('Test message');
    });

    it('should clear logs', () => {
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Message 1');
      logger.log(LogLevel.INFO, LogCategory.INIT, 'Message 2');
      
      expect(logger.getRecentLogs()).toHaveLength(2);
      
      logger.clearLogs();
      expect(logger.getRecentLogs()).toHaveLength(0);
    });
  });

  describe('System Information', () => {
    it('should provide system information', () => {
      const systemInfo = logger.getSystemInfo();
      
      expect(systemInfo).toBeDefined();
      expect(typeof systemInfo.timestamp).toBe('string');
      expect(typeof systemInfo.timezoneOffset).toBe('number');
    });
  });
});

describe('PerformanceLogger', () => {
  let perfLogger: PerformanceLogger;

  beforeEach(() => {
    perfLogger = PerformanceLogger.getInstance();
    
    // Mock console methods
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  describe('Timing Operations', () => {
    it('should time operations', () => {
      perfLogger.startTiming('test-operation');
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait for at least 10ms
      }
      
      const duration = perfLogger.endTiming('test-operation');
      expect(duration).toBeGreaterThan(0);
    });

    it('should handle missing start times gracefully', () => {
      const duration = perfLogger.endTiming('non-existent-operation');
      expect(duration).toBe(0);
    });

    it('should log performance metrics', () => {
      // We need to mock the logger's log method to test this since it's internal
      const logSpy = vi.spyOn(Logger.getInstance(), 'log' as any);
      
      perfLogger.logFrameRate(60);
      
      // Check that the logger was called
      expect(logSpy).toHaveBeenCalled();
      
      logSpy.mockRestore();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PerformanceLogger.getInstance();
      const instance2 = PerformanceLogger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should use the same instance as the exported perf', () => {
      expect(perf).toBe(PerformanceLogger.getInstance());
    });
  });
});
