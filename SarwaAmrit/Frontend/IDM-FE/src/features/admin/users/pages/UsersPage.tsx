import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Checkbox, Input } from '@thoughtstream/ui'
import { useAuth } from '../../../auth/context/AuthContext'
import { adminApi, type RoleItem, type UserItem } from '../../../../core/adminApi'

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
      <h1>Tenant User Directory</h1>
      <p className="lede">
        Search the enterprise directory, inspect ABAC subject attributes, and configure multi-role RBAC assignments.
      </p>
      {error && <p className="form-error">{error}</p>}

      <div className="toolbar">
        <Input
          label="Directory search"
          placeholder="Filter by email address…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button variant="secondary" onClick={() => void load()}>
          Search directory
        </Button>
      </div>

      <section className="detail-grid">
        <Card variant="default" padding="medium">
          <h2>Subject Directory ({users.length})</h2>
          <ul className="list">
            {users.map((user) => (
              <li key={user.id}>
                <div className="list-row">
                  <div>
                    <strong className="mono">{user.email}</strong>
                    <div className="muted small" style={{ marginTop: '0.2rem' }}>
                      {user.name || 'No legal name'} · {user.status.toUpperCase()}
                      {user.is_admin ? ' · PRIVILEGED ADMIN' : ''}
                    </div>
                  </div>
                  <div className="btn-row">
                    <Button variant="ghost" size="small" onClick={() => void openAttrs(user)}>
                      Attributes
                    </Button>
                    <Button variant="ghost" size="small" onClick={() => void openRoles(user)}>
                      Roles
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="default" padding="medium">
          {panel === 'attributes' ? (
            <>
              <h2>Subject Attributes (ABAC)</h2>
              {selected ? (
                <div className="stack">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="muted small">Configuring:</span>
                    <strong className="mono small">{selected.email}</strong>
                  </div>
                  <textarea
                    className="code-area"
                    rows={12}
                    value={attrJson}
                    onChange={(e) => setAttrJson(e.target.value)}
                  />
                  <Button
                    variant="primary"
                    disabled={busy}
                    onClick={() => void saveAttrs()}
                    isLoading={busy}
                  >
                    Save Attributes
                  </Button>
                </div>
              ) : (
                <p className="muted">Select a user principal from the directory to inspect or edit ABAC claims.</p>
              )}
            </>
          ) : (
            <>
              <h2>Assigned Roles (RBAC)</h2>
              {selected ? (
                <div className="stack">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="muted small">Configuring:</span>
                    <strong className="mono small">{selected.email}</strong>
                  </div>
                  <ul className="list">
                    {allRoles.map((role) => (
                      <li key={role.id} className="list-row">
                        <Checkbox
                          checked={selectedRoleIds.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          label={role.name}
                          description={role.permissions.join(', ') || 'No permissions'}
                        />
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="primary"
                    disabled={busy}
                    onClick={() => void saveRoles()}
                    isLoading={busy}
                  >
                    Save Role Assignments
                  </Button>
                </div>
              ) : (
                <p className="muted">Select a user to assign roles.</p>
              )}
            </>
          )}
        </Card>
      </section>
    </main>
  )
}
