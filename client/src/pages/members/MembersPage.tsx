import React, { useEffect, useMemo, useState } from 'react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { api, getErrorMessage } from '@/services/api'

export default function MembersPage() {
  const [items, setItems] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h2>Members</h2>
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
                <div style={{ width: 36, height: 36, borderRadius: 18, background: '#1f2937', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {String(u.firstName || 'U')[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div>{u.firstName} {u.lastName} <span className="small">({u.email})</span></div>
                  <div className="small">{u.role} • {u.status}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
