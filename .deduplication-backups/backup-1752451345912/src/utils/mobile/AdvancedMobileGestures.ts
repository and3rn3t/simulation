import { isMobileDevice } from './MobileDetection';

export interface AdvancedGestureCallbacks {
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onRotate?: (angle: number, center: { x: number; y: number }) => void;
  onThreeFingerTap?: () => void;
  onFourFingerTap?: () => void;
  onEdgeSwipe?: (edge: 'left' | 'right' | 'top' | 'bottom') => void;
  onLongPress?: (position: { x: number; y: number }) => void;
  onForceTouch?: (force: number, position: { x: number; y: number }) => void;
}

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  force?: number;
}

/**
 * Advanced Mobile Gestures - Simplified implementation for handling complex touch interactions
 */
export class AdvancedMobileGestures {
  private canvas: HTMLCanvasElement;
  private callbacks: AdvancedGestureCallbacks;
  private touchHistory: TouchPoint[] = [];
  private isEnabled: boolean = false;
  private edgeDetectionZone: number = 50;
  private longPressTimer: number | null = null;
  private longPressDelay: number = 500;

  constructor(canvas: HTMLCanvasElement, callbacks: AdvancedGestureCallbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    if (isMobileDevice()) {
      this.isEnabled = true;
      this.setupEventListeners();
    }
  }

  /**
   * Check if advanced gestures are supported and enabled
   */
  public isAdvancedGesturesEnabled(): boolean {
    return this.isEnabled && isMobileDevice();
  }

  /**
   * Setup touch event listeners
   */
  private setupEventListeners(): void {
    // Basic touch events
    this.canvas.addEventListener(
      'touchstart',
      event => {
        this.handleTouchStart(event);
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchmove',
      event => {
        this.handleTouchMove(event);
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchend',
      event => {
        this.handleTouchEnd(event);
      },
      { passive: false }
    );

    // Force touch events (iOS)
    if ('ontouchforcechange' in window) {
      this.canvas.addEventListener('touchforcechange', event => {
        this.handleForceChange(event as TouchEvent);
      });
    }
  }

  /**
   * Handle touch start events
   */
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();

    // Record touch points
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const touchPoint: TouchPoint = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
        force: (touch as any).force || 0,
      };
      this.touchHistory.push(touchPoint);
    }

    // Detect multi-finger taps
    if (event.touches.length === 3) {
      this.detectThreeFingerTap();
    } else if (event.touches.length === 4) {
      this.detectFourFingerTap();
    }

    // Start long press detection for single touch
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.longPressTimer = window.setTimeout(() => {
        this.callbacks.onLongPress?.({
          x: touch.clientX,
          y: touch.clientY,
        });
      }, this.longPressDelay);
    }

    // Limit touch history size
    if (this.touchHistory.length > 10) {
      this.touchHistory = this.touchHistory.slice(-10);
    }
  }

  /**
   * Handle touch move events
   */
  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();

    // Cancel long press on movement
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Detect pinch/zoom for two fingers
    if (event.touches.length === 2) {
      this.detectPinchGesture(event);
    }

    // Detect rotation for two fingers
    if (event.touches.length === 2) {
      this.detectRotationGesture(event);
    }
  }

  /**
   * Handle touch end events
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();

    // Cancel long press
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Detect swipe gestures
    if (this.touchHistory.length >= 2) {
      this.detectSwipeGesture();
    }

    // Clear touch history when all touches end
    if (event.touches.length === 0) {
      this.touchHistory = [];
    }
  }

  /**
   * Handle force change events (3D Touch/Force Touch)
   */
  private handleForceChange(event: TouchEvent): void {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const force = (touch as any).force || 0;

      this.callbacks.onForceTouch?.(force, {
        x: touch.clientX,
        y: touch.clientY,
      });
    }
  }

  /**
   * Detect swipe gestures
   */
  private detectSwipeGesture(): void {
    if (this.touchHistory.length < 2) return;

    const start = this.touchHistory[0];
    const end = this.touchHistory[this.touchHistory.length - 1];

    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.timestamp - start.timestamp;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Minimum swipe distance and velocity thresholds
    if (distance < 50 || velocity < 0.1) return;

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
  }

  /**
   * Detect pinch/zoom gestures
   */
  private detectPinchGesture(event: TouchEvent): void {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;

    // For simplicity, we'll use a base distance and calculate scale relative to it
    const baseDistance = 100;
    const scale = distance / baseDistance;

    this.callbacks.onPinch?.(scale, { x: centerX, y: centerY });
  }

  /**
   * Detect rotation gestures
   */
  private detectRotationGesture(event: TouchEvent): void {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    const angle =
      Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) *
      (180 / Math.PI);

    const centerX = (touch1.clientX + touch2.clientX) / 2;
    const centerY = (touch1.clientY + touch2.clientY) / 2;

    this.callbacks.onRotate?.(angle, { x: centerX, y: centerY });
  }

  /**
   * Detect three-finger tap
   */
  private detectThreeFingerTap(): void {
    this.callbacks.onThreeFingerTap?.();
  }

  /**
   * Detect four-finger tap
   */
  private detectFourFingerTap(): void {
    this.callbacks.onFourFingerTap?.();
  }

  /**
   * Update gesture recognition settings
   */
  public updateSettings(
    settings: Partial<{
      edgeDetectionZone: number;
      longPressDelay: number;
      enabled: boolean;
    }>
  ): void {
    if (settings.edgeDetectionZone !== undefined) {
      this.edgeDetectionZone = settings.edgeDetectionZone;
    }
    if (settings.longPressDelay !== undefined) {
      this.longPressDelay = settings.longPressDelay;
    }
    if (settings.enabled !== undefined) {
      this.isEnabled = settings.enabled && isMobileDevice();
    }
  }

  /**
   * Update gesture callbacks
   */
  public updateCallbacks(callbacks: Partial<AdvancedGestureCallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Cleanup and dispose of resources
   */
  public dispose(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    this.touchHistory = [];
    this.isEnabled = false;
  }
}
