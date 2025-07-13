import { MemoryMonitor } from '../../utils/memory/memoryMonitor';
import { log } from '../../utils/system/logger';
import './MemoryPanelComponent.css';

/**
 * Memory management UI component
 */
export class MemoryPanelComponent {
  private element: HTMLElement;
  private memoryMonitor: MemoryMonitor;
  private updateInterval: number | null = null;
  private isVisible = false; // Panel starts hidden (only toggle button visible)
  private isMobile = false; // Track if we're on a mobile device

  constructor() {
    this.memoryMonitor = MemoryMonitor.getInstance();
    this.detectMobile();
    this.element = this.createElement();
    this.setupEventListeners();
    this.handleMobileViewport();

    // Set initial visibility state to match CSS default (hidden)
    const panel = this.element.querySelector('.memory-panel') as HTMLElement;
    if (panel) {
      panel.classList.remove('visible'); // Ensure it starts hidden
    }
  }

  /**
   * Detect if we're on a mobile device
   */
  private detectMobile(): void {
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768;
  }

  /**
   * Handle mobile viewport changes and positioning
   */
  private handleMobileViewport(): void {
    if (this.isMobile) {
      // Add mobile-specific class for easier styling
      this.element.classList.add('mobile-optimized');

      // Handle orientation changes
      const handleOrientationChange = () => {
        setTimeout(() => {
          this.detectMobile(); // Re-detect in case orientation affects this
          this.adjustMobilePosition();
        }, 100);
      };

      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);
    }
  }

  /**
   * Adjust positioning for mobile devices
   */
  private adjustMobilePosition(): void {
    if (!this.isMobile) return;

    const panel = this.element.querySelector('.memory-panel') as HTMLElement;
    if (panel) {
      // Ensure the panel doesn't extend beyond viewport
      const viewportWidth = window.innerWidth;
      const panelWidth = panel.offsetWidth;

      if (panelWidth > viewportWidth - 20) {
        panel.style.width = `${viewportWidth - 30}px`;
      }

      // Temporarily hide panel if it would cause horizontal scrolling
      if (this.isVisible && panelWidth > viewportWidth - 60) {
        this.setVisible(false);
      }
    }
  }

  /**
   * Create the memory panel element
   */
  private createElement(): HTMLElement {
    // Create wrapper container
    const wrapper = document.createElement('div');
    wrapper.className = 'memory-panel-wrapper';

    // Create toggle button (stays fixed)
    const toggleButton = document.createElement('button');
    toggleButton.className = 'memory-toggle-fixed';
    toggleButton.innerHTML = '📊';
    toggleButton.title = 'Toggle Memory Panel';

    // Create sliding panel
    const panel = document.createElement('div');
    panel.className = 'memory-panel';
    panel.innerHTML = `
      <div class="memory-header">
        <h3>🧠 Memory Monitor</h3>
      </div>
      <div class="memory-content">
        <div class="memory-stats">
          <div class="memory-stat">
            <label>Usage:</label>
            <span class="memory-usage">--</span>
            <div class="memory-bar">
              <div class="memory-fill"></div>
            </div>
          </div>
          <div class="memory-stat">
            <label>Level:</label>
            <span class="memory-level">--</span>
          </div>
          <div class="memory-stat">
            <label>Trend:</label>
            <span class="memory-trend">--</span>
          </div>
          <div class="memory-stat">
            <label>Pool Stats:</label>
            <span class="pool-stats">--</span>
          </div>
        </div>
        
        <div class="memory-controls">
          <button class="memory-cleanup" title="Trigger Memory Cleanup">🧹 Cleanup</button>
          <button class="memory-force-gc" title="Force Garbage Collection">🗑️ Force GC</button>
          <button class="memory-toggle-soa" title="Toggle Structure of Arrays">📦 Toggle SoA</button>
        </div>
        
        <div class="memory-recommendations">
          <div class="recommendations-header">💡 Recommendations:</div>
          <div class="recommendations-list"></div>
        </div>
      </div>
    `;

    wrapper.appendChild(toggleButton);
    wrapper.appendChild(panel);

    return wrapper;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    const toggleButton = this.element.querySelector('.memory-toggle-fixed') as HTMLButtonElement;
    const cleanupButton = this.element.querySelector('.memory-cleanup') as HTMLButtonElement;
    const forceGcButton = this.element.querySelector('.memory-force-gc') as HTMLButtonElement;
    const toggleSoaButton = this.element.querySelector('.memory-toggle-soa') as HTMLButtonElement;

    toggleButton?.addEventListener('click', () => this.toggle());
    cleanupButton?.addEventListener('click', () => this.triggerCleanup());
    forceGcButton?.addEventListener('click', () => this.forceGarbageCollection());
    toggleSoaButton?.addEventListener('click', () => this.toggleSoA());

    // Listen for memory cleanup events
    window.addEventListener('memory-cleanup', () => {
      this.updateDisplay();
    });
  }

  /**
   * Trigger memory cleanup
   */
  private triggerCleanup(): void {
    window.dispatchEvent(
      new CustomEvent('memory-cleanup', {
        detail: { level: 'normal' },
      })
    );

    log.logSystem('Memory cleanup triggered manually');
  }

  /**
   * Force garbage collection (if available)
   */
  private forceGarbageCollection(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      try {
        (window as any).gc();
        log.logSystem('Garbage collection forced');
      } catch (error) {
        log.logSystem('Failed to force garbage collection', { error });
      }
    } else {
      log.logSystem('Garbage collection not available in this browser');
    }
  }

  /**
   * Toggle Structure of Arrays optimization
   */
  private toggleSoA(): void {
    // Dispatch event for simulation to handle
    window.dispatchEvent(new CustomEvent('toggle-soa-optimization'));
    log.logSystem('SoA optimization toggle requested');
  }

  /**
   * Toggle panel visibility
   */
  public toggle(): void {
    // On mobile, check if we have enough space before showing
    if (!this.isVisible && this.isMobile) {
      const panel = this.element.querySelector('.memory-panel') as HTMLElement;
      if (panel) {
        const viewportWidth = window.innerWidth;
        if (viewportWidth < 480) {
          return; // Don't show on very small screens
        }
      }
    }

    this.isVisible = !this.isVisible;

    const panel = this.element.querySelector('.memory-panel') as HTMLElement;
    if (panel) {
      panel.classList.toggle('visible', this.isVisible);

      // Apply mobile positioning adjustments if needed
      if (this.isVisible && this.isMobile) {
        this.adjustMobilePosition();
      }
    }

    if (this.isVisible) {
      this.startUpdating();
    } else {
      this.stopUpdating();
    }
  }

  /**
   * Start updating the display
   */
  private startUpdating(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateDisplay();
    this.updateInterval = window.setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  /**
   * Stop updating the display
   */
  private stopUpdating(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update the display with current memory information
   */
  private updateDisplay(): void {
    const stats = this.memoryMonitor.getMemoryStats();
    const recommendations = this.memoryMonitor.getMemoryRecommendations();

    // Update usage
    const usageElement = this.element.querySelector('.memory-usage') as HTMLElement;
    const fillElement = this.element.querySelector('.memory-fill') as HTMLElement;
    if (usageElement && fillElement) {
      usageElement.textContent = `${stats.percentage.toFixed(1)}%`;
      fillElement.style.width = `${Math.min(stats.percentage, 100)}%`;

      // Color based on usage level
      const level = stats.level;
      fillElement.className = `memory-fill memory-${level}`;
    }

    // Update level
    const levelElement = this.element.querySelector('.memory-level') as HTMLElement;
    if (levelElement) {
      levelElement.textContent = stats.level;
      levelElement.className = `memory-level memory-${stats.level}`;
    }

    // Update trend
    const trendElement = this.element.querySelector('.memory-trend') as HTMLElement;
    if (trendElement) {
      const trendIcon =
        stats.trend === 'increasing' ? '📈' : stats.trend === 'decreasing' ? '📉' : '➡️';
      trendElement.textContent = `${trendIcon} ${stats.trend}`;
    }

    // Update pool stats (this would need to be passed from simulation)
    const poolElement = this.element.querySelector('.pool-stats') as HTMLElement;
    if (poolElement) {
      poolElement.textContent = 'Available'; // Placeholder
    }

    // Update recommendations
    const recommendationsElement = this.element.querySelector(
      '.recommendations-list'
    ) as HTMLElement;
    if (recommendationsElement) {
      if (recommendations.length > 0) {
        recommendationsElement.innerHTML = recommendations
          .slice(0, 3) // Show only top 3 recommendations
          .map(rec => `<div class="recommendation">• ${rec}</div>`)
          .join('');
      } else {
        recommendationsElement.innerHTML = '<div class="recommendation">• All good! 👍</div>';
      }
    }
  }

  /**
   * Mount the component to a parent element
   */
  public mount(parent: HTMLElement): void {
    parent.appendChild(this.element);

    // Start with the panel hidden (toggle button visible)
    this.setVisible(false);
  }

  /**
   * Unmount the component
   */
  public unmount(): void {
    this.stopUpdating();
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Update pool statistics from external source
   */
  public updatePoolStats(poolStats: any): void {
    const poolElement = this.element.querySelector('.pool-stats') as HTMLElement;
    if (poolElement && poolStats) {
      const reusePercentage = (poolStats.reuseRatio * 100).toFixed(1);
      poolElement.textContent = `${poolStats.poolSize}/${poolStats.maxSize} (${reusePercentage}% reuse)`;
    }
  }

  /**
   * Show/hide the panel
   */
  public setVisible(visible: boolean): void {
    if (visible !== this.isVisible) {
      this.isVisible = visible;

      const panel = this.element.querySelector('.memory-panel') as HTMLElement;
      if (panel) {
        panel.classList.toggle('visible', this.isVisible);
      }

      if (this.isVisible) {
        this.startUpdating();
      } else {
        this.stopUpdating();
      }
    }
  }
}
