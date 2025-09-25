import React, { useEffect, useMemo, useRef, useState } from 'react'
import ChatHeader from './ChatHeader'
import MessageList, { Message } from './MessageList'
import SuggestionChips from './SuggestionChips'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import { aiService } from '@/services/aiService'

export default function AIChatWindow({ id, isOpen, onClose, context, mounted }: { id: string, isOpen: boolean, onClose: () => void, context?: any, mounted?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [errorCount, setErrorCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Welcome message with suggestions on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: Message = {
        id: Date.now().toString(),
        role: 'ai',
        text: `Hi! I'm your ProJectra AI Assistant. I can help with:\n\n• Task Management — break down complex work\n• Project Guidance — best practices & timelines\n• Skill Development — learning resources\n• Tool Usage — ProJectra tips\n\nWhat can I help you with today?`,
        ts: new Date().toISOString(),
      }
      setMessages([welcome])
      setSuggestions([
        'How should I prioritize my tasks?',
        'What are the next steps for my project?',
        'Which skills should I focus on?',
        'How do I collaborate with a partner company?'
      ])
    }
  }, [isOpen])

  // Focus management
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => textAreaRef.current?.focus(), 0)
    }
  }, [isOpen, isMinimized])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scroller = containerRef.current?.querySelector('[data-messages]') as HTMLElement | null
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight
    }
  }, [messages, isTyping])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    // Push user message with pending status
    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', text: trimmed, ts: new Date().toISOString(), status: 'sending' }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const res = await aiService.getChatResponse({ message: trimmed, context })
      // Mark user message as sent
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'sent' } : m))

      const aiMsg: Message = { id: `${Date.now()}-a`, role: 'ai', text: res.response, ts: new Date().toISOString() }
      setMessages(prev => [...prev, aiMsg])
      setSuggestions(res.suggestions || [])
      setIsTyping(false)
      setErrorCount(0)

      // Optional: mark as delivered shortly after
      setTimeout(() => setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' } : m)), 250)
    } catch (err) {
      // Mark user message error
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'error', error: 'Failed to send' } : m))
      setIsTyping(false)
      setErrorCount(c => c + 1)
    }
  }

  function clearConversation() {
    setMessages([])
    setSuggestions([])
    setErrorCount(0)
  }

  function exportHistory() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projectra-chat-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function retryMessage(m: Message) {
    if (m.role !== 'user') return
    // set to sending
    setMessages(prev => prev.map(mm => mm.id === m.id ? { ...mm, status: 'sending', error: undefined } : mm))
    setIsTyping(true)
    aiService.getChatResponse({ message: m.text, context })
      .then(res => {
        setMessages(prev => prev.map(mm => mm.id === m.id ? { ...mm, status: 'sent' } : mm))
        const aiMsg: Message = { id: `${Date.now()}-a`, role: 'ai', text: res.response, ts: new Date().toISOString() }
        setMessages(prev => [...prev, aiMsg])
        setSuggestions(res.suggestions || [])
        setIsTyping(false)
        setTimeout(() => setMessages(prev => prev.map(mm => mm.id === m.id ? { ...mm, status: 'delivered' } : mm)), 250)
      })
      .catch(() => {
        setMessages(prev => prev.map(mm => mm.id === m.id ? { ...mm, status: 'error', error: 'Failed to send' } : mm))
        setIsTyping(false)
      })
  }

  const sizeClasses = useMemo(() => {
    // Mobile (default): fullscreen; Tablet: 350x550; Desktop: 400x600
    return 'w-screen h-screen md:w-[350px] md:h-[550px] lg:w-[400px] lg:h-[600px]'
  }, [])

  if (!isOpen) return null

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="ProJectra AI Assistant"
      className={`fixed right-6 bottom-24 sm:bottom-0 sm:right-0 ${sizeClasses} z-[9999]`}
      style={{ pointerEvents: 'auto' }}
    >
      <div ref={containerRef} className={`flex h-full w-full flex-col rounded-xl shadow-2xl border bg-white text-[color:var(--chat-text)] ${mounted ? 'chat-enter-active' : 'chat-enter'}`}>
        <ChatHeader
          onClose={onClose}
          onMinimize={() => setIsMinimized(v => !v)}
          isMinimized={isMinimized}
          onClear={clearConversation}
          onExport={exportHistory}
        />
        {!isMinimized && (
          <>
            <MessageList messages={messages} onRetry={(m) => retryMessage(m)} />
            {isTyping && <TypingIndicator />}
            <SuggestionChips suggestions={suggestions} onSelect={sendMessage} />
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={() => sendMessage(inputValue)}
              textAreaRef={textAreaRef}
              disabled={isTyping}
            />
          </>
        )}
      </div>
    </div>
  )
}
