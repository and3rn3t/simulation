# Comprehensive Logging Strategy for Organism Simulation

## Overview

This document outlines what should be logged in the organism simulation game, categorized by importance and purpose. The logging system provides structured, categorized logging with performance monitoring and error tracking.

## 🔴 Most Important to Log (Critical/High Priority)

### 1. **Application Lifecycle Events**

**Why**: Essential for understanding app stability and performance issues.

```typescript
// Application startup/shutdown
log.logInit('Application startup initiated');
log.logInit('Application initialization completed', { totalInitTime: 1250 });
log.logSystem('Application shutdown initiated');

// Component initialization
log.logInit('DOM elements initialized', { elementsCount: 11, initTime: 45 });
log.logInit('Game systems initialized', { managers: ['PowerUp', 'Leaderboard'] });
```

### 2. **Error Events**

**Why**: Critical for debugging and maintaining application stability.

```typescript
// Automatic error logging through ErrorHandler integration
log.logError(error, 'Canvas context creation failed');

// Performance-related errors
log.logError(new Error('Frame rate dropped below threshold'), 'Performance issue');
```

### 3. **User Actions & Interactions**

**Why**: Essential for understanding user behavior and debugging user-reported issues.

```typescript
// Simulation controls
log.logUserAction('Start simulation clicked');
log.logUserAction('Simulation speed changed', { speed: 8 });
log.logUserAction('Organism type changed', { selectedId: 'bacteria' });

// Game interactions
log.logUserAction('Power-up purchase attempted', { powerUpType: 'speed_boost' });
log.logUserAction('Challenge started');
```

### 4. **Critical Simulation State Changes**

**Why**: Core functionality tracking for debugging simulation behavior.

```typescript
// Simulation lifecycle
log.logSimulation('Simulation started', { organisms: 5, generation: 0, speed: 5 });
log.logSimulation('Simulation paused', { runTime: 30000, organisms: 150 });

// Population events
log.logSimulation('Population peak reached', { currentPopulation: 500, maxPopulation: 500 });
log.logSimulation('Population capped', { removed: 50, maxPopulation: 1000 });
```

### 5. **Performance Metrics**

**Why**: Essential for optimization and monitoring application health.

```typescript
// Timing critical operations
perf.startTiming('simulation-update');
perf.endTiming('simulation-update', 'Simulation update cycle');

// Frame rate monitoring
perf.logFrameRate(fps);

// Memory usage (if available)
perf.logMemoryUsage();
```

## 🟡 Good to Log (Medium Priority)

### 1. **Game Achievement & Progress Events**

**Why**: Useful for understanding player engagement and feature usage.

```typescript
// Achievement system
log.logAchievement('Population Master', { 
  points: 100, 
  description: 'Reached 1000 organisms',
  newScore: 2500 
});

// Challenge system
log.logChallenge('Challenge started', { challengeName: 'Rapid Growth' });
log.logChallenge('Challenge completed', { challengeName: 'Survival Test', score: 850 });

// Power-up usage
log.logPowerUp('Power-up purchased: speed_boost');
log.logPowerUp('Power-up activated', { type: 'population_boost', duration: 30000 });
```

### 2. **Simulation Milestones**

**Why**: Helpful for understanding simulation patterns and balance.

```typescript
// Population milestones
log.logSimulation('Birth milestone reached', { totalBirths: 1000, currentPop: 234 });
log.logSimulation('Generation milestone', { generation: 100, avgAge: 45 });

// Time-based milestones
log.logSimulation('Simulation runtime milestone', { runtime: 300000, status: 'stable' });
```

### 3. **Feature Usage Analytics**

**Why**: Valuable for understanding which features are used most.

```typescript
// UI interactions
log.logUserAction('Settings panel opened');
log.logUserAction('Statistics view accessed');
log.logUserAction('Help documentation viewed');

// Feature engagement
log.logSystem('Feature usage', { 
  mostUsedOrganism: 'bacteria', 
  averageSessionLength: 180000,
  featuresUsed: ['achievements', 'challenges', 'powerups'] 
});
```

## 🟢 Nice to Log (Low Priority)

### 1. **Detailed Debug Information**

**Why**: Useful during development and for detailed troubleshooting.

```typescript
// Organism-level events (for special cases)
log.logOrganism('Long-lived organism reproduced', {
  parentAge: 150,
  organismType: 'advanced_bacteria',
  position: { x: 400, y: 300 }
});

// Canvas operations
log.logSystem('Canvas resize detected', { newSize: { width: 1200, height: 800 } });
```

### 2. **System Environment Information**

**Why**: Helpful for debugging platform-specific issues.

```typescript
// Browser/system info (logged once at startup)
log.logSystem('System information collected', {
  userAgent: navigator.userAgent,
  screenResolution: '1920x1080',
  browserLanguage: 'en-US',
  platform: 'Win32'
});

// Performance capabilities
log.logSystem('Browser capabilities detected', {
  webGL: true,
  localStorage: true,
  serviceWorker: true
});
```

## 📊 Logging Categories and Their Uses

