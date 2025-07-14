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
  setupTouchEvents(element: Element, handlers: {
    onTouchStart?: (e: TouchEvent) => void;
    onTouchMove?: (e: TouchEvent) => void;
    onTouchEnd?: (e: TouchEvent) => void;
  }): () => void {
    const cleanup: (() => void)[] = [];
    
    try {
      ifPattern(handlers.onTouchStart, () => { eventPattern(element?.addEventListener('touchstart', (event) => {
  try {
    (handlers.onTouchStart)(event);
  } catch (error) {
    console.error('Event listener error for touchstart:', error);
  }
}));
        cleanup.push(() => element?.removeEventListener('touchstart', handlers.onTouchStart!));
       });
      
      ifPattern(handlers.onTouchMove, () => { eventPattern(element?.addEventListener('touchmove', (event) => {
  try {
    (handlers.onTouchMove)(event);
  } catch (error) {
    console.error('Event listener error for touchmove:', error);
  }
}));
        cleanup.push(() => element?.removeEventListener('touchmove', handlers.onTouchMove!));
       });
      
      ifPattern(handlers.onTouchEnd, () => { eventPattern(element?.addEventListener('touchend', (event) => {
  try {
    (handlers.onTouchEnd)(event);
  } catch (error) {
    console.error('Event listener error for touchend:', error);
  }
}));
        cleanup.push(() => element?.removeEventListener('touchend', handlers.onTouchEnd!));
       });
    } catch (error) { /* handled */ }
    
    return () => cleanup.forEach(fn => fn());
  },

  /**
   * Standard mobile performance optimization
   */
  optimizeForMobile(element: HTMLElement): void {
    try {
      element?.style.touchAction = 'manipulation';
      element?.style.userSelect = 'none';
      element?.style.webkitTouchCallout = 'none';
      element?.style.webkitUserSelect = 'none';
    } catch (error) { /* handled */ }
  }
};
