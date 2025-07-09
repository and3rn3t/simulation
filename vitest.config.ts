import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node', // Use Node.js environment for tests
    setupFiles: ['./test/setup.ts'], // Ensure setup file is loaded
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.git'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    }
  }
})
