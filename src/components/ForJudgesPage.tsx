import { ArrowLeft, ExternalLink, ShieldCheck, Zap, Cpu, Database, Layout, Sparkles, MessageCircle, Share2, Bell, Search, Lock } from 'lucide-react'

interface Props { onNavigate: (v: string) => void }

export function ForJudgesPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#1a1a1a] selection:bg-[#00a82d]/10 selection:text-[#00a82d]">
      {/* Premium Header */}
      <header className="border-b border-[#e5e3de] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('landing')} 
            className="group flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] cursor-pointer transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-[#f7f7f5] flex items-center justify-center group-hover:bg-[#e5e3de] transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="text-[14px] font-semibold tracking-tight">Return to Ananke</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#f0f0ec] px-3 py-1.5 rounded-full border border-[#e5e3de]">
              <ShieldCheck size={14} className="text-[#00a82d]" />
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#666]">Official Submission</span>
            </div>
            <div className="w-[1px] h-6 bg-[#e5e3de]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#00a82d] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[#00a82d]/20">A</div>
              <span className="font-bold text-[17px] tracking-tight">Ananke</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="mb-20 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0d3] text-[#00a82d] font-bold text-[12px] uppercase tracking-wider mb-6">
            <Sparkles size={12} />
            7-Day Hackathon Sprint
          </div>
          <h1 className="text-[48px] sm:text-[64px] font-black text-[#1a1a1a] leading-[0.95] tracking-[-0.04em] mb-8">
            The Productivity<br />
            <span className="text-[#00a82d]">Enforcement</span> Engine
          </h1>
          <p className="text-[20px] text-[#666] leading-[1.5] max-w-[700px] font-medium">
            Ananke isn't just a notes app. It's a cross-platform ecosystem designed to eliminate procrastination through AI intelligence and aggressive notification cycles.
          </p>
        </div>

        {/* Technical Deployment Matrix */}
        <Section title="📦 Deployment Matrix" subtitle="Multi-platform distribution across Web, Desktop, and Mobile.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlatformCard 
              icon="🌐" 
              name="Web / Desktop" 
              tagline="Primary Entry Point"
              labelA="Vibecoded with"
              valA="CREO"
              labelB="Target"
              valB="Vercel & Electron"
              accent="#00a82d"
            />
            <PlatformCard 
              icon="🤖" 
              name="Android" 
              tagline="Mobile Productivity"
              labelA="Managed with"
              valA="Switch"
              labelB="Packaged with"
              valB="Devs Warn"
              accent="#32de84"
            />
            <PlatformCard 
              icon="🍎" 
              name="iOS" 
              tagline="Apple Ecosystem"
              labelA="Made with"
              valA="Creo"
              labelB="Packaged with"
              valB="Xcode"
              accent="#000000"
            />
          </div>
        </Section>

        {/* Project Ambition Section */}
        <Section title="🚀 Project Ambition" subtitle="The philosophy and technical challenge behind Ananke.">
          <div className="bg-white border border-[#e5e3de] rounded-3xl p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-[22px] font-bold tracking-tight">The "Enforcement" Philosophy</h3>
                <p className="text-[15px] text-[#666] leading-relaxed">
                  Most productivity tools are passive—they wait for you to open them. Ananke reverses this. By utilizing a **"Nag-Loop" Notification Engine**, the app actively intervenes when deadlines approach. It follows a strict 3-stage escalation: 
                  <span className="block mt-2 font-semibold text-[#1a1a1a]">Warning (5m) → Urgent (1m) → The Overdue Loop.</span>
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-2xl bg-[#fbfaf8] border border-[#f0f0ec]">
                    <div className="text-[20px] mb-2">⚡</div>
                    <div className="font-bold text-[14px]">Zero Latency</div>
                    <p className="text-[12px] text-[#888]">Real-time Supabase sync across all devices simultaneously.</p>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-[#fbfaf8] border border-[#f0f0ec]">
                    <div className="text-[20px] mb-2">🧠</div>
                    <div className="font-bold text-[14px]">Deep AI</div>
                    <p className="text-[12px] text-[#888]">Context-aware responses using local file analysis and Qwen 2.5.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-4">
                <div className="p-5 rounded-2xl bg-[#e8f0d3]/30 border border-[#e8f0d3] flex items-center gap-4">
                  <Zap className="text-[#00a82d]" size={24} />
                  <div>
                    <h4 className="font-bold text-[15px]">Full-Stack Synchronization</h4>
                    <p className="text-[13px] text-[#666]">Integrated Supabase Auth, Storage, and Realtime DB with a single-schema mobile/web sync.</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-[#f0f0ec] border border-[#e5e3de] flex items-center gap-4 opacity-80">
                  <Layout className="text-[#666]" size={24} />
                  <div>
                    <h4 className="font-bold text-[15px]">Multi-Format Ingestion</h4>
                    <p className="text-[13px] text-[#666]">Handles PDF, Image, and Markdown uploads with automated AI summarization and quiz generation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Tech Stack */}
        <Section title="🛠 Tech Stack" subtitle="A modern architecture designed for speed and scale.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StackCard 
              category="Frontend Core" 
              icon={<Cpu size={20} />}
              items={[
                { name: 'React 19', detail: 'Latest concurrent rendering features' },
                { name: 'TypeScript', detail: 'Rigid strictly-typed architecture' },
                { name: 'Vite', detail: 'HMR-optimized build pipeline' },
                { name: 'Framer Motion', detail: 'Gesture-driven micro-interactions' },
                { name: 'Capacitor 6', detail: 'Native mobile bridge with Swift/Java' },
              ]} 
              color="#00a82d" 
            />
            <StackCard 
              category="Infrastructure" 
              icon={<Database size={20} />}
              items={[
                { name: 'Supabase', detail: 'Postgres + Auth + Realtime + Storage' },
                { name: 'Vercel Edge', detail: 'Low-latency global API routes' },
                { name: 'GitHub Actions', detail: 'Automated APK, EXE, and IPA CI/CD' },
                { name: 'PostgREST', detail: 'Optimized auto-generated REST API' },
              ]} 
              color="#3b82f6" 
            />
            <StackCard 
              category="Artificial Intelligence" 
              icon={<Sparkles size={20} />}
              items={[
                { name: 'Featherless AI', detail: 'High-speed model inference' },
                { name: 'Qwen 2.5 7B', detail: 'Local-grade model with 32k context' },
                { name: 'Multi-Key Fallback', detail: 'Automatic key rotation resilience' },
                { name: 'Prompt Engineering', detail: 'Structured JSON output enforcement' },
              ]} 
              color="#8b5cf6" 
            />
            <StackCard 
              category="Ecosystem Integration" 
              icon={<Share2 size={20} />}
              items={[
                { name: 'Google Calendar', detail: 'Bi-directional event synchronization' },
                { name: 'Electron', detail: 'Standardized desktop distribution' },
                { name: 'Deep Linking', detail: 'Custom ananke:// protocol handler' },
                { name: 'N with N Bridge', detail: 'Advanced Node-Native performance synchronization' },
                { name: 'Service Workers', detail: 'Persistence & notification logic' },
              ]} 
              color="#f59e0b" 
            />
          </div>
        </Section>

        {/* Feature Map */}
        <Section title="⚡ Feature Highlight" subtitle="Core components delivered in the V1 build.">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FeatureBox icon={<MessageCircle size={18} />} title="AI Assistant" desc="Context-aware chat helps organize your day and analyze complex files." />
            <FeatureBox icon={<Layout size={18} />} title="Note Sync" desc="Realtime multi-device editing with notebook organization." />
            <FeatureBox icon={<Zap size={18} />} title="Smart Quiz" desc="Instantly generate interactive tests from any PDF or Text file." />
            <FeatureBox icon={<Share2 size={18} />} title="Public Share" desc="Generate standalone static pages for items viewable by anyone." />
            <FeatureBox icon={<Bell size={18} />} title="Nag Alerts" desc="Aggressive notification system ensure deadlines are actually met." />
            <FeatureBox icon={<Search size={18} />} title="Global CMD+K" desc="Lightning fast search across all your data from anywhere." />
            <FeatureBox icon={<Lock size={18} />} title="Secure Auth" desc="Google OAuth + Email with strict RLS database policies." />
            <FeatureBox icon={<Cpu size={18} />} title="Templates" desc="25+ ready-to-use layouts for work, school, and life." />
            <FeatureBox icon={<Database size={18} />} title="Notebooks" desc="Group related content with custom color coding and AI insights." />
          </div>
        </Section>

        {/* Judge Guidance */}
        <Section title="⚖️ Guidance for Judges" subtitle="How to evaluate Ananke in 5 minutes.">
          <div className="bg-[#1a1a1a] text-white rounded-3xl p-8 space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck size={120} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[22px] font-bold mb-6">Recommended Testing Flow</h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00a82d] flex items-center justify-center shrink-0 font-bold text-[14px]">1</div>
                  <div>
                    <h4 className="font-bold text-[16px] mb-1">Onboarding & Unlimited Access</h4>
                    <p className="text-[14px] text-white/70">Sign up and note the <span className="text-[#32de84] font-bold tracking-tight">PRO</span> badge. Payment is disabled for this hackathon—all judges have <strong>Unlimited Access</strong> to premium features.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00a82d] flex items-center justify-center shrink-0 font-bold text-[14px]">2</div>
                  <div>
                    <h4 className="font-bold text-[16px] mb-1">AI Intelligence</h4>
                    <p className="text-[14px] text-white/70">Go to **Files**, upload a text file or PDF, click it, and run **"Study / Quiz Me"**. Note the speed and accuracy of the generated results.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00a82d] flex items-center justify-center shrink-0 font-bold text-[14px]">3</div>
                  <div>
                    <h4 className="font-bold text-[16px] mb-1">Cross-Platform Sync</h4>
                    <p className="text-[14px] text-white/70">Open the same account on a phone or another browser tab. Add a note. Note the **instantly updated state** via Supabase Realtime.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-6 mt-8">
              <div className="flex-1">
                <h4 className="font-bold text-[14px] text-[#00a82d] uppercase mb-2">Source Code</h4>
                <a href="https://github.com/aegis504/ananke" target="_blank" className="flex items-center gap-2 text-white hover:text-[#32de84] transition-colors font-mono text-[13px]">
                  github.com/aegis504/ananke <ExternalLink size={14} />
                </a>
              </div>
              <div className="flex-1 text-white/50 text-[12px] italic mt-auto">
                Built with precision for the 2026 Productivity Challenge.
              </div>
            </div>
          </div>
        </Section>

        {/* Links Footer */}
        <div className="mt-24 pt-12 border-t border-[#e5e3de] flex flex-col items-center gap-6">
          <div className="flex gap-4 font-bold text-[14px] text-[#666]">
            <span>MARCH 2026</span>
            <span>•</span>
            <span className="text-[#1a1a1a]">ANANKE TEAM</span>
            <span>•</span>
            <span>HACKATHON ENTRY</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-24">
      <h2 className="text-[32px] font-black tracking-[-0.03em] text-[#1a1a1a] mb-2">{title}</h2>
      <p className="text-[16px] text-[#888] mb-10 font-medium">{subtitle}</p>
      {children}
    </section>
  )
}

