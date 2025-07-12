/**
 * Advanced Mobile Gestures - Enhanced touch interactions for mobile devices
 */

export interface AdvancedGestureCallbacks {
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
  onRotate?: (angle: number, center: { x: number; y: number }) => void;
  onThreeFingerTap?: () => void;
  onFourFingerTap?: () => void;
  onEdgeSwipe?: (edge: 'top' | 'bottom' | 'left' | 'right') => void;
  onForceTouch?: (force: number, x: number, y: number) => void;
}

export class AdvancedMobileGestures {
  private canvas: HTMLCanvasElement;
  private callbacks: AdvancedGestureCallbacks;
  private touchHistory: TouchEvent[] = [];
  private swipeThreshold: number = 50; // pixels
  private velocityThreshold: number = 0.5; // pixels/ms
  private rotationThreshold: number = 5; // degrees
  private edgeDetectionZone: number = 20; // pixels from edge

  constructor(canvas: HTMLCanvasElement, callbacks: AdvancedGestureCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.setupEventListeners();
  }

  /**
   * Setup advanced touch event listeners
   */
  private setupEventListeners(): void {
    // Advanced touch events
    this.canvas.addEventListener('touchstart', this.handleAdvancedTouchStart.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', this.handleAdvancedTouchMove.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchend', this.handleAdvancedTouchEnd.bind(this), {
      passive: false,
    });

    // Force touch support (iOS)
    if ('ontouchforcechange' in window) {
      this.canvas.addEventListener('touchforcechange', this.handleForceTouch.bind(this));
    }

    // Edge swipe detection
    this.setupEdgeSwipeDetection();
  }

  /**
   * Handle advanced touch start
   */
  private handleAdvancedTouchStart(event: TouchEvent): void {
    this.touchHistory = [event];

    // Detect multi-finger taps
    if (event.touches.length === 3) {
      this.detectThreeFingerTap(event);
    } else if (event.touches.length === 4) {
      this.detectFourFingerTap(event);
    }
  }

  /**
   * Handle advanced touch move
   */
  private handleAdvancedTouchMove(event: TouchEvent): void {
    this.touchHistory.push(event);

    // Keep only recent history (last 10 events)
    if (this.touchHistory.length > 10) {
      this.touchHistory = this.touchHistory.slice(-10);
    }

    // Detect rotation gesture
    if (event.touches.length === 2) {
      this.detectRotationGesture(event);
    }
  }

  /**
   * Handle advanced touch end
   */
  private handleAdvancedTouchEnd(_event: TouchEvent): void {
    // Detect swipe gestures
    if (this.touchHistory.length >= 2) {
      this.detectSwipeGesture();
    }

    // Clear history after a delay
    setTimeout(() => {
      this.touchHistory = [];
    }, 100);
  }

  /**
   * Detect swipe gestures with velocity
   */
  private detectSwipeGesture(): void {
    if (this.touchHistory.length < 2) return;

    const start = this.touchHistory[0];
    const end = this.touchHistory[this.touchHistory.length - 1];

    if (start.touches.length !== 1 || end.changedTouches.length !== 1) return;

    const startTouch = start.touches[0];
    const endTouch = end.changedTouches[0];

    const deltaX = endTouch.clientX - startTouch.clientX;
    const deltaY = endTouch.clientY - startTouch.clientY;
    const deltaTime = end.timeStamp - start.timeStamp;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    if (distance < this.swipeThreshold || velocity < this.velocityThreshold) return;

    // Determine swipe direction
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    let direction: 'up' | 'down' | 'left' | 'right';

    if (angle >= -45 && angle <= 45) {
      direction = 'right';
    } else if (angle >= 45 && angle <= 135) {
      direction = 'down';
    } else if (angle >= -135 && angle <= -45) {
      direction = 'up';
    } else {
      direction = 'left';
    }

    this.callbacks.onSwipe?.(direction, velocity);
    this.hapticFeedback('medium');
  }

  /**
   * Detect rotation gestures
   */
  private detectRotationGesture(event: TouchEvent): void {
    if (this.touchHistory.length < 2) return;

    const current = event;
    const previous = this.touchHistory[this.touchHistory.length - 2];

    if (current.touches.length !== 2 || previous.touches.length !== 2) return;

    // Calculate angle between two touches for both events
    const currentAngle = this.calculateAngle(current.touches[0], current.touches[1]);
    const previousAngle = this.calculateAngle(previous.touches[0], previous.touches[1]);

    const angleDiff = currentAngle - previousAngle;
    const normalizedAngle = ((angleDiff + 180) % 360) - 180; // Normalize to -180 to 180

    if (Math.abs(normalizedAngle) > this.rotationThreshold) {
      const center = {
        x: (current.touches[0].clientX + current.touches[1].clientX) / 2,
        y: (current.touches[0].clientY + current.touches[1].clientY) / 2,
      };

      this.callbacks.onRotate?.(normalizedAngle, center);
      this.hapticFeedback('light');
    }
  }

