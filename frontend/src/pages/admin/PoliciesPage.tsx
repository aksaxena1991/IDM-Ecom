import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type PolicyItem } from '../../lib/adminApi'

const DEFAULT_CONDITIONS = `{
  "all": [
    { "attr": "subject.department", "op": "eq", "value": "engineering" }
  ]
}`

export function PoliciesPage() {
  const { accessToken } = useAuth()
  const [policies, setPolicies] = useState<PolicyItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [effect, setEffect] = useState<'allow' | 'deny'>('allow')
  const [priority, setPriority] = useState(10)
  const [clientId, setClientId] = useState('demo-oidc-app')
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await adminApi.listPolicies(accessToken)
      setPolicies(res.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies')
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setBusy(true)
    try {
      await adminApi.createPolicy(accessToken, {
        name,
        effect,
        priority,
        enabled: true,
        actions: ['app:access'],
        resource_match: clientId ? { client_id: clientId } : {},
        conditions: JSON.parse(conditions) as Record<string, unknown>,
      })
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function toggleEnabled(policy: PolicyItem) {
    if (!accessToken) return
    try {
      await adminApi.patchPolicy(accessToken, policy.id, { enabled: !policy.enabled })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function onDelete(policy: PolicyItem) {
    if (!accessToken) return
    if (!confirm(`Delete policy “${policy.name}”?`)) return
    try {
      await adminApi.deletePolicy(accessToken, policy.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <main className="dashboard">
      <h1>Access policies</h1>
      <p className="lede">
        PBAC rules evaluated on <code>app:access</code> with deny-overrides. Conditions use subject,
        resource, and environment attributes.
      </p>
      {error && <p className="form-error">{error}</p>}

      <section className="detail-grid">
        <div>
          <h2>Policies</h2>
          <ul className="list">
            {policies.map((p) => (
              <li key={p.id}>
                <div className="list-row">
                  <div>
                    <strong>
                      {p.name}{' '}
                      <span className={`badge ${p.effect === 'deny' ? 'badge-danger' : ''}`}>
                        {p.effect}
                      </span>
                    </strong>
                    <div className="muted small">
                      priority {p.priority} · {p.enabled ? 'enabled' : 'disabled'}
                    </div>
                    <pre className="tiny-pre">{JSON.stringify(p.conditions, null, 2)}</pre>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn btn-ghost" onClick={() => void toggleEnabled(p)}>
                      {p.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => void onDelete(p)}>
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Create policy</h2>
          <form className="stack" onSubmit={onCreate}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Effect
              <select value={effect} onChange={(e) => setEffect(e.target.value as 'allow' | 'deny')}>
                <option value="allow">allow</option>
                <option value="deny">deny</option>
              </select>
            </label>
            <label>
              Priority
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                min={0}
              />
            </label>
            <label>
              Resource client_id (optional)
              <input value={clientId} onChange={(e) => setClientId(e.target.value)} />
            </label>
            <label>
              Conditions JSON
              <textarea
                className="code-area"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={8}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Create policy
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
