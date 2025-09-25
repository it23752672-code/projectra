import React, { useEffect, useRef, useState } from 'react'
import { BotIcon } from '@/components/icons/Icons'

export default function ChatHeader({ onClose, onMinimize, isMinimized, onClear, onExport }: { onClose: () => void, onMinimize: () => void, isMinimized: boolean, onClear: () => void, onExport: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="h-14 flex items-center justify-between px-4 rounded-t-xl text-white" style={{ background: 'linear-gradient(135deg, var(--chat-primary), var(--chat-primary-dark))' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <BotIcon className="w-4 h-4" />
        </div>
        <div className="font-semibold">ProJectra AI Assistant</div>
      </div>
      <div className="flex items-center gap-1">
        <div className="relative" ref={menuRef}>
          <button
            aria-label="AI quick actions"
            className="h-8 w-8 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span className="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
          {menuOpen && (
            <div role="menu" aria-label="Quick actions" className="absolute right-0 mt-2 w-56 rounded-lg bg-white text-[color:var(--chat-text)] shadow-xl border z-50">
              <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-t-lg" onClick={() => { onClear(); setMenuOpen(false) }}>Clear conversation</button>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { onExport(); setMenuOpen(false) }}>Export chat history</button>
              <div className="px-3 py-2 text-sm text-[color:var(--chat-text-light)]">AI capabilities: task guidance, project onboarding, and skill development.</div>
              <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-b-lg" onClick={() => { alert('Thanks for your feedback!'); setMenuOpen(false) }}>Feedback & rating</button>
            </div>
          )}
        </div>
        <button aria-label={isMinimized ? 'Expand' : 'Minimize'} title={isMinimized ? 'Expand' : 'Minimize'} className="h-8 px-2 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60" onClick={onMinimize}>
          {isMinimized ? '▢' : '—'}
        </button>
        <button aria-label="Close" title="Close" className="h-8 px-2 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60" onClick={onClose}>×</button>
      </div>
    </div>
  )
}
