import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/state/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const [company, setCompany] = useState<string>('My Company')
  const [notifications] = useState<number>(0)
  const [aiOpen, setAiOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const nav = useNavigate()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = (target?.tagName || '').toLowerCase()
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || (target?.isContentEditable ?? false) || target?.getAttribute?.('role') === 'textbox'

      // Focus search with "/" only when not typing and without modifiers
      if (e.key === '/' && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }

      // Open Board with 'b' only when not typing and without modifiers
      if (e.key && e.key.toLowerCase() === 'b' && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        nav('/projects/board')
        return
      }

      if (e.key === 'Escape') setAiOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nav])

  return (
    <header className="pj-header">
      <div className="pj-left">
        <Link to="/" className="pj-brand">
          <div className="pj-logo" aria-label="ProJectra logo">PJ</div>
          <span className="pj-title">ProJectra</span>
        </Link>
        <div className="pj-company-switcher">
          <select className="pj-input" value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company switcher">
            <option>My Company</option>
            <option>Vendor A</option>
            <option>Vendor B</option>
          </select>
        </div>
      </div>

      <div className="pj-center">
        <input ref={searchRef} className="pj-input pj-search" placeholder="Search projects, tasks, members ( / )" />
      </div>

      <div className="pj-right">
        <button className="pj-icon-btn" title="Notifications" aria-label="Notifications">
          <span role="img" aria-label="bell">🔔</span>
          {notifications > 0 && <span className="pj-badge">{notifications}</span>}
        </button>
        <button className="pj-icon-btn" onClick={() => setAiOpen(v => !v)} title="AI Assistant" aria-haspopup>
          <span role="img" aria-label="sparkles">✨</span>
        </button>
        <div className="pj-profile">
          <div className="pj-avatar" title={user?.email}>{user?.firstName?.[0] || user?.email?.[0] || 'U'}</div>
          <div className="pj-user-info">
            <div className="pj-user-name">{user ? (user as any).firstName + ' ' + (user as any).lastName : 'Guest'}</div>
            <div className="pj-user-role">{(user as any)?.role || '—'}</div>
          </div>
          <button className="pj-btn secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      {aiOpen && (
        <div className="pj-ai-panel" role="dialog" aria-modal="false">
          <div className="pj-ai-header">
            <div>AI Assistant</div>
            <button className="pj-icon-btn" onClick={() => setAiOpen(false)} aria-label="Close">✖</button>
          </div>
          <div className="pj-ai-body">
            <p className="small">Ask guidance about your current task. Select a card on the board to get contextual suggestions.</p>
            <AIQuickHelp />
          </div>
        </div>
      )}
    </header>
  )
}

function AIQuickHelp() {
  const tips = [
    'Press B to open the Board, / to focus search.',
    'Drag cards between columns to update their status.',
    'Use filters on the Board to focus on what matters.',
  ]
  return (
    <ul className="list">
      {tips.map((t, i) => <li key={i} className="small">{t}</li>)}
    </ul>
  )
}
