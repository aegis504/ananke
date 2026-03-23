import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
const ICONS = ['📓', '📕', '📗', '📘', '📙', '🗂', '📚', '💼']

interface Props {
  onClose: () => void
  onCreate: (name: string, color: string) => void
}

export function CreateNotebookModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [icon, setIcon] = useState(ICONS[0])
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    await onCreate(name.trim(), color)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-text">Create Notebook</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text cursor-pointer"><X size={18} /></button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-bg-alt border border-border">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[26px]" style={{ backgroundColor: color + '20' }}>
            {icon}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-text">{name || 'Notebook name'}</p>
            <p className="text-[13px] text-text-muted">0 notes</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[13px] font-medium text-text-secondary mb-1.5 block">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="My Notebook" className="w-full rounded-[10px] bg-bg-input border border-border px-4 py-3 text-[15px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors" autoFocus />
          </div>

          <div>
            <label className="text-[13px] font-medium text-text-secondary mb-1.5 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(i => (
                <button key={i} onClick={() => setIcon(i)} className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg cursor-pointer transition-all ${icon === i ? 'bg-primary-light border-2 border-primary' : 'bg-bg-alt border border-border hover:border-border-hover'}`}>{i}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-text-secondary mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full cursor-pointer transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="ghost" size="md" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="premium" size="md" className="flex-1" onClick={handleCreate} disabled={!name.trim() || loading}>
            {loading ? 'Creating...' : 'Create Notebook'}
          </Button>
        </div>
      </div>
    </div>
  )
}
