// @ts-nocheck

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@btn-height-default': '40px',
        },
      },
    },
  },
  server: {
    allowedHosts: true,
    hmr: {
      path: '/ws',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/webhook': {
        target: 'https://liu0521.app.n8n.cloud',
        changeOrigin: true,
        secure: true,
      }
    }
  },
}));
