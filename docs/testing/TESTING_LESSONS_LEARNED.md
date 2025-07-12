# Test Development Lessons Learned & Best Practices

## Executive Summary

This document captures critical lessons learned from resolving Chart.js integration issues, DOM mocking challenges, and test isolation problems in our Vitest-based test environment. These insights will guide future test development and prevent regression of resolved issues.

## Critical Success Patterns

### 1. Chart.js Module-Level Import Resolution

**The Problem**: Chart.js components call `Chart.register(...registerables)` at module import time, requiring immediate mock availability.

**The Solution Pattern**:

```typescript
// In test/setup.ts - MUST be at top level
vi.mock('chart.js', () => {
  const MockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    data: { datasets: [] },
  }));

  // CRITICAL: Register method must be on constructor
  (MockChart as any).register = vi.fn();

  return {
    Chart: MockChart,
    registerables: [], // Can be empty array
  };
});
```

**Key Insights**:

- Mock must be hoisted before any component imports
- `register` method must be attached to Chart constructor, not instance
- `registerables` array can be empty for basic testing
- Individual test files can override with more specific mocks

### 2. Non-Destructive DOM Element Enhancement

**The Problem**: Canvas elements need `getContext()`, width/height properties, but jsdom createElement must remain functional.

**The Solution Pattern**:

```typescript
// Preserve original createElement functionality
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName: string, options?: ElementCreationOptions) => {
  const element = originalCreateElement(tagName, options);

  // CRITICAL: Check if jsdom creation succeeded
  if (!element) return element;

  // Enhance only specific elements
  if (tagName.toLowerCase() === 'canvas') {
    // Add canvas-specific mocks without breaking jsdom
  }

  return element;
});
```

**Key Insights**:

- Never replace `createElement` completely
- Always check if element creation succeeded before enhancement
- Use property descriptors for width/height to avoid conflicts
- Preserve all jsdom behavior patterns

### 3. Canvas Context Comprehensive Mocking

**The Problem**: Canvas 2D context has 40+ methods and properties that components may use.

**The Solution Pattern**:

```typescript
if (type === '2d') {
  return {
    // State properties
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,

    // Drawing methods (all must be vi.fn())
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    arc: vi.fn(),

    // Transform methods
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),

    // Text methods
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),

    // Reference to canvas element
    canvas: element,
  };
}
```

**Key Insights**:

- Mock ALL canvas methods as `vi.fn()` to prevent "not a function" errors
- Provide realistic return values for methods like `measureText`
- Include `canvas` property pointing back to the canvas element
- Group methods logically for maintainability

## Test Isolation & Global State Management

### Global Test Environment Corruption

**Identified Issue**: When multiple test files run together, `createElement` returns `undefined`, causing "Cannot set properties of undefined" errors.

**Investigation Areas**:

1. **Vitest Configuration**: Check `vitest.config.ts` for isolation settings
2. **Global Mock Interference**: Setup.ts modifications may interfere with jsdom
3. **Test File Order Dependencies**: Some tests may be corrupting global state

**Debugging Strategy**:

```typescript
// Add diagnostic logging to createElement
document.createElement = vi.fn((tagName: string) => {
  const element = originalCreateElement(tagName);
  console.log(`createElement(${tagName}):`, element ? 'SUCCESS' : 'FAILED');
  return element;
});
```

### Test File Independence Requirements

**Best Practice**: Each test file must be able to run in isolation and as part of a suite.

**Implementation Guidelines**:

- Use `beforeEach` for test-specific setup
- Use `afterEach` for cleanup that might affect other tests
- Avoid modifying global objects without restoration
- Mock at the most specific scope possible

## Component-Specific Testing Patterns

### Chart Component Testing Template

```typescript
// Local mock with realistic data structure
vi.mock('chart.js', () => {
  const MockChart = vi.fn().mockImplementation(() => ({
    destroy: vi.fn(),
    update: vi.fn(),
    resize: vi.fn(),
    data: {
      labels: [],
      datasets: [
        { data: [], label: 'Dataset 1' },
        { data: [], label: 'Dataset 2' },
        { data: [], label: 'Dataset 3' }, // Match component expectations
      ],
    },
    options: {},
  }));
  (MockChart as any).register = vi.fn();
  return { Chart: MockChart, registerables: [] };
});

describe('ChartComponent', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    // Canvas will be enhanced by global setup.ts
    expect(mockCanvas.getContext('2d')).toBeTruthy();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
```

