import path from 'path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../DesignSystem/thoughtstream-ui')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@thoughtstream/ui/styles.css': path.resolve(DS_ROOT, 'src/styles.css'),
      '@thoughtstream/ui': path.resolve(DS_ROOT, 'src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3003,
    strictPort: true,
    host: '127.0.0.1',
    fs: { allow: [path.resolve(__dirname, '..')] },
    proxy: {
      '/sso': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sso/, ''),
      },
      '/chat-api': {
        target: 'http://127.0.0.1:8100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat-api/, ''),
      },
    },
  },
  preview: {
    port: 3003,
    strictPort: true,
    host: '127.0.0.1',
  },
})
