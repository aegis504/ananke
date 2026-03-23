import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'

interface Props { userId: string; onComplete: () => void }

export function OnboardingFlow({ userId, onComplete }: Props) {
  const [step, setStep] = useState(0); const [intent, setIntent] = useState<'personal' | 'work' | ''>(''); const [useCase, setUseCase] = useState(''); const [company, setCompany] = useState(''); const [loading, setLoading] = useState(false)
  const progress = ((step + 1) / 3) * 100
  const finish = async () => { setLoading(true); await supabase.from('profiles').update({ intent: intent || null, use_case: useCase || null, company: company || null } as never).eq('id', userId); setLoading(false); onComplete() }

  const optionCls = (active: boolean) => `w-full flex items-center gap-3.5 rounded-lg border p-3.5 text-left transition-all cursor-pointer ${active ? 'border-primary bg-primary-light' : 'border-border bg-bg-card hover:border-border-hover'}`
  const radioCls = (active: boolean) => `w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-primary' : 'border-border'}`

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-14 pb-10 bg-bg">
      <div className="flex items-center gap-2 mb-5"><Logo size={24} /><span className="text-[15px] font-semibold text-text">Ananke</span></div>
      <div className="w-40 h-1 bg-border rounded-full mb-14 overflow-hidden"><motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} /></div>
      <div className="w-full max-w-[400px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-primary mb-2">Step 1 of 3</p>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text mb-1.5">How will you use Ananke?</h2>
              <p className="text-[15px] text-text-secondary mb-6">We'll set up the best experience for you.</p>
              {(['personal', 'work'] as const).map(v => (
                <button key={v} onClick={() => setIntent(v)} className={optionCls(intent === v) + ' mb-2.5'}>
                  <span className="text-xl">{v === 'personal' ? '🟢' : '🟠'}</span>
                  <span className="text-[15px] font-medium text-text">{v === 'personal' ? 'For my productivity' : 'For work'}</span>
                </button>
              ))}
              <Button variant="premium" size="md" className="w-full mt-4" disabled={!intent} onClick={() => setStep(1)}>Continue</Button>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-primary mb-2">Step 2 of 3</p>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text mb-1.5">What are you planning to do?</h2>
              <p className="text-[15px] text-text-secondary mb-6">Help us customize your experience.</p>
              {[['migrate', 'Migrate from an existing tool'], ['switch', 'Switch from another product'], ['scratch', 'Start from scratch']].map(([v, label]) => (
                <button key={v} onClick={() => setUseCase(v)} className={optionCls(useCase === v) + ' mb-2.5'}>
                  <div className={radioCls(useCase === v)}>{useCase === v && <div className="w-2 h-2 rounded-full bg-primary" />}</div>
                  <span className="text-[15px] font-medium text-text">{label}</span>
                </button>
              ))}
              <Button variant="premium" size="md" className="w-full mt-4" disabled={!useCase} onClick={() => setStep(2)}>Continue</Button>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <p className="text-[13px] font-semibold uppercase tracking-[.12em] text-primary mb-2">Step 3 of 3</p>
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text mb-1.5">Almost there!</h2>
              <p className="text-[15px] text-text-secondary mb-6">Tell us a bit more about yourself.</p>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" className="w-full rounded-lg bg-bg-input border border-border px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary mb-4" />
              <Button variant="premium" size="md" className="w-full" onClick={finish} disabled={loading}>{loading ? 'Setting up...' : 'Launch Ananke →'}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
