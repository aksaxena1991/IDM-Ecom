import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Button, Card, Chip, Input, Multiselect, Panel, PanelGroup, Select } from '@thoughtstream/ui'
import { useAuth } from '../../../auth/context/AuthContext'
import { adminApi, type AppItem, type PolicyItem } from '../../../../core/adminApi'

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
  const [clientIds, setClientIds] = useState<string[]>([])
  const [apps, setApps] = useState<AppItem[]>([])
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)
  const [busy, setBusy] = useState(false)
  const [openPolicyIds, setOpenPolicyIds] = useState<string[]>([])
  const seenPolicyIds = useRef(new Set<string>())

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const [policyRes, appRes] = await Promise.all([
        adminApi.listPolicies(accessToken),
        adminApi.listApps(accessToken),
      ])
      setPolicies(policyRes.items)
      setApps(appRes.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies')
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const ids = policies.map((policy) => policy.id)
    setOpenPolicyIds((current) => {
      const fresh = ids.filter((id) => !seenPolicyIds.current.has(id))
      seenPolicyIds.current = new Set(ids)
      return [...current.filter((id) => ids.includes(id)), ...fresh]
    })
  }, [policies])

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
        resource_match: clientIds.length ? { client_id: clientIds } : {},
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
        <section>
          <h2>Active Policies ({policies.length})</h2>
          {policies.length === 0 ? (
            <p className="muted">No policies yet.</p>
          ) : (
            <PanelGroup allowMultiple value={openPolicyIds} onValueChange={setOpenPolicyIds}>
              {policies.map((p) => (
                <Panel
                  key={p.id}
                  id={p.id}
                  className="policy-panel"
                  title={p.name}
                  subtitle={`Priority: ${p.priority} · Status: ${p.enabled ? 'Active / Evaluating' : 'Disabled'}`}
                  trailing={
                    <div className="policy-panel-trailing">
                      <Chip variant="status" tone={p.effect === 'deny' ? 'error' : 'success'}>
                        {p.effect.toUpperCase()}
                      </Chip>
                      <span className="policy-panel-actions">
                        <Button variant="ghost" size="small" onClick={() => void toggleEnabled(p)}>
                          {p.enabled ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="ghost" size="small" onClick={() => void onDelete(p)}>
                          Delete
                        </Button>
                      </span>
                    </div>
                  }
                >
                  <pre className="tiny-pre">{JSON.stringify(p.conditions, null, 2)}</pre>
                </Panel>
              ))}
            </PanelGroup>
          )}
        </section>

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
            <Multiselect
              label="Resource target client IDs (optional)"
              placeholder="Select applications"
              value={clientIds}
              onChange={setClientIds}
              searchable
              clearable
              options={apps.map((app) => ({
                value: app.client_id,
                label: `${app.name} — ${app.client_id}`,
              }))}
              helperText="Leave empty to apply to every application. Multiple IDs match if the request client is in the list."
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
