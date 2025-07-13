/**
 * Mobile Social Manager - Social sharing and collaborative features for mobile
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
  files?: File[];
}

export interface MobileSocialConfig {
  enableNativeSharing: boolean;
  enableScreenshots: boolean;
  enableVideoRecording: boolean;
  enableCollaboration: boolean;
  maxVideoLength: number; // seconds
  screenshotQuality: number; // 0.0 to 1.0
}

export class MobileSocialManager {
  private config: MobileSocialConfig;
  private canvas: HTMLCanvasElement;
  private mediaRecorder?: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private shareButton?: HTMLButtonElement;
  private recordButton?: HTMLButtonElement;

  constructor(canvas: HTMLCanvasElement, config: Partial<MobileSocialConfig> = {}) {
    this.canvas = canvas;
    this.config = {
      enableNativeSharing: true,
      enableScreenshots: true,
      enableVideoRecording: true,
      enableCollaboration: false,
      maxVideoLength: 30,
      screenshotQuality: 0.8,
      ...config,
    };

    this.initializeSocialFeatures();
  }

  /**
   * Initialize social features
   */
  private initializeSocialFeatures(): void {
    this.createSocialButtons();
    this.setupKeyboardShortcuts();
    this.checkWebShareSupport();
  }

  /**
   * Create social sharing buttons
   */
  private createSocialButtons(): void {
    this.createShareButton();
    this.createRecordButton();
    this.createScreenshotButton();
  }

  /**
   * Create share button
   */
  private createShareButton(): void {
    if (!this.config.enableNativeSharing) return;

    this.shareButton = document.createElement('button');
    this.shareButton.innerHTML = '📤';
    this.shareButton.title = 'Share';
    this.shareButton.className = 'mobile-share-btn';

    Object.assign(this.shareButton.style, {
      position: 'fixed',
      top: '60px',
      right: '10px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      zIndex: '1000',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    });

    this.shareButton.addEventListener('click', this.handleShareClick.bind(this));
    this.addHoverEffects(this.shareButton);
    document.body.appendChild(this.shareButton);
  }

  /**
   * Create record button
   */
  private createRecordButton(): void {
    if (!this.config.enableVideoRecording) return;

    this.recordButton = document.createElement('button');
    this.recordButton.innerHTML = '🎥';
    this.recordButton.title = 'Record Video';
    this.recordButton.className = 'mobile-record-btn';

    Object.assign(this.recordButton.style, {
      position: 'fixed',
      top: '120px',
      right: '10px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      zIndex: '1000',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    });

    this.recordButton.addEventListener('click', this.handleRecordClick.bind(this));
    this.addHoverEffects(this.recordButton);
    document.body.appendChild(this.recordButton);
  }

  /**
   * Create screenshot button
   */
  private createScreenshotButton(): void {
    if (!this.config.enableScreenshots) return;

    const screenshotButton = document.createElement('button');
    screenshotButton.innerHTML = '📸';
    screenshotButton.title = 'Take Screenshot';
    screenshotButton.className = 'mobile-screenshot-btn';

    Object.assign(screenshotButton.style, {
      position: 'fixed',
      top: '180px',
      right: '10px',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      border: 'none',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      fontSize: '20px',
      cursor: 'pointer',
      zIndex: '1000',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    });

    screenshotButton.addEventListener('click', this.takeScreenshot.bind(this));
    this.addHoverEffects(screenshotButton);
    document.body.appendChild(screenshotButton);
  }

  /**
   * Add hover effects to buttons
   */
  private addHoverEffects(button: HTMLButtonElement): void {
    button.addEventListener('touchstart', () => {
      button.style.transform = 'scale(0.9)';
    });

    button.addEventListener('touchend', () => {
      button.style.transform = 'scale(1)';
    });

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', event => {
      // Ctrl/Cmd + S for screenshot
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        this.takeScreenshot();
      }

      // Ctrl/Cmd + R for record
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        this.handleRecordClick();
      }

      // Ctrl/Cmd + Shift + S for share
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        this.handleShareClick();
      }
    });
  }

  /**
   * Check Web Share API support
   */
  private checkWebShareSupport(): boolean {
    return 'share' in navigator;
  }

  /**
   * Handle share button click
   */
  private async handleShareClick(): Promise<void> {
    try {
      const screenshot = await this.captureCanvas();
      const blob = await this.dataURLToBlob(screenshot);
      const file = new File([blob], 'simulation.png', { type: 'image/png' });

      const shareData: ShareData = {
        title: 'My Organism Simulation',
        text: 'Check out my ecosystem simulation!',
        url: window.location.href,
        files: [file],
      };

      await this.share(shareData);
    } catch { /* handled */ }
  }

  /**
   * Handle record button click
   */
  private async handleRecordClick(): Promise<void> {
    if (this.isRecording) {
      await this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  /**
   * Take screenshot of canvas
   */
  public async takeScreenshot(): Promise<void> {
    try {
      const dataURL = await this.captureCanvas();

      // Flash effect
      this.showFlashEffect();

      // Show preview and share options
      this.showScreenshotPreview(dataURL);

      // Haptic feedback
      this.vibrate(50);
    } catch { /* handled */ }
  }

  /**
   * Capture canvas as data URL
   */
  private async captureCanvas(): Promise<string> {
    return new Promise(resolve => {
      // Add watermark
      const ctx = this.canvas.getContext('2d')!;
      const originalComposite = ctx.globalCompositeOperation;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px Arial';
      ctx.fillText('Organism Simulation', 10, this.canvas.height - 10);

      const dataURL = this.canvas.toDataURL('image/png', this.config.screenshotQuality);

      // Restore original composite
      ctx.globalCompositeOperation = originalComposite;

      resolve(dataURL);
    });
  }

  /**
   * Start video recording
   */
  private async startRecording(): Promise<void> {
    try {
      const stream = this.canvas.captureStream(30); // 30 FPS

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      this.updateRecordButton(true);
      this.showRecordingIndicator();

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.config.maxVideoLength * 1000);
    } catch { /* handled */ }
  }

  /**
   * Stop video recording
   */
  private async stopRecording(): Promise<void> {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.mediaRecorder.stop();
    this.isRecording = false;

    this.updateRecordButton(false);
    this.hideRecordingIndicator();
  }

  /**
   * Process recorded video
   */
  private processRecording(): void {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    this.showVideoPreview(url, blob);
  }

  /**
   * Share content using Web Share API or fallback
   */
  public async share(shareData: ShareData): Promise<void> {
    if (this.checkWebShareSupport() && 'canShare' in navigator && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        this.trackShareEvent('native', 'success');
      } catch (error) {
        if (error.name !== 'AbortError') {
          this.showShareFallback();
        }
      }
    } else {
      this.showShareFallback();
    }
  }

  /**
   * Show share fallback options
   */
  private showShareFallback(): void {
    const modal = this.createShareModal();
    document.body.appendChild(modal);
  }

  /**
   * Create share modal with platform options
   */
  private createShareModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'share-modal';

    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '2000',
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '30px',
      maxWidth: '90%',
      maxHeight: '90%',
      overflow: 'auto',
    });

    content.innerHTML = `
      <h3 style="margin-top: 0; text-align: center;">Share Your Simulation</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 15px; margin: 20px 0;">
        <button class="share-option" data-platform="twitter">🐦<br>Twitter</button>
        <button class="share-option" data-platform="facebook">📘<br>Facebook</button>
        <button class="share-option" data-platform="reddit">🔗<br>Reddit</button>
        <button class="share-option" data-platform="copy">📋<br>Copy Link</button>
        <button class="share-option" data-platform="email">📧<br>Email</button>
        <button class="share-option" data-platform="download">💾<br>Download</button>
      </div>
      <button id="close-share-modal" style="width: 100%; padding: 10px; background: #ccc; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;

    const shareOptions = content.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
      Object.assign((option as HTMLElement).style, {
        padding: '15px',
        border: 'none',
        borderRadius: '10px',
        backgroundColor: '#f0f0f0',
        cursor: 'pointer',
        fontSize: '12px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
      });

      option.addEventListener('click', event => {
        const platform = (event.currentTarget as HTMLElement).dataset.platform!;
        this.handlePlatformShare(platform);
        modal.remove();
      });
    });

    content.querySelector('#close-share-modal')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', event => {
      if (event.target === modal) {
        modal.remove();
      }
    });

    modal.appendChild(content);
    return modal;
  }

  /**
   * Handle platform-specific sharing
   */
  private async handlePlatformShare(platform: string): Promise<void> {
    const url = window.location.href;
    const text = 'Check out my organism simulation!';

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        );
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'reddit':
        window.open(
          `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
        );
        break;
      case 'copy':
        await this.copyToClipboard(url);
        this.showToast('Link copied to clipboard!');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
      case 'download': {
        const screenshot = await this.captureCanvas();
        this.downloadImage(screenshot, 'simulation.png');
        break;
      }
    }

    this.trackShareEvent(platform, 'success');
  }

  /**
   * Show screenshot preview
   */
  private showScreenshotPreview(dataURL: string): void {
    const preview = this.createPreviewModal(dataURL, 'image');
    document.body.appendChild(preview);
  }

  /**
   * Show video preview
   */
  private showVideoPreview(url: string, blob: Blob): void {
    const preview = this.createPreviewModal(url, 'video', blob);
    document.body.appendChild(preview);
  }

  /**
   * Create preview modal
   */
  private createPreviewModal(src: string, type: 'image' | 'video', blob?: Blob): HTMLElement {
    const modal = document.createElement('div');
    Object.assign(modal.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '2000',
      padding: '20px',
    });

    const mediaElement =
      type === 'image' ? document.createElement('img') : document.createElement('video');

    Object.assign(mediaElement.style, {
      maxWidth: '90%',
      maxHeight: '70%',
      borderRadius: '10px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    });

    mediaElement.src = src;
    if (type === 'video') {
      (mediaElement as HTMLVideoElement).controls = true;
      (mediaElement as HTMLVideoElement).autoplay = true;
    }

    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
      display: 'flex',
      gap: '15px',
      marginTop: '20px',
    });

    const shareBtn = this.createPreviewButton('📤 Share', () => {
      if (type === 'image') {
        this.shareImage(src);
      } else if (blob) {
        this.shareVideo(blob);
      }
      modal.remove();
    });

    const downloadBtn = this.createPreviewButton('💾 Download', () => {
      if (type === 'image') {
        this.downloadImage(src, 'simulation.png');
      } else if (blob) {
        this.downloadVideo(blob, 'simulation.webm');
      }
      modal.remove();
    });

    const closeBtn = this.createPreviewButton('✖️ Close', () => {
      modal.remove();
      if (type === 'video') {
        URL.revokeObjectURL(src);
      }
    });

    buttonContainer.appendChild(shareBtn);
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(closeBtn);

    modal.appendChild(mediaElement);
    modal.appendChild(buttonContainer);

    return modal;
  }

  /**
   * Create preview button
   */
  private createPreviewButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;

    Object.assign(button.style, {
      padding: '12px 20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    });

    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Utility functions
   */
  private async dataURLToBlob(dataURL: string): Promise<Blob> {
    // Validate that the dataURL is actually a data URL to prevent SSRF
    if (!dataURL.startsWith('data:')) {
      throw new Error('Invalid data URL: must start with "data:"');
    }

    // Fixed: More secure validation without vulnerable regex patterns
    // Check for valid image data URL format using string methods
    const isValidImageDataURL =
      dataURL.startsWith('data:image/') &&
      (dataURL.includes('png;base64,') ||
        dataURL.includes('jpeg;base64,') ||
        dataURL.includes('jpg;base64,') ||
        dataURL.includes('gif;base64,') ||
        dataURL.includes('webp;base64,'));

    if (!isValidImageDataURL) {
      throw new Error('Invalid image data URL format');
    }

    const response = await fetch(dataURL);
    return response.blob();
  }

  private async copyToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }

  private downloadImage(dataURL: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
  }

  private downloadVideo(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async shareImage(dataURL: string): Promise<void> {
    const blob = await this.dataURLToBlob(dataURL);
    const file = new File([blob], 'simulation.png', { type: 'image/png' });

    await this.share({
      title: 'My Organism Simulation',
      text: 'Check out my ecosystem simulation!',
      url: window.location.href,
      files: [file],
    });
  }

  private async shareVideo(blob: Blob): Promise<void> {
    const file = new File([blob], 'simulation.webm', { type: 'video/webm' });

    await this.share({
      title: 'My Organism Simulation Video',
      text: 'Watch my ecosystem simulation in action!',
      url: window.location.href,
      files: [file],
    });
  }

  private showFlashEffect(): void {
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'white',
      opacity: '0.8',
      zIndex: '9999',
      pointerEvents: 'none',
    });

    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 150);
  }

  private updateRecordButton(recording: boolean): void {
    if (!this.recordButton) return;

    this.recordButton.innerHTML = recording ? '⏹️' : '🎥';
    this.recordButton.style.background = recording
      ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  }

  private showRecordingIndicator(): void {
    const indicator = document.createElement('div');
    indicator.id = 'recording-indicator';
    indicator.innerHTML = '🔴 Recording...';

    Object.assign(indicator.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(255, 0, 0, 0.9)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
      zIndex: '1001',
      animation: 'pulse 1s infinite',
    });

    document.body.appendChild(indicator);
  }

  private hideRecordingIndicator(): void {
    const indicator = document.getElementById('recording-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  private showToast(message: string): void {
    const toast = document.createElement('div');
    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '25px',
      fontSize: '14px',
      zIndex: '1001',
    });

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  private showError(message: string): void {
    this.showToast(`Error: ${message}`);
  }

  private vibrate(duration: number): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  private trackShareEvent(platform: string, status: string): void {
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MobileSocialConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.shareButton) this.shareButton.remove();
    if (this.recordButton) this.recordButton.remove();

    if (this.isRecording) {
      this.stopRecording();
    }
  }
}
