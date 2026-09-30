import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
  // Relative paths: works on GitHub Pages (/BotMaxKrutoi/) and in Docker (/)
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Local dev: forward API calls to max-bot running on :3000
    proxy: { '/api': 'http://localhost:3000' },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
