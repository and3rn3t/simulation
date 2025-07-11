<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Organism Simulation Game - Copilot Instructions

This is a web-based organism simulation game built with Vite, TypeScript, and HTML5 Canvas.

## Project Overview

- **Purpose**: Interactive simulation showing how organisms multiply and divide over time
- **Tech Stack**: Vite, TypeScript, HTML5 Canvas
- **Features**:
  - Organism selection with different growth/death rates
  - Real-time population visualization
  - Interactive controls for simulation parameters
  - Visual representation of organism lifecycle

## Terminal Commands

- **Always use PowerShell syntax** when generating terminal commands
- Use `;` to join commands on a single line if needed
- Follow Windows PowerShell conventions (e.g., `Get-ChildItem` instead of `ls`)
- Use proper PowerShell path formatting with backslashes or forward slashes as appropriate

## Code Guidelines

- Use TypeScript for type safety
- Follow modern ES6+ patterns
- Use Canvas API for efficient rendering
- Implement clean separation between simulation logic and UI
- Use requestAnimationFrame for smooth animations
- Follow object-oriented design for organism and simulation classes

## Architecture Patterns

- **Core Classes**: Main simulation logic in `OrganismSimulation` class and `Organism` class
- **Type Safety**: Use TypeScript interfaces like `OrganismType` for data structures
- **Error Handling**: Always use `ErrorHandler.getInstance().handleError()` with appropriate severity levels
- **Memory Management**: Use object pooling (`OrganismPool`) for frequently created/destroyed objects
- **Performance**: Implement spatial partitioning and batch processing for large populations
- **Modular Design**: Separate concerns into utils, core, ui, models, and features directories

## Canvas & Rendering Best Practices

- Always check for canvas context before drawing operations
- Use layered rendering with `CanvasManager` for better performance
- Clear canvas before each frame using `canvasUtils.clear()`
- Handle both mouse and touch events for cross-platform compatibility
- Use `drawPlacementInstructions()` for empty state guidance
- Implement preview functionality for better UX

## Error Handling Standards

- Use try-catch blocks around all major operations
- Import and use specific error types: `CanvasError`, `ConfigurationError`, `SimulationError`, `OrganismError`
- Always specify ErrorSeverity: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- Include context in error handling (e.g., 'Drawing simulation', 'Placing organism')
- Don't re-throw errors in non-critical paths to allow graceful degradation

## Performance Optimization Guidelines

- Use object pooling for frequently created objects (organisms)
- Implement Structure of Arrays (SoA) optimization for large datasets
- Use spatial partitioning for collision detection and neighbor finding
- Batch process operations when possible
- Monitor memory usage with `MemoryMonitor`
- Enable/disable optimizations based on population size
- Use Web Workers for heavy computational tasks

## Testing Patterns

- Mock canvas context and DOM elements in tests
- Use Vitest for unit tests, Playwright for E2E tests
- Create comprehensive test setups with proper cleanup
- Test error scenarios and edge cases
- Use integration tests for complex interactions
- Mock external dependencies and APIs

## File Organization

- `/src/core/` - Core simulation logic (OrganismSimulation, Organism)
- `/src/models/` - Data structures and interfaces (OrganismType, etc.)
- `/src/utils/` - Utility functions (canvas, algorithms, memory, system)
- `/src/ui/` - UI components and DOM helpers
- `/src/features/` - Game features (achievements, challenges)
- `/test/` - Unit and integration tests
- `/e2e/` - End-to-end tests

## Code Templates & Patterns

### New Organism Type Template

```typescript
export const NEW_ORGANISM: OrganismType = {
  name: 'Name',
  color: '#HEX_COLOR',
  growthRate: 0.0, // 0.0-1.0
  deathRate: 0.0, // 0.0-1.0
  maxAge: 100, // in simulation ticks
  size: 5, // pixels
  description: 'Description',
};
```

### Error Handling Template

```typescript
try {
  // Operation code here
} catch (error) {
  ErrorHandler.getInstance().handleError(
    error instanceof Error ? error : new SpecificError('Error message'),
    ErrorSeverity.MEDIUM,
    'Context description'
  );
  // Don't re-throw for graceful degradation
}
```

### Canvas Drawing Template

```typescript
private drawSomething(ctx: CanvasRenderingContext2D): void {
  try {
    if (!ctx) {
      throw new CanvasError('Canvas context is required');
    }

    ctx.save();
    // Drawing operations
    ctx.restore();
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new CanvasError('Drawing failed'),
      ErrorSeverity.MEDIUM,
      'Drawing context'
    );
  }
}
```

### Test Setup Template

```typescript
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
      // ... other canvas methods
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
```

## Common Import Patterns

```typescript
// Core imports
import { OrganismSimulation } from '../core/simulation';
import { Organism } from '../core/organism';
import type { OrganismType } from '../models/organismTypes';

// Error handling
import {
  ErrorHandler,
  ErrorSeverity,
  CanvasError,
  ConfigurationError,
} from '../utils/system/errorHandler';

// Utilities
import { CanvasUtils } from '../utils/canvas/canvasUtils';
import { log } from '../utils/system/logger';

// Testing
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
```

## Development Workflow Guidelines

- **Before adding features**: Check if similar functionality exists in `src/features/`
- **When modifying core**: Always run tests with `npm run test`
- **Canvas changes**: Test on both desktop and mobile (touch events)
- **Performance changes**: Monitor with `MemoryMonitor` and test with large populations
- **New UI components**: Add to `src/ui/components/` with proper TypeScript types

## Debugging & Development Tips

- Use `log.logSystem()` for development logging instead of `console.log`
- Enable performance monitoring with `perf.start()` and `perf.end()` for optimization work
- Use `simulation.getMemoryStats()` to monitor memory usage during development
- Test error scenarios by temporarily throwing errors in try-catch blocks
- Use browser dev tools Performance tab for Canvas rendering optimization

## Deployment Considerations

- Build with `npm run build:safe` to catch TypeScript errors
- Test deployment with `npm run preview` before pushing
- Check bundle size - Canvas operations can be memory intensive
- Verify touch events work on mobile devices
- Test performance with maximum population limits
