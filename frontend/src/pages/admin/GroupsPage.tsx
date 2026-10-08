import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type GroupItem, type UserItem } from '../../lib/adminApi'

export function GroupsPage() {
  const { accessToken } = useAuth()
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [selected, setSelected] = useState<GroupItem | null>(null)
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const [g, u] = await Promise.all([
        adminApi.listGroups(accessToken),
        adminApi.listUsers(accessToken),
      ])
      setGroups(g.items)
      setUsers(u.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups')
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
      await adminApi.createGroup(accessToken, { name })
      setName('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  function openMembers(group: GroupItem) {
    setSelected(group)
    setMemberIds(group.member_ids || [])
  }

  async function saveMembers() {
    if (!accessToken || !selected) return
    setBusy(true)
    try {
      await adminApi.putGroupMembers(accessToken, selected.id, memberIds)
      await load()
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  function toggleMember(userId: string) {
    setMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    )
  }

  return (
    <main className="dashboard">
      <h1>Groups</h1>
      <p className="lede">Manage directory groups and memberships used in claims and app assignments.</p>
      {error && <p className="form-error">{error}</p>}

      <section className="detail-grid">
        <div>
          <h2>Groups</h2>
          <ul className="list">
            {groups.map((g) => (
              <li key={g.id}>
                <div className="list-row">
                  <div>
                    <strong>{g.name}</strong>
                    <div className="muted small">
                      {g.source} · {(g.member_ids || []).length} members
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={() => openMembers(g)}>
                    Members
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h2>Create group</h2>
          <form className="stack" onSubmit={(e) => void onCreate(e)}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Create
            </button>
          </form>
        </div>
        <div>
          <h2>Members</h2>
          {selected ? (
            <div className="stack">
              <p className="muted">{selected.name}</p>
              <ul className="list">
                {users.map((u) => (
                  <li key={u.id}>
                    <label className="list-row">
                      <span>{u.email}</span>
                      <input
                        type="checkbox"
                        checked={memberIds.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void saveMembers()}>
                Save members
              </button>
            </div>
          ) : (
            <p className="muted">Select a group to edit members.</p>
          )}
        </div>
      </section>
    </main>
  )
}
