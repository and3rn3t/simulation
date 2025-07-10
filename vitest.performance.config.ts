import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/performance/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.git'],
    testTimeout: 30000, // Longer timeout for performance tests
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // Performance tests should run sequentially to avoid interference
    pool: 'forks',
    maxConcurrency: 1,
    globals: true
  }
})
