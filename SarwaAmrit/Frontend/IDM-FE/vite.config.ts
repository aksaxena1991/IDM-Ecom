import path from 'path'
import { fileURLToPath } from 'url'
import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REMOTE_ORIGIN = 'http://localhost:3000'
const DS_ROOT = path.resolve(__dirname, '../../../nectorNest-IMS/Thought-Stream-Design-System')
const REPO_ROOT = path.resolve(__dirname, '../../..')

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
        './AppRoutes': './src/AppRoutes.tsx',
        './LoginPage': './src/features/auth/pages/LoginPage.tsx',
        './RegisterPage': './src/features/auth/pages/RegisterPage.tsx',
        './DashboardPage': './src/features/workspace/pages/DashboardPage.tsx',
        './AppLayout': './src/components/AppLayout.tsx',
        './AuthProvider': './src/features/auth/context/AuthContext.tsx',
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
      '@thoughtstream/ui/styles.css': path.resolve(DS_ROOT, 'src/styles.css'),
      '@thoughtstream/ui': path.resolve(DS_ROOT, 'src/index.ts'),
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
      allow: [REPO_ROOT],
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
