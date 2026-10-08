import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type AppItem, type GroupItem, type UserItem } from '../../lib/adminApi'
import { ApiError } from '../../lib/api'

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

  const load = useCallback(async () => {
    if (!accessToken) return
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
        <div>
          <h2>Registered apps</h2>
          <ul className="list">
            {apps.map((app) => (
              <li key={app.id}>
                <div className="list-row">
                  <div>
                    <strong>{app.name}</strong>
                    <div className="muted small mono">
                      {app.client_id} · {app.protocol} · {app.status}
                    </div>
                  </div>
                  <div className="btn-row">
                    <button type="button" className="btn btn-ghost" onClick={() => void loadAttrs(app)}>
                      Attributes
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void loadAssignments(app)}
                    >
                      Assignments
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => void toggleStatus(app)}>
                      {app.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Create app</h2>
          <form className="stack" onSubmit={onCreate}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Protocol
              <select value={protocol} onChange={(e) => setProtocol(e.target.value as 'oidc' | 'saml')}>
                <option value="oidc">OIDC</option>
                <option value="saml">SAML</option>
              </select>
            </label>
            {protocol === 'oidc' ? (
              <label>
                Redirect URIs (one per line)
                <textarea value={redirectUris} onChange={(e) => setRedirectUris(e.target.value)} rows={3} />
              </label>
            ) : (
              <>
                <label>
                  ACS URL
                  <input value={acsUrl} onChange={(e) => setAcsUrl(e.target.value)} required />
                </label>
                <label>
                  SP Entity ID
                  <input value={entityId} onChange={(e) => setEntityId(e.target.value)} required />
                </label>
              </>
            )}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Create
            </button>
          </form>

          {selected && panel === 'attributes' && (
            <>
              <h2>Attributes · {selected.name}</h2>
              <label className="list-row">
                <span className="muted small">Advanced JSON</span>
                <input
                  type="checkbox"
                  checked={advancedJson}
                  onChange={(e) => setAdvancedJson(e.target.checked)}
                />
              </label>
              {advancedJson ? (
                <textarea
                  className="code-area"
                  value={attrJson}
                  onChange={(e) => setAttrJson(e.target.value)}
                  rows={8}
                />
              ) : (
                <div className="stack">
                  {attrRows.map((row, idx) => (
                    <div key={idx} className="btn-row">
                      <input
                        placeholder="key"
                        value={row.key}
                        onChange={(e) => {
                          const next = [...attrRows]
                          next[idx] = { ...row, key: e.target.value }
                          setAttrRows(next)
                        }}
                      />
                      <input
                        placeholder="value"
                        value={row.value}
                        onChange={(e) => {
                          const next = [...attrRows]
                          next[idx] = { ...row, value: e.target.value }
                          setAttrRows(next)
                        }}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setAttrRows((r) => [...r, { key: '', value: '' }])}
                  >
                    Add attribute
                  </button>
                </div>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => void saveAttrs()} disabled={busy}>
                Save attributes
              </button>
            </>
          )}

          {selected && panel === 'assignments' && (
            <>
              <h2>Assignments · {selected.name}</h2>
              <p className="muted small">
                When any assignment exists, only assigned users/groups may access (then PBAC applies).
              </p>
              <h3>Users</h3>
              <ul className="list">
                {users.map((u) => (
                  <li key={u.id}>
                    <label className="list-row">
                      <span>
                        <strong>{u.email}</strong>
                        <div className="muted small">{u.name || '—'}</div>
                      </span>
                      <input
                        type="checkbox"
                        checked={assignments.some(
                          (a) => a.principal_type === 'user' && a.principal_id === u.id,
                        )}
                        onChange={() => toggleAssignment('user', u.id)}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <h3>Groups</h3>
              <ul className="list">
                {groups.map((g) => (
                  <li key={g.id}>
                    <label className="list-row">
                      <span>
                        <strong>{g.name}</strong>
                        <div className="muted small">{g.member_ids.length} members</div>
                      </span>
                      <input
                        type="checkbox"
                        checked={assignments.some(
                          (a) => a.principal_type === 'group' && a.principal_id === g.id,
                        )}
                        onChange={() => toggleAssignment('group', g.id)}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void saveAssignments()}
                disabled={busy}
              >
                Save assignments
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
