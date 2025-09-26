import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const displayName = (user as any)?.firstName
    ? `${(user as any).firstName} ${((user as any).lastName || '')}`.trim()
    : user?.name || user?.email || 'User'

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <h2>Welcome back, {displayName}!</h2>
          <p className="small">Quick overview and navigation to manage your work efficiently.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <Link className="button" to="/members">👥 Manage Members</Link>
            <Link className="button" to="/projects">📁 Projects</Link>
            <Link className="button" to="/tasks">✓ Tasks</Link>
            <Link className="button" to="/analytics">📊 Performance Analytics</Link>
            <Link className="button secondary" to="/profile">👤 My Profile</Link>
            <Link className="button secondary" to="/feedback/submit">💬 Submit Feedback</Link>
            <Link className="button secondary" to="/feedback/my-feedback">📝 My Feedback</Link>
          </div>
        </div>
      </div>
      {/* Optional: Add quick stats or recent activity sections here in the future */}
    </div>
  )
}
