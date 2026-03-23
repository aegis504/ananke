import { useState, useEffect, useCallback } from 'react'

const CLIENT_ID = '1096452226532-sgth6tvucafmfq0sjsvf0pv7r8mussg6.apps.googleusercontent.com'
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'
const STORAGE_KEY = 'ananke-gcal-token'

export interface GoogleEvent {
  id: string
  title: string
  start: string
  end: string
  location?: string
  description?: string
  color: string
  source: 'google'
}

interface TokenData {
  access_token: string
  expires_at: number
}

export function useGoogleCalendar() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<GoogleEvent[]>([])
  const [email, setEmail] = useState<string | null>(null)

  // Check stored token on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: TokenData = JSON.parse(stored)
        if (data.expires_at > Date.now()) {
          setConnected(true)
          fetchEvents(data.access_token)
          fetchUserInfo(data.access_token)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch { localStorage.removeItem(STORAGE_KEY) }
    }
  }, [])

  // Listen for OAuth callback
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'google-oauth-callback' && e.data.access_token) {
        const tokenData: TokenData = {
          access_token: e.data.access_token,
          expires_at: Date.now() + (e.data.expires_in || 3600) * 1000,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData))
        setConnected(true)
        fetchEvents(tokenData.access_token)
        fetchUserInfo(tokenData.access_token)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Also check URL hash for direct redirect
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const expiresIn = params.get('expires_in')
      if (accessToken) {
        const tokenData: TokenData = {
          access_token: accessToken,
          expires_at: Date.now() + (parseInt(expiresIn || '3600')) * 1000,
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData))
        setConnected(true)
        fetchEvents(tokenData.access_token)
        fetchUserInfo(tokenData.access_token)
        // Clean up URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [])

  const connect = useCallback(() => {
    const redirectUri = window.location.origin
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(SCOPES + ' email profile')}&prompt=consent&include_granted_scopes=true`

    // Open popup
    const width = 500, height = 600
    const left = window.screenX + (window.innerWidth - width) / 2
    const top = window.screenY + (window.innerHeight - height) / 2
    const popup = window.open(authUrl, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`)

    // Poll popup for redirect
    if (popup) {
      const interval = setInterval(() => {
        try {
          if (popup.closed) { clearInterval(interval); return }
          const url = popup.location.href
          if (url.startsWith(window.location.origin) && url.includes('access_token')) {
            const hash = new URL(url).hash.substring(1)
            const params = new URLSearchParams(hash)
            const accessToken = params.get('access_token')
            const expiresIn = params.get('expires_in')
            if (accessToken) {
              const tokenData: TokenData = {
                access_token: accessToken,
                expires_at: Date.now() + (parseInt(expiresIn || '3600')) * 1000,
              }
              localStorage.setItem(STORAGE_KEY, JSON.stringify(tokenData))
              setConnected(true)
              fetchEvents(tokenData.access_token)
              fetchUserInfo(tokenData.access_token)
            }
            popup.close()
            clearInterval(interval)
          }
        } catch {
          // Cross-origin — ignore until redirect back
        }
      }, 500)
    }
  }, [])

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setConnected(false)
    setEvents([])
    setEmail(null)
  }, [])

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEmail(data.email || null)
      }
    } catch { /* ignore */ }
  }

  const fetchEvents = async (token: string) => {
    setLoading(true)
    try {
      const now = new Date()
      const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.ok) {
        const data = await res.json()
        const mapped: GoogleEvent[] = (data.items || []).map((item: Record<string, unknown>) => ({
          id: `gcal-${item.id}`,
          title: (item.summary as string) || 'No title',
          start: ((item.start as Record<string, string>)?.dateTime || (item.start as Record<string, string>)?.date || ''),
          end: ((item.end as Record<string, string>)?.dateTime || (item.end as Record<string, string>)?.date || ''),
          location: (item.location as string) || undefined,
          description: (item.description as string) || undefined,
          color: '#4285f4',
          source: 'google' as const,
        }))
        setEvents(mapped)
      } else if (res.status === 401) {
        disconnect()
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const refresh = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data: TokenData = JSON.parse(stored)
        if (data.expires_at > Date.now()) fetchEvents(data.access_token)
        else disconnect()
      } catch { disconnect() }
    }
  }, [disconnect])

  return { connected, loading, events, email, connect, disconnect, refresh }
}
