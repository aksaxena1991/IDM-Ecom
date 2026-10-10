import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button, Card, Chip, Input } from '@thoughtstream/ui'
import { ListSkeleton } from '../../../../components/ContentSkeleton'
import { useAuth } from '../../../auth/context/AuthContext'
import { adminApi, type RoleItem } from '../../../../core/adminApi'

export function RolesPage() {
  const { accessToken } = useAuth()
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [selected, setSelected] = useState<RoleItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissionsText, setPermissionsText] = useState('apps:read')
  const [editDescription, setEditDescription] = useState('')
  const [editPermissions, setEditPermissions] = useState('')

  const load = useCallback(async () => {
    if (!accessToken) {
      setReady(true)
      return
    }
    try {
      const res = await adminApi.listRoles(accessToken)
      setRoles(res.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles')
    } finally {
      setReady(true)
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
      <h1>RBAC Role Governance</h1>
      <p className="lede">
        Define enterprise RBAC roles, assign fine-grained permissions, and bind them to ABAC policy conditions.
      </p>
      {error && <p className="form-error">{error}</p>}

      <section className="detail-grid">
        <Card variant="default" padding="medium">
          <h2>Tenant Roles ({roles.length})</h2>
          {!ready ? (
            <ListSkeleton />
          ) : (
          <ul className="list" style={{ marginBottom: '2rem' }}>
            {roles.map((role) => (
              <li key={role.id}>
                <div className="list-row">
                  <div>
                    <strong>{role.name}</strong>
                    <div className="muted small" style={{ marginTop: '0.2rem' }}>
                      {role.permissions.length
                        ? `${role.permissions.length} permissions`
                        : 'No permissions'}
                      {role.is_system ? ' · SYSTEM ROLE' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {role.is_system && (
                      <Chip variant="status" tone="info">SYSTEM</Chip>
                    )}
                    <Button variant="ghost" size="small" onClick={() => selectRole(role)}>
                      Edit Role
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          )}

          <h2>Create New Role</h2>
          <form className="stack" onSubmit={(e) => void onCreate(e)}>
            <Input
              label="Role identifier"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. security_auditor"
              required
            />
            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief role objective"
            />
            <label>
              Permissions (one per line or comma-separated)
              <textarea
                className="code-area"
                rows={4}
                value={permissionsText}
                onChange={(e) => setPermissionsText(e.target.value)}
              />
            </label>
            <Button type="submit" variant="primary" isLoading={busy}>
              Create Role
            </Button>
          </form>
        </Card>

        <Card variant="default" padding="medium">
          <h2>Role Specifications</h2>
          {selected ? (
            <div className="stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem' }}>{selected.name}</strong>
                {selected.is_system && (
                  <Chip variant="status" tone="info">IMMUTABLE SYSTEM ROLE</Chip>
                )}
              </div>
              <Input
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <label>
                Attached Permissions
                <textarea
                  className="code-area"
                  rows={6}
                  value={editPermissions}
                  onChange={(e) => setEditPermissions(e.target.value)}
                />
              </label>
              <div className="btn-row" style={{ marginTop: '0.5rem' }}>
                <Button variant="primary" disabled={busy} onClick={() => void onSave()} isLoading={busy}>
                  Save Changes
                </Button>
                {!selected.is_system && (
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => void onDelete()}
                  >
                    Delete Role
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="muted">Select a role from the registry to inspect or modify permission scopes.</p>
          )}
        </Card>
      </section>
    </main>
  )
}
