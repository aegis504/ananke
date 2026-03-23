import { useState, useEffect } from 'react'
import { FileText, Loader2, ArrowLeft, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Props {
  sharedId: string
  onNavigate: (v: string) => void
}

export function SharedViewPage({ sharedId, onNavigate }: Props) {
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState<{ title: string; content: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { loadShared() }, [sharedId])

  const loadShared = async () => {
    setLoading(true)
    setError('')

    // SECURITY: Only show content if it exists in shared_items table
    // This ensures the owner explicitly shared it — no direct note access by ID
    const { data: shared } = await supabase
      .from('shared_items')
      .select('item_id, item_title, item_type')
      .eq('item_id', sharedId)
      .limit(1)
      .single()

    if (!shared) {
      setError('This shared item is not available. It may be private or deleted.')
      setLoading(false)
      return
    }

    // Now fetch the note content — RLS will scope this appropriately
    // If the current user is the owner, they can see it. If not, we show the title from shared_items.
    const { data: noteData } = await supabase
      .from('notes')
      .select('title, content')
      .eq('id', (shared as { item_id: string }).item_id)
      .single()

    if (noteData) {
      setNote(noteData as { title: string; content: string })
    } else {
      // User isn't the owner — show just the title from shared_items
      setNote({ title: (shared as { item_title: string }).item_title || 'Shared Note', content: 'Sign in to view this shared note.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-lg font-bold text-text">Ananke</span>
          <span className="text-[13px] text-text-muted bg-bg-alt px-2 py-0.5 rounded-full">Shared View</span>
        </div>
        <button onClick={() => { window.history.replaceState({}, '', '/'); onNavigate('landing') }}
          className="flex items-center gap-2 text-[15px] text-text-muted hover:text-text cursor-pointer">
          <ArrowLeft size={16} /> Go to Ananke
        </button>
      </header>

      <div className="max-w-[700px] mx-auto py-10 px-6">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="mx-auto text-primary animate-spin mb-3" />
            <p className="text-base text-text-muted">Loading shared content...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <Lock size={48} className="mx-auto text-text-muted/30 mb-4" />
            <h2 className="text-xl font-bold text-text mb-2">Content Not Available</h2>
            <p className="text-base text-text-muted mb-6">{error}</p>
            <button onClick={() => { window.history.replaceState({}, '', '/'); onNavigate('landing') }}
              className="px-6 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-hover cursor-pointer transition-colors">
              Go to Ananke
            </button>
          </div>
        ) : note ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-accent" />
              <h1 className="text-[32px] font-bold text-text">{note.title || 'Untitled'}</h1>
            </div>
            <div className="bg-bg-card border border-border rounded-2xl p-8">
              <pre className="text-base text-text-secondary whitespace-pre-wrap break-words font-sans leading-relaxed">{note.content || 'No content'}</pre>
            </div>
            <div className="mt-6 text-center">
              <p className="text-[14px] text-text-muted mb-3">Want to create your own notes?</p>
              <button onClick={() => { window.history.replaceState({}, '', '/'); onNavigate('signup') }}
                className="px-6 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary-hover cursor-pointer transition-colors">
                Sign up for Ananke
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
