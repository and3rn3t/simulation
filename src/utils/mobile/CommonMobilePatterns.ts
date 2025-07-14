/**
 * Common Mobile Patterns
 * Reduces duplication in mobile-specific code
 */

export const CommonMobilePatterns = {
  /**
   * Standard mobile detection
   */
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Standard touch event handling setup
   */
  setupTouchEvents(
    element: Element,
    handlers: {
      onTouchStart?: (e: TouchEvent) => void;
      onTouchMove?: (e: TouchEvent) => void;
      onTouchEnd?: (e: TouchEvent) => void;
    }
  ): () => void {
    const cleanup: (() => void)[] = [];

    try {
      if (handlers.onTouchStart) {
        element?.addEventListener('touchstart', event => {
          try {
            handlers.onTouchStart!(event as TouchEvent);
          } catch (error) {
            console.error('Event listener error for touchstart:', error);
          }
        });
        cleanup.push(() => element?.removeEventListener('touchstart', handlers.onTouchStart!));
      }

      if (handlers.onTouchMove) {
        element?.addEventListener('touchmove', event => {
          try {
            handlers.onTouchMove!(event as TouchEvent);
          } catch (error) {
            console.error('Event listener error for touchmove:', error);
          }
        });
        cleanup.push(() => element?.removeEventListener('touchmove', handlers.onTouchMove!));
      }

      if (handlers.onTouchEnd) {
        element?.addEventListener('touchend', event => {
          try {
            handlers.onTouchEnd!(event as TouchEvent);
          } catch (error) {
            console.error('Event listener error for touchend:', error);
          }
        });
        cleanup.push(() => element?.removeEventListener('touchend', handlers.onTouchEnd!));
      }
    } catch (_error) {
      /* handled */
    }

    return () => cleanup.forEach(fn => fn());
  },

  /**
   * Standard mobile performance optimization
   */
  optimizeForMobile(element: HTMLElement): void {
    try {
      if (element.style) {
        element.style.touchAction = 'manipulation';
        element.style.userSelect = 'none';
        (element.style as any).webkitTouchCallout = 'none';
        (element.style as any).webkitUserSelect = 'none';
      }
    } catch (_error) {
      /* handled */
    }
  },
};
