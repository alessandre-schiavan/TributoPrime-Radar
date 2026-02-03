
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  // Estratégia Universal Deploy para GitHub Pages
  base: process.env.GITHUB_ACTIONS === 'true' ? '/TributoPrime-Radar/' : '/',
  server: {
    port: 3000,
    proxy: {
      '/api-proxy': {
        target: 'https://gen.pollinations.ai', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  }
})
