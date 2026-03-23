import { useState, useMemo } from 'react'
import type { Note } from '../../hooks/useNotes'
import { Search, ArrowRight, ArrowLeft, Plus, FileText, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Category = 'all' | 'school' | 'life' | 'work'

interface Template {
  id: string; name: string; desc: string; longDesc: string; category: Category[]; categoryLabel: string; content: string
  preview: string[]
  color: string
}

const templates: Template[] = [
  // School
  { id: 'agenda', name: 'Agenda', desc: 'Plan your weekly classes, webinars, and homework', longDesc: 'Stay organized with a comprehensive weekly agenda template. Plan your classes, set non-negotiable priorities, and track homework assignments day by day. Perfect for students who want to stay ahead of their schedule.', categoryLabel: 'School', category: ['school'], color: '#fbbf24', preview: ['Week: 13th to 19th January', '📌 Non-negotiables', '• finish study notes', '• attend group session', '', '### Monday', '- [ ] Math homework', '- [ ] Read chapter 5', '', '### Tuesday', '- [ ] Physics lab report', '- [ ] Group study session'], content: '## Agenda\n\n**Week:** ___\n\n### 📌 Non-negotiables\n- \n\n### Monday\n- [ ] \n\n### Tuesday\n- [ ] \n\n### Wednesday\n- [ ] \n\n### Thursday\n- [ ] \n\n### Friday\n- [ ] ' },
  { id: 'coding-101', name: 'Coding 101', desc: 'Organize your programming notes by language', longDesc: 'Structure your programming journey with organized notes by topic. Cover fundamentals like variables, conditionals, loops, and functions. Great for beginners learning any programming language.', categoryLabel: 'School', category: ['school'], color: '#4ade80', preview: ['1. Overview', '   • Basics of Python', '   • Hello World', '', '2. Variables and Data Types', '   • Strings, integers, floats', '   • Type conversion', '', '3. Conditionals', '   • if/elif/else', '   • Comparison operators'], content: '## Coding 101\n\n### 1. Overview\n- Basics of Python\n- Hello World\n\n### 2. Variables and Data Types\n\n### 3. Conditionals\n\n### 4. Loops\n\n### 5. Functions' },
  { id: 'cornell-notes', name: 'Cornell Notes', desc: 'Use this template to take notes in class and easily review them for an exam', longDesc: 'The Cornell Note-taking system is a proven method for organizing class notes. Divide your page into notes, cues, and summary sections for effective studying and exam preparation.', categoryLabel: 'School', category: ['school'], color: '#60a5fa', preview: ['Date: January 16, 2025', 'Topic: Introduction to Biology', '', '┌─────────────┬────────────┐', '│ Notes            │ Cues         │', '├─────────────┼────────────┤', '│ Cell structure  │ What are the │', '│ Mitosis phases │ main stages? │', '└─────────────┴────────────┘', '', 'Summary:', 'Cells are the basic unit of life...'], content: '## Cornell Notes\n\n**Date:** ___\n**Topic:** ___\n\n| Notes | Cues |\n|-------|------|\n|       |      |\n\n### Summary\n\n### Essential Questions\n1. ' },
  { id: 'project', name: 'Project Plan', desc: 'Track milestones and phases for any project', longDesc: 'Keep your academic or work projects on track with a structured plan. Define phases, set due dates, and track progress from start to completion. Includes sections for notes and resources.', categoryLabel: 'School', category: ['school', 'work'], color: '#c084fc', preview: ['Due date: 17th January, 2025', '', '✅ Phase one — Research', '✅ Phase two — Outline', '⬜ Phase three — First draft', '⬜ Phase four — Review', '', '📝 Notes:', 'Remember to cite all sources', '', '📎 Resources:', '• textbook chapter 4-6'], content: '## Project Plan\n\n**Due date:** ___\n\n### Phases\n- [ ] Phase one\n- [ ] Phase two\n- [ ] Phase three\n\n### Notes\n\n### Resources' },
  { id: 'math-equations', name: 'Math Key Equations', desc: 'Keep all formulas organized by topic', longDesc: 'Never lose track of important formulas again. Organize all your key mathematical equations by topic — from differentiation and integration to statistics. A must-have reference for exam prep.', categoryLabel: 'School', category: ['school'], color: '#34d399', preview: ['Key Equations — Mathematics', '', '1. Fundamental Concepts', '   • Differentiation Rules', '   • Product Rule: d/dx[fg] = f\'g + fg\'', '   • Quotient Rule', '', '2. Integration', '   • ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C', '   • Substitution method', '', '3. Statistics', '   • Mean: Σx / n'], content: '## Key Equations — Math\n\n### 1. Fundamental Concepts\n- Differentiation Rules\n- Product Rule\n- Quotient Rule\n\n### 2. Integration\n- Basic integral\n- Substitution\n\n### 3. Statistics\n- Mean, Median, Mode' },
  { id: 'assignment', name: 'Assignment', desc: 'Stay on top of all the necessary information at a glance', longDesc: 'Capture every detail of your assignments in one place. Record instructions, secondary goals, required materials, and deadlines. Never miss an important detail again.', categoryLabel: 'School', category: ['school'], color: '#fb923c', preview: ['📝 Instructions', 'Main task: research the anatomy', 'of the human circulatory system', '', 'Secondary goals:', '• create a 3-min presentation', '• include at least 5 diagrams', '• Teacher\'s note: keep it clear', '', '📎 Materials and resources', '• Textbook chapters 7-9', '• Online anatomy atlas'], content: '## Assignment\n\n### 📝 Instructions\n**Main task:** \n\n**Secondary goals:**\n- \n\n### Materials and resources\n\n### Helpful notes\n\n### Deadline: ___' },
  { id: 'class-notes', name: 'Class Notes', desc: 'Sort and structure your school and university courses', longDesc: 'Keep all your lecture and class notes organized by course and date. Capture key points, record audio links, and note down questions for later review. Perfect for students juggling multiple courses.', categoryLabel: 'School', category: ['school'], color: '#818cf8', preview: ['1st Class — January 14', 'Introduction to Kant — Philosophy', '', '2nd Class — January 16', 'Lecture AC105 — Physics', '', 'Key Points:', '• Categorical imperative', '• Moral philosophy foundations', '', '🎙 Audio recording', '📎 Class_recording_jan14.mp3'], content: '## Class Notes\n\n### 1st Class\n**Topic:** ___\n**Date:** ___\n\n### Key Points\n1. \n\n### 🎙 Audio Recording\n\n### Questions to Review' },

  // Life
  { id: 'travel-wishlist', name: 'Travel Wishlist', desc: 'Organize your dream destinations and travel inspiration', longDesc: 'Create your ultimate travel bucket list with dream destinations, seasonal recommendations, and trip inspiration. Plan future adventures and track travel goals.', categoryLabel: 'Travel', category: ['life'], color: '#f97316', preview: ['Dream Destinations', '', '┌──────────────┬─────────┬─────────────────┬───────────┐', '│ Place/Region     │ Country  │ Bucket List            │ Season       │', '├──────────────┼─────────┼─────────────────┼───────────┤', '│ Kyoto              │ Japan      │ Cherry blossoms,     │ Spring         │', '│                        │              │ temples, tea             │ (Mar-Apr)    │', '├──────────────┼─────────┼─────────────────┼───────────┤', '│ Amalfi Coast     │ Italy       │ Cliffside towns,      │ Summer        │', '│                        │              │ limoncello, hiking    │ (May-Jun)    │', '├──────────────┼─────────┼─────────────────┼───────────┤', '│ Patagonia          │ Chile/     │ Glaciers, hiking      │ Spring/Fall   │', '│                        │ Argentina │ Torres del Paine    │                    │', '└──────────────┴─────────┴─────────────────┴───────────┘', '', 'Trip Ideas & Inspiration', '', '🏔 Adventure: Hike the Inca Trail,', '   dog-sledding in Lapland,', '   scuba in Raja Ampat', '', '🧘 Relaxation: Spa retreat in Bali,', '   beach bungalow in Zanzibar', '', '🏛 Culture & History: Museums in Paris,', '   temples in Angkor Wat,', '   historic towns in Georgia', '', '🍣 Culinary Dreams: Sushi tour in Tokyo,', '   pasta-making in Tuscany,', '   night markets in Taiwan', '', '', 'When to Go'], content: '## Travel Wishlist\n\n### Dream Destinations\n\n| Place | Country | Season | Notes |\n|-------|---------|--------|-------|\n|       |         |        |       |\n\n### Trip Ideas & Inspiration\n' },
  { id: 'travel-plan', name: 'Travel Plan', desc: 'Plan every detail of your next adventure', longDesc: 'Plan your next trip from start to finish. Track bookings, pack essentials, budget expenses, and organize your itinerary. Never forget a detail with this comprehensive travel planner.', categoryLabel: 'Travel', category: ['life'], color: '#06b6d4', preview: ['Planning for: Summer 2025', '', '✅ Destinations', '• Book flights — confirmed', '• Book accommodation — pending', '', '📋 Essentials', '• Passport (valid until 2028)', '• Travel insurance', '', '🧳 Packing list', '- [ ] Sunscreen', '- [ ] Adapter'], content: '## Travel Plan\n\n**Planning for:** ___\n\n### ✅ Destinations\n- [ ] Book flights\n- [ ] Book accommodation\n\n### 📋 Essentials\n- Passport\n- Insurance\n\n### Packing List\n- [ ] \n\n### Budget\n| Item | Cost |\n|------|------|\n|      |      |' },
  { id: 'weight-tracker', name: 'Weight Loss Tracker', desc: 'Track your progress and stay motivated', longDesc: 'Stay accountable on your fitness journey. Log weekly progress, track measurements, plan meals, and record exercises. Includes motivation section to keep your "why" front and center.', categoryLabel: 'Health', category: ['life'], color: '#ec4899', preview: ['💪 Your Why', 'Your personal reason for starting', 'this journey: feel more energetic', '', 'Weekly Progress Log', '', 'Date       | Weight | Waist | Energy', 'Jan 6    | 185 lbs | 34"    | ★★★☆', 'Jan 13  | 183 lbs | 33.5" | ★★★★', 'Jan 20  | 181 lbs | 33"    | ★★★★'], content: '## Weight Loss Tracker\n\n### 💪 Your Why\nYour personal reason for starting this journey:\n\n### Weekly Progress Log\n\n| Date | Weight | Waist | Energy |\n|------|--------|-------|--------|\n|      |        |       |        |\n\n### Meal Plan\n\n### Exercise Log' },
  { id: 'monthly-planner', name: 'Monthly Planner', desc: 'Your month at a glance with goals and categories', longDesc: 'Get a bird\'s-eye view of your entire month. Set goals across work, health, and personal categories, then break them down into weekly action items. Stay focused on what matters most.', categoryLabel: 'Productivity', category: ['life'], color: '#8b5cf6', preview: ['📅 Monthly Goals — February 2025', '', '• Work goals', '  ○ Complete Q1 report', '  ○ Schedule team reviews', '', '• Health goals', '  ○ Run 3x per week', '  ○ Meal prep Sundays', '', '• Personal goals', '  ○ Read 2 books', '  ○ Plan weekend trip'], content: '## Monthly Planner\n\n### 📅 Monthly Goals\n\n**Work:**\n- [ ] \n\n**Health:**\n- [ ] \n\n**Personal:**\n- [ ] \n\n### Weekly Breakdown\n\n#### Week 1\n- [ ] \n\n#### Week 2\n- [ ] ' },
  { id: 'expenses', name: 'Expenses Tracker', desc: 'Keep track of daily spending and budgets', longDesc: 'Take control of your finances with a simple daily expense log. Track spending by category, set budgets, and understand where your money goes each month.', categoryLabel: 'Finance', category: ['life'], color: '#10b981', preview: ['Daily Expense Log', '', 'Date       | Description | Category | Amount', 'Apr 6    | Grocery        | Food        | $45.99', 'Apr 6    | Coffee          | Café         | $4.50', 'Apr 7    | Gas              | Transport | $52.00', 'Apr 7    | Netflix          | Entertain. | $15.99', '', 'Monthly Total: $118.48', '', 'Budget: $800 remaining'], content: '## Expenses Tracker\n\n### Daily Expense Log\n\n| Date | Description | Category | Amount |\n|------|-------------|----------|--------|\n|      |             |          |        |\n\n### Categories for Reference\n1. Food & Groceries\n2. Transportation\n3. Entertainment' },
  { id: 'home-tasks', name: 'Home Tasks Checklist', desc: 'Keep your home clean and organized', longDesc: 'Maintain a tidy and organized home with this comprehensive checklist. Cover organizing, cleaning, and shopping in one template. Perfect for weekly home maintenance routines.', categoryLabel: 'Home', category: ['life'], color: '#f59e0b', preview: ['🏠 Organizing', 'Keep your spaces tidy!', '- [ ] Declutter living room', '- [ ] Sort mail & paperwork', '', '🧹 Cleaning', '- [x] Kitchen counters', '- [ ] Bathroom deep clean', '- [ ] Vacuum all rooms', '', '🛒 Shopping List', '- [ ] Dish soap', '- [ ] Paper towels'], content: '## Home Tasks Checklist\n\n### 🏠 Organizing\n- [ ] Declutter living room\n- [ ] Sort mail\n\n### 🧹 Cleaning\n- [ ] Kitchen\n- [ ] Bathroom\n- [ ] Vacuum all rooms\n\n### 🛒 Shopping\n- [ ] ' },
  { id: 'daily-journal', name: 'Daily Journaling', desc: 'Write your personal thoughts using our daily journaling template', longDesc: 'Start each day with intention and end it with reflection. This journaling template guides you through morning check-ins, goal setting, evening reflections, and gratitude practice.', categoryLabel: 'Mindfulness', category: ['life'], color: '#a78bfa', preview: ['☀ Morning — January 16', '', 'How am I feeling today?', 'Energized and ready to tackle', 'the presentation at work.', '', '✨ Goals for Today', '1. Finish slide deck', '2. Call dentist', '3. 30-min workout', '', '💭 Evening Reflection', '', '🙏 Gratitude', '1. Good weather today'], content: '## Daily Journal\n\n**Date:** ___\n\n### ☀ Morning\nHow am I feeling today?\n\n### ✨ Goals for Today\n1. \n\n### 💭 Reflections\n\n### 🙏 Gratitude\n1. ' },
  { id: 'workout', name: 'Workout Tracker', desc: 'Log exercises, sets, and track your fitness progress', longDesc: 'Log every workout with detailed exercise tracking. Record sets, reps, and weights for each movement. Track progress over time and keep notes on form and recovery.', categoryLabel: 'Fitness', category: ['life'], color: '#ef4444', preview: ['Today\'s Workout — Push Day', 'Date: January 16, 2025', '', 'Exercise     | Sets | Reps | Weight', 'Bench Press | 4      | 8       | 185 lbs', 'OHP            | 3      | 10     | 95 lbs', 'Incline DB   | 3      | 12     | 60 lbs', 'Tricep Dips  | 3      | 15     | BW', '', '📈 Progress Notes', 'Increased bench by 5 lbs!'], content: '## Workout Tracker\n\n### Today\'s Workout\n**Date:** ___\n\n| Exercise | Sets | Reps | Weight |\n|----------|------|------|--------|\n|          |      |      |        |\n\n### Progress Tracker\n\n### Notes' },

  // Work
  { id: 'crm', name: 'Customer Relationship Management', desc: 'Keep track of clients, follow-ups, and interactions', longDesc: 'Manage all your client relationships in one organized notebook. Track interactions, follow-up tasks, and important details for each customer. Never miss a follow-up again.', categoryLabel: 'Sales', category: ['work'], color: '#3b82f6', preview: ['Customer\'s Notebook', '', 'Customer    | Last Contact | Email                   | Owner', 'Acme Corp | Jan 14          | info@acme.com     | Jason', 'TechStart  | Jan 12          | hello@techstart  | Sarah', 'GlobalFin  | Jan 10          | contact@gfin       | Jason', '', 'Follow-up Tasks', '- [ ] Send proposal to Acme', '- [ ] Schedule demo with TechStart'], content: '## Customer Relationship Management\n\n| Customer | Last Interaction | Email | Owner |\n|----------|-----------------|-------|-------|\n|          |                 |       |       |\n\n### Follow-up Tasks\n- [ ] \n\n### Link to calendar' },
  { id: 'candidate-note', name: 'Candidate Note', desc: 'Track applicant details and interview feedback', longDesc: 'Keep detailed records for each job candidate. Track application details, interview notes, and hiring decisions. Streamline your recruitment process with structured candidate profiles.', categoryLabel: 'HR', category: ['work'], color: '#f472b6', preview: ['Full name: Jennifer Smith', 'Position: Social Media Manager', 'Applied: January 10, 2025', '', 'Application information:', '• Resume: resume_jsmith.pdf', '• LinkedIn: /in/jennifersmith', '• Portfolio: jsmith.design', '', 'Interview Notes — Round 1', '• Strong communication skills', '• 5 years experience'], content: '## Candidate Note\n\n**Full name:** ___\n**Position:** ___\n\n### Application Information\n- Resume:\n- LinkedIn:\n\n### Interview Notes\n\n### Application Review\n\n### Decision' },
  { id: 'brainstorm', name: 'Ideas Brainstorming', desc: 'Use this template to brainstorm ideas for your next project', longDesc: 'Capture and organize ideas during brainstorming sessions. Rate ideas by impact and effort, prioritize the best ones, and turn creative thinking into actionable plans.', categoryLabel: 'Creative', category: ['work'], color: '#fbbf24', preview: ['💡 Session: Product Launch Ideas', 'Date: January 16, 2025', 'Topic: Q2 Marketing Campaign', '', 'Ideas', '1. Interactive social media contest', '2. Influencer partnership program', '3. Virtual launch event', '', 'Prioritization', 'Idea              | Impact | Effort | Priority', 'Social contest | High    | Med    | ★★★★★'], content: '## Ideas Brainstorming\n\n### 💡 Session Details\n**Date:** ___\n**Topic:** ___\n\n### Ideas\n1. \n\n### Prioritization\n\n| Idea | Impact | Effort | Priority |\n|------|--------|--------|----------|\n|      |        |        |          |' },
  { id: 'pool-candidates', name: 'Pool of Candidates', desc: 'Manage your hiring pipeline with candidate tracking', longDesc: 'Manage your entire hiring pipeline for any open role. Define what you\'re looking for, track all candidates through stages, and make informed hiring decisions.', categoryLabel: 'HR', category: ['work'], color: '#14b8a6', preview: ['Role: Social Media Manager', 'Department: Marketing', 'Open since: January 1, 2025', '', 'What we\'re looking for:', '• Content creation skills', '• Data-driven mindset', '• 3+ years experience', '', 'Candidate | Status      | Interview', 'J. Smith   | Round 2    | Jan 20', 'M. Chen  | Screening | Jan 18'], content: '## Pool of Candidates\n\n**Role:** ___\n\n### What we\'re looking for\n- \n\n### Candidates\n\n| Name | Status | Interview Date | Notes |\n|------|--------|---------------|-------|\n|      |        |               |       |' },
  { id: 'characters', name: 'Create Engaging Characters', desc: 'Build detailed character profiles for creative writing', longDesc: 'Craft memorable characters with in-depth profiles. Define personality traits, motivations, background stories, and relationships. Essential for writers, game designers, and storytellers.', categoryLabel: 'Creative', category: ['work'], color: '#c084fc', preview: ['👤 Elena Vasquez', '', 'Age: 34', 'Occupation: Marine Biologist', '', 'Basic Profile:', '• Curious and adventurous', '• Afraid of failure', '• Loves the ocean', '', 'Goals & Motivations:', '• Discover new deep-sea species', '• Prove her research theory'], content: '## Character Profile\n\n**Full name:** ___\n**Age:** ___\n\n### Basic Profile\n\n### Goals & Motivations\n\n### Personality\n\n### Background Story' },
  { id: 'project-mgmt', name: 'Project Management', desc: 'Manage projects and tasks for your entire team', longDesc: 'Keep your team aligned with a comprehensive project tracker. Assign tasks, set deadlines, monitor status, and flag risks. Everything your team needs in one view.', categoryLabel: 'Management', category: ['work'], color: '#f97316', preview: ['Project Overview', '', 'Task                | Owner       | Deadline | Status', 'Brand design     | Charlotte  | Oct 1      | 🟢 Done', 'Copy review      | Marcus     | Oct 5      | 🟡 In Progress', 'Launch prep      | Team         | Oct 10    | ⬜ Not Started', '', 'Milestones', '- [x] Kickoff meeting', '- [ ] Beta release', '- [ ] Final launch'], content: '## Project Management\n\n### Project Overview\n\n| Task | Owner | Deadline | Status | Priority |\n|------|-------|----------|--------|----------|\n|      |       |          |        |          |\n\n### Milestones\n- [ ] \n\n### Risks & Issues' },
  { id: 'meeting-notes', name: 'Meeting Notes', desc: 'Share topics and capture actions with the team', longDesc: 'Never lose track of what was discussed in meetings. Capture objectives, record discussion points, assign action items, and note topics for follow-up meetings.', categoryLabel: 'Meetings', category: ['work'], color: '#6366f1', preview: ['Date: January 16, 2025 — 2:00 PM', '', 'Main Objectives:', '• Share brand identity with team', '• Review Q1 targets', '', 'Attendees: Mary, Kevin, Sarah, Tom', '', 'Discussion Points:', '1. New brand guidelines approved', '2. Q1 revenue target: $500K', '', 'Action Items:', '- [ ] Mary: send updated deck', '- [ ] Kevin: schedule follow-up'], content: '## Meeting Notes\n\n**Date and Time:** ___\n\n### Main Objectives\n1. \n\n### Attendees\n- \n\n### Discussion Points\n\n### Meeting Goals\n\n### Action Items\n- [ ] \n\n### Topics for Next Meeting' },
  { id: 'contact-info', name: 'Contact Information', desc: 'Save all your client contacts in one organized place', longDesc: 'Keep all your professional contacts organized and accessible. Store names, roles, emails, phone numbers, and notes for quick reference. Never scramble for contact details again.', categoryLabel: 'Networking', category: ['work'], color: '#0ea5e9', preview: ['Basic Information', 'Name: Michael Collins', 'Role: Operations Manager', 'Company: Collins Management', 'Email: m.collins@collinsmg.com', '', 'Communication:', '• Phone: +1 (555) 234-5678', '• Website: www.collinsmg.com', '• LinkedIn: /in/mcollins', '', 'Notes:', 'Met at TechConf 2025'], content: '## Contact Information\n\n**Name:** ___\n**Role:** ___\n**Email:** ___\n\n### Communication\n- Phone:\n- Website:\n- LinkedIn:\n\n### Notes' },
]

const categories: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: 'All templates', icon: '📋' },
  { key: 'school', label: 'School', icon: '🎓' },
  { key: 'life', label: 'Life', icon: '✅' },
  { key: 'work', label: 'Work', icon: '🔥' },
]

