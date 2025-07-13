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
        element.addEventListener('touchstart', handlers.onTouchStart);
        cleanup.push(() => element.removeEventListener('touchstart', handlers.onTouchStart!));
      }

      if (handlers.onTouchMove) {
        element.addEventListener('touchmove', handlers.onTouchMove);
        cleanup.push(() => element.removeEventListener('touchmove', handlers.onTouchMove!));
      }

      if (handlers.onTouchEnd) {
        element.addEventListener('touchend', handlers.onTouchEnd);
        cleanup.push(() => element.removeEventListener('touchend', handlers.onTouchEnd!));
      }
    } catch (error) {
      /* handled */
    }

    return () => cleanup.forEach(fn => fn());
  },

  /**
   * Standard mobile performance optimization
   */
  optimizeForMobile(element: HTMLElement): void {
    try {
      element.style.touchAction = 'manipulation';
      element.style.userSelect = 'none';
      (element.style as any).webkitTouchCallout = 'none';
      (element.style as any).webkitUserSelect = 'none';
    } catch (error) {
      /* handled */
    }
  },
};
