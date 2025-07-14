/**
 * Mobile Detection Utilities
 */

/**
 * Detect if the current device is mobile
 */
export function isMobileDevice(): boolean {
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'webos',
  ];

  const hasMobileKeyword = mobileKeywords.some(keyword => userAgent.includes(keyword));

  // Check for touch support
  const hasTouchSupport =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  // Check screen size (common mobile breakpoint)
  const hasSmallScreen = window.innerWidth <= 768;

  // Device is considered mobile if it has mobile keywords OR (touch support AND small screen)
  return hasMobileKeyword || (hasTouchSupport && hasSmallScreen);
}

/**
 * Detect if the device is a tablet
 */
export function isTabletDevice(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const tabletKeywords = ['ipad', 'tablet', 'kindle'];

  const hasTabletKeyword = tabletKeywords.some(keyword => userAgent.includes(keyword));

  // Check for medium screen size with touch support
  const hasMediumScreen = window.innerWidth > 768 && window.innerWidth <= 1024;
  const hasTouchSupport = 'ontouchstart' in window;

  return hasTabletKeyword || (hasTouchSupport && hasMediumScreen);
}

/**
 * Get device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
}

/**
 * Check if device supports touch
 */
export function supportsTouchEvents(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Get screen info
 */
export function getScreenInfo(): {
  width: number;
  height: number;
  pixelRatio: number;
  orientation: string;
} {
  return {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    orientation: window.screen.orientation?.type || 'unknown',
  };
}
