import { isMobileDevice } from './MobileDetection';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareImageOptions {
  filename?: string;
  format?: 'image/png' | 'image/jpeg';
  quality?: number;
}

/**
 * Mobile Social Manager - Simplified implementation for mobile social sharing features
 */
export class MobileSocialManager {
  private canvas: HTMLCanvasElement;
  private isSupported: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.isSupported = this.checkShareSupport();
    this.init();
  }

  /**
   * Check if native sharing is supported
   */
  private checkShareSupport(): boolean {
    return isMobileDevice() && 'share' in navigator;
  }

  /**
   * Initialize the social manager
   */
  private init(): void {
    if (!this.isSupported) {
      console.log('Native sharing not supported on this device');
      return;
    }

    this.setupShareUI();
  }

  /**
   * Setup share UI elements
   */
  private setupShareUI(): void {
    // Create share button if it doesn't exist
    let shareButton = document.getElementById('mobile-share-button');
    if (!shareButton) {
      shareButton = document.createElement('button');
      shareButton.id = 'mobile-share-button';
      shareButton.innerHTML = '📤';
      shareButton.title = 'Share';

      // Style the button
      shareButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #007AFF;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `;

      document.body.appendChild(shareButton);
    }

    // Add click handler
    shareButton.addEventListener('click', () => {
      this.handleShareClick();
    });
  }

  /**
   * Handle share button click
   */
  private async handleShareClick(): Promise<void> {
    try {
      await this.shareCurrentState();
    } catch (error) {
      console.error('Share failed:', error);
      this.showFallbackShare();
    }
  }

  /**
   * Share current simulation state
   */
  public async shareCurrentState(): Promise<boolean> {
    if (!this.isSupported) {
      this.showFallbackShare();
      return false;
    }

    try {
      const shareData: ShareData = {
        title: 'Evolution Simulator',
        text: 'Check out this evolution simulation!',
        url: window.location.href,
      };

      await navigator.share(shareData);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
      return false;
    }
  }

  /**
   * Share text content
   */
  public async shareText(content: string): Promise<boolean> {
    if (!this.isSupported) {
      this.copyToClipboard(content);
      return false;
    }

    try {
      await navigator.share({ text: content });
      return true;
    } catch (_error) {
      this.copyToClipboard(content);
      return false;
    }
  }

  /**
   * Capture and share screenshot
   */
  public async captureAndShare(options: ShareImageOptions = {}): Promise<boolean> {
    try {
      const dataUrl = this.canvas.toDataURL(options.format || 'image/png', options.quality || 0.8);

      if (this.isSupported && 'canShare' in navigator) {
        // Convert data URL to File for sharing
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], options.filename || 'simulation.png', { type: blob.type });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Evolution Simulation Screenshot',
          });
          return true;
        }
      }

      // Fallback: open in new tab
      this.openImageInNewTab(dataUrl);
      return false;
    } catch (error) {
      console.error('Capture and share failed:', error);
      return false;
    }
  }

  /**
   * Capture screenshot as data URL
   */
  public captureScreenshot(
    format: 'image/png' | 'image/jpeg' = 'image/png',
    quality: number = 0.8
  ): string {
    return this.canvas.toDataURL(format, quality);
  }

  /**
   * Copy text to clipboard
   */
  private async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showNotification('Copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showNotification('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  }

  /**
   * Open image in new tab as fallback
   */
  private openImageInNewTab(dataUrl: string): void {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <html>
          <head><title>Simulation Screenshot</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
            <img src="${dataUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="Simulation Screenshot">
          </body>
        </html>
      `);
    }
  }

  /**
   * Show fallback share options
   */
  private showFallbackShare(): void {
    const url = window.location.href;
    const title = 'Evolution Simulator';

    // Create a simple share modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; max-width: 300px;">
        <h3>Share Simulation</h3>
        <button onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}', '_blank')" 
                style="display: block; width: 100%; margin: 5px 0; padding: 10px; background: #1DA1F2; color: white; border: none; border-radius: 5px;">
          Share on Twitter
        </button>
        <button onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}', '_blank')" 
                style="display: block; width: 100%; margin: 5px 0; padding: 10px; background: #4267B2; color: white; border: none; border-radius: 5px;">
          Share on Facebook
        </button>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="display: block; width: 100%; margin: 5px 0; padding: 10px; background: #ccc; border: none; border-radius: 5px;">
          Close
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Remove modal when clicking outside
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Show notification message
   */
  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Check if sharing is supported
   */
  public isShareSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    const shareButton = document.getElementById('mobile-share-button');
    if (shareButton) {
      shareButton.remove();
    }
  }
}
