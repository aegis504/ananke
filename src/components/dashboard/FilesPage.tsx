import { useState, useCallback, useEffect } from 'react'
import { Upload, FileText, Image, FileArchive, Trash2, Download, Loader2, X, Sparkles, FileUp, Clock, HardDrive, BookOpen, Brain, Lightbulb, ClipboardList, CheckCircle2, ArrowLeft, Share2, Lock, Globe, Wand2, Copy, Check, Link2, AlertTriangle } from 'lucide-react'
import { validateFile, isValidEmail, sanitizeEmail } from '../../lib/sanitize'
import { supabase } from '../../lib/supabase'
import { useAI } from '../../hooks/useAI'
import { motion, AnimatePresence } from 'framer-motion'

interface StoredFile {
  id: string; name: string; size: number; type: string; path: string; url: string; created_at: string
}

interface QuizQuestion {
  question: string; options: string[]; correct: number; selected?: number
}

const typeIcon = (type: string, size = 20) => {
  if (type.startsWith('image/')) return <Image size={size} className="text-primary" />
  if (type.includes('zip') || type.includes('archive')) return <FileArchive size={size} className="text-warning" />
  return <FileText size={size} className="text-accent" />
}
const formatSize = (b: number) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'
const isTextFile = (type: string, name: string) => type.startsWith('text/') || /\.(txt|md|csv|json|js|ts|html|css|xml|yaml|yml|log|py|rb|sh|sql|pdf)$/i.test(name)
const isImageFile = (type: string) => type.startsWith('image/')
const displayName = (name: string) => name.replace(/^\d+_/, '')

// Parse quiz from AI response
function parseQuiz(raw: string): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  // Split by number followed by . or ) at start of line or after newline
  const blocks = raw.split(/(?:\r?\n|^)(?=\d+[\.\)])/).filter(b => b.trim())
  
  for (const block of blocks) {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 3) continue
    
    // First line is usually the question
    const qLine = lines[0].replace(/^\d+[\.\)]\s*/, '')
    const opts: string[] = []
    let correctIdx = -1
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      // Match A) Option or A. Option
      const optMatch = line.match(/^([A-D])[\.\)]\s*(.+)$/i)
      if (optMatch) {
        const optionText = optMatch[2].replace(/[\*✓✔★]|\(correct\)|\(answer\)/i, '').trim()
        opts.push(optionText)
        // Check if this line itself has a correct marker
        if (line.match(/[\*✓✔★]|\(correct\)|\(answer\)/i)) {
          correctIdx = opts.length - 1
        }
      }
      
      // Check for standalone "Answer: X" line
      const ansMatch = line.match(/^(?:Answer|Correct)\s*[:=]\s*([A-D])/i)
      if (ansMatch) {
        correctIdx = 'ABCD'.indexOf(ansMatch[1].toUpperCase())
      }
    }
    
    // If no correct answer was found, default to 0 but only if we have options
    if (correctIdx === -1 && opts.length > 0) correctIdx = 0 
    
    if (qLine && opts.length >= 2) {
      questions.push({ 
        question: qLine, 
        options: opts.slice(0, 4), // capped at 4
        correct: Math.max(0, Math.min(correctIdx, opts.length - 1))
      })
    }
  }
  return questions.slice(0, 10) // capped at 10 questions
}

