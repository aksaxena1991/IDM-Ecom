import { FormEvent, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError, beginSsoLogin, continueOidcAfterSession, loginWithPassword } from '../lib/api'

export function LoginPage() {
  const { isAuthenticated, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
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
      await loginWithPassword(email, password, 'demo', mfaCode || undefined)
      // Session cookie is on the SSO host; continue OIDC to get SPA tokens.
      await continueOidcAfterSession()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && /mfa/i.test(err.message + (err.detail || ''))) {
        setShowMfa(true)
        setError('Enter your MFA code to continue.')
      } else if (err instanceof ApiError) {
        // login/json returns mfa_required as JSON 401 with body
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
    <div className="auth-shell">
      <div className="auth-panel">
        <p className="brand">SSO Portal</p>
        <h1>Sign in</h1>
        <p className="lede">Access your workspace with SSO or email and password.</p>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onSsoLogin}
          disabled={submitting}
        >
          Continue with SSO
        </button>

        <div className="divider">
          <span>or use email</span>
        </div>

        <form className="stack" onSubmit={onPasswordLogin}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {showMfa && (
            <label>
              MFA code
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
              />
            </label>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-secondary btn-block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in with email'}
          </button>
        </form>

        <p className="footer-note">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
