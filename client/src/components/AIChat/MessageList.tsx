import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import { BotIcon, UserIcon } from '@/components/icons/Icons'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'error'
export type Role = 'user' | 'ai'

export interface Message {
  id: string
  role: Role
  text: string
  ts: string
  status?: MessageStatus
  error?: string
}

export default function MessageList({ messages, onRetry }: { messages: Message[], onRetry?: (m: Message) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <div data-messages ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-3 bg-white">
      <div className="space-y-3">
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} onRetry={onRetry} />
        ))}
      </div>
    </div>
  )
}
