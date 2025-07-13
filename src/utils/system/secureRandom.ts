/**
 * Cryptographically Secure Random Number Generator
 *
 * This utility provides secure random number generation for security-sensitive operations
 * while maintaining fallbacks for non-security-critical use cases.
 *
 * Security Classification:
 * - CRITICAL: Session IDs, tokens, cryptographic keys
 * - HIGH: User IDs, task identifiers, authentication-related values
 * - MEDIUM: UI component IDs, analytics sampling
 * - LOW: Visual effects, simulation randomness (can use Math.random)
 */

import { ConfigurationError, ErrorHandler, ErrorSeverity } from './errorHandler';

export enum RandomSecurityLevel {
  CRITICAL = 'critical', // Must use crypto.getRandomValues
  HIGH = 'high', // Should use crypto.getRandomValues, fallback allowed with warning
  MEDIUM = 'medium', // Prefer crypto.getRandomValues, Math.random acceptable
  LOW = 'low', // Math.random is acceptable
}

export interface SecureRandomConfig {
  securityLevel: RandomSecurityLevel;
  context: string; // Description of what this random value is used for
}

export class SecureRandom {
  private static instance: SecureRandom;
  private cryptoAvailable: boolean;

  private constructor() {
    this.cryptoAvailable = this.checkCryptoAvailability();
  }

  public static getInstance(): SecureRandom {
    if (!SecureRandom.instance) {
      SecureRandom.instance = new SecureRandom();
    }
    return SecureRandom.instance;
  }

