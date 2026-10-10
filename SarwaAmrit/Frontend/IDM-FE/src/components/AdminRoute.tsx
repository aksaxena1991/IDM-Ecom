import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/context/AuthContext'
import { SessionSkeleton } from './ContentSkeleton'

type Props = {
  children: React.ReactNode
  /** Any of these permissions grants access (same rules as nav `hasPermission`). */
  anyOf: string[]
}

export function AdminRoute({ children, anyOf }: Props) {
  const { isAuthenticated, hasPermission, loading } = useAuth()

  if (loading) {
    return <SessionSkeleton />
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!hasPermission(...anyOf)) return <Navigate to="/dashboard" replace />
  return children
}
