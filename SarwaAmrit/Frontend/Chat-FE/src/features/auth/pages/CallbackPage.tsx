import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Typography } from '@thoughtstream/ui'
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  persistOidcSession,
} from '../../../core/api'
import { getActiveApplicationSlug } from '../../../core/chatProfile'
import { SESSION_KEY, sessionFromUserInfo, writeSession } from '../../../core/session'

export const CallbackPage: React.FC = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      navigate('/chat', { replace: true })
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
        const tokens = await exchangeCodeForTokens(code, state)
        const user = await fetchUserInfo(tokens.access_token)
        persistOidcSession(tokens)
        const applicationSlug = getActiveApplicationSlug()
        writeSession(sessionFromUserInfo(user, applicationSlug))
        if (!cancelled) navigate('/chat', { replace: true })
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Sign-in failed'
          if (message === 'Failed to fetch') {
            setError(
              'Could not reach SSO (network/CORS). Ensure SSO runs on port 8000 and restart Chat FE after pulling latest changes.',
            )
          } else {
            setError(message)
          }
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [params, navigate])

  return (
    <div className="nn-gate" data-theme="dark">
      <div className="nn-gate-scrim">
        <div className="nn-gate-modal" role="status" aria-live="polite">
          <form className="nn-gate-auth" onSubmit={(event) => event.preventDefault()}>
            <Typography variant="headline" as="h1" className="nn-gate-title">
              Sarwa Amrit — AI Assistant
            </Typography>
            {error ? (
              <>
                <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
                  The identity provider rejected this session.
                </Typography>
                <p className="form-error">{error}</p>
                <Link to="/login" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button variant="primary" size="large" fullWidth>
                    Return to login
                  </Button>
                </Link>
              </>
            ) : (
              <Typography variant="bodySmall" color="secondary" className="nn-gate-subtitle">
                Completing SSO sign-in…
              </Typography>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
