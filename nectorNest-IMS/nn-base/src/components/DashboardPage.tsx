import React from 'react';
import { Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@thoughtstream/ui';

export const SESSION_KEY = 'nn-base-session';

const DashboardView: React.FC = () => {
  const { resolvedTheme } = useTheme();

  return (
    <main
      className={`nn-dashboard thoughtstream-theme-${resolvedTheme}`}
      data-theme={resolvedTheme}
      aria-label="Dashboard"
    />
  );
};

export const DashboardPage: React.FC = () => {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="nectornest-theme">
      <DashboardView />
    </ThemeProvider>
  );
};
