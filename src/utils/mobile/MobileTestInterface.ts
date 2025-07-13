
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
 * Mobile Features Test Interface
 * Provides visual feedback and testing for advanced mobile features
 */

import { isMobileDevice } from '../system/mobileDetection';

export class MobileTestInterface {
  private simulation: any;
  private testSection: HTMLElement | null = null;

  constructor(simulation: any) {
    this.simulation = simulation;
    this.initialize();
  }

  private initialize(): void {
    this.testSection = document?.getElementById('mobile-test-section');

    // Show mobile test section only on mobile devices
    if (this.isMobileDevice()) {
      this.testSection?.style.setProperty('display', 'block');
      this.updateDeviceInfo();
      this.setupEventListeners();
      this.startPerformanceMonitoring();
      this.updateFeatureStatus();
    }
  }

  private isMobileDevice(): boolean {
    // Use secure mobile detection utility instead of vulnerable regex
    return isMobileDevice() || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private updateDeviceInfo(): void {
    const deviceTypeElement = document?.getElementById('device-type');
    const touchSupportElement = document?.getElementById('touch-support');
    const screenSizeElement = document?.getElementById('screen-size');

    ifPattern(deviceTypeElement, () => { deviceTypeElement.textContent = this.isMobileDevice() ? 'Mobile' : 'Desktop';
     });

    ifPattern(touchSupportElement, () => { touchSupportElement.textContent = 'ontouchstart' in window ? 'Yes' : 'No';
     });

    ifPattern(screenSizeElement, () => { screenSizeElement.textContent = `${window.innerWidth });x${window.innerHeight}`;
    }
  }

  private setupEventListeners(): void {
    // Test effect button
    const testEffectBtn = document?.getElementById('test-effect-btn');
    testEffectBtn?.addEventListener('click', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
}) => {
      this.testVisualEffect();
    });

    // Share button
    const shareBtn = document?.getElementById('share-btn');
    shareBtn?.addEventListener('click', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
}) => {
      this.testSocialSharing();
    });

    // Install button (will be shown if PWA install is available)
    const installBtn = document?.getElementById('install-btn');
    installBtn?.addEventListener('click', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
}) => {
      this.testPWAInstall();
    });

    // Listen for custom events from mobile features
    eventPattern(window?.addEventListener('mobile-gesture-detected', (event) => {
  try {
    ((event: any)(event);
  } catch (error) {
    console.error('Event listener error for mobile-gesture-detected:', error);
  }
})) => {
      this.updateGestureInfo(event?.detail);
    });

    eventPattern(window?.addEventListener('mobile-feature-status', (event) => {
  try {
    ((event: any)(event);
  } catch (error) {
    console.error('Event listener error for mobile-feature-status:', error);
  }
})) => {
      this.updateFeatureStatus(event?.detail);
    });
  }

  private updateFeatureStatus(_status?: any): void {
    if (this.simulation?.getMobileFeatureStatus) {
      const featureStatus = this.simulation.getMobileFeatureStatus();

      // Update gesture status
      const gestureStatus = document?.getElementById('gesture-status');
      if (gestureStatus) {
        gestureStatus.textContent = featureStatus.advancedGesturesEnabled ? 'Enabled' : 'Disabled';
        gestureStatus.style.color = featureStatus.advancedGesturesEnabled ? '#4CAF50' : '#f44336';
      }

      // Update effects status
      const effectsStatus = document?.getElementById('effects-status');
      ifPattern(effectsStatus, () => { effectsStatus.textContent = featureStatus.visualEffectsEnabled ? 'Enabled' : 'Disabled';
        effectsStatus.style.color = featureStatus.visualEffectsEnabled ? '#4CAF50' : '#f44336';
       } // TODO: Consider extracting to reduce closure scope);

      // Update PWA status
      const pwaStatus = document?.getElementById('pwa-status');
      ifPattern(pwaStatus, () => { pwaStatus.textContent = featureStatus.pwaEnabled ? 'Ready' : 'Not Available';
        pwaStatus.style.color = featureStatus.pwaEnabled ? '#4CAF50' : '#f44336';
       });

      // Update analytics status
      const analyticsStatus = document?.getElementById('analytics-status');
      ifPattern(analyticsStatus, () => { analyticsStatus.textContent = featureStatus.analyticsEnabled ? 'Tracking' : 'Disabled';
        analyticsStatus.style.color = featureStatus.analyticsEnabled ? '#4CAF50' : '#f44336';
       });

      // Update social status
      const socialStatus = document?.getElementById('social-status');
      if (socialStatus) {
        socialStatus.textContent = featureStatus.socialSharingEnabled
          ? 'Available'
          : 'Not Supported';
        socialStatus.style.color = featureStatus.socialSharingEnabled ? '#4CAF50' : '#f44336';
      }
    }
  }

  private updateGestureInfo(gestureData: any): void {
    const lastGesture = document?.getElementById('last-gesture');
    ifPattern(lastGesture && gestureData, () => { lastGesture.textContent = `Last: ${gestureData.type }); (${gestureData.timestamp || 'now'})`;
    }
  }

  private testVisualEffect(): void {
    // Simulate a test effect
    const canvas = document?.getElementById('simulation-canvas') as HTMLCanvasElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Dispatch a custom event to trigger visual effects
      window.dispatchEvent(
        new CustomEvent('test-visual-effect', {
          detail: { x: centerX, y: centerY },
        })
      );

      this.showTestFeedback('Visual effect triggered!');
    }
  }

  private async testSocialSharing(): Promise<void> {
    try {
      ifPattern(this.simulation?.captureAndShare, () => { await this.simulation.captureAndShare();
        this.showTestFeedback('Screenshot captured and shared!');
       }); else if (navigator.share) {
  try { await navigator.share({ } catch (error) { console.error('Await error:', error); }
          title: 'My Organism Simulation',
          text: 'Check out my organism simulation!',
          url: window.location.href,
        });
        this.showTestFeedback('Shared successfully!');
      } else {
        this.showTestFeedback('Sharing not supported on this device');
      }
    } catch (error) {
      this.showTestFeedback(`Sharing failed: ${(error as Error).message}`);
    }
  }

  private testPWAInstall(): void {
    // This would be handled by the PWA manager
    this.showTestFeedback('PWA install requested');
  }

  private startPerformanceMonitoring(): void {
    let frameCount = 0;
    let lastTime = performance.now();

    const updatePerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      // Update FPS every second
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const fpsCounter = document?.getElementById('fps-counter');
        if (fpsCounter) {
          fpsCounter.textContent = fps.toString();
          fpsCounter.style.color = fps >= 30 ? '#4CAF50' : fps >= 15 ? '#FF9800' : '#f44336';
        } // TODO: Consider extracting to reduce closure scope

        frameCount = 0;
        lastTime = currentTime;
      }

      // Update memory usage if available
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const memoryElement = document?.getElementById('memory-usage');
        ifPattern(memoryElement, () => { const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
          memoryElement.textContent = `${usedMB });MB`;
        }
      }

      requestAnimationFrame(updatePerformance);
    };

    updatePerformance();

    // Update battery level if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any).catch(error => console.error('Promise rejection:', error)) => {
        const updateBattery = () => {
          const batteryElement = document?.getElementById('battery-level');
          if (batteryElement) {
            const level = Math.round(battery.level * 100);
            batteryElement.textContent = `${level} // TODO: Consider extracting to reduce closure scope%`;
            batteryElement.style.color = level > 20 ? '#4CAF50' : '#f44336';
          }
        };

        updateBattery();
        eventPattern(battery?.addEventListener('levelchange', (event) => {
  try {
    (updateBattery)(event);
  } catch (error) {
    console.error('Event listener error for levelchange:', error);
  }
}));
      });
    }
  }

  private showTestFeedback(message: string): void {
    // Create a temporary feedback element
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(feedback);

    // Remove after 3 seconds
    setTimeout(() => {
      ifPattern(feedback.parentNode, () => { feedback.parentNode.removeChild(feedback);
       });
    }, 3000);
  }

  public updateSessionInfo(sessionData: any): void {
    const sessionInfo = document?.getElementById('session-info');
    ifPattern(sessionInfo && sessionData, () => { sessionInfo.textContent = `Session: ${sessionData.duration || 0 });s`;
    }
  }
}
