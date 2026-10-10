import { Card, Chip } from '@thoughtstream/ui'
import { CardGridSkeleton } from '../../../components/ContentSkeleton'
import { useAuth } from '../../auth/context/AuthContext'

export function DashboardPage() {
  const { user, tokens, isAdmin } = useAuth()
  const attrs = user?.attributes || {}
  const roles = user?.roles || []
  const permissions = user?.permissions || []

  if (!user) {
    return (
      <main className="dashboard">
        <CardGridSkeleton />
      </main>
    )
  }

  return (
    <main className="dashboard">
      <div className="toolbar" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1>Identity Dashboard</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Cryptographically authenticated session. Profile claims validated against <code>/oauth2/userinfo</code>.
          </p>
        </div>
        <div>
          <Chip variant="status" tone="success">
            SESSION ACTIVE
          </Chip>
        </div>
      </div>

      <section className="detail-grid" aria-label="Logged in user details">
        <Card variant="default" padding="medium">
          <h2>Subject Profile</h2>
          <dl className="detail-list">
            <div>
              <dt>Full Legal Name</dt>
              <dd>{user?.name || '—'}</dd>
            </div>
            <div>
              <dt>Principal Email</dt>
              <dd className="mono">{user?.email || '—'}</dd>
            </div>
            <div>
              <dt>Cryptographic Subject (sub)</dt>
              <dd className="mono truncate" title={user?.sub}>{user?.sub || '—'}</dd>
            </div>
            <div>
              <dt>Tenant Partition</dt>
              <dd className="mono">{user?.tenant_id || '—'}</dd>
            </div>
            <div>
              <dt>Directory Groups</dt>
              <dd>
                {user?.groups?.length ? (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {user.groups.map((g) => (
                      <Chip key={g} variant="filter" selected={false}>{g}</Chip>
                    ))}
                  </div>
                ) : (
                  <span className="muted">None assigned</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Access Tier</dt>
              <dd>
                <Chip variant="status" tone={isAdmin ? 'warning' : 'info'}>
                  {isAdmin ? 'ADMINISTRATOR' : 'STANDARD OPERATOR'}
                </Chip>
              </dd>
            </div>
          </dl>
        </Card>

        <Card variant="default" padding="medium">
          <h2>RBAC Entitlements</h2>
          <dl className="detail-list">
            <div>
              <dt>Assigned Roles</dt>
              <dd>
                {roles.length ? (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {roles.map((r) => (
                      <Chip key={r} variant="status" tone="info">{r}</Chip>
                    ))}
                  </div>
                ) : (
                  <span className="muted">No roles assigned</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Cryptographic Permissions</dt>
              <dd>
                {permissions.length ? (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {permissions.map((p) => (
                      <code key={p}>{p}</code>
                    ))}
                  </div>
                ) : (
                  <span className="muted">No explicit permissions</span>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card variant="default" padding="medium">
          <h2>ABAC Attributes</h2>
          {Object.keys(attrs).length === 0 ? (
            <p className="muted" style={{ padding: '0.5rem 0' }}>No custom attribute claims found on this account token.</p>
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
        </Card>

        <Card variant="default" padding="medium">
          <h2>OIDC Token Session</h2>
          <dl className="detail-list">
            <div>
              <dt>Token Protocol</dt>
              <dd className="mono">{tokens?.token_type || 'Bearer'}</dd>
            </div>
            <div>
              <dt>Access Token TTL</dt>
              <dd className="mono">{tokens?.expires_in ? `${tokens.expires_in} seconds remaining` : '—'}</dd>
            </div>
            <div>
              <dt>Authorized Scopes</dt>
              <dd className="mono">{tokens?.scope || '—'}</dd>
            </div>
          </dl>
        </Card>
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
