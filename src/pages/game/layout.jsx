import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getToken, getUserFromToken } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'
import Countdown from '@/components/Countdown'

export default function GameLayout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!id) return setChecking(false)

    const checkMembership = async () => {
      const token = getToken()
      if (!token) {
        navigate('/', { replace: true })
        return
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/games/${id}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!res.ok) {
          navigate('/', { replace: true })
          return
        }

        const game = await res.json()

        const payload = getUserFromToken(token) || {};
        const user_id = payload.user_id || payload.guest_id;

        const isOwner = game.user && game.user.id === user_id
        const isGuest = Array.isArray(game.guests) && game.guests.some(g => g.id === user_id)

        if (!isOwner && !isGuest) {
          navigate('/', { replace: true })
          return
        }
      } catch (err) {
        console.error('Membership check failed', err)
        navigate('/', { replace: true })
      } finally {
        setChecking(false)
      }
    }

    checkMembership()
  }, [id, navigate])

  if (checking) return null

  return (
    <main>
      <Sidebar />
      <div className="ml-[300px]">
        <div className="w-full flex items-center justify-center h-[82px] p-2">
          <Countdown />
        </div>
        <div className="px-4 py-6">
          <Outlet />
        </div>
      </div>
    </main>
  )
}

