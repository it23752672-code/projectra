import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { api, getErrorMessage } from '@/services/api'
import { useAuth } from '@/state/AuthContext'

export default function Register() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/register', { firstName, lastName, email, password })
      login(data.accessToken, data.user)
      nav('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <h2>Create your account</h2>
      <form onSubmit={onSubmit}>
        <div className="grid">
          <div className="col-12 col-md-6"><Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
          <div className="col-12 col-md-6"><Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="error" style={{ marginBottom: 8 }}>{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
      </form>
      <div className="small" style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  )
}
