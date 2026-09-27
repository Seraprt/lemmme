import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'sahmee.onrender.com',
      '.onrender.com',   // allows any *.onrender.com subdomain
      'localhost',
    ],
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: [
      'sahmee.onrender.com',
      '.onrender.com',
      'localhost',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});