import Input  from '@/components/ui/input'
import Label  from '@/components/ui/label'
import Button from '@/components/ui/button'
import { useState } from 'react'
import { Link }     from 'react-router-dom'

export default function Signup() {
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const signup = async (e) => {
    e.preventDefault()
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      
      const data = await response.json();
  
      if (response.ok) {
        console.log(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={signup} className='grid w-full items-center gap-5'>
      <div className='space-y-2'>
        <Label htmlFor="username">Nom d'utilisateur</Label>
        <Input
          type="text"
          placeholder="Nom d'utilisateur"
          id="username"
          name="username"
          value={form.username}
          onChange={onChange}
        />
      </div>
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

      <p>Déjà un compte ? <Link to="/login" className="text-primary hover:underline">Connecte toi ici !</Link></p>
      <Button type="submit" className="cursor-pointer">S'inscrire</Button>
    </form>
  )
}
