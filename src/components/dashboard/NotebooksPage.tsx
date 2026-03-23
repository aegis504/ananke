import { useState } from 'react'
import type { Notebook } from '../../hooks/useNotebooks'
import type { Note } from '../../hooks/useNotes'
import { Plus, Trash2, ChevronLeft, MoreHorizontal, FileText } from 'lucide-react'
import { CreateNotebookModal } from './CreateNotebookModal'

interface Props {
  notebooks: Notebook[]
  notes: Note[]
  loading: boolean
  onAddNotebook: (name: string, color?: string) => void
  onDeleteNotebook: (id: string) => void
  onNavigate: (page: string) => void
}

const fmtDate = (s: string | null | undefined) => { if (!s) return 'Just now'; const d = new Date(s); return isNaN(d.getTime()) ? 'Just now' : d.toLocaleDateString() }

export function NotebooksPage({ notebooks, notes, loading, onAddNotebook, onDeleteNotebook, onNavigate }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [selectedNb, setSelectedNb] = useState<string | null>(null)
  const [showNbOptions, setShowNbOptions] = useState(false)

  const getNoteCount = (nbId: string) => notes.filter(n => n.notebook_id === nbId).length
  const getNotesForNotebook = (nbId: string) => notes.filter(n => n.notebook_id === nbId)
  const selectedNotebook = notebooks.find(nb => nb.id === selectedNb)

  // Detail view
  if (selectedNotebook) {
    const nbNotes = getNotesForNotebook(selectedNotebook.id)
    return (
      <div className="max-w-[800px] mx-auto">
        <button onClick={() => setSelectedNb(null)} className="flex items-center gap-1 text-[15px] text-text-muted hover:text-text cursor-pointer mb-4">
          <ChevronLeft size={16} /> All Notebooks
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[32px]" style={{ backgroundColor: (selectedNotebook.color || '#4f46e5') + '20' }}>
            📓
          </div>
          <div>
            <h1 className="text-[32px] font-bold text-text">{selectedNotebook.name}</h1>
            <p className="text-[13px] text-text-muted">{nbNotes.length} notes · Updated {fmtDate(selectedNotebook.updated_at)}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => onNavigate('notes')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[15px] text-primary font-medium border border-primary/20 hover:bg-primary-light cursor-pointer">
              <Plus size={14} /> New Note
            </button>
            <div className="relative">
              <button onClick={() => setShowNbOptions(!showNbOptions)} className="p-2 rounded-lg text-text-muted hover:bg-bg-alt cursor-pointer">
                <MoreHorizontal size={16} />
              </button>
              {showNbOptions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNbOptions(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-xl shadow-xl p-1 z-50">
                    <button onClick={() => { setShowNbOptions(false); onDeleteNotebook(selectedNotebook.id); setSelectedNb(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-danger hover:bg-danger-light rounded-lg cursor-pointer">
                      <Trash2 size={16} /> Delete Notebook
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Notes table */}
        {nbNotes.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
            <FileText size={32} className="mx-auto text-text-muted mb-3" />
            <p className="text-[15px] text-text-secondary mb-1">No notes in this notebook</p>
            <p className="text-[13px] text-text-muted">Create a note and assign it to this notebook.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-text-muted uppercase tracking-wider border-b border-border">
              <span className="flex-1">Title</span>
              <span className="w-32 text-right">Updated</span>
              <span className="w-20 text-right">Tags</span>
            </div>
            {nbNotes.map(n => (
              <div key={n.id} onClick={() => onNavigate('notes')} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-bg-alt cursor-pointer transition-colors">
                <FileText size={16} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-text truncate">{n.title || 'Untitled'}</p>
                  <p className="text-[13px] text-text-muted truncate">{n.content || 'No content'}</p>
                </div>
                <span className="w-32 text-right text-[13px] text-text-muted">{fmtDate(n.updated_at)}</span>
                <span className="w-20 text-right text-[13px] text-text-muted">{n.tags?.length || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // List view
  return (
    <div className="max-w-[700px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-text">Notebooks</h1>
          <p className="text-[13px] text-text-muted mt-0.5">{notebooks.length} notebooks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-[15px] font-semibold cursor-pointer transition-colors">
          <Plus size={16} /> New Notebook
        </button>
      </div>

      {loading ? (
        <div className="py-16"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : notebooks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <p className="text-3xl mb-3">📓</p>
          <p className="text-[15px] text-text-secondary mb-1">No notebooks yet</p>
          <p className="text-[13px] text-text-muted mb-4">Create one to organize your notes.</p>
          <button onClick={() => setShowCreate(true)} className="text-[15px] text-primary font-medium cursor-pointer hover:underline">Create your first notebook →</button>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-text-muted uppercase tracking-wider border-b border-border">
            <span className="flex-1">Name</span>
            <span className="w-24 text-right">Notes</span>
            <span className="w-32 text-right">Updated</span>
            <span className="w-10" />
          </div>
          {notebooks.map(nb => (
            <div key={nb.id} onClick={() => setSelectedNb(nb.id)} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-bg-alt cursor-pointer group transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: (nb.color || '#4f46e5') + '20' }}>📓</div>
              <span className="flex-1 text-[15px] font-medium text-text">{nb.name}</span>
              <span className="w-24 text-right text-[13px] text-text-muted">{getNoteCount(nb.id)}</span>
              <span className="w-32 text-right text-[13px] text-text-muted">{new Date(nb.updated_at).toLocaleDateString()}</span>
              <div className="w-10 flex justify-end">
                <button onClick={e => { e.stopPropagation(); onDeleteNotebook(nb.id) }} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger cursor-pointer p-1"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateNotebookModal onClose={() => setShowCreate(false)} onCreate={(name, color) => onAddNotebook(name, color)} />}
    </div>
  )
}
