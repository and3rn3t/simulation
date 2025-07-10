/**
 * Performance Profiler Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceProfiler } from '../../src/dev/performanceProfiler';

describe('PerformanceProfiler', () => {
  let profiler: PerformanceProfiler;

  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    profiler = PerformanceProfiler.getInstance();
  });

  afterEach(() => {
    // Clean up
    if (profiler.isProfiling()) {
      profiler.stopProfiling();
    }
    profiler.clearSessions();
    
    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = PerformanceProfiler.getInstance();
    const instance2 = PerformanceProfiler.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should start not profiling', () => {
    expect(profiler.isProfiling()).toBe(false);
  });

  it('should start profiling', () => {
    const sessionId = profiler.startProfiling(1000);
    
    expect(profiler.isProfiling()).toBe(true);
    expect(sessionId).toBeDefined();
    expect(typeof sessionId).toBe('string');
  });

  it('should stop profiling', () => {
    profiler.startProfiling(1000);
    expect(profiler.isProfiling()).toBe(true);
    
    const session = profiler.stopProfiling();
    
    expect(profiler.isProfiling()).toBe(false);
    expect(session).toBeDefined();
    expect(session?.id).toBeDefined();
  });

  it('should track frames', () => {
    profiler.startProfiling(1000);
    
    // Track a few frames
    profiler.trackFrame();
    profiler.trackFrame();
    profiler.trackFrame();
    
    // Should not throw
    expect(() => profiler.trackFrame()).not.toThrow();
  });

  it('should not start profiling twice', () => {
    profiler.startProfiling(1000);
    
    expect(() => profiler.startProfiling(1000)).toThrow();
  });

  it('should handle stop when not profiling', () => {
    const result = profiler.stopProfiling();
    expect(result).toBeNull();
  });

  it('should manage sessions', () => {
    const sessionId = profiler.startProfiling(100);
    
    // Wait for session to complete
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const sessions = profiler.getAllSessions();
        expect(sessions.length).toBeGreaterThan(0);
        
        const session = profiler.getSession(sessionId);
        expect(session).toBeDefined();
        expect(session?.id).toBe(sessionId);
        
        resolve();
      }, 150);
    });
  });

  it('should clear sessions', () => {
    profiler.startProfiling(100);
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(profiler.getAllSessions().length).toBeGreaterThan(0);
        
        profiler.clearSessions();
        expect(profiler.getAllSessions().length).toBe(0);
        
        resolve();
      }, 150);
    });
  });

  it('should return null for non-existent session', () => {
    const session = profiler.getSession('non-existent');
    expect(session).toBeNull();
  });

  it('should track frames only when profiling', () => {
    // Should not throw when not profiling
    expect(() => profiler.trackFrame()).not.toThrow();
    
    profiler.startProfiling(1000);
    expect(() => profiler.trackFrame()).not.toThrow();
    
    profiler.stopProfiling();
    expect(() => profiler.trackFrame()).not.toThrow();
  });
});