export function FilesPage() {
  const [files, setFiles] = useState<StoredFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openFile, setOpenFile] = useState<StoredFile | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)
  const [aiResult, setAiResult] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  // Share state
  const [, setIsPublic] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [shareSent, setShareSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const getShareUrl = (file: StoredFile) => {
    const params = new URLSearchParams({
      id: file.id,
      path: file.path,
      name: file.name,
    })
    return `${window.location.origin}/api/share?${params.toString()}`
  }

  const copyShareLink = (file: StoredFile) => {
    const url = getShareUrl(file)
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const ai = useAI()

  useEffect(() => { loadFiles() }, [])

  const loadFiles = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.storage.from('files').list(user.id, { sortBy: { column: 'created_at', order: 'desc' } })
    if (!data) { setLoading(false); return }
    const mapped: StoredFile[] = await Promise.all(data.filter(f => f.name !== '.emptyFolderPlaceholder').map(async f => {
      const { data: urlData } = await supabase.storage.from('files').createSignedUrl(`${user.id}/${f.name}`, 3600)
      return { id: f.id || f.name, name: f.name, size: f.metadata?.size || 0, type: f.metadata?.mimetype || 'application/octet-stream', path: `${user.id}/${f.name}`, url: urlData?.signedUrl || '', created_at: f.created_at || new Date().toISOString() }
    }))
    setFiles(mapped)
    setLoading(false)
  }

  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadFiles = useCallback(async (fl: FileList) => {
    setUploading(true)
    setUploadError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }
    const errors: string[] = []
    for (const file of Array.from(fl)) {
      const validation = validateFile(file)
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`)
        continue
      }
      const { error } = await supabase.storage.from('files').upload(`${user.id}/${validation.safeName}`, file, { cacheControl: '3600', upsert: false })
      if (error) errors.push(`${file.name}: Upload failed`)
    }
    if (errors.length > 0) setUploadError(errors.join('; '))
    await loadFiles()
    setUploading(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files) }, [uploadFiles])

  const deleteFile = async (file: StoredFile) => {
    if (file.path) await supabase.storage.from('files').remove([file.path])
    setFiles(prev => prev.filter(f => f.id !== file.id))
    if (openFile?.id === file.id) setOpenFile(null)
  }

  const openFilePage = async (file: StoredFile) => {
    setOpenFile(file)
    setFileContent(null)
    setAiResult(null)
    setActiveAction(null)
    setShowQuiz(false)
    setQuizQuestions([])
    setIsPublic(false)
    if (isTextFile(file.type, file.name) && file.url) {
      setLoadingContent(true)
      try {
        const res = await fetch(file.url)
        if (res.ok) { const t = await res.text(); setFileContent(t.length > 50000 ? t.slice(0, 50000) + '\n...(truncated)' : t) }
      } catch { /* */ }
      setLoadingContent(false)
    }
  }

  const handleAI = async (action: string) => {
    if (!fileContent) return
    setAiResult(null)
    setActiveAction(action)
    setShowQuiz(false)
    const result = await ai.runAction(action, fileContent)
    if (result) {
      if (action === 'quiz') {
        const parsed = parseQuiz(result)
        if (parsed.length > 0) {
          setQuizQuestions(parsed)
          setQuizIndex(0)
          setQuizSubmitted(false)
          setQuizScore(0)
          setShowQuiz(true)
        } else {
          setAiResult(result)
        }
      } else {
        setAiResult(result)
      }
    }
  }

  const handleQuizAnswer = (optIdx: number) => {
    if (quizQuestions[quizIndex].selected !== undefined) return
    const updated = [...quizQuestions]
    updated[quizIndex] = { ...updated[quizIndex], selected: optIdx }
    setQuizQuestions(updated)
  }

  const nextQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) setQuizIndex(quizIndex + 1)
    else {
      const score = quizQuestions.filter(q => q.selected === q.correct).length
      setQuizScore(score)
      setQuizSubmitted(true)
    }
  }

  const handleShare = async () => {
    if (!shareEmail.trim() || !openFile || !isValidEmail(shareEmail.trim())) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('shared_items').insert({
      owner_id: user.id, shared_with_email: sanitizeEmail(shareEmail),
      item_type: 'note', item_id: openFile.id, item_title: displayName(openFile.name), role: 'view'
    } as never)
    setShareSent(true)
    setTimeout(() => { setShareSent(false); setShareEmail(''); setShowShare(false) }, 2000)
  }

  const aiActions = [
    { id: 'summarize', label: 'Summarize', icon: <ClipboardList size={20} />, color: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
    { id: 'quiz', label: 'Study / Quiz Me', icon: <Brain size={20} />, color: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20' },
    { id: 'explain', label: 'Explain', icon: <Lightbulb size={20} />, color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
    { id: 'keypoints', label: 'Key Points', icon: <BookOpen size={20} />, color: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
    { id: 'actionitems', label: 'Action Items', icon: <CheckCircle2 size={20} />, color: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20' },
    { id: 'improve', label: 'Improve Writing', icon: <Sparkles size={20} />, color: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20' },
    { id: 'dehumanize', label: 'Dehumanize', icon: <Wand2 size={20} />, color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
    { id: 'humanize', label: 'Humanize', icon: <Wand2 size={20} />, color: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
  ]

  // ===================== FILE DETAIL PAGE =====================
  if (openFile) {
    const cq = quizQuestions[quizIndex]
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-bg shrink-0">
          <button onClick={() => setOpenFile(null)} className="flex items-center gap-2 text-text-muted hover:text-text cursor-pointer transition-colors">
            <ArrowLeft size={20} /> <span className="text-[15px]">Back to Files</span>
          </button>
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {typeIcon(openFile.type, 24)}
            <h2 className="text-xl font-bold text-text truncate">{displayName(openFile.name)}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-bg-alt text-text-muted">
              <Lock size={13} /> Private — share to generate link
            </span>
            <button onClick={() => setShowShare(!showShare)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-[15px] font-medium hover:bg-primary-hover cursor-pointer transition-colors">
              <Share2 size={16} /> Share
            </button>
            {openFile.url && <a href={openFile.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-bg-alt transition-colors"><Download size={18} /></a>}
            <button onClick={() => { deleteFile(openFile) }} className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/5 cursor-pointer transition-colors"><Trash2 size={18} /></button>
          </div>
        </div>

        {/* Share dropdown */}
        <AnimatePresence>
          {showShare && openFile && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-border bg-bg-alt/50 overflow-hidden">
              <div className="px-6 py-4 space-y-4">
                {/* Public link */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 size={16} className="text-accent" />
                    <span className="text-[14px] font-semibold text-text">Shareable Link</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-bg-input border border-border rounded-xl px-4 py-2.5 text-[14px] text-text-muted truncate font-mono">
                      {getShareUrl(openFile).slice(0, 70)}...
                    </div>
                    <button onClick={() => copyShareLink(openFile)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-medium cursor-pointer transition-all ${copied ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primary-hover'}`}>
                      {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                    </button>
                  </div>
                  <p className="text-[13px] text-text-muted mt-2 flex items-center gap-1.5">
                    <Globe size={12} className="text-success" /> Anyone with this link can view and download this file
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Email invite */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 size={16} className="text-primary" />
                    <span className="text-[14px] font-semibold text-text">Invite by Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleShare()}
                      placeholder="Email address..." className="flex-1 rounded-xl bg-bg-input border border-border px-4 py-2.5 text-[15px] text-text focus:outline-none focus:border-primary" />
                    <button onClick={handleShare} disabled={shareSent || !shareEmail.trim()} className="px-4 py-2.5 rounded-xl bg-accent text-white text-[15px] font-medium hover:bg-accent/90 cursor-pointer disabled:opacity-50 transition-all">
                      {shareSent ? '✅ Sent!' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[900px] mx-auto py-6 px-6">
            {/* File info bar */}
            <div className="flex items-center gap-6 mb-6 text-[14px] text-text-muted">
              <span className="flex items-center gap-1.5"><HardDrive size={14} /> {formatSize(openFile.size)}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(openFile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>{openFile.type}</span>
            </div>

            {/* Image preview */}
            {isImageFile(openFile.type) && openFile.url && (
              <div className="mb-6 bg-bg-alt/30 rounded-2xl p-6 flex justify-center border border-border">
                <img src={openFile.url} alt={openFile.name} className="max-w-full max-h-[500px] rounded-xl object-contain" />
              </div>
            )}

            {/* Text content */}
            {isTextFile(openFile.type, openFile.name) && (
              <div className="mb-6">
                <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-3">📄 File Content</h3>
                {loadingContent ? (
                  <div className="flex items-center gap-3 py-12 justify-center"><Loader2 size={22} className="animate-spin text-primary" /><span className="text-base text-text-muted">Loading...</span></div>
                ) : fileContent ? (
                  <pre className="text-[14px] text-text-secondary bg-bg-card rounded-2xl p-6 overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap break-words font-mono leading-relaxed border border-border">{fileContent}</pre>
                ) : <p className="text-base text-text-muted py-6 text-center">Could not load content</p>}
              </div>
            )}

            {/* AI Tools */}
            {isTextFile(openFile.type, openFile.name) && fileContent && (
              <div className="mb-6">
                <h3 className="text-[13px] font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-accent" /> Study & AI Tools
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {aiActions.map(a => (
                    <button key={a.id} onClick={() => handleAI(a.id)} disabled={ai.loading}
                      className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center cursor-pointer transition-all disabled:opacity-40 ${activeAction === a.id ? 'ring-2 ring-accent scale-[0.98]' : ''} ${a.color}`}>
                      {a.icon}
                      <span className="text-[13px] font-semibold leading-tight">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Loading */}
            {ai.loading && (
              <div className="flex items-center gap-3 py-10 justify-center bg-accent/5 rounded-2xl border border-accent/20 mb-6">
                <Loader2 size={22} className="animate-spin text-accent" />
                <span className="text-base text-accent font-semibold">
                  {activeAction === 'quiz' ? 'Generating quiz...' : activeAction === 'summarize' ? 'Summarizing...' : activeAction === 'dehumanize' ? 'Dehumanizing text...' : activeAction === 'humanize' ? 'Humanizing text...' : 'AI is thinking...'}
                </span>
              </div>
            )}

            {/* AI Result (non-quiz) */}
            {!ai.loading && aiResult && !showQuiz && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2 text-accent">
                    <Sparkles size={14} /> {activeAction === 'dehumanize' ? '🤖 Dehumanized' : activeAction === 'humanize' ? '🧑 Humanized' : activeAction === 'summarize' ? '📋 Summary' : activeAction === 'keypoints' ? '🎯 Key Points' : activeAction === 'actionitems' ? '✅ Action Items' : '✨ Result'}
                  </span>
                  <button onClick={() => setAiResult(null)} className="text-text-muted hover:text-text cursor-pointer"><X size={16} /></button>
                </div>
                <div className="text-[15px] text-text leading-relaxed whitespace-pre-wrap bg-bg-card rounded-2xl p-6 border border-border max-h-[500px] overflow-y-auto">{aiResult}</div>
              </motion.div>
            )}
            {ai.error && <p className="text-[15px] text-danger mb-6">{ai.error}</p>}
          </div>
        </div>

        {/* ============ QUIZ POPUP ============ */}
        <AnimatePresence>
          {showQuiz && quizQuestions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
              <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

                {!quizSubmitted ? (
                  <>
                    {/* Quiz header */}
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-text flex items-center gap-2"><Brain size={20} className="text-accent" /> Study Quiz</h3>
                        <p className="text-[14px] text-text-muted">Question {quizIndex + 1} of {quizQuestions.length}</p>
                      </div>
                      <button onClick={() => setShowQuiz(false)} className="text-text-muted hover:text-text cursor-pointer p-1"><X size={20} /></button>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-border"><div className="h-1 bg-accent transition-all" style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} /></div>

                    {/* Question */}
                    <div className="p-6">
                      <p className="text-lg font-semibold text-text mb-5">{cq.question}</p>
                      <div className="space-y-2.5">
                        {cq.options.map((opt, i) => {
                          const selected = cq.selected === i
                          const answered = cq.selected !== undefined
                          const isCorrect = i === cq.correct
                          let cls = 'border-border hover:border-primary/50 hover:bg-bg-alt'
                          if (answered) {
                            if (selected && isCorrect) cls = 'border-success bg-success/10 text-success'
                            else if (selected && !isCorrect) cls = 'border-danger bg-danger/10 text-danger'
                            else if (isCorrect) cls = 'border-success bg-success/5'
                            else cls = 'border-border opacity-50'
                          }
                          return (
                            <button key={i} onClick={() => handleQuizAnswer(i)} disabled={answered}
                              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${cls}`}>
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-[14px] font-bold ${answered && isCorrect ? 'border-success bg-success text-white' : answered && selected ? 'border-danger bg-danger text-white' : 'border-border text-text-muted'}`}>
                                {'ABCD'[i]}
                              </span>
                              <span className="text-base">{opt}</span>
                              {answered && isCorrect && <CheckCircle2 size={20} className="ml-auto text-success shrink-0" />}
                              {answered && selected && !isCorrect && <X size={20} className="ml-auto text-danger shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Next button */}
                    <div className="px-6 py-4 border-t border-border">
                      <button onClick={nextQuestion} disabled={cq.selected === undefined}
                        className="w-full px-4 py-3 rounded-xl bg-accent text-white text-base font-semibold cursor-pointer hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                        {quizIndex < quizQuestions.length - 1 ? 'Next Question →' : 'See Results'}
                      </button>
                    </div>
                  </>
                ) : (
                  /* ============ RESULTS ============ */
                  <>
                    <div className="px-6 py-5 border-b border-border text-center">
                      <h3 className="text-2xl font-bold text-text">Quiz Complete! 🎉</h3>
                    </div>
                    <div className="p-6">
                      {/* Score */}
                      <div className="text-center mb-6">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${quizScore >= quizQuestions.length * 0.7 ? 'bg-success/10 text-success' : quizScore >= quizQuestions.length * 0.4 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                          {quizScore}/{quizQuestions.length}
                        </div>
                        <p className="text-base text-text-secondary mt-3">
                          {quizScore === quizQuestions.length ? 'Perfect! You nailed it!' : quizScore >= quizQuestions.length * 0.7 ? 'Great job! Almost perfect.' : quizScore >= quizQuestions.length * 0.4 ? 'Good effort! Review the missed ones.' : 'Keep studying! Review the material.'}
                        </p>
                      </div>

                      {/* Review wrong answers */}
                      {quizQuestions.filter(q => q.selected !== q.correct).length > 0 && (
                        <div>
                          <p className="text-[13px] font-bold text-danger uppercase tracking-wider mb-3">❌ Questions you got wrong:</p>
                          <div className="space-y-3 max-h-[250px] overflow-y-auto">
                            {quizQuestions.map((q, qi) => q.selected !== q.correct ? (
                              <div key={qi} className="p-4 rounded-xl bg-danger/5 border border-danger/20">
                                <p className="text-[15px] font-medium text-text mb-2">Q{qi + 1}: {q.question}</p>
                                <p className="text-[14px] text-danger">Your answer: {q.options[q.selected ?? 0]}</p>
                                <p className="text-[14px] text-success font-medium">Correct answer: {q.options[q.correct]}</p>
                              </div>
                            ) : null)}
                          </div>
                        </div>
                      )}

                      {quizQuestions.filter(q => q.selected === q.correct).length > 0 && quizQuestions.filter(q => q.selected !== q.correct).length > 0 && (
                        <div className="mt-4">
                          <p className="text-[13px] font-bold text-success uppercase tracking-wider mb-2">✅ Correct answers:</p>
                          <div className="space-y-1">
                            {quizQuestions.map((q, qi) => q.selected === q.correct ? (
                              <p key={qi} className="text-[14px] text-success px-3 py-1.5">✓ Q{qi + 1}: {q.question}</p>
                            ) : null)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-4 border-t border-border flex gap-3">
                      <button onClick={() => { setQuizIndex(0); setQuizSubmitted(false); setQuizQuestions(q => q.map(x => ({ ...x, selected: undefined }))); setQuizScore(0) }}
                        className="flex-1 px-4 py-3 rounded-xl border border-border text-base font-medium text-text cursor-pointer hover:bg-bg-alt transition-colors">
                        Retry Quiz
                      </button>
                      <button onClick={() => setShowQuiz(false)}
                        className="flex-1 px-4 py-3 rounded-xl bg-accent text-white text-base font-semibold cursor-pointer hover:bg-accent/90 transition-colors">
                        Done
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-previewable */}
        {openFile && !isImageFile(openFile.type) && !isTextFile(openFile.type, openFile.name) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileArchive size={48} className="mx-auto text-text-muted/30 mb-4" />
              <p className="text-lg text-text-muted">Preview not available</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===================== FILE LIST PAGE =====================
  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="text-[32px] font-bold text-text mb-1">Files</h1>
      <p className="text-base text-text-secondary mb-6">Upload and manage your files. Drag & drop or browse.</p>

      <div onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all ${dragging ? 'border-primary bg-primary-light scale-[1.01]' : 'border-border hover:border-border-hover'}`}>
        {uploading ? <Loader2 size={32} className="mx-auto text-primary animate-spin mb-2" /> : <Upload size={32} className="mx-auto text-text-muted/40 mb-2" />}
        <p className="text-base text-text-secondary mb-1">{uploading ? 'Uploading...' : 'Drag and drop files here'}</p>
        {uploadError && (
          <div className="flex items-center gap-2 text-[13px] text-danger bg-danger-light rounded-lg px-3 py-2 mb-3 text-left max-w-md mx-auto">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
        <p className="text-[15px] text-text-muted mb-3">or</p>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-base font-medium cursor-pointer transition-colors">
          <FileUp size={18} /> Browse files
          <input type="file" multiple className="hidden" onChange={e => e.target.files && uploadFiles(e.target.files)} />
        </label>
      </div>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={28} className="mx-auto text-primary animate-spin" /></div>
      ) : files.length === 0 ? (
        <div className="py-16 text-center border border-border rounded-2xl bg-bg-card">
          <FileText size={44} className="mx-auto text-text-muted/20 mb-3" />
          <p className="text-base text-text-muted">No files uploaded yet</p>
        </div>
      ) : (
        <div className="border border-border rounded-2xl bg-bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-3 border-b border-border bg-bg-alt/50">
            <span className="flex-1 text-[13px] font-semibold text-text-muted uppercase tracking-wider">Name</span>
            <span className="w-20 text-right text-[13px] font-semibold text-text-muted uppercase tracking-wider">Size</span>
            <span className="w-28 text-right text-[13px] font-semibold text-text-muted uppercase tracking-wider">Added</span>
            <span className="w-20" />
          </div>
          {files.map(f => (
            <div key={f.id} onClick={() => openFilePage(f)}
              className="flex items-center gap-4 px-5 py-4 border-b border-border/50 last:border-0 group transition-colors cursor-pointer hover:bg-bg-alt/40">
              <div className="w-10 h-10 rounded-xl bg-bg-alt flex items-center justify-center shrink-0">{typeIcon(f.type, 22)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-base text-text font-medium truncate">{displayName(f.name)}</p>
                <p className="text-[13px] text-text-muted">{f.type}</p>
              </div>
              <span className="w-20 text-right text-[15px] text-text-muted">{formatSize(f.size)}</span>
              <span className="w-28 text-right text-[15px] text-text-muted">{new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <div className="w-20 flex justify-end gap-1.5">
                <button onClick={e => { e.stopPropagation(); deleteFile(f) }} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
