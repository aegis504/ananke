import { useState } from 'react'
import type { Task } from '../../hooks/useTasks'
import { Search, Plus, ChevronDown, ChevronRight, Trash2, Check, X, Clock, AlertTriangle, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/Button'

interface Props {
  tasks: Task[]
  loading: boolean
  onAddTask: (t: string, m: 'digital' | 'physical', min: number, tags?: string[]) => void
  onCompleteTask: (id: string) => void
  onDeleteTask: (id: string) => void
  onUpdateTask?: (id: string, updates: Partial<Task>) => void
}

type Tab = 'All' | 'Today' | 'Upcoming' | 'Completed'

const suggestedTags = ['urgent', 'important', 'work', 'personal', 'school', 'health', 'finance', 'project']

export function TasksPage({ tasks, loading, onAddTask, onCompleteTask, onDeleteTask, onUpdateTask: _onUpdateTask }: Props) {
  const [tab, setTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newMode, setNewMode] = useState<'digital' | 'physical'>('digital')
  const [newTags, setNewTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const now = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const active = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)
  const overdue = active.filter(t => new Date(t.deadline) < now)
  const todayTasks = active.filter(t => { const d = new Date(t.deadline); return d >= now && d <= todayEnd })
  const upcoming = active.filter(t => new Date(t.deadline) > todayEnd)

  // Filter by tab
  let displayTasks = tab === 'All'
    ? [...overdue, ...todayTasks, ...upcoming, ...completed]  // All: sorted by urgency, new tasks always visible
    : tab === 'Today' ? [...overdue, ...todayTasks]
    : tab === 'Upcoming' ? upcoming
    : completed

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase()
    displayTasks = displayTasks.filter(t => t.title.toLowerCase().includes(q))
  }

  const displayActive = displayTasks.filter(t => !t.completed)
  const displayCompleted = displayTasks.filter(t => t.completed)

  const toggleSection = (k: string) => setCollapsed(p => ({ ...p, [k]: !p[k] }))

  const handleAdd = () => {
    if (!newTitle.trim()) return
    let minutes = 60
    if (newDeadline) {
      const target = new Date(newDeadline).getTime()
      minutes = Math.max(1, Math.round((target - Date.now()) / 60000))
    }
    onAddTask(newTitle.trim(), newMode, minutes, newTags.length > 0 ? newTags : undefined)
    // Tags will be added after task is created via realtime
    setNewTitle('')
    setNewDeadline('')
    setNewTags([])
    setTagInput('')
    setShowAdd(false)
  }

  const formatDue = (d: string) => {
    const target = new Date(d)
    const diff = target.getTime() - Date.now()
    if (diff < 0) {
      const mins = Math.abs(Math.floor(diff / 60000))
      if (mins < 60) return { text: `${mins}m overdue`, color: 'text-danger', icon: <AlertTriangle size={14} className="text-danger" /> }
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return { text: `${hrs}h overdue`, color: 'text-danger', icon: <AlertTriangle size={14} className="text-danger" /> }
      return { text: `${Math.floor(hrs / 24)}d overdue`, color: 'text-danger', icon: <AlertTriangle size={14} className="text-danger" /> }
    }
    if (diff < 3600000) return { text: `${Math.floor(diff / 60000)}m left`, color: 'text-danger font-semibold', icon: <Clock size={14} className="text-danger" /> }
    if (diff < 86400000) return { text: `${Math.floor(diff / 3600000)}h left`, color: 'text-warning', icon: <Clock size={14} className="text-warning" /> }
    return { text: target.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), color: 'text-text-muted', icon: <Clock size={14} className="text-text-muted" /> }
  }

  const TaskRow = ({ task }: { task: Task }) => {
    const due = formatDue(task.deadline)
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
        className="flex items-center gap-4 py-3.5 px-4 hover:bg-bg-alt/50 rounded-xl group transition-colors">
        {/* Checkbox */}
        <button onClick={() => !task.completed && onCompleteTask(task.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${task.completed ? 'border-primary bg-primary text-white scale-100' : 'border-border-hover hover:border-primary hover:scale-105'}`}>
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Title + mode */}
        <div className="flex-1 min-w-0">
          <p className={`text-base ${task.completed ? 'line-through text-text-muted' : 'text-text'}`}>{task.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[13px] px-2 py-0.5 rounded-full ${task.mode === 'digital' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'}`}>
              {task.mode === 'digital' ? '💻 Digital' : '📦 Physical'}
            </span>
            {task.tags?.map(tag => (
              <span key={tag} className="text-[13px] px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!task.completed && due.icon}
          <span className={`text-[15px] ${task.completed ? 'text-text-muted line-through' : due.color}`}>
            {task.completed ? 'Done' : due.text}
          </span>
        </div>

        {/* Delete */}
        <button onClick={() => onDeleteTask(task.id)}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger cursor-pointer transition-opacity p-1">
          <Trash2 size={16} />
        </button>
      </motion.div>
    )
  }

  const Section = ({ title, items, defaultOpen = true, badge }: { title: string; items: Task[]; defaultOpen?: boolean; badge?: string }) => {
    const open = collapsed[title] !== undefined ? !collapsed[title] : defaultOpen
    if (items.length === 0) return null
    return (
      <div className="mb-4">
        <button onClick={() => toggleSection(title)} className="flex items-center gap-2 py-2 px-1 cursor-pointer w-full">
          {open ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
          <span className="text-base font-semibold text-text">{title}</span>
          <span className="text-[15px] text-text-muted">({items.length})</span>
          {badge && <span className="ml-1 px-2 py-0.5 rounded-full bg-danger/10 text-danger text-[13px] font-semibold">{badge}</span>}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              {items.map(t => <TaskRow key={t.id} task={t} />)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Set default deadline to 1 hour from now
  const getDefaultDeadline = () => {
    const d = new Date(Date.now() + 3600000)
    return d.toISOString().slice(0, 16)
  }

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-text">Tasks</h1>
          <p className="text-[15px] text-text-muted mt-0.5">
            {active.length} active · {overdue.length > 0 && <span className="text-danger font-semibold">{overdue.length} overdue</span>}
            {overdue.length > 0 && ' · '}{completed.length} completed
          </p>
        </div>
        <Button variant="premium" size="sm" onClick={() => { setShowAdd(true); setNewDeadline(getDefaultDeadline()) }}>
          <Plus size={18} /> New Task
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1">
          {(['All', 'Today', 'Upcoming', 'Completed'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-[15px] font-medium cursor-pointer transition-colors ${tab === t ? 'bg-bg-card border border-border text-text shadow-sm' : 'text-text-muted hover:text-text hover:bg-bg-alt'}`}>
              {t}
              {t === 'Today' && (overdue.length + todayTasks.length) > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-danger/10 text-danger text-[13px] font-semibold">{overdue.length + todayTasks.length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="pl-9 pr-4 py-2 rounded-xl border border-border bg-bg-input text-[15px] text-text w-44 focus:outline-none focus:border-primary placeholder:text-text-muted transition-all" />
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
      ) : displayTasks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg text-text-muted">{tab === 'Completed' ? 'No completed tasks yet' : search ? 'No tasks match your search' : 'No tasks yet'}</p>
          {!search && <button onClick={() => setShowAdd(true)} className="mt-3 text-base text-primary font-semibold cursor-pointer hover:underline">Create your first task</button>}
        </div>
      ) : (
        <div className="border border-border rounded-2xl bg-bg-card overflow-hidden divide-y divide-border/50">
          {tab === 'All' || tab === 'Today' ? (
            <>
              {overdue.length > 0 && (
                <div className="p-2">
                  <Section title="Overdue" items={search ? displayActive.filter(t => new Date(t.deadline) < now) : overdue} badge="!" />
                </div>
              )}
              {(tab === 'Today' ? todayTasks : upcoming).length > 0 && (
                <div className="p-2">
                  <Section title={tab === 'Today' ? 'Due Today' : 'Upcoming'} items={search ? displayActive.filter(t => new Date(t.deadline) >= now) : (tab === 'Today' ? todayTasks : upcoming)} />
                </div>
              )}
              {displayCompleted.length > 0 && tab !== 'Today' && (
                <div className="p-2">
                  <Section title="Completed" items={displayCompleted} defaultOpen={false} />
                </div>
              )}
              {displayActive.length === 0 && displayCompleted.length === 0 && (
                <div className="p-2">
                  {displayTasks.map(t => <TaskRow key={t.id} task={t} />)}
                </div>
              )}
            </>
          ) : (
            <div className="p-2">
              {displayTasks.map(t => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
              className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-semibold text-text">New Task</h3>
                <button onClick={() => setShowAdd(false)} className="text-text-muted hover:text-text cursor-pointer"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Title</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="What needs to be done?"
                    className="w-full rounded-xl bg-bg-input border border-border px-4 py-3 text-base text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-all" autoFocus />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Deadline</label>
                  <input type="datetime-local" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                    className="w-full rounded-xl bg-bg-input border border-border px-4 py-3 text-base text-text focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Mode</label>
                  <div className="flex gap-2">
                    <button onClick={() => setNewMode('digital')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-medium cursor-pointer transition-all ${newMode === 'digital' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-secondary hover:border-border-hover'}`}>
                      💻 Digital
                    </button>
                    <button onClick={() => setNewMode('physical')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-base font-medium cursor-pointer transition-all ${newMode === 'physical' ? 'border-warning bg-warning/10 text-warning' : 'border-border text-text-secondary hover:border-border-hover'}`}>
                      📦 Physical
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[13px] font-medium">
                        <Tag size={11} /> {tag}
                        <button onClick={() => setNewTags(prev => prev.filter(t => t !== tag))} className="hover:text-danger cursor-pointer"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); if (!newTags.includes(tagInput.trim())) setNewTags(prev => [...prev, tagInput.trim()]); setTagInput('') } }}
                      placeholder="Type a tag and press Enter"
                      className="flex-1 rounded-xl bg-bg-input border border-border px-4 py-2.5 text-[15px] text-text focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {suggestedTags.filter(t => !newTags.includes(t)).slice(0, 5).map(tag => (
                      <button key={tag} onClick={() => setNewTags(prev => [...prev, tag])}
                        className="px-2.5 py-1 rounded-full border border-border text-[13px] text-text-muted hover:border-primary hover:text-primary cursor-pointer transition-colors">
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button variant="premium" size="md" className="flex-1" onClick={handleAdd} disabled={!newTitle.trim()}>Create Task</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
