import React, { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { Link } from 'react-router-dom'

export default function Home() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/health')
        setHealth(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to load health')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h2>Dashboard</h2>
          <p className="small">Quick overview and navigation.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <Link className="button" to="/members">Manage Members</Link>
            <Link className="button" to="/projects">Projects</Link>
            <Link className="button" to="/tasks">Tasks</Link>
            <Link className="button" to="/analytics">Performance Analytics</Link>
            <Link className="button secondary" to="/profile">My Profile</Link>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card">
          <h3>API Health</h3>
          {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="loader" /> Loading...</div>}
          {error && <div className="error">{error}</div>}
          {health && (
            <pre className="small" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(health, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  )
}
