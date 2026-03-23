import { useState } from 'react'
import { X, Search, FileText, Target, Calendar, Lightbulb, BarChart3, CheckSquare } from 'lucide-react'
import { Button } from '../ui/Button'


const CATEGORIES = ['All', 'Productivity', 'Planning', 'Meetings', 'Projects'] as const

const templates = [
  { icon: <CheckSquare size={20} />, name: 'To-do List', cat: 'Productivity', desc: 'Simple task checklist to stay on track.',
    content: '## To-do List\n\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n- [ ] Task 4\n- [ ] Task 5\n\n---\n*Created from Ananke template*' },
  { icon: <FileText size={20} />, name: 'Meeting Notes', cat: 'Meetings', desc: 'Capture agendas, discussions, and action items.',
    content: '## Meeting Notes\n\n**Date:** ' + new Date().toLocaleDateString() + '\n**Attendees:**\n\n---\n\n### Agenda\n1. \n2. \n3. \n\n### Discussion\n\n\n### Action Items\n- [ ] \n- [ ] \n\n### Next Steps\n' },
  { icon: <Calendar size={20} />, name: 'Weekly Planner', cat: 'Planning', desc: 'Plan your week with daily sections.',
    content: '## Weekly Planner\n\n### Monday\n- [ ] \n\n### Tuesday\n- [ ] \n\n### Wednesday\n- [ ] \n\n### Thursday\n- [ ] \n\n### Friday\n- [ ] \n\n### Weekend\n- [ ] \n\n---\n### Goals for the Week\n1. \n2. \n3. ' },
  { icon: <Target size={20} />, name: 'Goal Tracker', cat: 'Productivity', desc: 'Track OKRs and key results.',
    content: '## Goal Tracker\n\n### 🎯 Main Goal\n\n\n### Key Results\n1. [ ] KR1: \n2. [ ] KR2: \n3. [ ] KR3: \n\n### Progress Log\n| Date | Update | Progress |\n|------|--------|----------|\n| ' + new Date().toLocaleDateString() + ' | Started | 0% |\n\n### Next Actions\n- [ ] ' },
  { icon: <BarChart3 size={20} />, name: 'Project Plan', cat: 'Projects', desc: 'Full project planning with milestones.',
    content: '## Project Plan\n\n**Project Name:** \n**Start Date:** ' + new Date().toLocaleDateString() + '\n**Target Date:** \n\n---\n\n### Milestones\n1. [ ] Milestone 1 — Due: \n2. [ ] Milestone 2 — Due: \n3. [ ] Milestone 3 — Due: \n\n### Tasks\n- [ ] \n- [ ] \n\n### Risks\n- ' },
  { icon: <Lightbulb size={20} />, name: 'Brainstorm', cat: 'Productivity', desc: 'Capture and prioritize ideas.',
    content: '## Brainstorm Session\n\n**Topic:** \n\n---\n\n### 🔥 High Priority\n1. \n\n### 💡 Medium Priority\n1. \n\n### 💭 Later\n1. \n\n### Next Steps\n- [ ] ' },
  { icon: <FileText size={20} />, name: 'Daily Journal', cat: 'Productivity', desc: 'Reflect on your day.',
    content: '## Daily Journal — ' + new Date().toLocaleDateString() + '\n\n### 🌅 Morning Intention\n\n\n### ✅ Accomplished Today\n- \n\n### 💭 Reflections\n\n\n### 🙏 Grateful For\n1. \n2. \n3. ' },
  { icon: <FileText size={20} />, name: '1-on-1 Meeting', cat: 'Meetings', desc: 'Structure your 1-on-1s.',
    content: '## 1-on-1 Meeting\n\n**With:** \n**Date:** ' + new Date().toLocaleDateString() + '\n\n---\n\n### Check-in\n- How are things going?\n\n### Updates\n- \n\n### Discussion Topics\n1. \n\n### Action Items\n- [ ] \n\n### Feedback\n' },
  { icon: <BarChart3 size={20} />, name: 'Sprint Retrospective', cat: 'Projects', desc: 'Review what went well and improve.',
    content: '## Sprint Retrospective\n\n**Sprint:** #\n**Date:** ' + new Date().toLocaleDateString() + '\n\n---\n\n### ✅ What Went Well\n- \n\n### ❌ What Didn\'t Go Well\n- \n\n### 💡 Improvements\n- \n\n### Action Items\n- [ ] ' },
]

interface Props {
  onSelect: (title: string, content: string) => void
  onClose: () => void
}

export function TemplateGalleryModal({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<typeof CATEGORIES[number]>('All')
  const [preview, setPreview] = useState<typeof templates[0] | null>(null)

  const filtered = templates.filter(t => {
    if (cat !== 'All' && t.cat !== cat) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-text">Template Gallery</h2>
            <p className="text-xs text-text-muted mt-0.5">Choose a template to get started quickly</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text cursor-pointer"><X size={20} /></button>
        </div>

        {/* Search + Categories */}
        <div className="px-6 py-3 border-b border-border shrink-0">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-input border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${cat === c ? 'bg-primary text-white' : 'bg-bg-alt text-text-secondary border border-border hover:bg-bg'}`}>{c}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
            {filtered.map(t => (
              <button key={t.name} onClick={() => setPreview(t)} onDoubleClick={() => onSelect(t.name, t.content)} className={`text-left p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${preview?.name === t.name ? 'border-primary bg-primary-light' : 'border-border hover:border-border-hover'}`}>
                <div className="text-primary mb-2">{t.icon}</div>
                <h4 className="text-sm font-semibold text-text">{t.name}</h4>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{t.desc}</p>
                <span className="inline-block mt-2 text-xs text-text-muted bg-bg-alt px-2 py-0.5 rounded-full">{t.cat}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center py-8 text-sm text-text-muted">No templates found</p>}
          </div>

          {/* Preview panel */}
          {preview && (
            <div className="w-[240px] border-l border-border p-4 overflow-y-auto shrink-0 hidden sm:block">
              <div className="text-primary mb-3">{preview.icon}</div>
              <h3 className="text-base font-bold text-text">{preview.name}</h3>
              <p className="text-xs text-text-secondary mt-1 mb-4">{preview.desc}</p>
              <Button variant="premium" size="sm" className="w-full" onClick={() => onSelect(preview.name, preview.content)}>
                Use Template
              </Button>
              <div className="mt-4 p-3 rounded-lg bg-bg-alt text-xs text-text-muted font-mono whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                {preview.content.substring(0, 300)}...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
