import path from 'path'
import { fileURLToPath } from 'url'
import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REMOTE_ORIGIN = 'http://localhost:3000'

export default defineConfig({
  plugins: [
    federation({
      name: 'idm',
      filename: 'remoteEntry.js',
      dts: false,
      bundleAllCSS: true,
      exposes: {
        './App': './src/App.tsx',
        './IdmRoot': './src/IdmRoot.tsx',
        './AppRoutes': './src/App.tsx',
        './LoginPage': './src/pages/LoginPage.tsx',
        './RegisterPage': './src/pages/RegisterPage.tsx',
        './DashboardPage': './src/pages/DashboardPage.tsx',
        './AppLayout': './src/components/AppLayout.tsx',
        './AuthProvider': './src/auth/AuthContext.tsx',
        './mount': './src/mount.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0', eager: true },
        'react/': { singleton: true },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0', eager: true },
        'react-dom/': { singleton: true },
        'react-router-dom': { singleton: true, requiredVersion: '^7.0.0', eager: true },
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@thoughtstream/ui/styles.css': path.resolve(__dirname, '../nectorNest-IMS/Thought-Stream-Design-System/src/styles.css'),
      '@thoughtstream/ui': path.resolve(__dirname, '../nectorNest-IMS/Thought-Stream-Design-System/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  server: {
    port: 3000,
    strictPort: true,
    origin: REMOTE_ORIGIN,
    cors: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  preview: {
    port: 3000,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: false,
    cssCodeSplit: false,
  },
})
