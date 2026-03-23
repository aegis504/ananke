import { ArrowLeft, ExternalLink } from 'lucide-react'

interface Props { onNavigate: (v: string) => void }

export function ForJudgesPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      {/* Header */}
      <header className="border-b border-[#e5e3de] bg-white sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] cursor-pointer transition-colors">
            <ArrowLeft size={18} />
            <span className="text-[15px] font-medium">Back to Ananke</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00a82d] flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="font-bold text-[18px] text-[#1a1a1a]">Ananke</span>
            <span className="text-[12px] bg-[#f0f0ec] px-2.5 py-1 rounded-full text-[#666] font-medium">For Judges</span>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-[42px] font-extrabold text-[#1a1a1a] leading-[1.1] mb-4">
            Ananke — Productivity<br />Enforcement Engine
          </h1>
          <p className="text-[18px] text-[#666] leading-relaxed max-w-[600px]">
            A full-stack productivity app with AI-powered features, real-time collaboration,
            and enforcement notifications. Built in 7 days for the hackathon.
          </p>
        </div>

        {/* Built With */}
        <Section title="🏗 Built With" subtitle="Development tools and platforms per target">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#e5e3de] rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f0ec] flex items-center justify-center mx-auto mb-4">
                <span className="text-[24px]">🌐</span>
              </div>
              <h3 className="font-bold text-[17px] text-[#1a1a1a] mb-1">Web / Desktop</h3>
              <p className="text-[14px] text-[#888] mb-3">Primary platform</p>
              <div className="inline-flex items-center gap-2 bg-[#f7f7f5] rounded-lg px-3 py-1.5">
                <span className="text-[13px] font-semibold text-[#1a1a1a]">Vibecoded with</span>
                <span className="text-[13px] font-bold text-[#00a82d]">CREAO</span>
              </div>
            </div>
            <div className="bg-white border border-[#e5e3de] rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f0ec] flex items-center justify-center mx-auto mb-4">
                <span className="text-[24px]">🍎</span>
              </div>
              <h3 className="font-bold text-[17px] text-[#1a1a1a] mb-1">iOS</h3>
              <p className="text-[14px] text-[#888] mb-3">Mobile app</p>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 bg-[#f7f7f5] rounded-lg px-3 py-1.5">
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">Made with</span>
                  <span className="text-[13px] font-bold text-[#00a82d]">CREAO</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#f7f7f5] rounded-lg px-3 py-1.5">
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">Packaged with</span>
                  <span className="text-[13px] font-bold text-[#444]">Xcode</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#e5e3de] rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f0ec] flex items-center justify-center mx-auto mb-4">
                <span className="text-[24px]">🤖</span>
              </div>
              <h3 className="font-bold text-[17px] text-[#1a1a1a] mb-1">Android</h3>
              <p className="text-[14px] text-[#888] mb-3">Mobile app</p>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 bg-[#f7f7f5] rounded-lg px-3 py-1.5">
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">NPM + Electron</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-[#f7f7f5] rounded-lg px-3 py-1.5">
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">Packaged with</span>
                  <span className="text-[13px] font-bold text-[#444]">VS Code</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Tech Stack */}
        <Section title="🛠 Tech Stack" subtitle="Everything powering Ananke">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StackCard category="Frontend" items={[
              { name: 'React 18', detail: 'UI framework with hooks' },
              { name: 'TypeScript', detail: 'Type-safe codebase' },
              { name: 'Vite', detail: 'Build tool & dev server' },
              { name: 'Tailwind CSS', detail: 'Utility-first styling' },
              { name: 'Framer Motion', detail: 'Animations & transitions' },
              { name: 'Lucide React', detail: 'Icon library' },
            ]} color="#00a82d" />
            <StackCard category="Backend & Infrastructure" items={[
              { name: 'Supabase', detail: 'Auth, Database (Postgres), Realtime, Storage' },
              { name: 'Vercel', detail: 'Hosting, Edge Functions, CI/CD' },
              { name: 'Vercel Serverless', detail: 'API routes (/api/ai, /api/share)' },
            ]} color="#3b82f6" />
            <StackCard category="AI & APIs" items={[
              { name: 'Featherless AI', detail: 'LLM inference API' },
              { name: 'Qwen 2.5 7B Instruct', detail: 'AI model for chat, summarize, quiz, etc.' },
              { name: 'Google OAuth 2.0', detail: 'Authentication provider' },
              { name: 'Google Calendar API', detail: 'Calendar sync integration' },
            ]} color="#8b5cf6" />
            <StackCard category="Browser APIs" items={[
              { name: 'Notifications API', detail: 'Push enforcement alerts' },
              { name: 'Service Workers', detail: 'Background notification actions' },
              { name: 'Clipboard API', detail: 'Copy share links' },
              { name: 'Drag & Drop API', detail: 'File uploads' },
              { name: 'Web Storage', detail: 'Theme & preference persistence' },
            ]} color="#f59e0b" />
          </div>
        </Section>

        {/* Design */}
        <Section title="🎨 Design & UX" subtitle="Where the design language comes from">
          <div className="space-y-4">
            <InfoCard icon="🖼" title="Figma" description="UI design references from Figma files — screen layouts, component styles, and page structures were referenced from Evernote's design system via Mobbin screenshots." />
            <InfoCard icon="📐" title="Evernote-Inspired Design System" description="Warm cream (#fbfaf8) backgrounds, sage green (#e8f0d3) sidebar, Evernote green (#00a82d) primary. Typography: Inter font, 16px base, 32px headings, -0.01em letter-spacing, 1.6 line-height." />
            <InfoCard icon="🌗" title="Full Dark Mode" description="CSS variable-based theme system. All colors swap via html.dark class. Persists to localStorage." />
            <InfoCard icon="📱" title="Mobile-First Responsive" description="Bottom navigation bar on mobile, collapsible sidebar on desktop, full-width panels, responsive grids. All pages work on phone, tablet, and desktop." />
          </div>
        </Section>

        {/* Features */}
        <Section title="⚡ Feature Map" subtitle="What's built and working">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { f: 'Notes Editor', d: 'Create, edit, pin, share notes with AI toolbar (summarize, key points, expand, simplify, dehumanize, humanize)' },
              { f: 'Task Management', d: 'Add tasks with deadlines, tags, digital/physical modes. Overdue detection. Animated checkboxes.' },
              { f: 'Calendar', d: 'Month/day views, event CRUD with color picker, date selection, Google Calendar sync' },
              { f: 'Files', d: 'Supabase Storage with drag-and-drop upload, full-page file viewer, AI tools (quiz, summarize), shareable links' },
              { f: 'Interactive Quiz', d: 'AI generates MCQs from file content → popup with progress bar, ABCD buttons, instant feedback, scoring, wrong answer review' },
              { f: 'AI Assistant Chatbot', d: 'Floating button → side panel chat. Context-aware productivity help. Quick actions: organize tasks, suggest tags, plan day' },
              { f: 'Templates Gallery', d: '25 templates across 3 categories. One-click creates note from template' },
              { f: 'Notebooks', d: 'Group notes into notebooks, colored covers, note counts' },
              { f: 'Tags', d: 'Free-form + suggested tags on tasks and notes. Tags page auto-populates from all items' },
              { f: 'Sharing', d: 'Share notes by email (Supabase table), copy public links (/api/share standalone pages). Shared with me / by me tabs' },
              { f: 'Enforcement Notifications', d: '5-min warning → 1-min urgent → overdue nag loop. Service Worker actions (Complete/Snooze)' },
              { f: 'Settings', d: '5 tabs: Profile, Account (24hr deletion), Notifications, Calendar, Appearance' },
              { f: 'Search', d: '⌘K global search across tasks and notes' },
              { f: 'Authentication', d: 'Email/password + Google OAuth. 3-step onboarding flow' },
              { f: 'Shortcuts', d: 'Pinned notes + overdue/urgent tasks quick view' },
            ].map(({ f, d }) => (
              <div key={f} className="bg-white border border-[#e5e3de] rounded-xl p-4">
                <h4 className="font-semibold text-[15px] text-[#1a1a1a] mb-1">{f}</h4>
                <p className="text-[13px] text-[#888] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Database */}
        <Section title="🗃 Database Schema" subtitle="10 Supabase Postgres tables with RLS">
          <div className="bg-white border border-[#e5e3de] rounded-xl overflow-hidden">
            <table className="w-full text-[14px]">
              <thead className="bg-[#f7f7f5]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-[#1a1a1a]">Table</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#1a1a1a]">Purpose</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#1a1a1a]">Key Fields</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {[
                  { t: 'profiles', p: 'User profiles & onboarding', k: 'name, avatar_url, intent' },
                  { t: 'tasks', p: 'Task management', k: 'title, deadline, mode, completed, tags' },
                  { t: 'notes', p: 'Note content', k: 'title, content, pinned, notebook_id, tags' },
                  { t: 'notebooks', p: 'Note grouping', k: 'name, color, user_id' },
                  { t: 'calendar_events', p: 'Calendar entries', k: 'title, start_time, end_time, color' },
                  { t: 'notifications', p: 'In-app alerts', k: 'type, title, message, read' },
                  { t: 'shared_items', p: 'Note/file sharing', k: 'shared_with_email, item_type, role' },
                  { t: 'workflows', p: 'Task workflows', k: 'task_id, steps, status' },
                  { t: 'mobile_sync', p: 'Device registration & sync tracking', k: 'device_id, platform, last_sync_at, push_token' },
                  { t: 'sync_queue', p: 'Change queue for offline sync', k: 'entity_type, entity_id, action, payload, synced_devices' },
                ].map(({ t, p, k }) => (
                  <tr key={t}>
                    <td className="px-5 py-3 font-mono text-[13px] text-[#00a82d] font-medium">{t}</td>
                    <td className="px-5 py-3 text-[#444]">{p}</td>
                    <td className="px-5 py-3 text-[#888] font-mono text-[12px]">{k}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-[#888] mt-3">All tables have Row Level Security (RLS) policies. 20+ policies total. Realtime enabled on all tables.</p>
        </Section>

        {/* API Endpoints */}
        <Section title="🔌 API Endpoints" subtitle="Vercel serverless functions">
          <div className="space-y-3">
            <ApiCard method="POST" path="/api/ai" description="AI inference — actions: summarize, quiz, improve, keypoints, actionitems, explain, expand, simplify, translate, dehumanize, humanize, chat. Uses Featherless AI (Qwen 2.5 7B)." />
            <ApiCard method="GET" path="/api/share" description="Standalone shared file page. Server-rendered HTML with file preview, download button, OG meta tags. Not the SPA." />
            <ApiCard method="GET" path="/api/sync?action=pull" description="Pull unsynced changes since timestamp for a device. Returns sync_queue entries not yet delivered to the requesting device." />
            <ApiCard method="POST" path="/api/sync?action=push" description="Push local changes from mobile. Accepts array of create/update/delete operations. Marks entities as synced for the device." />
            <ApiCard method="POST" path="/api/sync?action=register" description="Register a mobile device for sync. Stores device_id, platform (ios/android/web), push_token, app_version." />
            <ApiCard method="GET" path="/api/sync?action=status" description="Get sync status for all registered devices. Shows last_sync_at per device." />
          </div>
        </Section>

        {/* Architecture */}
        <Section title="🏗 Architecture Decisions" subtitle="Why we built it this way">
          <div className="space-y-3">
            {[
              { d: 'Single-Page App with URL routing', r: 'React SPA with pushState for clean URLs (/notes, /tasks, /calendar). Vercel rewrites handle server-side.' },
              { d: 'Supabase for entire backend', r: 'Auth, Postgres DB, Realtime subscriptions, and Storage in one platform. No custom backend needed.' },
              { d: 'Edge Functions for AI', r: 'Vercel Edge Runtime for low-latency AI proxy. Keeps API keys server-side.' },
              { d: 'CSS Variables for theming', r: 'html.dark class swaps all --color-* variables. No re-render needed. Instant theme switch.' },
              { d: 'Browser Notifications, not push server', r: 'Client-side notification scheduling with Service Worker actions. No infrastructure needed.' },
              { d: 'Standalone share pages', r: '/api/share returns full HTML — not the SPA. Works for non-users, has OG tags for link previews.' },
            ].map(({ d, r }) => (
              <div key={d} className="bg-white border border-[#e5e3de] rounded-xl p-4">
                <h4 className="font-semibold text-[14px] text-[#1a1a1a] mb-1">💡 {d}</h4>
                <p className="text-[13px] text-[#888] leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Links */}
        <Section title="🔗 Live Links" subtitle="">
          <div className="flex flex-wrap gap-3">
            <a href="https://ananke.vercel.app" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00a82d] text-white px-5 py-3 rounded-xl font-semibold text-[15px] hover:bg-[#009125] transition-colors">
              Live App <ExternalLink size={16} />
            </a>
            <a href="https://ananke.vercel.app/dashboard" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border border-[#e5e3de] text-[#444] px-5 py-3 rounded-xl font-semibold text-[15px] hover:bg-[#f7f7f5] transition-colors">
              Dashboard <ExternalLink size={16} />
            </a>
            <a href="https://github.com/aegis504/ananke" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#24292e] text-white px-5 py-3 rounded-xl font-semibold text-[15px] hover:bg-[#1a1e22] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Source Code <ExternalLink size={16} />
            </a>
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#e5e3de] text-center">
          <p className="text-[14px] text-[#888]">Built with 💚 for the hackathon — Ananke Team, March 2026</p>
        </div>
      </main>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="text-[26px] font-bold text-[#1a1a1a] mb-1">{title}</h2>
      {subtitle && <p className="text-[15px] text-[#888] mb-6">{subtitle}</p>}
      {children}
    </section>
  )
}

function StackCard({ category, items, color }: { category: string; items: { name: string; detail: string }[]; color: string }) {
  return (
    <div className="bg-white border border-[#e5e3de] rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        <h3 className="font-bold text-[16px] text-[#1a1a1a]">{category}</h3>
      </div>
      <div className="space-y-2.5">
        {items.map(i => (
          <div key={i.name} className="flex items-start gap-2">
            <span className="font-semibold text-[14px] text-[#1a1a1a] shrink-0">{i.name}</span>
            <span className="text-[13px] text-[#888]">— {i.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white border border-[#e5e3de] rounded-xl p-5 flex gap-4">
      <span className="text-[24px] shrink-0">{icon}</span>
      <div>
        <h4 className="font-bold text-[15px] text-[#1a1a1a] mb-1">{title}</h4>
        <p className="text-[14px] text-[#888] leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

function ApiCard({ method, path, description }: { method: string; path: string; description: string }) {
  return (
    <div className="bg-white border border-[#e5e3de] rounded-xl p-4 flex items-start gap-3">
      <span className={`shrink-0 text-[12px] font-bold px-2.5 py-1 rounded-md ${method === 'POST' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{method}</span>
      <div>
        <code className="text-[14px] font-mono font-semibold text-[#1a1a1a]">{path}</code>
        <p className="text-[13px] text-[#888] mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
