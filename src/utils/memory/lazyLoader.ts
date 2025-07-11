import { log } from '../system/logger';
import { ErrorHandler, ErrorSeverity } from '../system/errorHandler';
import { MemoryMonitor } from './memoryMonitor';

/**
 * Generic lazy loading interface
 */
export interface LazyLoadable<T> {
  id: string;
  isLoaded: boolean;
  data?: T;
  loader: () => Promise<T> | T;
  dependencies?: string[];
}

/**
 * Lazy loading result
 */
export interface LoadResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  fromCache: boolean;
}

/**
 * Lazy loading manager for efficient memory usage
 */
export class LazyLoader {
  private static instance: LazyLoader;
  private loadables: Map<string, LazyLoadable<any>> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private memoryMonitor: MemoryMonitor;
  private maxCacheSize = 50;
  private loadOrder: string[] = []; // For LRU eviction

  private constructor() {
    this.memoryMonitor = MemoryMonitor.getInstance();
    
    // Listen for memory cleanup events
    window.addEventListener('memory-cleanup', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.level === 'aggressive') {
        this.clearAll();
      } else {
        this.evictLeastRecentlyUsed();
      }
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): LazyLoader {
    if (!LazyLoader.instance) {
      LazyLoader.instance = new LazyLoader();
    }
    return LazyLoader.instance;
  }

  /**
   * Register a lazy loadable item
   */
  register<T>(loadable: LazyLoadable<T>): void {
    this.loadables.set(loadable.id, loadable);
    log.logSystem('Lazy loadable registered', { id: loadable.id, hasDependencies: Boolean(loadable.dependencies?.length) });
  }

  /**
   * Load an item by ID
   */
  async load<T>(id: string): Promise<LoadResult<T>> {
    try {
      const loadable = this.loadables.get(id);
      if (!loadable) {
        throw new Error(`Loadable with id '${id}' not found`);
      }

      // Check if already loaded
      if (loadable.isLoaded && loadable.data !== undefined) {
        this.updateLoadOrder(id);
        return {
          success: true,
          data: loadable.data as T,
          fromCache: true
        };
      }

      // Check if currently loading
      if (this.loadingPromises.has(id)) {
        const data = await this.loadingPromises.get(id);
        return {
          success: true,
          data: data as T,
          fromCache: false
        };
      }

      // Check memory before loading
      if (!this.memoryMonitor.isMemoryUsageSafe()) {
        this.evictLeastRecentlyUsed();
      }

      // Load dependencies first
      if (loadable.dependencies) {
        await this.loadDependencies(loadable.dependencies);
      }

      // Start loading
      const loadingPromise = this.performLoad(loadable);
      this.loadingPromises.set(id, loadingPromise);

      try {
        const data = await loadingPromise;
        loadable.data = data;
        loadable.isLoaded = true;
        this.updateLoadOrder(id);
        
        log.logSystem('Lazy loadable loaded', { id, memoryUsage: this.memoryMonitor.getMemoryUsagePercentage() });

        return {
          success: true,
          data: data as T,
          fromCache: false
        };
      } finally {
        this.loadingPromises.delete(id);
      }

    } catch (error) {
      ErrorHandler.getInstance().handleError(
        error instanceof Error ? error : new Error(`Failed to load ${id}`),
        ErrorSeverity.MEDIUM,
        'LazyLoader.load'
      );

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        fromCache: false
      };
    }
  }

  /**
   * Preload multiple items
   */
  async preload(ids: string[]): Promise<LoadResult<any>[]> {
    const results: LoadResult<any>[] = [];
    
    // Load in batches to avoid memory pressure
    const batchSize = 5;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.load(id));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Check memory after each batch
      if (!this.memoryMonitor.isMemoryUsageSafe()) {
        log.logSystem('Memory pressure detected during preload, stopping', { completed: i + batch.length, total: ids.length });
        break;
      }
    }
    
    return results;
  }

  /**
   * Unload an item to free memory
   */
  unload(id: string): boolean {
    const loadable = this.loadables.get(id);
    if (!loadable || !loadable.isLoaded) {
      return false;
    }

    loadable.data = undefined;
    loadable.isLoaded = false;
    this.removeFromLoadOrder(id);

    log.logSystem('Lazy loadable unloaded', { id });
    return true;
  }

  /**
   * Check if an item is loaded
   */
  isLoaded(id: string): boolean {
    const loadable = this.loadables.get(id);
    return loadable?.isLoaded ?? false;
  }

  /**
   * Get loaded data without triggering load
   */
  getData<T>(id: string): T | undefined {
    const loadable = this.loadables.get(id);
    if (loadable?.isLoaded) {
      this.updateLoadOrder(id);
      return loadable.data as T;
    }
    return undefined;
  }

  /**
   * Load dependencies
   */
  private async loadDependencies(dependencies: string[]): Promise<void> {
    const loadPromises = dependencies.map(depId => this.load(depId));
    await Promise.all(loadPromises);
  }

  /**
   * Perform the actual loading
   */
  private async performLoad<T>(loadable: LazyLoadable<T>): Promise<T> {
    const result = loadable.loader();
    return result instanceof Promise ? result : result;
  }

  /**
   * Update load order for LRU tracking
   */
  private updateLoadOrder(id: string): void {
    this.removeFromLoadOrder(id);
    this.loadOrder.push(id);
  }

  /**
   * Remove from load order
   */
  private removeFromLoadOrder(id: string): void {
    const index = this.loadOrder.indexOf(id);
    if (index !== -1) {
      this.loadOrder.splice(index, 1);
    }
  }

  /**
   * Evict least recently used items
   */
  private evictLeastRecentlyUsed(): void {
    const loadedCount = this.loadOrder.length;
    const evictCount = Math.min(Math.floor(loadedCount * 0.3), loadedCount - this.maxCacheSize);
    
    if (evictCount <= 0) return;

    const toEvict = this.loadOrder.slice(0, evictCount);
    let evicted = 0;

    for (const id of toEvict) {
      if (this.unload(id)) {
        evicted++;
      }
    }

    log.logSystem('Evicted least recently used items', { evicted, totalLoaded: loadedCount });
  }

  /**
   * Clear all loaded items
   */
  clearAll(): void {
    const ids = Array.from(this.loadables.keys());
    let cleared = 0;

    for (const id of ids) {
      if (this.unload(id)) {
        cleared++;
      }
    }

    this.loadOrder = [];
    log.logSystem('Cleared all lazy loaded items', { cleared });
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalRegistered: number;
    totalLoaded: number;
    currentlyLoading: number;
    memoryUsage: number;
    cacheHitRate: number;
  } {
    const totalRegistered = this.loadables.size;
    const totalLoaded = Array.from(this.loadables.values()).filter(l => l.isLoaded).length;
    const currentlyLoading = this.loadingPromises.size;
    const memoryUsage = this.memoryMonitor.getMemoryUsagePercentage();

    return {
      totalRegistered,
      totalLoaded,
      currentlyLoading,
      memoryUsage,
      cacheHitRate: 0 // Could implement hit tracking if needed
    };
  }

  /**
   * Get all registered IDs
   */
  getRegisteredIds(): string[] {
    return Array.from(this.loadables.keys());
  }

  /**
   * Get all loaded IDs
   */
  getLoadedIds(): string[] {
    return Array.from(this.loadables.entries())
      .filter(([, loadable]) => loadable.isLoaded)
      .map(([id]) => id);
  }
}

