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

## Testing Strategy & Best Practices

### Component Testing Philosophy

- **Focus on Business Logic**: Test component behavior, not UI implementation details
- **Isolate Dependencies**: Mock external dependencies (ComponentFactory, UserPreferencesManager, Chart.js)
- **Bypass Initialization Complexity**: Use comprehensive mocks to avoid component architecture issues

### Critical Testing Patterns (Proven Solutions)

#### ComponentFactory Mock Pattern

Use this proven pattern for testing components that depend on ComponentFactory:

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

#### Chart.js Testing Pattern

For components using Chart.js, implement module-level register mock:

```typescript
// Mock Chart.js with constructor-level register method
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(function (ctx, config) {
    // Static register method available immediately
    Chart.register = vi.fn();

    // Instance methods
    this.destroy = vi.fn();
    this.update = vi.fn();
    this.resize = vi.fn();
    return this;
  }),
  // ...register all required Chart.js components
}));
```

### DOM Testing Guidelines

- **Use Actual DOM Elements**: Mock components should create real DOM elements with proper CSS classes
- **Match Implementation Structure**: Test selectors should match actual DOM structure (`.ui-button` not `.settings-tab`)
- **Functional Mount Methods**: Mock mount() methods should actually append elements to parent containers
- **Handle jsdom Limitations**: Be aware of global test isolation issues with createElement in multi-file contexts

### Service Mock Patterns

For UserPreferencesManager and similar services:

```typescript
vi.mock('../../../../src/services/UserPreferencesManager', () => ({
  UserPreferencesManager: {
    getInstance: vi.fn(() => ({
      getPreferences: vi.fn(() => ({
        // Complete preference structure matching actual interface
        theme: 'dark',
        language: 'en',
        // ...all required properties
      })),
      updatePreferences: vi.fn(),
      // ...all service methods
    })),
  },
}));
```

### Test Organization Principles

- **Isolate by Feature**: Group tests by functionality (Constructor, Navigation, Settings, Lifecycle)
- **Setup/Teardown**: Always unmount components and clear mocks between tests
- **Mock Order**: Clear mocks before getting instances to avoid spy tracking issues
- **Error Handling**: Test both success and error scenarios for robust coverage

### Common Pitfalls to Avoid

1. **Component Initialization Order**: Use ComponentFactory mocks instead of testing UI component internals
2. **Global Test Isolation**: Be aware createElement may return undefined in global test contexts
3. **Module-Level Dependencies**: Mock Chart.js register() calls at constructor level, not instance level
4. **DOM Structure Assumptions**: Verify actual DOM structure before writing test selectors
5. **Spy Lifecycle**: Understand when vi.clearAllMocks() affects spy call tracking

### Performance Testing Considerations

- Mock heavy dependencies (Chart.js, Canvas operations) for fast test execution
- Use object pooling patterns in mocks for memory efficiency
- Test with realistic data sizes but avoid performance bottlenecks in test suite
- Separate unit tests from integration tests requiring real DOM rendering

## Advanced Testing Insights (74.5% Success Rate Achievement)

### JSDOM Limitations & Production Solutions

#### Critical Infrastructure Patterns (PROVEN)

**Canvas Element Discovery Pattern:**

```typescript
// ✅ REQUIRED: Proper canvas setup in beforeEach
const mockCanvasContainer = document.createElement('div');
mockCanvasContainer.id = 'canvas-container';
document.body.appendChild(mockCanvasContainer);

const mockCanvas = document.createElement('canvas');
mockCanvas.id = 'simulation-canvas'; // CRITICAL: Match expected ID
mockCanvasContainer.appendChild(mockCanvas);
```

**Chart.js Constructor Binding (ESSENTIAL):**

```typescript
// ✅ PROVEN: Function declaration for proper 'this' binding
vi.mock('chart.js', () => ({
  Chart: vi.fn().mockImplementation(function (ctx, config) {
    this.destroy = vi.fn();
    this.update = vi.fn();
    this.resize = vi.fn();
    this.data = { labels: [], datasets: [] };
    return this;
  }),
}));

beforeAll(() => {
  Chart.register = vi.fn(); // Must be available immediately
});
```

**Global State Management (UserPreferencesManager):**

```typescript
// ✅ REQUIRED: Global mock in test/setup.ts
global.UserPreferencesManager = {
  getInstance: vi.fn(() => ({
    getPreferences: vi.fn(() => ({
      theme: 'dark',
      language: 'en',
      showCharts: true,
      // ...complete interface
    })),
    updatePreferences: vi.fn(),
    getAvailableLanguages: vi.fn(() => [{ code: 'en', name: 'English' }]),
  })),
};
```

