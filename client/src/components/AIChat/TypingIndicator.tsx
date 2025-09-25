import React from 'react'
import { BotIcon } from '@/components/icons/Icons'

export default function TypingIndicator() {
  return (
    <div className="px-4 pb-2">
      <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-lg px-3 py-2">
        <BotIcon className="w-4 h-4" />
        <div className="flex gap-1" aria-live="polite" aria-label="AI is typing">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  )
}