/**
 * Specialized lazy loader for unlockable organisms
 */
export class UnlockableOrganismLazyLoader {
  private lazyLoader: LazyLoader;

  constructor() {
    this.lazyLoader = LazyLoader.getInstance();
  }

  /**
   * Register an unlockable organism for lazy loading
   */
  registerUnlockableOrganism(
    id: string,
    loader: () => Promise<any> | any,
    dependencies?: string[]
  ): void {
    this.lazyLoader.register({
      id: `organism_${id}`,
      isLoaded: false,
      loader,
      dependencies: dependencies?.map(dep => `organism_${dep}`)
    });
  }

  /**
   * Load an unlockable organism
   */
  async loadOrganism(id: string): Promise<LoadResult<any>> {
    return this.lazyLoader.load(`organism_${id}`);
  }

  /**
   * Preload multiple organisms
   */
  async preloadOrganisms(ids: string[]): Promise<LoadResult<any>[]> {
    const prefixedIds = ids.map(id => `organism_${id}`);
    return this.lazyLoader.preload(prefixedIds);
  }

  /**
   * Check if organism is loaded
   */
  isOrganismLoaded(id: string): boolean {
    return this.lazyLoader.isLoaded(`organism_${id}`);
  }

  /**
   * Get organism data
   */
  getOrganismData(id: string): any {
    return this.lazyLoader.getData(`organism_${id}`);
  }

  /**
   * Unload organism
   */
  unloadOrganism(id: string): boolean {
    return this.lazyLoader.unload(`organism_${id}`);
  }
}

// Export convenience functions
export const lazyLoader = LazyLoader.getInstance();
export const unlockableOrganismLoader = new UnlockableOrganismLazyLoader();
