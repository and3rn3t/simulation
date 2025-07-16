import { isMobileDevice } from './MobileDetection';

export interface PWAConfig {
  enableNotifications?: boolean;
  enableOfflineMode?: boolean;
  enableAutoUpdate?: boolean;
  updateCheckInterval?: number;
}

export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Mobile PWA Manager - Simplified implementation for Progressive Web App features
 */
export class MobilePWAManager {
  private config: PWAConfig;
  private installPrompt: InstallPromptEvent | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isInstalled: boolean = false;
  private isEnabled: boolean = false;

  constructor(config: PWAConfig = {}) {
    this.config = {
      enableNotifications: false,
      enableOfflineMode: true,
      enableAutoUpdate: true,
      updateCheckInterval: 60000, // 1 minute
      ...config,
    };

    this.isEnabled = isMobileDevice() && 'serviceWorker' in navigator;

    if (this.isEnabled) {
      this.init();
    }
  }

  /**
   * Initialize PWA features
   */
  private async init(): Promise<void> {
    this.checkInstallation();
    this.setupInstallPrompt();
    await this.registerServiceWorker();
    this.setupEventListeners();
  }

  /**
   * Check if app is installed
   */
  private checkInstallation(): void {
    // Check if running in standalone mode (installed)
    this.isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', event => {
      // Prevent the default install prompt
      event.preventDefault();
      this.installPrompt = event as InstallPromptEvent;

      // Show custom install UI if not already installed
      if (!this.isInstalled) {
        this.showInstallButton();
      }
    });

    // Handle app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.hideInstallButton();
      this.showInstallSuccessMessage();
    });
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');

      // Handle service worker updates
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        const newWorker = this.serviceWorkerRegistration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.showUpdatePrompt();
            }
          });
        }
      });

      // Auto-check for updates
      if (this.config.enableAutoUpdate) {
        setInterval(() => {
          this.serviceWorkerRegistration?.update();
        }, this.config.updateCheckInterval);
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.showConnectionStatus('online');
    });

    window.addEventListener('offline', () => {
      this.showConnectionStatus('offline');
    });

    // Handle visibility changes for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration.update();
      }
    });
  }

  /**
   * Show install button
   */
  private showInstallButton(): void {
    let installButton = document.getElementById('pwa-install-button');

    if (!installButton) {
      installButton = document.createElement('button');
      installButton.id = 'pwa-install-button';
      installButton.innerHTML = '📱 Install App';
      installButton.title = 'Install as app';

      installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 25px;
        padding: 10px 20px;
        font-size: 14px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 5px;
      `;

      document.body.appendChild(installButton);
    }

    installButton.addEventListener('click', () => {
      this.promptInstall();
    });
  }

  /**
   * Hide install button
   */
  private hideInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  }

  /**
   * Prompt user to install the app
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        this.installPrompt = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Show update prompt
   */
  private showUpdatePrompt(): void {
    const updatePrompt = document.createElement('div');
    updatePrompt.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #2196F3;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    updatePrompt.innerHTML = `
      <div>New version available!</div>
      <button onclick="window.location.reload()" 
              style="background: white; color: #2196F3; border: none; padding: 5px 10px; border-radius: 3px; margin-left: 10px; cursor: pointer;">
        Update
      </button>
      <button onclick="this.parentElement.remove()" 
              style="background: transparent; color: white; border: 1px solid white; padding: 5px 10px; border-radius: 3px; margin-left: 5px; cursor: pointer;">
        Later
      </button>
    `;

    document.body.appendChild(updatePrompt);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (updatePrompt.parentNode) {
        updatePrompt.remove();
      }
    }, 10000);
  }

  /**
   * Show connection status
   */
  private showConnectionStatus(status: 'online' | 'offline'): void {
    const statusIndicator = document.createElement('div');
    statusIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${status === 'online' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;

    statusIndicator.textContent =
      status === 'online' ? '🌐 Back online' : '📡 Offline - Some features may be limited';

    document.body.appendChild(statusIndicator);

    setTimeout(() => {
      statusIndicator.remove();
    }, 3000);
  }

  /**
   * Show install success message
   */
  private showInstallSuccessMessage(): void {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    successMessage.textContent = '✅ App installed successfully!';
    document.body.appendChild(successMessage);

    setTimeout(() => {
      successMessage.remove();
    }, 3000);
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (!this.config.enableNotifications || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Send notification
   */
  public sendNotification(title: string, options: NotificationOptions = {}): void {
    if (!this.config.enableNotifications || Notification.permission !== 'granted') {
      return;
    }

    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });
  }

  /**
   * Check if app can be installed
   */
  public canInstall(): boolean {
    return !!this.installPrompt && !this.isInstalled;
  }

  /**
   * Check if app is installed
   */
  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  /**
   * Get PWA status
   */
  public getStatus(): {
    isEnabled: boolean;
    isInstalled: boolean;
    canInstall: boolean;
    isOnline: boolean;
    hasServiceWorker: boolean;
  } {
    return {
      isEnabled: this.isEnabled,
      isInstalled: this.isInstalled,
      canInstall: this.canInstall(),
      isOnline: navigator.onLine,
      hasServiceWorker: !!this.serviceWorkerRegistration,
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<PWAConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup and dispose of resources
   */
  public dispose(): void {
    this.hideInstallButton();
    this.isEnabled = false;
  }
}