const exploreTags = ['Personal Planning', 'Class Notes', 'Work Organization', 'Meetings', 'Study Planning', 'Home Living', 'Hiring', 'Travel', 'Personal Well-being']

interface Props {
  onCreateFromTemplate?: (title: string, content: string) => Promise<{ data: Note | null; error: unknown } | undefined>
  onNavigate?: (page: string) => void
}

export function TemplatesPage({ onCreateFromTemplate, onNavigate }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [showGallery, setShowGallery] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const [creating, setCreating] = useState(false)

  const handleUse = async (t: Template) => {
    if (!onCreateFromTemplate || creating) return
    setCreating(true)
    try {
      const result = await onCreateFromTemplate(t.name, t.content)
      if (result?.data) {
        if (onNavigate) onNavigate('notes')
      }
    } catch (e) {
      console.error('Template creation failed:', e)
    }
    setCreating(false)
  }

  const filtered = useMemo(() => {
    let list = templates
    if (activeCategory !== 'all') list = list.filter(t => t.category.includes(activeCategory))
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(t => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) }
    return list
  }, [activeCategory, search])

  const schoolTemplates = templates.filter(t => t.category.includes('school'))
  const lifeTemplates = templates.filter(t => t.category.includes('life'))
  const workTemplates = templates.filter(t => t.category.includes('work'))

  // Initial view — "Create your own templates" CTA
  if (!showGallery && !selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#a78bfa] to-[#6366f1] flex items-center justify-center shadow-lg">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-xl bg-[#4ade80] flex items-center justify-center shadow-md">
              <FileText size={20} className="text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-text mt-2">Create your own templates</h2>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">Save any note as a template to streamline any repetitive work!</p>
          <button onClick={() => setShowGallery(true)} className="mt-6 inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline cursor-pointer group">
            Template gallery <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  // Template Detail View — Evernote split layout
  if (selectedTemplate) {
    return (
      <div className="h-full flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-bg border-b border-border px-6 py-3">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-1">
              {categories.map(c => (
                <button key={c.key} onClick={() => { setSelectedTemplate(null); setActiveCategory(c.key) }} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${activeCategory === c.key ? 'bg-bg-alt text-text border border-border shadow-sm' : 'text-text-secondary hover:text-text hover:bg-bg-alt'}`}>
                  <span className="text-sm">{c.icon}</span> {c.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => { setSearch(e.target.value); setSelectedTemplate(null) }} placeholder="Search templates" className="pl-9 pr-4 py-2 rounded-xl border border-border bg-bg-input text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary w-56 transition-all" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Breadcrumb */}
          <div className="px-8 pt-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-1.5 text-sm text-text-muted mb-6">
              <button onClick={() => setSelectedTemplate(null)} className="hover:text-text cursor-pointer transition-colors">Templates</button>
              <ChevronRight size={14} />
              <span className="text-text-secondary">{selectedTemplate.categoryLabel}</span>
              <ChevronRight size={14} />
              <span className="text-text font-medium">{selectedTemplate.name}</span>
            </div>
          </div>

          {/* Split layout */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 pb-12 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Left: Full template preview */}
              <div className="flex-1 min-w-0">
                <div className="border border-border rounded-2xl bg-bg-card overflow-hidden shadow-sm">
                  {/* Accent bar */}
                  <div className="h-1" style={{ backgroundColor: selectedTemplate.color }} />
                  <div className="p-8">
                    <h2 className="text-xl font-bold text-text mb-6">{selectedTemplate.name}</h2>
                    <div className="space-y-0.5 font-mono text-[13px] leading-relaxed text-text-secondary">
                      {selectedTemplate.preview.map((line, i) => {
                        // Render table-like lines
                        if (line.startsWith('┌') || line.startsWith('├') || line.startsWith('└') || line.startsWith('│')) {
                          return <p key={i} className="text-[11px] text-text-muted whitespace-pre">{line}</p>
                        }
                        // Headers
                        if (line.startsWith('###') || line.startsWith('##')) {
                          return <p key={i} className="font-sans font-semibold text-text text-base mt-4 mb-1">{line.replace(/^#+\s/, '')}</p>
                        }
                        // Checkboxes
                        if (line.includes('- [x]')) {
                          return <p key={i} className="flex items-center gap-2"><span className="w-4 h-4 rounded border-2 border-primary bg-primary flex items-center justify-center text-white text-[10px]">✓</span><span className="line-through text-text-muted">{line.replace('- [x] ', '')}</span></p>
                        }
                        if (line.includes('- [ ]')) {
                          return <p key={i} className="flex items-center gap-2"><span className="w-4 h-4 rounded border-2 border-border" /><span>{line.replace('- [ ] ', '')}</span></p>
                        }
                        // Bold text
                        if (line.includes('**')) {
                          const parts = line.split(/\*\*(.*?)\*\*/)
                          return <p key={i}>{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-sans font-semibold text-text">{part}</strong> : <span key={j}>{part}</span>)}</p>
                        }
                        // Table header rows
                        if (line.includes(' | ') && !line.startsWith('│')) {
                          const cells = line.split(' | ').map(c => c.trim())
                          return (
                            <div key={i} className="grid font-sans text-xs" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
                              {cells.map((cell, ci) => (
                                <div key={ci} className={`px-3 py-2 border-b border-border ${i < 3 ? 'font-semibold text-text bg-bg-alt' : 'text-text-secondary'}`}>{cell}</div>
                              ))}
                            </div>
                          )
                        }
                        // Bullet points
                        if (line.startsWith('• ') || line.startsWith('  ○ ') || line.trimStart().startsWith('• ')) {
                          const indent = line.length - line.trimStart().length
                          return <p key={i} className="font-sans" style={{ paddingLeft: `${indent * 6 + 4}px` }}>{line.trim()}</p>
                        }
                        // Emoji-prefixed sections
                        if (/^[🏔🧘🏛🍣🏠🧹🛒📝📋📎🎙💡☀✨💭🙏📅📈💪✅⬜]/.test(line.trim())) {
                          return <p key={i} className="font-sans font-medium text-text mt-3">{line}</p>
                        }
                        // Empty line
                        if (!line.trim()) return <div key={i} className="h-3" />
                        // Default
                        return <p key={i} className="font-sans">{line}</p>
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Info panel */}
              <div className="w-full lg:w-[360px] shrink-0">
                <div className="lg:sticky lg:top-24">
                  <h1 className="text-4xl font-bold text-text leading-tight">{selectedTemplate.name}</h1>
                  <p className="text-text-secondary mt-2 text-sm">{selectedTemplate.categoryLabel}</p>

                  <button onClick={() => handleUse(selectedTemplate)} disabled={creating} className="w-full mt-8 px-6 py-4 rounded-xl bg-text text-bg text-base font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center disabled:opacity-50">
                    {creating ? 'Creating...' : 'Use template →'}
                  </button>

                  <div className="mt-8">
                    <p className="text-[11px] font-bold uppercase tracking-[.15em] text-text-muted mb-3">Description</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{selectedTemplate.longDesc}</p>
                  </div>

                  <button onClick={() => setSelectedTemplate(null)} className="mt-8 flex items-center gap-2 text-sm text-text-muted hover:text-text cursor-pointer transition-colors">
                    <ArrowLeft size={14} /> Back to all templates
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Full gallery page
  return (
    <div className="h-full flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-bg border-b border-border px-6 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-1">
            {categories.map(c => (
              <button key={c.key} onClick={() => setActiveCategory(c.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${activeCategory === c.key ? 'bg-bg-alt text-text border border-border shadow-sm' : 'text-text-secondary hover:text-text hover:bg-bg-alt'}`}>
                <span className="text-sm">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates" className="pl-9 pr-4 py-2 rounded-xl border border-border bg-bg-input text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary w-56 transition-all" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {(search.trim() || activeCategory !== 'all') ? (
              <motion.div key="filtered" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-4xl font-bold text-text mb-2">
                  {activeCategory === 'all' ? 'All templates' : categories.find(c => c.key === activeCategory)?.label}
                </h1>
                {activeCategory !== 'all' && (
                  <p className="text-text-secondary mb-8">
                    {activeCategory === 'school' && 'Stay on top of your classes and achieve academic success.'}
                    {activeCategory === 'life' && 'Simplify your everyday life and improve your well-being.'}
                    {activeCategory === 'work' && 'Stay organized and productive in your professional life.'}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((t, i) => <TemplateCard key={t.id} template={t} index={i} onClick={() => setSelectedTemplate(t)} />)}
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-20 text-text-muted">
                    <p className="text-lg">No templates found</p>
                    <p className="text-sm mt-1">Try a different search term or category</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-4xl font-bold text-text mb-8">All templates</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
                  {templates.slice(0, 6).map((t, i) => <TemplateCard key={t.id} template={t} index={i} onClick={() => setSelectedTemplate(t)} />)}
                </div>

                <SectionHeader title="School" desc="Stay on top of your classes and achieve academic success." onSeeAll={() => setActiveCategory('school')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
                  {schoolTemplates.slice(0, 4).map((t, i) => <TemplateCard key={t.id} template={t} index={i} onClick={() => setSelectedTemplate(t)} />)}
                </div>

                <SectionHeader title="Life" desc="Simplify your everyday life and improve your well-being." onSeeAll={() => setActiveCategory('life')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
                  {lifeTemplates.slice(0, 4).map((t, i) => <TemplateCard key={t.id} template={t} index={i} onClick={() => setSelectedTemplate(t)} />)}
                </div>

                <SectionHeader title="Work" desc="Stay organized and productive in your professional life." onSeeAll={() => setActiveCategory('work')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
                  {workTemplates.slice(0, 4).map((t, i) => <TemplateCard key={t.id} template={t} index={i} onClick={() => setSelectedTemplate(t)} />)}
                </div>

                {/* Create your own CTA */}
                <div className="border border-border rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 mb-16 bg-bg-alt">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-bg-card to-border flex items-center justify-center shrink-0">
                    <FileText size={32} className="text-text-muted" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-text">Didn't see what you're looking for?<br />Create your own template!</h3>
                    <p className="text-sm text-text-secondary mt-1">Create the perfect template for your needs and start using it.</p>
                  </div>
                  <button onClick={() => { if (onNavigate) onNavigate('notes') }} className="px-6 py-3 rounded-xl bg-text text-bg text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0">Create template</button>
                </div>

                {/* Continue exploring */}
                <div className="mb-16">
                  <h2 className="text-2xl font-bold text-text mb-6">Continue exploring the gallery</h2>
                  <div className="flex flex-wrap gap-2">
                    {exploreTags.map(tag => (
                      <button key={tag} onClick={() => setSearch(tag.split(' ')[0])} className="px-4 py-2 rounded-full border border-border text-sm text-text-secondary hover:border-border-hover hover:text-text transition-all cursor-pointer bg-bg-card">{tag}</button>
                    ))}
                  </div>
                </div>

                <div className="text-center pb-8">
                  <button onClick={() => setShowGallery(false)} className="text-sm text-text-muted hover:text-text-secondary cursor-pointer">← Back to Templates</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, desc, onSeeAll }: { title: string; desc: string; onSeeAll: () => void }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-2xl font-bold text-text">{title}</h2>
        <p className="text-sm text-text-secondary mt-1">{desc}</p>
      </div>
      <button onClick={onSeeAll} className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-text cursor-pointer group shrink-0">
        See all <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}

function TemplateCard({ template: t, index, onClick }: { template: Template; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="border border-border rounded-xl overflow-hidden bg-bg-card hover:border-border-hover hover:shadow-lg transition-all duration-200">
        <div className="relative h-44 bg-bg-alt p-4 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: t.color }} />
          <div className="bg-bg-card rounded-lg border border-border/50 p-3 h-full overflow-hidden shadow-sm">
            <p className="text-[11px] font-semibold text-text mb-1.5 truncate">{t.name}</p>
            {t.preview.slice(0, 6).map((line, i) => (
              <p key={i} className="text-[9px] text-text-muted leading-relaxed truncate">{line || '\u00A0'}</p>
            ))}
          </div>
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5">
              <Plus size={14} /> View template
            </span>
          </div>
        </div>
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">{t.name}</h3>
        </div>
      </div>
    </motion.div>
  )
}
