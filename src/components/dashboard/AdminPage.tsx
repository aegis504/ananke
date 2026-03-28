import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'samsari.owner@gmail.com'

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
}

interface AdminStats {
  totalUsers: number
  newUsersThisWeek: number
  generatedAt: string
  users?: AdminUser[]
}

export function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== ADMIN_EMAIL) {
        setError('Access denied.')
        setLoading(false)
        return
      }
      const res = await fetch('https://ananke.vercel.app/api/admin', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (!res.ok) {
        setError('Failed to load admin data.')
        setLoading(false)
        return
      }
      setStats(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-text-secondary">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg px-6 py-16">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[13px] font-medium mb-4">
            🛡️ Admin Dashboard
          </div>
          <h1 className="text-[32px] font-bold text-text tracking-tight">Ananke Admin</h1>
          <p className="text-text-muted text-[14px] mt-1">
            Last updated: {stats ? new Date(stats.generatedAt).toLocaleString() : '—'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <p className="text-[13px] text-text-muted uppercase tracking-widest font-medium mb-2">Total Users</p>
            <p className="text-[48px] font-bold text-text leading-none">{stats?.totalUsers ?? '—'}</p>
          </div>
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <p className="text-[13px] text-text-muted uppercase tracking-widest font-medium mb-2">New This Week</p>
            <p className="text-[48px] font-bold text-primary leading-none">+{stats?.newUsersThisWeek ?? '—'}</p>
          </div>
        </div>

        {stats?.users && stats.users.length > 0 && (
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-bg-alt/50">
              <h2 className="text-[16px] font-semibold text-text">User List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium">Last Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.users.map(user => (
                    <tr key={user.id} className="hover:bg-bg-alt/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-text">{user.email}</td>
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-[12px] text-text-muted text-center mt-8">
          Accessible only to {ADMIN_EMAIL}
        </p>
      </div>
    </div>
  )
}
