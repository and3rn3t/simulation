import {
  getDeviceType,
  getScreenInfo,
  isMobileDevice,
  supportsTouchEvents,
} from './MobileDetection';

export interface MobileTestResult {
  test: string;
  passed: boolean;
  details: string;
  performance?: number;
}

export interface MobileCapabilities {
  isMobile: boolean;
  supportsTouch: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenInfo: {
    width: number;
    height: number;
    pixelRatio: number;
    orientation: string;
  };
  supportedFeatures: string[];
}

/**
 * Mobile Test Interface - Simplified implementation for testing mobile features
 */
export class MobileTestInterface {
  private testResults: MobileTestResult[] = [];
  private isRunning: boolean = false;

  constructor() {
    // Auto-run basic capability detection
    this.detectCapabilities();
  }

  /**
   * Detect mobile capabilities
   */
  private detectCapabilities(): void {
    const capabilities: MobileCapabilities = {
      isMobile: isMobileDevice(),
      supportsTouch: supportsTouchEvents(),
      deviceType: getDeviceType(),
      screenInfo: getScreenInfo(),
      supportedFeatures: this.detectSupportedFeatures(),
    };

    this.addTestResult({
      test: 'Mobile Detection',
      passed: true,
      details: `Device: ${capabilities.deviceType}, Touch: ${capabilities.supportsTouch}, Mobile: ${capabilities.isMobile}`,
    });
  }

  /**
   * Detect supported features
   */
  private detectSupportedFeatures(): string[] {
    const features: string[] = [];

    // Check for various mobile features
    if ('serviceWorker' in navigator) features.push('ServiceWorker');
    if ('Notification' in window) features.push('Notifications');
    if ('requestFullscreen' in document.documentElement) features.push('Fullscreen');
    if ('geolocation' in navigator) features.push('Geolocation');
    if ('deviceorientation' in window) features.push('DeviceOrientation');
    if ('DeviceMotionEvent' in window) features.push('DeviceMotion');
    if ('webkitRequestFullscreen' in document.documentElement) features.push('WebkitFullscreen');
    if ('share' in navigator) features.push('WebShare');
    if ('vibrate' in navigator) features.push('Vibration');

    return features;
  }

  /**
   * Run comprehensive mobile tests
   */
  public async runAllTests(): Promise<MobileTestResult[]> {
    if (this.isRunning) {
      throw new Error('Tests are already running');
    }

    this.isRunning = true;
    this.testResults = [];

    try {
      // Basic capability tests
      await this.testBasicCapabilities();

      // Touch interaction tests
      if (supportsTouchEvents()) {
        await this.testTouchCapabilities();
      }

      // Performance tests
      await this.testPerformance();

      // Feature availability tests
      await this.testFeatureAvailability();

      return this.testResults;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Test basic mobile capabilities
   */
  private async testBasicCapabilities(): Promise<void> {
    // Screen size test
    const screenInfo = getScreenInfo();
    this.addTestResult({
      test: 'Screen Size',
      passed: screenInfo.width > 0 && screenInfo.height > 0,
      details: `${screenInfo.width}x${screenInfo.height}, ratio: ${screenInfo.pixelRatio}`,
    });

    // User agent test
    const userAgent = navigator.userAgent;
    const isMobileUA = /Mobile|Android|iPhone|iPad/.test(userAgent);
    this.addTestResult({
      test: 'User Agent Detection',
      passed: true,
      details: `Mobile in UA: ${isMobileUA}, Detected: ${isMobileDevice()}`,
    });

    // Viewport test
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.addTestResult({
      test: 'Viewport',
      passed: viewport.width > 0 && viewport.height > 0,
      details: `${viewport.width}x${viewport.height}`,
    });
  }

  /**
   * Test touch capabilities
   */
  private async testTouchCapabilities(): Promise<void> {
    // Touch event support
    const touchSupport = 'ontouchstart' in window;
    this.addTestResult({
      test: 'Touch Events',
      passed: touchSupport,
      details: `Touch events ${touchSupport ? 'supported' : 'not supported'}`,
    });

    // Touch points
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    this.addTestResult({
      test: 'Touch Points',
      passed: maxTouchPoints > 0,
      details: `Max touch points: ${maxTouchPoints}`,
    });

    // Pointer events
    const pointerSupport = 'onpointerdown' in window;
    this.addTestResult({
      test: 'Pointer Events',
      passed: pointerSupport,
      details: `Pointer events ${pointerSupport ? 'supported' : 'not supported'}`,
    });
  }

  /**
   * Test performance characteristics
   */
  private async testPerformance(): Promise<void> {
    const startTime = performance.now();

    // Simple computation test
    let _sum = 0;
    for (let i = 0; i < 1000000; i++) {
      _sum += i;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.addTestResult({
      test: 'CPU Performance',
      passed: duration < 1000, // Should complete in under 1 second
      details: `Computation took ${duration.toFixed(2)}ms`,
      performance: duration,
    });

    // Memory test (if available)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.addTestResult({
        test: 'Memory Info',
        passed: true,
        details: `Used: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB, Total: ${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  }

  /**
   * Test feature availability
   */
  private async testFeatureAvailability(): Promise<void> {
    const features = this.detectSupportedFeatures();

    this.addTestResult({
      test: 'Feature Detection',
      passed: features.length > 0,
      details: `Supported features: ${features.join(', ')}`,
    });

    // Service Worker test
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        this.addTestResult({
          test: 'Service Worker',
          passed: !!registration,
          details: registration ? 'Service Worker registered' : 'No Service Worker found',
        });
      } catch (error) {
        this.addTestResult({
          test: 'Service Worker',
          passed: false,
          details: `Service Worker error: ${error}`,
        });
      }
    }
  }

  /**
   * Add a test result
   */
  private addTestResult(result: MobileTestResult): void {
    this.testResults.push(result);
  }

  /**
   * Get current test results
   */
  public getTestResults(): MobileTestResult[] {
    return [...this.testResults];
  }

  /**
   * Get mobile capabilities summary
   */
  public getCapabilities(): MobileCapabilities {
    return {
      isMobile: isMobileDevice(),
      supportsTouch: supportsTouchEvents(),
      deviceType: getDeviceType(),
      screenInfo: getScreenInfo(),
      supportedFeatures: this.detectSupportedFeatures(),
    };
  }

  /**
   * Check if tests are currently running
   */
  public isTestRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get a summary of passed/failed tests
   */
  public getTestSummary(): { total: number; passed: number; failed: number; successRate: number } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(test => test.passed).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return { total, passed, failed, successRate };
  }

  /**
   * Clear all test results
   */
  public clearResults(): void {
    this.testResults = [];
  }
}
