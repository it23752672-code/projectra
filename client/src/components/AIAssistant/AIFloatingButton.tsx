import React, { useState } from 'react'
import AIChat from './AIChat'
import { BotIcon, MessageIcon, SparklesIcon } from '@/components/icons/Icons'
import { useAuth } from '@/state/AuthContext'

export default function AIFloatingButton() {
  const [open, setOpen] = useState(false)
  const [hasNew, setHasNew] = useState(true)
  const { user } = useAuth()

  const context = {
    currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
    userRole: (user as any)?.role,
    companyId: (user as any)?.companyId,
    isIntern: String((user as any)?.role || '').toLowerCase().includes('intern') || String((user as any)?.role || '').toLowerCase().includes('junior'),
  }

  function toggle() { setOpen(v => !v); setHasNew(false) }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={toggle} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 relative" title="Open AI Assistant">
          {open ? <MessageIcon className="w-6 h-6" /> : <BotIcon className="w-6 h-6" />}
          {hasNew && !open && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
          {!open && <SparklesIcon className="absolute -top-2 -right-2 w-4 h-4 text-yellow-300 animate-pulse" />}
        </button>
        {!open && (
          <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-80 whitespace-nowrap">
            Need help? Ask AI Assistant!
            <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
        )}
      </div>
      <AIChat isVisible={open} onClose={() => setOpen(false)} context={context} />
    </>
  )
}