### **Initialization Logs** (`LogCategory.INIT`)

- Application startup sequence
- Component initialization timing
- Configuration loading
- Initial state setup

### **Simulation Logs** (`LogCategory.SIMULATION`)

- Simulation state changes
- Population dynamics
- Generation progression
- Environmental changes

### **User Input Logs** (`LogCategory.USER_INPUT`)

- Button clicks and interactions
- Setting changes
- Input validation events
- Navigation actions

### **Performance Logs** (`LogCategory.PERFORMANCE`)

- Frame rate monitoring
- Memory usage tracking
- Operation timing
- Resource loading times

### **Achievement Logs** (`LogCategory.ACHIEVEMENTS`)

- Achievement unlocks
- Progress milestones
- Score events
- Ranking changes

### **Error Logs** (`LogCategory.ERROR`)

- Exception details
- Error context information
- Recovery actions
- Failure patterns

## 🎯 Best Practices for Logging

### **1. Use Appropriate Log Levels**

```typescript
// High-frequency, detailed information
log.log(LogLevel.DEBUG, LogCategory.ORGANISM, 'Organism position updated');

// Normal operational information
log.log(LogLevel.INFO, LogCategory.SIMULATION, 'Simulation started');

// Important user actions
log.log(LogLevel.USER_ACTION, LogCategory.USER_INPUT, 'Settings changed');

// Performance metrics
log.log(LogLevel.PERFORMANCE, LogCategory.PERFORMANCE, 'Frame rendered');
```

### **2. Include Relevant Context Data**

```typescript
// Good: Provides actionable context
log.logSimulation('Population growth spike detected', {
  currentPopulation: 750,
  growthRate: 0.15,
  timeElapsed: 45000,
  organismType: 'bacteria'
});

// Avoid: Too vague
log.logSimulation('Something happened');
```

### **3. Performance Considerations**

```typescript
// Use performance timing for operations that might be slow
perf.startTiming('complex-calculation');
const result = performComplexCalculation();
perf.endTiming('complex-calculation', 'Complex calculation completed');

// Batch logs for high-frequency events
if (frameCount % 60 === 0) { // Log once per second at 60fps
  log.logPerformance('Average frame time', averageFrameTime, 'ms');
}
```

### **4. Error Context Enhancement**

```typescript
// Enhanced error logging with context
try {
  simulation.start();
} catch (error) {
  log.logError(error, 'Simulation startup failed', {
    currentState: simulation.getState(),
    lastAction: 'user_clicked_start',
    timestamp: Date.now()
  });
}
```

## 📈 Monitoring and Analytics

### **Key Metrics to Track**

1. **User Engagement**: Session length, feature usage, interaction frequency
2. **Performance**: Frame rates, load times, memory usage patterns
3. **Stability**: Error rates, crash patterns, recovery success
4. **Feature Adoption**: Which features are used most/least
5. **Simulation Health**: Population patterns, generation progression

### **Log Analysis Queries**

```typescript
// Get user engagement metrics
const userMetrics = log.getLogsByCategory(LogCategory.USER_INPUT);
const sessionLength = calculateSessionLength(userMetrics);

// Analyze performance patterns
const perfLogs = log.getLogsByLevel(LogLevel.PERFORMANCE);
const avgFrameRate = calculateAverageFrameRate(perfLogs);

// Error analysis
const errorLogs = log.getLogsByLevel(LogLevel.ERROR);
const errorPatterns = analyzeErrorPatterns(errorLogs);
```

## 🔧 Implementation Examples

### **Complete User Action Logging**

```typescript
// In event handlers
speedSlider.addEventListener('input', withErrorHandling(() => {
  const speed = parseInt(speedSlider.value);
  
  // Log the user action
  log.logUserAction('Simulation speed changed', { 
    previousSpeed: simulation.getSpeed(),
    newSpeed: speed,
    timestamp: Date.now()
  });
  
  // Update simulation
  simulation.setSpeed(speed);
  
  // Log the result
  log.logSimulation('Speed updated successfully', { 
    newSpeed: speed,
    effectiveImmediately: true 
  });
}, 'Speed slider change'));
```

### **Performance Monitoring Setup**

```typescript
// Monitor animation performance
private animate(): void {
  if (!this.isRunning) return;
  
  perf.startTiming('animation-frame');
  
  try {
    this.update();
    this.draw();
    this.updateStats();
    
    // Log performance every 60 frames (once per second at 60fps)
    if (this.frameCount % 60 === 0) {
      const frameTime = perf.endTiming('animation-frame', 'Animation frame');
      if (frameTime > 16.67) { // Slower than 60fps
        log.logPerformance('Slow frame detected', frameTime, 'ms');
      }
    } else {
      perf.endTiming('animation-frame');
    }
    
    requestAnimationFrame(() => this.animate());
  } catch (error) {
    log.logError(error as Error, 'Animation loop failed');
    this.isRunning = false;
  }
}
```

This comprehensive logging strategy ensures we capture all critical information while maintaining good performance and providing valuable insights for debugging, optimization, and feature development.
