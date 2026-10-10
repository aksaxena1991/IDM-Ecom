import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button, Card, Checkbox, Chip, Input } from '@thoughtstream/ui'
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
      <h1>Directory Groups</h1>
      <p className="lede">
        Group taxonomy management for token group claims, access assignments, and enterprise team clustering.
      </p>
      {error && <p className="form-error">{error}</p>}

      <section className="detail-grid">
        <Card variant="default" padding="medium">
          <h2>Registered Groups ({groups.length})</h2>
          <ul className="list" style={{ marginBottom: '2rem' }}>
            {groups.map((g) => (
              <li key={g.id}>
                <div className="list-row">
                  <div>
                    <strong>{g.name}</strong>
                    <div className="muted small" style={{ marginTop: '0.2rem' }}>
                      {g.source.toUpperCase()} · {(g.member_ids || []).length} assigned members
                    </div>
                  </div>
                  <Button variant="ghost" size="small" onClick={() => openMembers(g)}>
                    Manage Members
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <h2>Create Directory Group</h2>
          <form className="stack" onSubmit={(e) => void onCreate(e)}>
            <Input
              label="Group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. platform-engineers"
              required
            />
            <Button type="submit" variant="primary" isLoading={busy}>
              Create Group
            </Button>
          </form>
        </Card>

        <Card variant="default" padding="medium">
          <h2>Group Membership Roster</h2>
          {selected ? (
            <div className="stack">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.1rem' }}>{selected.name}</strong>
                <Chip variant="status" tone="info">{`${memberIds.length} ACTIVE MEMBERS`}</Chip>
              </div>

              <ul className="list">
                {users.map((u) => (
                  <li key={u.id} className="list-row">
                    <Checkbox
                      checked={memberIds.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                      label={<span className="mono small">{u.email}</span>}
                      description={u.name || '—'}
                    />
                  </li>
                ))}
              </ul>
              <Button
                variant="primary"
                disabled={busy}
                onClick={() => void saveMembers()}
                isLoading={busy}
              >
                Save Member Roster
              </Button>
            </div>
          ) : (
            <p className="muted">Select a directory group to inspect or manage member users.</p>
          )}
        </Card>
      </section>
    </main>
  )
}
