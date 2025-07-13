import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

// Vitest Fast Configuration for CI/CD
// Optimized for speed and essential coverage only
export default defineConfig({
  cacheDir: 'node_modules/.vitest',
  test: {
    // Performance optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 2,
        maxThreads: 4,
      },
    },

    // Fast execution settings
    testTimeout: 5000, // 5 second timeout per test
    hookTimeout: 3000, // 3 second timeout for hooks

    // Essential test patterns only (exclude slow integration tests)
    include: [
      'test/unit/**/*.test.{js,ts}',
      'test/unit/**/*.spec.{js,ts}',
      // Exclude slow tests in CI fast mode
      '!test/integration/**',
      '!test/mobile/**',
      '!test/visual/**',
      '!test/performance/**',
    ],

    // Essential test environment
    environment: 'jsdom',

    // Enable globals for vitest functions
    globals: true,

    // Fast reporters
    reporters: [['default', { summary: false }]],

    // Essential coverage only
    coverage: {
      enabled: false, // Disable coverage in fast mode
      provider: 'v8',
      include: ['src/core/**', 'src/utils/**', 'src/models/**'],
      exclude: [
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}',
        'src/dev/**',
        'src/mobile/**', // Exclude complex mobile tests
      ],
      thresholds: {
        global: {
          statements: 70,
          branches: 60,
          functions: 70,
          lines: 70,
        },
      },
    },

    // Fast setup
    setupFiles: ['./test/setup/vitest.fast.setup.ts'],

    // Optimized config
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
    },

    // Memory management
    maxConcurrency: 4,

    // Skip slow operations
    watch: false,
  },

  // Build optimizations for testing
  esbuild: {
    target: 'node18',
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './test'),
    },
  },
});
