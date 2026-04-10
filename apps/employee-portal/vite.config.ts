import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // @microsoft/power-apps is provided by the Power Platform runtime
      external: ['@microsoft/power-apps'],
      output: {
        globals: {
          '@microsoft/power-apps': 'PowerApps',
        },
      },
    },
  },
})
