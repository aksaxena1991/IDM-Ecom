import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { DashboardPage, SESSION_KEY } from './components/DashboardPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';

export const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onNavigateToSignup={() => navigate('/signup')}
            onLoginSuccess={(data) => {
              sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: data.email }));
              navigate('/dashboard', { replace: true });
            }}
          />
        }
      />

      <Route
        path="/signup"
        element={
          <SignupPage
            onNavigateToLogin={() => navigate('/login')}
            onSignupSuccess={(data) => {
              sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({ email: data.email, org: data.organization })
              );
              navigate('/dashboard', { replace: true });
            }}
          />
        }
      />

      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/:tab" element={<DashboardPage />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
