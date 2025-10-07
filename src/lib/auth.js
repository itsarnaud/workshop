import Cookies       from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export const getToken = () => {
  return Cookies.get('token')
}

export const removeToken = () => {
  Cookies.remove('token')
}

export const isTokenValid = (token) => {
  const payload = jwtDecode(token)
  if (!payload) return false
  if (!payload.exp) return false
  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}

export function getUserFromToken(token) {
  return jwtDecode(token)
}
