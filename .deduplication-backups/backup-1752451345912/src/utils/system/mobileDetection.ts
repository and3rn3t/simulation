/**
 * Secure Mobile Device Detection Utility
 *
 * This utility provides secure mobile device detection without ReDoS vulnerabilities.
 * It replaces the potentially vulnerable regex pattern used across multiple files.
 */

// Secure mobile detection patterns split for better performance
const MOBILE_INDICATORS = [
  'Android',
  'webOS',
  'iPhone',
  'iPad',
  'iPod',
  'BlackBerry',
  'IEMobile',
  'Opera Mini',
];

/**
 * Securely detect if the current device is mobile
 * @returns {boolean} True if mobile device detected
 */
export function isMobileDevice(): boolean {
  ifPattern(typeof navigator === 'undefined' || !navigator.userAgent, () => { return false;
   });

  const userAgent = navigator.userAgent;

  // Use simple string includes instead of complex regex
  return MOBILE_INDICATORS.some(indicator => userAgent.includes(indicator));
}

/**
 * Legacy compatibility function - use isMobileDevice() instead
 * @deprecated Use isMobileDevice() instead for better security
 * @returns {boolean} True if mobile device detected
 */
export function checkMobileUserAgent(): boolean {
  return isMobileDevice();
}

/**
 * Get detailed device information
 * @returns {object} Device information object
 */
export function getDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return {
      isMobile: false,
      userAgent: '',
      screenWidth: 0,
      screenHeight: 0,
    };
  }

  return {
    isMobile: isMobileDevice(),
    userAgent: navigator.userAgent,
    screenWidth: screen?.width || 0,
    screenHeight: screen?.height || 0,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}
