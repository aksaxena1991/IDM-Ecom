import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Chip,
  Footer,
  Sidebar,
  useTheme,
  type SidebarNavGroup,
} from '@thoughtstream/ui'
import {
  AppWindow,
  FileSearch,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Moon,
  Scale,
  ScrollText,
  Shield,
  Sparkles,
  Sun,
  Users,
  UsersRound,
} from 'lucide-react'
import { useAuth } from '../features/auth/context/AuthContext'

const ROUTE_META: Record<string, { group: string; label: string }> = {
  '/dashboard': { group: 'Identity', label: 'Dashboard' },
  '/security': { group: 'Identity', label: 'Security' },
  '/admin/apps': { group: 'Administration', label: 'Applications' },
  '/admin/users': { group: 'Administration', label: 'Users' },
  '/admin/roles': { group: 'Administration', label: 'Roles' },
  '/admin/groups': { group: 'Administration', label: 'Groups' },
  '/admin/policies': { group: 'Administration', label: 'Policies' },
  '/admin/access': { group: 'Administration', label: 'Evaluate' },
  '/admin/audit': { group: 'Administration', label: 'Audit' },
}

function initialsFromUser(name?: string | null, email?: string | null) {
  const source = (name || email || 'OP').trim()
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'OP'
  )
}

export function AppLayout() {
  const { user, isAdmin, hasPermission, logout } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(true)

  const meta = ROUTE_META[location.pathname] ?? { group: 'Identity', label: 'Workspace' }
  const initials = initialsFromUser(user?.name, user?.email)

  const navGroups = useMemo<SidebarNavGroup[]>(() => {
    const identityItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={16} />,
        active: location.pathname === '/dashboard',
        onClick: () => navigate('/dashboard'),
      },
      {
        id: 'security',
        label: 'Security',
        icon: <Shield size={16} />,
        active: location.pathname === '/security',
        onClick: () => navigate('/security'),
      },
    ]

    const adminItems = [
      hasPermission('apps:read', 'apps:write') && {
        id: 'apps',
        label: 'Applications',
        icon: <AppWindow size={16} />,
        active: location.pathname === '/admin/apps',
        onClick: () => navigate('/admin/apps'),
      },
      hasPermission('users:write') && {
        id: 'users',
        label: 'Users',
        icon: <Users size={16} />,
        active: location.pathname === '/admin/users',
        onClick: () => navigate('/admin/users'),
      },
      hasPermission('roles:write') && {
        id: 'roles',
        label: 'Roles',
        icon: <KeyRound size={16} />,
        active: location.pathname === '/admin/roles',
        onClick: () => navigate('/admin/roles'),
      },
      hasPermission('groups:read', 'groups:write') && {
        id: 'groups',
        label: 'Groups',
        icon: <UsersRound size={16} />,
        active: location.pathname === '/admin/groups',
        onClick: () => navigate('/admin/groups'),
      },
      hasPermission('policies:write') && {
        id: 'policies',
        label: 'Policies',
        icon: <ScrollText size={16} />,
        active: location.pathname === '/admin/policies',
        onClick: () => navigate('/admin/policies'),
      },
      isAdmin && {
        id: 'access',
        label: 'Evaluate',
        icon: <Scale size={16} />,
        active: location.pathname === '/admin/access',
        onClick: () => navigate('/admin/access'),
      },
      hasPermission('audit:read') && {
        id: 'audit',
        label: 'Audit',
        icon: <FileSearch size={16} />,
        active: location.pathname === '/admin/audit',
        onClick: () => navigate('/admin/audit'),
      },
    ].filter(Boolean)

    const groups: SidebarNavGroup[] = [{ title: 'Identity', items: identityItems }]
    if (adminItems.length) {
      groups.push({ title: 'Administration', items: adminItems as SidebarNavGroup['items'] })
    }
    return groups
  }, [hasPermission, isAdmin, location.pathname, navigate])

  return (
    <div className={`nn-dashboard-layout thoughtstream-theme-${resolvedTheme}`} data-theme={resolvedTheme}>
      <div className="nn-dashboard-sidebar-wrap">
        <Sidebar
          position="left"
          compact
          collapsed={collapsed}
          onCollapseChange={setCollapsed}
          collapsible
          collapsedWidth={64}
          width={240}
          groups={navGroups}
          header={
            <div className="nn-sidebar-brand">
              <div className="nn-sidebar-mark">
                <Sparkles size={14} />
              </div>
              <div className="nn-sidebar-brand-copy">
                <span className="nn-sidebar-brand-title">Nector Nest</span>
                <span className="nn-sidebar-brand-meta">IDM Core</span>
              </div>
            </div>
          }
          collapsedHeader={
            <div className="nn-sidebar-mark" title="Nector Nest IDM">
              <Sparkles size={14} />
            </div>
          }
          footer={
            <div className="nn-sidebar-user">
              <div className="nn-sidebar-avatar">{initials}</div>
              <div className="nn-sidebar-user-copy">
                <span className="nn-sidebar-user-name">{user?.name || user?.email || 'Operator'}</span>
                <span className="nn-sidebar-user-meta">{isAdmin ? 'admin' : 'user'} · active</span>
              </div>
              <button
                type="button"
                className="nn-icon-btn"
                title="Sign out"
                aria-label="Sign out"
                onClick={() => void logout()}
              >
                <LogOut size={13} />
              </button>
            </div>
          }
          collapsedFooter={
            <button
              type="button"
              className="nn-icon-btn"
              title="Sign out"
              aria-label="Sign out"
              style={{ width: 28, height: 28 }}
              onClick={() => void logout()}
            >
              <LogOut size={14} />
            </button>
          }
        />
      </div>

      <div className="nn-dashboard-viewport">
        <header className="nn-dashboard-topbar">
          <div className="nn-dashboard-topbar-left">
            <nav className="nn-dashboard-breadcrumb" aria-label="Breadcrumb">
              <span>{meta.group}</span>
              <span className="nn-dashboard-breadcrumb-sep">/</span>
              <span className="nn-dashboard-breadcrumb-current">{meta.label}</span>
            </nav>
          </div>
          <div className="nn-dashboard-topbar-right">
            <span className="muted small mono">{user?.email}</span>
            <Chip variant="status" tone={isAdmin ? 'warning' : 'info'}>
              {isAdmin ? 'ADMIN' : 'USER'}
            </Chip>
            <button
              type="button"
              className="nn-icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
        </header>

        <div className="nn-dashboard-main">
          <Outlet />
        </div>

        <Footer
          variant="minimal"
          className="nn-dashboard-footer"
          brand={
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} />
              <span>Nector Nest IDM</span>
            </div>
          }
          status={{ label: 'SYSTEM OPERATIONAL', state: 'operational' }}
          copyright={`© ${new Date().getFullYear()} Nector Nest. Cryptographic identity governance.`}
          legalLinks={[
            { label: 'Security Policy', href: '#security' },
            { label: 'Audit Compliance', href: '#compliance' },
            { label: 'API Protocols', href: '#api' },
          ]}
        />
      </div>
    </div>
  )
}
