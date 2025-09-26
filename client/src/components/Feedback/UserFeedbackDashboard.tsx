import React, { useEffect, useState } from 'react'
import { feedbackService } from '@/services/feedbackService'
import { io } from 'socket.io-client'

const statusColors: Record<string, string> = {
  pending: 'badge yellow',
  in_progress: 'badge blue',
  resolved: 'badge green',
  closed: 'badge gray',
  rejected: 'badge red',
}

const typeIcons: Record<string, string> = {
  bug: '🐛',
  feature_request: '✨',
  improvement: '⚡',
  ui_issue: '🎨',
  performance: '🚀',
  general: '💬',
}

export default function UserFeedbackDashboard() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all')

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus])

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
    try {
      const res = await feedbackService.getUserFeedback(1, selectedStatus === 'all' ? undefined : selectedStatus)
      setItems(res.feedback || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card">Loading...</div>

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>My Feedback</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['all', 'pending', 'in_progress', 'resolved'] as const).map(s => (
              <button key={s} className={`btn small ${selectedStatus === s ? '' : 'secondary'}`} onClick={() => setSelectedStatus(s)}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="col-12">
        {items.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>📝</div>
            <div className="small">No feedback found</div>
          </div>
        ) : (
          items.map((it) => (
            <div key={it._id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 24 }}>{typeIcons[it.feedbackType] || '💬'}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.title}</div>
                    <div className="small" style={{ color: '#666' }}>
                      Type: {String(it.feedbackType).replace('_', ' ')} · Priority: {it.priority} · {new Date(it.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={statusColors[it.status] || 'badge'}>{String(it.status).replace('_', ' ')}</span>
              </div>
              <div style={{ marginTop: 8 }}>{it.feedbackText}</div>
              {it.reply && (
                <div className="card" style={{ background: '#f3faf3', borderColor: '#d3efd3', marginTop: 8 }}>
                  <div className="small" style={{ fontWeight: 600, color: '#246b2c' }}>Admin Response</div>
                  <div style={{ color: '#246b2c' }}>{it.reply}</div>
                  {it.resolvedAt && <div className="small" style={{ color: '#246b2c' }}>Resolved on {new Date(it.resolvedAt).toLocaleDateString()}</div>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
