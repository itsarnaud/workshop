import Input  from '@/components/ui/input'
import Label  from '@/components/ui/label'
import Button from '@/components/ui/button'
import Cookies      from 'js-cookie'
import { useState } from 'react'
import { Link, useNavigate, useLocation }     from 'react-router-dom'
import { useEffect } from 'react'
import { getToken, isTokenValid } from '@/lib/auth'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('');
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    const token = getToken();
    const isValid = isTokenValid(token);

    if (isValid) {
      navigate('/games', { replace: true });
    }
  }, [navigate])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const login = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json();
      if (response.ok) {
        Cookies.set('token', data.token);
        navigate(from, { replace: true })
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={login} className='grid w-full items-center gap-5'>
      <div className='space-y-2'>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          placeholder="Email"
          id="email"
          name="email"
          value={form.email}
          onChange={onChange}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          type="password"
          placeholder="Mot de passe"
          id="password"
          name="password"
          value={form.password}
          onChange={onChange}
        />
      </div>
      {error ? <span className="text-red-600 text-sm -mt-3">{error}</span> : ''}

      <p>Pas de compte ? <Link to="/signup" className="text-primary hover:underline">Inscris toi ici !</Link></p>
      <Button type="submit" className="cursor-pointer">Se connecter</Button>
    </form> 
  )
}
