import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map your Next.js-style aliases
      '@': path.resolve(__dirname, './'),
      '@app': path.resolve(__dirname, './src/app'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      // Add any other Next.js aliases you use
    }
  },
  test: {
    onConsoleLog(log, type) {
      return true;
    },
    globals: true,
    environment: 'jsdom',
    //setupFiles: './src/tests/setup.ts', // optional setup file
    // Include any Next.js specific globals you need
    coverage: {
      provider: 'v8'
    }
  }
})