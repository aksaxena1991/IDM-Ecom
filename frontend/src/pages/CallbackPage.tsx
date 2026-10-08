import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function CallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { completeOidcCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [params, completeOidcCallback, navigate])

  if (error) {
    return (
      <div className="page-center">
        <div className="auth-panel narrow">
          <p className="brand">SSO Portal</p>
          <h1>Sign-in problem</h1>
          <p className="form-error">{error}</p>
          <Link className="btn btn-primary" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-center">
      <p className="muted">Completing secure sign-in…</p>
    </div>
  )
}
