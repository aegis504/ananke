import { useState } from 'react'
import { X, Link2, Copy, Check, Globe, Lock, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { isValidEmail, sanitizeEmail } from '../../lib/sanitize'
import { supabase } from '../../lib/supabase'

interface Props {
  noteId: string
  noteTitle: string
  onClose: () => void
}

export function ShareNoteModal({ noteId, noteTitle, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'view' | 'edit'>('view')
  const [shared, setShared] = useState<{ email: string; role: string }[]>([])
  const [copied, setCopied] = useState(false)
  const [linkAccess, setLinkAccess] = useState<'private' | 'anyone'>('private')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleInvite = async () => {
    if (!email.trim() || !isValidEmail(email.trim())) return
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setSaving(false); return }

    const { error: err } = await supabase.from('shared_items').insert({
      owner_id: user.id,
      shared_with_email: sanitizeEmail(email),
      item_type: 'note',
      item_id: noteId,
      item_title: noteTitle,
      role,
    } as never)

    if (err) { setError(err.message); setSaving(false); return }
    setShared(prev => [...prev, { email: email.trim(), role }])
    setEmail('')
    setSaving(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?shared=${noteId}`).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-text">Share "{noteTitle}"</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text cursor-pointer"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Invite people</label>
            <div className="flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="Email address" className="flex-1 rounded-xl bg-bg-input border border-border px-3 py-2.5 text-[15px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary" />
              <select value={role} onChange={e => setRole(e.target.value as 'view' | 'edit')} className="rounded-xl border border-border bg-bg-input px-2 py-2.5 text-[13px] text-text-secondary cursor-pointer">
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
              <Button variant="premium" size="sm" onClick={handleInvite} disabled={!email.trim() || saving}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : 'Invite'}
              </Button>
            </div>
            {error && <p className="text-[13px] text-danger mt-1">{error}</p>}
          </div>

          {shared.length > 0 && (
            <div>
              <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">People with access</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center">Y</div>
                  <div className="flex-1"><p className="text-[15px] text-text">You</p></div>
                  <span className="text-[13px] text-text-muted">Owner</span>
                </div>
                {shared.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-bg-alt border border-border text-text-muted text-[12px] font-bold flex items-center justify-center">{s.email[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-text truncate">{s.email}</p>
                      <p className="text-[13px] text-success">✓ Invite sent</p>
                    </div>
                    <span className="text-[13px] text-text-muted capitalize">{s.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Link sharing</p>
            <button onClick={() => setLinkAccess(linkAccess === 'private' ? 'anyone' : 'private')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[15px] cursor-pointer transition-all mb-3 ${linkAccess === 'anyone' ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary hover:bg-bg-alt'}`}>
              {linkAccess === 'anyone' ? <Globe size={14} /> : <Lock size={14} />}
              {linkAccess === 'anyone' ? 'Anyone with the link' : 'Only invited people'}
            </button>
            <button onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-[15px] text-text-secondary hover:bg-bg-alt cursor-pointer transition-all w-full justify-center">
              {copied ? <><Check size={14} className="text-success" /> Copied!</> : <><Link2 size={14} /> <Copy size={14} /> Copy link</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
