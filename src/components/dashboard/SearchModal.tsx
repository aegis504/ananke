import { useState, useEffect, useRef } from 'react'
import type { Task } from '../../hooks/useTasks'
import type { Note } from '../../hooks/useNotes'
import { Search, X, FileText, CheckSquare } from 'lucide-react'

interface Props { tasks: Task[]; notes: Note[]; onClose: () => void; onNavigate: (page: string) => void }

export function SearchModal({ tasks, notes, onClose, onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])

  const q = query.toLowerCase()
  const matchedTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q)).slice(0, 5) : []
  const matchedNotes = q ? notes.filter(n => (n.title?.toLowerCase().includes(q)) || (n.content?.toLowerCase().includes(q))).slice(0, 5) : []

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-text-muted shrink-0" />
          <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notes, tasks..." className="flex-1 bg-transparent text-text text-[15px] outline-none placeholder:text-text-muted" />
          <button onClick={onClose} className="text-text-muted hover:text-text cursor-pointer"><X size={16} /></button>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {!q && <p className="px-4 py-6 text-[15px] text-text-muted text-center">Start typing to search...</p>}
          {matchedTasks.length > 0 && (<div className="px-2 py-2"><p className="px-2 py-1 text-[13px] font-bold uppercase tracking-wider text-text-muted">Tasks</p>{matchedTasks.map(t => (<button key={t.id} onClick={() => { onNavigate('tasks'); onClose() }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-alt cursor-pointer text-left"><CheckSquare size={14} className="text-primary shrink-0" /><div className="min-w-0"><p className="text-[15px] text-text truncate">{t.title}</p><p className="text-[13px] text-text-muted">{t.completed ? '✅ Completed' : `Due ${new Date(t.deadline).toLocaleString()}`}</p></div></button>))}</div>)}
          {matchedNotes.length > 0 && (<div className="px-2 py-2"><p className="px-2 py-1 text-[13px] font-bold uppercase tracking-wider text-text-muted">Notes</p>{matchedNotes.map(n => (<button key={n.id} onClick={() => { onNavigate('notes'); onClose() }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-alt cursor-pointer text-left"><FileText size={14} className="text-success shrink-0" /><div className="min-w-0"><p className="text-[15px] text-text truncate">{n.title || 'Untitled'}</p><p className="text-[13px] text-text-muted truncate">{n.content || 'No content'}</p></div></button>))}</div>)}
          {q && matchedTasks.length === 0 && matchedNotes.length === 0 && <p className="px-4 py-6 text-[15px] text-text-muted text-center">No results for "{query}"</p>}
        </div>
        <div className="px-4 py-2 border-t border-border text-[13px] text-text-muted flex items-center gap-3"><span><kbd className="px-1.5 py-0.5 rounded bg-bg-alt border border-border text-[13px]">↵</kbd> Open</span><span><kbd className="px-1.5 py-0.5 rounded bg-bg-alt border border-border text-[13px]">Esc</kbd> Close</span></div>
      </div>
    </div>
  )
}
