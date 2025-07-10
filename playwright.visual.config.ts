import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression testing configuration
 */
export default defineConfig({
  testDir: './test/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/visual-report' }],
    ['json', { outputFile: 'test-results/visual-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'visual-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Specific settings for visual tests
        viewport: { width: 1280, height: 720 }
      },
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Visual testing specific configuration
  expect: {
    // Threshold for visual comparisons
    threshold: 0.2,
    // Animation handling
    toHaveScreenshot: {
      threshold: 0.2,
      mode: 'disabled' // Disable animations for consistent screenshots
    }
  }
});
