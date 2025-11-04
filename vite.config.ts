import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/getlunex.github.io/', // Critical for GitHub Pages

  plugins: [
    react(),

    // PWA — Make Lunex installable like an app
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Lunex – AI SaaS for Teams',
        short_name: 'Lunex',
        description: 'Lunar-speed AI workflows, zero-code automation, seamless sync.',
        theme_color: '#00d4ff',
        background_color: '#0a0a1a',
        display: 'standalone',
        scope: '/getlunex.github.io/',
        start_url: '/getlunex.github.io/',
        icons: [
          {
            src: '/getlunex.github.io/logo-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/getlunex.github.io/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'assets' },
          },
        ],
      },
    }),

    // Visualize bundle size (open report.html after build)
    visualizer({ open: false, gzipSize: true, brotliSize: true }),

    // Ultra-compress assets
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginalAssets: false,
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['@google/generative-ai'], // if using Gemini
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
  },

  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  preview: {
    port: 4000,
    open: true,
  },
});
