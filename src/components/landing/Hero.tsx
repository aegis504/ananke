import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
interface Props { onLaunch: () => void }

export function Hero({ onLaunch }: Props) {
  return (
    <section className="pt-24 pb-20 px-6 overflow-hidden">
      <div className="mx-auto max-w-[680px] text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-[1.12] tracking-[-0.035em] text-text">
            Tame your work,{' '}
            <span className="text-primary">organize your life</span>
          </h1>
          <p className="mt-5 text-[16px] leading-[1.6] text-text-secondary max-w-[520px] mx-auto">
            Remember everything and tackle any project with your notes, tasks, and schedule all in one place.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: 'easeOut' }} className="mt-8 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3">
          <Button variant="premium" size="lg" onClick={onLaunch} className="w-full sm:w-auto">Get Ananke free</Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto">See plans</Button>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4 text-[13px] text-text-muted">
          No credit card required • Free forever plan available
        </motion.p>
      </div>
    </section>
  )
}
