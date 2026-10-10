import { useEffect, useState, type FormEvent } from 'react'
import { Button, Card, Chip, Input } from '@thoughtstream/ui'
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
      setMessage(
        'Pending enrollment: scan the otpauth URI, then verify a code. The factor stays inactive until verification succeeds.',
      )
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
      setMessage('MFA active. Factor verified and admin step-up window refreshed.')
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
      <div className="toolbar" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1>Security & Cryptographic MFA</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Enroll TOTP multi-factor authenticators and manage step-up windows for privileged writes.
          </p>
        </div>
        <div>
          <Chip
            variant="status"
            tone={session?.mfa_verified_at ? 'success' : 'warning'}
          >
            {session?.mfa_verified_at ? 'MFA VERIFIED' : 'MFA PENDING'}
          </Chip>
        </div>
      </div>

      <section className="detail-grid">
        <Card variant="default" padding="medium">
          <h2>SSO Session Envelope</h2>
          {session ? (
            <dl className="detail-list">
              <div>
                <dt>Session Identifier</dt>
                <dd className="mono truncate" title={session.session_id}>{session.session_id}</dd>
              </div>
              <div>
                <dt>Idle Expiration</dt>
                <dd className="mono">{new Date(session.expires_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Absolute Expiration</dt>
                <dd className="mono">{new Date(session.absolute_expires_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt>MFA Verification Timestamp</dt>
                <dd className="mono">
                  {session.mfa_verified_at ? (
                    <Chip variant="status" tone="success">
                      {new Date(session.mfa_verified_at).toLocaleString()}
                    </Chip>
                  ) : (
                    <Chip variant="status" tone="warning">Not Verified</Chip>
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="muted">
              SSO session cookie not available in this browser context. Sign in again with email/password
              or SSO, then return here.
            </p>
          )}
        </Card>

        <Card variant="default" padding="medium">
          <h2>TOTP Authenticator Factor</h2>
          <p className="muted small" style={{ marginBottom: '1.25rem' }}>
            Flow: Enroll authenticator (pending) → verify code → factor becomes active & step-up is unlocked.
          </p>
          <div className="stack">
            <Button
              variant="secondary"
              onClick={() => void onEnroll()}
              isLoading={busy}
            >
              {enrollment ? 'Re-enroll Authenticator' : 'Enroll Authenticator'}
            </Button>

            {enrollment && (
              <div className="note-block">
                <Chip variant="status" tone="warning">PENDING VERIFICATION</Chip>
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>Base32 Secret:</strong> <span className="mono">{enrollment.secret}</span>
                </p>
                <p className="mono wrap muted small">{enrollment.otpauth_uri}</p>
              </div>
            )}

            <form className="stack" onSubmit={onVerify}>
              <Input
                label={enrollment ? 'Confirm 6-digit enrollment code' : 'Step-up / verification code'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={busy}
              >
                {enrollment ? 'Activate Factor' : 'Verify Code & Unlock'}
              </Button>
            </form>

            {message && <p className="ok">{message}</p>}
            {error && <p className="form-error">{error}</p>}
          </div>
        </Card>
      </section>
    </main>
  )
}
