import React, { useEffect, useRef } from 'react'
import { SendIcon } from '@/components/icons/Icons'

export default function ChatInput({ value, onChange, onSend, textAreaRef, disabled }: { value: string, onChange: (v: string) => void, onSend: () => void, textAreaRef?: React.RefObject<HTMLTextAreaElement>, disabled?: boolean }) {
  const localRef = useRef<HTMLTextAreaElement>(null)
  const ref = textAreaRef || localRef

  useEffect(() => { autoResize() }, [value])

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  function autoResize() {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const max = 96
    el.style.height = Math.min(el.scrollHeight, max) + 'px'
  }

  return (
    <div className="relative border-t bg-white rounded-b-xl p-3">
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message..."
          className="w-full text-[15px] leading-6 border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          aria-label="Message input"
          disabled={!!disabled}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || !!disabled}
          className="absolute bottom-2 right-2 h-9 w-9 rounded-full flex items-center justify-center text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--chat-primary), var(--chat-primary-dark))' }}
          aria-label="Send"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
