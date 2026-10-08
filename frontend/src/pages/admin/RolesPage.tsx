import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type RoleItem } from '../../lib/adminApi'

export function RolesPage() {
  const { accessToken } = useAuth()
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [selected, setSelected] = useState<RoleItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissionsText, setPermissionsText] = useState('apps:read')
  const [editDescription, setEditDescription] = useState('')
  const [editPermissions, setEditPermissions] = useState('')

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await adminApi.listRoles(accessToken)
      setRoles(res.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  function selectRole(role: RoleItem) {
    setSelected(role)
    setEditDescription(role.description || '')
    setEditPermissions(role.permissions.join('\n'))
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setBusy(true)
    try {
      const permissions = permissionsText
        .split(/[\n,]/)
        .map((p) => p.trim())
        .filter(Boolean)
      await adminApi.createRole(accessToken, {
        name,
        description: description || undefined,
        permissions,
      })
      setName('')
      setDescription('')
      setPermissionsText('apps:read')
      await load()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function onSave() {
    if (!accessToken || !selected) return
    setBusy(true)
    try {
      const permissions = editPermissions
        .split(/[\n,]/)
        .map((p) => p.trim())
        .filter(Boolean)
      const updated = await adminApi.patchRole(accessToken, selected.id, {
        description: editDescription || null,
        permissions,
      })
      setSelected(updated)
      await load()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete() {
    if (!accessToken || !selected) return
    if (selected.is_system) {
      setError('System roles cannot be deleted')
      return
    }
    setBusy(true)
    try {
      await adminApi.deleteRole(accessToken, selected.id)
      setSelected(null)
      await load()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="dashboard">
      <h1>Roles</h1>
      <p className="lede">
        Create RBAC roles and attach permissions. Policies can match <code>subject.roles</code> and{' '}
        <code>subject.permissions</code> alongside ABAC attributes.
      </p>
      {error && <p className="form-error">{error}</p>}

      <section className="detail-grid">
        <div>
          <h2>Tenant roles</h2>
          <ul className="list">
            {roles.map((role) => (
              <li key={role.id}>
                <div className="list-row">
                  <div>
                    <strong>{role.name}</strong>
                    <div className="muted small">
                      {role.permissions.length
                        ? role.permissions.join(', ')
                        : 'No permissions'}
                      {role.is_system ? ' · system' : ''}
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={() => selectRole(role)}>
                    Edit
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <h2>Create role</h2>
          <form className="stack" onSubmit={(e) => void onCreate(e)}>
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="finance_ops"
                required
              />
            </label>
            <label>
              Description
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>
              Permissions (one per line)
              <textarea
                className="code-area"
                rows={4}
                value={permissionsText}
                onChange={(e) => setPermissionsText(e.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Create role
            </button>
          </form>
        </div>

        <div>
          <h2>Role details</h2>
          {selected ? (
            <div className="stack">
              <p>
                <strong>{selected.name}</strong>
                {selected.is_system ? <span className="badge">System</span> : null}
              </p>
              <label>
                Description
                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </label>
              <label>
                Permissions
                <textarea
                  className="code-area"
                  rows={6}
                  value={editPermissions}
                  onChange={(e) => setEditPermissions(e.target.value)}
                />
              </label>
              <div className="toolbar">
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void onSave()}>
                  Save
                </button>
                {!selected.is_system && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={busy}
                    onClick={() => void onDelete()}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="muted">Select a role to edit permissions.</p>
          )}
        </div>
      </section>
    </main>
  )
}
