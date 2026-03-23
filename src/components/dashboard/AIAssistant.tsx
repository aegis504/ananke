import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, Loader2, Bot, User as UserIcon, Trash2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Props {
  open: boolean
  onClose: () => void
}

export function AIAssistant({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: "Hi! I'm your Ananke AI assistant. I can help you with:\n\n• Organizing your tasks and to-do lists\n• Suggesting tags for notes\n• Planning your calendar\n• Writing and editing content\n• Study tips and quizzes\n\nHow can I help you today?", timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data: { session } } = await (await import('../../lib/supabase')).supabase.auth.getSession()
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({
          action: 'chat',
          content: `Previous conversation:\n${messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${userMsg.content}`
        })
      })
      if (res.ok) {
        const data = await res.json()
        let resultText = data.result || '';
        try {
          // Check for task creation JSON
          const trimmed = resultText.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const parsed = JSON.parse(trimmed);
            if (parsed.action === 'CREATE_TASK') {
               window.dispatchEvent(new CustomEvent('ananke-add-task', { detail: parsed }))
               resultText = `Task "${parsed.title}" created successfully! I have organized it for you.`;
            }
          }
        } catch(e) {
          // If JSON parse fails, ignore and treat as text
        }
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: resultText || 'Sorry, I couldn\'t process that.', timestamp: new Date() }])
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `Error: ${errData.error || 'Something went wrong.'}`, timestamp: new Date() }])
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Network error. Please check your connection.', timestamp: new Date() }])
    }
    setLoading(false)
  }

  const clearChat = () => {
    setMessages([{ id: '0', role: 'assistant', content: "Chat cleared! How can I help you?", timestamp: new Date() }])
  }

  if (!open) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] z-50 flex flex-col bg-bg-card border-l border-border shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Sparkles size={20} className="text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-text">AI Assistant</h3>
          <p className="text-[12px] text-text-muted">Powered by Ananke AI</p>
        </div>
        <button onClick={clearChat} className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-alt cursor-pointer" title="Clear chat"><Trash2 size={16} /></button>
        <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-alt cursor-pointer"><X size={18} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.role === 'assistant' ? 'bg-accent/10' : 'bg-primary/10'}`}>
              {m.role === 'assistant' ? <Bot size={14} className="text-accent" /> : <UserIcon size={14} className="text-primary" />}
            </div>
            <div className={`max-w-[280px] rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-bg-alt border border-border text-text rounded-tl-sm'}`}>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
              <p className={`text-[11px] mt-1 ${m.role === 'user' ? 'text-white/50' : 'text-text-muted/60'}`}>
                {m.timestamp.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-accent" />
            </div>
            <div className="bg-bg-alt border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-accent" />
                <span className="text-[14px] text-text-muted">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2 flex gap-1.5 flex-wrap border-t border-border/50">
        {['Organize my tasks', 'Suggest tags', 'Plan my day', 'Study tips'].map(q => (
          <button key={q} onClick={() => { setInput(q); }}
            className="px-2.5 py-1 rounded-full bg-bg-alt border border-border text-[12px] text-text-muted hover:text-text hover:border-border-hover cursor-pointer transition-colors">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 rounded-xl bg-bg-input border border-border px-4 py-2.5 text-[15px] text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-all" />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center cursor-pointer hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
