import { Logo } from '../Logo'
import { Button } from '../ui/Button'
interface Props { onNavigate: (v: 'landing' | 'signin' | 'signup' | 'onboarding' | 'dashboard') => void; isLoggedIn: boolean }

export function Navbar({ onNavigate, isLoggedIn }: Props) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-bg/90 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 cursor-pointer">
          <Logo size={24} />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-text">Ananke</span>
        </button>
        <div className="hidden sm:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">Plans</a>
          <a href="#download" className="text-sm font-medium text-text-secondary hover:text-text transition-colors">Download</a>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Button variant="premium" size="sm" onClick={() => onNavigate('dashboard')}>Open app</Button>
          ) : (
            <>
              <button onClick={() => onNavigate('signin')} className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text transition-colors cursor-pointer">Log in</button>
              <Button variant="premium" size="sm" onClick={() => onNavigate('signup')}>Get started free</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
