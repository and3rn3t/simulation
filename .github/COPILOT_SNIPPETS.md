# Copilot Code Snippets & Quick References

This file contains common code snippets and patterns used throughout the simulation project.

## Quick PowerShell Commands

```powershell
# Development
npm run dev
npm run test
npm run test:ui

# Building
npm run build:safe
npm run preview

# Testing
npm run test:e2e
npm run test:coverage
npm run test:performance

# Quality checks
npm run quality:check
npm run quality:fix
```

## Common TypeScript Patterns

### Creating a New Organism Type

```typescript
// In src/models/organismTypes.ts
export const NEW_ORGANISM: OrganismType = {
  name: 'New Organism',
  color: '#FF6B6B',
  growthRate: 0.05,
  deathRate: 0.01,
  maxAge: 200,
  size: 8,
  description: 'Description of the new organism'
};

// Add to ORGANISM_TYPES object
export const ORGANISM_TYPES = {
  // ...existing types...
  newOrganism: NEW_ORGANISM
} as const;
```

### Error Handling Pattern

```typescript
import { ErrorHandler, ErrorSeverity, CanvasError } from '../utils/system/errorHandler';

try {
  // Your operation here
} catch (error) {
  ErrorHandler.getInstance().handleError(
    error instanceof Error ? error : new CanvasError('Operation failed'),
    ErrorSeverity.MEDIUM,
    'Context: what operation was being performed'
  );
  // Don't re-throw for graceful degradation
}
```

### Canvas Drawing with Error Handling

```typescript
private drawComponent(ctx: CanvasRenderingContext2D): void {
  try {
    if (!ctx) {
      throw new CanvasError('Canvas context is required');
    }
    
    ctx.save();
    
    // Your drawing code here
    ctx.fillStyle = '#color';
    ctx.fillRect(x, y, width, height);
    
    ctx.restore();
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new CanvasError('Drawing failed'),
      ErrorSeverity.MEDIUM,
      'Drawing component'
    );
  }
}
```

### Memory-Optimized Object Creation

```typescript
// Use object pooling for frequently created objects
private createOrganism(x: number, y: number, type: OrganismType): Organism {
  try {
    // Check memory usage first
    if (!this.memoryMonitor.isMemoryUsageSafe() && this.organisms.length > 100) {
      throw new Error('Memory usage too high');
    }
    
    return this.organismPool.acquireOrganism(x, y, type);
  } catch (error) {
    // Fallback to regular creation
    log.logSystem('Falling back to regular organism creation', { reason: error });
    return new Organism(x, y, type);
  }
}
```

## Testing Patterns

### Basic Test Setup

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ComponentName', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  
  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockContext = {
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      // ... other methods
    } as unknown as CanvasRenderingContext2D;
    
    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should do something', () => {
    // Test implementation
    expect(true).toBe(true);
  });
});
```

### Canvas Context Mock

```typescript
const mockCanvasContext = {
  canvas: mockCanvas,
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  translate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  strokeText: vi.fn(),
  fillText: vi.fn(),
  arc: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  globalAlpha: 1,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  font: '',
  textAlign: 'start' as CanvasTextAlign,
} as unknown as CanvasRenderingContext2D;
```

## Performance Optimization Snippets

### Object Pooling Usage

```typescript
// Initialize pool
this.organismPool = OrganismPool.getInstance();
this.organismPool.preFill(100);

// Acquire from pool
const organism = this.organismPool.acquireOrganism(x, y, type);

// Return to pool
this.organismPool.releaseOrganism(organism);
```

### Memory Monitoring

```typescript
// Initialize monitoring
this.memoryMonitor = MemoryMonitor.getInstance();
this.memoryMonitor.startMonitoring(2000); // Check every 2 seconds

// Check memory usage
if (!this.memoryMonitor.isMemoryUsageSafe()) {
  // Perform cleanup
  this.performMemoryCleanup();
}

// Get stats
const stats = this.memoryMonitor.getMemoryStats();
console.log('Memory usage:', stats);
```

### Batch Processing

```typescript
// Process organisms in batches
this.batchProcessor.processBatch(
  this.organisms,
  (organism, deltaTime, canvasWidth, canvasHeight) => {
    organism.update(deltaTime, canvasWidth, canvasHeight);
  },
  deltaTime,
  this.canvas.width,
  this.canvas.height
);
```

## UI Component Patterns

### Basic Component Structure

```typescript
export class ComponentName {
  private element: HTMLElement;
  
  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    
    this.element = this.createElement();
    container.appendChild(this.element);
  }
  
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'component-name';
    // Setup element
    return element;
  }
  
  public update(data: any): void {
    // Update component with new data
  }
  
  public destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
```

## Common Import Statements

```typescript
// Core simulation
import { OrganismSimulation } from '../core/simulation';
import { Organism } from '../core/organism';
import type { OrganismType } from '../models/organismTypes';
import { ORGANISM_TYPES } from '../models/organismTypes';

// Error handling
import { 
  ErrorHandler, 
  ErrorSeverity, 
  CanvasError, 
  ConfigurationError,
  SimulationError,
  OrganismError 
} from '../utils/system/errorHandler';

// Utilities
import { CanvasUtils } from '../utils/canvas/canvasUtils';
import { log, perf } from '../utils/system/logger';

// Memory management
import { OrganismPool, MemoryMonitor } from '../utils/memory';

// UI helpers
import { showNotification } from '../ui/domHelpers';

// Testing
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
```

## Debugging Utilities

```typescript
// System logging (instead of console.log)
log.logSystem('Message', { data: 'value' });
log.logInit('Initialization complete', { component: 'Name' });

// Performance monitoring
perf.start('operation-name');
// ... operation code ...
perf.end('operation-name');

// Memory stats
const memoryStats = simulation.getMemoryStats();
console.table(memoryStats);

// Error boundary for debugging
window.addEventListener('error', (event) => {
  ErrorHandler.getInstance().handleError(
    event.error,
    ErrorSeverity.HIGH,
    'Uncaught error'
  );
});
```
