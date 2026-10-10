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
  User,
  Building,
  Shield,
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export interface SignupPageProps {
  onNavigateToLogin?: () => void;
  onSignupSuccess?: (data: {
    fullName: string;
    email: string;
    organization: string;
    role: string;
  }) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateToLogin,
  onSignupSuccess,
}) => {
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Errors
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    let valid = true;

    if (!fullName.trim()) {
      setFullNameError('Operator name is required');
      valid = false;
    } else {
      setFullNameError(null);
    }

    if (!email.trim()) {
      setEmailError('Corporate email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid corporate email');
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!organization.trim()) {
      setOrgError('Organization / Workspace identifier is required');
      valid = false;
    } else {
      setOrgError(null);
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    } else {
      setConfirmError(null);
    }

    if (!agreeTerms) {
      setTermsError('You must agree to the Master Service Agreement');
      valid = false;
    } else {
      setTermsError(null);
    }

    return valid;
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        'Workspace Provisioned',
        `Welcome to NectorNest IMS, ${fullName}. Verification email sent to ${email}`
      );
      if (onSignupSuccess) {
        onSignupSuccess({
          fullName,
          email,
          organization,
          role: 'Lead Operator',
        });
      }
    }, 1400);
  };

  return (
    <>
      <Card variant="elevated" padding="large" className="nn-signup-card">
        <form onSubmit={handleSignup} noValidate>
          <div className="nn-form-stack">
            {/* Full Name */}
            <Input
              label="Full Legal Name"
              placeholder="e.g. Eleanor Vance"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (fullNameError) setFullNameError(null);
              }}
              error={fullNameError || undefined}
              leadingIcon={<User size={16} />}
              required
            />

            {/* Corporate Email */}
            <Input
              label="Enterprise Work Email"
              type="email"
              placeholder="operator@acmewarehouse.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              error={emailError || undefined}
              leadingIcon={<Mail size={16} />}
              helperText="Must match your corporate domain"
              required
            />

            {/* Organization Name */}
            <Input
              label="Organization / Node Name"
              placeholder="e.g. Acme Logistics Global"
              value={organization}
              onChange={(e) => {
                setOrganization(e.target.value);
                if (orgError) setOrgError(null);
              }}
              error={orgError || undefined}
              leadingIcon={<Building size={16} />}
              required
            />

            {/* Password */}
            <div>
              <Input
                label="Secure Passphrase"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 alphanumeric characters"
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
                required
              />

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="nn-password-strength-container">
                  <div className="nn-strength-bars">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`nn-strength-bar ${
                          strength >= step
                            ? strength <= 2
                              ? 'nn-bar--weak'
                              : strength === 3
                              ? 'nn-bar--fair'
                              : 'nn-bar--strong'
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className="nn-strength-text">
                    {strength <= 1 && 'Weak: add capital letters & symbols'}
                    {strength === 2 && 'Fair: add numbers & symbols'}
                    {strength === 3 && 'Good passphrase'}
                    {strength >= 4 && 'Strong cryptographic key'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Passphrase"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your passphrase"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(null);
              }}
              error={confirmError || undefined}
              leadingIcon={<Shield size={16} />}
              required
            />

            {/* Terms Checkbox */}
            <div>
              <Checkbox
                label={
                  <span>
                    I accept the{' '}
                    <a
                      href="#terms"
                      onClick={(e) => {
                        e.preventDefault();
                        toast.info(
                          'Terms of Service',
                          'Standard Enterprise SLA v3.4 under ThoughtStream principles.'
                        );
                      }}
                      className="nn-inline-link"
                    >
                      Master Subscription Agreement
                    </a>{' '}
                    and Data Security Covenant.
                  </span>
                }
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (termsError) setTermsError(null);
                }}
              />
              {termsError && (
                <span className="ts-input-helper ts-input-helper--error" style={{ display: 'block', marginTop: '6px' }}>
                  {termsError}
                </span>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Initialize Nest Workspace
            </Button>
          </div>
        </form>

        <Divider spacing="large" />

        {/* Card Footer: Back to Login & Forgot Password */}
        <div className="nn-signup-footer">
          <Typography variant="bodySmall" color="secondary">
            Already have an active operator account?{' '}
            <button
              type="button"
              className="nn-link-button-bold"
              onClick={onNavigateToLogin}
            >
              Sign in to node
            </button>
          </Typography>

          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              className="nn-link-button"
              onClick={() => setIsForgotModalOpen(true)}
            >
              Lost access to existing nest? Reset password
            </button>
          </div>
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
