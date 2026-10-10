import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Input, Typography, useToast } from '@thoughtstream/ui'
import { Eye, EyeOff } from 'lucide-react'
import { ForgotPasswordModal } from '../../../components/ForgotPasswordModal'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_TENANT_SLUG } from '../../../core/config'
import { ApiError, beginSsoLogin, continueOidcAfterSession, loginWithPassword } from '../../../core/api'

export interface LoginPageProps {
  onNavigateToSignup?: () => void
  onLoginSuccess?: (data: { email: string; rememberMe: boolean; tenantId: string }) => void
}

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
)

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignup, onLoginSuccess }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showMfa, setShowMfa] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleValidate = () => {
    let isValid = true

    if (!email.trim()) {
      setEmailError('Email is required')
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address')
      isValid = false
    } else {
      setEmailError(null)
    }

    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters')
      isValid = false
    } else {
      setPasswordError(null)
    }

    return isValid
  }

  const goToSignup = () => {
    if (onNavigateToSignup) onNavigateToSignup()
    else navigate('/register')
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!handleValidate()) return

    setIsLoading(true)
    try {
      await loginWithPassword(email.trim(), password, DEFAULT_TENANT_SLUG, mfaCode || undefined)
      toast.success('Signed in', `Welcome back, ${email.trim()}`)
      onLoginSuccess?.({
        email: email.trim(),
        rememberMe: false,
        tenantId: DEFAULT_TENANT_SLUG,
      })
      await continueOidcAfterSession()
    } catch (err) {
      const detail = err instanceof ApiError ? `${err.message} ${err.detail || ''}` : ''
      if (err instanceof ApiError && err.status === 429) {
        toast.error('Sign in failed', 'Account temporarily locked')
        return
      }
      if (err instanceof ApiError && (err.status === 401 && /mfa/i.test(detail))) {
        setShowMfa(true)
        toast.error('Sign in failed', 'MFA code required')
        return
      }
      const message = err instanceof ApiError ? err.detail || err.message : 'Invalid credentials'
      setPasswordError(message)
      toast.error('Sign in failed', message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSso = async () => {
    setIsLoading(true)
    try {
      await beginSsoLogin()
    } catch (err) {
      toast.error('Sign in failed', err instanceof Error ? err.message : 'Could not start SSO login')
      setIsLoading(false)
    }
  }

  return (
    <div className="nn-gate" data-theme="dark">
      <div className="nn-gate-scrim">
        <div
          className="nn-gate-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nn-gate-title"
        >
          <section className="nn-gate-steps" />
          <form className="nn-gate-auth" onSubmit={handleLogin} noValidate>
            <div className="nn-gate-auth-tools">
              <Button type="button" variant="secondary" size="small">
                Contact
              </Button>
            </div>

            <NestMark />

            <Typography id="nn-gate-title" variant="headline" as="h1" className="nn-gate-title">
              Sarwa Amrit - IDM
            </Typography>
            <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
              Cryptographic access to your enterprise identity workspace.
            </Typography>

            <div className="nn-gate-fields">
              <Input
                label="Email"
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (emailError) setEmailError(null)
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
                  setPassword(event.target.value)
                  if (passwordError) setPasswordError(null)
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
              {showMfa && (
                <Input
                  label="MFA One-Time Passcode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  value={mfaCode}
                  onChange={(event) => setMfaCode(event.target.value)}
                  containerClassName="nn-gate-field"
                />
              )}
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

            <Button type="submit" variant="primary" size="large" fullWidth isLoading={isLoading}>
              Login with Email
            </Button>
            <span>or</span>
            <Button type="button" variant="secondary" size="large" fullWidth onClick={handleSso} disabled={isLoading}>
              Login with SSO
            </Button>

            <Typography variant="caption" color="secondary" className="nn-gate-legal">
              By continuing, you agree to our Terms and Privacy Policy.{' '}
              <button type="button" className="nn-link-button" onClick={goToSignup}>
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
          toast.success('Recovery sent', `Reset instructions delivered to ${submittedEmail}`)
        }}
      />
    </div>
  )
}

export default LoginPage
