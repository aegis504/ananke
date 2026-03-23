import { useState } from 'react'
import type { Note } from '../../hooks/useNotes'
import { useAI } from '../../hooks/useAI'
import { Plus, SortAsc, Filter, LayoutGrid, MoreHorizontal, Bold, Italic, Underline, Trash2, Pin, Share2, FileText, Sparkles, Loader2, X, ChevronDown, Upload } from 'lucide-react'
import { TemplateGalleryModal } from './TemplateGalleryModal'
import { ShareNoteModal } from './ShareNoteModal'
import { motion, AnimatePresence } from 'framer-motion'

import type { Notebook } from '../../hooks/useNotebooks'

interface Props {
  notes: Note[]
  notebooks: Notebook[]
  loading: boolean
  onAddNote: (title: string, notebookId?: string, content?: string) => Promise<{ data: Note | null; error: unknown } | undefined>
  onUpdateNote: (id: string, updates: Partial<Note>) => void
  onDeleteNote: (id: string) => void
}

const aiActions = [
  { id: 'summarize', label: '📋 Summarize', desc: 'Get a concise summary' },
  { id: 'quiz', label: '❓ Make Quiz', desc: 'Generate quiz questions' },
  { id: 'improve', label: '✨ Improve Writing', desc: 'Fix grammar & clarity' },
  { id: 'keypoints', label: '🎯 Key Points', desc: 'Extract main takeaways' },
  { id: 'actionitems', label: '✅ Action Items', desc: 'Extract tasks & to-dos' },
  { id: 'explain', label: '💡 Explain Simply', desc: 'Simplify concepts' },
  { id: 'expand', label: '📝 Expand', desc: 'Add more detail' },
  { id: 'simplify', label: '🔤 Simplify', desc: 'Use simpler language' },
  { id: 'translate_es', label: '🇪🇸 Translate → Spanish', desc: '' },
  { id: 'translate_fr', label: '🇫🇷 Translate → French', desc: '' },
]

