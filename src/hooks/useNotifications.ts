import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sanitizeText } from '../lib/sanitize'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  read: boolean
  created_at: string
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
    if (data) {
      setNotifications(data as Notification[])
      setUnreadCount((data as Notification[]).filter(n => !n.read).length)
    }
  }, [userId])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    if (!userId) return
    const ch = supabase.channel('notifs-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => {
      fetchNotifications()
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [userId, fetchNotifications])

  const markAsRead = async (id: string) => {
    if (!userId) return; await supabase.from('notifications').update({ read: true } as never).eq('id', id).eq('user_id', userId)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    if (!userId) return
    await supabase.from('notifications').update({ read: true } as never).eq('user_id', userId).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const addNotification = async (type: string, title: string, message?: string) => {
    if (!userId) return
    await supabase.from('notifications').insert({ user_id: userId, type: sanitizeText(type, 50), title: sanitizeText(title, 200), message: message ? sanitizeText(message, 500) : null } as never)
  }

  const deleteNotification = async (id: string) => {
    const n = notifications.find(x => x.id === id)
    if (!userId) return; await supabase.from('notifications').delete().eq('id', id).eq('user_id', userId)
    setNotifications(prev => prev.filter(x => x.id !== id))
    if (n && !n.read) setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return { notifications, unreadCount, markAsRead, markAllRead, addNotification, deleteNotification }
}
