import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During `npm run dev`, requests to /api are proxied to the FastAPI backend
// on localhost:8000, so the frontend can use relative /api/... URLs everywhere
// (dev, Vercel, and the VPS behind nginx) without code changes.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
