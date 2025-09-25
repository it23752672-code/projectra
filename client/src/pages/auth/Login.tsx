import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { api, getErrorMessage } from '@/services/api'
import { useAuth } from '@/state/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation() as any
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.accessToken, data.user)
      const to = loc.state?.from?.pathname || '/'
      nav(to, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>Welcome back</h2>
      <p className="small">Sign in to continue</p>
      <form onSubmit={onSubmit}>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
      </form>
      <div className="small" style={{ marginTop: 12 }}>
        New here? <Link to="/register">Create an account</Link>
      </div>
    </div>
  )
}
