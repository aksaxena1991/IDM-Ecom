import { useAuth } from '../auth/AuthContext'

export function DashboardPage() {
  const { user, tokens, isAdmin } = useAuth()
  const attrs = user?.attributes || {}

  return (
    <main className="dashboard">
      <h1>Dashboard</h1>
      <p className="lede">
        Signed in via SSO. Profile comes from <code>/oauth2/userinfo</code>
        {isAdmin ? ', including ABAC attributes.' : '.'}
      </p>

      <section className="detail-grid" aria-label="Logged in user details">
        <div>
          <h2>Profile</h2>
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>{user?.name || '—'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email || '—'}</dd>
            </div>
            <div>
              <dt>Subject (sub)</dt>
              <dd className="mono">{user?.sub || '—'}</dd>
            </div>
            <div>
              <dt>Tenant</dt>
              <dd className="mono">{user?.tenant_id || '—'}</dd>
            </div>
            <div>
              <dt>Groups</dt>
              <dd>{user?.groups?.length ? user.groups.join(', ') : 'None'}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{isAdmin ? 'Administrator' : 'User'}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2>ABAC attributes</h2>
          {Object.keys(attrs).length === 0 ? (
            <p className="muted">No custom attributes on this account.</p>
          ) : (
            <dl className="detail-list">
              {Object.entries(attrs).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd className="mono">{formatAttr(value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div>
          <h2>Session</h2>
          <dl className="detail-list">
            <div>
              <dt>Token type</dt>
              <dd>{tokens?.token_type || 'Bearer'}</dd>
            </div>
            <div>
              <dt>Access token TTL</dt>
              <dd>{tokens?.expires_in ? `${tokens.expires_in}s` : '—'}</dd>
            </div>
            <div>
              <dt>Scopes</dt>
              <dd>{tokens?.scope || '—'}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  )
}

function formatAttr(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}
