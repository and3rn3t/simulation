/**
 * Debug Mode Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DebugMode } from '../../src/dev/debugMode';

describe('DebugMode', () => {
  let debugMode: DebugMode;
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create a mock DOM element
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    debugMode = DebugMode.getInstance();
  });

  afterEach(() => {
    // Clean up
    debugMode.disable();
    document.body.removeChild(mockElement);
    
    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = DebugMode.getInstance();
    const instance2 = DebugMode.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should start disabled', () => {
    expect(debugMode.isDebugEnabled()).toBe(false);
  });

  it('should enable debug mode', () => {
    debugMode.enable();
    
    expect(debugMode.isDebugEnabled()).toBe(true);
    expect(console.log).toHaveBeenCalledWith('🐛 Debug mode enabled');
  });

  it('should disable debug mode', () => {
    debugMode.enable();
    debugMode.disable();
    
    expect(debugMode.isDebugEnabled()).toBe(false);
    expect(console.log).toHaveBeenCalledWith('🐛 Debug mode disabled');
  });

  it('should toggle debug mode', () => {
    expect(debugMode.isDebugEnabled()).toBe(false);
    
    debugMode.toggle();
    expect(debugMode.isDebugEnabled()).toBe(true);
    
    debugMode.toggle();
    expect(debugMode.isDebugEnabled()).toBe(false);
  });

  it('should update debug info', () => {
    const testInfo = {
      fps: 60,
      frameTime: 16.7,
      organismCount: 100,
      memoryUsage: 50000
    };
    
    debugMode.updateInfo(testInfo);
    
    // We can't directly access the private debugInfo, but we can verify the method doesn't throw
    expect(() => debugMode.updateInfo(testInfo)).not.toThrow();
  });

  it('should track frame data', () => {
    debugMode.enable();
    
    // Track a few frames
    debugMode.trackFrame();
    debugMode.trackFrame();
    debugMode.trackFrame();
    
    // Should not throw
    expect(() => debugMode.trackFrame()).not.toThrow();
  });

  it('should not enable twice', () => {
    debugMode.enable();
    debugMode.enable(); // Should not throw or create duplicate panels
    
    expect(debugMode.isDebugEnabled()).toBe(true);
  });

  it('should handle disable when not enabled', () => {
    debugMode.disable(); // Should not throw
    
    expect(debugMode.isDebugEnabled()).toBe(false);
  });
});
