import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

const DS_ROOT = path.resolve(
  __dirname,
  '../../../nectorNest-IMS/Thought-Stream-Design-System'
);

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'nn_ims',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './ImsShell': './src/features/shell/pages/ImsShell.tsx',
        './CatalogPage': './src/features/catalog/pages/CatalogPage.tsx',
        './StockPage': './src/features/stock/pages/StockPage.tsx',
        './ReceivingPage': './src/features/receiving/pages/ReceivingPage.tsx',
        './AdjustmentsPage': './src/features/adjustments/pages/AdjustmentsPage.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@thoughtstream/ui/styles.css': path.resolve(DS_ROOT, 'src/styles.css'),
      '@thoughtstream/ui': path.resolve(DS_ROOT, 'src/index.ts'),
    },
  },
  server: {
    port: 3002,
    strictPort: false,
    host: '127.0.0.1',
  },
  preview: {
    port: 3002,
    strictPort: false,
    host: '127.0.0.1',
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
