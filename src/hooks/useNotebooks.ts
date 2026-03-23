import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sanitizeTitle, sanitizeColor } from '../lib/sanitize'

export interface Notebook { id: string; user_id: string; name: string; color: string | null; created_at: string; updated_at: string }

export function useNotebooks(userId: string | undefined) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const fetchNotebooks = useCallback(async () => { if (!userId) return; const { data } = await supabase.from('notebooks').select('*').eq('user_id', userId).order('name'); if (data) setNotebooks(data as Notebook[]); setLoading(false) }, [userId])
  useEffect(() => { fetchNotebooks() }, [fetchNotebooks])

  const addNotebook = async (name: string, color?: string) => { if (!userId) return; const safeName = sanitizeTitle(name); if (!safeName) return; const { data, error } = await supabase.from('notebooks').insert({ user_id: userId, name: safeName, color: color ? sanitizeColor(color) : null } as never).select().single(); if (data && !error) setNotebooks(prev => [...prev, data as Notebook]); return { data, error } }
  const updateNotebook = async (id: string, updates: Partial<Notebook>) => { if (!userId) return { error: new Error('No user') }; const { error } = await supabase.from('notebooks').update(updates as never).eq('id', id).eq('user_id', userId); if (!error) setNotebooks(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n)); return { error } }
  const deleteNotebook = async (id: string) => { if (!userId) return { error: new Error('No user') }; const { error } = await supabase.from('notebooks').delete().eq('id', id).eq('user_id', userId); if (!error) setNotebooks(prev => prev.filter(n => n.id !== id)); return { error } }

  return { notebooks, loading, addNotebook, updateNotebook, deleteNotebook }
}
