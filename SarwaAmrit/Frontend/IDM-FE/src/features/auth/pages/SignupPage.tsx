import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Checkbox, Input, Typography, useToast } from '@thoughtstream/ui'
import { Building, Eye, EyeOff, Lock, Mail, Shield, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_TENANT_SLUG } from '../../../core/config'
import { ApiError, continueOidcAfterSession, registerUser } from '../../../core/api'

export interface SignupPageProps {
  onNavigateToLogin?: () => void
  onSignupSuccess?: (data: {
    fullName: string
    email: string
    organization: string
    role: string
  }) => void
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

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin, onSignupSuccess }) => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState(DEFAULT_TENANT_SLUG)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [fullNameError, setFullNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [orgError, setOrgError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [termsError, setTermsError] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = getPasswordStrength(password)

  const validate = () => {
    let valid = true

    if (!fullName.trim()) {
      setFullNameError('Operator name is required')
      valid = false
    } else {
      setFullNameError(null)
    }

    if (!email.trim()) {
      setEmailError('Corporate email is required')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid corporate email')
      valid = false
    } else {
      setEmailError(null)
    }

    if (!organization.trim()) {
      setOrgError('Organization identifier is required')
      valid = false
    } else {
      setOrgError(null)
    }

    if (!password) {
      setPasswordError('Password is required')
      valid = false
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      valid = false
    } else {
      setPasswordError(null)
    }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match')
      valid = false
    } else {
      setConfirmError(null)
    }

    if (!agreeTerms) {
      setTermsError('You must accept the MSA Covenant')
      valid = false
    } else {
      setTermsError(null)
    }

    return valid
  }

  const goToLogin = () => {
    if (onNavigateToLogin) onNavigateToLogin()
    else navigate('/login')
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await registerUser({
        email: email.trim(),
        password,
        name: fullName.trim(),
        tenantSlug: organization.trim() || DEFAULT_TENANT_SLUG,
      })
      toast.success('Workspace provisioned', `Welcome to Nector Nest IDM, ${fullName}.`)
      onSignupSuccess?.({
        fullName,
        email,
        organization,
        role: 'user',
      })
      await continueOidcAfterSession()
    } catch (err) {
      const message = err instanceof ApiError ? err.detail || err.message : 'Registration failed'
      setEmailError(message)
      toast.error('Signup failed', message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="nn-gate thoughtstream-theme-dark" data-theme="dark">
      <div className="nn-gate-backdrop" aria-hidden="true">
        <header className="nn-gate-topbar">
          <div className="nn-gate-topbar-mark">NN</div>
          <nav className="nn-gate-topbar-links" aria-label="Support">
            <span>Docs</span>
            <span>Support</span>
            <span>Status</span>
          </nav>
        </header>

        <section className="nn-gate-stage" aria-hidden="true">
          <div className="nn-gate-stage-head">
            <span>Identity Engine</span>
            <span className="nn-gate-view-all">Multi-Tenant Directory</span>
          </div>
          <div className="nn-gate-stage-row">
            {['OIDC', 'SAML', 'RBAC', 'ABAC', 'PBAC', 'MFA', 'SCIM'].map((tag) => (
              <div key={tag} className="nn-gate-stage-tile">
                <span>{tag}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="nn-gate-site-footer" aria-hidden="true">
          <span>Overview</span>
          <span>Security</span>
          <span>Ecosystem</span>
          <span>Legal Treatise</span>
        </footer>
      </div>

      <div className="nn-gate-scrim">
        <div className="nn-gate-modal nn-gate-modal--signup" role="dialog" aria-labelledby="nn-signup-title">
          <div className="nn-gate-auth nn-gate-auth--signup">
            <NestMark />

            <Typography id="nn-signup-title" variant="headline" as="h1" className="nn-gate-title">
              Initialize Nest Workspace
            </Typography>
            <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
              Register with email, then initialize your secure cryptographic session.
            </Typography>

            <form onSubmit={handleSignup} noValidate style={{ width: '100%' }}>
              <div className="nn-gate-fields nn-gate-fields--signup">
                <Input
                  label="Operator Full Name"
                  placeholder="Eleanor Vance"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (fullNameError) setFullNameError(null)
                  }}
                  error={fullNameError || undefined}
                  leadingIcon={<User size={15} />}
                  required
                  containerClassName="nn-gate-field"
                />

                <Input
                  label="Enterprise Work Email"
                  type="email"
                  placeholder="operator@acmewarehouse.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  error={emailError || undefined}
                  leadingIcon={<Mail size={15} />}
                  required
                  containerClassName="nn-gate-field"
                />

                <Input
                  label="Organization / Tenant"
                  placeholder={DEFAULT_TENANT_SLUG}
                  value={organization}
                  onChange={(e) => {
                    setOrganization(e.target.value)
                    if (orgError) setOrgError(null)
                  }}
                  error={orgError || undefined}
                  leadingIcon={<Building size={15} />}
                  required
                  containerClassName="nn-gate-field"
                />

                <div>
                  <Input
                    label="Master Passphrase"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) setPasswordError(null)
                    }}
                    error={passwordError || undefined}
                    leadingIcon={<Lock size={15} />}
                    trailingIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="nn-input-eye-btn"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                    required
                    containerClassName="nn-gate-field"
                  />

                  {password.length > 0 && (
                    <div className="nn-password-strength-container" style={{ marginTop: 4 }}>
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
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm Passphrase"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter passphrase"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (confirmError) setConfirmError(null)
                  }}
                  error={confirmError || undefined}
                  leadingIcon={<Shield size={15} />}
                  required
                  containerClassName="nn-gate-field"
                />
              </div>

              <div style={{ margin: '14px 0 16px' }}>
                <Checkbox
                  label={
                    <span style={{ fontSize: '0.8125rem' }}>
                      I accept the <span style={{ textDecoration: 'underline' }}>Master Subscription Agreement</span>{' '}
                      and Data Security Covenant.
                    </span>
                  }
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked)
                    if (termsError) setTermsError(null)
                  }}
                />
                {termsError && (
                  <span className="ts-input-helper ts-input-helper--error" style={{ display: 'block', marginTop: '4px' }}>
                    {termsError}
                  </span>
                )}
              </div>

              <Button type="submit" variant="primary" size="large" fullWidth isLoading={isLoading}>
                Initialize Workspace
              </Button>

              <Typography variant="caption" color="secondary" className="nn-gate-legal" style={{ marginTop: 16 }}>
                Already have an active operator account?{' '}
                <button type="button" className="nn-link-button" onClick={goToLogin}>
                  Sign in to node
                </button>
              </Typography>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