**DOM Method Completion (JSDOM Fixes):**

```typescript
// ✅ ESSENTIAL: Element.remove() implementation
HTMLElement.prototype.remove = vi.fn(function (this: HTMLElement) {
  if (this.parentNode && this.parentNode.removeChild) {
    this.parentNode.removeChild(this);
  }
});

// Document.head.appendChild for dynamic content
Object.defineProperty(document, 'head', {
  value: {
    appendChild: vi.fn(element => element),
  },
  writable: true,
});
```

#### Mobile Testing Architecture

**Touch Event Factory (Production Pattern):**

```typescript
function createTouchEvent(type: string, touches: TouchInit[]) {
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touches.map(touch => ({
      identifier: touch.identifier || 0,
      target: touch.target || canvas,
      clientX: touch.clientX || 0,
      clientY: touch.clientY || 0,
      // ...complete touch properties
    })),
  });
}
```

### Test Optimization Priority Framework

**Priority 1**: Canvas setup, basic mocking (highest impact)
**Priority 2**: Chart.js integration, global state management
**Priority 3**: Mobile compatibility, touch events
**Priority 4**: Performance optimization, edge cases

### Success Rate Expectations

- **75%+ Success Rate**: Infrastructure issues resolved, production-ready
- **65-75% Success Rate**: Complex integration challenges
- **Below 65%**: Fundamental JSDOM limitations, consider Playwright

### ComponentFactory Mock Pattern (STANDARD)

```typescript
const createComponentMock = (type: string) => ({
  mount: vi.fn((parent: HTMLElement) => {
    const element = document.createElement(type === 'button' ? 'button' : 'div');
    element.className = `ui-${type}`;
    parent.appendChild(element);
    return element;
  }),
  getElement: vi.fn(() => document.createElement('div')),
  unmount: vi.fn(),
  // Type-specific methods based on component type
});
```

### Memory Management & Cleanup

```typescript
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
  if (global.UserPreferencesManager) {
    global.UserPreferencesManager.getInstance().getPreferences.mockClear();
  }
});
```

### Error Handling in Tests

- Always test graceful degradation scenarios
- Verify error context is meaningful
- Use ErrorHandler.getInstance() patterns consistently
- Test both success and failure paths

### Performance Optimization Insights

- **Object Pooling**: Use in mocks for frequently created elements
- **Batch Operations**: Group independent tests with describe.concurrent
- **Memory Cleanup**: Force garbage collection in test environments
- **Mock Efficiency**: Reuse complex mocks across test suites

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

## 📚 Testing Documentation Hub

This project has achieved **74.5% test success rate** through systematic optimization. Comprehensive documentation is available at:

- **Quick Reference**: `docs/testing/DOCUMENTATION_INDEX.md` - Complete navigation guide
- **Developer Workflow**: `docs/testing/QUICKSTART_GUIDE.md` - Patterns, templates, troubleshooting
- **Advanced Patterns**: `docs/testing/ADVANCED_TESTING_INSIGHTS.md` - Deep technical insights from optimization
- **Business Impact**: `docs/testing/OPTIMIZATION_EXECUTIVE_SUMMARY.md` - Metrics and ROI analysis

### Key Testing Success Patterns

1. **Infrastructure First**: Fix fundamental JSDOM/Canvas/Chart.js setup before optimizing individual tests
2. **Global State Management**: Use comprehensive mocks for singleton services like UserPreferencesManager
3. **Constructor Function Binding**: Chart.js requires function declarations for proper 'this' binding
4. **DOM Method Completion**: Implement missing JSDOM methods (Element.remove, document.head.appendChild)
5. **Mobile Touch Simulation**: Use complete TouchEvent factories for cross-platform testing

### Optimization Priority Framework

- **Priority 1** (75%+ success): Canvas setup, basic mocking infrastructure
- **Priority 2** (65-75%): Chart.js integration, global state management
- **Priority 3** (55-65%): Mobile compatibility, touch events
- **Priority 4** (45-55%): Performance optimization, edge cases

**Current Achievement**: 74.5% success rate (187/251 tests) - Production ready infrastructure

## Docker & Containerization Best Practices

### Docker Security Standards

