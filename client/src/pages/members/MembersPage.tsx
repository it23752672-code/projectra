import React, { useEffect, useMemo, useState } from 'react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { api, getErrorMessage } from '@/services/api'
import { useAuth } from '@/state/AuthContext'

export default function MembersPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add member form state
  const [showAdd, setShowAdd] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [newRole, setNewRole] = useState('Contributor')
  const [newStatus, setNewStatus] = useState('active')
  const [submitting, setSubmitting] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Edit member state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState('Contributor')
  const [editStatus, setEditStatus] = useState('active')
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (q) params.q = q
      if (role) params.role = role
      if (status) params.status = status
      const { data } = await api.get('/users', { params })
      setItems(data.users || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const roles = ['Admin', 'ProjectManager', 'Contributor']
  const statuses = ['active', 'inactive', 'suspended']

  const filtered = useMemo(() => items, [items])

  const canManage = user?.role === 'Admin' || user?.role === 'ProjectManager'

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setEmail('')
    setNewRole('Contributor')
    setNewStatus('active')
    setPassword('')
    setConfirmPassword('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // Validate password only if Admin provided it
      if (user?.role === 'Admin' && password) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          setSubmitting(false)
          return
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          setSubmitting(false)
          return
        }
      }

      const payload: any = { firstName, lastName, email, role: newRole, status: newStatus }
      if (user?.role === 'Admin' && password) payload.password = password

      // PMs and Admins can create via /users
      await api.post('/users', payload)
      resetForm()
      setShowAdd(false)
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    setError(null)
    try {
      if (user?.role === 'Admin') {
        // Hard delete available for Admins
        await api.delete(`/admin/users/${id}`)
      } else {
        // For Project Managers, fall back to deactivating the user
        await api.patch(`/users/${id}/status`, { status: 'inactive' })
      }
      await fetchData()
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  const openEdit = (u: any) => {
    setEditingId(u._id)
    setEditFirstName(u.firstName || '')
    setEditLastName(u.lastName || '')
    setEditEmail(u.email || '')
    setEditRole(u.role || 'Contributor')
    setEditStatus(u.status || 'active')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setSavingEdit(true)
    try {
      if (user?.role === 'Admin') {
        await api.put(`/admin/users/${editingId}`, {
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          role: editRole,
          status: editStatus,
        })
      } else {
        // Project Managers can change status only
        await api.patch(`/users/${editingId}/status`, { status: editStatus })
      }
      setEditingId(null)
      await fetchData()
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Members</h2>
            {canManage && (
              <Button onClick={() => setShowAdd(v => !v)}>{showAdd ? 'Close' : 'Add Member'}</Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <Input placeholder="Search name/email..." value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button onClick={fetchData}>Apply</Button>
          </div>
          {showAdd && canManage && (
            <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, marginTop: 12 }}>
              <div className="col-span-6 sm:col-span-2"><Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required /></div>
              <div className="col-span-6 sm:col-span-2"><Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required /></div>
              <div className="col-span-6 sm:col-span-2"><Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="col-span-6 sm:col-span-2">
                <label className="small" style={{ display: 'block', marginBottom: 6 }}>Role</label>
                <select className="input" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-6 sm:col-span-2">
                <label className="small" style={{ display: 'block', marginBottom: 6 }}>Status</label>
                <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {user?.role === 'Admin' && (
                <>
                  <div className="col-span-6 sm:col-span-2"><Input label="Password (optional)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                  <div className="col-span-6 sm:col-span-2"><Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
                </>
              )}
              <div className="col-span-6 sm:col-span-2" style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
                <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
                <Button type="button" variant="secondary" onClick={() => { setShowAdd(false); resetForm() }}>Cancel</Button>
              </div>
            </form>
          )}
          {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><div className="loader" /> Loading...</div>}
          {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <h3>Results</h3>
          {!filtered.length && !loading && <div className="small">No members found.</div>}
          <ul className="list">
            {filtered.map(u => (
              <li key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 0' }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: '#1f2937', color: '#fff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {String(u.firstName || 'U')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div>{u.firstName} {u.lastName} <span className="small">({u.email})</span></div>
                  <div className="small">{u.role} • {u.status}</div>
                </div>
                {canManage && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                    <Button variant="secondary" onClick={() => handleDelete(u._id)} disabled={String(u._id) === String(user?.id)}>
                      Delete
                    </Button>
                  </div>
                )}

                {editingId === u._id && (
                  <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, marginTop: 12, width: '100%' }}>
                    {user?.role === 'Admin' && (
                      <>
                        <div className="col-span-6 sm:col-span-2"><Input label="First name" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} required /></div>
                        <div className="col-span-6 sm:col-span-2"><Input label="Last name" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} required /></div>
                        <div className="col-span-6 sm:col-span-2"><Input label="Email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required /></div>
                        <div className="col-span-6 sm:col-span-2">
                          <label className="small" style={{ display: 'block', marginBottom: 6 }}>Role</label>
                          <select className="input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                    <div className="col-span-6 sm:col-span-2">
                      <label className="small" style={{ display: 'block', marginBottom: 6 }}>Status</label>
                      <select className="input" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-6 sm:col-span-2" style={{ display: 'flex', alignItems: 'end', gap: 8 }}>
                      <Button type="submit" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save'}</Button>
                      <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
