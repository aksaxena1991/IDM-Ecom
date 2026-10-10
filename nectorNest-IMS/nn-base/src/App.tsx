import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/AuthLayout';
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
          <AuthLayout
            title="Initialize Nest Workspace"
            subtitle="Provision multi-region inventory ledger and operator keys"
            asideHeadline="Architectural Sovereignty for Global Supply Chains"
            asideDescription="Connect inventory hives, define cryptographic custody transfers, and deploy autonomous replenishment workers across distributed edge facilities."
            activeTab="signup"
            onNavigate={(path) => navigate(path)}
          >
            <SignupPage
              onNavigateToLogin={() => navigate('/login')}
              onSignupSuccess={(data) => {
                console.log('[nn-base] Workspace initialized:', data);
                // Optionally navigate to login after 2 seconds
                setTimeout(() => navigate('/login'), 2200);
              }}
            />
          </AuthLayout>
        }
      />

      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
