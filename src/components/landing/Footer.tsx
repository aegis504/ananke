import { Logo } from '../Logo'
export function Footer() {
  return (
    <footer className="border-t border-border py-6 px-6">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Logo size={18} />
          <span className="text-sm font-semibold text-text">Ananke</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/judges" className="text-[13px] text-primary font-medium hover:underline">For Judges →</a>
          <p className="text-[13px] text-text-muted">© 2026 Ananke. Necessity is not negotiable.</p>
        </div>
      </div>
    </footer>
  )
}
