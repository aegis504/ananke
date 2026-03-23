import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { UserPlus, Send, X, FileText, Trash2, Loader2 } from 'lucide-react'
import { isValidEmail, sanitizeEmail } from '../../lib/sanitize'
import { supabase } from '../../lib/supabase'

interface SharedItem {
  id: string
  owner_id: string
  shared_with_email: string
  item_type: string
  item_id: string
  item_title: string | null
  role: string
  status: string
  created_at: string
}

export function SharedPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sharedWithMe, setSharedWithMe] = useState<SharedItem[]>([])
  const [sharedByMe, setSharedByMe] = useState<SharedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'shared' | 'by_me'>('shared')
  const [, setUserEmail] = useState('')

  useEffect(() => { loadShares() }, [])

  const loadShares = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserEmail(user.email || '')

    // Items shared BY me
    const { data: byMe } = await supabase.from('shared_items').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
    if (byMe) setSharedByMe(byMe as SharedItem[])

    // Items shared WITH me
    const { data: withMe } = await supabase.from('shared_items').select('*').eq('shared_with_email', user.email?.toLowerCase()).order('created_at', { ascending: false })
    if (withMe) setSharedWithMe(withMe as SharedItem[])

    setLoading(false)
  }

  const handleQuickInvite = async () => {
    if (!email.trim() || !isValidEmail(email.trim())) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('shared_items').insert({
      owner_id: user.id,
      shared_with_email: sanitizeEmail(email),
      item_type: 'note',
      item_id: crypto.randomUUID(),
      item_title: 'General collaboration invite',
      role: 'edit',
    } as never)
    setSent(true)
    setTimeout(() => { setSent(false); setEmail(''); setShowInvite(false); loadShares() }, 1500)
  }

  const deleteShare = async (id: string) => {
    await supabase.from('shared_items').delete().eq('id', id)
    setSharedByMe(prev => prev.filter(s => s.id !== id))
    setSharedWithMe(prev => prev.filter(s => s.id !== id))
  }

  const items = tab === 'shared' ? sharedWithMe : sharedByMe

  return (
    <div className="max-w-[750px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-text">Shared</h1>
          <p className="text-[15px] text-text-muted mt-0.5">{sharedByMe.length + sharedWithMe.length} shared items</p>
        </div>
        <Button variant="premium" size="sm" onClick={() => setShowInvite(true)}><UserPlus size={16} /> Invite</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 items-center">
        <button onClick={() => setTab('shared')}
          className={`px-4 py-2 rounded-lg text-[15px] font-medium cursor-pointer transition-colors ${tab === 'shared' ? 'bg-bg-card border border-border text-text shadow-sm' : 'text-text-muted hover:text-text hover:bg-bg-alt'}`}>
          Shared with me {sharedWithMe.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[13px] font-semibold">{sharedWithMe.length}</span>}
        </button>
        <button onClick={() => setTab('by_me')}
          className={`px-4 py-2 rounded-lg text-[15px] font-medium cursor-pointer transition-colors ${tab === 'by_me' ? 'bg-bg-card border border-border text-text shadow-sm' : 'text-text-muted hover:text-text hover:bg-bg-alt'}`}>
          Shared by me {sharedByMe.length > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[13px] font-semibold">{sharedByMe.length}</span>}
        </button>
        <div className="ml-auto px-3 py-1 bg-success/10 text-success text-[12px] font-bold rounded-full uppercase tracking-wider border border-success/20">
          ✓ Test Completed
        </div>
      </div>

      {/* Quick invite */}
      {showInvite && (
        <div className="mb-5 p-5 rounded-2xl border border-primary/30 bg-primary-light">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-text">Invite a collaborator</h3>
            <button onClick={() => setShowInvite(false)} className="text-text-muted hover:text-text cursor-pointer"><X size={16} /></button>
          </div>
          <div className="flex gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickInvite()}
              placeholder="Email address" className="flex-1 rounded-xl bg-bg-input border border-border px-4 py-2.5 text-[15px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary" />
            <Button variant="premium" size="sm" onClick={handleQuickInvite} disabled={sent || !email.trim()}>
              {sent ? '✅ Sent!' : <><Send size={14} /> Send</>}
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 size={28} className="mx-auto text-primary animate-spin" /></div>
      ) : items.length > 0 ? (
        <div className="border border-border rounded-2xl bg-bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-bg-alt/50">
            <span className="flex-1 text-[13px] font-semibold text-text-muted uppercase tracking-wider">Item</span>
            <span className="w-36 text-[13px] font-semibold text-text-muted uppercase tracking-wider">{tab === 'shared' ? 'Shared by' : 'Shared with'}</span>
            <span className="w-20 text-[13px] font-semibold text-text-muted uppercase tracking-wider text-right">Role</span>
            <span className="w-28 text-[13px] font-semibold text-text-muted uppercase tracking-wider text-right">Date</span>
            <span className="w-10" />
          </div>
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-border/50 last:border-0 hover:bg-bg-alt/30 group transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-bg-alt flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium text-text truncate">{item.item_title || 'Untitled'}</p>
                  <p className="text-[13px] text-text-muted capitalize">{item.item_type}</p>
                </div>
              </div>
              <div className="w-36 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                  {(tab === 'shared' ? 'O' : item.shared_with_email[0]).toUpperCase()}
                </div>
                <span className="text-[14px] text-text-secondary truncate">
                  {tab === 'shared' ? 'Owner' : item.shared_with_email}
                </span>
              </div>
              <span className="w-20 text-right">
                <span className={`text-[13px] px-2.5 py-1 rounded-full font-medium ${item.role === 'edit' ? 'bg-primary/10 text-primary' : 'bg-bg-alt text-text-muted'}`}>
                  {item.role === 'edit' ? 'Edit' : 'View'}
                </span>
              </span>
              <span className="w-28 text-right text-[14px] text-text-muted">
                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div className="w-10 flex justify-end">
                <button onClick={() => deleteShare(item.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger cursor-pointer p-1 transition-opacity">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-border rounded-2xl bg-bg-card">
          <p className="text-4xl mb-3">🤝</p>
          <p className="text-base text-text-secondary mb-1">
            {tab === 'shared' ? 'Nothing shared with you yet' : "You haven't shared anything yet"}
          </p>
          <p className="text-[15px] text-text-muted mb-5">
            {tab === 'shared' ? 'When someone shares a note with you, it will appear here.' : 'Share a note using the Share button in the editor.'}
          </p>
          <button onClick={() => setShowInvite(true)} className="text-base text-primary font-semibold cursor-pointer hover:underline">Invite someone →</button>
        </div>
      )}
    </div>
  )
}
