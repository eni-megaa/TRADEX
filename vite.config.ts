import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/tv-search': {
        target: 'https://symbol-search.tradingview.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tv-search/, ''),
        headers: {
          'Origin': 'https://www.tradingview.com',
          'Referer': 'https://www.tradingview.com/'
        }
      },
      '/api/tv-scanner': {
        target: 'https://scanner.tradingview.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tv-scanner/, ''),
        headers: {
          'Origin': 'https://www.tradingview.com',
          'Referer': 'https://www.tradingview.com/'
        }
      }
    }
  },
});
