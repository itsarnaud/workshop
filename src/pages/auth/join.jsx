import Input   from '@/components/ui/input'
import Label   from '@/components/ui/label'
import Button  from '@/components/ui/button'
import Cookies from 'js-cookie'
import { useState, useEffect }  from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from '@/socket'
import { LoaderCircle } from 'lucide-react'

export default function Join() {
  const [form, setForm] = useState({ username: '' })
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const join = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invitations/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json();
      if (response.ok) {
        Cookies.set('guest_token', data.token);

        try {
          if (data.game_id) socket.emit('joinGame', { gameId: data.game_id, role: 'guest' });
        } catch (err) {
          console.warn('socket join failed', err);
        }

        socket.on('game:started', () => {
          navigate(`/game/${data.game_id}`, { replace: true });
        })
      } else {
        setLoading(false);
        setError(data.error);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }

  useEffect(() => {
    return () => {
      socket.off('game:started');
    }
  }, [])

  return (
    <form onSubmit={join} className='grid w-full items-center gap-5'>
      <div className='space-y-2'>
        <Label htmlFor="username">Nom d'utilisateur</Label>
        <Input
          type="username"
          placeholder="Nom d'utilisateur"
          id="username"
          name="username"
          value={form.username}
          onChange={onChange}
          disabled={loading}
        />
      </div>
      {error ? <span className="text-red-600 text-sm -mt-3">{error}</span> : ''}

      <Button type="submit" className="cursor-pointer" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" /> : 'Rejoins la partie !'}</Button>
    </form> 
  )
}
