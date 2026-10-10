import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/AuthLayout';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { ThemeProvider } from '@thoughtstream/ui';
export const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider defaultTheme="light">
      <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onNavigateToSignup={() => navigate('/signup')}
            onLoginSuccess={(data) => {
              console.log('[nn-base] Authenticated operator:', data);
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

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </ThemeProvider>
    
  );
};

export default App;
