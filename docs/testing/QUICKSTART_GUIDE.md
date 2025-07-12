# Test Suite Quickstart Guide

## 🚀 Getting Started with the Optimized Test Suite

This guide helps developers quickly understand and use the optimized test infrastructure for the Organism Simulation Game.

## ⚡ Quick Commands

```powershell
# Run all tests
npm run test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm run test -- simulation.test.ts

# Run tests matching pattern
npm run test -- --grep "Canvas"
```

## 📁 Test Structure

```
test/
├── setup.ts                    # Global test configuration
├── unit/                       # Unit tests (fast, isolated)
│   ├── core/                   # Core simulation logic
│   ├── utils/                  # Utility functions
│   ├── ui/                     # UI components
│   └── services/               # Service classes
├── integration/                # Integration tests (slower, connected)
│   ├── organismSimulation.test.ts
│   ├── visualization-system.test.ts
│   └── errorHandling.test.ts
├── mobile/                     # Mobile-specific tests
│   └── mobile-optimization.test.ts
└── dev/                        # Development tools tests
    ├── debugMode.test.ts
    └── developerConsole.test.ts
```

## 🛠️ Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { YourComponent } from '../src/path/to/component';

describe('YourComponent', () => {
  let component: YourComponent;

  beforeEach(() => {
    // Setup before each test
    component = new YourComponent();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks();
  });

  it('should do something expected', () => {
    // Arrange
    const input = 'test data';

    // Act
    const result = component.method(input);

    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Canvas Component Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CanvasComponent', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Create canvas element with required ID
    mockCanvas = document.createElement('canvas');
    mockCanvas.id = 'simulation-canvas';
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    document.body.appendChild(mockCanvas);

    // Mock 2D context
    mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      // ... other canvas methods
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(mockCanvas, 'getContext').mockReturnValue(mockContext);
  });

  it('should render on canvas', () => {
    // Your canvas-specific test logic
    expect(mockContext.fillRect).toHaveBeenCalled();
  });
});
```

### Chart.js Component Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Chart.js is globally mocked in setup.ts
describe('ChartComponent', () => {
  beforeEach(() => {
    // Chart.js mock is already available globally
    vi.clearAllMocks();
  });

  it('should create and update chart', () => {
    const chartComponent = new ChartComponent();
    chartComponent.updateData([1, 2, 3]);

    // Chart.js methods are mocked and tracked
    expect(Chart).toHaveBeenCalled();
  });
});
```

## 🎯 Best Practices

### ✅ Do's

- **Use descriptive test names** that explain the expected behavior
- **Follow AAA pattern** (Arrange, Act, Assert) in test structure
- **Mock external dependencies** to isolate units under test
- **Clean up after tests** using `afterEach` and `vi.restoreAllMocks()`
- **Use `beforeEach`** for common setup to avoid test interdependency
- **Test both success and error scenarios**

### ❌ Don'ts

- **Don't rely on test execution order** - tests should be independent
- **Don't use real network requests** - mock all external APIs
- **Don't test implementation details** - focus on public interface behavior
- **Don't skip cleanup** - always restore mocks and clear DOM elements
- **Don't use hardcoded timeouts** - use proper async/await patterns

## 🐛 Common Issues & Solutions

### Canvas Element Not Found

```typescript
// ❌ Wrong - canvas not properly created
const simulation = new OrganismSimulation();

// ✅ Right - create canvas with expected ID
const canvas = document.createElement('canvas');
canvas.id = 'simulation-canvas';
document.body.appendChild(canvas);
const simulation = new OrganismSimulation();
```

### Chart.js Method Errors

```typescript
// ❌ Wrong - trying to mock Chart.js locally
vi.mock('chart.js', () => ({ Chart: vi.fn() }));

// ✅ Right - Chart.js is globally mocked in setup.ts
// Just use it directly in tests
```

### Mobile API Missing

```typescript
// ❌ Wrong - assuming mobile APIs exist
window.addEventListener('orientationchange', handler);

// ✅ Right - check if mobile mocks are needed
// Mobile APIs are mocked in setup.ts for mobile tests
```

### DOM Element Type Errors

```typescript
// ❌ Wrong - using invalid DOM manipulation
element.remove(); // May fail in strict mode

// ✅ Right - use proper DOM methods
if (element.parentNode) {
  element.parentNode.removeChild(element);
}
```

## 📊 Understanding Test Output

### Success Indicators

- ✅ Green checkmarks indicate passing tests
- 📊 Coverage reports show code coverage percentages
- ⚡ Fast execution time (< 15s for full suite)

### Failure Analysis

- 🔍 Read error messages carefully - they often point to missing mocks
- 📍 Line numbers help locate the exact failure point
- 🧪 Stack traces show the call chain leading to failure

### Performance Monitoring

- ⏱️ Watch test execution time - slow tests may need optimization
- 🔄 Monitor success rate trends over time
- 📈 Track test count growth as features are added

## 🎓 Learning Resources

### Key Files to Study

1. `test/setup.ts` - Global test configuration and mocks
2. `test/unit/core/simulation.test.ts` - Core testing patterns
3. `test/integration/visualization-system.test.ts` - Integration testing
4. `docs/testing/TEST_PIPELINE_COMPLETION_REPORT.md` - Detailed technical guide

### Testing Philosophy

- **Test behavior, not implementation** - focus on what the code does, not how
- **Write tests first** when fixing bugs - reproduce the issue, then fix
- **Keep tests simple** - complex tests are hard to maintain and understand
- **Test edge cases** - null values, empty arrays, boundary conditions

## 🚀 Next Steps

1. **Read the full documentation** in `docs/testing/`
2. **Run the test suite** to see current status
3. **Write tests for new features** using the templates above
4. **Contribute improvements** to the test infrastructure

---

**Happy Testing!** 🧪

The optimized test suite provides a solid foundation for reliable, maintainable code. When in doubt, look at existing tests for patterns and ask the team for guidance.
