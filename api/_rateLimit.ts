// Server-side rate limiter for edge functions
// Uses in-memory Map per edge instance + sliding window

interface Entry { tokens: number; lastRefill: number; blocked: boolean; blockedUntil: number }
const store = new Map<string, Entry>()

// Clean up stale entries every 5 minutes
let lastClean = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastClean < 300000) return
  lastClean = now
  for (const [key, entry] of store) {
    if (now - entry.lastRefill > 600000) store.delete(key)
  }
}

export function rateLimit(
  ip: string,
  endpoint: string,
  opts: { maxTokens: number; refillRate: number; refillMs: number; blockDurationMs?: number }
): { allowed: boolean; remaining: number; retryAfter: number } {
  cleanup()
  const key = `${endpoint}:${ip}`
  const now = Date.now()
  let entry = store.get(key)

  if (!entry) {
    entry = { tokens: opts.maxTokens - 1, lastRefill: now, blocked: false, blockedUntil: 0 }
    store.set(key, entry)
    return { allowed: true, remaining: entry.tokens, retryAfter: 0 }
  }

  // Check block
  if (entry.blocked && entry.blockedUntil > now) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) }
  }
  entry.blocked = false

  // Refill tokens based on elapsed time
  const elapsed = now - entry.lastRefill
  const refills = Math.floor(elapsed / opts.refillMs)
  if (refills > 0) {
    entry.tokens = Math.min(opts.maxTokens, entry.tokens + refills * opts.refillRate)
    entry.lastRefill = now
  }

  if (entry.tokens <= 0) {
    if (opts.blockDurationMs) {
      entry.blocked = true
      entry.blockedUntil = now + opts.blockDurationMs
    }
    return { allowed: false, remaining: 0, retryAfter: opts.blockDurationMs ? Math.ceil(opts.blockDurationMs / 1000) : Math.ceil(opts.refillMs / 1000) }
  }

  entry.tokens--
  return { allowed: true, remaining: entry.tokens, retryAfter: 0 }
}

export function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || req.headers.get('cf-connecting-ip')
    || 'unknown'
}

// Validate that origin is allowed
const ALLOWED_ORIGINS = ['https://ananke.vercel.app', 'http://localhost:5173']
export function validateOrigin(req: Request): boolean {
  const origin = req.headers.get('Origin')
  const referer = req.headers.get('Referer')
  // Allow requests without Origin (direct API calls with auth)
  if (!origin && !referer) return true
  if (origin && ALLOWED_ORIGINS.includes(origin)) return true
  if (referer && ALLOWED_ORIGINS.some(o => referer.startsWith(o))) return true
  return false
}

export function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}
