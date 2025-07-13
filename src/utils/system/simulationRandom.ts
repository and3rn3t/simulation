/**
 * Simulation Random Utilities
 *
 * Provides randomness functions specifically for simulation purposes.
 * These functions prioritize performance while maintaining good randomness
 * for organism behavior simulation.
 */

import { getSimulationRandom } from './secureRandom';

export class SimulationRandom {
  private static instance: SimulationRandom;

  private constructor() {}

  public static getInstance(): SimulationRandom {
    if (!SimulationRandom.instance) {
      SimulationRandom.instance = new SimulationRandom();
    }
    return SimulationRandom.instance;
  }

  /**
   * Get random value for organism movement (-1 to 1 range)
   */
  public getMovementRandom(): number {
    return (getSimulationRandom() - 0.5) * 2;
  }

  /**
   * Get random position within bounds
   */
  public getRandomPosition(maxX: number, maxY: number): { x: number; y: number } {
    return {
      x: getSimulationRandom() * maxX,
      y: getSimulationRandom() * maxY,
    };
  }

  /**
   * Get random offset for offspring placement
   */
  public getOffspringOffset(maxOffset = 20): { x: number; y: number } {
    return {
      x: (getSimulationRandom() - 0.5) * maxOffset,
      y: (getSimulationRandom() - 0.5) * maxOffset,
    };
  }

  /**
   * Get random energy value within range
   */
  public getRandomEnergy(min: number, max: number): number {
    return min + getSimulationRandom() * (max - min);
  }

  /**
   * Check if random event should occur based on probability
   */
  public shouldEventOccur(probability: number): boolean {
    return getSimulationRandom() < probability;
  }

  /**
   * Get random size variation for organisms
   */
  public getSizeVariation(baseSize: number, variation = 0.4): number {
    return baseSize * (0.8 + getSimulationRandom() * variation);
  }

  /**
   * Get random velocity for particle systems
   */
  public getParticleVelocity(maxSpeed = 4): { vx: number; vy: number } {
    return {
      vx: (getSimulationRandom() - 0.5) * maxSpeed,
      vy: (getSimulationRandom() - 0.5) * maxSpeed,
    };
  }

  /**
   * Get random lifespan for organisms
   */
  public getRandomLifespan(baseLifespan: number, variation = 100): number {
    return baseLifespan + getSimulationRandom() * variation;
  }

  /**
   * Select random item from array
   */
  public selectRandom<T>(items: T[]): T {
    const index = Math.floor(getSimulationRandom() * items.length);
    return items[index];
  }

  /**
   * Get random color from array (for visual effects)
   */
  public getRandomColor(colors: string[]): string {
    return this.selectRandom(colors);
  }

  /**
   * Get random shake effect intensity
   */
  public getShakeOffset(intensity: number): { x: number; y: number } {
    return {
      x: (getSimulationRandom() - 0.5) * intensity,
      y: (getSimulationRandom() - 0.5) * intensity,
    };
  }
}

// Export singleton instance
export const simulationRandom = SimulationRandom.getInstance();

/**
 * Convenience functions for common simulation random operations
 */
export function getMovementRandom(): number {
  return simulationRandom.getMovementRandom();
}

export function getRandomPosition(maxX: number, maxY: number): { x: number; y: number } {
  return simulationRandom.getRandomPosition(maxX, maxY);
}

export function getOffspringOffset(maxOffset = 20): { x: number; y: number } {
  return simulationRandom.getOffspringOffset(maxOffset);
}

export function getRandomEnergy(min: number, max: number): number {
  return simulationRandom.getRandomEnergy(min, max);
}

export function shouldEventOccur(probability: number): boolean {
  return simulationRandom.shouldEventOccur(probability);
}

export function getSizeVariation(baseSize: number, variation = 0.4): number {
  return simulationRandom.getSizeVariation(baseSize, variation);
}

export function getParticleVelocity(maxSpeed = 4): { vx: number; vy: number } {
  return simulationRandom.getParticleVelocity(maxSpeed);
}

export function getRandomLifespan(baseLifespan: number, variation = 100): number {
  return simulationRandom.getRandomLifespan(baseLifespan, variation);
}

export function selectRandom<T>(items: T[]): T {
  return simulationRandom.selectRandom(items);
}

export function getRandomColor(colors: string[]): string {
  return simulationRandom.getRandomColor(colors);
}

export function getShakeOffset(intensity: number): { x: number; y: number } {
  return simulationRandom.getShakeOffset(intensity);
}
