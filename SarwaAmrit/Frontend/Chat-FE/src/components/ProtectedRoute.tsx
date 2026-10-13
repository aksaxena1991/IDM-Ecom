import { Navigate, useLocation } from 'react-router-dom'
import { Loader } from '@thoughtstream/ui'
import { useAuth } from '../features/auth/context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="chat-loading">
        <Loader size="lg" label="Loading session" centered />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
