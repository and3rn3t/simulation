// Memory management utilities
export { 
  ObjectPool, 
  OrganismPool, 
  ArrayPool, 
  arrayPool,
  type PoolStats 
} from './objectPool';

export { 
  MemoryMonitor, 
  MemoryAwareCache,
  type MemoryInfo,
  type MemoryThresholds
} from './memoryMonitor';

export { 
  OrganismSoA 
} from './cacheOptimizedStructures';

export { 
  LazyLoader,
  UnlockableOrganismLazyLoader,
  lazyLoader,
  unlockableOrganismLoader,
  type LazyLoadable,
  type LoadResult
} from './lazyLoader';
