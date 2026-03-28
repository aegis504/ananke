import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'
import { ArrowLeft, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { checkRateLimit, isBot, resetRateLimit } from '../../lib/rateLimit'

interface Props { mode: 'signin' | 'signup'; onNavigate: (v: string) => void }

export function AuthPage({ mode, onNavigate }: Props) {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [fullName, setFullName] = useState('')
  const [showPwd, setShowPwd] = useState(false); const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null); const [success, setSuccess] = useState<string | null>(null)
  const [lockMsg, setLockMsg] = useState<string | null>(null)
  
  // Honeypot field (invisible to users, bots will fill it)
  const [honeypot, setHoneypot] = useState('')
  // Track when form rendered for timing check
  const formLoadTime = useRef(Date.now())
  useEffect(() => { formLoadTime.current = Date.now() }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setSuccess(null); setLockMsg(null)

    // Bot detection
    if (isBot(honeypot, formLoadTime.current)) {
      // Silent fail for bots — don't reveal detection
      setLoading(true)
      setTimeout(() => { setSuccess(mode === 'signup' ? 'Check your email to confirm!' : ''); setLoading(false) }, 2000)
      return
    }

    // Rate limiting: 5 login attempts per 2 minutes, 30-second lockout
    // 3 signup attempts per 5 minutes, 60-second lockout
    const key = mode === 'signin' ? `login:${email.toLowerCase()}` : `signup:${email.toLowerCase()}`
    const limit = mode === 'signin'
      ? checkRateLimit(key, 5, 120000, 30000)
      : checkRateLimit(key, 3, 300000, 60000)

    if (!limit.allowed) {
      const waitSec = Math.ceil((limit.lockedUntil - Date.now()) / 1000)
      setLockMsg(`Too many attempts. Please wait ${waitSec > 0 ? `${waitSec}s` : 'a moment'} before trying again.`)
      return
    }

    setLoading(true)
    if (mode === 'signup') {
      const { data, error: err } = await signUp(email, password, fullName)
      if (err) setError(err.message)
      else if (data?.session) {
        setSuccess('Account created! Signing you in...')
        resetRateLimit(key)
      } else {
        setSuccess('Check your email to confirm!')
        resetRateLimit(key)
      }
    } else {
      const { error: err } = await signIn(email, password)
      if (err) {
        // Generic error message to prevent user enumeration
        setError('Invalid email or password.')
      } else {
        resetRateLimit(key)
      }
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    if (isBot(honeypot, formLoadTime.current)) return
    const key = 'google:oauth'
    const limit = checkRateLimit(key, 5, 60000)
    if (!limit.allowed) { setLockMsg('Too many attempts. Please wait.'); return }
    setLoading(true); setError(null)
    const { error: err } = await signInWithGoogle()
    if (err) { setError(err.message); setLoading(false) }
  }

  const inputCls = "w-full rounded-lg bg-bg-input border border-border px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
      <button onClick={() => onNavigate('landing')} className="absolute top-4 left-4 p-2.5 rounded-xl text-text-muted hover:text-text hover:bg-bg-alt transition-colors cursor-pointer"><ArrowLeft size={18} /></button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[380px]">
        <div className="flex items-center gap-2 mb-8">
          <Logo size={28} />
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-text">Ananke</span>
        </div>

        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="text-[15px] text-text-secondary mt-1.5">{mode === 'signin' ? 'Sign in to continue to Ananke.' : 'Start organizing your life.'}</p>

        <button onClick={handleGoogle} disabled={loading} className="mt-6 w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-bg-card px-4 py-2.5 text-sm font-medium text-text hover:bg-bg-alt transition-all cursor-pointer disabled:opacity-50">
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-border" /><span className="text-[13px] text-text-muted uppercase tracking-wide">or</span><div className="flex-1 h-px bg-border" /></div>

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
          {/* Honeypot — hidden from real users, bots will fill it */}
          <div className="absolute -left-[9999px] -top-[9999px]" aria-hidden="true" tabIndex={-1}>
            <input type="text" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
          </div>

          {mode === 'signup' && <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name" className={inputCls} required />}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputCls} required />
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className={inputCls + ' pr-10'} required minLength={8} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer">{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>

          {lockMsg && (
            <div className="flex items-center gap-2 text-[13px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
              <ShieldAlert size={14} className="shrink-0" />
              {lockMsg}
            </div>
          )}
          {error && <p className="text-[13px] text-danger bg-danger-light rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-[13px] text-primary bg-primary-light rounded-lg px-3 py-2">{success}</p>}

          {mode === 'signup' && (
            <p className="text-[12px] text-text-muted">Password must be at least 8 characters.</p>
          )}

          <Button variant="premium" size="md" className="w-full" type="submit" disabled={loading}>{loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}</Button>
        </form>

        <div className="mt-5 text-sm text-text-secondary text-center">
          {mode === 'signin' ? (
            <p>Don't have an account? <button onClick={() => onNavigate('signup')} className="text-primary font-medium cursor-pointer hover:underline">Sign up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => onNavigate('signin')} className="text-primary font-medium cursor-pointer hover:underline">Sign in</button></p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
