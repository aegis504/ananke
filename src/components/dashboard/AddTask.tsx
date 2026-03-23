import { useState } from 'react'
import { Button } from '../ui/Button'
import { Plus } from 'lucide-react'

interface Props { onAdd: (title: string, mode: 'digital' | 'physical', minutes: number) => void }

export function AddTask({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [mode, setMode] = useState<'digital' | 'physical'>('digital')
  const [minutes, setMinutes] = useState(30)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await onAdd(title.trim(), mode, minutes)
    setTitle(''); setLoading(false)
  }

  const selCls = "rounded-[10px] bg-bg-input border border-border px-3 py-2.5 text-[13px] text-text-secondary cursor-pointer focus:outline-none focus:border-primary"

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-bg-card p-4">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What must be done..." className="flex-1 rounded-[10px] bg-bg-input border border-border px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors" />
        <div className="flex gap-2">
          <select value={mode} onChange={e => setMode(e.target.value as 'digital' | 'physical')} className={selCls}><option value="digital">⚡ Digital</option><option value="physical">🔔 Physical</option></select>
          <select value={minutes} onChange={e => setMinutes(Number(e.target.value))} className={selCls}><option value={5}>5 min</option><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 hour</option><option value={120}>2 hours</option></select>
          <Button type="submit" variant="premium" size="md" disabled={loading || !title.trim()}><Plus size={16} /> {loading ? '...' : 'Add'}</Button>
        </div>
      </div>
    </form>
  )
}
