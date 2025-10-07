import { Navigate, useLocation } from 'react-router-dom'
import { getToken, isTokenValid } from '@/lib/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const token    = getToken()

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
