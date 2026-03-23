import type { Task } from '../../hooks/useTasks'
import type { Note } from '../../hooks/useNotes'
import { Pin, FileText, CheckSquare } from 'lucide-react'

interface Props { tasks: Task[]; notes: Note[]; onNavigate: (page: string) => void }

export function ShortcutsPage({ tasks, notes, onNavigate }: Props) {
  const pinnedNotes = notes.filter(n => n.pinned)
  const urgentTasks = tasks.filter(t => !t.completed && new Date(t.deadline) < new Date())
  const hasItems = pinnedNotes.length > 0 || urgentTasks.length > 0

  return (
    <div className="max-w-[600px] mx-auto">
      <h1 className="text-[32px] font-bold text-text mb-2">Shortcuts</h1>
      <p className="text-[13px] text-text-muted mb-6">Quick access to pinned notes and urgent tasks.</p>
      {!hasItems ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl"><Pin size={32} className="mx-auto text-text-muted mb-3" /><p className="text-[15px] text-text-secondary mb-1">No shortcuts yet</p><p className="text-[13px] text-text-muted">Pin notes or create urgent tasks to see them here.</p></div>
      ) : (
        <div className="space-y-1">
          {urgentTasks.length > 0 && (<><p className="text-[13px] font-bold uppercase tracking-wider text-text-muted py-2">Urgent Tasks</p>{urgentTasks.map(t => (<button key={t.id} onClick={() => onNavigate('tasks')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-alt cursor-pointer transition-colors text-left"><CheckSquare size={16} className="text-danger shrink-0" /><div className="flex-1 min-w-0"><p className="text-[15px] font-medium text-text truncate">{t.title}</p><p className="text-[13px] text-danger">Overdue</p></div></button>))}</>)}
          {pinnedNotes.length > 0 && (<><p className="text-[13px] font-bold uppercase tracking-wider text-text-muted py-2 mt-3">Pinned Notes</p>{pinnedNotes.map(n => (<button key={n.id} onClick={() => onNavigate('notes')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-alt cursor-pointer transition-colors text-left"><FileText size={16} className="text-primary shrink-0" /><div className="flex-1 min-w-0"><p className="text-[15px] font-medium text-text truncate">{n.title || 'Untitled'}</p></div><Pin size={12} className="text-primary" /></button>))}</>)}
        </div>
      )}
    </div>
  )
}
