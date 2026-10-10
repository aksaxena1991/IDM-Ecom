import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button, Card, Checkbox, Chip, Input, Select } from '@thoughtstream/ui'
import { useAuth } from '../../../auth/context/AuthContext'
import { ListSkeleton } from '../../../../components/ContentSkeleton'
import { adminApi, type AppItem, type GroupItem, type UserItem } from '../../../../core/adminApi'
import { ApiError } from '../../../../core/api'

type Assignment = { principal_type: string; principal_id: string }

export function AppsPage() {
  const { accessToken } = useAuth()
  const [apps, setApps] = useState<AppItem[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AppItem | null>(null)
  const [panel, setPanel] = useState<'attributes' | 'assignments'>('attributes')
  const [attrJson, setAttrJson] = useState('{}')
  const [attrRows, setAttrRows] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }])
  const [advancedJson, setAdvancedJson] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [name, setName] = useState('')
  const [protocol, setProtocol] = useState<'oidc' | 'saml'>('oidc')
  const [redirectUris, setRedirectUris] = useState('http://localhost:3000/callback')
  const [acsUrl, setAcsUrl] = useState('http://localhost:9000/acs')
  const [entityId, setEntityId] = useState('https://sp.example.com')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) {
      setReady(true)
      return
    }
    try {
      const [appsRes, usersRes, groupsRes] = await Promise.all([
        adminApi.listApps(accessToken),
        adminApi.listUsers(accessToken),
        adminApi.listGroups(accessToken),
      ])
      setApps(appsRes.items)
      setUsers(usersRes.items)
      setGroups(groupsRes.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apps')
    } finally {
      setReady(true)
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setBusy(true)
    setError(null)
    try {
      if (protocol === 'oidc') {
        await adminApi.createApp(accessToken, {
          name,
          protocol: 'oidc',
          redirect_uris: redirectUris
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        })
      } else {
        await adminApi.createApp(accessToken, {
          name,
          protocol: 'saml',
          acs_url: acsUrl,
          entity_id: entityId,
          audience: entityId,
        })
      }
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.detail || err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function loadAttrs(app: AppItem) {
    if (!accessToken) return
    setSelected(app)
    setPanel('attributes')
    try {
      const res = await adminApi.getAppAttributes(accessToken, app.id)
      const attrs = res.attributes || {}
      setAttrJson(JSON.stringify(attrs, null, 2))
      const rows = Object.entries(attrs).map(([key, value]) => ({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
      }))
      setAttrRows(rows.length ? rows : [{ key: '', value: '' }])
      setAdvancedJson(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attributes')
    }
  }

  async function loadAssignments(app: AppItem) {
    if (!accessToken) return
    setSelected(app)
    setPanel('assignments')
    try {
      const res = await adminApi.getAssignments(accessToken, app.id)
      setAssignments(res.assignments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
    }
  }

  async function saveAttrs() {
    if (!accessToken || !selected) return
    setBusy(true)
    try {
      let attributes: Record<string, unknown>
      if (advancedJson) {
        attributes = JSON.parse(attrJson) as Record<string, unknown>
      } else {
        attributes = {}
        for (const row of attrRows) {
          if (!row.key.trim()) continue
          try {
            attributes[row.key.trim()] = JSON.parse(row.value)
          } catch {
            attributes[row.key.trim()] = row.value
          }
        }
      }
      await adminApi.putAppAttributes(accessToken, selected.id, attributes)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function saveAssignments() {
    if (!accessToken || !selected) return
    setBusy(true)
    try {
      await adminApi.setAssignments(accessToken, selected.id, assignments)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save assignments failed')
    } finally {
      setBusy(false)
    }
  }

  function toggleAssignment(principalType: 'user' | 'group', principalId: string) {
    setAssignments((prev) => {
      const exists = prev.some(
        (a) => a.principal_type === principalType && a.principal_id === principalId,
      )
      if (exists) {
        return prev.filter(
          (a) => !(a.principal_type === principalType && a.principal_id === principalId),
        )
      }
      return [...prev, { principal_type: principalType, principal_id: principalId }]
    })
  }

  async function toggleStatus(app: AppItem) {
    if (!accessToken) return
    const next = app.status === 'active' ? 'disabled' : 'active'
    try {
      await adminApi.patchApp(accessToken, app.id, { status: next })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  return (
    <main className="dashboard">
      <h1>Applications</h1>
      <p className="lede">
        Register OIDC/SAML apps, manage assignments (entitlements), and resource attributes (ABAC).
      </p>
      {error && <p className="form-error">{error}</p>}

      <section className="detail-grid">
        <Card variant="default" padding="medium">
          <h2>Registered Applications</h2>
          {!ready ? (
            <ListSkeleton />
          ) : (
          <ul className="list">
            {apps.map((app) => (
              <li key={app.id}>
                <div className="list-row">
                  <div>
                    <strong>{app.name}</strong>
                    <div className="muted small mono" style={{ marginTop: '0.2rem' }}>
                      {app.client_id} · {app.protocol.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Chip
                      variant="status"
                      tone={app.status === 'active' ? 'success' : 'warning'}
                    >
                      {app.status.toUpperCase()}
                    </Chip>
                    <div className="btn-row">
                      <Button variant="ghost" size="small" onClick={() => void loadAttrs(app)}>
                        Attributes
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => void loadAssignments(app)}
                      >
                        Assignments
                      </Button>
                      <Button variant="ghost" size="small" onClick={() => void toggleStatus(app)}>
                        {app.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          )}
        </Card>

        <Card variant="default" padding="medium">
          <h2>Provision Application</h2>
          <form className="stack" onSubmit={onCreate}>
            <Input
              label="Application name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Analytics Portal"
              required
            />
            <Select
              label="Protocol"
              value={protocol}
              onChange={(value) => setProtocol(value as 'oidc' | 'saml')}
              options={[
                { value: 'oidc', label: 'OIDC (OpenID Connect)' },
                { value: 'saml', label: 'SAML 2.0' },
              ]}
              required
            />
            {protocol === 'oidc' ? (
              <label>
                Authorized Redirect URIs (one per line)
                <textarea value={redirectUris} onChange={(e) => setRedirectUris(e.target.value)} rows={3} />
              </label>
            ) : (
              <>
                <Input
                  label="Assertion Consumer Service (ACS) URL"
                  value={acsUrl}
                  onChange={(e) => setAcsUrl(e.target.value)}
                  required
                />
                <Input
                  label="Service Provider Entity ID"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  required
                />
              </>
            )}
            <Button type="submit" variant="primary" isLoading={busy}>
              Create Application
            </Button>
          </form>

          {selected && panel === 'attributes' && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ts-border-subtle)' }}>
              <h2>Attributes · {selected.name}</h2>
              <div className="list-row" style={{ marginBottom: '1rem' }}>
                <Checkbox
                  checked={advancedJson}
                  onChange={(e) => setAdvancedJson(e.target.checked)}
                  label="Advanced JSON mode"
                />
              </div>
              {advancedJson ? (
                <textarea
                  className="code-area"
                  value={attrJson}
                  onChange={(e) => setAttrJson(e.target.value)}
                  rows={8}
                />
              ) : (
                <div className="stack" style={{ marginBottom: '1rem' }}>
                  {attrRows.map((row, idx) => (
                    <div key={idx} className="btn-row">
                      <Input
                        placeholder="attribute_key"
                        value={row.key}
                        onChange={(e) => {
                          const next = [...attrRows]
                          next[idx] = { ...row, key: e.target.value }
                          setAttrRows(next)
                        }}
                      />
                      <Input
                        placeholder="attribute_value"
                        value={row.value}
                        onChange={(e) => {
                          const next = [...attrRows]
                          next[idx] = { ...row, value: e.target.value }
                          setAttrRows(next)
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => setAttrRows((r) => [...r, { key: '', value: '' }])}
                  >
                    + Add Attribute
                  </Button>
                </div>
              )}
              <Button variant="secondary" onClick={() => void saveAttrs()} isLoading={busy}>
                Save Attributes
              </Button>
            </div>
          )}

          {selected && panel === 'assignments' && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ts-border-subtle)' }}>
              <h2>Assignments · {selected.name}</h2>
              <p className="muted small" style={{ marginBottom: '1rem' }}>
                When any assignment exists, only assigned users/groups may access (then PBAC applies).
              </p>
              <h3>Users</h3>
              <ul className="list" style={{ marginBottom: '1rem' }}>
                {users.map((u) => (
                  <li key={u.id} className="list-row">
                    <Checkbox
                      checked={assignments.some(
                        (a) => a.principal_type === 'user' && a.principal_id === u.id,
                      )}
                      onChange={() => toggleAssignment('user', u.id)}
                      label={u.email}
                      description={u.name || '—'}
                    />
                  </li>
                ))}
              </ul>
              <h3>Groups</h3>
              <ul className="list" style={{ marginBottom: '1rem' }}>
                {groups.map((g) => (
                  <li key={g.id} className="list-row">
                    <Checkbox
                      checked={assignments.some(
                        (a) => a.principal_type === 'group' && a.principal_id === g.id,
                      )}
                      onChange={() => toggleAssignment('group', g.id)}
                      label={g.name}
                      description={`${g.member_ids.length} members`}
                    />
                  </li>
                ))}
              </ul>
              <Button
                variant="secondary"
                onClick={() => void saveAssignments()}
                isLoading={busy}
              >
                Save Assignments
              </Button>
            </div>
          )}
        </Card>
      </section>
    </main>
  )
}
