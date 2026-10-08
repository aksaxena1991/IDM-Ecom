import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type UserItem } from '../../lib/adminApi'

export function UsersPage() {
  const { accessToken } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<UserItem | null>(null)
  const [attrJson, setAttrJson] = useState('{}')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await adminApi.listUsers(accessToken, q || undefined)
      setUsers(res.items)
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
    try {
      const res = await adminApi.getUserAttributes(accessToken, user.id)
      setAttrJson(JSON.stringify(res.attributes, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attributes')
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

  return (
    <main className="dashboard">
      <h1>Users</h1>
      <p className="lede">Search the tenant directory and edit subject attributes for ABAC.</p>
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
                  <button type="button" className="btn btn-ghost" onClick={() => void openAttrs(user)}>
                    Attributes
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Subject attributes</h2>
          {selected ? (
            <div className="stack">
              <p className="muted">{selected.email}</p>
              <textarea
                className="code-area"
                value={attrJson}
                onChange={(e) => setAttrJson(e.target.value)}
                rows={10}
              />
              <button type="button" className="btn btn-primary" onClick={() => void saveAttrs()} disabled={busy}>
                Save attributes
              </button>
            </div>
          ) : (
            <p className="muted">Select a user to edit attributes.</p>
          )}
        </div>
      </section>
    </main>
  )
}
