import { motion } from 'framer-motion'
const features = [
  { icon: '📝', title: 'Notes & Documents', desc: 'Capture ideas anywhere. Rich editor with tables, checklists, images, and attachments.' },
  { icon: '✅', title: 'Tasks & Deadlines', desc: 'Create tasks with due dates that enforce themselves. No more missed deadlines.' },
  { icon: '📅', title: 'Calendar', desc: 'See your schedule at a glance. Events, tasks, and reminders in one view.' },
  { icon: '🔔', title: 'Smart Enforcement', desc: 'Escalating notifications that get more persistent until you complete the task.' },
  { icon: '📓', title: 'Notebooks & Tags', desc: 'Organize notes into notebooks and tag them for quick retrieval.' },
  { icon: '🤝', title: 'Share & Collaborate', desc: 'Share notes and notebooks with anyone. Real-time collaboration built in.' },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="mx-auto max-w-[960px]">
        <div className="text-center mb-16">
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-text">Everything you need to stay on track</h2>
          <p className="mt-3 text-base text-text-secondary max-w-[480px] mx-auto leading-relaxed">Powerful features designed to close the gap between what you plan and what you do.</p>
        </div>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-base font-semibold text-text">{f.title}</h3>
              <p className="mt-1.5 text-sm text-text-secondary leading-[1.6]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
