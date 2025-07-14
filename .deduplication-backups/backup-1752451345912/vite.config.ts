import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Define environment variables that should be available to the app
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '0.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // Environment file configuration
    envPrefix: 'VITE_',
    envDir: './environments',

    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
          ],
        },
        manifest: {
          name: env.VITE_APP_NAME || 'Organism Simulation',
          short_name: 'OrgSim',
          description: 'Interactive organism simulation game',
          theme_color: '#2196F3',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        },
      }),
    ],

    css: {
      devSourcemap: mode === 'development',
    },

    build: {
      cssCodeSplit: false,
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['rxjs'],
          },
        },
      },
    },

    server: {
      port: 5173,
      host: true, // Allow external connections
      open: mode === 'development',
    },

    preview: {
      port: 4173,
      host: true,
    },

    // Performance optimizations
    optimizeDeps: {
      include: ['rxjs'],
    },
  };
});
