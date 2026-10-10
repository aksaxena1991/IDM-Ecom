import React, { useState } from 'react';
import {
  Button,
  Input,
  Typography,
  useToast,
} from '@thoughtstream/ui';
import {
  Box,
  Check,
  ClipboardCheck,
  Download,
  Eye,
  EyeOff,
  Package,
  Truck,
  Warehouse,
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export interface LoginPageProps {
  onNavigateToSignup?: () => void;
  onLoginSuccess?: (data: { email: string; rememberMe: boolean; tenantId: string }) => void;
}

const NODES = [
  { id: 'hub', label: 'Fulfillment hub', icon: Warehouse },
  { id: 'fleet', label: 'Fleet lane', icon: Truck },
  { id: 'catalog', label: 'Catalog cell', icon: Package },
] as const;

const OUTCOMES = [
  { id: 'pick', label: 'Pick list', icon: Box },
  { id: 'ledger', label: 'Download ledger', icon: Download },
  { id: 'confirm', label: 'Confirmed transfer', icon: ClipboardCheck },
] as const;

const NestMark: React.FC = () => (
  <div className="nn-gate-mark" aria-hidden="true">
    <span className="nn-gate-particle nn-gate-particle--a" />
    <span className="nn-gate-particle nn-gate-particle--b" />
    <span className="nn-gate-particle nn-gate-particle--c" />
    <span className="nn-gate-particle nn-gate-particle--d" />
    <svg viewBox="0 0 64 48" className="nn-gate-mark-svg">
      <rect x="22" y="6" width="8" height="8" fill="currentColor" />
      <rect x="30" y="6" width="8" height="8" fill="currentColor" />
      <rect x="14" y="14" width="8" height="8" fill="currentColor" />
      <rect x="22" y="14" width="8" height="8" fill="var(--ts-color-success)" />
      <rect x="30" y="14" width="8" height="8" fill="currentColor" />
      <rect x="38" y="14" width="8" height="8" fill="currentColor" />
      <rect x="14" y="22" width="8" height="8" fill="currentColor" />
      <rect x="22" y="22" width="8" height="8" />
      <rect x="30" y="22" width="8" height="8" />
      <rect x="38" y="22" width="8" height="8" fill="currentColor" />
      <rect x="22" y="30" width="8" height="8" fill="currentColor" />
      <rect x="30" y="30" width="8" height="8" fill="currentColor" />
    </svg>
  </div>
);

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onLoginSuccess,
}) => {
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<(typeof NODES)[number]['id']>('fleet');

  const handleValidate = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!handleValidate()) return;

    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      toast.success('Signed in', `Welcome back, ${email}`);
      onLoginSuccess?.({
        email,
        rememberMe: false,
        tenantId: 'org_nectornest_prod',
      });
    }, 900);
  };

  return (
    <div className="nn-gate" data-theme="dark">
      <div className="nn-gate-backdrop" aria-hidden="true">
        <header className="nn-gate-topbar">
          <div className="nn-gate-topbar-mark">NN</div>
          <nav className="nn-gate-topbar-links">
            <span>App</span>
            <span>Login</span>
          </nav>
        </header>

        <div className="nn-gate-stage">
          
          <div className="nn-gate-stage-row">
            {NODES.concat(NODES).map((node, index) => {
              const Icon = node.icon;
              return (
                <div className="nn-gate-stage-tile" key={`${node.id}-${index}`}>
                  <Icon size={22} />
                </div>
              );
            })}
          </div>
        </div>

        <footer className="nn-gate-site-footer">
          <span>NectorNest</span>
          <span>Terms</span>
          <span>Privacy Policy</span>
          <span>Status</span>
        </footer>
      </div>

      <div className="nn-gate-scrim">
        <div
          className="nn-gate-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nn-gate-title"
        >
          <section className="nn-gate-steps">
            

            

            
          </section>

          <form className="nn-gate-auth" onSubmit={handleLogin} noValidate>
            <div className="nn-gate-auth-tools">
              <Button type="button" variant="secondary" size="small">
                Contact
              </Button>
              <Button type="button" variant="secondary" size="small">
                Login
              </Button>
            </div>

            <NestMark />

            <Typography id="nn-gate-title" variant="headline" as="h1" className="nn-gate-title">
              Nector Nest - IMS
            </Typography>
            <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
              Your inventory sidekick for nodes, ledgers, and fulfillment — ready whenever you are.
            </Typography>

            <div className="nn-gate-fields">
              <Input
                label="Email"
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                }}
                error={emailError || undefined}
                autoComplete="email"
                required
                containerClassName="nn-gate-field"
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                error={passwordError || undefined}
                autoComplete="current-password"
                required
                containerClassName="nn-gate-field"
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="nn-input-eye-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            <div className="nn-gate-forgot">
              <button
                type="button"
                className="nn-link-button"
                onClick={() => setIsForgotModalOpen(true)}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              isLoading={isLoading}
            >
              Sign in
            </Button>

            <Typography variant="caption" color="secondary" className="nn-gate-legal">
              By continuing, you agree to our Terms and Privacy Policy.
              {' '}
              <button type="button" className="nn-link-button" onClick={onNavigateToSignup}>
                Create a nest account
              </button>
            </Typography>
          </form>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialEmail={email}
        onSuccess={(submittedEmail) => {
          toast.success('Recovery sent', `Reset instructions delivered to ${submittedEmail}`);
        }}
      />
    </div>
  );
};
