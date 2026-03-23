import { rateLimit, getClientIP, corsHeaders, validateOrigin } from './_rateLimit'

export const config = { runtime: 'edge' }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

const sbHeaders = (token: string) => ({
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
})

export default async function handler(req: Request) {
  const cors = corsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  if (!validateOrigin(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: cors })
  }

  const ip = getClientIP(req)
  // Rate limit: 60 sync requests per minute, 30s block
  const limit = rateLimit(ip, 'sync', { maxTokens: 60, refillRate: 10, refillMs: 10000, blockDurationMs: 30000 })
  if (!limit.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429, headers: { ...cors, 'Retry-After': String(limit.retryAfter) } })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors })

  const token = authHeader.replace('Bearer ', '')
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  try {
    // GET /api/sync?action=pull&since=ISO_DATE&device_id=XXX
    // Returns all unsynced changes since the given timestamp for this device
    if (req.method === 'GET' && action === 'pull') {
      const sinceRaw = url.searchParams.get('since') || '1970-01-01T00:00:00Z'
      const since = isNaN(new Date(sinceRaw).getTime()) ? '1970-01-01T00:00:00Z' : sinceRaw
      const deviceId = (url.searchParams.get('device_id') || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100)

      // Get changes not yet synced to this device
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/sync_queue?created_at=gt.${since}&order=created_at.asc&limit=100` +
        (deviceId ? `&synced_devices=not.cs.{${deviceId}}` : ''),
        { headers: sbHeaders(token) }
      )
      const changes = await res.json()
      return new Response(JSON.stringify({ changes, server_time: new Date().toISOString() }), { headers: cors })
    }

    // POST /api/sync?action=push — Push changes from mobile
    if (req.method === 'POST' && action === 'push') {
      const body = await req.json()
      const { changes, device_id } = body as { changes: SyncChange[]; device_id: string }

      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!Array.isArray(changes) || changes.length > 50) {
        return new Response(JSON.stringify({ error: 'Invalid changes array (max 50)' }), { status: 400, headers: cors })
      }

      const results = []
      for (const change of changes) {
        // Validate entity_id is a UUID
        if (change.entity_id && !UUID_RE.test(change.entity_id)) {
          results.push({ entity_id: change.entity_id, status: 'error', reason: 'invalid id' })
          continue
        }
        const table = change.entity_type === 'task' ? 'tasks' : change.entity_type === 'note' ? 'notes' : change.entity_type === 'event' ? 'calendar_events' : null
        if (!table) { results.push({ entity_id: change.entity_id, status: 'error', reason: 'invalid entity_type' }); continue }

        let res
        if (change.action === 'create') {
          res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST', headers: { ...sbHeaders(token), 'Prefer': 'return=representation' },
            body: JSON.stringify(change.payload)
          })
        } else if (change.action === 'update') {
          res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${change.entity_id}`, {
            method: 'PATCH', headers: { ...sbHeaders(token), 'Prefer': 'return=representation' },
            body: JSON.stringify(change.payload)
          })
        } else if (change.action === 'delete') {
          res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${change.entity_id}`, {
            method: 'DELETE', headers: sbHeaders(token)
          })
        }
        results.push({ entity_id: change.entity_id, status: res?.ok ? 'ok' : 'error' })
      }

      // Mark synced
      if (device_id && changes.length) {
        const ids = changes.map(c => c.entity_id)
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/mark_synced`, {
          method: 'POST', headers: sbHeaders(token),
          body: JSON.stringify({ p_device_id: device_id, p_entity_ids: ids })
        })
      }

      return new Response(JSON.stringify({ results, server_time: new Date().toISOString() }), { headers: cors })
    }

    // POST /api/sync?action=register — Register a device
    if (req.method === 'POST' && action === 'register') {
      const body = await req.json()
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mobile_sync`, {
        method: 'POST',
        headers: { ...sbHeaders(token), 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      return new Response(JSON.stringify(data), { headers: cors })
    }

    // GET /api/sync?action=status — Get sync status for all devices
    if (req.method === 'GET' && action === 'status') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/mobile_sync?order=last_sync_at.desc`, { headers: sbHeaders(token) })
      const devices = await res.json()
      return new Response(JSON.stringify({ devices }), { headers: cors })
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use: pull, push, register, status' }), { status: 400, headers: cors })
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: cors })
  }
}

interface SyncChange {
  entity_type: 'task' | 'note' | 'event' | 'notebook'
  entity_id: string
  action: 'create' | 'update' | 'delete'
  payload?: Record<string, unknown>
}
