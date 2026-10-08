import { useAuth } from '../auth/AuthContext'

export function DashboardPage() {
  const { user, tokens, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="brand compact">SSO Portal</p>
        <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
          Sign out
        </button>
      </header>

      <main className="dashboard">
        <h1>Dashboard</h1>
        <p className="lede">You are signed in. Here is your identity from the SSO userinfo endpoint.</p>

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
                <dd>
                  {user?.groups && user.groups.length > 0 ? user.groups.join(', ') : 'None'}
                </dd>
              </div>
              <div>
                <dt>Attributes</dt>
                <dd>
                  {user?.attributes && Object.keys(user.attributes).length > 0
                    ? Object.entries(user.attributes)
                        .map(([key, value]) => `${key}=${String(value)}`)
                        .join(', ')
                    : 'None'}
                </dd>
              </div>
            </dl>
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
              <div>
                <dt>Access token (preview)</dt>
                <dd className="mono truncate">
                  {tokens?.access_token
                    ? `${tokens.access_token.slice(0, 24)}…${tokens.access_token.slice(-12)}`
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>
    </div>
  )
}