### Canvas Component Testing Template

```typescript
describe('CanvasComponent', () => {
  let component: CanvasComponent;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockContext = mockCanvas.getContext('2d') as CanvasRenderingContext2D;

    // Verify canvas setup
    expect(mockCanvas).toBeTruthy();
    expect(mockContext).toBeTruthy();
    expect(typeof mockContext.fillRect).toBe('function');
  });

  it('should handle canvas operations', () => {
    component = new CanvasComponent(mockCanvas);
    component.render();

    // Verify canvas method calls
    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.fillRect).toHaveBeenCalled();
  });
});
```

## Error Handling & Debugging

### Common Error Patterns & Solutions

**Error**: "Chart.register is not a function"
**Solution**: Add `register` method to Chart constructor mock

**Error**: "Cannot read properties of null (reading 'getContext')"
**Solution**: Ensure canvas createElement returns proper element with getContext mock

**Error**: "Cannot set properties of undefined (setting 'className')"
**Solution**: Investigate global test isolation - createElement returning undefined

### Debugging Commands Reference

```powershell
# Test individual component
npm test -- test/unit/ui/components/ChartComponent.test.ts --run --reporter=verbose

# Test all UI components
npm test -- test/unit/ui/components/ --run

# Run with coverage
npm test -- --coverage --run

# Debug specific test
npm test -- --run --reporter=verbose test/debug-chart.test.ts
```

## Performance & Memory Considerations

### Mock Lifecycle Management

**Best Practice**: Ensure mocks are properly disposed between tests

```typescript
afterEach(() => {
  vi.restoreAllMocks(); // Restores all vi.fn() mocks
  vi.clearAllTimers(); // Clears any pending timers
});
```

### Canvas Memory Management

**Best Practice**: Canvas contexts are stateful - reset between tests

```typescript
beforeEach(() => {
  mockContext.clearRect(0, 0, 800, 600);
  mockContext.fillStyle = '';
  mockContext.strokeStyle = '';
});
```

## Integration with Project Architecture

### Error Handling Integration

Follow project's error handling patterns in tests:

```typescript
try {
  component.initialize();
} catch (error) {
  ErrorHandler.getInstance().handleError(
    error instanceof Error ? error : new CanvasError('Test error'),
    ErrorSeverity.MEDIUM,
    'Test context'
  );
}
```

### Logger Integration

Use project's logging system in tests:

```typescript
import { Logger } from '../../src/utils/system/logger';

beforeEach(() => {
  Logger.getInstance().logSystem('Test starting', { testName: 'ChartComponent' });
});
```

## Future Test Development Guidelines

### Before Adding New Tests

1. **Check Existing Patterns**: Review this document and existing test files
2. **Identify Dependencies**: Chart.js, Canvas, DOM elements, etc.
3. **Plan Mock Strategy**: Global vs. local mocks
4. **Consider Isolation**: Will this test affect others?

### New Component Test Checklist

- [ ] Component imports resolved (Chart.js, etc.)
- [ ] Canvas/DOM elements properly mocked
- [ ] Error handling tested
- [ ] Cleanup implemented (`afterEach`)
- [ ] Test runs individually (`npm test -- path/to/test.ts`)
- [ ] Test runs in suite context
- [ ] Performance acceptable (< 200ms per test)

### Mock Enhancement Process

1. **Start Minimal**: Use existing global mocks
2. **Add Specificity**: Override with local mocks as needed
3. **Test Isolation**: Verify test works alone and in suite
4. **Document Patterns**: Update this guide with new insights

## Major Update: ComponentFactory Pattern Success ✅

### Achievement Summary

Successfully resolved SettingsPanelComponent testing with **19/19 tests passing (100% success rate)** through comprehensive ComponentFactory mock pattern.

### Key Pattern: Comprehensive ComponentFactory Mock

This pattern is now **production-ready and reusable** for all UI components:

