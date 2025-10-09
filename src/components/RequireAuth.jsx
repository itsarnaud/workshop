import { Navigate, useLocation } from 'react-router-dom'
import { getRole, getToken, isTokenValid } from '@/lib/auth'

export default function RequireAuth({ children, allowGuest = false }) {
  const location = useLocation();
  const token    = getToken();
  const role     = getRole();

  if (!token || !isTokenValid(token) || (!allowGuest && role === 'guest')) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
