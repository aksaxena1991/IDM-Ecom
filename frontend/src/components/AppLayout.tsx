import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppLayout() {
  const { user, isAdmin, hasPermission, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <p className="brand compact">Nector Nest IDM</p>
          <nav className="nav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/security">Security</NavLink>
            {hasPermission('apps:read', 'apps:write') && (
              <NavLink to="/admin/apps">Apps</NavLink>
            )}
            {hasPermission('users:write') && <NavLink to="/admin/users">Users</NavLink>}
            {hasPermission('roles:write') && <NavLink to="/admin/roles">Roles</NavLink>}
            {hasPermission('groups:read', 'groups:write') && (
              <NavLink to="/admin/groups">Groups</NavLink>
            )}
            {hasPermission('policies:write') && (
              <NavLink to="/admin/policies">Policies</NavLink>
            )}
            {isAdmin && <NavLink to="/admin/access">Evaluate</NavLink>}
            {hasPermission('audit:read') && <NavLink to="/admin/audit">Audit</NavLink>}
          </nav>
        </div>
        <div className="header-right">
          <span className="muted small">{user?.email}</span>
          {isAdmin && <span className="badge">Admin</span>}
          <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
