import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type RoleItem, type UserItem } from '../../lib/adminApi'

export function UsersPage() {
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [allRoles, setAllRoles] = useState<RoleItem[]>([])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<UserItem | null>(null)
  const [panel, setPanel] = useState<'attributes' | 'roles'>('attributes')
  const [attrJson, setAttrJson] = useState('{}')
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const [usersRes, rolesRes] = await Promise.all([
        adminApi.listUsers(accessToken, q || undefined),
        adminApi.listRoles(accessToken),
      ])
      setUsers(usersRes.items)
      setAllRoles(rolesRes.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    }
  }, [accessToken, q])

  useEffect(() => {
    void load()
  }, [load])

  async function openAttrs(user: UserItem) {
    if (!accessToken) return
    setSelected(user)
    setPanel('attributes')
    try {
      const res = await adminApi.getUserAttributes(accessToken, user.id)
      setAttrJson(JSON.stringify(res.attributes, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attributes')
    }
  }

  async function openRoles(user: UserItem) {
    if (!accessToken) return
    setSelected(user)
    setPanel('roles')
    try {
      const res = await adminApi.getUserRoles(accessToken, user.id)
      setSelectedRoleIds(res.role_ids)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    }
  }

  async function saveAttrs() {
    if (!accessToken || !selected) return
    setBusy(true)
    try {
      const attributes = JSON.parse(attrJson) as Record<string, unknown>
      await adminApi.putUserAttributes(accessToken, selected.id, attributes)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function saveRoles() {
    if (!accessToken || !selected) return
    setBusy(true)
    try {
      await adminApi.putUserRoles(accessToken, selected.id, selectedRoleIds)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save roles failed')
    } finally {
      setBusy(false)
    }
  }

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    )
  }

  return (
    <main className="dashboard">
      <h1>Users</h1>
      <p className="lede">
        Search the tenant directory, edit ABAC subject attributes, and assign multiple RBAC roles.
      </p>
      {error && <p className="form-error">{error}</p>}

      <div className="toolbar">
        <input
          placeholder="Search email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="button" className="btn btn-secondary" onClick={() => void load()}>
          Search
        </button>
      </div>

      <section className="detail-grid">
        <div>
          <h2>Directory</h2>
          <ul className="list">
            {users.map((user) => (
              <li key={user.id}>
                <div className="list-row">
                  <div>
                    <strong>{user.email}</strong>
                    <div className="muted small">
                      {user.name || '—'} · {user.status}
                      {user.is_admin ? ' · admin' : ''}
                    </div>
                  </div>
                  <div className="toolbar">
                    <button type="button" className="btn btn-ghost" onClick={() => void openAttrs(user)}>
                      Attributes
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => void openRoles(user)}>
                      Roles
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {panel === 'attributes' ? (
            <>
              <h2>Subject attributes (ABAC)</h2>
              {selected ? (
                <div className="stack">
                  <p className="muted">{selected.email}</p>
                  <textarea
                    className="code-area"
                    rows={12}
                    value={attrJson}
                    onChange={(e) => setAttrJson(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() => void saveAttrs()}
                  >
                    Save attributes
                  </button>
                </div>
              ) : (
                <p className="muted">Select a user to edit attributes.</p>
              )}
            </>
          ) : (
            <>
              <h2>Assigned roles (RBAC)</h2>
              {selected ? (
                <div className="stack">
                  <p className="muted">{selected.email}</p>
                  <ul className="list">
                    {allRoles.map((role) => (
                      <li key={role.id}>
                        <label className="list-row">
                          <span>
                            <strong>{role.name}</strong>
                            <div className="muted small">
                              {role.permissions.join(', ') || 'No permissions'}
                            </div>
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedRoleIds.includes(role.id)}
                            onChange={() => toggleRole(role.id)}
                          />
                        </label>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() => void saveRoles()}
                  >
                    Save roles
                  </button>
                </div>
              ) : (
                <p className="muted">Select a user to assign roles.</p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
