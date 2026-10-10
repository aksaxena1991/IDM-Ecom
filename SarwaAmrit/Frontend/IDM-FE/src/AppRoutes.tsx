import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { AppLayout } from './components/AppLayout'
import { RouteFallback } from './components/ContentSkeleton'
import { ProtectedRoute } from './components/ProtectedRoute'
import { lazyPage } from './core/lazyPage'
import { LoginPage } from './features/auth/pages/LoginPage'

const RegisterPage = lazyPage(() => import('./features/auth/pages/RegisterPage'), 'RegisterPage')
const SignupPage = lazyPage(() => import('./features/auth/pages/SignupPage'), 'SignupPage')
const CallbackPage = lazyPage(() => import('./features/auth/pages/CallbackPage'), 'CallbackPage')
const DashboardPage = lazyPage(() => import('./features/workspace/pages/DashboardPage'), 'DashboardPage')
const SecurityPage = lazyPage(() => import('./features/security/pages/SecurityPage'), 'SecurityPage')
const AppsPage = lazyPage(() => import('./features/admin/apps/pages/AppsPage'), 'AppsPage')
const UsersPage = lazyPage(() => import('./features/admin/users/pages/UsersPage'), 'UsersPage')
const PoliciesPage = lazyPage(() => import('./features/admin/policies/pages/PoliciesPage'), 'PoliciesPage')
const RolesPage = lazyPage(() => import('./features/admin/roles/pages/RolesPage'), 'RolesPage')
const GroupsPage = lazyPage(() => import('./features/admin/groups/pages/GroupsPage'), 'GroupsPage')
const AccessEvaluatePage = lazyPage(
  () => import('./features/admin/access/pages/AccessEvaluatePage'),
  'AccessEvaluatePage',
)
const AuditPage = lazyPage(() => import('./features/admin/audit/pages/AuditPage'), 'AuditPage')

/** Route tree only — a host shell can wrap this with its own router/basename. */
export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/callback" element={<CallbackPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route
            path="/admin/apps"
            element={
              <AdminRoute anyOf={['apps:read', 'apps:write']}>
                <AppsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute anyOf={['users:read', 'users:write', 'users:create', 'users:update', 'users:delete']}>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/policies"
            element={
              <AdminRoute anyOf={['policies:write']}>
                <PoliciesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/roles"
            element={
              <AdminRoute anyOf={['roles:write']}>
                <RolesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <AdminRoute anyOf={['groups:read', 'groups:write']}>
                <GroupsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/access"
            element={
              <AdminRoute anyOf={['admin:access']}>
                <AccessEvaluatePage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <AdminRoute anyOf={['audit:read']}>
                <AuditPage />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
