import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#071020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '360px', padding: '2.5rem', border: '1px solid rgba(201,169,110,0.15)', borderRadius: '4px', background: 'rgba(10,24,40,0.8)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, letterSpacing: '0.3em', color: '#f7f0e6', textAlign: 'center', textTransform: 'uppercase', margin: '0 0 2rem' }}>
          Itsaski
        </h1>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: '2rem' }}>Acceso administrador</p>

        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(168,212,224,0.6)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ width: '100%', padding: '0.6rem 0.75rem', background: 'rgba(30,107,138,0.1)', border: '1px solid rgba(30,107,138,0.3)', borderRadius: '2px', color: '#e8f4f8', fontSize: '0.85rem', marginBottom: '1rem', outline: 'none', fontFamily: 'var(--font-body)' }}
        />

        <label style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(168,212,224,0.6)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Contraseña</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)} required
          style={{ width: '100%', padding: '0.6rem 0.75rem', background: 'rgba(30,107,138,0.1)', border: '1px solid rgba(30,107,138,0.3)', borderRadius: '2px', color: '#e8f4f8', fontSize: '0.85rem', marginBottom: '1.5rem', outline: 'none', fontFamily: 'var(--font-body)' }}
        />

        {error && <p style={{ color: '#f87171', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <button
          type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.7rem', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '2px', fontFamily: 'var(--font-body)', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
