import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force all shared packages to resolve from this app's node_modules.
    // This is necessary because the source files referenced via the @/ alias
    // live in ../employee-portal/src which has no node_modules of its own.
    dedupe: [
      'react',
      'react-dom',
      'react-router-dom',
      '@fluentui/react-components',
      '@fluentui/react-icons',
    ],
    alias: [
      // Replace the Power Apps SDK with in-memory stubs — no Dataverse, no flows, no auth
      {
        find: '@microsoft/power-apps',
        replacement: path.resolve(__dirname, './src/mock-power-apps/index.tsx'),
      },
      // UAT-local overrides (evaluated before the catch-all @/ alias below)
      {
        find: '@/context/WizardContext',
        replacement: path.resolve(__dirname, './src/context/WizardContext.tsx'),
      },
      {
        find: '@/components/shared/AppShell',
        replacement: path.resolve(__dirname, './src/components/shared/AppShell.tsx'),
      },
      // Everything else resolves from the original employee-portal source
      {
        find: '@',
        replacement: path.resolve(__dirname, '../employee-portal/src'),
      },
    ],
  },
  server: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
