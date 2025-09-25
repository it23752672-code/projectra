import React, { useEffect, useRef, useState } from 'react'
import { aiService } from '@/services/aiService'
import ReactMarkdown from 'react-markdown'
import { BotIcon, SendIcon, UserIcon, SparklesIcon, BookOpenIcon } from '@/components/icons/Icons'
import { useAuth } from '@/state/AuthContext'

export default function AIChat({ isVisible, onClose, context }: { isVisible: boolean, onClose: () => void, context?: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (isVisible && messages.length === 0) {
      const welcome = {
        id: Date.now(), type: 'ai', content:
`Hi${user ? ' ' + (user as any)?.firstName : ''}! I'm your ProJectra AI Assistant. I can help with:

- Task Management — break down complex work
- Project Guidance — best practices & timelines
- Skill Development — learning resources
- Tool Usage — ProJectra tips

What can I help you with today?`, timestamp: new Date(), suggestions: [
          'How do I prioritize my tasks?',
          'Help me understand this project',
          'What skills should I develop?',
          'How to collaborate with other companies?'
        ]
      }
      setMessages([welcome])
      setSuggestions(welcome.suggestions)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible])

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg) return
    const userMsg = { id: Date.now(), type: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const resp = await aiService.getChatResponse({ message: msg, context })
      const aiMsg = { id: Date.now() + 1, type: 'ai', content: resp.response, timestamp: new Date(), suggestions: resp.suggestions, resources: (resp as any).resources }
      setMessages(prev => [...prev, aiMsg])
      setSuggestions(resp.suggestions || [])
    } catch (e) {
      const errMsg = { id: Date.now() + 1, type: 'ai', content: "I'm having trouble right now. Please try again shortly.", timestamp: new Date(), isError: true }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    if (e.key === 'Escape') onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed right-4 bottom-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2"><BotIcon className="w-5 h-5" /><span className="font-semibold">ProJectra AI Assistant</span></div>
        <button onClick={onClose} className="text-white/90 hover:text-white">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={'flex ' + (m.type === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={'max-w-[80%] rounded-lg p-3 ' + (m.type === 'user' ? 'bg-blue-600 text-white' : (m.isError ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-800'))}>
              <div className="flex items-start gap-2">
                {m.type === 'ai' ? <BotIcon className="w-4 h-4 mt-1" /> : <UserIcon className="w-4 h-4 mt-1" />}
                <div className="flex-1">
                  <ReactMarkdown className="prose prose-sm max-w-none">{m.content}</ReactMarkdown>
                  {m.resources && m.resources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1 text-sm font-medium"><BookOpenIcon className="w-4 h-4" /><span>Helpful Resources:</span></div>
                      {m.resources.map((r: any, i: number) => (
                        <div key={i} className="text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                          <div className="font-medium">{r.title}</div>
                          <div className="text-gray-600">{r.description}</div>
                          {r.link && <a href={r.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">Learn more →</a>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start"><div className="bg-gray-100 rounded-lg p-3 max-w-[80%]"><div className="flex items-center gap-2"><BotIcon className="w-4 h-4" /><div className="flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div></div></div></div></div>
        )}
        <div ref={endRef} />
      </div>
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-600 mb-2"><SparklesIcon className="w-4 h-4" /><span>Quick suggestions:</span></div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} className="text-sm bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-blue-50 hover:border-blue-200">{s}</button>
            ))}
          </div>
        </div>
      )}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} placeholder="Ask me about tasks, projects, or anything work-related..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} disabled={loading} />
          <button onClick={() => send()} disabled={!input.trim() || loading} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"><SendIcon className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  )
}
