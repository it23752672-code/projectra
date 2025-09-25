import React, { useEffect, useState } from 'react'
import { BotIcon, UserIcon } from '@/components/icons/Icons'
import type { Message } from './MessageList'

export default function MessageBubble({ message, onRetry }: { message: Message, onRetry?: (m: Message) => void }) {
  const isUser = message.role === 'user'
  const [entered, setEntered] = useState(false)
  useEffect(() => { const t = setTimeout(() => setEntered(true), 10); return () => clearTimeout(t) }, [])

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${entered ? 'message-enter-active' : 'message-enter'}`}>
      {!isUser && (
        <div className="mt-5 mr-2">
          <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
            <BotIcon className="w-4 h-4 text-[color:var(--chat-primary-dark)]" />
          </div>
        </div>
      )}
      <div className={`relative max-w-[80%] px-3 py-2 rounded-lg ${isUser ? 'text-white' : 'text-[color:var(--chat-text)]'} ${isUser ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-gray-100 to-gray-50 border'}`}>
        {/* Tail */}
        <span className={`absolute ${isUser ? 'right-[-6px] border-l-blue-700' : 'left-[-6px] border-r-gray-200'} top-3 w-0 h-0 border-y-8 border-y-transparent ${isUser ? 'border-l-8 border-l-blue-700' : 'border-r-8 border-r-gray-200'}`} aria-hidden="true"></span>
        <div className="whitespace-pre-wrap text-[15px] leading-6">{message.text}</div>
        {isUser && (
          <div className="flex items-center gap-1 text-xs opacity-80 justify-end mt-1">
            {message.status === 'error' ? (
              <>
                <span className="text-[color:var(--chat-error)]">! Failed</span>
                {onRetry && <button className="underline" onClick={() => onRetry(message)}>Retry</button>}
              </>
            ) : (
              <>
                <StatusIcon status={message.status || 'sent'} />
                <span>{message.status || 'sent'}</span>
              </>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="mt-5 ml-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  )
}

function StatusIcon({ status }: { status: NonNullable<Message['status']> }) {
  if (status === 'error') return <span className="text-[color:var(--chat-error)]">!</span>
  if (status === 'delivered') return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/><path d="M24 6L13 17"/></svg>
  )
  if (status === 'sent') return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
  )
  // sending
  return <span className="w-4 h-4 rounded-full border-2 border-white border-r-transparent animate-spin inline-block" aria-label="Sending" />
}
