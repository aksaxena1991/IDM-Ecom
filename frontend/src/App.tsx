import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AdminRoute } from './components/AdminRoute'
import { AppLayout } from './components/AppLayout'
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

export default function App() {
  return (
    <AuthProvider>
      <StepUpModalProvider>
        <BrowserRouter>
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
                  <AdminRoute>
                    <AppsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/policies"
                element={
                  <AdminRoute>
                    <PoliciesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <AdminRoute>
                    <RolesPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/groups"
                element={
                  <AdminRoute>
                    <GroupsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/access"
                element={
                  <AdminRoute>
                    <AccessEvaluatePage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <AdminRoute>
                    <AuditPage />
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </StepUpModalProvider>
    </AuthProvider>
  )
}