  /**
   * Check if crypto.getRandomValues is available
   */
  private checkCryptoAvailability(): boolean {
    try {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        // Test crypto availability
        const testArray = new Uint8Array(1);
        crypto.getRandomValues(testArray);
        return true;
      }
      return false;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Generate cryptographically secure random bytes
   */
  public getRandomBytes(length: number, config: SecureRandomConfig): Uint8Array {
    const randomBytes = new Uint8Array(length);

    if (this.cryptoAvailable) {
      crypto.getRandomValues(randomBytes);
      return randomBytes;
    }

    // Handle fallback based on security level
    switch (config.securityLevel) {
      case RandomSecurityLevel.CRITICAL: {
        const error = new ConfigurationError(
          `Cryptographically secure random generation required for ${config.context} but crypto.getRandomValues is not available`
        );
        ErrorHandler.getInstance().handleError(error, ErrorSeverity.CRITICAL, config.context);
        throw error;
      }

      case RandomSecurityLevel.HIGH:
        ErrorHandler.getInstance().handleError(
          new ConfigurationError(
            `Using insecure fallback for high-security context: ${config.context}`
          ),
          ErrorSeverity.HIGH,
          config.context
        );
        break;

      case RandomSecurityLevel.MEDIUM:
        ErrorHandler.getInstance().handleError(
          new ConfigurationError(
            `Using insecure fallback for medium-security context: ${config.context}`
          ),
          ErrorSeverity.MEDIUM,
          config.context
        );
        break;

      case RandomSecurityLevel.LOW:
        // Math.random is acceptable for low-security contexts
        break;
    }

    // Fallback to Math.random (not cryptographically secure)
    for (let i = 0; i < length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }

    return randomBytes;
  }

  /**
   * Generate a secure random string (base36)
   */
  public getRandomString(length: number, config: SecureRandomConfig): string {
    const byteLength = Math.ceil(length * 0.8); // Approximate byte length for base36
    const randomBytes = this.getRandomBytes(byteLength, config);

    return Array.from(randomBytes)
      .map(byte => byte.toString(36))
      .join('')
      .substr(0, length);
  }

  /**
   * Generate a secure random number between 0 and 1
   */
  public getRandomFloat(config: SecureRandomConfig): number {
    const randomBytes = this.getRandomBytes(4, config);
    const randomInt =
      (randomBytes[0] << 24) | (randomBytes[1] << 16) | (randomBytes[2] << 8) | randomBytes[3];
    return (randomInt >>> 0) / 0x100000000; // Convert to 0-1 range
  }

  /**
   * Generate a secure random integer within a range
   */
  public getRandomInt(min: number, max: number, config: SecureRandomConfig): number {
    const range = max - min;
    const randomFloat = this.getRandomFloat(config);
    return Math.floor(randomFloat * range) + min;
  }

  /**
   * Generate a cryptographically secure session ID
   */
  public generateSessionId(prefix = 'session'): string {
    const config: SecureRandomConfig = {
      securityLevel: RandomSecurityLevel.CRITICAL,
      context: 'Session ID generation',
    };

    const timestamp = Date.now();
    const randomStr = this.getRandomString(12, config);

    return `${prefix}_${timestamp}_${randomStr}`;
  }

  /**
   * Generate a secure task ID
   */
  public generateTaskId(prefix = 'task'): string {
    const config: SecureRandomConfig = {
      securityLevel: RandomSecurityLevel.HIGH,
      context: 'Task ID generation',
    };

    const timestamp = Date.now();
    const randomStr = this.getRandomString(9, config);

    return `${prefix}_${timestamp}_${randomStr}`;
  }

  /**
   * Generate a secure UI component ID
   */
  public generateUIId(prefix: string): string {
    const config: SecureRandomConfig = {
      securityLevel: RandomSecurityLevel.MEDIUM,
      context: 'UI component ID generation',
    };

    const randomStr = this.getRandomString(9, config);
    return `${prefix}-${randomStr}`;
  }

  /**
   * Generate secure random for analytics sampling
   */
  public getAnalyticsSampleValue(): number {
    const config: SecureRandomConfig = {
      securityLevel: RandomSecurityLevel.MEDIUM,
      context: 'Analytics sampling',
    };

    return this.getRandomFloat(config);
  }

  /**
   * For non-security-critical simulation use, allows Math.random for performance
   */
  public getSimulationRandom(): number {
    const config: SecureRandomConfig = {
      securityLevel: RandomSecurityLevel.LOW,
      context: 'Simulation randomness',
    };

    // For performance in simulation, use Math.random directly for LOW security
    if (config.securityLevel === RandomSecurityLevel.LOW) {
      return Math.random();
    }

    return this.getRandomFloat(config);
  }

  /**
   * Get system information for security assessment
   */
  public getSecurityInfo(): { cryptoAvailable: boolean; recommendations: string[] } {
    const recommendations: string[] = [];

    if (!this.cryptoAvailable) {
      recommendations.push(
        'crypto.getRandomValues is not available - ensure HTTPS for browser environments'
      );
      recommendations.push(
        'Consider using a cryptographically secure random number generator polyfill'
      );
      recommendations.push('Avoid using this environment for security-critical operations');
    } else {
      recommendations.push('Cryptographically secure random generation is available');
      recommendations.push('Safe to use for security-critical operations');
    }

    return {
      cryptoAvailable: this.cryptoAvailable,
      recommendations,
    };
  }
}

// Export convenience functions
export const secureRandom = SecureRandom.getInstance();

/**
 * Convenience functions for common use cases
 */
export function generateSecureSessionId(prefix = 'session'): string {
  return secureRandom.generateSessionId(prefix);
}

export function generateSecureTaskId(prefix = 'task'): string {
  return secureRandom.generateTaskId(prefix);
}

export function generateSecureUIId(prefix: string): string {
  return secureRandom.generateUIId(prefix);
}

export function getSecureAnalyticsSample(): number {
  return secureRandom.getAnalyticsSampleValue();
}

export function getSimulationRandom(): number {
  return secureRandom.getSimulationRandom();
}

/**
 * Get security assessment for random number generation
 */
export function getRandomSecurityAssessment() {
  return secureRandom.getSecurityInfo();
}
