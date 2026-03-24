import { useEffect, useRef } from 'react'
import type { Task } from './useTasks'

const THIRTY_MIN_MS = 30 * 60 * 1000
const NOTIFIED_KEY = 'ananke_notified_30m'

function getNotifiedSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function markNotified(taskId: string) {
  const s = getNotifiedSet()
  s.add(taskId)
  try { sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify([...s])) } catch {}
}

async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function showLocalNotification(task: Task) {
  if (Notification.permission !== 'granted') return
  const n = new Notification(`⏰ 30 min left — ${task.title}`, {
    body: `Your task "${task.title}" is due in 30 minutes!`,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: `task-30m-${task.id}`,
    requireInteraction: true,
    // @ts-ignore – vibrate is supported on Android Chrome
    vibrate: [200, 100, 200],
  })
  n.onclick = () => { window.focus(); n.close() }
}

export function useTaskNotifications(tasks: Task[]) {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    requestPermission()
  }, [])

  useEffect(() => {
    const now = Date.now()
    const notified = getNotifiedSet()
    const existing = timersRef.current

    // Clear timers for tasks that are gone / completed
    existing.forEach((timer, id) => {
      if (!tasks.find(t => t.id === id && !t.completed)) {
        clearTimeout(timer)
        existing.delete(id)
      }
    })

    for (const task of tasks) {
      if (task.completed) continue
      if (notified.has(task.id)) continue
      if (existing.has(task.id)) continue // already scheduled

      const deadline = new Date(task.deadline).getTime()
      const fireAt = deadline - THIRTY_MIN_MS
      const delay = fireAt - now

      if (delay <= 0) {
        // already within 30 min or past — skip (don't spam)
        continue
      }

      const timer = setTimeout(() => {
        showLocalNotification(task)
        markNotified(task.id)
        existing.delete(task.id)
      }, delay)

      existing.set(task.id, timer)
    }

    return () => {
      // Cleanup on unmount
      existing.forEach(t => clearTimeout(t))
      existing.clear()
    }
  }, [tasks])
}
