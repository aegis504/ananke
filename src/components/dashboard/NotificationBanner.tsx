import { Bell, X } from 'lucide-react'
import { Button } from '../ui/Button'
interface Props { onEnable: () => void; onDismiss: () => void }
export function NotificationBanner({ onEnable, onDismiss }: Props) {
  return (
    <div className="mx-5 mt-3 mb-1 flex items-center gap-3 rounded-xl bg-primary-light border border-primary/20 px-4 py-3">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Bell size={18} className="text-primary" /></div>
      <div className="flex-1 min-w-0"><p className="text-[15px] font-semibold text-text">Enable notifications</p><p className="text-[13px] text-text-secondary">Get alerted when tasks approach their deadline.</p></div>
      <Button variant="premium" size="sm" onClick={onEnable}>Enable</Button>
      <button onClick={onDismiss} className="text-text-muted hover:text-text cursor-pointer shrink-0"><X size={16} /></button>
    </div>
  )
}
