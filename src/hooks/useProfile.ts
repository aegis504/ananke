import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile { id: string; full_name: string | null; intent: string | null; use_case: string | null; company: string | null; plan: string | null }

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  useEffect(() => {
    if (!userId) return
    supabase.from('profiles').select('*').eq('id', userId).single().then(({ data }) => { if (data) setProfile(data as Profile) })
  }, [userId])
  return { profile }
}
