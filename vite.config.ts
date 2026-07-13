import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const buildId = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12)

export default defineConfig({
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
