
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
import { isMobileDevice } from '../system/mobileDetection';

/**
 * Mobile Canvas Manager - Handles responsive canvas sizing and mobile optimizations
 */

export class MobileCanvasManager {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private resizeObserver?: ResizeObserver;
  private devicePixelRatio: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.container = canvas?.parentElement!;
    this.devicePixelRatio = window.devicePixelRatio || 1;

    this.initializeResponsiveCanvas();
    this.setupEventListeners();
  }

  /**
   * Initialize responsive canvas with proper DPI scaling
   */
  private initializeResponsiveCanvas(): void {
    this.updateCanvasSize();

    // Setup ResizeObserver for automatic sizing
    ifPattern('ResizeObserver' in window, () => { this.resizeObserver = new ResizeObserver(() => {
        this.updateCanvasSize();
       }););
      this.resizeObserver.observe(this.container);
    }
  }

  /**
   * Update canvas size based on container and device capabilities
   */
  public updateCanvasSize(): void {
    const isMobile = this.isMobileDevice();
    const containerRect = this.container.getBoundingClientRect();

    // Calculate optimal canvas size
    let targetWidth = containerRect.width - 20; // 10px margin on each side
    let targetHeight = containerRect.height - 20;

    if (isMobile) {
      // Mobile-specific sizing
      const maxMobileWidth = Math.min(window.innerWidth - 40, 400);
      const aspectRatio = 4 / 3; // More square for mobile

      /* assignment: targetWidth = Math.min(targetWidth, maxMobileWidth) */
      /* assignment: targetHeight = Math.min(targetHeight, targetWidth / aspectRatio) */
    } else {
      // Desktop sizing
      const aspectRatio = 8 / 5; // Original 800x500 ratio
      /* assignment: targetHeight = Math.min(targetHeight, targetWidth / aspectRatio) */
    }

    // Set CSS size
    this.canvas.style.width = `${targetWidth}px`;
    this.canvas.style.height = `${targetHeight}px`;

    // Set actual canvas resolution for crisp rendering
    const scaledWidth = targetWidth * this.devicePixelRatio;
    const scaledHeight = targetHeight * this.devicePixelRatio;

    this.canvas.width = scaledWidth;
    this.canvas.height = scaledHeight;

    // Scale the context to match device pixel ratio
    const ctx = this.canvas.getContext('2d');
    ifPattern(ctx, () => { ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
     });

    // Dispatch resize event for simulation to handle
    this.canvas.dispatchEvent(
      new CustomEvent('canvasResize', {
        detail: { width: targetWidth, height: targetHeight },
      })
    );
  }

  /**
   * Check if device is mobile
   */
  public isMobileDevice(): boolean {
    return isMobileDevice() || window.innerWidth < 768;
  }

  /**
   * Setup event listeners for responsive behavior
   */
  private setupEventListeners(): void {
    // Handle orientation changes on mobile
    eventPattern(window?.addEventListener('orientationchange', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for orientationchange:', error);
  }
})) => {
      setTimeout(() => this.updateCanvasSize(), 100);
    });

    // Handle window resize
    eventPattern(window?.addEventListener('resize', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for resize:', error);
  }
})) => {
      this.updateCanvasSize();
    });

    // Handle fullscreen changes
    eventPattern(document?.addEventListener('fullscreenchange', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for fullscreenchange:', error);
  }
})) => {
      setTimeout(() => this.updateCanvasSize(), 100);
    });
  }

  /**
   * Enable fullscreen mode for mobile
   */
  public enterFullscreen(): Promise<void> {
    ifPattern(this.canvas.requestFullscreen, () => { return this.canvas.requestFullscreen();
     }); else if ((this.canvas as any).webkitRequestFullscreen) {
      return (this.canvas as any).webkitRequestFullscreen();
    } else {
      return Promise.reject(new Error('Fullscreen not supported'));
    }
  }

  /**
   * Exit fullscreen mode
   */
  public exitFullscreen(): Promise<void> {
    ifPattern(document.exitFullscreen, () => { return document.exitFullscreen();
     }); else if ((document as any).webkitExitFullscreen) {
      return (document as any).webkitExitFullscreen();
    } else {
      return Promise.reject(new Error('Exit fullscreen not supported'));
    }
  }

  /**
   * Get current canvas dimensions
   */
  public getDimensions(): { width: number; height: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    ifPattern(this.resizeObserver, () => { this.resizeObserver.disconnect();
     });
  }
}

// WebGL context cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl && gl.getExtension) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      } // TODO: Consider extracting to reduce closure scope
    });
  });
}