import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Note: use '/api/' (trailing slash) so client pages like /api-keys
      // are NOT intercepted and forwarded to the backend.
      '/api/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});