  /**
   * Calculate angle between two touches
   */
  private calculateAngle(touch1: Touch, touch2: Touch): number {
    const deltaX = touch2.clientX - touch1.clientX;
    const deltaY = touch2.clientY - touch1.clientY;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }

  /**
   * Detect three-finger tap
   */
  private detectThreeFingerTap(event: TouchEvent): void {
    setTimeout(() => {
      // Check if all three fingers are still down (tap vs hold)
      if (event.touches.length === 3) {
        this.callbacks.onThreeFingerTap?.();
        this.hapticFeedback('heavy');
      }
    }, 100);
  }

  /**
   * Detect four-finger tap
   */
  private detectFourFingerTap(event: TouchEvent): void {
    setTimeout(() => {
      if (event.touches.length === 4) {
        this.callbacks.onFourFingerTap?.();
        this.hapticFeedback('heavy');
      }
    }, 100);
  }

  /**
   * Setup edge swipe detection
   */
  private setupEdgeSwipeDetection(): void {
    let startNearEdge: string | null = null;

    this.canvas.addEventListener('touchstart', event => {
      const touch = event.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      // Check which edge the touch started near
      if (x < this.edgeDetectionZone) {
        startNearEdge = 'left';
      } else if (x > rect.width - this.edgeDetectionZone) {
        startNearEdge = 'right';
      } else if (y < this.edgeDetectionZone) {
        startNearEdge = 'top';
      } else if (y > rect.height - this.edgeDetectionZone) {
        startNearEdge = 'bottom';
      } else {
        startNearEdge = null;
      }
    });

    this.canvas.addEventListener('touchend', event => {
      if (startNearEdge && event.changedTouches.length === 1) {
        const touch = event.changedTouches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Check if swipe moved significantly away from edge
        let movedAway = false;
        switch (startNearEdge) {
          case 'left':
            movedAway = x > this.edgeDetectionZone + this.swipeThreshold;
            break;
          case 'right':
            movedAway = x < rect.width - this.edgeDetectionZone - this.swipeThreshold;
            break;
          case 'top':
            movedAway = y > this.edgeDetectionZone + this.swipeThreshold;
            break;
          case 'bottom':
            movedAway = y < rect.height - this.edgeDetectionZone - this.swipeThreshold;
            break;
        }

        if (movedAway) {
          this.callbacks.onEdgeSwipe?.(startNearEdge as any);
          this.hapticFeedback('light');
        }
      }
      startNearEdge = null;
    });
  }

  /**
   * Handle force touch (3D Touch on iOS)
   */
  private handleForceTouch(event: any): void {
    const touch = event.touches[0];
    if (touch && touch.force > 0.5) {
      // Threshold for force touch
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      this.callbacks.onForceTouch?.(touch.force, x, y);
      this.hapticFeedback('heavy');
    }
  }

  /**
   * Provide haptic feedback
   */
  private hapticFeedback(type: 'light' | 'medium' | 'heavy'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: [30, 10, 30],
      };
      navigator.vibrate(patterns[type]);
    }

    // iOS Haptic Feedback (if available)
    if ('HapticFeedback' in window) {
      const haptic = (window as any).HapticFeedback;
      switch (type) {
        case 'light':
          haptic?.impact({ style: 'light' });
          break;
        case 'medium':
          haptic?.impact({ style: 'medium' });
          break;
        case 'heavy':
          haptic?.impact({ style: 'heavy' });
          break;
      }
    }
  }

  /**
   * Update gesture sensitivity
   */
  public updateSensitivity(options: {
    swipeThreshold?: number;
    velocityThreshold?: number;
    rotationThreshold?: number;
    edgeDetectionZone?: number;
  }): void {
    if (options.swipeThreshold !== undefined) {
      this.swipeThreshold = options.swipeThreshold;
    }
    if (options.velocityThreshold !== undefined) {
      this.velocityThreshold = options.velocityThreshold;
    }
    if (options.rotationThreshold !== undefined) {
      this.rotationThreshold = options.rotationThreshold;
    }
    if (options.edgeDetectionZone !== undefined) {
      this.edgeDetectionZone = options.edgeDetectionZone;
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    // Remove all event listeners
    // (In a real implementation, you'd store references to bound functions)
    this.touchHistory = [];
  }
}
