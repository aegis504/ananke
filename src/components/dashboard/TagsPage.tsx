import { useMemo, useState } from 'react'
import type { Task } from '../../hooks/useTasks'
import type { Note } from '../../hooks/useNotes'
import { Trash2, Search, MoreHorizontal, Tag } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props {
  tasks: Task[]
  notes: Note[]
  onNavigate: (page: string) => void
}

export function TagsPage({ tasks, notes, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  
  
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const tagData = useMemo(() => {
    const tagMap = new Map<string, { tasks: Task[]; notes: Note[] }>()
    tasks.forEach(t => t.tags?.forEach(tag => {
      if (!tagMap.has(tag)) tagMap.set(tag, { tasks: [], notes: [] })
      tagMap.get(tag)!.tasks.push(t)
    }))
    notes.forEach(n => n.tags?.forEach(tag => {
      if (!tagMap.has(tag)) tagMap.set(tag, { tasks: [], notes: [] })
      tagMap.get(tag)!.notes.push(n)
    }))
    return Array.from(tagMap.entries())
      .map(([name, data]) => ({ name, taskCount: data.tasks.length, noteCount: data.notes.length, total: data.tasks.length + data.notes.length, tasks: data.tasks, notes: data.notes }))
      .sort((a, b) => b.total - a.total)
  }, [tasks, notes])

  const filtered = search ? tagData.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) : tagData
  const selectedData = selectedTag ? tagData.find(t => t.name === selectedTag) : null

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-text">Tags</h1>
          <p className="text-[13px] text-text-muted">{tagData.length} tags</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Find tags..." className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-bg-input text-[13px] text-text w-36 focus:outline-none focus:border-primary" />
          </div>
          <MoreHorizontal size={16} className="text-text-muted" />
        </div>
      </div>

      {tagData.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <Tag size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-[15px] text-text-secondary mb-1">No tags yet</p>
          <p className="text-[13px] text-text-muted">Add tags to your tasks and notes to organize them.</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Tag list */}
          <div className="flex-1">
            <div className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-text-muted uppercase tracking-wider border-b border-border mb-1">
              <span className="flex-1">Tag</span>
              <span className="w-16 text-right">Notes</span>
              <span className="w-16 text-right">Tasks</span>
              <span className="w-10" />
            </div>

            {filtered.map(t => (
              <div key={t.name} onClick={() => setSelectedTag(t.name)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${selectedTag === t.name ? 'bg-primary-light border border-primary/20' : 'hover:bg-bg-alt'}`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Tag size={14} className="text-primary shrink-0" />
                  <span className="text-[15px] font-medium text-text truncate">{t.name}</span>
                </div>
                <span className="w-16 text-right text-[13px] text-text-muted">{t.noteCount}</span>
                <span className="w-16 text-right text-[13px] text-text-muted">{t.taskCount}</span>
                <div className="w-10 flex justify-end">
                  <button onClick={e => { e.stopPropagation(); setShowDeleteConfirm(t.name) }} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger cursor-pointer p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedData && (
            <div className="w-[280px] shrink-0 border-l border-border pl-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-primary" />
                <h3 className="text-base font-bold text-text">{selectedData.name}</h3>
              </div>
              <p className="text-[13px] text-text-muted mb-4">{selectedData.total} items</p>

              {selectedData.notes.length > 0 && (
                <div className="mb-4">
                  <p className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-2">Notes ({selectedData.noteCount})</p>
                  {selectedData.notes.slice(0, 5).map(n => (
                    <button key={n.id} onClick={() => onNavigate('notes')} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-bg-alt cursor-pointer text-[15px] text-text truncate">
                      📝 {n.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              )}

              {selectedData.tasks.length > 0 && (
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wider text-text-muted mb-2">Tasks ({selectedData.taskCount})</p>
                  {selectedData.tasks.slice(0, 5).map(t => (
                    <button key={t.id} onClick={() => onNavigate('tasks')} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-bg-alt cursor-pointer text-[15px] text-text truncate">
                      {t.completed ? '✅' : '⬜'} {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger-light flex items-center justify-center"><Trash2 size={18} className="text-danger" /></div>
              <div>
                <h3 className="text-[15px] font-bold text-text">Delete tag "{showDeleteConfirm}"?</h3>
                <p className="text-[13px] text-text-muted">This will remove the tag from all items.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="urgent" size="sm" className="flex-1" onClick={() => { setShowDeleteConfirm(null); setSelectedTag(null) }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
