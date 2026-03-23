import { useState, useMemo } from 'react'
import type { Task } from '../../hooks/useTasks'
import type { CalendarEvent } from '../../hooks/useCalendarEvents'
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar'
import { Plus, ChevronLeft, ChevronRight, Trash2, X, RefreshCw, ExternalLink, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'

interface Props { tasks: Task[]; events: CalendarEvent[]; eventsLoading: boolean; onAddEvent: (title: string, start: string, end: string, color?: string) => void; onDeleteEvent: (id: string) => void }
const EVENT_COLORS = ['#00a82d', '#4285f4', '#f5a623', '#d32f2f', '#8b5cf6', '#ec4899']

export function CalendarPage({ tasks, events, eventsLoading, onAddEvent, onDeleteEvent }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newStart, setNewStart] = useState('09:00')
  const [newEnd, setNewEnd] = useState('10:00')
  const [newColor, setNewColor] = useState('#00a82d')
  const gcal = useGoogleCalendar()

  const month = selectedDate.getMonth(), year = selectedDate.getFullYear(), today = new Date()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Merge local events + tasks + Google Calendar events
  const dayItems = useMemo(() => {
    const ds = selectedDate.toDateString()
    const ti = tasks.filter(t => new Date(t.deadline).toDateString() === ds).map(t => ({
      id: t.id, title: t.title, time: new Date(t.deadline), color: t.mode === 'digital' ? '#4285f4' : '#d32f2f',
      type: 'task' as const, completed: t.completed, source: 'local' as const
    }))
    const ei = events.filter(e => new Date(e.start_time).toDateString() === ds).map(e => ({
      id: e.id, title: e.title, time: new Date(e.start_time), color: e.color,
      type: 'event' as const, completed: false, source: 'local' as const
    }))
    const gi = gcal.events.filter(e => {
      const d = new Date(e.start)
      return d.toDateString() === ds
    }).map(e => ({
      id: e.id, title: e.title, time: new Date(e.start), color: '#4285f4',
      type: 'google' as const, completed: false, source: 'google' as const
    }))
    return [...ti, ...ei, ...gi].sort((a, b) => a.time.getTime() - b.time.getTime())
  }, [tasks, events, gcal.events, selectedDate])

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  const hasEventsOnDay = (day: number) => {
    const d = new Date(year, month, day).toDateString()
    return tasks.some(t => new Date(t.deadline).toDateString() === d) ||
           events.some(e => new Date(e.start_time).toDateString() === d) ||
           gcal.events.some(e => new Date(e.start).toDateString() === d)
  }

  const [newDate, setNewDate] = useState(selectedDate.toISOString().split('T')[0])

  const handleAddEvent = () => {
    if (!newTitle.trim()) return
    const d = newDate || selectedDate.toISOString().split('T')[0]
    onAddEvent(newTitle.trim(), `${d}T${newStart}:00`, `${d}T${newEnd}:00`, newColor)
    setNewTitle(''); setShowAdd(false); setSelectedDate(new Date(d))
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[32px] font-semibold tracking-[-0.02em] text-text">Calendar</h1>
        <Button variant="premium" size="sm" onClick={() => { setNewDate(selectedDate.toISOString().split('T')[0]); setShowAdd(true) }}><Plus size={16} /> New Event</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full sm:w-[240px] shrink-0 space-y-5">
          {/* Mini calendar */}
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-semibold text-text">{monthName}</h3>
              <div className="flex gap-1">
                <button onClick={() => setSelectedDate(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-bg-alt cursor-pointer"><ChevronLeft size={16} /></button>
                <button onClick={() => setSelectedDate(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-bg-alt cursor-pointer"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0 text-[13px] text-center">
              {weekDays.map(d => <div key={d} className="py-1 text-text-muted font-medium">{d}</div>)}
              {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1, d = new Date(year, month, day)
                const isToday = d.toDateString() === today.toDateString()
                const isSel = d.toDateString() === selectedDate.toDateString()
                const has = hasEventsOnDay(day)
                return (
                  <button key={day} onClick={() => setSelectedDate(d)}
                    className={`py-1.5 rounded-full cursor-pointer transition-all relative ${isSel ? 'bg-primary text-white font-semibold' : isToday ? 'bg-primary-light text-primary font-semibold' : 'text-text-secondary hover:bg-bg-alt'}`}>
                    {day}
                    {has && !isSel && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* My Calendars */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-[.08em] text-text-muted mb-2.5">My Calendars</h3>
            <label className="flex items-center gap-2.5 text-[15px] text-text cursor-pointer mb-2">
              <span className="w-3 h-3 rounded-sm bg-primary" /> Ananke Events
            </label>
            <label className="flex items-center gap-2.5 text-[15px] text-text cursor-pointer mb-2">
              <span className="w-3 h-3 rounded-sm bg-[#4285f4]" /> Tasks
            </label>
            {gcal.connected && (
              <label className="flex items-center gap-2.5 text-[15px] text-text cursor-pointer">
                <span className="w-3 h-3 rounded-sm bg-[#4285f4]" />
                <svg width="12" height="12" viewBox="0 0 24 24" className="shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google Calendar
              </label>
            )}
          </div>

          {/* Google Calendar Connection */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-[.08em] text-text-muted mb-2.5">Connected Calendars</h3>
            {gcal.connected ? (
              <div className="border border-border rounded-xl p-3 bg-bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-text">Google Calendar</p>
                    {gcal.email && <p className="text-[13px] text-text-muted truncate">{gcal.email}</p>}
                  </div>
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={gcal.refresh} className="flex-1 flex items-center justify-center gap-1.5 text-[13px] text-text-secondary hover:text-text rounded-lg border border-border py-1.5 cursor-pointer hover:bg-bg-alt transition-colors">
                    <RefreshCw size={13} className={gcal.loading ? 'animate-spin' : ''} /> Sync
                  </button>
                  <button onClick={gcal.disconnect} className="flex items-center justify-center gap-1.5 text-[13px] text-danger hover:bg-danger-light rounded-lg border border-border px-2.5 py-1.5 cursor-pointer transition-colors">
                    <LogOut size={13} />
                  </button>
                </div>
                {gcal.events.length > 0 && (
                  <p className="text-[13px] text-text-muted mt-2">{gcal.events.length} events synced</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={gcal.connect}
                  className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-[15px] text-text hover:bg-bg-alt cursor-pointer transition-colors bg-bg-card">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Connect Google Calendar
                </button>
                <button className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-[15px] text-text-muted hover:bg-bg-alt cursor-pointer transition-colors bg-bg-card" onClick={() => alert('iOS sync package connection will be available soon.')}>
                  <span className="text-base font-bold">🍎</span> Connect to iOS
                </button>
                <button className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-[15px] text-text-muted hover:bg-bg-alt cursor-pointer transition-colors bg-bg-card" disabled>
                  <span className="text-base">🔷</span> Microsoft 365
                  <span className="ml-auto text-[13px] bg-bg-alt px-1.5 py-0.5 rounded text-text-muted">Soon</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Day view */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 text-[15px]">
              <button onClick={() => setSelectedDate(today)} className="text-primary font-medium cursor-pointer hover:underline">Today</button>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))} className="cursor-pointer text-text-muted hover:text-text p-0.5"><ChevronLeft size={16} /></button>
              <span className="font-medium text-text">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <button onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))} className="cursor-pointer text-text-muted hover:text-text p-0.5"><ChevronRight size={16} /></button>
            </div>
            {gcal.connected && gcal.loading && (
              <span className="text-[13px] text-text-muted flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Syncing...</span>
            )}
          </div>

          {eventsLoading ? (
            <div className="py-16"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <div className="relative border border-border rounded-xl overflow-hidden bg-bg-card">
              {hours.map(h => {
                const label = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`
                const hi = dayItems.filter(item => item.time.getHours() === h)
                return (
                  <div key={h} className="flex border-b border-border/60 last:border-0 min-h-[56px] hover:bg-bg-alt/30 transition-colors">
                    <span className="text-[13px] text-text-muted w-14 pt-2.5 pl-3 shrink-0">{label}</span>
                    <div className="flex-1 py-1.5 px-1.5 space-y-1">
                      {hi.map(item => (
                        <div key={item.id}
                          className="rounded-lg px-3 py-2 text-[15px] flex items-center justify-between group"
                          style={{ backgroundColor: item.color + '15', borderLeft: `3px solid ${item.color}` }}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`font-medium truncate ${item.completed ? 'line-through text-text-muted' : 'text-text'}`}>{item.title}</span>
                            {item.source === 'google' && (
                              <span className="flex items-center gap-0.5 shrink-0">
                                <svg width="10" height="10" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                              </span>
                            )}
                            <span className={`text-[13px] uppercase font-medium shrink-0 px-1.5 py-0.5 rounded ${
                              item.type === 'google' ? 'bg-[#4285f4]/10 text-[#4285f4]' :
                              item.type === 'task' ? 'bg-primary/10 text-primary' :
                              'bg-bg-alt text-text-muted'
                            }`}>{item.type === 'google' ? 'Google' : item.type}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.source === 'google' && (
                              <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-[#4285f4] cursor-pointer"><ExternalLink size={14} /></a>
                            )}
                            {item.type === 'event' && item.source === 'local' && (
                              <button onClick={() => onDeleteEvent(item.id)} className="text-text-muted hover:text-danger cursor-pointer"><Trash2 size={14} /></button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {dayItems.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-[15px] text-text-muted">No events on this day</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="bg-bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-semibold text-text">New Event</h3>
              <button onClick={() => setShowAdd(false)} className="text-text-muted hover:text-text cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Event title"
                className="w-full rounded-lg bg-bg-input border border-border px-3.5 py-2.5 text-[15px] text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-all" autoFocus />
              <div>
                <label className="text-[13px] font-medium text-text-muted mb-1 block">Date</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  className="w-full rounded-lg bg-bg-input border border-border px-3 py-2 text-[15px] text-text focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[13px] font-medium text-text-muted mb-1 block">Start</label>
                  <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)}
                    className="w-full rounded-lg bg-bg-input border border-border px-3 py-2 text-[15px] text-text focus:outline-none focus:border-primary" />
                </div>
                <div className="flex-1">
                  <label className="text-[13px] font-medium text-text-muted mb-1 block">End</label>
                  <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)}
                    className="w-full rounded-lg bg-bg-input border border-border px-3 py-2 text-[15px] text-text focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-medium text-text-muted mb-1.5 block">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button variant="premium" size="sm" className="flex-1" onClick={handleAddEvent} disabled={!newTitle.trim()}>Create</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
