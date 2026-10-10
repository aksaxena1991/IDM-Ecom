import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

const DS_ROOT = path.resolve(__dirname, '../DesignSystem/thoughtstream-ui');

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'nn_base',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './LoginPage': './src/features/auth/pages/LoginPage.tsx',
        './SignupPage': './src/features/auth/pages/SignupPage.tsx',
        './ForgotPasswordModal': './src/components/ForgotPasswordModal.tsx',
        './AuthLayout': './src/components/AuthLayout.tsx',
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
    port: 3001,
    strictPort: false,
    host: '127.0.0.1',
  },
  preview: {
    port: 3001,
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
