# Developer Onboarding Guide

Welcome to the Organism Simulation project! This guide will help you get up and running as a developer on this project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Common Development Tasks](#common-development-tasks)
- [Testing Guide](#testing-guide)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)
- [Contributing Guidelines](#contributing-guidelines)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git** (for version control)
- **VS Code** (recommended IDE)

### Recommended VS Code Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Live Server
- GitLens
- Thunder Client (for API testing)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd simulation

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Verify Installation

Open your browser to `http://localhost:5173` and you should see the organism simulation running.

### 3. Run Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## Project Structure

```text
src/
├── core/                    # Core simulation logic
│   ├── organism.ts         # Individual organism behavior
│   ├── simulation.ts       # Main simulation engine
│   └── constants.ts        # Configuration constants
├── models/                  # Data models and types
│   ├── organismTypes.ts    # Different organism configurations
│   └── unlockables.ts      # Unlockable content
├── services/               # Business logic layer
│   ├── AchievementService.ts
│   ├── SimulationService.ts
│   └── StatisticsService.ts
├── ui/                     # User interface components
│   ├── components/         # Reusable UI components
│   └── domHelpers.ts       # DOM manipulation utilities
├── utils/                  # Utility functions
│   ├── algorithms/         # Performance optimization algorithms
│   ├── canvas/            # Canvas rendering utilities
│   ├── memory/            # Memory management
│   └── system/            # System utilities (logging, error handling)
├── features/              # Game features
│   ├── achievements/      # Achievement system
│   ├── challenges/        # Challenge system
│   └── powerups/          # Power-up mechanics
├── dev/                   # Development tools
│   ├── debugMode.ts       # Debug mode functionality
│   └── performanceProfiler.ts # Performance profiling
└── types/                 # TypeScript type definitions
```

## Development Workflow

### 1. Setting Up Your Environment

```bash
# Create a new feature branch
git checkout -b feature/my-new-feature

# Make your changes
# ... code changes ...

# Run tests to ensure nothing broke
npm test

# Check type safety
npm run type-check

# Build the project
npm run build
```

### 2. Code Style Guidelines

We use TypeScript with strict type checking. Follow these conventions:

- Use **PascalCase** for classes and interfaces
- Use **camelCase** for variables and functions
- Use **UPPER_SNAKE_CASE** for constants
- Always provide type annotations for public APIs
- Use JSDoc comments for classes and public methods

### 3. Git Workflow

```bash
# Before committing
npm run lint          # Check code style
npm test             # Run tests
npm run build        # Ensure build works

# Commit with descriptive messages
git add .
git commit -m "feat: add organism reproduction algorithm"

# Push changes
git push origin feature/my-new-feature
```

## Architecture Overview

### Core Components

1. **Organism Class** (`src/core/organism.ts`)
   - Represents individual organisms
   - Handles movement, reproduction, and death
   - Optimized for performance with object pooling

2. **OrganismSimulation Class** (`src/core/simulation.ts`)
   - Main simulation engine
   - Manages organism lifecycle
   - Handles rendering and user interactions
   - Implements performance optimizations

3. **Services Layer** (`src/services/`)
   - **AchievementService**: Manages achievement system
   - **SimulationService**: Business logic for simulation
   - **StatisticsService**: Handles statistics calculation

4. **UI Components** (`src/ui/components/`)
   - Reusable interface elements
   - Event-driven communication
   - Separation of concerns

### Design Patterns Used

- **Service Layer Pattern**: Business logic separation
- **Object Pool Pattern**: Memory optimization
- **Observer Pattern**: Event-driven updates
- **Singleton Pattern**: Global state management
- **Factory Pattern**: Organism creation

## Common Development Tasks

### Adding a New Organism Type

1. **Define the organism type** in `src/models/organismTypes.ts`:

```typescript
export const NEW_ORGANISM: OrganismType = {
  id: 'new-organism',
  name: 'New Organism',
  color: '#FF5733',
  size: 5,
  growthRate: 0.02,
  deathRate: 0.01,
  maxAge: 100,
  reproductionAge: 20,
  reproductionRate: 0.05,
  icon: '🧬'
};
```

1. **Add to organism types array** in the same file
1. **Update UI** to include the new organism in dropdowns
1. **Write tests** for the new organism type

### Creating a New UI Component

1. **Create component file** in `src/ui/components/`:

```typescript
// src/ui/components/MyComponent.ts
export class MyComponent {
  private element: HTMLElement;
  
  constructor(container: HTMLElement) {
    this.element = this.createElement();
    container.appendChild(this.element);
  }
  
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'my-component';
    element.innerHTML = `
      <h3>My Component</h3>
      <p>Component content</p>
    `;
    return element;
  }
  
  public update(data: any): void {
    // Update component with new data
  }
  
  public destroy(): void {
    this.element.remove();
  }
}
```

1. **Add styles** in `src/ui/style.css`
1. **Export from index** in `src/ui/components/index.ts`
1. **Write tests** for the component

### Adding Performance Optimizations

1. **Identify bottlenecks** using the built-in profiler:

```typescript
import { perf } from '../utils/system/logger';

// Start timing
perf.startTiming('my-operation');

// Your code here
doExpensiveOperation();

// End timing
const duration = perf.endTiming('my-operation', 'Description');
```

1. **Implement optimizations** in `src/utils/algorithms/`
1. **Add configuration** in `src/core/constants.ts`
1. **Write performance tests** in `test/performance/`

### Adding New Features

1. **Create feature directory** in `src/features/`
2. **Implement feature logic** with proper interfaces
3. **Add to main simulation** class
4. **Create UI controls** if needed
5. **Write comprehensive tests**
6. **Update documentation**

## Testing Guide

### Unit Testing

We use **Vitest** for unit testing with **jsdom** for DOM testing.

```typescript
// Example test file
import { describe, it, expect, beforeEach } from 'vitest';
import { Organism } from '../src/core/organism';

describe('Organism', () => {
  let organism: Organism;
  
  beforeEach(() => {
    organism = new Organism(100, 100, BACTERIA);
  });
  
  it('should initialize with correct properties', () => {
    expect(organism.x).toBe(100);
    expect(organism.y).toBe(100);
    expect(organism.age).toBe(0);
  });
  
  it('should update position correctly', () => {
    const initialX = organism.x;
    organism.update(1, 800, 600);
    expect(organism.x).not.toBe(initialX);
  });
});
```

### End-to-End Testing

We use **Playwright** for E2E testing:

```typescript
// e2e/simulation.spec.ts
import { test, expect } from '@playwright/test';

test('should start simulation', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="start-button"]');
  await expect(page.locator('[data-testid="population-count"]')).toContainText('5');
});
```

### Performance Testing

```typescript
// test/performance/benchmark.test.ts
import { describe, it, expect } from 'vitest';
import { OrganismSimulation } from '../src/core/simulation';

describe('Performance Benchmarks', () => {
  it('should handle 1000 organisms under 16ms', async () => {
    const canvas = document.createElement('canvas');
    const simulation = new OrganismSimulation(canvas, BACTERIA);
    
    // Add 1000 organisms
    for (let i = 0; i < 1000; i++) {
      simulation.addOrganism(Math.random() * 800, Math.random() * 600);
    }
    
    const startTime = performance.now();
    simulation.update(16.67); // One frame at 60fps
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(16);
  });
});
```

## Performance Optimization

### Memory Management

- **Object Pooling**: Reuse organism instances
- **Structure of Arrays**: Cache-friendly data layout
- **Memory Monitoring**: Track memory usage
- **Garbage Collection**: Minimize allocation/deallocation

### Rendering Optimizations

- **Canvas Layers**: Separate background and organisms
- **Batch Drawing**: Group similar operations
- **Dirty Rectangle**: Only redraw changed areas
- **Level of Detail**: Reduce detail at high populations

### Algorithm Optimizations

- **Spatial Partitioning**: Efficient collision detection
- **Batch Processing**: Process organisms in groups
- **Web Workers**: Offload heavy calculations
- **Predictive Algorithms**: Population forecasting

## Troubleshooting

### Common Issues

1. **Canvas not rendering**
   - Check canvas element exists in DOM
   - Verify 2D context is available
   - Ensure proper canvas sizing

2. **Performance issues**
   - Enable algorithm optimizations
   - Reduce population limits
   - Check for memory leaks

3. **Type errors**
   - Run `npm run type-check`
   - Check TypeScript configuration
   - Verify import paths

4. **Tests failing**
   - Clear test cache: `npm run test:clear-cache`
   - Check for browser compatibility
   - Verify mock setup

### Debug Mode

Enable debug mode for detailed logging:

```typescript
import { enableDebugMode } from '../dev/debugMode';

enableDebugMode({
  showFPS: true,
  showMemoryUsage: true,
  enableConsole: true,
  logLevel: 'debug'
});
```

### Performance Profiling

Use the built-in profiler:

```typescript
import { performanceProfiler } from '../dev/performanceProfiler';

performanceProfiler.startProfiling();
// Run your code
const results = performanceProfiler.getResults();
console.log(results);
```

## Contributing Guidelines

1. **Fork the repository** and create a feature branch
2. **Follow code style** guidelines and use TypeScript
3. **Write tests** for new features and bug fixes
4. **Update documentation** for API changes
5. **Ensure all tests pass** before submitting
6. **Write clear commit messages** following conventional commits
7. **Submit a pull request** with detailed description

### Code Review Process

1. **Automated checks** must pass (tests, linting, type checking)
2. **Code review** by at least one maintainer
3. **Manual testing** of new features
4. **Documentation review** for completeness
5. **Performance impact** assessment

### Release Process

1. **Version bump** following semantic versioning
2. **Update changelog** with new features and fixes
3. **Create release notes** with migration guides
4. **Deploy to staging** for final testing
5. **Deploy to production** after approval

---

## Next Steps

Now that you've completed the setup:

1. **Explore the codebase** - Start with `src/main.ts` and `src/core/simulation.ts`
2. **Run the tests** - Understand how components work together
3. **Make a small change** - Try adding a new organism type or UI feature
4. **Read the API documentation** - Understand the public interfaces
5. **Check out the examples** - See how features are implemented

Welcome to the team! If you have any questions, don't hesitate to reach out to the maintainers.