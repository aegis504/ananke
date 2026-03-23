import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { useTimer } from '../../hooks/useTimer'
import type { Task } from '../../hooks/useTasks'
import { Zap, BellRing, CheckCircle2, Workflow, Trash2 } from 'lucide-react'

interface Props { task: Task; onToggleMode: () => void; onComplete: () => void; onPrepareWorkflow: () => void; onDelete: () => void }

export function TaskCard({ task, onToggleMode, onComplete, onPrepareWorkflow, onDelete }: Props) {
  const { display, isOverdue } = useTimer(new Date(task.deadline).getTime())
  const enforcing = isOverdue && !task.completed

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
      <Card variant={task.completed ? 'default' : enforcing ? 'urgent' : 'default'} className={task.completed ? 'opacity-45' : ''}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-[15px] truncate ${task.completed ? 'line-through text-text-muted' : 'text-text'}`}>{task.title}</h3>
            <button onClick={onToggleMode} className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-all ${task.mode === 'digital' ? 'bg-primary-light text-primary' : 'bg-danger-light text-danger'}`}>
              {task.mode === 'digital' ? <Zap size={12} /> : <BellRing size={12} />}{task.mode}
            </button>
          </div>
          <div className="text-right shrink-0">
            <p className={`font-mono text-xl font-bold tabular-nums ${task.completed ? 'text-success' : enforcing ? 'text-danger animate-pulse' : 'text-text'}`}>
              {task.completed ? '✓' : display}
            </p>
            {enforcing && <p className="text-[10px] font-bold uppercase tracking-widest text-danger mt-1">Enforcement Active</p>}
          </div>
        </div>
        {!task.completed && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <Button variant={enforcing ? 'urgent' : 'premium'} size="sm" onClick={onComplete}><CheckCircle2 size={14} /> Complete</Button>
            {task.mode === 'digital' && <Button variant="ghost" size="sm" onClick={onPrepareWorkflow} disabled={task.workflow_prepared}><Workflow size={14} />{task.workflow_prepared ? 'Workflow Ready' : 'Prepare Workflow'}</Button>}
            <Button variant="ghost" size="sm" onClick={onDelete} className="ml-auto text-text-muted hover:text-danger"><Trash2 size={14} /></Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
