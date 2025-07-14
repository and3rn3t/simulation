# Test Organization Guide

## 📁 Current Structure

```
test/
├── unit/                   # Unit tests for individual components
│   ├── core/              # Tests for core functionality
│   ├── utils/             # Tests for utility functions
│   ├── features/          # Tests for feature modules
│   └── ui/                # Tests for UI components
├── integration/           # Integration tests
│   ├── simulation/        # End-to-end simulation tests
│   ├── features/          # Feature integration tests
│   └── api/               # API integration tests
├── performance/           # Performance and benchmark tests
│   ├── algorithms/        # Algorithm performance tests
│   ├── memory/            # Memory usage tests
│   └── rendering/         # Canvas rendering performance
├── visual/                # Visual regression tests
│   ├── snapshots/         # Visual test snapshots
│   └── comparisons/       # Visual comparison utilities
├── e2e/                   # End-to-end tests (Playwright)
│   ├── user-flows/        # Complete user journey tests
│   ├── accessibility/     # Accessibility tests
│   └── cross-browser/     # Cross-browser compatibility
└── setup/                 # Test configuration and setup
    ├── fixtures/          # Test data and fixtures
    ├── mocks/             # Mock implementations
    └── helpers/           # Test helper utilities
```

## 🎯 Testing Strategy

### Unit Tests

- Test individual functions and classes in isolation
- Mock dependencies
- Focus on business logic and edge cases
- Target: 95%+ code coverage

### Integration Tests

- Test interactions between components
- Test feature workflows
- Verify data flow between layers
- Use real dependencies where possible

### Performance Tests

- Benchmark critical algorithms
- Monitor memory usage patterns
- Measure rendering performance
- Regression testing for performance

### Visual Tests

- Screenshot comparisons for UI consistency
- Cross-browser visual verification
- Responsive design testing
- Component visual regression

### E2E Tests

- Complete user workflows
- Real browser testing
- Accessibility compliance
- Performance in real conditions

## 📊 Test Categories by Priority

### Critical (Must Pass)

- Core simulation logic
- Memory management
- Error handling
- Data persistence

### Important (Should Pass)

- UI components
- User interactions
- Performance benchmarks
- Feature workflows

### Nice-to-Have (Could Pass)

- Visual regression
- Cross-browser edge cases
- Advanced accessibility
- Performance optimizations

## 🔧 Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Visual tests
npm run test:visual

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```
