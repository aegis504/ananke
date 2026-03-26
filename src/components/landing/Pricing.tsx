import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Check } from 'lucide-react'

const tiers = [
  { name: 'Free', price: '$0', desc: 'For getting started.', btn: 'default' as const, features: ['Up to 50 notes', 'Basic task tracking', 'Single device', 'Email reminders'] },
  { name: 'Personal', price: '$10.83', period: '/mo', desc: 'For power users.', btn: 'premium' as const, badge: 'Popular', features: ['Unlimited notes', 'Unlimited tasks', 'All devices', 'Smart enforcement', 'Templates', 'File uploads'] },
  { name: 'Professional', price: '$14.17', period: '/mo', desc: 'For teams.', btn: 'default' as const, features: ['Everything in Personal', 'Team collaboration', 'Shared notebooks', 'Admin dashboard', 'Priority support', 'API access'] },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-bg-alt">
      <div className="mx-auto max-w-[860px]">
        <div className="text-center mb-14">
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-text">Simple, transparent pricing</h2>
          <p className="mt-3 text-base text-text-secondary">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {tiers.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className={`relative bg-bg-card border rounded-xl p-6 flex flex-col ${t.badge ? 'border-primary/30 shadow-md' : 'border-border'}`}>
              {t.badge && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[13px] font-medium text-white">{t.badge}</span>}
              <p className="text-[13px] font-semibold uppercase tracking-[.08em] text-text-muted">{t.name}</p>
              <div className="mt-3 flex items-baseline gap-0.5">
                <span className="text-[32px] font-semibold tracking-[-0.03em] text-text">{t.price}</span>
                {t.period && <span className="text-sm text-text-muted">{t.period}</span>}
              </div>
              <p className="mt-1 text-sm text-text-secondary">{t.desc}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {t.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary leading-[1.4]">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant={t.btn} size="md" className="mt-6 w-full">{t.name === 'Free' ? 'Get started' : 'Start free trial'}</Button>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
          <p className="text-sm text-text-secondary">
            <span className="font-bold text-primary">Note for Judges:</span> Payment isn't added for the hackathon. 
            All "Start free trial" buttons grant immediate <strong>Unlimited Access</strong> for testing.
          </p>
        </div>
      </div>
    </section>
  )
}
