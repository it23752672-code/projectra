import React, { useEffect, useState } from 'react'
import { feedbackService } from '@/services/feedbackService'
import { useAuth } from '@/state/AuthContext'
import { io } from 'socket.io-client'

export default function AdminFeedbackDashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const socket = io()
    const onUpdate = () => fetchData()
    socket.on('feedback:new', onUpdate)
    socket.on('feedback:updated', onUpdate)
    return () => {
      socket.off('feedback:new', onUpdate)
      socket.off('feedback:updated', onUpdate)
      socket.close()
    }
  }, [])

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [all, st] = await Promise.all([
        feedbackService.getAllFeedback(),
        feedbackService.getFeedbackStats(),
      ])
      setItems(all.feedback || [])
      setStats(all.stats || st.stats || {})
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  async function update() {
    if (!selected) return
    try {
      await feedbackService.updateFeedback(selected._id, { status: newStatus, reply: replyText })
      alert('Feedback updated successfully')
      setSelected(null)
      setReplyText('')
      setNewStatus('')
      fetchData()
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Failed to update feedback')
    }
  }

  if (user?.role !== 'Admin') return <div className="card">Access denied</div>
  if (loading) return <div className="card">Loading...</div>

  return (
    <div className="grid">
      <div className="col-12">
        <h2>Feedback Management</h2>
      </div>

      <div className="col-12">
        <div className="grid">
          <div className="col-6 col-md-3"><StatCard label="Total" value={stats.total || 0} color="#2452f7" /></div>
          <div className="col-6 col-md-3"><StatCard label="Pending" value={stats.pending || 0} color="#d09400" /></div>
          <div className="col-6 col-md-3"><StatCard label="In Progress" value={stats.inProgress || 0} color="#2452f7" /></div>
          <div className="col-6 col-md-3"><StatCard label="Resolved" value={stats.resolved || 0} color="#2e7d32" /></div>
        </div>
      </div>

      {error && <div className="col-12"><div className="error">{error}</div></div>}

      <div className="col-12">
        <div className="card">
          <h3>All Feedback</h3>
          <div className="table">
            <div className="thead">
              <div>User</div><div>Title</div><div>Type</div><div>Priority</div><div>Status</div><div>Date</div><div>Actions</div>
            </div>
            {items.map(it => (
              <div key={it._id} className="tr">
                <div>
                  <div className="small" style={{ fontWeight: 600 }}>{it.userId?.firstName} {it.userId?.lastName}</div>
                  <div className="small" style={{ color: '#666' }}>{it.userId?.email}</div>
                </div>
                <div>{it.title}</div>
                <div className="small">{it.feedbackType}</div>
                <div><span className="badge">{it.priority}</span></div>
                <div><span className="badge">{String(it.status).replace('_', ' ')}</span></div>
                <div className="small">{new Date(it.createdAt).toLocaleDateString()}</div>
                <div><button className="btn small" onClick={() => { setSelected(it); setReplyText(it.reply || ''); setNewStatus(it.status); }}>Manage</button></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Manage Feedback</div>
              <button className="icon-btn" onClick={() => setSelected(null)}>✖</button>
            </div>
            <div className="modal-body">
              <div style={{ fontWeight: 600 }}>{selected.title}</div>
              <div className="small" style={{ color: '#666', marginTop: 4 }}>{selected.feedbackText}</div>

              <label className="small" style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>Status</label>
              <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>

              <label className="small" style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>Admin Reply</label>
              <textarea className="input" rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Provide response to the user..." />

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="btn secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button className="btn" onClick={update}>Update Feedback</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div className="small" style={{ color: '#666' }}>{label}</div>
    </div>
  )
}
