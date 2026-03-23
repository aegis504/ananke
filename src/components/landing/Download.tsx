import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
const platforms = [
  { icon: '🍎', name: 'macOS', note: 'Apple Silicon & Intel' },
  { icon: '🪟', name: 'Windows', note: 'Windows 10+' },
  { icon: '📱', name: 'iOS', note: 'iPhone & iPad' },
  { icon: '🤖', name: 'Android', note: 'Android 12+' },
]

export function Download() {
  return (
    <section id="download" className="py-24 px-6">
      <div className="mx-auto max-w-[860px]">
        <div className="text-center mb-14">
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-text">Available everywhere</h2>
          <p className="mt-3 text-base text-text-secondary">Your notes and tasks sync across every device.</p>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {platforms.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="bg-bg-card border border-border rounded-xl p-5 text-center flex flex-col items-center">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="text-[15px] font-semibold text-text">{p.name}</h3>
              <p className="text-[13px] text-text-muted mt-1">{p.note}</p>
              {p.name === 'Windows' ? (
                <a href="https://github.com/aegis504/ananke/releases/latest/download/Ananke_Setup.exe" download className="mt-4 w-full">
                  <Button variant="premium" size="sm" className="w-full">Download App</Button>
                </a>
              ) : p.name === 'iOS' ? (
                <a href="#" onClick={e => { e.preventDefault(); alert('iOS App coming soon!'); }} className="mt-4 w-full">
                  <Button variant="premium" size="sm" className="w-full bg-[#00a82d] hover:bg-[#00a82d]/80 text-white border-transparent">Get iOS App</Button>
                </a>
              ) : (
                <Button variant="ghost" size="sm" className="mt-4 w-full" disabled>Coming Q4 2026</Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