function PlatformCard({ icon, name, tagline, labelA, valA, labelB, valB, accent }: any) {
  return (
    <div className="group relative bg-white border border-[#e5e3de] rounded-3xl p-8 hover:border-[#00a82d] transition-all duration-500 hover:shadow-xl hover:shadow-[#00a82d]/5">
      <div className="text-[40px] mb-6">{icon}</div>
      <h3 className="text-[19px] font-black text-[#1a1a1a] mb-1">{name}</h3>
      <p className="text-[13px] text-[#888] mb-6 font-medium">{tagline}</p>
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#aaa] tracking-widest">{labelA}</span>
          <span className="text-[14px] font-bold text-[#1a1a1a]">{valA}</span>
        </div>
        <div className="w-full h-[1px] bg-[#f0f0ec]" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-[#aaa] tracking-widest">{labelB}</span>
          <span className="text-[14px] font-bold" style={{ color: accent }}>{valB}</span>
        </div>
      </div>
    </div>
  )
}

function StackCard({ category, icon, items, color }: any) {
  return (
    <div className="bg-white border border-[#e5e3de] rounded-3xl p-7 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}15`, color: color }}>
          {icon}
        </div>
        <h3 className="font-black text-[17px] text-[#1a1a1a] tracking-tight">{category}</h3>
      </div>
      <div className="space-y-4">
        {items.map((i: any) => (
          <div key={i.name} className="flex flex-col gap-0.5">
            <span className="font-bold text-[14px] text-[#1a1a1a]">{i.name}</span>
            <span className="text-[12px] text-[#888] leading-snug">{i.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FeatureBox({ icon, title, desc }: any) {
  return (
    <div className="bg-white border border-[#e5e3de] rounded-2xl p-5 hover:bg-[#fbfaf8] transition-colors cursor-default">
      <div className="w-9 h-9 rounded-xl bg-[#f0f0ec] flex items-center justify-center text-[#1a1a1a] mb-4">
        {icon}
      </div>
      <h4 className="font-bold text-[14px] text-[#1a1a1a] mb-1.5">{title}</h4>
      <p className="text-[12px] text-[#888] leading-relaxed">{desc}</p>
    </div>
  )
}

