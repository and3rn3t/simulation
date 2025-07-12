# UI Component Testing Guide

## Overview

This guide provides proven patterns for testing complex UI components in the Organism Simulation Game, based on successful resolution of component architecture dependencies and testing challenges.

## Core Philosophy

**Focus**: Test business logic and component behavior, not UI implementation details
**Strategy**: Isolate dependencies through comprehensive mocking
**Goal**: Maintain test value while avoiding initialization complexity

## Essential Patterns

### 1. ComponentFactory Mock Pattern (Production Ready)

Use this pattern for any component that depends on ComponentFactory:

```typescript
// Complete ComponentFactory mock for UI component testing
vi.mock('../../../../src/ui/components/ComponentFactory', () => ({
  ComponentFactory: {
    createToggle: vi.fn(config => ({
      mount: vi.fn((parent: HTMLElement) => {
        const element = document.createElement('div');
        element.className = 'ui-toggle';
        parent.appendChild(element);
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
        parent.appendChild(element);
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

### 2. Chart.js Mock Pattern

For components using Chart.js:

```typescript
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(function (ctx, config) {
    Chart.register = vi.fn();
    this.destroy = vi.fn();
    this.update = vi.fn();
    this.resize = vi.fn();
    return this;
  }),
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
}));
```

### 3. Service Mock Pattern

For service dependencies like UserPreferencesManager:

```typescript
vi.mock('../../../../src/services/UserPreferencesManager', () => ({
  UserPreferencesManager: {
    getInstance: vi.fn(() => ({
      getPreferences: vi.fn(() => ({
        theme: 'dark',
        language: 'en',
        // Complete preference structure
      })),
      updatePreferences: vi.fn(),
      // All service methods
    })),
  },
}));
```

## Test Structure Guidelines

### Setup and Teardown

```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = ServiceManager.getInstance();
  });

  afterEach(() => {
    if (component) {
      component.unmount();
    }
  });
});
```

### Test Organization

Organize tests by functionality:

- **Constructor and Initialization**
- **Tab Navigation** (for tabbed components)
- **Settings Management** (for settings components)
- **Validation** (for form components)
- **Lifecycle** (mount/unmount)

### DOM Testing Best Practices

1. **Match Implementation Structure**: Use actual CSS classes from implementation (`.ui-button` not `.settings-tab`)

2. **Verify Container Existence**: Check for expected containers before testing content

3. **Test Component Creation**: Focus on successful creation rather than internal mechanics

4. **Use Functional Mocks**: Ensure mock mount() methods actually append elements to DOM

## When to Use Each Pattern

### ComponentFactory Mock

- Component uses any ComponentFactory.create\* methods
- Tests require DOM structure verification
- Business logic depends on UI component interactions
- Component initialization order issues occur

### Chart.js Mock

- Component imports Chart.js
- Component creates chart instances
- Tests need to verify chart creation/destruction

### Service Mock

- Component depends on external services
- Tests need to verify service method calls
- Component behavior changes based on service responses

## Common Pitfalls and Solutions

### 1. Component Initialization Order

**Problem**: BaseComponent initialization order causing test failures
**Solution**: Use ComponentFactory mock to bypass initialization complexity

### 2. DOM Structure Mismatches

**Problem**: Tests looking for selectors that don't match implementation
**Solution**: Verify actual DOM structure and update test selectors accordingly

### 3. Global Test Isolation

**Problem**: Tests pass individually but fail in global runs
**Solution**: Ensure proper mock setup and cleanup between tests

### 4. Spy Lifecycle Issues

**Problem**: Spy call tracking not working correctly
**Solution**: Clear mocks before getting instances, not after

## Success Metrics

### Component Test Examples

- **SettingsPanelComponent**: 19/19 tests passing (100% success)
- **ChartComponent**: 16/16 tests passing individually
- **HeatmapComponent**: 19/19 tests consistently passing

### Quality Indicators

- Tests focus on business logic
- Comprehensive error scenario coverage
- Proper lifecycle management
- Clean setup/teardown patterns

## Future Considerations

### Pattern Evolution

- Create reusable mock utilities
- Develop component-specific test helpers
- Integrate with CI/CD pipeline

### Performance

- Mock heavy dependencies for fast execution
- Use object pooling patterns in mocks
- Separate unit from integration tests

### Maintenance

- Keep mocks aligned with interface changes
- Update documentation with new patterns
- Regular review of test effectiveness

## Troubleshooting

### Debug Strategies

1. Run tests individually to isolate global issues
2. Add debug logging to understand mock behavior
3. Verify mock setup order and timing
4. Check DOM structure expectations vs. reality

### Common Error Patterns

- `ComponentFactory.createButton is not a function`: Missing createButton mock
- `createElement() returns undefined`: Global test isolation issue
- Spy not tracking calls: Mock setup order problem
- DOM queries returning null: Mock mount() not appending elements

---

This guide represents proven patterns from successful resolution of complex UI component testing challenges. Apply these patterns to maintain test quality while avoiding architectural complexity.