- **Always use non-root users** - Containers must run as non-privileged users
- **Multi-stage builds** - Separate build and runtime environments for security
- **Minimal base images** - Use Alpine Linux or distroless images
- **Security headers** - Implement comprehensive HTTP security headers in nginx
- **Health checks** - Always include proper health check implementations
- **File permissions** - Use least-privilege permissions (644 for files, 755 for directories)

### Docker Security Patterns

#### Non-Root Container Template

```dockerfile
FROM nginx:alpine

# Use existing nginx user (uid:gid 101:101)
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run

# Copy with proper ownership
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx
```

#### Secure Health Check Implementation

```dockerfile
# Create health check script with correct port
RUN echo '#!/bin/sh' > /healthcheck.sh && \
    echo 'curl -f http://localhost:8080/ || exit 1' >> /healthcheck.sh && \
    chmod +x /healthcheck.sh && \
    chown nginx:nginx /healthcheck.sh

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/bin/sh", "/healthcheck.sh"]
```

### nginx Security Configuration

Always implement these security headers in nginx.conf:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

# Rate limiting
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
limit_req zone=one burst=20 nodelay;

# Hide server information
server_tokens off;

# Non-root compatible PID file
pid /tmp/nginx.pid;
```

### Docker Security Checklist

- [ ] **Container runs as non-root user**
- [ ] **Health check implemented and tested**
- [ ] **Security headers configured**
- [ ] **Rate limiting enabled**
- [ ] **File permissions set correctly (644/755)**
- [ ] **Package cache cleaned up**
- [ ] **No secrets in image layers**
- [ ] **Multi-stage build used**
- [ ] **Minimal base image (Alpine)**
- [ ] **Build context optimized**

### Common Docker Security Pitfalls

1. **PID File Permissions**: Use `/tmp/nginx.pid` instead of `/var/run/nginx.pid` for non-root containers
2. **Health Check Ports**: Use internal port (8080) not exposed port in health checks
3. **User Creation**: Check if base image already has required users before creating new ones
4. **Permission Order**: Set file permissions before ownership to avoid conflicts
5. **Security Headers**: Use `always` directive to ensure headers apply to all responses

## File Permission Security (MANDATORY)

### Critical Security Requirements

**ALWAYS set explicit file permissions** - Never rely on system defaults when creating or copying files.

### Required Pattern for File Operations

```javascript
// ✅ MANDATORY: Always use this pattern for file creation
function createSecureFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    fs.chmodSync(filePath, 0o644); // REQUIRED: Read-write owner, read-only others
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('File creation failed'),
      ErrorSeverity.HIGH,
      'Secure file creation'
    );
    throw error;
  }
}

// ✅ MANDATORY: Always use this pattern for file copying
function copySecureFile(sourcePath, targetPath) {
  try {
    fs.copyFileSync(sourcePath, targetPath);
    fs.chmodSync(targetPath, 0o644); // REQUIRED: Secure permissions
  } catch (error) {
    ErrorHandler.getInstance().handleError(
      error instanceof Error ? error : new Error('File copy failed'),
      ErrorSeverity.HIGH,
      'Secure file copying'
    );
    throw error;
  }
}

// ❌ SECURITY VIOLATION: Never create files without setting permissions
fs.writeFileSync(filePath, content); // VULNERABLE: No permission setting
```

### Standard Permission Levels

| File Type | Permission                            | Use Case                                 |
| --------- | ------------------------------------- | ---------------------------------------- |
| `0o644`   | Configuration files, data files, logs | Read-write owner, read-only others       |
| `0o755`   | Directories, executable scripts       | Traversable/executable, read-only others |
| `0o600`   | Secrets, private keys, .env files     | Owner-only access                        |

### Docker Permission Security

```dockerfile
# ✅ REQUIRED: Use specific file and directory permissions
COPY --chown=user:group source/ /destination/
RUN find /destination -type f -exec chmod 644 {} \; && \
    find /destination -type d -exec chmod 755 {} \; && \
    chown -R user:group /destination

# ❌ SECURITY VIOLATION: Never use broad permissions
RUN chmod -R 755 /destination  # Too permissive - security risk
```

### Code Review Security Checklist

Every file operation MUST include:

- [ ] `fs.chmodSync()` after `fs.writeFileSync()`
- [ ] `fs.chmodSync()` after `fs.copyFileSync()`
- [ ] Appropriate permission level (644 for data, 755 for executables)
- [ ] Error handling around file operations
- [ ] Security rationale documented in comments
