import { corsHeaders, validateOrigin } from './_rateLimit'

export const config = { runtime: 'edge' }

const ADMIN_EMAIL = 'samsari.owner@gmail.com'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export default async function handler(req: Request) {
  const cors = corsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (!validateOrigin(req)) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: cors })

  // Verify JWT from Authorization header
  const authHeader = req.headers.get('Authorization') || ''
  const jwt = authHeader.replace('Bearer ', '')
  if (!jwt) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })

  // Verify token and get user email via Supabase
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${jwt}`, 'apikey': SERVICE_ROLE_KEY }
  })
  if (!userRes.ok) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: cors })

  const user = await userRes.json()
  if (user.email !== ADMIN_EMAIL) {
    return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403, headers: cors })
  }

  // Fetch actual user list from Supabase Auth Admin API
  const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    }
  })

  let allUsers = []
  if (usersRes.ok) {
    const data = await usersRes.json()
    // Depending on Supabase version, it might return { users: [] } or just []
    const rawUsers = data.users || data || []
    allUsers = rawUsers.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at
    })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Count users using service role key
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'count=exact',
      'Range': '0-0'
    }
  })

  const contentRange = countRes.headers.get('content-range') || ''
  const total = parseInt(contentRange.split('/')[1] || '0', 10) || allUsers.length

  // Also get recent signups (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const recentRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?created_at=gte.${weekAgo}&select=count`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'count=exact',
      'Range': '0-0'
    }
  })
  const recentRange = recentRes.headers.get('content-range') || ''
  const recentTotal = parseInt(recentRange.split('/')[1] || '0', 10)

  return new Response(JSON.stringify({
    totalUsers: total,
    newUsersThisWeek: recentTotal,
    users: allUsers,
    generatedAt: new Date().toISOString()
  }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
}
