import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const IDM_REMOTE = process.env.IDM_REMOTE_URL ?? 'http://localhost:3000/remoteEntry.js'

export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      dts: false,
      remotes: {
        idm: {
          type: 'module',
          name: 'idm',
          entry: IDM_REMOTE,
          entryGlobalName: 'idm',
          shareScope: 'default',
        },
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
  server: {
    port: 3003,
    strictPort: true,
    origin: 'http://localhost:3003',
  },
  preview: {
    port: 3003,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: false,
  },
})
