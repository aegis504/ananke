import { useState, useEffect } from 'react'
import { User, Mail, Lock, Bell, Moon, Sun, Globe, Trash2, LogOut, Camera, Loader2, Check, Shield, Calendar as CalendarIcon, Unlink, Link2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'

interface Props {
  user: { id: string; email?: string }
  profile: { full_name?: string | null; avatar_url?: string | null } | null
  dark: boolean
  toggleTheme: () => void
  onSignOut: () => void
  onUpdateProfile: (updates: Record<string, unknown>) => void
}

export function SettingsPage({ user, profile, dark, toggleTheme, onSignOut, onUpdateProfile }: Props) {
  const [tab, setTab] = useState<'profile' | 'account' | 'notifications' | 'calendar' | 'appearance'>('profile')
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [notifTasks, setNotifTasks] = useState(true)
  const [notifShared, setNotifShared] = useState(true)
  const [notifReminders, setNotifReminders] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => { setFullName(profile?.full_name || '') }, [profile])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName } as never).eq('id', user.id)
    onUpdateProfile({ full_name: fullName })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const changePassword = async () => {
    if (newPassword.length < 8) { setPasswordMsg('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordMsg('Passwords do not match'); return }
    setPasswordMsg('')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPasswordMsg(error.message)
    else { setPasswordMsg('✅ Password updated!'); setNewPassword(''); setConfirmPassword('') }
  }

  const [googleConnected, setGoogleConnected] = useState(!!localStorage.getItem('google_calendar_token'))

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'account', label: 'Account', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: dark ? <Moon size={18} /> : <Sun size={18} /> },
  ] as const

  const Toggle = ({ on, onChange, label, desc }: { on: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-base text-text font-medium">{label}</p><p className="text-[14px] text-text-muted">{desc}</p></div>
      <button onClick={() => onChange(!on)} className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${on ? 'bg-primary' : 'bg-border'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-5.5 ml-[22px]' : 'translate-x-0.5 ml-[2px]'}`} />
      </button>
    </div>
  )

  return (
    <div className="max-w-[800px] mx-auto">
      <h1 className="text-[32px] font-bold text-text mb-1">Settings</h1>
      <p className="text-base text-text-secondary mb-6">Manage your account, preferences, and notifications.</p>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Sidebar tabs */}
        <div className="w-full sm:w-48 shrink-0">
          <div className="flex sm:flex-col gap-1 overflow-x-auto pb-2 sm:pb-0">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`whitespace-nowrap flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[14px] sm:text-[15px] font-medium cursor-pointer transition-colors ${tab === t.id ? 'bg-bg-card border border-border text-text shadow-sm' : 'text-text-muted hover:text-text hover:bg-bg-alt'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'profile' && (
            <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold text-text">Profile</h2>

              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-primary/15 text-primary text-2xl font-bold flex items-center justify-center relative">
                  {fullName ? fullName[0].toUpperCase() : 'U'}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-bg-card border border-border flex items-center justify-center">
                    <Camera size={14} className="text-text-muted" />
                  </div>
                </div>
                <div>
                  <p className="text-base font-semibold text-text">{fullName || 'User'}</p>
                  <p className="text-[14px] text-text-muted">{user.email}</p>
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-xl bg-bg-input border border-border px-4 py-3 text-base text-text focus:outline-none focus:border-primary transition-all" />
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-alt border border-border">
                  <Mail size={16} className="text-text-muted" />
                  <span className="text-base text-text-secondary">{user.email}</span>
                  <span className="ml-auto text-[13px] text-success font-medium">Verified</span>
                </div>
              </div>

              <Button variant="premium" size="md" onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
              </Button>
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-6">
              <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-bold text-text">Change Password</h2>
                <div>
                  <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password"
                      className="w-full rounded-xl bg-bg-input border border-border pl-11 pr-4 py-3 text-base text-text focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password"
                      className="w-full rounded-xl bg-bg-input border border-border pl-11 pr-4 py-3 text-base text-text focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                {passwordMsg && <p className={`text-[15px] ${passwordMsg.startsWith('✅') ? 'text-success' : 'text-danger'}`}>{passwordMsg}</p>}
                <Button variant="premium" size="md" onClick={changePassword}>Update Password</Button>
              </div>

              <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold text-text">Sessions</h2>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-alt border border-border">
                  <Globe size={18} className="text-primary" />
                  <div className="flex-1">
                    <p className="text-base font-medium text-text">Current Session</p>
                    <p className="text-[13px] text-text-muted">Active now · Web browser</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-success/10 text-success text-[13px] font-medium">Active</span>
                </div>
                <Button variant="ghost" size="md" onClick={onSignOut}><LogOut size={16} /> Sign out</Button>
              </div>

              <div className="bg-bg-card border border-danger/20 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold text-danger">Danger Zone</h2>
                <p className="text-[15px] text-text-secondary">Account deletion is a permanent action. For your safety, deletion requests take <strong>24 hours</strong> to process and can be cancelled within that window.</p>
                {!showDeleteConfirm ? (
                  <Button variant="urgent" size="md" onClick={() => setShowDeleteConfirm(true)}><Trash2 size={16} /> Request Account Deletion</Button>
                ) : (
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center shrink-0 mt-0.5"><Trash2 size={18} className="text-danger" /></div>
                      <div>
                        <p className="text-base font-semibold text-danger">Confirm Account Deletion</p>
                        <p className="text-[14px] text-text-secondary mt-1">Your account and all data will be scheduled for permanent deletion. You have <strong>24 hours</strong> to cancel this request by logging back in.</p>
                        <ul className="text-[14px] text-text-muted mt-2 space-y-1">
                          <li>• All notes, tasks, files, and settings will be removed</li>
                          <li>• Shared items will become inaccessible</li>
                          <li>• This cannot be undone after 24 hours</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                      <Button variant="urgent" size="sm" className="flex-1" onClick={() => { setShowDeleteConfirm(false); /* schedule deletion */ }}>Schedule Deletion (24h)</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-2">
              <h2 className="text-xl font-bold text-text mb-4">Notification Preferences</h2>
              <Toggle on={notifTasks} onChange={setNotifTasks} label="Task reminders" desc="Get notified before task deadlines" />
              <div className="border-t border-border" />
              <Toggle on={notifShared} onChange={setNotifShared} label="Shared items" desc="Notify when someone shares with you" />
              <div className="border-t border-border" />
              <Toggle on={notifReminders} onChange={setNotifReminders} label="Daily digest" desc="Summary of upcoming tasks each morning" />
              <div className="border-t border-border pt-4">
                <h3 className="text-base font-semibold text-text mb-2">Push Notifications</h3>
                <p className="text-[14px] text-text-muted mb-3">Enable browser push notifications for real-time alerts.</p>
                <Button variant="ghost" size="sm" onClick={() => Notification.requestPermission()}>
                  <Bell size={16} /> Enable Push Notifications
                </Button>
              </div>
            </div>
          )}

          {tab === 'calendar' && (
            <div className="space-y-6">
              <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-5">
                <h2 className="text-xl font-bold text-text">Google Calendar</h2>
                <p className="text-[15px] text-text-secondary">Connect your Google Calendar to sync events and see them in the Ananke calendar view.</p>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-alt border border-border">
                  <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24"><path d="M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17A4.78 4.78 0 0 0 12 9.54c0 .37.04.73.12 1.08A13.58 13.58 0 0 1 2.23 4.62a4.78 4.78 0 0 0 1.48 6.38c-.77-.02-1.5-.24-2.14-.59v.06a4.78 4.78 0 0 0 3.83 4.69 4.8 4.8 0 0 1-2.16.08 4.78 4.78 0 0 0 4.47 3.32A9.58 9.58 0 0 1 1 18.14 13.54 13.54 0 0 0 8.32 20c8.78 0 13.58-7.28 13.58-13.58 0-.21 0-.41-.01-.61.93-.67 1.74-1.51 2.38-2.46" fill="#4285F4"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-text">Google Calendar</p>
                    <p className="text-[14px] text-text-muted">{googleConnected ? 'Connected — events synced' : 'Not connected'}</p>
                  </div>
                  {googleConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-full bg-success/10 text-success text-[13px] font-medium">✓ Connected</span>
                      <button onClick={() => { localStorage.removeItem('google_calendar_token'); setGoogleConnected(false) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[14px] text-text-muted hover:text-danger hover:border-danger/30 cursor-pointer transition-colors">
                        <Unlink size={14} /> Disconnect
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => { /* trigger Google OAuth from calendar page */ }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[15px] font-medium cursor-pointer hover:bg-primary-hover transition-colors">
                      <Link2 size={16} /> Connect
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold text-text">Calendar Preferences</h2>
                <Toggle on={true} onChange={() => {}} label="Show weekends" desc="Display Saturday and Sunday in calendar view" />
                <div className="border-t border-border" />
                <Toggle on={true} onChange={() => {}} label="Week starts on Monday" desc="Set Monday as the first day of the week" />
                <div className="border-t border-border" />
                <Toggle on={notifReminders} onChange={setNotifReminders} label="Event reminders" desc="Get notified 15 minutes before events" />
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-6">
              <h2 className="text-xl font-bold text-text">Appearance</h2>
              <div>
                <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-3">Theme</p>
                <div className="flex gap-3">
                  <button onClick={() => { if (dark) toggleTheme() }}
                    className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${!dark ? 'border-primary bg-primary/5' : 'border-border hover:border-border-hover'}`}>
                    <div className="w-16 h-12 rounded-lg bg-[#fbfaf8] border border-[#e5e3de] flex items-center justify-center">
                      <Sun size={20} className="text-[#666]" />
                    </div>
                    <span className="text-[15px] font-medium text-text">Light</span>
                    {!dark && <span className="text-[13px] text-primary font-medium">Active</span>}
                  </button>
                  <button onClick={() => { if (!dark) toggleTheme() }}
                    className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer transition-all ${dark ? 'border-primary bg-primary/5' : 'border-border hover:border-border-hover'}`}>
                    <div className="w-16 h-12 rounded-lg bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                      <Moon size={20} className="text-[#aaa]" />
                    </div>
                    <span className="text-[15px] font-medium text-text">Dark</span>
                    {dark && <span className="text-[13px] text-primary font-medium">Active</span>}
                  </button>
                </div>
              </div>
              <div className="border-t border-border pt-5">
                <p className="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-3">Sidebar</p>
                <p className="text-[15px] text-text-secondary">The sidebar can be collapsed by clicking the "Collapse" button at the bottom of the sidebar, or using the keyboard shortcut.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
