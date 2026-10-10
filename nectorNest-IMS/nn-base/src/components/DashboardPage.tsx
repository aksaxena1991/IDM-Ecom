import React from 'react';
import { Navigate } from 'react-router-dom';

export const SESSION_KEY = 'nn-base-session';

export const DashboardPage: React.FC = () => {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    return <Navigate to="/login" replace />;
  }

  return <main className="nn-dashboard" aria-label="Dashboard" />;
};
