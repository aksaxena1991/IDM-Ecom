import React, { useState } from 'react';
import {
  Button,
  Input,
  Checkbox,
  Card,
  Typography,
  Divider,
  useToast,
} from '@thoughtstream/ui';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
  KeySquare,
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export interface LoginPageProps {
  onNavigateToSignup?: () => void;
  onLoginSuccess?: (data: { email: string; rememberMe: boolean; tenantId: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onLoginSuccess,
}) => {
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('org_nectornest_prod');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleValidate = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Operator email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid operator email address');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Account security key / password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!handleValidate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        'Authentication Successful',
        `Welcome back to NectorNest IMS, ${email}`
      );
      if (onLoginSuccess) {
        onLoginSuccess({ email, rememberMe, tenantId });
      }
    }, 1200);
  };

  const handleDemoFill = () => {
    setEmail('operator@nectornest.io');
    setPassword('Passphrase2026!');
    setEmailError(null);
    setPasswordError(null);
    toast.info('Demo Credentials Loaded', 'Click "Authenticate & Enter" to proceed');
  };

  return (
    <>
      <Card variant="elevated" padding="large" className="nn-login-card">
        {/* Quick demo helper banner */}
        <div className="nn-demo-banner">
          <div className="nn-demo-banner-text">
            <KeySquare size={14} />
            <span>Demonstration environment mode</span>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={handleDemoFill}
            className="nn-demo-btn"
          >
            Auto-fill Credentials
          </Button>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <div className="nn-form-stack">
            {/* Tenant / Organization Domain */}
            <Input
              label="Organization Tenant Domain"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="e.g. org_nectornest_prod"
              leadingIcon={<Building size={16} />}
              helperText="Determines regional ledger routing"
              required
            />

            {/* Email Field */}
            <Input
              label="Operator Work Email"
              type="email"
              placeholder="operator@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              error={emailError || undefined}
              leadingIcon={<Mail size={16} />}
              autoComplete="email"
              required
            />

            {/* Password Field */}
            <Input
              label="Password / Access Key"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              error={passwordError || undefined}
              leadingIcon={<Lock size={16} />}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="nn-input-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              autoComplete="current-password"
              required
            />

            {/* Remember Me and Forgot Password Action Row */}
            <div className="nn-form-row-between">
              <Checkbox
                label="Remember node authorization for 30 days"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <button
                type="button"
                className="nn-link-button"
                onClick={() => setIsForgotModalOpen(true)}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Authenticate & Enter
            </Button>
          </div>
        </form>

        <Divider spacing="large" />

        {/* SSO & Alternative Authentications */}
        <div className="nn-secondary-auth">
          <Typography variant="caption" color="secondary" className="nn-secondary-auth-label">
            ENTERPRISE SINGLE SIGN-ON (SSO)
          </Typography>

          <div className="nn-sso-grid">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => toast.info('Okta SAML 2.0', 'Redirecting to identity provider...')}
            >
              Okta Verify
            </Button>
            <Button
              variant="secondary"
              size="medium"
              onClick={() => toast.info('Azure Entra ID', 'Redirecting to Microsoft identity...')}
            >
              Microsoft Entra
            </Button>
          </div>
        </div>

        {/* Navigation to Signup */}
        <div className="nn-card-footer-switch">
          <Typography variant="bodySmall" color="secondary">
            Need an enterprise operator account?{' '}
            <button
              type="button"
              className="nn-link-button-bold"
              onClick={onNavigateToSignup}
            >
              Create new nest account
            </button>
          </Typography>
        </div>
      </Card>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={email}
        onSuccess={(submittedEmail) => {
          toast.success(
            'Recovery Token Transmitted',
            `Reset instructions delivered to ${submittedEmail}`
          );
        }}
      />
    </>
  );
};
