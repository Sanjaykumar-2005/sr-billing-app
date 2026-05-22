import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const location = useLocation()

  if (currentUser === null) return <Navigate to="/login" replace />

  const allowed =
    !allowedRoles ||
    allowedRoles.includes(currentUser.role) ||
    (currentUser.role.startsWith('billing_') && allowedRoles.some((role) => role.startsWith('billing_')))

  if (!allowed) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ denied: true, attempted: location.pathname }}
      />
    )
  }

  return <Outlet />
}
