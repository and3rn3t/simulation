import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  });

  test('initial application state', async ({ page }) => {
    // Take screenshot of initial state
    await expect(page).toHaveScreenshot('initial-state.png');
  });

  test('simulation running state', async ({ page }) => {
    // Start simulation
    await page.locator('#start-btn').click();

    // Wait for simulation to populate some organisms
    await page.waitForTimeout(2000);

    // Take screenshot
    await expect(page).toHaveScreenshot('simulation-running.png');
  });

  test('control panel layout', async ({ page }) => {
    // Focus on control panel area
    const controlPanel = page.locator('.control-panel, #controls');

    if ((await controlPanel.count()) > 0) {
      await expect(controlPanel).toHaveScreenshot('control-panel.png');
    } else {
      // If no specific control panel, capture the control area
      await expect(page.locator('body')).toHaveScreenshot('controls-area.png');
    }
  });

  test('stats panel layout', async ({ page }) => {
    const statsPanel = page.locator('#stats-panel');

    if ((await statsPanel.count()) > 0) {
      await expect(statsPanel).toHaveScreenshot('stats-panel.png');
    }
  });

  test('memory panel if present', async ({ page }) => {
    const memoryPanel = page.locator('.memory-panel');

    if ((await memoryPanel.count()) > 0) {
      await expect(memoryPanel).toHaveScreenshot('memory-panel.png');
    }
  });

  test('mobile layout', async ({ page }) => {
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-layout.png');
  });

  test('tablet layout', async ({ page }) => {
    // Switch to tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    // Take tablet screenshot
    await expect(page).toHaveScreenshot('tablet-layout.png');
  });

  test('canvas with organisms', async ({ page }) => {
    const canvas = page.locator('#simulation-canvas');

    // Add some organisms by clicking
    await canvas.click({ position: { x: 100, y: 100 } });
    await canvas.click({ position: { x: 200, y: 150 } });
    await canvas.click({ position: { x: 300, y: 200 } });

    await page.waitForTimeout(1000);

    // Take screenshot of canvas area
    await expect(canvas).toHaveScreenshot('canvas-with-organisms.png');
  });

  test('error state visualization', async ({ page }) => {
    // Try to trigger an error state for visual verification
    // This might involve invalid inputs or edge cases

    const speedSlider = page.locator('#speed-slider');
    if ((await speedSlider.count()) > 0) {
      // Try extreme values
      await speedSlider.fill('999');
      await page.waitForTimeout(500);
    }

    // Take screenshot to verify error handling UI
    await expect(page).toHaveScreenshot('potential-error-state.png');
  });
});

test.describe('Component Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('buttons in different states', async ({ page }) => {
    // Test button hover states
    const startBtn = page.locator('#start-btn');

    // Normal state
    await expect(startBtn).toHaveScreenshot('start-button-normal.png');

    // Hover state
    await startBtn.hover();
    await expect(startBtn).toHaveScreenshot('start-button-hover.png');

    // Active state
    await startBtn.click();
    await page.waitForTimeout(100);
    await expect(page.locator('#pause-btn')).toHaveScreenshot('pause-button-active.png');
  });

  test('slider components', async ({ page }) => {
    const speedSlider = page.locator('#speed-slider');

    if ((await speedSlider.count()) > 0) {
      // Default position
      await expect(speedSlider.locator('..')).toHaveScreenshot('speed-slider-default.png');

      // Different positions
      await speedSlider.fill('7');
      await expect(speedSlider.locator('..')).toHaveScreenshot('speed-slider-high.png');

      await speedSlider.fill('1');
      await expect(speedSlider.locator('..')).toHaveScreenshot('speed-slider-low.png');
    }
  });

  test('loading states', async ({ page }) => {
    // Reload page to capture loading state
    await page.reload();

    // Try to capture loading state (this might be very brief)
    await page.waitForTimeout(100);
    await expect(page).toHaveScreenshot('loading-state.png');

    // Wait for full load
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('loaded-state.png');
  });
});
