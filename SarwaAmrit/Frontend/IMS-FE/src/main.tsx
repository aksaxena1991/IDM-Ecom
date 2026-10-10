import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, ToastProvider } from '@thoughtstream/ui';

import '@thoughtstream/ui/styles.css';
import './core/styles/auth.css';

import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="nectornest-theme">
      <ToastProvider placement="top-right" defaultDuration={4000}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
