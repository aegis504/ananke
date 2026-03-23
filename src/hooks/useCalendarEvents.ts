import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sanitizeTitle, sanitizeColor, isValidISODate } from '../lib/sanitize'

export interface CalendarEvent { id: string; user_id: string; title: string; description: string | null; start_time: string; end_time: string; all_day: boolean; color: string; location: string | null; created_at: string; updated_at: string }

export function useCalendarEvents(userId: string | undefined) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const fetchEvents = useCallback(async () => { if (!userId) return; const { data } = await supabase.from('calendar_events').select('*').eq('user_id', userId).order('start_time'); if (data) setEvents(data as CalendarEvent[]); setLoading(false) }, [userId])
  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { if (!userId) return; const ch = supabase.channel('events-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_events', filter: `user_id=eq.${userId}` }, (p) => { if (p.eventType === 'INSERT') setEvents(prev => prev.some(e => e.id === p.new.id) ? prev : [...prev, p.new as CalendarEvent]); else if (p.eventType === 'UPDATE') setEvents(prev => prev.map(e => e.id === (p.new as CalendarEvent).id ? p.new as CalendarEvent : e)); else if (p.eventType === 'DELETE') setEvents(prev => prev.filter(e => e.id !== (p.old as CalendarEvent).id)) }).subscribe(); return () => { supabase.removeChannel(ch) } }, [userId])

  const addEvent = async (title: string, startTime: string, endTime: string, color?: string) => { if (!userId) return; const safeTitle = sanitizeTitle(title); if (!safeTitle || !isValidISODate(startTime) || !isValidISODate(endTime)) return; const { data, error } = await supabase.from('calendar_events').insert({ user_id: userId, title: safeTitle, start_time: startTime, end_time: endTime, color: sanitizeColor(color || '#4f46e5') } as never).select().single(); if (data && !error) setEvents(prev => prev.some(e => e.id === data.id) ? prev : [...prev, data as CalendarEvent]); return { data: data as CalendarEvent | null, error } }
  const deleteEvent = async (id: string) => { if (!userId) return { error: new Error('No user') }; const { error } = await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', userId); if (!error) setEvents(prev => prev.filter(e => e.id !== id)); return { error } }

  return { events, loading, addEvent, deleteEvent }
}
