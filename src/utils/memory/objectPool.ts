import { Organism } from '../../core/organism';
import { BehaviorType, type OrganismType } from '../../models/organismTypes';
import { log } from '../system/logger';

/**
 * Generic object pool for efficient memory management
 * Reduces garbage collection pressure by reusing objects
 * @template T The type of objects to pool
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;
  private totalCreated = 0;
  private totalReused = 0;

  /**
   * Create a new object pool
   * @param createFn Function to create new objects
   * @param resetFn Function to reset objects when returned to pool
   * @param maxSize Maximum pool size (default: 1000)
   */
  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize: number = 1000) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * Get an object from the pool or create a new one
   */
  acquire(): T {
    try {
      if (this.pool.length > 0) {
        const obj = this.pool.pop()!;
        this.totalReused++;
        return obj;
      } else {
        this.totalCreated++;
        return this.createFn();
      }
    } catch {
      /* handled */
    }
  }

  /**
   * Return an object to the pool for reuse
   */
  release(obj: T): void {
    try {
      if (this.pool.length < this.maxSize) {
        this.resetFn(obj);
        this.pool.push(obj);
      }
      // If pool is full, let object be garbage collected
    } catch {
      /* handled */
    }
  }

  /**
   * Clear the pool and reset statistics
   */
  clear(): void {
    this.pool.length = 0;
    this.totalCreated = 0;
    this.totalReused = 0;
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      totalCreated: this.totalCreated,
      totalReused: this.totalReused,
      reuseRatio: this.totalCreated > 0 ? this.totalReused / this.totalCreated : 0,
    };
  }

  /**
   * Pre-populate the pool with objects
   */
  preFill(count: number): void {
    try {
      for (let i = 0; i < Math.min(count, this.maxSize); i++) {
        const obj = this.createFn();
        this.resetFn(obj);
        this.pool.push(obj);
      }

      log.logSystem('Object pool pre-filled', {
        poolType: this.constructor.name,
        count: this.pool.length,
        maxSize: this.maxSize,
      });
    } catch {
      /* handled */
    }
  }
}

/**
 * Pool statistics interface
 */
export interface PoolStats {
  poolSize: number;
  maxSize: number;
  totalCreated: number;
  totalReused: number;
  reuseRatio: number;
}

/**
 * Specialized pool for Organism objects
 */
export class OrganismPool extends ObjectPool<Organism> {
  private static instance: OrganismPool;

  private constructor() {
    super(
      // Create function - creates a temporary organism that will be reset
      () =>
        new Organism(0, 0, {
          name: 'temp',
          color: '#000000',
          size: 1,
          growthRate: 0,
          deathRate: 0,
          maxAge: 1,
          description: 'temporary',
          behaviorType: BehaviorType.PRODUCER,
          initialEnergy: 100,
          maxEnergy: 200,
          energyConsumption: 1,
        }),
      // Reset function - prepares organism for reuse
      (organism: Organism) => {
        organism.x = 0;
        organism.y = 0;
        organism.age = 0;
        organism.reproduced = false;
        // Note: type will be set when the organism is actually used
      },
      1000 // Max pool size
    );
  }

  /**
   * Get singleton instance
   */
  static getInstance(): OrganismPool {
    if (!OrganismPool.instance) {
      OrganismPool.instance = new OrganismPool();
    }
    return OrganismPool.instance;
  }

  /**
   * Acquire an organism with specific parameters
   */
  acquireOrganism(x: number, y: number, type: OrganismType): Organism {
    const organism = this.acquire();

    // Initialize the organism with the specified parameters
    organism.x = x;
    organism.y = y;
    organism.age = 0;
    organism.type = type;
    organism.reproduced = false;

    return organism;
  }

  /**
   * Release an organism back to the pool
   */
  releaseOrganism(organism: Organism): void {
    this.release(organism);
  }
}

/**
 * Array pool for managing temporary arrays to reduce allocations
 */
export class ArrayPool<T> {
  private pools: Map<number, T[][]> = new Map();
  private maxPoolSize = 100;

  /**
   * Get an array of specified length
   */
  getArray(length: number): T[] {
    const pool = this.pools.get(length);
    if (pool && pool.length > 0) {
      const array = pool.pop()!;
      array.length = 0; // Clear the array
      return array;
    }
    return new Array<T>(length);
  }

  /**
   * Return an array to the pool
   */
  releaseArray(array: T[]): void {
    const length = array.length;
    let pool = this.pools.get(length);

    if (!pool) {
      pool = [];
      this.pools.set(length, pool);
    }

    if (pool.length < this.maxPoolSize) {
      array.length = 0; // Clear the array
      pool.push(array);
    }
  }

  /**
   * Clear all pools
   */
  clear(): void {
    this.pools.clear();
  }

  /**
   * Get pool statistics
   */
  getStats(): { totalPools: number; totalArrays: number } {
    let totalArrays = 0;
    this.pools.forEach(pool => {
      try {
        totalArrays += pool.length;
      } catch (error) {
        console.error('Callback error:', error);
      }
    });

    return {
      totalPools: this.pools.size,
      totalArrays,
    };
  }
}

/**
 * Global array pool instance
 */
export const arrayPool = new ArrayPool<any>();
