import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type AuditItem } from '../../lib/adminApi'
import { SSO_BASE_URL } from '../../config'

export function AuditPage() {
  const { accessToken } = useAuth()
  const [items, setItems] = useState<AuditItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await adminApi.listAudit(accessToken)
      setItems(res.items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit events')
    }
  }, [accessToken])

  useEffect(() => {
    void load()
  }, [load])

  async function downloadCsv() {
    if (!accessToken) return
    const res = await fetch(`${SSO_BASE_URL}/v1/audit-events?format=csv`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      setError('CSV export failed')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-events.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="dashboard">
      <div className="toolbar">
        <div>
          <h1>Audit log</h1>
          <p className="lede">Admin actions and sign-in events for this tenant.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => void downloadCsv()}>
          Export CSV
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.occurred_at).toLocaleString()}</td>
                <td>{item.actor}</td>
                <td className="mono">{item.action}</td>
                <td className="mono truncate">{item.target || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
