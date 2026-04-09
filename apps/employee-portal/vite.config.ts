import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '::',
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // POC branch: redirect @microsoft/power-apps to the mock module so
      // all hooks work with dummy data and no auth.
      '@microsoft/power-apps': resolve(__dirname, './src/mocks/power-apps-mock.tsx'),
    },
  },
})