export function NotesPage({ notes, notebooks, loading, onAddNote, onUpdateNote, onDeleteNote }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'Notes' | 'Reminders'>('Notes')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const ai = useAI()

  const selected = notes.find(n => n.id === selectedId)
  const pinnedNotes = notes.filter(n => n.pinned)
  const unpinnedNotes = notes.filter(n => !n.pinned)

  const selectNote = (n: Note) => {
    if (selectedId && (editTitle || editContent)) {
      onUpdateNote(selectedId, { title: editTitle, content: editContent })
    }
    setSelectedId(n.id)
    setEditTitle(n.title || '')
    setEditContent(n.content || '')
    setAiResult(null)
    setShowAI(false)
  }

  const createNote = async () => {
    const res = await onAddNote('Untitled')
    if (res?.data) { setSelectedId(res.data.id); setEditTitle('Untitled'); setEditContent('') }
  }

  const createFromTemplate = async (title: string, content: string) => {
    const res = await onAddNote(title, undefined, content)
    if (res?.data) { setSelectedId(res.data.id); setEditTitle(title); setEditContent(content) }
    setShowTemplates(false)
  }

  const saveNote = () => { if (selectedId) onUpdateNote(selectedId, { title: editTitle, content: editContent }) }

  const togglePin = (id: string) => { const note = notes.find(n => n.id === id); if (note) onUpdateNote(id, { pinned: !note.pinned }) }

  const handleAIAction = async (actionId: string) => {
    setShowAI(false)
    setAiResult(null)
    const result = await ai.runAction(actionId, editContent || editTitle)
    if (result) setAiResult(result)
  }

  const insertAIResult = () => {
    if (!aiResult || !selectedId) return
    const newContent = editContent + '\n\n---\n\n' + aiResult
    setEditContent(newContent)
    onUpdateNote(selectedId, { content: newContent })
    setAiResult(null)
  }

  const replaceWithAIResult = () => {
    if (!aiResult || !selectedId) return
    setEditContent(aiResult)
    onUpdateNote(selectedId, { content: aiResult })
    setAiResult(null)
  }

  // Import .txt file as a note
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const title = file.name.replace(/\.[^.]+$/, '')
    const res = await onAddNote(title, undefined, text)
    if (res?.data) { setSelectedId(res.data.id); setEditTitle(title); setEditContent(text) }
    e.target.value = ''
  }

  const NoteListItem = ({ n }: { n: Note }) => (
    <button onClick={() => selectNote(n)} className={`w-full text-left px-3.5 py-3 rounded-xl cursor-pointer transition-colors group relative ${selectedId === n.id ? 'bg-primary-light border border-primary/20' : 'hover:bg-bg-alt'}`}>
      <div className="flex items-center gap-1">
        <h4 className="text-base font-medium text-text truncate flex-1">{n.title || 'Untitled'}</h4>
        <button onClick={e => { e.stopPropagation(); togglePin(n.id) }} className={`shrink-0 p-0.5 ${n.pinned ? 'text-primary' : 'text-text-muted opacity-0 group-hover:opacity-100'} hover:text-primary cursor-pointer`}>
          <Pin size={14} className={n.pinned ? 'fill-primary' : ''} />
        </button>
      </div>
      <p className="text-[15px] text-text-muted truncate mt-0.5">{n.content || 'No content'}</p>
      <p className="text-[13px] text-text-muted/60 mt-1">{new Date(n.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
    </button>
  )

  return (
    <div className="flex h-full">
      {/* Note list */}
      <div className={`${selectedId ? 'hidden sm:flex' : 'flex'} w-full sm:w-[320px] border-r border-border flex-col shrink-0`}>
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[15px] text-text-muted">{notes.length} notes</p>
            <div className="flex items-center gap-2 text-text-muted">
              <SortAsc size={16} className="cursor-pointer hover:text-text" />
              <Filter size={16} className="cursor-pointer hover:text-text" />
              <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="cursor-pointer hover:text-text">
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            {(['Notes', 'Reminders'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3.5 py-1.5 text-[15px] font-medium rounded-lg cursor-pointer transition-colors ${tab === t ? 'bg-bg-alt text-text border border-border' : 'text-text-muted hover:text-text'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          <div className="flex gap-1.5 mb-2">
            <button onClick={createNote} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[15px] text-primary font-semibold hover:bg-primary-light cursor-pointer transition-colors">
              <Plus size={18} /> New note
            </button>
            <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[15px] text-text-secondary font-medium hover:bg-bg-alt cursor-pointer transition-colors border border-border">
              <FileText size={16} /> Template
            </button>
            <label className="flex items-center gap-1 px-2.5 py-2.5 rounded-xl text-text-muted hover:bg-bg-alt cursor-pointer transition-colors border border-border" title="Import .txt file">
              <Upload size={16} />
              <input type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleImportFile} />
            </label>
          </div>

          {loading ? (
            <div className="py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <div className="mb-2">
                  <p className="px-3 py-1 text-[13px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1"><Pin size={11} /> Pinned</p>
                  {pinnedNotes.map(n => <NoteListItem key={n.id} n={n} />)}
                </div>
              )}
              {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
                <p className="px-3 py-1 text-[13px] font-bold uppercase tracking-wider text-text-muted">Other Notes</p>
              )}
              {unpinnedNotes.map(n => <NoteListItem key={n.id} n={n} />)}
              {notes.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  <p className="text-4xl mb-2">📝</p>
                  <p className="text-base">No notes yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className={`${selectedId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0`}>
        {selected ? (
          <>
            {/* Top toolbar */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border text-text-muted">
              <button onClick={() => setSelectedId(null)} className="sm:hidden text-text-muted hover:text-text cursor-pointer mr-2">← </button>
              <span className="text-[15px] text-text-muted mr-3 truncate">📄 {selected.title || 'Untitled'}</span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => togglePin(selected.id)} className={`p-1.5 rounded-lg hover:bg-bg-alt cursor-pointer ${selected.pinned ? 'text-primary' : 'text-text-muted'}`}>
                  <Pin size={16} className={selected.pinned ? 'fill-primary' : ''} />
                </button>
                <button onClick={() => setShowShare(true)} className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-[15px] font-semibold cursor-pointer hover:bg-primary-hover flex items-center gap-1.5">
                  <Share2 size={14} /> Share
                </button>
                <div className="relative">
                  <button onClick={() => setShowMore(!showMore)} className="p-1.5 rounded-lg hover:bg-bg-alt cursor-pointer text-text-muted hover:text-text">
                    <MoreHorizontal size={18} />
                  </button>
                  <AnimatePresence>
                    {showMore && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                          className="absolute right-0 top-full mt-1 w-52 bg-bg-card border border-border/80 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                          <p className="px-3.5 py-1 text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Save to Notebook</p>
                          <div className="max-h-[200px] overflow-y-auto">
                            <button onClick={() => { onUpdateNote(selected.id, { notebook_id: null }); setShowMore(false) }}
                              className={`w-full text-left px-3.5 py-2 text-[14px] cursor-pointer transition-colors flex items-center ${!selected.notebook_id ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-bg-alt hover:text-text'}`}>
                              No Notebook
                            </button>
                            {notebooks.map(nb => (
                              <button key={nb.id} onClick={() => { onUpdateNote(selected.id, { notebook_id: nb.id }); setShowMore(false) }}
                                className={`w-full text-left px-3.5 py-2 text-[14px] cursor-pointer transition-colors flex items-center gap-2 truncate ${selected.notebook_id === nb.id ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:bg-bg-alt hover:text-text'}`}>
                                <span style={{ color: nb.color || '#4f46e5' }}>📓</span> {nb.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Formatting + AI toolbar */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-border text-text-muted">
              <button onClick={() => setShowTemplates(true)} className="px-2.5 py-1.5 rounded-lg text-[15px] font-medium bg-bg-alt border border-border cursor-pointer hover:bg-bg">+ Insert</button>
              <div className="h-4 w-px bg-border mx-1" />
              <button className="p-1.5 rounded-lg hover:bg-bg-alt cursor-pointer"><Bold size={16} /></button>
              <button className="p-1.5 rounded-lg hover:bg-bg-alt cursor-pointer"><Italic size={16} /></button>
              <button className="p-1.5 rounded-lg hover:bg-bg-alt cursor-pointer"><Underline size={16} /></button>
              <div className="h-4 w-px bg-border mx-1" />

              {/* AI Button */}
              <div className="relative">
                <button onClick={() => setShowAI(!showAI)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[15px] font-semibold cursor-pointer transition-all ${showAI || ai.loading ? 'bg-accent text-white' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}
                  disabled={ai.loading}>
                  {ai.loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  AI
                  <ChevronDown size={13} />
                </button>

                {/* AI dropdown */}
                <AnimatePresence>
                  {showAI && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 top-full mt-1 w-64 bg-bg-card border border-border rounded-xl shadow-xl z-50 py-1.5 max-h-[400px] overflow-y-auto">
                      <p className="px-3.5 py-2 text-[13px] font-bold text-text-muted uppercase tracking-wider">AI Actions</p>
                      {aiActions.map(a => (
                        <button key={a.id} onClick={() => handleAIAction(a.id)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-bg-alt cursor-pointer transition-colors flex items-center gap-2">
                          <span className="text-base">{a.label.split(' ')[0]}</span>
                          <div>
                            <p className="text-[15px] font-medium text-text">{a.label.split(' ').slice(1).join(' ')}</p>
                            {a.desc && <p className="text-[13px] text-text-muted">{a.desc}</p>}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => { onDeleteNote(selected.id); setSelectedId(null) }} className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger cursor-pointer"><Trash2 size={16} /></button>
              </div>
            </div>

            {/* AI Result banner */}
            <AnimatePresence>
              {(ai.loading || aiResult) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-accent/20 bg-accent/5 overflow-hidden">
                  <div className="px-5 py-4">
                    {ai.loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 size={18} className="animate-spin text-accent" />
                        <span className="text-[15px] text-accent font-medium">AI is thinking...</span>
                      </div>
                    ) : aiResult ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={13} /> AI Result
                          </span>
                          <button onClick={() => setAiResult(null)} className="text-text-muted hover:text-text cursor-pointer"><X size={16} /></button>
                        </div>
                        <div className="text-[15px] text-text leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto mb-3 bg-bg-card rounded-lg p-4 border border-border">
                          {aiResult}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={insertAIResult} className="px-4 py-2 rounded-lg bg-accent text-white text-[15px] font-semibold cursor-pointer hover:bg-accent/90">
                            Insert below
                          </button>
                          <button onClick={replaceWithAIResult} className="px-4 py-2 rounded-lg border border-border text-[15px] font-medium text-text cursor-pointer hover:bg-bg-alt">
                            Replace content
                          </button>
                          <button onClick={() => setAiResult(null)} className="px-4 py-2 rounded-lg text-[15px] text-text-muted cursor-pointer hover:bg-bg-alt">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {ai.error && <p className="text-[15px] text-danger mt-2">{ai.error}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-7">
              <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={saveNote} placeholder="Title"
                className="w-full text-[30px] font-bold text-text placeholder:text-text-muted/30 bg-transparent border-none outline-none mb-3" />
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)} onBlur={saveNote}
                placeholder="Start writing, drag files or start from a template"
                className="w-full min-h-[400px] text-base text-text-secondary bg-transparent border-none outline-none resize-none leading-relaxed" />
              {!editContent && (
                <div className="mt-6">
                  <p className="text-base text-text-muted mb-3">Suggested templates</p>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-base text-text-secondary hover:bg-bg-alt cursor-pointer">📋 To-do list</button>
                    <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-base text-text-secondary hover:bg-bg-alt cursor-pointer">📝 Meeting notes</button>
                    <button onClick={() => setShowTemplates(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-base text-text-secondary hover:bg-bg-alt cursor-pointer">⋯ Open Gallery</button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-t border-border text-text-muted text-[15px] flex-wrap">
              <span>🔔</span>
              <button onClick={() => setShowTagInput(!showTagInput)} className="cursor-pointer hover:text-text flex items-center gap-1">🏷 Add tag</button>
              {selected.tags?.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[13px] font-medium">
                  {t}
                  <button onClick={() => { const newTags = (selected.tags || []).filter(tag => tag !== t); onUpdateNote(selected.id, { tags: newTags } as Partial<Note>) }} className="hover:text-danger cursor-pointer">×</button>
                </span>
              ))}
              {showTagInput && (
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { const existing = selected.tags || []; if (!existing.includes(tagInput.trim())) { onUpdateNote(selected.id, { tags: [...existing, tagInput.trim()] } as Partial<Note>) }; setTagInput(''); setShowTagInput(false) } if (e.key === 'Escape') setShowTagInput(false) }}
                  placeholder="Type tag + Enter"
                  className="px-2.5 py-1 rounded-lg border border-primary bg-bg-input text-[13px] text-text w-32 focus:outline-none" autoFocus />
              )}
              <span className="ml-auto text-[13px]">Saved {new Date(selected.updated_at).toLocaleTimeString()}</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-base mb-3">Select a note or create a new one</p>
              <button onClick={() => setShowTemplates(true)} className="text-base text-primary font-semibold cursor-pointer hover:underline">
                Or start from a template →
              </button>
            </div>
          </div>
        )}
      </div>

      {showTemplates && <TemplateGalleryModal onSelect={createFromTemplate} onClose={() => setShowTemplates(false)} />}
      {showShare && selected && <ShareNoteModal noteId={selected.id} noteTitle={selected.title || 'Untitled'} onClose={() => setShowShare(false)} />}
    </div>
  )
}
