import { defineConfig } from 'vitest/config';
import { devtools } from '@tanstack/devtools-vite';
import viteReact from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    passWithNoTests: true,
  },
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@repo/api': fileURLToPath(
        new URL('../../packages/api/src', import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite Proxy] Error:', err.message);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(
              '[Vite Proxy] Response status:',
              proxyRes.statusCode,
              req.url,
            );
          });
        },
        proxyTimeout: 120000,
        timeout: 120000,
      },
    },
  },
});
