/**
 * Developer Console Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DeveloperConsole } from '../../src/dev/developerConsole';

describe('DeveloperConsole', () => {
  let devConsole: DeveloperConsole;

  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});

    devConsole = DeveloperConsole.getInstance();
  });

  afterEach(() => {
    // Clean up
    devConsole.hide();

    // Restore mocks
    vi.restoreAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = DeveloperConsole.getInstance();
    const instance2 = DeveloperConsole.getInstance();

    expect(instance1).toBe(instance2);
  });

  it('should start hidden', () => {
    expect(devConsole.isConsoleVisible()).toBe(false);
  });

  it('should show console', () => {
    devConsole.show();

    expect(devConsole.isConsoleVisible()).toBe(true);
  });

  it('should hide console', () => {
    devConsole.show();
    devConsole.hide();

    expect(devConsole.isConsoleVisible()).toBe(false);
  });

  it('should toggle console visibility', () => {
    expect(devConsole.isConsoleVisible()).toBe(false);

    devConsole.toggle();
    expect(devConsole.isConsoleVisible()).toBe(true);

    devConsole.toggle();
    expect(devConsole.isConsoleVisible()).toBe(false);
  });

  it('should register commands', () => {
    const testCommand = {
      name: 'test',
      description: 'Test command',
      usage: 'test [args]',
      execute: vi.fn().mockReturnValue('Test executed'),
    };

    devConsole.registerCommand(testCommand);

    // Should not throw
    expect(() => devConsole.registerCommand(testCommand)).not.toThrow();
  });

  it('should execute commands', async () => {
    const testCommand = {
      name: 'test',
      description: 'Test command',
      usage: 'test [args]',
      execute: vi.fn().mockReturnValue('Test executed'),
    };

    devConsole.registerCommand(testCommand);

    const result = await devConsole.executeCommand('test arg1 arg2');

    expect(testCommand.execute).toHaveBeenCalledWith(['arg1', 'arg2']);
    expect(result).toBe('Test executed');
  });

  it('should handle unknown commands', async () => {
    const result = await devConsole.executeCommand('unknown-command');

    expect(result).toContain('Unknown command');
  });

  it('should handle empty commands', async () => {
    const result = await devConsole.executeCommand('');

    expect(result).toBe('');
  });

  it('should log messages', () => {
    devConsole.log('Test message');

    // Should not throw
    expect(() => devConsole.log('Test message')).not.toThrow();
  });

  it('should not show twice', () => {
    devConsole.show();
    devConsole.show(); // Should not throw or create duplicate elements

    expect(devConsole.isConsoleVisible()).toBe(true);
  });

  it('should handle hide when not visible', () => {
    devConsole.hide(); // Should not throw

    expect(devConsole.isConsoleVisible()).toBe(false);
  });
});
