import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button, Input } from '@thoughtstream/ui'
import { Eye, EyeOff } from 'lucide-react'
import { AuthGate } from '../components/AuthGate'
import { useAuth } from '../auth/AuthContext'
import { DEFAULT_TENANT_SLUG } from '../config'
import { ApiError, beginSsoLogin, continueOidcAfterSession, loginWithPassword } from '../lib/api'

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const [tenantSlug, setTenantSlug] = useState(DEFAULT_TENANT_SLUG)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showMfa, setShowMfa] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onPasswordLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await loginWithPassword(email, password, tenantSlug.trim() || DEFAULT_TENANT_SLUG, mfaCode || undefined)
      await continueOidcAfterSession()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && /mfa/i.test(err.message + (err.detail || ''))) {
        setShowMfa(true)
        setError('Enter your MFA code to continue.')
      } else if (err instanceof ApiError) {
        setError(err.detail || err.message)
        if (/mfa/i.test(String(err.detail))) setShowMfa(true)
      } else {
        setError(err instanceof Error ? err.message : 'Login failed')
      }
      setSubmitting(false)
    }
  }

  async function onSsoLogin() {
    setError(null)
    setSubmitting(true)
    try {
      await beginSsoLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start SSO login')
      setSubmitting(false)
    }
  }

  return (
    <AuthGate
      title="Nector Nest IDM"
      subtitle="Cryptographic access to your enterprise identity workspace."
    >
      <form className="nn-gate-fields" onSubmit={onPasswordLogin} noValidate>
        <Input
          label="Tenant Identifier"
          type="text"
          autoComplete="organization"
          value={tenantSlug}
          onChange={(e) => setTenantSlug(e.target.value)}
          placeholder="Tenant slug"
          required
          containerClassName="nn-gate-field"
        />
        <Input
          label="Corporate Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operator@domain.com"
          required
          containerClassName="nn-gate-field"
        />
        <Input
          label="Passphrase"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passphrase"
          required
          containerClassName="nn-gate-field"
          trailingIcon={
            <button
              type="button"
              className="nn-input-eye-btn"
              onClick={() => setShowPassword((current) => !current)}
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
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="6-digit code"
            containerClassName="nn-gate-field"
          />
        )}
        {error && <p className="form-error">{error}</p>}

        <Button type="submit" variant="primary" size="large" fullWidth isLoading={submitting}>
          {submitting ? 'Verifying credentials…' : 'Sign in with email'}
        </Button>
      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <Button variant="secondary" size="large" fullWidth onClick={onSsoLogin} disabled={submitting}>
        Continue with enterprise SSO
      </Button>

      <p className="nn-gate-legal muted">
        Provisioning a new workspace?{' '}
        <Link to="/register" className="nn-link-button">
          Create an account
        </Link>
      </p>
    </AuthGate>
  )
}
