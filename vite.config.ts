import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: ["csv-parse/sync"],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Polyfills Node.js pour le navigateur
      stream: "stream-browserify",
      buffer: "buffer",
    },
    
  },
  server: {
    proxy: {
    
      '/api.php': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        // Force le transfert des en-têtes d'origine si nécessaire
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      },
      '/apirest.php': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      },
    }
  }
})
