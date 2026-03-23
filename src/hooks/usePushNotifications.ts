import { useState, useEffect, useCallback, useRef } from 'react'
type Permission = 'default' | 'granted' | 'denied'

export function usePushNotifications() {
  const [permission, setPermission] = useState<Permission>('default')
  const [supported, setSupported] = useState(false)
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => { const s = 'Notification' in window && 'serviceWorker' in navigator; setSupported(s); if (s) setPermission(Notification.permission as Permission) }, [])
  useEffect(() => { if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}); navigator.serviceWorker.addEventListener('message', (e) => { if (e.data?.type === 'COMPLETE_TASK') window.dispatchEvent(new CustomEvent('ananke-complete-task', { detail: { taskId: e.data.taskId } })) }) } }, [])

  const requestPermission = useCallback(async () => { if (!supported) return 'denied' as Permission; const r = await Notification.requestPermission(); setPermission(r as Permission); return r as Permission }, [supported])

  const sendNotification = useCallback((title: string, options?: { body?: string; tag?: string; urgent?: boolean; taskId?: string }) => {
    if (permission !== 'granted') return
    const n = new Notification(title, { body: options?.body, icon: '/ananke-icon.png', tag: options?.tag || 'ananke-' + Date.now(), requireInteraction: options?.urgent || false })
    n.onclick = () => { window.focus(); n.close() }
    return n
  }, [permission])

  const scheduleEnforcement = useCallback((taskId: string, title: string, deadline: number) => {
    const existing = timers.current.get(taskId); if (existing) clearTimeout(existing)
    const diff = deadline - Date.now()
    if (diff > 5 * 60000) { const t = setTimeout(() => sendNotification('⏰ 5 Minutes Left!', { body: `"${title}" deadline in 5 minutes.`, tag: `w-${taskId}`, taskId }), diff - 5 * 60000); timers.current.set(`${taskId}-w`, t) }
    if (diff > 60000) { const t = setTimeout(() => sendNotification('🚨 1 Minute Left!', { body: `"${title}" — ENFORCEMENT IMMINENT!`, tag: `u-${taskId}`, taskId, urgent: true }), diff - 60000); timers.current.set(`${taskId}-u`, t) }
    if (diff > 0) { const t = setTimeout(() => { sendNotification('🔴 ENFORCEMENT ACTIVE', { body: `"${title}" is OVERDUE!`, tag: `e-${taskId}`, taskId, urgent: true }); const r = setInterval(() => sendNotification('🔴 STILL OVERDUE', { body: `"${title}" — Complete now!`, tag: `er-${taskId}`, taskId, urgent: true }), 120000); timers.current.set(`${taskId}-r`, r as unknown as ReturnType<typeof setTimeout>) }, diff); timers.current.set(taskId, t) }
    else sendNotification('🔴 ENFORCEMENT ACTIVE', { body: `"${title}" is OVERDUE!`, tag: `e-${taskId}`, taskId, urgent: true })
  }, [sendNotification])

  const cancelEnforcement = useCallback((taskId: string) => { [`${taskId}`, `${taskId}-w`, `${taskId}-u`, `${taskId}-r`].forEach(k => { const t = timers.current.get(k); if (t) { clearTimeout(t); clearInterval(t as unknown as number); timers.current.delete(k) } }) }, [])

  return { supported, permission, requestPermission, sendNotification, scheduleEnforcement, cancelEnforcement }
}
