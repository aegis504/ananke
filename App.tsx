import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { LandingPage } from './components/landing/LandingPage'
import { AuthPage } from './components/auth/AuthPage'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { Dashboard } from './components/dashboard/Dashboard'
import { SharedViewPage } from './components/dashboard/SharedViewPage'
import { ForJudgesPage } from './components/ForJudgesPage'
import { supabase } from './lib/supabase'

type View = 'landing' | 'signin' | 'signup' | 'onboarding' | 'dashboard' | 'shared' | 'judges'
interface ProfileRow { intent: string | null }

// Map URL paths to dashboard pages
const PATH_TO_PAGE: Record<string, string> = {
  '/dashboard': 'home',
  '/shortcuts': 'shortcuts',
  '/notes': 'notes',
  '/tasks': 'tasks',
  '/files': 'files',
  '/calendar': 'calendar',
  '/templates': 'templates',
  '/notebooks': 'notebooks',
  '/tags': 'tags',
  '/shared': 'shared',
  '/settings': 'settings',
}

const PAGE_TO_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(PATH_TO_PAGE).map(([k, v]) => [v, k])
)

function getInitialState(): { view: View; sharedId: string | null; dashPage: string | null } {
  const path = window.location.pathname
  const params = new URLSearchParams(window.location.search)
  const shared = params.get('shared')

  if (shared) return { view: 'shared', sharedId: shared, dashPage: null }
  if (path === '/judges' || path === '/for-judges') return { view: 'judges', sharedId: null, dashPage: null }
  if (path === '/signin' || path === '/login') return { view: 'signin', sharedId: null, dashPage: null }
  if (path === '/signup' || path === '/register') return { view: 'signup', sharedId: null, dashPage: null }

  // Dashboard pages
  const dashPage = PATH_TO_PAGE[path]
  if (dashPage) return { view: 'dashboard', sharedId: null, dashPage }

  return { view: 'landing', sharedId: null, dashPage: null }
}

function App() {
  const { user, loading, signOut } = useAuth()
  const initial = getInitialState()
  const [view, setView] = useState<View>(initial.view)
  const [sharedId] = useState<string | null>(initial.sharedId)
  const [initialPage] = useState<string | null>(initial.dashPage)

  // Push URL state
  const navigate = useCallback((v: View, page?: string) => {
    setView(v)
    if (v === 'dashboard' && page && PAGE_TO_PATH[page]) {
      window.history.pushState(null, '', PAGE_TO_PATH[page])
    } else if (v === 'landing') {
      window.history.pushState(null, '', '/')
    } else if (v === 'signin') {
      window.history.pushState(null, '', '/signin')
    } else if (v === 'signup') {
      window.history.pushState(null, '', '/signup')
    } else if (v === 'judges') {
      window.history.pushState(null, '', '/judges')
    }
  }, [])

  // Handle browser back/forward
  useEffect(() => {
    const onPop = () => {
      const s = getInitialState()
      setView(s.view)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (view === 'shared' || view === 'judges') return
    if (user) {
      supabase.from('profiles').select('intent').eq('id', user.id).single().then(({ data }) => {
        const profile = data as ProfileRow | null
        if (!profile?.intent) {
          setView('onboarding')
        } else if (view === 'signin' || view === 'signup') {
          // Only redirect away from auth pages when logged in
          setView('dashboard')
        } else if (initial.dashPage) {
          // User navigated directly to a dashboard URL like /notes, /tasks
          setView('dashboard')
        }
      })
    }
  }, [user, loading])

  if (loading) return (<div className="min-h-screen flex items-center justify-center bg-bg"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>)

  return (
    <AnimatePresence mode="wait">
      {view === 'judges' && <motion.div key="j" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ForJudgesPage onNavigate={(v: string) => navigate(v as View)} /></motion.div>}
      {view === 'shared' && sharedId && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SharedViewPage sharedId={sharedId} onNavigate={(v) => navigate(v as View)} /></motion.div>}
      {view === 'landing' && <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LandingPage onNavigate={(v: string) => navigate(v as View)} isLoggedIn={!!user} /></motion.div>}
      {(view === 'signin' || view === 'signup') && <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AuthPage mode={view} onNavigate={(v: string) => navigate(v as View)} /></motion.div>}
      {view === 'onboarding' && user && <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><OnboardingFlow userId={user.id} onComplete={() => navigate('dashboard', 'home')} /></motion.div>}
      {view === 'dashboard' && user && <motion.div key="d" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><Dashboard user={user} onSignOut={signOut} onNavigate={(v: string) => navigate(v as View)} initialPage={initialPage || undefined} onPageChange={(p: string) => { if (PAGE_TO_PATH[p]) window.history.replaceState(null, '', PAGE_TO_PATH[p]) }} /></motion.div>}
    </AnimatePresence>
  )
}
export default App
