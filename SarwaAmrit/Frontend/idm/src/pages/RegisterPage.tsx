import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button, Input } from '@thoughtstream/ui'
import { Eye, EyeOff } from 'lucide-react'
import { AuthGate } from '../components/AuthGate'
import { useAuth } from '../auth/AuthContext'
import { DEFAULT_TENANT_SLUG } from '../config'
import { ApiError, continueOidcAfterSession, registerUser } from '../lib/api'

export function RegisterPage() {
  const { isAuthenticated, loading } = useAuth()
  const [tenantSlug, setTenantSlug] = useState(DEFAULT_TENANT_SLUG)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      await registerUser({
        email,
        password,
        name,
        tenantSlug: tenantSlug.trim() || DEFAULT_TENANT_SLUG,
      })
      await continueOidcAfterSession()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail || err.message : 'Registration failed')
      setSubmitting(false)
    }
  }

  return (
    <AuthGate
      title="Create workspace"
      subtitle="Register with email, then initialize your secure cryptographic session."
    >
      <form className="nn-gate-fields" onSubmit={onSubmit} noValidate>
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
          label="Full Legal Name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Mercer"
          containerClassName="nn-gate-field"
        />
        <Input
          label="Corporate Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@domain.com"
          required
          containerClassName="nn-gate-field"
        />
        <Input
          label="Master Passphrase"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          required
          minLength={8}
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
        <Input
          label="Confirm Passphrase"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter passphrase"
          required
          minLength={8}
          containerClassName="nn-gate-field"
        />
        {error && <p className="form-error">{error}</p>}

        <Button type="submit" variant="primary" size="large" fullWidth isLoading={submitting}>
          {submitting ? 'Initializing account…' : 'Create account'}
        </Button>
      </form>

      <p className="nn-gate-legal muted">
        Already registered?{' '}
        <Link to="/login" className="nn-link-button">
          Sign in
        </Link>
      </p>
    </AuthGate>
  )
}
