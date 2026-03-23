import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { useTasks } from '../../hooks/useTasks'
import { useProfile } from '../../hooks/useProfile'
import { useNotifications } from '../../hooks/useNotifications'
import { useNotes } from '../../hooks/useNotes'
import { useNotebooks } from '../../hooks/useNotebooks'
import { useCalendarEvents } from '../../hooks/useCalendarEvents'
import { useTheme } from '../../hooks/useTheme'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { Bell, LogOut, User as UserIcon, Search, Sun, Moon, Home, Zap, FileText, CheckSquare, FolderOpen, Calendar, LayoutTemplate, BookOpen, Tag, Users, Plus, Settings, ChevronLeft, X, Trash2, CheckCheck, Sparkles, MoreHorizontal } from 'lucide-react'
import { HomePage } from './HomePage'
import { NotesPage } from './NotesPage'
import { TasksPage } from './TasksPage'
import { CalendarPage } from './CalendarPage'
import { NotebooksPage } from './NotebooksPage'
import { TagsPage } from './TagsPage'
import { FilesPage } from './FilesPage'
import { ShortcutsPage } from './ShortcutsPage'
import { SharedPage } from './SharedPage'
import { TemplatesPage } from './TemplatesPage'
import { UpgradeModal } from './UpgradeModal'
import { SearchModal } from './SearchModal'
import { SettingsPage } from './SettingsPage'
import { NotificationBanner } from './NotificationBanner'
import { AIAssistant } from './AIAssistant'

type Page = 'home' | 'shortcuts' | 'notes' | 'tasks' | 'files' | 'calendar' | 'templates' | 'notebooks' | 'tags' | 'shared' | 'settings'
interface Props { user: User; onSignOut: () => void; onNavigate: (v: 'landing' | 'signin' | 'signup' | 'onboarding' | 'dashboard') => void; initialPage?: string; onPageChange?: (p: string) => void }

const navItems: { icon: typeof Home; label: string; page: Page }[] = [
  { icon: Home, label: 'Home', page: 'home' },
  { icon: Zap, label: 'Shortcuts', page: 'shortcuts' },
  { icon: FileText, label: 'Notes', page: 'notes' },
  { icon: CheckSquare, label: 'Tasks', page: 'tasks' },
  { icon: FolderOpen, label: 'Files', page: 'files' },
  { icon: Calendar, label: 'Calendar', page: 'calendar' },
  { icon: LayoutTemplate, label: 'Templates', page: 'templates' },
]
const navItems2: { icon: typeof Home; label: string; page: Page }[] = [
  { icon: BookOpen, label: 'Notebooks', page: 'notebooks' },
  { icon: Tag, label: 'Tags', page: 'tags' },
  { icon: Users, label: 'Shared with me', page: 'shared' },
]

