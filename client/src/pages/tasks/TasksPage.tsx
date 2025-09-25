import React, { useEffect, useState } from 'react'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import { api, getErrorMessage } from '@/services/api'

const STATUSES = ['Not Started', 'In Progress', 'Completed', 'Blocked']

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projectId, setProjectId] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {}
      if (projectId) params.projectId = projectId
      if (q) params.q = q
      const { data } = await api.get('/tasks', { params })
      setTasks(data.tasks || [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/status`, { status })
      setTasks(prev => prev.map(t => t._id === id ? data.task : t))
    } catch (err) { alert(getErrorMessage(err)) }
  }

  const updateProgress = async (id: string, progress: number) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/progress`, { progress })
      setTasks(prev => prev.map(t => t._id === id ? data.task : t))
    } catch (err) { alert(getErrorMessage(err)) }
  }

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h2>Tasks</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <Input placeholder="Project ID (optional)" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
            <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
            <Button onClick={fetchTasks}>Apply</Button>
          </div>
          {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="loader" /> Loading...</div>}
          {error && <div className="error">{error}</div>}
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <h3>Results</h3>
          <ul className="list">
            {tasks.map(t => (
              <li key={t._id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div className="small">{t.description}</div>
                  <div className="small">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select className="input" value={t.status} onChange={(e) => updateStatus(t._id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className="input" style={{ width: 90 }} type="number" min={0} max={100} value={t.progress || 0} onChange={(e) => updateProgress(t._id, Number(e.target.value))} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
