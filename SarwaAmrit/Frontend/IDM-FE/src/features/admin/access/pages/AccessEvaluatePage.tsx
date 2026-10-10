import { useEffect, useState, type FormEvent } from 'react'
import { Button, Card, Chip, Select, Skeleton } from '@thoughtstream/ui'
import { useAuth } from '../../../auth/context/AuthContext'
import { adminApi, type AppItem, type EvaluateResult, type UserItem } from '../../../../core/adminApi'

export function AccessEvaluatePage() {
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [apps, setApps] = useState<AppItem[]>([])
  const [userId, setUserId] = useState('')
  const [clientId, setClientId] = useState('')
  const [result, setResult] = useState<EvaluateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      setReady(true)
      return
    }
    void (async () => {
      try {
        const [u, a] = await Promise.all([
          adminApi.listUsers(accessToken),
          adminApi.listApps(accessToken),
        ])
        setUsers(u.items)
        setApps(a.items)
        setUserId((prev) => prev || u.items[0]?.id || '')
        const demo = a.items.find((x) => x.client_id === 'idm-oidc-app')
        setClientId((prev) => prev || demo?.client_id || a.items[0]?.client_id || '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load catalogs')
      } finally {
        setReady(true)
      }
    })()
  }, [accessToken])

  async function onEvaluate(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setBusy(true)
    setError(null)
    try {
      const res = await adminApi.evaluateAccess(accessToken, {
        user_id: userId,
        client_id: clientId,
        action: 'app:access',
      })
      setResult(res)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'Evaluate failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="dashboard">
      <h1>Access Policy Simulator</h1>
      <p className="lede">
        Dry-run real-time policy arbitration (RBAC + ABAC + PBAC) for any subject against a target client application.
      </p>
      {error && <p className="form-error">{error}</p>}

      {!ready ? (
        <div className="narrow-form" role="status" aria-label="Loading" style={{ display: 'grid', gap: '1rem' }}>
          <Skeleton variant="text" width="42%" />
          <Skeleton variant="rectangular" height={44} />
          <Skeleton variant="text" width="56%" />
          <Skeleton variant="rectangular" height={44} />
        </div>
      ) : (
      <form className="stack narrow-form" onSubmit={onEvaluate}>
        <Select
          label="Subject user principal"
          value={userId}
          onChange={setUserId}
          required
          searchable
          options={users.map((u) => ({
            value: u.id,
            label: `${u.email} (${u.name || 'Unnamed'})`,
          }))}
        />
        <Select
          label="Target application client ID"
          value={clientId}
          onChange={setClientId}
          required
          searchable
          options={apps.map((a) => ({
            value: a.client_id,
            label: `${a.name} — ${a.client_id} (${a.protocol.toUpperCase()})`,
          }))}
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={busy}
          disabled={!userId || !clientId}
        >
          {busy ? 'Simulating Policy Engine…' : 'Evaluate Access Decision'}
        </Button>
      </form>
      )}

      {result && (
        <section className="result-panel">
          <Card variant="default" padding="medium">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2>Arbitration Decision</h2>
              <Chip
                variant="status"
                tone={result.allowed ? 'success' : 'error'}
              >
                {result.allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
              </Chip>
            </div>

            <p style={{ marginBottom: '1.25rem', color: result.allowed ? 'var(--ts-color-success)' : 'var(--ts-color-error)', fontWeight: 600 }}>
              {result.message}
            </p>

            <dl className="detail-list">
              <div>
                <dt>Evaluation Reason</dt>
                <dd className="mono">{result.reason}</dd>
              </div>
              <div>
                <dt>Matched Policy Rules</dt>
                <dd>
                  {result.matched_policies?.length ? (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {result.matched_policies.map((p) => (
                        <Chip key={p} variant="status" tone="info">{p}</Chip>
                      ))}
                    </div>
                  ) : (
                    <span className="muted">Default tenant rule applied</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>
        </section>
      )}
    </main>
  )
}
