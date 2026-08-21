import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Worker (server lane) serves dist/client as static assets, and the
// dev proxy below assumes `wrangler dev`'s default port for /api and the
// room WebSocket during local development.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        ws: true,
      },
    },
  },
});
