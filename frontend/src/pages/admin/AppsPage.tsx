import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { adminApi, type AppItem } from '../../lib/adminApi'
import { ApiError } from '../../lib/api'

export function AppsPage() {
  const { accessToken } = useAuth()
  const [apps, setApps] = useState<AppItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AppItem | null>(null)
  const [attrJson, setAttrJson] = useState('{}')
  const [name, setName] = useState('')
  const [redirectUris, setRedirectUris] = useState('http://localhost:3000/callback')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await adminApi.listApps(accessToken)
      setApps(res.items)
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
      await adminApi.createApp(accessToken, {
        name,
        protocol: 'oidc',
        redirect_uris: redirectUris
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      })
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
    try {
      const res = await adminApi.getAppAttributes(accessToken, app.id)
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
      await adminApi.putAppAttributes(accessToken, selected.id, attributes)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
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
      <p className="lede">Register OIDC/SAML apps, edit status, and manage resource attributes (ABAC).</p>
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
          <h2>Create OIDC app</h2>
          <form className="stack" onSubmit={onCreate}>
            <label>
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Redirect URIs (one per line)
              <textarea value={redirectUris} onChange={(e) => setRedirectUris(e.target.value)} rows={3} />
            </label>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Create
            </button>
          </form>

          {selected && (
            <>
              <h2>Attributes · {selected.name}</h2>
              <textarea
                className="code-area"
                value={attrJson}
                onChange={(e) => setAttrJson(e.target.value)}
                rows={8}
              />
              <button type="button" className="btn btn-secondary" onClick={() => void saveAttrs()} disabled={busy}>
                Save attributes
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
