import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { SessionSkeleton } from './ContentSkeleton'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <SessionSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
