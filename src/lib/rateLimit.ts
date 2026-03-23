// Client-side rate limiter for auth attempts and API calls
const attempts = new Map<string, { count: number; firstAt: number; lockedUntil: number }>()

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number, lockoutMs: number = 0): { allowed: boolean; remaining: number; lockedUntil: number } {
  const now = Date.now()
  const entry = attempts.get(key)

  // Check lockout
  if (entry && entry.lockedUntil > now) {
    return { allowed: false, remaining: 0, lockedUntil: entry.lockedUntil }
  }

  // Reset window if expired
  if (!entry || now - entry.firstAt > windowMs) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 })
    return { allowed: true, remaining: maxAttempts - 1, lockedUntil: 0 }
  }

  entry.count++

  if (entry.count > maxAttempts) {
    if (lockoutMs > 0) {
      entry.lockedUntil = now + lockoutMs
    }
    return { allowed: false, remaining: 0, lockedUntil: entry.lockedUntil }
  }

  return { allowed: true, remaining: maxAttempts - entry.count, lockedUntil: 0 }
}

export function resetRateLimit(key: string) {
  attempts.delete(key)
}

// Honeypot: detect bots that fill hidden fields
export function isBot(honeypotValue: string, formSubmitTime: number): boolean {
  // If honeypot field was filled, it's a bot
  if (honeypotValue) return true
  // If form was submitted in under 1.5 seconds, likely a bot
  if (Date.now() - formSubmitTime < 1500) return true
  return false
}
