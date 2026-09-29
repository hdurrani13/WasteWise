/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, forward API calls to FastAPI. In production CloudFront routes /api/* to the backend.
    proxy: { '/api': 'http://localhost:8000' },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
