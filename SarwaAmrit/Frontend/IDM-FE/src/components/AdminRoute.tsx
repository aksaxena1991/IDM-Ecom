import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'

type Props = {
  children: React.ReactNode
  /** Any of these permissions grants access (same rules as nav `hasPermission`). */
  anyOf: string[]
}

export function AdminRoute({ children, anyOf }: Props) {
  const { isAuthenticated, hasPermission, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-center">
        <p className="muted">Loading…</p>
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasPermission(...anyOf)) return <Navigate to="/dashboard" replace />
  return children
}