export function Dashboard({ user, onSignOut, initialPage, onPageChange }: Props) {
  const { tasks, loading: tasksLoading, addTask, completeTask, toggleMode, prepareWorkflow, deleteTask, updateTask } = useTasks(user.id)
  const { profile } = useProfile(user.id)
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, addNotification } = useNotifications(user.id)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { notes, loading: notesLoading, addNote, updateNote, deleteNote } = useNotes(user.id)
  const { notebooks, loading: nbLoading, addNotebook, deleteNotebook } = useNotebooks(user.id)
  const { events, loading: eventsLoading, addEvent, deleteEvent } = useCalendarEvents(user.id)
  const { dark, toggle: toggleTheme } = useTheme()
  const { supported: pushSupported, permission: pushPermission, requestPermission, scheduleEnforcement, cancelEnforcement, sendNotification } = usePushNotifications()
  const [page, _setPage] = useState<Page>((initialPage as Page) || 'home')
  const setPage = (p: Page) => { _setPage(p); onPageChange?.(p) }
  const [showUM, setShowUM] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [dismissedNotifBanner, setDismissedNotifBanner] = useState(() => localStorage.getItem('ananke-notif-dismissed') === 'true')

  const active = tasks.filter(t => !t.completed)
  const userName = profile?.full_name?.split(' ')[0] || 'User'

  // Wrapped task/event creators that also create notifications
  const addTaskWithNotif = async (title: string, mode: 'digital' | 'physical', minutes: number, tags?: string[]) => {
    const res = await addTask(title, mode, minutes, tags)
    addNotification('task', `New task: ${title}`, `Due in ${minutes < 60 ? minutes + ' minutes' : Math.round(minutes / 60) + ' hours'} · ${mode} mode`)
    return res
  }
  const addEventWithNotif = async (title: string, start: string, end: string, color?: string) => {
    const res = await addEvent(title, start, end, color)
    addNotification('calendar', `Event added: ${title}`, `${new Date(start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`)
    return res
  }

  useEffect(() => { if (pushPermission !== 'granted') return; active.forEach(t => scheduleEnforcement(t.id, t.title, new Date(t.deadline).getTime())); tasks.filter(t => t.completed).forEach(t => cancelEnforcement(t.id)) }, [tasks, pushPermission, scheduleEnforcement, cancelEnforcement, active])
  useEffect(() => { const h = (e: Event) => { const id = (e as CustomEvent).detail?.taskId; if (id) completeTask(id) }; window.addEventListener('ananke-complete-task', h); return () => window.removeEventListener('ananke-complete-task', h) }, [completeTask])
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.action === 'CREATE_TASK') {
        let mins = 60;
        if (d.date?.toLowerCase().includes('tomorrow')) mins = 1440;
        else if (d.date?.toLowerCase().includes('next week')) mins = 10080;
        addTaskWithNotif(d.title, d.title.toLowerCase().includes('physical') ? 'physical' : 'digital', mins, d.tags || []);
      }
    };
    window.addEventListener('ananke-add-task', h);
    return () => window.removeEventListener('ananke-add-task', h);
  }, [addTaskWithNotif])
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true) } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])

  const handleEnableNotifications = async () => { const r = await requestPermission(); if (r === 'granted') sendNotification('🔔 Notifications Enabled', { body: 'You will receive enforcement alerts.', tag: 'welcome' }); setDismissedNotifBanner(true); localStorage.setItem('ananke-notif-dismissed', 'true') }
  const showNotifBanner = pushSupported && pushPermission === 'default' && !dismissedNotifBanner

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <aside className={`hidden sm:flex flex-col shrink-0 bg-bg-sidebar border-r border-border/40 transition-all duration-200 ${sidebarCollapsed ? 'w-[56px]' : 'w-[240px]'}`}>
        {/* Search */}
        <div className={`pt-3.5 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {!sidebarCollapsed ? (
            <button onClick={() => setShowSearch(true)} className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-bg-sidebar-hover/60 text-sm text-text-sidebar/60 cursor-pointer hover:bg-bg-sidebar-hover transition-colors text-left">
              <Search size={18} /> Search <span className="ml-auto text-xs opacity-40">⌘K</span>
            </button>
          ) : (
            <button onClick={() => setShowSearch(true)} className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-bg-sidebar-hover transition-colors cursor-pointer text-text-sidebar/60">
              <Search size={18} />
            </button>
          )}
        </div>

        {/* New Note button */}
        <div className={`mt-2.5 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {!sidebarCollapsed ? (
            <button onClick={() => setPage('notes')} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold cursor-pointer transition-colors">
              <Plus size={20} strokeWidth={2.5} /> Note
            </button>
          ) : (
            <button onClick={() => setPage('notes')} className="w-full flex items-center justify-center py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white cursor-pointer transition-colors">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 space-y-0.5 overflow-y-auto" style={{ padding: sidebarCollapsed ? '0 6px' : '0 8px' }}>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = page === item.page
            return (
              <button key={item.page} onClick={() => setPage(item.page)}
                className={`w-full flex items-center gap-3 rounded-lg transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2'} ${isActive ? 'bg-bg-sidebar-active text-text-sidebar font-semibold' : 'text-text-sidebar/75 hover:bg-bg-sidebar-hover hover:text-text-sidebar'}`}
                title={sidebarCollapsed ? item.label : undefined}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                {!sidebarCollapsed && <span className="text-base">{item.label}</span>}
              </button>
            )
          })}

          <div className={`h-px bg-border/30 my-3 ${sidebarCollapsed ? 'mx-1' : 'mx-2'}`} />

          {navItems2.map(item => {
            const Icon = item.icon
            const isActive = page === item.page
            return (
              <button key={item.page} onClick={() => setPage(item.page)}
                className={`w-full flex items-center gap-3 rounded-lg transition-all cursor-pointer ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2'} ${isActive ? 'bg-bg-sidebar-active text-text-sidebar font-semibold' : 'text-text-sidebar/75 hover:bg-bg-sidebar-hover hover:text-text-sidebar'}`}
                title={sidebarCollapsed ? item.label : undefined}>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                {!sidebarCollapsed && <span className="text-base">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="py-2.5 border-t border-border/30 space-y-0.5" style={{ padding: sidebarCollapsed ? '10px 6px' : '10px 8px' }}>
          <button onClick={toggleTheme}
            className={`w-full flex items-center gap-3 rounded-lg text-text-sidebar/60 hover:bg-bg-sidebar-hover hover:text-text-sidebar cursor-pointer transition-colors ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2'}`}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {!sidebarCollapsed && <span className="text-[15px]">{dark ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center gap-3 rounded-lg text-text-sidebar/60 hover:bg-bg-sidebar-hover hover:text-text-sidebar cursor-pointer transition-colors ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3.5 py-2'}`}>
            <ChevronLeft size={18} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span className="text-[15px]">Collapse</span>}
          </button>

          {/* User */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-3.5 py-2.5 mt-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">{userName[0].toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-text-sidebar truncate">{profile?.full_name || user.email}</p>
              </div>
              <button onClick={() => setShowNotifs(!showNotifs)} className="text-text-sidebar/40 hover:text-text-sidebar cursor-pointer relative">
                <Bell size={22} />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger text-white text-[8px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-14 border-b border-border/60 bg-bg shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setPage('home')} className="sm:hidden text-text-muted hover:text-text cursor-pointer"><Home size={20} /></button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="sm:hidden text-text-muted hover:text-text cursor-pointer p-1">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-text-muted hover:text-text cursor-pointer p-1">
                <Bell size={22} />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
              </button>

              {/* Notification dropdown */}
              {showNotifs && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                  <div className="absolute right-0 top-10 w-80 max-w-[calc(100vw-1.5rem)] bg-bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="text-base font-semibold text-text">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[13px] text-primary font-medium cursor-pointer hover:underline flex items-center gap-1">
                            <CheckCheck size={14} /> Mark all read
                          </button>
                        )}
                        <button onClick={() => setShowNotifs(false)} className="text-text-muted hover:text-text cursor-pointer"><X size={16} /></button>
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell size={28} className="mx-auto text-text-muted/30 mb-2" />
                          <p className="text-[15px] text-text-muted">No notifications</p>
                          <p className="text-[13px] text-text-muted/60 mt-0.5">You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => { if (!n.read) markAsRead(n.id) }}
                            className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 cursor-pointer transition-colors group ${n.read ? 'bg-transparent hover:bg-bg-alt/50' : 'bg-primary/5 hover:bg-primary/10'}`}>
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-[15px] ${n.read ? 'text-text-secondary' : 'text-text font-medium'}`}>{n.title}</p>
                              {n.message && <p className="text-[13px] text-text-muted mt-0.5 line-clamp-2">{n.message}</p>}
                              <p className="text-[12px] text-text-muted/60 mt-1">{new Date(n.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger cursor-pointer p-1 shrink-0 transition-opacity">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <div onClick={() => setShowUM(!showUM)} className="w-10 h-10 rounded-full bg-primary/15 text-primary text-base font-semibold flex items-center justify-center cursor-pointer hover:bg-primary/25 transition-colors">
                {userName[0].toUpperCase()}
              </div>
              {showUM && (
                <div className="absolute right-0 top-12 w-60 bg-bg-card border border-border rounded-xl shadow-xl p-1.5 z-50">
                  <div className="px-3.5 py-3 border-b border-border mb-1">
                    <p className="text-[15px] font-medium text-text truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-[13px] text-text-muted truncate mt-0.5">{user.email}</p>
                  </div>
                  <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[15px] text-text-secondary hover:bg-bg-alt rounded-lg cursor-pointer">
                    {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? 'Light mode' : 'Dark mode'}
                  </button>
                  <button onClick={() => { setPage('settings'); setShowUM(false) }} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[15px] text-text-secondary hover:bg-bg-alt rounded-lg cursor-pointer">
                    <Settings size={16} /> Settings
                  </button>
                  <button onClick={() => setShowUpgrade(true)} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[15px] text-text-secondary hover:bg-bg-alt rounded-lg cursor-pointer">
                    <UserIcon size={16} /> Upgrade plan
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[15px] text-danger hover:bg-danger-light rounded-lg cursor-pointer">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {showNotifBanner && <NotificationBanner onEnable={handleEnableNotifications} onDismiss={() => { setDismissedNotifBanner(true); localStorage.setItem('ananke-notif-dismissed', 'true') }} />}

        <div className={`flex-1 overflow-y-auto ${page === 'notes' || page === 'templates' ? '' : 'p-4 sm:p-7'} pb-20 sm:pb-7`}>
          {page === 'home' && <HomePage userName={userName} tasks={tasks} tasksLoading={tasksLoading} notes={notes} onAddTask={addTaskWithNotif} onCompleteTask={completeTask} onToggleMode={toggleMode} onPrepareWorkflow={prepareWorkflow} onDeleteTask={deleteTask} onNavigate={(p) => setPage(p as Page)} />}
          {page === 'notes' && <NotesPage notes={notes} notebooks={notebooks} loading={notesLoading} onAddNote={addNote} onUpdateNote={updateNote} onDeleteNote={deleteNote} />}
          {page === 'tasks' && <TasksPage tasks={tasks} loading={tasksLoading} onAddTask={addTaskWithNotif} onCompleteTask={completeTask} onDeleteTask={deleteTask} onUpdateTask={updateTask} />}
          {page === 'calendar' && <CalendarPage tasks={tasks} events={events} eventsLoading={eventsLoading} onAddEvent={addEventWithNotif} onDeleteEvent={deleteEvent} />}
          {page === 'notebooks' && <NotebooksPage notebooks={notebooks} notes={notes} loading={nbLoading} onAddNotebook={(n, c) => addNotebook(n, c)} onDeleteNotebook={deleteNotebook} onNavigate={(p) => setPage(p as Page)} />}
          {page === 'tags' && <TagsPage tasks={tasks} notes={notes} onNavigate={(p) => setPage(p as Page)} />}
          {page === 'files' && <FilesPage />}
          {page === 'shortcuts' && <ShortcutsPage tasks={tasks} notes={notes} onNavigate={(p) => setPage(p as Page)} />}
          {page === 'shared' && <SharedPage />}
          {page === 'templates' && <TemplatesPage onCreateFromTemplate={async (title, content) => addNote(title, undefined, content)} onNavigate={(p) => setPage(p as Page)} />}
          {page === 'settings' && <SettingsPage user={user} profile={profile} dark={dark} toggleTheme={toggleTheme} onSignOut={onSignOut} onUpdateProfile={() => { /* profile updates via realtime */ }} />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-card border-t border-border flex items-center justify-around px-2 py-1.5 safe-area-bottom">
        {[
          { icon: <Home size={20} />, p: 'home' as Page, label: 'Home' },
          { icon: <FileText size={20} />, p: 'notes' as Page, label: 'Notes' },
          { icon: <CheckSquare size={20} />, p: 'tasks' as Page, label: 'Tasks' },
          { icon: <Calendar size={20} />, p: 'calendar' as Page, label: 'Calendar' },
          { icon: <FolderOpen size={20} />, p: 'files' as Page, label: 'Files' },
        ].map(item => (
          <button key={item.p} onClick={() => setPage(item.p)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl cursor-pointer transition-colors ${page === item.p ? 'text-primary' : 'text-text-muted'}`}>
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl cursor-pointer text-text-muted">
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile More menu */}
      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute bottom-16 left-2 right-2 bg-bg-card border border-border rounded-2xl shadow-2xl p-3 grid grid-cols-4 gap-2" onClick={e => e.stopPropagation()}>
            {[
              { icon: <Zap size={18} />, p: 'shortcuts' as Page, label: 'Shortcuts' },
              { icon: <LayoutTemplate size={18} />, p: 'templates' as Page, label: 'Templates' },
              { icon: <BookOpen size={18} />, p: 'notebooks' as Page, label: 'Notebooks' },
              { icon: <Tag size={18} />, p: 'tags' as Page, label: 'Tags' },
              { icon: <Users size={18} />, p: 'shared' as Page, label: 'Shared' },
              { icon: <Settings size={18} />, p: 'settings' as Page, label: 'Settings' },
              { icon: <Search size={18} />, p: null as unknown as Page, label: 'Search' },
              { icon: <Sparkles size={18} />, p: null as unknown as Page, label: 'AI' },
            ].map(item => (
              <button key={item.label} onClick={() => { if (item.label === 'Search') { setShowSearch(true) } else if (item.label === 'AI') { setShowAI(true) } else { setPage(item.p) }; setShowMobileMenu(false) }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl cursor-pointer text-text-muted hover:text-text hover:bg-bg-alt transition-colors">
                {item.icon}
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      {showSearch && <SearchModal tasks={tasks} notes={notes} onClose={() => setShowSearch(false)} onNavigate={(p) => setPage(p as Page)} />}
      <AIAssistant open={showAI} onClose={() => setShowAI(false)} />
      {/* Floating AI button */}
      {!showAI && (
        <button onClick={() => setShowAI(true)}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:bg-accent/90 cursor-pointer transition-all hover:scale-105 z-30"
          title="AI Assistant">
          <Sparkles size={22} />
        </button>
      )}
    </div>
  )
}
