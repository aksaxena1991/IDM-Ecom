import { useEffect, useState, type FormEvent } from 'react'
import { enrollTotp, fetchSessionMe, verifyTotp, type SessionMe } from '../lib/api'

export function SecurityPage() {
  const [session, setSession] = useState<SessionMe | null>(null)
  const [enrollment, setEnrollment] = useState<{ secret: string; otpauth_uri: string } | null>(null)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function refreshSession() {
    try {
      setSession(await fetchSessionMe())
    } catch {
      setSession(null)
    }
  }

  useEffect(() => {
    void refreshSession()
  }, [])

  async function onEnroll() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const result = await enrollTotp()
      setEnrollment({ secret: result.secret, otpauth_uri: result.otpauth_uri })
      setMessage('Scan the otpauth URI in your authenticator, then verify a code below.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed')
    } finally {
      setBusy(false)
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await verifyTotp(code.trim())
      setMessage('MFA verified. Admin step-up window refreshed.')
      setCode('')
      setEnrollment(null)
      await refreshSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="dashboard">
      <h1>Security</h1>
      <p className="lede">Enroll TOTP MFA and refresh step-up for admin writes.</p>

      <section className="detail-grid">
        <div>
          <h2>Session</h2>
          {session ? (
            <dl className="detail-list">
              <div>
                <dt>Session id</dt>
                <dd className="mono truncate">{session.session_id}</dd>
              </div>
              <div>
                <dt>Idle expiry</dt>
                <dd>{new Date(session.expires_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Absolute expiry</dt>
                <dd>{new Date(session.absolute_expires_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt>MFA verified</dt>
                <dd>
                  {session.mfa_verified_at
                    ? new Date(session.mfa_verified_at).toLocaleString()
                    : 'Not verified'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="muted">
              SSO session cookie not available in this browser context. Sign in again with email/password
              or SSO, then return here.
            </p>
          )}
        </div>

        <div>
          <h2>TOTP MFA</h2>
          <div className="stack">
            <button type="button" className="btn btn-secondary" onClick={() => void onEnroll()} disabled={busy}>
              Enroll authenticator
            </button>
            {enrollment && (
              <div className="note-block">
                <p>
                  <strong>Secret:</strong> <span className="mono">{enrollment.secret}</span>
                </p>
                <p className="mono wrap">{enrollment.otpauth_uri}</p>
              </div>
            )}
            <form className="stack" onSubmit={onVerify}>
              <label>
                Verification / step-up code
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </label>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Verify code
              </button>
            </form>
            {message && <p className="ok">{message}</p>}
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      </section>
    </main>
  )
}
