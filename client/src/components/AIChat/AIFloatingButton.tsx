import React, { useEffect, useRef, useState } from 'react'
import { BotIcon, MessageIcon } from '@/components/icons/Icons'
import AIChatWindow from './AIChatWindow'
import { useAuth } from '@/state/AuthContext'

export default function AIFloatingButton() {
  const [open, setOpen] = useState(false)
  const [hasNew, setHasNew] = useState(true)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const { user } = useAuth()

  useEffect(() => { setMounted(true) }, [])

  function toggle() { setOpen(v => !v); setHasNew(false) }
  function close() { setOpen(false); btnRef.current?.focus() }

  const context = {
    currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
    userRole: (user as any)?.role,
    companyId: (user as any)?.companyId,
  }

  return (
    <>
      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-50" aria-live="polite">
        <button
          ref={btnRef}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="projectra-ai-chat"
          onClick={toggle}
          className="relative h-14 w-14 rounded-full shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 transition-transform duration-150 ease-out select-none"
          style={{
            background: 'linear-gradient(135deg, var(--chat-primary), #7c3aed)',
            boxShadow: '0 15px 35px rgba(37, 99, 235, 0.35)'
          }}
          title={open ? 'Close AI Assistant' : 'Open AI Assistant'}
        >
          <span className={`absolute inset-0 rounded-full ${!open ? 'animate-pulse' : ''}`} style={{ boxShadow: !open ? '0 0 0 10px rgba(37, 99, 235, 0.15)' : undefined, opacity: 0.6 }} aria-hidden="true" />
          {open ? <MessageIcon className="w-6 h-6 text-white" /> : <BotIcon className="w-6 h-6 text-white" />}
          {!open && hasNew && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white" aria-label="New" />}
        </button>
      </div>

      {/* Chat window */}
      <AIChatWindow id="projectra-ai-chat" isOpen={open} onClose={close} context={context} mounted={mounted} />
    </>
  )
}
