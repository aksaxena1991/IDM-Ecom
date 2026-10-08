import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          <p className="brand compact">SSO Portal</p>
          <nav className="nav">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/security">Security</NavLink>
            {isAdmin && (
              <>
                <NavLink to="/admin/apps">Apps</NavLink>
                <NavLink to="/admin/users">Users</NavLink>
                <NavLink to="/admin/roles">Roles</NavLink>
                <NavLink to="/admin/policies">Policies</NavLink>
                <NavLink to="/admin/access">Evaluate</NavLink>
                <NavLink to="/admin/audit">Audit</NavLink>
              </>
            )}
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
