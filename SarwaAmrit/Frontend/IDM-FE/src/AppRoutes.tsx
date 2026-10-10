import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AccessEvaluatePage } from './features/admin/access/pages/AccessEvaluatePage'
import { AppsPage } from './features/admin/apps/pages/AppsPage'
import { AuditPage } from './features/admin/audit/pages/AuditPage'
import { GroupsPage } from './features/admin/groups/pages/GroupsPage'
import { PoliciesPage } from './features/admin/policies/pages/PoliciesPage'
import { RolesPage } from './features/admin/roles/pages/RolesPage'
import { UsersPage } from './features/admin/users/pages/UsersPage'
import { CallbackPage } from './features/auth/pages/CallbackPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { SignupPage } from './features/auth/pages/SignupPage'
import { SecurityPage } from './features/security/pages/SecurityPage'
import { DashboardPage } from './features/workspace/pages/DashboardPage'

/** Route tree only — a host shell can wrap this with its own router/basename. */
export function AppRoutes() {
  return (
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
            <AdminRoute anyOf={['users:write']}>
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
  )
}

export default AppRoutes
