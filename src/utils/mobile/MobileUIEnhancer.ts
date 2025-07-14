class EventListenerManager {
  private static listeners: Array<{ element: EventTarget; event: string; handler: EventListener }> =
    [];

  static addListener(element: EventTarget, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  static cleanup(): void {
    this.listeners.forEach(({ element, event, handler }) => {
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
 * Mobile UI Enhancements - Adds mobile-specific UI improvements
 */

export class MobileUIEnhancer {
  private fullscreenButton?: HTMLButtonElement;
  private bottomSheet?: HTMLElement;
  private isBottomSheetVisible = false;

  constructor() {
    this.initializeMobileUI();
  }

  /**
   * Initialize mobile-specific UI enhancements
   */
  private initializeMobileUI(): void {
    this.addFullscreenButton();
    this.createBottomSheet();
    this.enhanceExistingControls();
    this.setupMobileMetaTags();
  }

  /**
   * Add fullscreen button for mobile
   */
  private addFullscreenButton(): void {
    if (!this.isMobile()) return;

    this.fullscreenButton = document.createElement('button');
    this.fullscreenButton.innerHTML = '⛶';
    this.fullscreenButton.title = 'Fullscreen';
    this.fullscreenButton.className = 'mobile-fullscreen-btn';

    // Add styles
    Object.assign(this.fullscreenButton.style, {
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      background: 'rgba(76, 175, 80, 0.9)',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      zIndex: '1000',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    this.fullscreenButton?.addEventListener('click', event => {
      try {
        this.toggleFullscreen();
      } catch (error) {
        console.error('Fullscreen toggle error:', error);
      }
    });
    document.body.appendChild(this.fullscreenButton);
  }

  /**
   * Create bottom sheet for mobile controls
   */
  private createBottomSheet(): void {
    if (!this.isMobile()) return;

    this.bottomSheet = document.createElement('div');
    this.bottomSheet.className = 'mobile-bottom-sheet';

    // Add styles
    Object.assign(this.bottomSheet.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'rgba(26, 26, 46, 0.95)',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      padding: '20px',
      transform: 'translateY(100%)',
      transition: 'transform 0.3s ease',
      zIndex: '999',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.3)',
    });

    // Add handle
    const handle = document.createElement('div');
    Object.assign(handle.style, {
      width: '40px',
      height: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '2px',
      margin: '0 auto 15px auto',
      cursor: 'pointer',
    });

    handle?.addEventListener('click', event => {
      try {
        this.toggleBottomSheet();
      } catch (error) {
        console.error('Bottom sheet toggle error:', error);
      }
    });
    this.bottomSheet.appendChild(handle);

    // Add controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'mobile-controls-container';

    // Move existing controls to bottom sheet
    this.moveControlsToBottomSheet(controlsContainer);

    this.bottomSheet.appendChild(controlsContainer);
    document.body.appendChild(this.bottomSheet);

    // Add tap area to show bottom sheet
    this.addBottomSheetTrigger();
  }

  /**
   * Move existing controls to bottom sheet
   */
  private moveControlsToBottomSheet(container: HTMLElement): void {
    const existingControls = document?.querySelector('.controls');
    if (!existingControls) return;

    // Clone controls for mobile
    const mobileControls = existingControls.cloneNode(true) as HTMLElement;
    mobileControls.className = 'mobile-controls';

    // Enhance for mobile
    Object.assign(mobileControls.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '15px',
      background: 'none',
      padding: '0',
      backdropFilter: 'none',
    });

    // Enhance all buttons and inputs
    const buttons = mobileControls.querySelectorAll('button');
    buttons.forEach(button => {
      try {
        Object.assign(button.style, {
          minHeight: '48px',
          fontSize: '16px',
          borderRadius: '12px',
          padding: '12px',
        });
      } catch (error) {
        console.error('Button style error:', error);
      }
    });

    const inputs = mobileControls.querySelectorAll('input, select');
    inputs.forEach(input => {
      try {
        Object.assign((input as HTMLElement).style, {
          minHeight: '48px',
          fontSize: '16px',
          borderRadius: '8px',
        });
      } catch (error) {
        console.error('Input style error:', error);
      }
    });

    container.appendChild(mobileControls);

    // Hide original controls on mobile
    if (this.isMobile()) {
      (existingControls as HTMLElement).style.display = 'none';
    }
  }

  /**
   * Add bottom sheet trigger area
   */
  private addBottomSheetTrigger(): void {
    const trigger = document.createElement('div');
    Object.assign(trigger.style, {
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '30px',
      zIndex: '998',
      cursor: 'pointer',
    });

    trigger?.addEventListener('click', event => {
      try {
        this.toggleBottomSheet();
      } catch (error) {
        console.error('Bottom sheet trigger error:', error);
      }
    });
    document.body.appendChild(trigger);
  }

  /**
   * Enhance existing controls for mobile
   */
  private enhanceExistingControls(): void {
    try {
      if (!this.isMobile()) return;

      // Add mobile-specific CSS class to body
      document.body.classList.add('mobile-optimized');

      // Prevent zoom on input focus
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        try {
          (input as HTMLElement).style.fontSize = '16px';
        } catch (error) {
          console.error('Input font size error:', error);
        }
      });

      // Add touch feedback to all buttons
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        button?.addEventListener('touchstart', event => {
          try {
            button.style.transform = 'scale(0.95)';
          } catch (error) {
            console.error('Touch start error:', error);
          }
        });

        button?.addEventListener('touchend', event => {
          try {
            button.style.transform = 'scale(1)';
          } catch (error) {
            console.error('Touch end error:', error);
          }
        });
      });
    } catch (error) {
      console.error('Enhance existing controls error:', error);
    }
  }

  /**
   * Setup mobile meta tags
   */
  private setupMobileMetaTags(): void {
    // Ensure proper viewport
    let viewportMeta = document?.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.content =
      'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, viewport-fit=cover';

    // Add mobile web app capabilities
    const mobileCapable = document.createElement('meta');
    mobileCapable.name = 'mobile-web-app-capable';
    mobileCapable.content = 'yes';
    document.head.appendChild(mobileCapable);

    // Add status bar style for iOS
    const statusBarStyle = document.createElement('meta');
    statusBarStyle.name = 'apple-mobile-web-app-status-bar-style';
    statusBarStyle.content = 'black-translucent';
    document.head.appendChild(statusBarStyle);
  }

  /**
   * Toggle fullscreen mode
   */
  private async toggleFullscreen(): Promise<void> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if (this.fullscreenButton) {
          this.fullscreenButton.innerHTML = '⤠';
        }
      } else {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.error('Exit fullscreen error:', error);
        }
        if (this.fullscreenButton) {
          this.fullscreenButton.innerHTML = '⛶';
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
    }
  }

  /**
   * Toggle bottom sheet visibility
   */
  private toggleBottomSheet(): void {
    if (!this.bottomSheet) return;

    this.isBottomSheetVisible = !this.isBottomSheetVisible;

    if (this.isBottomSheetVisible) {
      this.bottomSheet.style.transform = 'translateY(0)';
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } else {
      this.bottomSheet.style.transform = 'translateY(100%)';
    }
  }

  /**
   * Check if device is mobile
   */
  private isMobile(): boolean {
    return isMobileDevice() || window.innerWidth < 768;
  }

  /**
   * Show bottom sheet
   */
  public showBottomSheet(): void {
    if (this.bottomSheet && !this.isBottomSheetVisible) {
      this.toggleBottomSheet();
    }
  }

  /**
   * Hide bottom sheet
   */
  public hideBottomSheet(): void {
    if (this.bottomSheet && this.isBottomSheetVisible) {
      this.toggleBottomSheet();
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.fullscreenButton) {
      this.fullscreenButton.remove();
    }
    if (this.bottomSheet) {
      this.bottomSheet.remove();
    }
    document.body.classList.remove('mobile-optimized');
  }
}
