import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User, AuthError } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); setLoading(false) })

    // Setup Deep Link Listener for Mobile
    const setupDeepLink = async () => {
      const isCapacitor = (window as any).Capacitor?.isNative
      if (isCapacitor) {
        const { App } = await import('@capacitor/app')
        const { Browser } = await import('@capacitor/browser')

        const handleUrl = async (urlStr: string) => {
          if (urlStr.includes('auth/callback')) {
            const normalizedUrl = urlStr.replace('ananke://', 'https://ananke.vercel.app/')
            const url = new URL(normalizedUrl)
            if (url.hash) {
              const params = new URLSearchParams(url.hash.substring(1))
              const access_token = params.get('access_token')
              const refresh_token = params.get('refresh_token')
              if (access_token && refresh_token) {
                await supabase.auth.setSession({ access_token, refresh_token })
                // On some platforms the browser stays open, try to close it
                await Browser.close().catch(() => {})
              }
            }
          }
        }

        // Handle URL when app is already open
        App.addListener('appUrlOpen', (event) => handleUrl(event.url))

        // Handle URL when app is launched from a deep link
        const launchUrl = await App.getLaunchUrl()
        if (launchUrl?.url) handleUrl(launchUrl.url)
      }
    }
    setupDeepLink()

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error: error as AuthError | null }
  }
  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    return { data, error: error as AuthError | null }
  }
  const signInWithGoogle = async () => {
    const isElectron = navigator.userAgent.toLowerCase().includes('electron')
    const isCapacitor = (window as any).Capacitor?.isNative

    if (isElectron || isCapacitor) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'ananke://auth/callback',
          skipBrowserRedirect: true,
        }
      })
      if (data?.url) {
        if (isCapacitor) {
          const { Browser } = await import('@capacitor/browser')
          await Browser.open({ url: data.url })
        } else {
          window.open(data.url, '_blank')
        }
      }
      return { data, error }
    } else {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      return { data, error: error as AuthError | null }
    }
  }
  const signOut = async () => { await supabase.auth.signOut(); setUser(null) }

  return { user, loading, signIn, signUp, signInWithGoogle, signOut }
}
