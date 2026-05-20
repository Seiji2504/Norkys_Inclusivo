import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // Necesitamos esto

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Forzamos a que encuentre tslib en node_modules
      'tslib': path.resolve(__dirname, 'node_modules/tslib/tslib.es6.js'),
    },
  },
  optimizeDeps: {
    // Forzamos a que NO intente pre-empaquetar tslib, que la use directa
    exclude: ['tslib']
  }
})