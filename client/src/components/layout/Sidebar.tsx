import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const loc = useLocation()
  const is = (path: string) => loc.pathname === path || loc.pathname.startsWith(path + '/')
  return (
    <aside className={"pj-sidebar" + (open ? "" : " collapsed") }>
      <div className="pj-sidebar-top">
        <button className="pj-icon-btn" onClick={() => setOpen(o => !o)} title="Toggle sidebar" aria-expanded={open}>☰</button>
      </div>
      <nav className="pj-nav">
        <NavLink to="/" active={is('/')} label="Dashboard" />
        <NavLink to="/projects" active={is('/projects')} label="My Projects" badge={undefined} />
        <NavLink to="/projects/board" active={is('/projects/board')} label="Board" />
        <NavLink to="/tasks" active={is('/tasks')} label="My Tasks" />
        <NavLink to="/members" active={is('/members')} label="Team Members" />
        <NavLink to="/network" active={is('/network')} label="Companies Network" />
        <NavLink to="/analytics" active={is('/analytics')} label="Performance Analytics" />
        <NavLink to="/profile" active={is('/profile')} label="Profile / Settings" />
      </nav>
    </aside>
  )
}

function NavLink({ to, label, active, badge }: { to: string, label: string, active?: boolean, badge?: number | undefined }) {
  return (
    <Link to={to} className={"pj-nav-link" + (active ? " active" : "") }>
      <span className="pj-nav-icon">•</span>
      <span className="pj-nav-text">{label}</span>
      {typeof badge === 'number' && <span className="pj-badge">{badge}</span>}
    </Link>
  )
}
