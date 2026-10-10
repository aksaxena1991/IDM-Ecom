import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AdminRoute } from './components/AdminRoute'
import { AppLayout } from './components/AppLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import { StepUpModalProvider } from './components/StepUpModal'
import { AccessEvaluatePage } from './pages/admin/AccessEvaluatePage'
import { AppsPage } from './pages/admin/AppsPage'
import { AuditPage } from './pages/admin/AuditPage'
import { PoliciesPage } from './pages/admin/PoliciesPage'
import { GroupsPage } from './pages/admin/GroupsPage'
import { RolesPage } from './pages/admin/RolesPage'
import { UsersPage } from './pages/admin/UsersPage'
import { CallbackPage } from './pages/CallbackPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { SecurityPage } from './pages/SecurityPage'

/** Route tree only — a host shell can wrap this with its own router/basename. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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

/** IDM application without a router — hosts should provide BrowserRouter. */
export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StepUpModalProvider>
          <AppRoutes />
        </StepUpModalProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
