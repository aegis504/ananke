import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface AIResult {
  result: string
  model?: string
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

const API_URL = 'https://ananke.vercel.app/api/ai'

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAction = useCallback(async (action: string, content: string): Promise<string | null> => {
    if (!content.trim()) { setError('No content to process'); return null }
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ action, content }),
      })
      if (!res.ok) {
        const text = await res.text()
        let errMsg = `Failed (${res.status})`
        try { const parsed = JSON.parse(text); errMsg = parsed.error || parsed.message || errMsg } catch {}
        throw new Error(errMsg)
      }
      const data: AIResult = await res.json()
      setLoading(false)
      return data.result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI request failed'
      setError(msg)
      setLoading(false)
      return null
    }
  }, [])

  return { loading, error, runAction }
}
