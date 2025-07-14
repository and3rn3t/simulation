
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
 * Debug Mode System
 * Provides detailed simulation information and debugging capabilities
 */

export interface DebugInfo {
  fps: number;
  frameTime: number;
  organismCount: number;
  memoryUsage: number;
  canvasOperations: number;
  simulationTime: number;
  lastUpdate: number;
}

export class DebugMode {
  private static instance: DebugMode;
  private isEnabled = false;
  private debugPanel: HTMLElement | null = null;
  private debugInfo: DebugInfo = {
    fps: 0,
    frameTime: 0,
    organismCount: 0,
    memoryUsage: 0,
    canvasOperations: 0,
    simulationTime: 0,
    lastUpdate: 0,
  };

  private fpsHistory: number[] = [];
  private frameTimeHistory: number[] = [];
  private lastFrameTime = performance.now();
  private updateInterval: number | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): DebugMode {
    if (!DebugMode.instance) { DebugMode.instance = new DebugMode();
      }
    return DebugMode.instance;
  }

  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    this.createDebugPanel();
    this.startUpdating();
  }

  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    this.removeDebugPanel();
    this.stopUpdating();
  }

  toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  isDebugEnabled(): boolean {
    return this.isEnabled;
  }

  updateInfo(info: Partial<DebugInfo>): void {
    Object.assign(this.debugInfo, info);
    this.debugInfo.lastUpdate = performance.now();
  }

  trackFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.fpsHistory.push(1000 / frameTime);
    this.frameTimeHistory.push(frameTime);

    // Keep only last 60 frames for rolling average
    if (this.fpsHistory.length > 60) { this.fpsHistory.shift();
      this.frameTimeHistory.shift();
      }

    // Calculate averages
    this.debugInfo.fps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    this.debugInfo.frameTime =
      this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
  }

  private createDebugPanel(): void  { try { this.debugPanel = document.createElement('div');
    this.debugPanel.id = 'debug-panel';
    this.debugPanel.innerHTML = `
      <div class="debug-header">
        <h3>🐛 Debug Panel</h3>
        <button id="debug-close">×</button>
      </div>
      <div class="debug-content">
        <div class="debug-section">
          <h4>Performance</h4>
          <div class="debug-metric">
            <span class="debug-label">FPS:</span>
            <span id="debug-fps">0</span>
          </div>
          <div class="debug-metric">
            <span class="debug-label">Frame Time:</span>
            <span id="debug-frame-time">0ms</span>
          </div>
        </div>
        
        <div class="debug-section">
          <h4>Simulation</h4>
          <div class="debug-metric">
            <span class="debug-label">Organisms:</span>
            <span id="debug-organism-count">0</span>
          </div>
          <div class="debug-metric">
            <span class="debug-label">Simulation Time:</span>
            <span id="debug-simulation-time">0s</span>
          </div>
        </div>
        
        <div class="debug-section">
          <h4>Memory</h4>
          <div class="debug-metric">
            <span class="debug-label">Memory Usage:</span>
            <span id="debug-memory">0 MB</span>
          </div>
          <div class="debug-metric">
            <span class="debug-label">Canvas Ops:</span>
            <span id="debug-canvas-ops">0</span>
          </div>
        </div>
        
        <div class="debug-section">
          <h4>Actions</h4>
          <button id="debug-dump-state">Dump State</button>
          <button id="debug-performance-profile">Profile</button>
          <button id="debug-memory-gc">Force GC</button>
        </div>
      </div>
    `;

    this.styleDebugPanel();
    document.body.appendChild(this.debugPanel);

    // Add event listeners
    const closeBtn = this.debugPanel?.querySelector('#debug-close');
    closeBtn?.addEventListener('click', (event) => {
  try {
    (event) => {
   } catch (error) { /* handled */ } }
}) => this.disable());

    const dumpStateBtn = this.debugPanel?.querySelector('#debug-dump-state');
    dumpStateBtn?.addEventListener('click', (event) => {
  try {
    (event) => {
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
}) => this.dumpState());

    const profileBtn = this.debugPanel?.querySelector('#debug-performance-profile');
    profileBtn?.addEventListener('click', (event) => {
  try {
    (event) => {
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
}) => this.startPerformanceProfile());

    const gcBtn = this.debugPanel?.querySelector('#debug-memory-gc');
    gcBtn?.addEventListener('click', (event) => {
  try {
    (event) => {
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
}) => this.forceGarbageCollection());
  }

  private styleDebugPanel(): void {
    if (!this.debugPanel) return;

    const style = document.createElement('style');
    style.textContent = `
      #debug-panel {
        position: fixed;
        top: 10px;
        right: 10px;
        width: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        border: 1px solid #00ff00;
        border-radius: 4px;
        z-index: 10000;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(0, 255, 0, 0.1);
        border-bottom: 1px solid #00ff00;
      }
      
      .debug-header h3 {
        margin: 0;
        font-size: 14px;
      }
      
      #debug-close {
        background: none;
        border: none;
        color: #00ff00;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
      }
      
      .debug-content {
        padding: 12px;
      }
      
      .debug-section {
        margin-bottom: 16px;
      }
      
      .debug-section h4 {
        margin: 0 0 8px 0;
        color: #ffff00;
        font-size: 12px;
      }
      
      .debug-metric {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      
      .debug-label {
        color: #cccccc;
      }
      
      .debug-section button {
        background: rgba(0, 255, 0, 0.2);
        border: 1px solid #00ff00;
        color: #00ff00;
        padding: 4px 8px;
        margin: 2px;
        cursor: pointer;
        font-size: 10px;
        border-radius: 2px;
      }
      
      .debug-section button:hover {
        background: rgba(0, 255, 0, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  private startUpdating(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateDebugDisplay();
    }, 100); // Update 10 times per second
  }

  private stopUpdating(): void {
    if (this.updateInterval) { clearInterval(this.updateInterval);
      this.updateInterval = null;
      }
  }

  private updateDebugDisplay(): void {
    if (!this.debugPanel) return;

    const fps = this.debugPanel?.querySelector('#debug-fps');
    const frameTime = this.debugPanel?.querySelector('#debug-frame-time');
    const organismCount = this.debugPanel?.querySelector('#debug-organism-count');
    const simulationTime = this.debugPanel?.querySelector('#debug-simulation-time');
    const memory = this.debugPanel?.querySelector('#debug-memory');
    const canvasOps = this.debugPanel?.querySelector('#debug-canvas-ops');

    if (fps) fps.textContent = this.debugInfo.fps.toFixed(1);
    if (frameTime) frameTime.textContent = `${this.debugInfo.frameTime.toFixed(2)}ms`;
    if (organismCount) organismCount.textContent = this.debugInfo.organismCount.toString();
    if (simulationTime)
      simulationTime.textContent = `${(this.debugInfo.simulationTime / 1000).toFixed(1)}s`;
    if (memory) memory.textContent = `${(this.debugInfo.memoryUsage / 1024 / 1024).toFixed(2)} MB`;
    if (canvasOps) canvasOps.textContent = this.debugInfo.canvasOperations?.toString();
  }

  private removeDebugPanel(): void {
    if (this.debugPanel) { this.debugPanel.remove();
      this.debugPanel = null;
      }
  }

  private dumpState(): void {
    const state = {
      debugInfo: this.debugInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      performance: {
        memory: (performance as any).memory,
        timing: performance.timing,
      },
    };

    console.group('🔍 State Dump');
    console.groupEnd();

    // Also save to localStorage for debugging
    localStorage.setItem('debug-state-dump', JSON.stringify(state));
  }

  private startPerformanceProfile(): void {
    performance.mark('profile-start');

    setTimeout(() => {
      performance.mark('profile-end');
      performance.measure('debug-profile', 'profile-start', 'profile-end');

      const entries = performance.getEntriesByType('measure');
      console.group('📊 Performance Profile');
      entries.forEach(entry => {
        } // TODO: Consider extracting to reduce closure scopems`);
      });
      console.groupEnd();
    }, 5000); // Profile for 5 seconds
  }

  private forceGarbageCollection(): void {
    if ((window as any).gc) {
      (window as any).gc();
    } else {
      '
      );
    }
  }
}
