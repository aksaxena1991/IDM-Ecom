import { useCallback, useEffect, useState } from 'react'
import { Button, Chip } from '@thoughtstream/ui'
import { useAuth } from '../../../auth/context/AuthContext'
import { adminApi, type AuditItem } from '../../../../core/adminApi'
import { SSO_BASE_URL } from '../../../../core/config'

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
          <h1>Immutable Audit Ledger</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Chronological log of administrative actions, identity assertions, and security events.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Chip variant="status" tone="info">{`${items.length} EVENTS RECORDED`}</Chip>
          <Button variant="secondary" size="small" onClick={() => void downloadCsv()}>
            Export CSV
          </Button>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Principal Actor</th>
              <th>Action Taxonomy</th>
              <th>Target Entity</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }} className="muted">
                  No audit events found in this partition.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="mono small">{new Date(item.occurred_at).toLocaleString()}</td>
                  <td className="mono">{item.actor}</td>
                  <td>
                    <code className="mono">{item.action}</code>
                  </td>
                  <td className="mono truncate">{item.target || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
