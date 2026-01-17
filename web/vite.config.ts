import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Point to production API for testing (change to localhost:3000 for local backend)
        target: 'http://passaddis-dev-backend-env.eba-bvsaimrn.eu-north-1.elasticbeanstalk.com',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://passaddis-dev-backend-env.eba-bvsaimrn.eu-north-1.elasticbeanstalk.com',
        changeOrigin: true,
      },
    },
  },
})
