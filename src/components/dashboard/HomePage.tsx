import { motion } from 'framer-motion'
import type { Task } from '../../hooks/useTasks'
import type { Note } from '../../hooks/useNotes'
import { X, Plus, FileText } from 'lucide-react'
import { useState, useRef } from 'react'

interface Props {
  userName: string; tasks: Task[]; tasksLoading: boolean; notes: Note[]
  onAddTask: (title: string, mode: 'digital' | 'physical', minutes: number) => void
  onCompleteTask: (id: string) => void; onToggleMode: (id: string) => void
  onPrepareWorkflow: (id: string) => void; onDeleteTask: (id: string) => void
  onNavigate: (page: string) => void
}

const inspirations = [
  { emoji: '📖', title: 'Reading list', desc: 'Keep track of the books you\'ve read', bg: '#fef3c7', iconBg: '#fbbf24' },
  { emoji: '💡', title: 'Ideas', desc: 'Brainstorm ideas for your next project', bg: '#fef9c3', iconBg: '#eab308' },
  { emoji: '🍳', title: 'Recipes', desc: 'Write down your favorite recipes', bg: '#e0e7ff', iconBg: '#6366f1' },
]

export function HomePage({ tasks, notes, onNavigate }: Props) {
  const [scratchPad, setScratchPad] = useState(() => localStorage.getItem('ananke-scratchpad') || '')
  const [dismissedInspirations, setDismissedInspirations] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeTasks = tasks.filter(t => !t.completed).slice(0, 5)
  const recentNotes = notes.slice(0, 6)
  const visibleInspirations = inspirations.filter(i => !dismissedInspirations.includes(i.title))

  const handleScratchPad = (val: string) => { setScratchPad(val); localStorage.setItem('ananke-scratchpad', val) }

  return (
    <div className="max-w-[1100px]">
      {/* Page title */}
      <h1 className="text-[32px] font-bold tracking-[-0.02em] text-text mb-8">Home</h1>

      {/* Inspiration for your next note */}
      {visibleInspirations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-text mb-4">Inspiration for your next note</h2>
          <div className="flex gap-4">
            {visibleInspirations.map(item => (
              <div key={item.title}
                className="relative flex items-start gap-4 border border-border rounded-2xl px-5 py-5 bg-bg-card flex-1 min-w-[220px] group hover:shadow-sm transition-shadow">
                <button onClick={() => setDismissedInspirations(p => [...p, item.title])}
                  className="absolute top-3 right-3 text-text-muted/30 hover:text-text-muted cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
                {/* Colored icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: item.bg }}>
                  {item.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-text">{item.title}</p>
                  <p className="text-[15px] text-text-secondary mt-0.5 leading-snug">{item.desc}</p>
                  <button onClick={() => onNavigate('notes')} className="text-[15px] font-semibold text-primary hover:underline cursor-pointer mt-2 inline-block">
                    Create note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes + Scratch pad */}
      <div className="flex gap-8 mb-10">
        {/* Notes section */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-text mb-4">Notes</h2>
          {recentNotes.length === 0 ? (
            <div className="border border-border rounded-2xl p-10 text-center bg-bg-card">
              <FileText size={40} className="mx-auto text-text-muted/25 mb-3" />
              <p className="text-base text-text-muted">No notes yet</p>
              <button onClick={() => onNavigate('notes')} className="mt-2 text-base font-semibold text-primary hover:underline cursor-pointer">
                Create your first note
              </button>
            </div>
          ) : (
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 -mb-2">
              {recentNotes.map((note, i) => (
                <motion.div key={note.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => onNavigate('notes')}
                  className="border border-border rounded-2xl bg-bg-card min-w-[200px] max-w-[220px] shrink-0 cursor-pointer hover:border-border-hover hover:shadow-sm transition-all group flex flex-col">
                  {/* Card body */}
                  <div className="p-4 flex-1">
                    <p className="text-[13px] text-text-muted mb-1.5">{note.notebook_id ? 'Notebook' : 'Notes'}</p>
                    <p className="text-base font-semibold text-text group-hover:text-primary transition-colors leading-snug">{note.title || 'Untitled'}</p>
                    {note.content && (
                      <p className="text-[15px] text-text-secondary mt-2 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {note.content.slice(0, 120)}
                      </p>
                    )}
                  </div>
                  {/* Card footer */}
                  <div className="px-4 pb-3.5">
                    <p className="text-[13px] text-text-muted/60">{formatTimeAgo(note.updated_at)}</p>
                  </div>
                </motion.div>
              ))}
              {/* New note card */}
              <button onClick={() => onNavigate('notes')}
                className="border border-dashed border-border rounded-2xl min-w-[200px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-border-hover hover:bg-bg-alt/50 transition-all text-text-muted shrink-0">
                <Plus size={22} />
                <span className="text-[15px]">New note</span>
              </button>
            </div>
          )}
        </div>

        {/* Scratch pad */}
        <div className="w-[300px] shrink-0 hidden lg:block">
          <h2 className="text-lg font-semibold text-text mb-4">Scratch pad</h2>
          <div className="border border-border rounded-2xl bg-bg-card overflow-hidden">
            <textarea
              value={scratchPad}
              onChange={e => handleScratchPad(e.target.value)}
              placeholder="Start writing..."
              className="w-full h-[240px] px-5 py-4 text-base text-text placeholder:text-text-muted/40 bg-transparent resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Active tasks</h2>
            <button onClick={() => onNavigate('tasks')} className="text-[15px] font-semibold text-primary hover:underline cursor-pointer">View all</button>
          </div>
          <div className="border border-border rounded-2xl bg-bg-card divide-y divide-border">
            {activeTasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-bg-alt/50 transition-colors cursor-pointer" onClick={() => onNavigate('tasks')}>
                <div className={`w-5 h-5 rounded border-2 shrink-0 ${isOverdue(task.deadline) ? 'border-danger' : 'border-border-hover'}`} />
                <span className="text-base text-text flex-1 truncate">{task.title}</span>
                <span className={`text-[15px] font-medium ${isOverdue(task.deadline) ? 'text-danger' : 'text-text-muted'}`}>
                  {formatDeadline(task.deadline)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDeadline(d: string) {
  const diff = new Date(d).getTime() - Date.now()
  if (diff < 0) return 'Overdue'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m left`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h left`
  return `${Math.floor(hrs / 24)}d left`
}

function isOverdue(d: string) { return new Date(d).getTime() < Date.now() }
