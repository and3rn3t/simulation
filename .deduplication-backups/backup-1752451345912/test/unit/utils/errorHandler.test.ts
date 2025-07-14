import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ErrorHandler,
  ErrorSeverity,
  SimulationError,
  CanvasError,
  OrganismError,
  ConfigurationError,
  DOMError,
  safeExecute,
  withErrorHandling,
} from '../../../src/utils/system/errorHandler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    // Get a fresh instance for each test
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrors();

    // Mock console methods
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Error Classes', () => {
    it('should create custom error classes correctly', () => {
      const simError = new SimulationError('Test simulation error', 'SIM_001');
      expect(simError.name).toBe('SimulationError');
      expect(simError.code).toBe('SIM_001');
      expect(simError.message).toBe('Test simulation error');

      const canvasError = new CanvasError('Test canvas error');
      expect(canvasError.name).toBe('CanvasError');
      expect(canvasError.code).toBe('CANVAS_ERROR');

      const organismError = new OrganismError('Test organism error');
      expect(organismError.name).toBe('OrganismError');
      expect(organismError.code).toBe('ORGANISM_ERROR');

      const configError = new ConfigurationError('Test config error');
      expect(configError.name).toBe('ConfigurationError');
      expect(configError.code).toBe('CONFIG_ERROR');

      const domError = new DOMError('Test DOM error');
      expect(domError.name).toBe('DOMError');
      expect(domError.code).toBe('DOM_ERROR');
    });
  });

  describe('ErrorHandler', () => {
    it('should be a singleton', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should handle errors with different severity levels', () => {
      const testError = new Error('Test error');

      errorHandler.handleError(testError, ErrorSeverity.LOW);
      expect(console.info).toHaveBeenCalledWith('[LOW] Error: Test error');

      errorHandler.handleError(testError, ErrorSeverity.MEDIUM);
      expect(console.warn).toHaveBeenCalledWith('[MEDIUM] Error: Test error');

      errorHandler.handleError(testError, ErrorSeverity.HIGH);
      expect(console.error).toHaveBeenCalledWith('[HIGH] Error: Test error');

      errorHandler.handleError(testError, ErrorSeverity.CRITICAL);
      expect(console.error).toHaveBeenCalledWith('[CRITICAL] Error: Test error');
    });

    it('should add context to error messages', () => {
      const testError = new Error('Test error');

      errorHandler.handleError(testError, ErrorSeverity.MEDIUM, 'Test context');
      expect(console.warn).toHaveBeenCalledWith(
        '[MEDIUM] Error: Test error (Context: Test context)'
      );
    });

    it('should track recent errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      errorHandler.handleError(error1, ErrorSeverity.LOW);
      errorHandler.handleError(error2, ErrorSeverity.HIGH);

      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors).toHaveLength(2);
      expect(recentErrors[0].error.message).toBe('Error 1');
      expect(recentErrors[1].error.message).toBe('Error 2');
    });

    it('should provide error statistics', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      errorHandler.handleError(error1, ErrorSeverity.LOW);
      errorHandler.handleError(error2, ErrorSeverity.HIGH);

      const stats = errorHandler.getErrorStats();
      expect(stats.total).toBe(2);
      expect(stats.bySeverity[ErrorSeverity.LOW]).toBe(1);
      expect(stats.bySeverity[ErrorSeverity.HIGH]).toBe(1);
    });

    it('should clear errors', () => {
      const testError = new Error('Test error');
      errorHandler.handleError(testError, ErrorSeverity.LOW);

      expect(errorHandler.getRecentErrors()).toHaveLength(1);

      errorHandler.clearErrors();
      expect(errorHandler.getRecentErrors()).toHaveLength(0);
    });
  });

  describe('Utility Functions', () => {
    it('should safely execute functions', () => {
      const successFn = vi.fn(() => 'success');
      const errorFn = vi.fn(() => {
        throw new Error('Test error');
      });

      const result1 = safeExecute(successFn, 'Test context');
      expect(result1).toBe('success');
      expect(successFn).toHaveBeenCalled();

      const result2 = safeExecute(errorFn, 'Test context', 'fallback');
      expect(result2).toBe('fallback');
      expect(errorFn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        '[MEDIUM] Error: Test error (Context: Test context)'
      );
    });

    it('should create error-wrapped functions', () => {
      const testFn = vi.fn((x: number) => x * 2);
      const errorFn = vi.fn(() => {
        throw new Error('Test error');
      });

      const wrappedTestFn = withErrorHandling(testFn, 'Test context');
      const wrappedErrorFn = withErrorHandling(errorFn, 'Test context');

      expect(wrappedTestFn(5)).toBe(10);
      expect(testFn).toHaveBeenCalledWith(5);

      expect(wrappedErrorFn()).toBeUndefined();
      expect(errorFn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        '[MEDIUM] Error: Test error (Context: Test context)'
      );
    });
  });
});
