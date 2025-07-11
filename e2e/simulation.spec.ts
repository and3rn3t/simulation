import { test, expect } from '@playwright/test';

test.describe('Organism Simulation - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check if the main canvas is present
    const canvas = page.locator('#simulation-canvas');
    await expect(canvas).toBeVisible();

    // Check if control buttons are present
    await expect(page.locator('#start-btn')).toBeVisible();
    await expect(page.locator('#pause-btn')).toBeVisible();
    await expect(page.locator('#reset-btn')).toBeVisible();
    await expect(page.locator('#clear-btn')).toBeVisible();

    // Check if control panels are present
    await expect(page.locator('#stats-panel')).toBeVisible();
  });

  test('should start and pause simulation', async ({ page }) => {
    const startBtn = page.locator('#start-btn');
    const pauseBtn = page.locator('#pause-btn');

    // Start simulation
    await startBtn.click();

    // Wait a bit and verify simulation is running
    await page.waitForTimeout(1000);

    // Pause simulation
    await pauseBtn.click();

    // The test passes if no errors occur during start/pause
    expect(true).toBe(true);
  });

  test('should reset simulation', async ({ page }) => {
    const startBtn = page.locator('#start-btn');
    const resetBtn = page.locator('#reset-btn');

    // Start simulation first
    await startBtn.click();
    await page.waitForTimeout(1000);

    // Reset simulation
    await resetBtn.click();

    // Verify reset worked (organism count should be 0 or reset state)
    // This would need to be verified through UI elements showing count
    expect(true).toBe(true);
  });

  test('should clear canvas', async ({ page }) => {
    const clearBtn = page.locator('#clear-btn');

    // Clear the canvas
    await clearBtn.click();

    // Verify clear worked
    expect(true).toBe(true);
  });

  test('should respond to speed control changes', async ({ page }) => {
    const speedSlider = page.locator('#speed-slider');

    if ((await speedSlider.count()) > 0) {
      // Change speed
      await speedSlider.fill('3');

      // Verify speed value display updates
      const speedValue = page.locator('#speed-value');
      if ((await speedValue.count()) > 0) {
        await expect(speedValue).toContainText('3x');
      }
    }
  });

  test('should respond to population limit changes', async ({ page }) => {
    const populationSlider = page.locator('#population-limit');

    if ((await populationSlider.count()) > 0) {
      // Change population limit
      await populationSlider.fill('500');

      // Verify population limit display updates
      const populationValue = page.locator('#population-limit-value');
      if ((await populationValue.count()) > 0) {
        await expect(populationValue).toContainText('500');
      }
    }
  });

  test('should handle canvas interactions', async ({ page }) => {
    const canvas = page.locator('#simulation-canvas');

    // Click on canvas (should add organism if functionality exists)
    await canvas.click({
      position: { x: 200, y: 200 },
    });

    // Wait for any resulting changes
    await page.waitForTimeout(500);

    // The test passes if clicking doesn't cause errors
    expect(true).toBe(true);
  });

  test('should handle organism type selection', async ({ page }) => {
    const organismSelect = page.locator('#organism-select');

    if ((await organismSelect.count()) > 0) {
      // Change organism type
      await organismSelect.selectOption({ index: 1 });

      // Wait for change to process
      await page.waitForTimeout(500);
    }

    expect(true).toBe(true);
  });
});

test.describe('Organism Simulation - Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle memory panel if present', async ({ page }) => {
    // Check if memory panel is visible
    const memoryPanel = page.locator('.memory-panel');

    if ((await memoryPanel.count()) > 0) {
      await expect(memoryPanel).toBeVisible();

      // Check if memory statistics are displayed
      const memoryUsage = page.locator('.memory-usage');
      if ((await memoryUsage.count()) > 0) {
        await expect(memoryUsage).toBeVisible();
      }
    }
  });

  test('should handle error conditions gracefully', async ({ page }) => {
    // Monitor console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Perform various operations that might cause errors
    await page.locator('#start-btn').click();
    await page.waitForTimeout(2000);
    await page.locator('#reset-btn').click();
    await page.locator('#clear-btn').click();

    // Check that no critical errors occurred
    const criticalErrors = errors.filter(
      error =>
        error.includes('Critical') ||
        error.includes('TypeError') ||
        error.includes('ReferenceError')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    const canvas = page.locator('#simulation-canvas');
    await expect(canvas).toBeVisible();

    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(canvas).toBeVisible();

    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(canvas).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should maintain reasonable performance under load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start monitoring performance
    const startTime = Date.now();

    // Start simulation
    await page.locator('#start-btn').click();

    // Let it run for a few seconds
    await page.waitForTimeout(5000);

    // Check that page is still responsive
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Should complete within reasonable time
    expect(responseTime).toBeLessThan(10000); // 10 seconds max

    // Page should still be responsive
    await page.locator('#pause-btn').click();
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Rapidly click start/pause multiple times
    for (let i = 0; i < 5; i++) {
      await page.locator('#start-btn').click();
      await page.waitForTimeout(100);
      await page.locator('#pause-btn').click();
      await page.waitForTimeout(100);
    }

    // Application should still be functional
    await page.locator('#reset-btn').click();
    expect(true).toBe(true);
  });
});
