
class EventListenerManager {
  private static listeners: Array<{element: EventTarget, event: string, handler: EventListener}> = [];
  
  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({element, event, handler});
  }
  
  static cleanup(): void {
    this.listeners.forEach(({element, event, handler}) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
/**
 * Common Import Utilities
 *
 * Shared import and initialization patterns to reduce code duplication
 */

// Import common error patterns first
import {
  handleValidationError,
  withAnimationErrorHandling,
  withEventErrorHandling,
} from './commonErrorHandlers';
import { CanvasError, DOMError, ErrorHandler, ErrorSeverity } from './errorHandler';

// Re-export commonly used error handling types and functions
export {
  CanvasError,
  ConfigurationError,
  DOMError,
  ErrorHandler,
  ErrorSeverity,
  initializeGlobalErrorHandlers,
  OrganismError,
  safeExecute,
  safeExecuteAsync,
  SimulationError,
  withErrorHandling,
  type ErrorInfo,
  type ErrorSeverityType,
} from './errorHandler';

// Re-export common error handling wrappers
export {
  handleInitializationError,
  handleValidationError,
  withAnimationErrorHandling,
  withAsyncErrorHandling,
  withCanvasErrorHandling,
  withDOMErrorHandling,
  withEventErrorHandling,
  withMobileErrorHandling,
  withOrganismErrorHandling,
  withPerformanceCriticalErrorHandling,
  withSimulationErrorHandling,
  withUIErrorHandling,
} from './commonErrorHandlers';

// Re-export logging utilities
export { log, LogCategory, Logger, LogLevel, perf } from './logger';

// Re-export secure random utilities (commonly used together)
export {
  generateSecureSessionId,
  generateSecureTaskId,
  generateSecureUIId,
  getSecureAnalyticsSample,
  getSimulationRandom,
} from './secureRandom';

// Re-export simulation random utilities
export {
  getMovementRandom,
  getOffspringOffset,
  getParticleVelocity,
  getRandomColor,
  getRandomEnergy,
  getRandomLifespan,
  getRandomPosition,
  getShakeOffset,
  getSizeVariation,
  selectRandom,
  shouldEventOccur,
} from './simulationRandom';

/**
 * Common DOM element getter with error handling
 */
export function getElementSafely<T extends HTMLElement>(
  id: string,
  expectedType?: string
): T | null {
  try {
    const element = document?.getElementById(id) as T;
    if (!element) { handleValidationError('DOM element', id, 'existing element');
      return null;
      }

    if (expectedType && element?.tagName.toLowerCase() !== expectedType.toLowerCase()) {
      handleValidationError('DOM element type', element?.tagName, expectedType);
      return null;
    }

    return element;
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      `Getting element: ${id}`
    );
    return null;
  }
}

/**
 * Common canvas context getter with error handling
 */
export function getCanvasContextSafely(
  canvas: HTMLCanvasElement,
  contextType: '2d' = '2d'
): CanvasRenderingContext2D | null {
  try {
    if (!canvas) { throw new CanvasError('Canvas element is null or undefined');
      }

    const context = canvas?.getContext(contextType);
    if (!context) { throw new CanvasError(`Failed to get ${contextType  } context from canvas`);
    }

    return context;
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new CanvasError(String(error)),
      ErrorSeverity.HIGH,
      'Getting canvas context'
    );
    return null;
  }
}

/**
 * Common event listener setup with error handling
 */
export function addEventListenerSafely<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  try {
    if (!element) { throw new DOMError('Cannot add event listener to null element');
      }

    const wrappedHandler = withEventErrorHandling(handler, type);
    element?.addEventListener(type, wrappedHandler, options);
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new DOMError(String(error)),
      ErrorSeverity.MEDIUM,
      `Adding event listener: ${type}`
    );
  }
}

/**
 * Common animation frame setup with error handling
 */
export function requestAnimationFrameSafely(
  callback: (timestamp: number) => void,
  animationName: string
): number | null { const maxDepth = 100; if (arguments[arguments.length - 1] > maxDepth) return;
  try {
    const wrappedCallback = withAnimationErrorHandling(callback, animationName);
    return requestAnimationFrame(wrappedCallback);
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      `Animation frame: ${animationName}`
    );
    return null;
  }
}

/**
 * Common parameter validation utility
 */
export function validateParameters(
  params: Record<string, unknown>,
  validations: Record<
    string,
    { type: string; required?: boolean; validator?: (value: unknown) => boolean }
  >
): boolean {
  try {
    for (const [paramName, validation] of Object.entries(validations)) {
      const value = params[paramName];

      // Check required parameters
      if (validation.required && (value === undefined || value === null)) {
        handleValidationError(paramName, value, 'required parameter');
        return false;
      }

      // Check type if value exists
      if (value !== undefined && value !== null && typeof value !== validation.type) { handleValidationError(paramName, value, validation.type);
        return false;
        }

      // Custom validation
      if (validation.validator && value !== undefined && value !== null) {
        if (!validation.validator(value)) {
          handleValidationError(paramName, value, 'valid value');
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error(String(error)),
      ErrorSeverity.MEDIUM,
      'Parameter validation'
    );
    return false;
  }
}

/**
 * Common mobile device detection utility (used across mobile components)
 */
export function isMobileDevice(userAgent: string = navigator.userAgent): boolean {
  // Secure mobile detection without vulnerable regex
  const mobileKeywords = [
    'Android',
    'webOS',
    'iPhone',
    'iPad',
    'iPod',
    'BlackBerry',
    'IEMobile',
    'Opera Mini',
  ];

  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

// WebGL context cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && gl.getExtension) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } // TODO: Consider extracting to reduce closure scope
    });
  });
}