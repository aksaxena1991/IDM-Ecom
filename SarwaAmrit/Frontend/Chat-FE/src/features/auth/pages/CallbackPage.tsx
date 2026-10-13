import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Loader, Typography } from '@thoughtstream/ui'
import { AuthGate } from '../../../components/AuthGate'
import { useAuth } from '../context/AuthContext'

export function CallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { completeOidcCallback, isAuthenticated, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true })
      return
    }
    const oauthError = params.get('error')
    if (oauthError) {
      setError(params.get('error_description') || 'Access denied by policy.')
      return
    }
    const code = params.get('code')
    const state = params.get('state')
    if (!code || !state) {
      setError('Missing authorization code.')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        await completeOidcCallback(code, state)
        if (!cancelled) navigate('/chat', { replace: true })
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Sign-in failed')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params, completeOidcCallback, navigate, isAuthenticated])

  if (!loading && isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  if (error) {
    return (
      <AuthGate title="Sign-in failed" subtitle={error}>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="large" fullWidth>
            Back to login
          </Button>
        </Link>
      </AuthGate>
    )
  }

  return (
    <AuthGate title="Completing sign-in" subtitle="Exchanging authorization code with SSO…">
      <Loader size="md" label="OIDC handshake" centered />
      <Typography variant="caption" color="secondary" style={{ marginTop: '1rem', textAlign: 'center' }}>
        Please wait
      </Typography>
    </AuthGate>
  )
}
