import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    // Ensure CSS is processed correctly
    devSourcemap: true,
  },
  build: {
    // Ensure CSS is included in build
    cssCodeSplit: false,
  },
  server: {
    // For development
    port: 5173,
  },
});
