import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button, Card, Chip, Input, Select } from '@thoughtstream/ui'
import { useAuth } from '../../../auth/context/AuthContext'
import { adminApi, type PolicyItem } from '../../../../core/adminApi'

const DEFAULT_CONDITIONS = `{
  "any": [
    { "attr": "subject.roles", "op": "contains", "value": "app_operator" },
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
      <h1>PBAC Policy Rules</h1>
      <p className="lede">
        Policy-Based Access Control engine evaluated on <code>app:access</code> with deny-overrides semantics.
        Arbitrates across RBAC claims, ABAC attributes, and environmental variables.
      </p>
      {error && <p className="form-error">{error}</p>}

      <section className="detail-grid">
        <Card variant="default" padding="medium">
          <h2>Active Policies ({policies.length})</h2>
          <ul className="list">
            {policies.map((p) => (
              <li key={p.id}>
                <div className="list-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{p.name}</strong>
                      <Chip
                        variant="status"
                        tone={p.effect === 'deny' ? 'error' : 'success'}
                      >
                        {p.effect.toUpperCase()}
                      </Chip>
                    </div>
                    <div className="btn-row">
                      <Button variant="ghost" size="small" onClick={() => void toggleEnabled(p)}>
                        {p.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => void onDelete(p)}>
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="muted small mono" style={{ marginTop: '0.4rem' }}>
                    Priority: {p.priority} · Status: {p.enabled ? 'Active / Evaluating' : 'Disabled'}
                  </div>

                  <pre className="tiny-pre">{JSON.stringify(p.conditions, null, 2)}</pre>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="default" padding="medium">
          <h2>Author New Policy</h2>
          <form className="stack" onSubmit={onCreate}>
            <Input
              label="Policy name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. require_engineering_role"
              required
            />
            <Select
              label="Evaluation effect"
              value={effect}
              onChange={(value) => setEffect(value as 'allow' | 'deny')}
              options={[
                { value: 'allow', label: 'ALLOW (Permit action)' },
                { value: 'deny', label: 'DENY (Override and reject)' },
              ]}
              required
            />
            <Input
              label="Priority (higher integer executes first)"
              type="number"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              min={0}
            />
            <Input
              label="Resource target client ID (optional)"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="demo-oidc-app"
            />
            <label>
              Conditions Rule Specification (JSON)
              <textarea
                className="code-area"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={8}
              />
            </label>
            <Button type="submit" variant="primary" isLoading={busy}>
              Create Policy Rule
            </Button>
          </form>
        </Card>
      </section>
    </main>
  )
}
