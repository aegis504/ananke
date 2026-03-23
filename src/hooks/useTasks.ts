import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sanitizeTitle, sanitizeTags } from '../lib/sanitize'

export interface Task { id: string; user_id: string; title: string; description: string | null; mode: 'digital' | 'physical'; deadline: string; completed: boolean; completed_at: string | null; enforcing: boolean; workflow_prepared: boolean; priority: string; tags: string[]; created_at: string; updated_at: string }

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => { if (!userId) return; const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (data) setTasks(data as Task[]); setLoading(false) }, [userId])
  useEffect(() => { fetchTasks() }, [fetchTasks])
  useEffect(() => { if (!userId) return; const ch = supabase.channel('tasks-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, (p) => { if (p.eventType === 'INSERT') setTasks(prev => prev.some(t => t.id === p.new.id) ? prev : [p.new as Task, ...prev]); else if (p.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === (p.new as Task).id ? p.new as Task : t)); else if (p.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id !== (p.old as Task).id)) }).subscribe(); return () => { supabase.removeChannel(ch) } }, [userId])

  const addTask = async (title: string, mode: 'digital' | 'physical', minutes: number, tags?: string[]) => { if (!userId) return; const safeTitle = sanitizeTitle(title); if (!safeTitle) return; const safeMode = mode === 'physical' ? 'physical' : 'digital'; const safeMinutes = Math.max(1, Math.min(43200, Math.round(minutes))); const deadline = new Date(Date.now() + safeMinutes * 60000).toISOString(); const insert: Record<string, unknown> = { user_id: userId, title: safeTitle, mode: safeMode, deadline }; if (tags && tags.length > 0) insert.tags = sanitizeTags(tags); const { data, error } = await supabase.from('tasks').insert(insert as never).select().single(); if (data && !error) setTasks(prev => prev.some(t => t.id === data.id) ? prev : [data as Task, ...prev]); return { data, error } }
  const updateTask = async (id: string, updates: Partial<Task>) => { if (!userId) return { error: new Error('No user') }; const { error } = await supabase.from('tasks').update(updates as never).eq('id', id).eq('user_id', userId); if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)); return { error } }
  const completeTask = (id: string) => updateTask(id, { completed: true, completed_at: new Date().toISOString() })
  const toggleMode = (id: string) => { const t = tasks.find(x => x.id === id); if (t) return updateTask(id, { mode: t.mode === 'digital' ? 'physical' : 'digital' }) }
  const prepareWorkflow = (id: string) => updateTask(id, { workflow_prepared: true })
  const deleteTask = async (id: string) => { if (!userId) return { error: new Error('No user') }; const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId); if (!error) setTasks(prev => prev.filter(t => t.id !== id)); return { error } }

  return { tasks, loading, addTask, completeTask, toggleMode, prepareWorkflow, deleteTask, updateTask }
}
