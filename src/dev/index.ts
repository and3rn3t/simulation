class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener?.(event, handler);
    });
    this.listeners = [];
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => EventListenerManager.cleanup());
}
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
 * Register profile command for performance profiling
 */
function registerProfileCommand(devConsole: DeveloperConsole, profiler: PerformanceProfiler): void {
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
}

/**
 * Register sessions command for managing profiling sessions
 */
function registerSessionsCommand(
  devConsole: DeveloperConsole,
  profiler: PerformanceProfiler
): void {
  devConsole.registerCommand({
    name: 'sessions',
    description: 'List all profiling sessions',
    usage: 'sessions [clear]',
    execute: args => {
      try {
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
          try {
            const duration = session.duration
              ? `${(session.duration / 1000).toFixed(1)}s`
              : 'ongoing';
            output += `  ${session.id} - ${duration} - Avg FPS: ${session.averages.fps.toFixed(1)}\n`;
          } catch (error) {
            console.error('Session processing error:', error);
          }
        });
        return output;
      } catch (error) {
        console.error('Sessions command error:', error);
        return 'Error retrieving sessions';
      }
    },
  });
}

/**
 * Register export command for exporting session data
 */
function registerExportCommand(devConsole: DeveloperConsole, profiler: PerformanceProfiler): void {
  devConsole.registerCommand({
    name: 'export',
    description: 'Export profiling session data',
    usage: 'export <sessionId>',
    execute: args => {
      try {
        if (args.length === 0) {
          return 'Usage: export <sessionId>';
        }

        const sessionId = args[0];
        if (!sessionId) {
          return 'Session ID is required';
        }

        try {
          const session = profiler.getSession(sessionId);
          const data = session ? JSON.stringify(session, null, 2) : 'Session not found';
          // Save to clipboard if available
          if (navigator.clipboard) {
            navigator.clipboard.writeText(data);
            return `Exported session ${sessionId} to clipboard`;
          } else {
            console.log('Session data:', data);
            return `Session data logged to console (clipboard not available)`;
          }
        } catch (error) {
          return `Error: ${error}`;
        }
      } catch (error) {
        console.error('Export command error:', error);
        return 'Error exporting session';
      }
    },
  });
}

/**
 * Setup global keyboard shortcuts for development tools
 */
function setupKeyboardShortcuts(debugMode: DebugMode): void {
  document?.addEventListener('keydown', event => {
    try {
      // Ctrl+Shift+D for debug mode
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        debugMode.toggle();
      }
    } catch (error) {
      console.error('Event listener error for keydown:', error);
    }
  });
}

/**
 * Register all console commands for development tools
 */
function registerConsoleCommands(
  devConsole: DeveloperConsole,
  profiler: PerformanceProfiler
): void {
  registerProfileCommand(devConsole, profiler);
  registerSessionsCommand(devConsole, profiler);
  registerExportCommand(devConsole, profiler);
}

/**
 * Initialize all development tools
 * Should be called in development mode only
 */
export function initializeDevTools(): void {
  const debugMode = DebugMode.getInstance();
  const devConsole = DeveloperConsole.getInstance();
  const profiler = PerformanceProfiler.getInstance();

  registerConsoleCommands(devConsole, profiler);
  setupKeyboardShortcuts(debugMode);
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
    document?.addEventListener('DOMContentLoaded', () => {
      try {
        initializeDevTools();
      } catch (error) {
        console.error('Event listener error for DOMContentLoaded:', error);
      }
    });
  } else {
    initializeDevTools();
  }
}
