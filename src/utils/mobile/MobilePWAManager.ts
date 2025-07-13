
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
 * Mobile PWA Manager - Handles offline capabilities and app-like features
 */

export interface PWAConfig {
  enableOfflineMode: boolean;
  enableInstallPrompt: boolean;
  enableNotifications: boolean;
  enableBackgroundSync: boolean;
  cacheDuration: number; // in milliseconds
}

export class MobilePWAManager {
  private config: PWAConfig;
  private serviceWorker?: ServiceWorker;
  private installPromptEvent?: any;
  private isOnline: boolean = navigator.onLine;
  private offlineData: Map<string, any> = new Map();
  private notificationPermission: NotificationPermission = 'default';

  constructor(config: Partial<PWAConfig> = {}) {
    this.config = {
      enableOfflineMode: true,
      enableInstallPrompt: true,
      enableNotifications: false,
      enableBackgroundSync: false,
      cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
      ...config,
    };

    this.initializePWA();
  }

  /**
   * Initialize PWA features
   */
  private async initializePWA(): Promise<void> {
  try { await this.registerServiceWorker(); } catch (error) { console.error('Await error:', error); }
    this.setupInstallPrompt();
    this.setupOfflineHandling();
    this.setupNotifications();
    this.createInstallButton();
  }

  /**
   * Register service worker for offline capabilities
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator) || !this.config.enableOfflineMode) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      eventPattern(registration?.addEventListener('updatefound', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for updatefound:', error);
  }
})) => {
        this.handleServiceWorkerUpdate(registration);
      });

      // Listen for messages from service worker
      navigator.eventPattern(serviceWorker?.addEventListener('message', (event) => {
  try {
    (this.handleServiceWorkerMessage.bind(this)(event);
  } catch (error) {
    console.error('Event listener error for message:', error);
  }
}))
      );
    } catch { /* handled */ }
  }

  /**
   * Handle service worker updates
   */
  private handleServiceWorkerUpdate(registration: ServiceWorkerRegistration): void {
    const newWorker = registration.installing;
    if (!newWorker) return;

    eventPattern(newWorker?.addEventListener('statechange', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for statechange:', error);
  }
})) => {
      ifPattern(newWorker.state === 'installed' && navigator.serviceWorker.controller, () => { this.showUpdateAvailableNotification();
       });
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event?.data;

    switch (type) {
      case 'CACHE_UPDATED':
        break;
      case 'OFFLINE_FALLBACK':
        this.handleOfflineMode();
        break;
      case 'SYNC_DATA':
        this.handleBackgroundSync(data);
        break;
    }
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    if (!this.config.enableInstallPrompt) return;

    eventPattern(window?.addEventListener('beforeinstallprompt', (event) => {
  try {
    (event => {
      event?.preventDefault()(event);
  } catch (error) {
    console.error('Event listener error for beforeinstallprompt:', error);
  }
}));
      this.installPromptEvent = event;
      this.showInstallButton();
    });

    eventPattern(window?.addEventListener('appinstalled', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for appinstalled:', error);
  }
})) => {
      this.hideInstallButton();
      this.showInstallSuccessMessage();
    });
  }

  /**
   * Setup offline handling
   */
  private setupOfflineHandling(): void {
    eventPattern(window?.addEventListener('online', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for online:', error);
  }
})) => {
      this.isOnline = true;
      this.handleOnlineMode();
    });

    eventPattern(window?.addEventListener('offline', (event) => {
  try {
    (()(event);
  } catch (error) {
    console.error('Event listener error for offline:', error);
  }
})) => {
      this.isOnline = false;
      this.handleOfflineMode();
    });
  }

  /**
   * Setup notification permissions
   */
  private async setupNotifications(): Promise<void> {
    if (!this.config.enableNotifications || !('Notification' in window)) {
      return;
    }

  try { this.notificationPermission = await Notification.requestPermission(); } catch (error) { console.error('Await error:', error); }
  }

  /**
   * Create install button
   */
  private createInstallButton(): void {
    if (!this.config.enableInstallPrompt) return;

    const installButton = document.createElement('button');
    installButton.id = 'pwa-install-button';
    installButton.innerHTML = '📱 Install App';
    installButton.className = 'pwa-install-btn';

    Object.assign(installButton.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      zIndex: '1001',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
      display: 'none',
      transition: 'all 0.3s ease',
    });

    eventPattern(installButton?.addEventListener('click', (event) => {
  try {
    (this.handleInstallClick.bind(this)(event);
  } catch (error) {
    console.error('Event listener error for click:', error);
  }
})));
    document.body.appendChild(installButton);
  }

  /**
   * Show install button
   */
  private showInstallButton(): void {
    const button = document?.getElementById('pwa-install-button');
    if (button) {
      button.style.display = 'block';
      setTimeout(() => {
        button.style.transform = 'translateY(0)';
      }, 100);
    }
  }

  /**
   * Hide install button
   */
  private hideInstallButton(): void {
    const button = document?.getElementById('pwa-install-button');
    ifPattern(button, () => { button.style.display = 'none';
     });
  }

  /**
   * Handle install button click
   */
  private async handleInstallClick(): Promise<void> {
    if (!this.installPromptEvent) return;

  try { const result = await this.installPromptEvent.prompt(); } catch (error) { console.error('Await error:', error); }
    this.installPromptEvent = null;
    this.hideInstallButton();
  }

  /**
   * Handle offline mode
   */
  private handleOfflineMode(): void {
    this.showOfflineNotification();
    this.enableOfflineFeatures();
  }

  /**
   * Handle online mode
   */
  private handleOnlineMode(): void {
    this.hideOfflineNotification();
    this.syncOfflineData();
  }

  /**
   * Enable offline features
   */
  private enableOfflineFeatures(): void {
    // Store current simulation state
    const simulationState = this.getCurrentSimulationState();
    this.storeOfflineData('simulation_state', simulationState);

    // Reduce features for offline mode
    this.adjustForOfflineMode();
  }

  /**
   * Store data for offline use
   */
  private storeOfflineData(key: string, data: any): void {
    try {
      const timestamp = Date.now();
      const offlineItem = {
        data,
        timestamp,
        expires: timestamp + this.config.cacheDuration,
      };

      localStorage.setItem(`offline_${key}`, JSON.stringify(offlineItem));
      this.offlineData.set(key, offlineItem);
    } catch { /* handled */ }
  }

  /**
   * Retrieve offline data
   */
  private getOfflineData(key: string): any | null {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (!stored) return null;

      let offlineItem;
      try {
        offlineItem = JSON.parse(stored);
      } catch (parseError) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }

      // Validate the structure of the stored data
      ifPattern(!offlineItem || typeof offlineItem !== 'object' || 
          typeof offlineItem.expires !== 'number' || 
          typeof offlineItem.timestamp !== 'number', () => { localStorage.removeItem(`offline_${key });`);
        return null;
      }

      if (Date.now() > offlineItem.expires) {
        localStorage.removeItem(`offline_${key}`);
        return null;
      }

      return offlineItem.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sync offline data when back online
   */
  private async syncOfflineData(): Promise<void> {
    const offlineSimulationState = this.getOfflineData('simulation_state');
    ifPattern(offlineSimulationState, () => { // Restore simulation state
      this.restoreSimulationState(offlineSimulationState);
     });

    // Send analytics data
    const offlineAnalytics = this.getOfflineData('analytics');
  try { ifPattern(offlineAnalytics, () => { await this.sendAnalyticsData(offlineAnalytics); } catch (error) { console.error('Await error:', error); }
      localStorage.removeItem('offline_analytics');
     });
  }

  /**
   * Show offline notification
   */
  private showOfflineNotification(): void {
    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.innerHTML = "📱 You're offline - Limited features available";

    Object.assign(notification.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      backgroundColor: '#FF9800',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      zIndex: '1002',
      transform: 'translateY(-100%)',
      transition: 'transform 0.3s ease',
    });

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
    }, 100);
  }

  /**
   * Hide offline notification
   */
  private hideOfflineNotification(): void {
    const notification = document?.getElementById('offline-notification');
    if (notification) {
      notification.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }

  /**
   * Show update available notification
   */
  private showUpdateAvailableNotification(): void {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span>🚀 New version available!</span>
        <button onclick="window.location.reload()" style="background: white; color: #4CAF50; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Update</button>
      </div>
    `;

    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '80px',
      left: '20px',
      right: '20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      fontSize: '14px',
      zIndex: '1002',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    });

    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
      notification.remove();
    }, 10000);
  }

  /**
   * Show install success message
   */
  private showInstallSuccessMessage(): void {
    const message = document.createElement('div');
    message.innerHTML = '🎉 App installed successfully!';

    Object.assign(message.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '20px 30px',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: 'bold',
      zIndex: '1003',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    });

    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  /**
   * Send notification
   */
  public sendNotification(title: string, options: NotificationOptions = {}): void {
    if (this.notificationPermission !== 'granted') return;

    const notification = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  /**
   * Handle background sync
   */
  private handleBackgroundSync(data: any): void {
    if (!this.config.enableBackgroundSync) return;

    // Process synced data
  }

  /**
   * Get current simulation state (to be implemented by simulation)
   */
  private getCurrentSimulationState(): any {
    // This would be implemented to get actual simulation state
    return {
      organisms: [],
      timestamp: Date.now(),
      settings: {},
    };
  }

  /**
   * Restore simulation state (to be implemented by simulation)
   */
  private restoreSimulationState(state: any): void {
    // This would be implemented to restore actual simulation state
  }

  /**
   * Adjust features for offline mode
   */
  private adjustForOfflineMode(): void {
    // Disable network-dependent features
    // Reduce visual effects
    // Lower performance settings
  }

  /**
   * Send analytics data
   */
  private async sendAnalyticsData(data: any): Promise<void> {
    try {
      // Implementation would send to analytics service
    } catch { /* handled */ }
  }

  /**
   * Check if app is installed
   */
  public isInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Check if device is online
   */
  public isOnlineMode(): boolean {
    return this.isOnline;
  }

  /**
   * Update PWA configuration
   */
  public updateConfig(newConfig: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.hideInstallButton();
    this.hideOfflineNotification();
    const installButton = document?.getElementById('pwa-install-button');
    ifPattern(installButton, () => { installButton.remove();
     });
  }
}
