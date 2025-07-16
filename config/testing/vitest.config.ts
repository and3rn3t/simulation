import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Changed to jsdom for better DOM testing
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      'e2e/**',
      'test/performance/**',
      'test/visual/**',
      '.deduplication-backups/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/dev/**', // Exclude dev tools from coverage
        'e2e/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 85,
          statements: 85,
        },
      },
    },
    globals: true,
    testTimeout: 30000, // Increased from 10000
    hookTimeout: 30000, // Increased from 10000
    teardownTimeout: 10000,
    pool: 'forks', // Use process isolation for stability
    poolOptions: {
      forks: {
        singleFork: true, // Prevent memory issues
      },
    },
  },
});
