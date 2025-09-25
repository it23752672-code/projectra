import React, { useEffect, useState } from 'react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { api, getErrorMessage } from '@/services/api'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState('system')

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
      setFirstName(data.user.firstName || '')
      setLastName(data.user.lastName || '')
      setAvatarUrl(data.user.avatarUrl || '')
      setNotifications(!!data.user?.preferences?.notifications)
      setTheme(data.user?.preferences?.theme || 'system')
    })()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/users/me', { firstName, lastName, avatarUrl, preferences: { notifications, theme } })
      setUser(data.user)
      alert('Profile updated')
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!user) return <div className="card">Loading...</div>

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h2>My Profile</h2>
          <form onSubmit={save}>
            <div className="grid">
              <div className="col-12 col-md-6"><Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
              <div className="col-12 col-md-6"><Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            </div>
            <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
            <div className="grid">
              <div className="col-12 col-md-6">
                <label className="small" style={{ display: 'block', marginBottom: 6 }}>Theme</label>
                <select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="system">System</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div className="col-12 col-md-6" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />
                  Enable notifications
                </label>
              </div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
