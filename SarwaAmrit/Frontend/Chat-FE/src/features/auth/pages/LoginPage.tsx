import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, Input, Select, Typography, useToast } from '@thoughtstream/ui'
import { Eye, EyeOff } from 'lucide-react'
import { beginSsoLogin, continueOidcAfterSession, loginWithPassword } from '../../../core/api'
import { ApiError } from '../../../core/problemDetails'
import { CHAT_PROFILES, DEFAULT_TENANT_SLUG } from '../../../core/config'
import { persistProfileSlug } from '../../../core/chatProfile'
import { useAuth } from '../context/AuthContext'
import { AuthGate } from '../../../components/AuthGate'

export function LoginPage() {
  const { toast } = useToast()
  const { isAuthenticated, loading } = useAuth()

  const [profileSlug, setProfileSlug] = useState(CHAT_PROFILES[0]!.slug)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showMfa, setShowMfa] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  const validate = () => {
    let ok = true
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email')
      ok = false
    } else setEmailError(null)
    if (!password || password.length < 6) {
      setPasswordError('Password is required')
      ok = false
    } else setPasswordError(null)
    return ok
  }

  const startAuth = () => {
    persistProfileSlug(profileSlug)
  }

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    startAuth()
    setBusy(true)
    try {
      await loginWithPassword(email.trim(), password, DEFAULT_TENANT_SLUG, mfaCode || undefined)
      toast.success('Signed in', 'Completing OIDC token exchange…')
      await continueOidcAfterSession()
    } catch (err) {
      const detail = err instanceof ApiError ? `${err.message} ${err.detail || ''}` : ''
      if (err instanceof ApiError && err.status === 401 && /mfa/i.test(detail)) {
        setShowMfa(true)
        toast.error('MFA required', 'Enter your authenticator code')
        return
      }
      const message = err instanceof ApiError ? err.detail || err.message : 'Sign-in failed'
      setPasswordError(message)
      toast.error('Sign-in failed', message)
    } finally {
      setBusy(false)
    }
  }

  const handleSso = async () => {
    startAuth()
    setBusy(true)
    try {
      await beginSsoLogin()
    } catch (err) {
      toast.error('SSO failed', err instanceof Error ? err.message : 'Could not start login')
      setBusy(false)
    }
  }

  return (
    <AuthGate
      title="AI Assistant"
      subtitle="Sign in with Sarwa Amrit SSO. Your token is scoped to the assistant you select."
    >
      <form className="chat-login-form" onSubmit={handlePasswordLogin} noValidate>
        <Select
          label="Assistant"
          options={CHAT_PROFILES.map((p) => ({ value: p.slug, label: p.label }))}
          value={profileSlug}
          onChange={setProfileSlug}
          helperText="OIDC client must match this application (IDM or IMS token)."
        />

        <Input
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError(null)
          }}
          error={emailError || undefined}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError(null)
          }}
          error={passwordError || undefined}
          trailingIcon={
            <button
              type="button"
              className="chat-icon-btn"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        {showMfa ? (
          <Input
            label="MFA code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
          />
        ) : null}

        <Button type="submit" variant="primary" size="large" fullWidth disabled={busy}>
          Sign in with password
        </Button>

        <Typography variant="caption" color="secondary" className="chat-login-divider">
          or
        </Typography>

        <Button type="button" variant="secondary" size="large" fullWidth disabled={busy} onClick={handleSso}>
          Continue with SSO (PKCE)
        </Button>
      </form>
    </AuthGate>
  )
}
