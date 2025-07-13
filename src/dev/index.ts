/**
 * Development Tools Module
 * Centralizes all development and debugging tools
 */

// Import dev tools styles
import './dev-tools.css';

export { DebugMode } from './debugMode';
export { DeveloperConsole } from './developerConsole';
export { PerformanceProfiler } from './performanceProfiler';

import { DebugMode } from './debugMode';
import { DeveloperConsole } from './developerConsole';
import { PerformanceProfiler } from './performanceProfiler';

/**
 * Initialize all development tools
 * Should be called in development mode only
 */
export function initializeDevTools(): void {
  const debugMode = DebugMode.getInstance();
  const devConsole = DeveloperConsole.getInstance();
  const profiler = PerformanceProfiler.getInstance();

  // Register console commands for debug mode
  devConsole.registerCommand({
    name: 'profile',
    description: 'Start/stop performance profiling',
    usage: 'profile [start|stop] [duration]',
    execute: args => {
      if (args.length === 0 || args[0] === 'start') {
        const duration = args[1] ? parseInt(args[1]) * 1000 : 10000;
        try {
          const sessionId = profiler.startProfiling(duration);
          return `Started profiling session: ${sessionId} (${duration / 1000}s)`;
        } catch (error) {
          return `Error: ${error}`;
        }
      } else if (args[0] === 'stop') {
        const session = profiler.stopProfiling();
        return session ? `Stopped profiling session: ${session.id}` : 'No active session';
      } else {
        return 'Usage: profile [start|stop] [duration]';
      }
    },
  });

  devConsole.registerCommand({
    name: 'sessions',
    description: 'List all profiling sessions',
    usage: 'sessions [clear]',
    execute: args => {
      if (args[0] === 'clear') {
        profiler.clearSessions();
        return 'Cleared all sessions';
      }
      const sessions = profiler.getAllSessions();
      if (sessions.length === 0) {
        return 'No profiling sessions found';
      }
      let output = 'Profiling Sessions:\n';
      sessions.forEach(session => {
        const duration = session.duration ? `${(session.duration / 1000).toFixed(1)}s` : 'ongoing';
        output += `  ${session.id} - ${duration} - Avg FPS: ${session.averages.fps.toFixed(1)}\n`;
      });
      return output;
    },
  });

  devConsole.registerCommand({
    name: 'export',
    description: 'Export profiling session data',
    usage: 'export <sessionId>',
    execute: args => {
      if (args.length === 0) {
        return 'Usage: export <sessionId>';
      }

      const sessionId = args[0];
      if (!sessionId) {
        return 'Session ID is required';
      }

      try {
        const data = profiler.exportSession(sessionId);
        // Save to clipboard if available
        if (navigator.clipboard) {
          navigator.clipboard.writeText(data);
          return `Exported session ${sessionId} to clipboard`;
        } else {
          return `Session data logged to console (clipboard not available)`;
        }
      } catch (error) {
        return `Error: ${error}`;
      }
    },
  });

  // Add global keyboard shortcuts
  document.addEventListener('keydown', e => {
    // Ctrl+Shift+D for debug mode
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      debugMode.toggle();
    }
  });
}

/**
 * Check if we're in development mode
 */
export function isDevelopmentMode(): boolean {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
}

/**
 * Auto-initialize dev tools in development mode
 */
if (isDevelopmentMode()) {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDevTools);
  } else {
    initializeDevTools();
  }
}
