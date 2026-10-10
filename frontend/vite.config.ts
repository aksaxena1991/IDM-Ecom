import path from 'path'
import { fileURLToPath } from 'url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@thoughtstream/ui/styles.css': path.resolve(__dirname, '../nectorNest-IMS/Thought-Stream-Design-System/src/styles.css'),
      '@thoughtstream/ui': path.resolve(__dirname, '../nectorNest-IMS/Thought-Stream-Design-System/src/index.ts'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
