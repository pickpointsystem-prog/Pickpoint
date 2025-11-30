import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api/wa': {
        target: 'https://seen.getsender.id/send-message',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/wa/, ''),
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['lucide-react', 'tailwind-merge', 'clsx']
        }
      }
    }
  }
})