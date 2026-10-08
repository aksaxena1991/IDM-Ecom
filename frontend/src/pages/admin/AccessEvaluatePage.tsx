import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type AppItem, type EvaluateResult, type UserItem } from '../../lib/adminApi'

export function AccessEvaluatePage() {
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [apps, setApps] = useState<AppItem[]>([])
  const [userId, setUserId] = useState('')
  const [clientId, setClientId] = useState('demo-oidc-app')
  const [result, setResult] = useState<EvaluateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    const [u, a] = await Promise.all([
      adminApi.listUsers(accessToken),
      adminApi.listApps(accessToken),
    ])
    setUsers(u.items)
    setApps(a.items)
    if (!userId && u.items[0]) setUserId(u.items[0].id)
    if (a.items[0] && clientId === 'demo-oidc-app') {
      const demo = a.items.find((x) => x.client_id === 'demo-oidc-app')
      setClientId(demo?.client_id || a.items[0].client_id)
    }
  }, [accessToken, userId, clientId])

  useEffect(() => {
    void load().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Failed to load catalogs'),
    )
  }, [load])

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
      <h1>Access evaluate</h1>
      <p className="lede">Dry-run the ABAC/PBAC decision for a user against an application.</p>
      {error && <p className="form-error">{error}</p>}

      <form className="stack narrow-form" onSubmit={onEvaluate}>
        <label>
          User
          <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </label>
        <label>
          Application client_id
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} required>
            {apps.map((a) => (
              <option key={a.id} value={a.client_id}>
                {a.name} ({a.client_id})
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Evaluating…' : 'Evaluate app:access'}
        </button>
      </form>

      {result && (
        <section className="result-panel">
          <h2>Decision</h2>
          <p className={result.allowed ? 'ok' : 'form-error'}>
            {result.allowed ? 'ALLOWED' : 'DENIED'} — {result.message}
          </p>
          <dl className="detail-list">
            <div>
              <dt>Reason</dt>
              <dd className="mono">{result.reason}</dd>
            </div>
            <div>
              <dt>Matched policies</dt>
              <dd>
                {result.matched_policies?.length
                  ? result.matched_policies.join(', ')
                  : 'None'}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </main>
  )
}
