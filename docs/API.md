# Organism Simulation API Documentation

Welcome to the Organism Simulation API documentation. This guide provides comprehensive information about the project's architecture, APIs, and development practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Core APIs](#core-apis)
- [Development Tools](#development-tools)
- [Testing Guide](#testing-guide)
- [Performance Guidelines](#performance-guidelines)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Modern web browser with Canvas support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd simulation

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Project Structure

```
src/
├── core/           # Core simulation logic
├── dev/            # Development tools
├── features/       # Game features (achievements, challenges, etc.)
├── models/         # Data models and types
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── ui/             # User interface components
└── utils/          # Utility functions and helpers
```

## Architecture Overview

The Organism Simulation follows a modular, service-oriented architecture with clear separation of concerns:

### Core Components

1. **Organism** - Individual organisms in the simulation
2. **OrganismSimulation** - Main simulation engine
3. **Services** - Business logic (AchievementService, StatisticsService, etc.)
4. **UI Components** - Reusable interface elements
5. **Development Tools** - Debug mode, console, profiler

### Design Patterns

- **Service Layer Pattern** - Business logic separation
- **Component Pattern** - Reusable UI elements
- **Observer Pattern** - Event-driven communication
- **Singleton Pattern** - Global state management
- **Factory Pattern** - Object creation

## Core APIs

### Organism Class

The `Organism` class represents individual organisms in the simulation.

#### Constructor

```typescript
constructor(x: number, y: number, type: OrganismType)
```

- `x: number` - Initial X position on canvas
- `y: number` - Initial Y position on canvas  
- `type: OrganismType` - Organism type definition

#### Methods

```typescript
// Update organism state
update(deltaTime: number, canvasWidth: number, canvasHeight: number): void

// Check if organism should reproduce
shouldReproduce(): boolean

// Check if organism should die
shouldDie(): boolean

// Render organism on canvas
render(ctx: CanvasRenderingContext2D): void
```

#### Properties

```typescript
x: number           // Current X position
y: number           // Current Y position
age: number         // Current age in simulation time
type: OrganismType  // Type definition
reproduced: boolean // Whether organism has reproduced
```

### OrganismType Interface

Defines the characteristics of organism types.

```typescript
interface OrganismType {
  name: string        // Display name
  color: string       // Render color
  growthRate: number  // Reproduction rate
  deathRate: number   // Death rate
  maxAge: number      // Maximum lifespan
  size: number        // Render size
  description: string // Description text
}
```

### OrganismSimulation Class

Main simulation engine that manages organisms, rendering, and game state with performance optimizations.

#### Constructor

```typescript
constructor(canvas: HTMLCanvasElement, initialOrganismType: OrganismType)
```

**Parameters:**

- `canvas` - HTML canvas element for rendering
- `initialOrganismType` - Initial organism type for placement

**Example:**

```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const simulation = new OrganismSimulation(canvas, ORGANISM_TYPES.bacteria);
```

#### Core Methods

```typescript
// Simulation control
start(): void                    // Start the simulation
pause(): void                    // Pause the simulation  
reset(): void                    // Reset to initial state
clear(): void                    // Clear all organisms

// Configuration
setSpeed(speed: number): void                      // Set simulation speed (1-10)
setOrganismType(type: OrganismType): void         // Set organism type for placement
setMaxPopulation(limit: number): void             // Set population limit (1-5000)

// State access
getStats(): SimulationStats                       // Get current simulation statistics
getOrganismTypeById(id: string): OrganismType | null  // Get organism type by ID
```

#### Performance Optimization Methods

```typescript
// Algorithm optimizations
setOptimizationsEnabled(enabled: boolean): void     // Enable/disable optimizations
toggleSoAOptimization(enable: boolean): void        // Toggle Structure of Arrays
getAlgorithmPerformanceStats(): PerformanceStats    // Get performance statistics

// Memory management
getMemoryStats(): MemoryStats                       // Get memory usage statistics
```

#### Environmental Control

```typescript
// Environmental factors
updateEnvironmentalFactors(factors: Partial<EnvironmentalFactors>): void
getEnvironmentalFactors(): EnvironmentalFactors
getPopulationPrediction(): PopulationPrediction | null
```

#### Simulation Statistics

```typescript
interface SimulationStats {
  population: number;      // Current population count
  generation: number;      // Current generation number
  isRunning: boolean;      // Whether simulation is running
  placementMode: boolean;  // Whether in placement mode
}
```

#### Usage Examples

```typescript
// Basic simulation setup
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const simulation = new OrganismSimulation(canvas, ORGANISM_TYPES.bacteria);

// Configure simulation
simulation.setSpeed(5);
simulation.setMaxPopulation(200);

// Enable performance optimizations
simulation.setOptimizationsEnabled(true);
simulation.toggleSoAOptimization(true);

// Start simulation
simulation.start();

// Monitor statistics
setInterval(() => {
  const stats = simulation.getStats();
  console.log(`Population: ${stats.population}, Generation: ${stats.generation}`);
}, 1000);

// Get performance data
const perfStats = simulation.getAlgorithmPerformanceStats();
console.log('Performance stats:', perfStats);

// Get memory usage
const memStats = simulation.getMemoryStats();
console.log('Memory usage:', memStats);
```

### Services

#### AchievementService

Manages achievements and unlockables.

```typescript
class AchievementService {
  checkAchievements(statistics: SimulationStatistics): Achievement[]
  unlockAchievement(id: string): void
  getUnlockedAchievements(): Achievement[]
}
```

#### StatisticsService

Tracks and manages simulation statistics.

```typescript
class StatisticsService {
  updateStatistics(organisms: Organism[]): void
  getStatistics(): SimulationStatistics
  reset(): void
}
```

#### SimulationService

High-level simulation management.

```typescript
class SimulationService {
  createSimulation(config: SimulationConfig): OrganismSimulation
  saveSimulation(): SimulationData
  loadSimulation(data: SimulationData): void
}
```

## Development Tools

### Debug Mode

Activate with `Ctrl+Shift+D` or programmatically:

```typescript
import { DebugMode } from './dev/debugMode';

const debug = DebugMode.getInstance();
debug.enable(); // Show debug panel
debug.updateInfo({ fps: 60, organismCount: 100 });
```

### Developer Console

Activate with `Ctrl+\`` (backtick):

```typescript
import { DeveloperConsole } from './dev/developerConsole';

const console = DeveloperConsole.getInstance();
console.show();
console.registerCommand({
  name: 'custom',
  description: 'Custom command',
  usage: 'custom [args]',
  execute: (args) => 'Command executed'
});
```

#### Built-in Commands

- `help` - Show available commands
- `clear` - Clear console output
- `debug [on|off]` - Toggle debug mode
- `performance` - Show performance info
- `profile [start|stop]` - Performance profiling
- `localStorage [get|set|remove|clear]` - Manage storage

### Performance Profiler

```typescript
import { PerformanceProfiler } from './dev/performanceProfiler';

const profiler = PerformanceProfiler.getInstance();
const sessionId = profiler.startProfiling(10000); // 10 seconds
// ... do work ...
const session = profiler.stopProfiling();
console.log(session.recommendations);
```

## Testing Guide

### Unit Tests

Located in `test/` directory. Use Vitest framework.

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run specific test file
npm test organism.test.ts

# Generate coverage
npm run test:coverage
```

### E2E Tests

Located in `e2e/` directory. Use Playwright framework.

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium
```

### Performance Tests

Located in `test/performance/` directory.

```bash
# Run performance benchmarks
npm run test:performance
```

### Visual Regression Tests

```bash
# Run visual tests
npm run test:visual

# Update baselines
npx playwright test --config playwright.visual.config.ts --update-snapshots
```

### Writing Tests

#### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { Organism } from '../src/core/organism';
import { ORGANISM_TYPES } from '../src/models/organismTypes';

describe('Organism', () => {
  it('should create organism with correct properties', () => {
    const organism = new Organism(100, 200, ORGANISM_TYPES.bacteria);
    
    expect(organism.x).toBe(100);
    expect(organism.y).toBe(200);
    expect(organism.type).toBe(ORGANISM_TYPES.bacteria);
    expect(organism.age).toBe(0);
  });
});
```

#### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should start simulation', async ({ page }) => {
  await page.goto('/');
  await page.click('#start-btn');
  
  // Verify simulation is running
  await expect(page.locator('#pause-btn')).toBeVisible();
});
```

## Performance Guidelines

### Target Metrics

- **60 FPS** - Maintain smooth animation
- **< 16ms** - Frame time budget
- **< 100MB** - Memory usage limit
- **< 80%** - GC pressure threshold

### Optimization Techniques

#### 1. Object Pooling

```typescript
class OrganismPool {
  private pool: Organism[] = [];
  
  acquire(x: number, y: number, type: OrganismType): Organism {
    if (this.pool.length > 0) {
      const organism = this.pool.pop()!;
      organism.reset(x, y, type);
      return organism;
    }
    return new Organism(x, y, type);
  }
  
  release(organism: Organism): void {
    this.pool.push(organism);
  }
}
```

#### 2. Spatial Partitioning

```typescript
class QuadTree {
  insert(organism: Organism): void { /* ... */ }
  query(bounds: Rectangle): Organism[] { /* ... */ }
}
```

#### 3. Dirty Rectangle Rendering

```typescript
class CanvasManager {
  private dirtyRegions: Rectangle[] = [];
  
  markDirty(region: Rectangle): void {
    this.dirtyRegions.push(region);
  }
  
  render(): void {
    this.dirtyRegions.forEach(region => {
      this.renderRegion(region);
    });
    this.dirtyRegions.length = 0;
  }
}
```

### Performance Monitoring

```typescript
// Track frame rate
const profiler = PerformanceProfiler.getInstance();
profiler.trackFrame(); // Call each frame

// Monitor memory
profiler.updateInfo({
  memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
});
```

## Error Handling

### Error Handler

```typescript
import { ErrorHandler, ErrorSeverity } from './utils/system/errorHandler';

try {
  // Risky operation
} catch (error) {
  ErrorHandler.getInstance().handleError(
    error,
    ErrorSeverity.HIGH,
    'Operation Context'
  );
}
```

### Error Severities

- `LOW` - Minor issues, logged only
- `MEDIUM` - Noticeable issues, user notification
- `HIGH` - Significant problems, error recovery
- `CRITICAL` - Fatal errors, application halt

## State Management

### Game State Manager

```typescript
import { GameStateManager } from './utils/game/gameStateManager';

const gameState = GameStateManager.getInstance();

// Subscribe to state changes
gameState.subscribe('organisms', (organisms) => {
  console.log('Organisms updated:', organisms.length);
});

// Update state
gameState.setState('organisms', newOrganisms);
```

## UI Components

### Base Component

```typescript
import { BaseComponent } from './ui/components/BaseComponent';

class CustomComponent extends BaseComponent<HTMLDivElement> {
  protected createElement(): HTMLDivElement {
    const element = document.createElement('div');
    element.className = 'custom-component';
    return element;
  }
  
  protected setupEventListeners(): void {
    this.element.addEventListener('click', this.handleClick.bind(this));
  }
  
  private handleClick(): void {
    this.emit('clicked');
  }
}
```

### Usage

```typescript
const component = new CustomComponent();
component.on('clicked', () => console.log('Clicked!'));
component.mount(document.body);
```

## Memory Management

### Object Pools

```typescript
import { ObjectPool } from './utils/memory/objectPool';

const organismPool = new ObjectPool(() => new Organism(0, 0, ORGANISM_TYPES.bacteria));

// Acquire from pool
const organism = organismPool.acquire();

// Release back to pool
organismPool.release(organism);
```

### Memory Monitoring

```typescript
import { MemoryMonitor } from './utils/memory/memoryMonitor';

const monitor = MemoryMonitor.getInstance();
monitor.startMonitoring();

monitor.on('memoryWarning', (usage) => {
  console.warn('High memory usage:', usage);
});
```

## Configuration

### Simulation Config

```typescript
interface SimulationConfig {
  maxOrganisms: number;
  updateInterval: number;
  canvasWidth: number;
  canvasHeight: number;
  initialOrganismCount: number;
  enableDebugMode: boolean;
}
```

### Environment Variables

```bash
# Development mode
VITE_DEV_MODE=true

# Debug level
VITE_DEBUG_LEVEL=info

# Performance monitoring
VITE_ENABLE_PROFILING=true
```

## Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following coding standards
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Update documentation as needed
7. Submit pull request

### Coding Standards

- Use TypeScript strict mode
- Follow ESLint configuration
- Write comprehensive tests (90%+ coverage)
- Document public APIs with JSDoc
- Use semantic commit messages

### Pull Request Process

1. Ensure CI passes
2. Update README if needed
3. Add tests for new features
4. Update CHANGELOG.md
5. Request review from maintainers

## API Reference

Complete API reference is available in the generated TypeDoc documentation:

```bash
# Generate API docs
npm run docs

# View docs
open docs/index.html
```

## Troubleshooting

### Common Issues

#### Performance Problems

1. Check organism count - reduce if > 1000
2. Enable debug mode to monitor FPS
3. Use performance profiler to identify bottlenecks
4. Consider enabling object pooling

#### Memory Leaks

1. Monitor memory usage with dev tools
2. Check for unreleased event listeners
3. Verify object pools are releasing properly
4. Use memory profiler to track allocations

#### Canvas Issues

1. Verify canvas element exists
2. Check canvas dimensions
3. Ensure proper context cleanup
4. Monitor canvas operation count

### Debug Commands

```javascript
// In browser console
window.debug.enable();           // Enable debug mode
window.profiler.start();         // Start profiling
window.simulation.getStats();    // Get current stats
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- Create an issue for bug reports
- Start a discussion for questions
- Check existing documentation first
- Provide minimal reproduction examples
