import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sanitizeTitle, sanitizeContent } from '../lib/sanitize'

export interface Note { id: string; user_id: string; notebook_id: string | null; title: string; content: string | null; tags: string[]; pinned: boolean; created_at: string; updated_at: string }

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const fetchNotes = useCallback(async () => { if (!userId) return; const { data } = await supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); if (data) setNotes(data as Note[]); setLoading(false) }, [userId])
  useEffect(() => { fetchNotes() }, [fetchNotes])
  useEffect(() => { if (!userId) return; const ch = supabase.channel('notes-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` }, (p) => { if (p.eventType === 'INSERT') setNotes(prev => prev.some(n => n.id === p.new.id) ? prev : [p.new as Note, ...prev]); else if (p.eventType === 'UPDATE') setNotes(prev => prev.map(n => n.id === (p.new as Note).id ? p.new as Note : n)); else if (p.eventType === 'DELETE') setNotes(prev => prev.filter(n => n.id !== (p.old as Note).id)) }).subscribe(); return () => { supabase.removeChannel(ch) } }, [userId])

  const addNote = async (title: string, notebookId?: string, content?: string) => { if (!userId) return; const safeTitle = sanitizeTitle(title) || 'Untitled'; const { data, error } = await supabase.from('notes').insert({ user_id: userId, title: safeTitle, notebook_id: notebookId || null, content: content ? sanitizeContent(content) : null } as never).select().single(); if (data && !error) setNotes(prev => prev.some(n => n.id === data.id) ? prev : [data as Note, ...prev]); return { data: data as Note | null, error } }
  const updateNote = async (id: string, updates: Partial<Note>) => { if (!userId) return { error: new Error('No user') }; const { error } = await supabase.from('notes').update(updates as never).eq('id', id).eq('user_id', userId); if (!error) setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n)); return { error } }
  const deleteNote = async (id: string) => { if (!userId) return { error: new Error('No user') }; const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId); if (!error) setNotes(prev => prev.filter(n => n.id !== id)); return { error } }

  return { notes, loading, addNote, updateNote, deleteNote }
}
