import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const buildId = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12)

// GitHub Pages serves this repo at /Anjakha/, so assets need that base path
// when built for Pages. Other hosts (Vercel, Netlify, a real server) serve
// from the domain root, so default to '/' unless GITHUB_PAGES is set.
const base = process.env.GITHUB_PAGES === 'true' ? '/Anjakha/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
})
