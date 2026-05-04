import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore()

  // Admin routes - only check admin status
  if (adminOnly) {
    if (!isAdmin) {
      return <Navigate to="/admin/login" replace />
    }
    return <>{children}</>
  }

  // Regular routes - require authentication
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
