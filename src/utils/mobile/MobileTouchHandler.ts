/**
 * Mobile Touch Handler - Advanced touch gesture support for mobile devices
 */

export interface TouchGestureCallbacks {
  onTap?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  onPinch?: (scale: number, centerX: number, centerY: number) => void;
  onPan?: (deltaX: number, deltaY: number) => void;
  onLongPress?: (x: number, y: number) => void;
}

export class MobileTouchHandler {
  private canvas: HTMLCanvasElement;
  private callbacks: TouchGestureCallbacks;

  // Touch state tracking
  private touches: Touch[] = [];
  private lastTapTime = 0;
  private longPressTimer?: NodeJS.Timeout;
  private isPanning = false;
  private lastPanPosition = { x: 0, y: 0 };
  private initialPinchDistance = 0;
  private lastPinchScale = 1;

  // Configuration
  private readonly DOUBLE_TAP_DELAY = 300;
  private readonly LONG_PRESS_DELAY = 500;
  private readonly MIN_PINCH_DISTANCE = 10;
  private readonly MIN_PAN_DISTANCE = 5;

  constructor(canvas: HTMLCanvasElement, callbacks: TouchGestureCallbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.setupTouchEvents();
  }

  /**
   * Setup touch event listeners
   */
  private setupTouchEvents(): void {
    // Prevent default touch behaviors
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), {
      passive: false,
    });

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  /**
   * Handle touch start
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    this.touches = Array.from(event.touches);

    if (this.touches.length === 1) {
      // Single touch - potential tap or long press
      const touch = this.touches[0];
      const coords = this.getTouchCoordinates(touch);

      // Start long press timer
      this.longPressTimer = setTimeout(() => {
        if (this.callbacks.onLongPress) {
          this.callbacks.onLongPress(coords.x, coords.y);
          this.vibrate(50); // Longer vibration for long press
        }
      }, this.LONG_PRESS_DELAY);
    } else if (this.touches.length === 2) {
      // Two touches - potential pinch
      this.clearLongPressTimer();
      this.initialPinchDistance = this.getDistance(this.touches[0], this.touches[1]);
      this.lastPinchScale = 1;
    }
  }

  /**
   * Handle touch move
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    this.touches = Array.from(event.touches);

    if (this.touches.length === 1) {
      // Single touch - potential pan
      const touch = this.touches[0];
      const coords = this.getTouchCoordinates(touch);

      if (!this.isPanning) {
        // Check if we've moved enough to start panning
        const startCoords = this.getTouchCoordinates(event.changedTouches[0]);
        const distance = Math.sqrt(
          Math.pow(coords.x - startCoords.x, 2) + Math.pow(coords.y - startCoords.y, 2)
        );

        if (distance > this.MIN_PAN_DISTANCE) {
          this.isPanning = true;
          this.clearLongPressTimer();
          this.lastPanPosition = coords;
        }
      } else {
        // Continue panning
        const deltaX = coords.x - this.lastPanPosition.x;
        const deltaY = coords.y - this.lastPanPosition.y;

        if (this.callbacks.onPan) {
          this.callbacks.onPan(deltaX, deltaY);
        }

        this.lastPanPosition = coords;
      }
    } else if (this.touches.length === 2) {
      // Two touches - pinch gesture
      const currentDistance = this.getDistance(this.touches[0], this.touches[1]);

      if (this.initialPinchDistance > this.MIN_PINCH_DISTANCE) {
        const scale = currentDistance / this.initialPinchDistance;
        const center = this.getPinchCenter(this.touches[0], this.touches[1]);

        if (this.callbacks.onPinch) {
          this.callbacks.onPinch(scale, center.x, center.y);
        }

        this.lastPinchScale = scale;
      }
    }
  }

  /**
   * Handle touch end
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    this.clearLongPressTimer();

    if (event.touches.length === 0) {
      // All touches ended
      if (!this.isPanning && this.touches.length === 1) {
        // This was a tap
        const touch = event.changedTouches[0];
        const coords = this.getTouchCoordinates(touch);

        // Check for double tap
        const now = Date.now();
        if (now - this.lastTapTime < this.DOUBLE_TAP_DELAY) {
          if (this.callbacks.onDoubleTap) {
            this.callbacks.onDoubleTap(coords.x, coords.y);
            this.vibrate(25); // Double vibration for double tap
            setTimeout(() => this.vibrate(25), 50);
          }
        } else {
          if (this.callbacks.onTap) {
            this.callbacks.onTap(coords.x, coords.y);
            this.vibrate(10); // Light vibration for tap
          }
        }

        this.lastTapTime = now;
      }

      // Reset state
      this.isPanning = false;
      this.touches = [];
    }

    this.touches = Array.from(event.touches);
  }

  /**
   * Handle touch cancel
   */
  private handleTouchCancel(_event: TouchEvent): void {
    this.clearLongPressTimer();
    this.isPanning = false;
    this.touches = [];
  }

  /**
   * Get touch coordinates relative to canvas
   */
  private getTouchCoordinates(touch: Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  /**
   * Get distance between two touches
   */
  private getDistance(touch1: Touch, touch2: Touch): number {
    const coords1 = this.getTouchCoordinates(touch1);
    const coords2 = this.getTouchCoordinates(touch2);

    return Math.sqrt(Math.pow(coords2.x - coords1.x, 2) + Math.pow(coords2.y - coords1.y, 2));
  }

  /**
   * Get center point between two touches
   */
  private getPinchCenter(touch1: Touch, touch2: Touch): { x: number; y: number } {
    const coords1 = this.getTouchCoordinates(touch1);
    const coords2 = this.getTouchCoordinates(touch2);

    return {
      x: (coords1.x + coords2.x) / 2,
      y: (coords1.y + coords2.y) / 2,
    };
  }

  /**
   * Clear long press timer
   */
  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = undefined;
    }
  }

  /**
   * Provide haptic feedback if available
   */
  private vibrate(duration: number): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  /**
   * Update callbacks
   */
  public updateCallbacks(callbacks: TouchGestureCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.clearLongPressTimer();
    // Note: Event listeners are automatically cleaned up when canvas is removed
  }
}
