import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props { onClose: () => void }
const plans = [
  { name: 'Free', price: '$0', period: '/month', desc: 'Basic note-taking', btn: 'Current plan', disabled: true, features: ['Up to 50 notes', 'Basic tasks', 'Single device'] },
  { name: 'Personal', price: '$10.83', period: '/month', desc: 'For power users', btn: 'Choose Personal', disabled: false, features: ['Unlimited notes', 'Smart enforcement', 'All devices', 'Templates'] },
  { name: 'Professional', price: '$14.17', period: '/month', desc: 'Advanced features', btn: 'Choose Professional', disabled: false, features: ['Everything in Personal', 'File uploads (10GB)', 'Priority enforcement', 'API access'] },
  { name: 'Teams', price: '$20.83', period: '/user/month', desc: 'For your whole team', btn: 'Choose Teams', disabled: false, features: ['Everything in Professional', 'Team collaboration', 'Admin dashboard', 'Custom enforcement'] },
]

export function UpgradeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-bg-card rounded-2xl border border-border shadow-2xl max-w-[820px] w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-text">Choose your plan</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text cursor-pointer p-1"><X size={18} /></button>
          </div>
          <div className="flex justify-center gap-1.5 mb-8">
            <button className="px-3.5 py-1.5 rounded-full text-[12px] font-medium text-text-muted border border-border cursor-pointer">Monthly</button>
            <button className="px-3.5 py-1.5 rounded-full text-[12px] font-medium text-white bg-text cursor-pointer">Annual</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map(p => (
              <div key={p.name} className="border border-border rounded-xl p-4 flex flex-col">
                <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-text-muted">{p.name}</p>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-[26px] font-semibold tracking-[-0.03em] text-text">{p.price}</span>
                  <span className="text-[11px] text-text-muted">{p.period}</span>
                </div>
                <p className="text-[12px] text-text-secondary mt-1 mb-4">{p.desc}</p>
                <Button variant={p.disabled ? 'ghost' : 'premium'} size="sm" className="w-full mb-4" disabled={p.disabled}>{p.btn}</Button>
                <ul className="flex-1 space-y-2">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[12px] text-text-secondary leading-[1.4]">
                      <Check size={12} className="text-primary mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