```typescript
// Essential pattern for UI component testing
vi.mock('../../../../src/ui/components/ComponentFactory', () => ({
  ComponentFactory: {
    createToggle: vi.fn(config => ({
      mount: vi.fn((parent: HTMLElement) => {
        const element = document.createElement('div');
        element.className = 'ui-toggle';
        parent.appendChild(element); // Critical: actually append to DOM
        return element;
      }),
      getElement: vi.fn(() => document.createElement('div')),
      unmount: vi.fn(),
      setChecked: vi.fn(),
      getChecked: vi.fn(() => config?.checked || false),
    })),
    createButton: vi.fn(config => ({
      mount: vi.fn((parent: HTMLElement) => {
        const element = document.createElement('button');
        element.className = 'ui-button';
        element.textContent = config?.text || '';
        parent.appendChild(element); // Critical: DOM manipulation
        return element;
      }),
      getElement: vi.fn(() => document.createElement('button')),
      unmount: vi.fn(),
      click: vi.fn(),
      setEnabled: vi.fn(),
      setText: vi.fn(),
    })),
    createModal: vi.fn(config => ({
      mount: vi.fn((parent: HTMLElement) => {
        const element = document.createElement('div');
        element.className = 'ui-modal';
        parent.appendChild(element);
        return element;
      }),
      getElement: vi.fn(() => document.createElement('div')),
      unmount: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      setContent: vi.fn(),
    })),
  },
}));
```

### Critical Success Factors Identified

#### 1. Complete Method Coverage

Mock **all** ComponentFactory methods used by the component:

- `createToggle` for checkbox/switch components
- `createButton` for navigation and action buttons
- `createModal` for confirmation dialogs

#### 2. Functional DOM Operations

- Mount methods must **actually append elements** to parent containers
- Use **real DOM elements** with correct CSS classes
- Ensure querySelector operations find expected elements

#### 3. Test Structure Alignment

- Update test selectors to match actual DOM structure
- Use `.ui-button` not `.settings-tab` based on implementation
- Verify container structures match component architecture

#### 4. Mock Setup Order

```typescript
beforeEach(() => {
  vi.clearAllMocks(); // Clear first
  mockInstance = Service.getInstance(); // Then get instance
  mockMethod = mockInstance.method; // Then extract methods
});
```

### New Testing Guidelines

#### When to Use ComponentFactory Mock

- Component uses any ComponentFactory.create\* methods
- Tests require DOM structure verification
- Business logic depends on UI component interactions
- Component initialization order issues occur

#### Test Focus Strategy

- **Primary**: Test business logic and component behavior
- **Secondary**: Verify basic DOM structure exists
- **Avoid**: Testing specific UI component implementation details
- **Mock**: All external UI dependencies comprehensively

#### DOM Testing Best Practices

- Match selectors to actual implementation (`.ui-button` vs `.settings-tab`)
- Verify containers exist before testing content
- Use functional mocks that manipulate real DOM
- Test component creation success rather than internal mechanics

### Integration with Existing Patterns

#### Chart.js Components

Continue using constructor-level register mock for Chart.js integration tests.

#### Service Dependencies

Maintain comprehensive service mocks (UserPreferencesManager) with complete interface coverage.

#### Canvas Components

Keep existing Canvas 2D context mocking for rendering tests.

### Future Application Strategy

#### Immediate Use Cases

Apply ComponentFactory pattern to:

- Any component importing ComponentFactory
- Components with Toggle/Button/Modal dependencies
- Complex UI components with multiple sub-components

#### Pattern Evolution

- Create reusable ComponentFactory mock utility
- Develop variant-specific mocks for different component needs
- Integrate with existing test setup infrastructure

### Resolution Impact

#### Technical Debt Reduction

- Eliminated component initialization order complexity
- Established reliable patterns for UI testing
- Reduced debugging time for similar issues

#### Developer Experience

- Clear guidelines for complex component testing
- Reusable patterns reduce setup time
- Comprehensive documentation prevents repeated issues

#### Test Suite Health

- Improved from 0/19 to 19/19 passing tests
- Reliable patterns for future component development
- Better separation of concerns in test architecture

---

## Conclusion

The key to successful testing in this environment is:

1. **Respect jsdom**: Don't break core DOM functionality
2. **Mock Early**: Module-level imports need immediate mock availability
3. **Test Isolation**: Each test must be independent
4. **Comprehensive Coverage**: Mock all methods components might use
5. **Document Everything**: Complex mocking patterns need clear documentation

This guide should be updated as new patterns emerge and issues are resolved.
