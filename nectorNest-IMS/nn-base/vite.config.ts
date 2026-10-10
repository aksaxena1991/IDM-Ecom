import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'nn_base',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
        './LoginPage': './src/components/LoginPage.tsx',
        './SignupPage': './src/components/SignupPage.tsx',
        './ForgotPasswordModal': './src/components/ForgotPasswordModal.tsx',
        './AuthLayout': './src/components/AuthLayout.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@thoughtstream/ui/styles.css': path.resolve(__dirname, '../Thought-Stream-Design-System/src/styles.css'),
      '@thoughtstream/ui': path.resolve(__dirname, '../Thought-Stream-Design-System/src/index.ts'),
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
