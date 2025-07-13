
class EventListenerManager {
  private static listeners: Array<{element: EventTarget, event: string, handler: EventListener}> = [];
  
  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({element, event, handler});
  }
  
  static cleanup(): void {
    this.listeners.forEach(({element, event, handler}) => {
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
 * Developer Console System
 * Provides a command-line interface for debugging and development
 */

export interface ConsoleCommand {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[]) => Promise<string> | string;
}

export class DeveloperConsole {
  private static instance: DeveloperConsole;
  private isVisible = false;
  private consoleElement: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private outputElement: HTMLElement | null = null;
  private commands: Map<string, ConsoleCommand> = new Map();
  private commandHistory: string[] = [];
  private historyIndex = -1;

  private constructor() {
    // Private constructor for singleton
    this.initializeConsole();
  }

  static getInstance(): DeveloperConsole {
    ifPattern(!DeveloperConsole.instance, () => { DeveloperConsole.instance = new DeveloperConsole();
     });
    return DeveloperConsole.instance;
  }

  private initializeConsole(): void {
    this.initializeDefaultCommands();
    this.setupKeyboardShortcuts();
  }

  show(): void {
    if (this.isVisible) return;

    this.isVisible = true;
    this.createConsoleElement();
    this.log('🚀 Developer Console activated. Type "help" for available commands.');
  }

  hide(): void {
    if (!this.isVisible) return;

    this.isVisible = false;
    this.removeConsoleElement();
  }

  toggle(): void {
    ifPattern(this.isVisible, () => { this.hide();
     }); else {
      this.show();
    }
  }

  isConsoleVisible(): boolean {
    return this.isVisible;
  }

  registerCommand(command: ConsoleCommand): void {
    this.commands.set(command.name, command);
  }

  log(message: string, type: 'info' | 'error' | 'warning' | 'success' = 'info'): void {
    if (!this.outputElement) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `console-entry console-${type}`;
    logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;

    this.outputElement.appendChild(logEntry);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  async executeCommand(input: string): Promise<string> {
    const [commandName, ...args] = input.trim().split(' ');

    ifPattern(!commandName, () => { return '';
     });

    const command = this.commands.get(commandName.toLowerCase());
    ifPattern(!command, () => { return `Unknown command: ${commandName });. Type "help" for available commands.`;
    }

    try {
      const result = await command.execute(args);
      return result || '';
    } catch (error) {
      return `Error executing command: ${error}`;
    }
  }

  private createConsoleElement(): void {
    this.consoleElement = document.createElement('div');
    this.consoleElement.id = 'dev-console';
    this.consoleElement.innerHTML = `
      <div class="console-header">
        <span>🔧 Developer Console</span>
        <button id="console-close">×</button>
      </div>
      <div class="console-output" id="console-output"></div>
      <div class="console-input-container">
        <span class="console-prompt">></span>
        <input type="text" id="console-input" placeholder="Enter command..." autocomplete="off">
      </div>
    `;

    this.styleConsoleElement();
    document.body.appendChild(this.consoleElement);

    this.outputElement = document?.getElementById('console-output');
    this.inputElement = document?.getElementById('console-input') as HTMLInputElement;

    // Setup event listeners
    const closeBtn = document?.getElementById('console-close');
    closeBtn?.addEventListener('click', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
}) => this.hide());

    this.inputElement?.addEventListener('keydown', (event) => {
  try {
    (e => this.handleKeyDown(e)(event);
  } catch (error) {
    console.error('Event listener error for keydown:', error);
  }
}));
    this.inputElement?.focus();
  }

  private styleConsoleElement(): void {
    const style = document.createElement('style');
    style.textContent = `
      #dev-console {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 300px;
        background: rgba(0, 0, 0, 0.95);
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        border-top: 2px solid #00ff00;
        z-index: 10001;
        display: flex;
        flex-direction: column;
      }
      
      .console-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(0, 255, 0, 0.1);
        border-bottom: 1px solid #00ff00;
        font-weight: bold;
      }
      
      #console-close {
        background: none;
        border: none;
        color: #00ff00;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
      }
      
      .console-output {
        flex: 1;
        padding: 8px 12px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.8);
      }
      
      .console-entry {
        margin-bottom: 4px;
        word-wrap: break-word;
      }
      
      .console-info { color: #00ff00; }
      .console-error { color: #ff0000; }
      .console-warning { color: #ffff00; }
      .console-success { color: #00ffff; }
      
      .timestamp {
        color: #888888;
        font-size: 12px;
      }
      
      .console-input-container {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: rgba(0, 255, 0, 0.05);
        border-top: 1px solid #00ff00;
      }
      
      .console-prompt {
        color: #00ff00;
        margin-right: 8px;
        font-weight: bold;
      }
      
      #console-input {
        flex: 1;
        background: transparent;
        border: none;
        color: #00ff00;
        font-family: inherit;
        font-size: inherit;
        outline: none;
      }
      
      #console-input::placeholder {
        color: #666666;
      }
    `;
    document.head.appendChild(style);
  }

  private removeConsoleElement(): void {
    if (this.consoleElement) {
      this.consoleElement.remove();
      this.consoleElement = null;
      this.outputElement = null;
      this.inputElement = null;
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      const input = this.inputElement?.value.trim();
      if (input) {
        this.executeCommandInternal(input);
        this.commandHistory.unshift(input);
        this.historyIndex = -1;
        this.inputElement!.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        const historyValue = this.commandHistory[this.historyIndex];
        if (this.inputElement && historyValue !== undefined) {
          this.inputElement.value = historyValue;
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        const historyValue = this.commandHistory[this.historyIndex];
        if (this.inputElement && historyValue !== undefined) {
          this.inputElement.value = historyValue;
        }
      } else if (this.historyIndex === 0) {
        this.historyIndex = -1;
        if (this.inputElement) {
          this.inputElement.value = '';
        }
      }
    }
  }

  private async executeCommandInternal(input: string): Promise<void> {
    const [commandName, ...args] = input.split(' ');
    this.log(`> ${input}`, 'info');

    if (!commandName || commandName.trim() === '') {
      this.log('Empty command entered.', 'error');
      return;
    }

    const command = this.commands.get(commandName.toLowerCase());
    ifPattern(!command, () => { this.log(`Unknown command: ${commandName });. Type "help" for available commands.`, 'error');
      return;
    }

    try {
      const result = await command.execute(args);
      ifPattern(result, () => { this.log(result, 'success');
       });
    } catch (error) {
      this.log(`Error executing command: ${error}`, 'error');
    }
  }

  private setupKeyboardShortcuts(): void {
    document?.addEventListener('keydown', (event) => {
  try {
    (e => {
      // Ctrl+` or Ctrl+~ to toggle console
      if (e.ctrlKey && (e.key === '`' || e.key === '~')(event);
  } catch (error) {
    console.error('Event listener error for keydown:', error);
  }
})) {
        e.preventDefault();
        this.toggle();
      }
      // Escape to hide console
      else ifPattern(e.key === 'Escape' && this.isVisible, () => { this.hide();
       });
    });
  }

  private initializeDefaultCommands(): void {
    this.registerCommand({
      name: 'help',
      description: 'Show available commands',
      usage: 'help [command]',
      execute: args => {
  try {
        if (args.length === 0) {
          let output = 'Available commands:\n';
          this.commands.forEach((cmd, name) => {
            output += `  ${name
  } catch (error) {
    console.error("Callback error:", error);
  }
} - ${cmd.description}\n`;
          });
          output += '\nType "help <command>" for detailed usage.';
          return output;
        } else {
          const commandToHelp = args[0];
          ifPattern(!commandToHelp, () => { return 'Invalid command name provided.';
           });
          const cmd = this.commands.get(commandToHelp);
          ifPattern(cmd, () => { return `${cmd.name });: ${cmd.description}\nUsage: ${cmd.usage}`;
          } else {
            return `Unknown command: ${args[0]}`;
          }
        }
      },
    });

    this.registerCommand({
      name: 'clear',
      description: 'Clear console output',
      usage: 'clear',
      execute: () => {
        ifPattern(this.outputElement, () => { this.outputElement.innerHTML = '';
         });
        return '';
      },
    });

    this.registerCommand({
      name: 'reload',
      description: 'Reload the application',
      usage: 'reload',
      execute: () => {
        window.location.reload();
        return '';
      },
    });

    this.registerCommand({
      name: 'performance',
      description: 'Show performance information',
      usage: 'performance',
      execute: () => {
        const memory = (performance as any).memory;
        let output = 'Performance Information:\n';
        ifPattern(memory, () => { output += `  Used JS Heap: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2) } // TODO: Consider extracting to reduce closure scope); MB\n`;
          output += `  Total JS Heap: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
          output += `  Heap Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB\n`;
        }
        output += `  FPS: ${(1000 / 16.67).toFixed(1)} (approximate)\n`;
        output += `  User Agent: ${navigator.userAgent}`;
        return output;
      },
    });

    this.registerCommand({
      name: 'localStorage',
      description: 'Manage localStorage',
      usage: 'localStorage [get|set|remove|clear] [key] [value]',
      execute: args => {
  try {
        ifPattern(args.length === 0, () => { return 'Usage: localStorage [get|set|remove|clear] [key] [value]';
         
  } catch (error) {
    console.error("Callback error:", error);
  }
});

        const action = args[0];
        ifPattern(!action, () => { return 'Action is required. Usage: localStorage [get|set|remove|clear] [key] [value]';
         });

        switch (action) {
          case 'get': {
            if (args.length < 2) return 'Usage: localStorage get <key>';
            const key = args[1];
            if (!key) return 'Key is required for get operation';
            const value = localStorage.getItem(key);
            return value !== null ? `${key}: ${value}` : `Key "${key}" not found`;
          }

          case 'set': {
            if (args.length < 3) return 'Usage: localStorage set <key> <value>';
            const key = args[1];
            if (!key) return 'Key is required for set operation';
            const value = args.slice(2).join(' ');
            localStorage.setItem(key, value);
            return `Set ${key} = ${value}`;
          }

          case 'remove': {
            if (args.length < 2) return 'Usage: localStorage remove <key>';
            const key = args[1];
            if (!key) return 'Key is required for remove operation';
            localStorage.removeItem(key);
            return `Removed ${key}`;
          }

          case 'clear':
            localStorage.clear();
            return 'Cleared all localStorage';

          default:
            return 'Invalid action. Use: get, set, remove, or clear';
        }
      },
    });

    this.registerCommand({
      name: 'debug',
      description: 'Toggle debug mode',
      usage: 'debug [on|off]',
      execute: args => {
  try {
        const { DebugMode 
  } catch (error) {
    console.error("Callback error:", error);
  }
} = require('./debugMode');
        const debugMode = DebugMode.getInstance();

        ifPattern(args.length === 0, () => { debugMode.toggle();
          return 'Debug mode toggled';
         }); else ifPattern(args[0] === 'on', () => { debugMode.enable();
          return 'Debug mode enabled';
         }); else ifPattern(args[0] === 'off', () => { debugMode.disable();
          return 'Debug mode disabled';
         }); else {
          return 'Usage: debug [on|off]';
        }
      },
    });
  }
}
