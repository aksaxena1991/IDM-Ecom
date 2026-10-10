import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Typography } from '@thoughtstream/ui'
import { AuthGate } from '../../../components/AuthGate'
import { useAuth } from '../context/AuthContext'

export function CallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { completeOidcCallback, isAuthenticated, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
      return
    }
    const oauthError = params.get('error')
    if (oauthError) {
      setError(params.get('error_description') || 'Access was denied by policy.')
      return
    }
    const code = params.get('code')
    const state = params.get('state')
    if (!code || !state) {
      setError('Missing authorization code. Please sign in again.')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        await completeOidcCallback(code, state)
        if (!cancelled) navigate('/dashboard', { replace: true })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Sign-in failed')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params, completeOidcCallback, navigate, isAuthenticated])

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  if (error) {
    return (
      <AuthGate title="Authentication denied" subtitle="The identity provider rejected this session.">
        <p className="form-error">{error}</p>
        <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
          <Button variant="primary" size="large" fullWidth>
            Return to login gate
          </Button>
        </Link>
      </AuthGate>
    )
  }

  return (
    <AuthGate title="Sarwa Amrit IDM" subtitle="Exchanging authorization tokens and establishing a secure session.">
      <Typography variant="caption" color="secondary" className="mono" style={{ textAlign: 'center' }}>
        Completing OIDC handshake…
      </Typography>
    </AuthGate>
  )
}
