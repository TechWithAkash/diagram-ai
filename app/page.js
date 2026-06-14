'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Sparkles, Copy, Download, RefreshCw, ChevronRight,
  BookOpen, Code2, Network, Clock, Cpu, DollarSign,
  AlertCircle, History, Zap, Check, Share2,
  Brain, Ruler, Settings, Target, Package, Lightbulb,
  FlaskConical, Library
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useGenerateDiagram } from '@/lib/useGenerateDiagram'
import { useHistory } from '@/lib/useHistory'
import {
  QUICK_PROMPTS, DIAGRAM_TYPE_LABELS, COMPLEXITY_VARIANT,
  downloadSVG, copyToClipboard
} from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'

// Dynamically import DiagramRenderer (uses browser APIs)
const DiagramRenderer = dynamic(
  () => import('@/components/diagram/DiagramRenderer'),
  { ssr: false, loading: () => <div className="flex items-center justify-center min-h-[280px] text-sm text-gray-400">Loading renderer…</div> }
)

// ─── Loading state steps ──────────────────────────────────────────────────────
const LOADING_STEPS = [
  { icon: Brain,    text: 'Analyzing subject…'       },
  { icon: Library,  text: 'Checking diagram library…'},
  { icon: Ruler,    text: 'Choosing diagram type…'   },
  { icon: Sparkles, text: 'Finishing up…'            },
]

// ─── Tabs config ──────────────────────────────────────────────────────────────
const RESULT_TABS = [
  { id: 'diagram', label: 'Diagram', icon: Network  },
  { id: 'theory',  label: 'Theory',  icon: BookOpen },
  { id: 'code',    label: 'Code',    icon: Code2    },
]

export default function HomePage() {
  const [prompt, setPrompt]         = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [loadStep, setLoadStep]     = useState(0)
  const [lastPrompt, setLastPrompt] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('idle') // idle | loading | success | error
  const diagramRef                  = useRef(null)
  const textareaRef                 = useRef(null)
  const stepTimerRef                = useRef(null)

  const { status, data, error, meta, generate, reset } = useGenerateDiagram()
  const { history, addToHistory } = useHistory()

  const isLibrary = data?.source === 'library'
  const isStub    = data?.source === 'library-stub'
  const isAI      = data?.source === 'ai'
  const isSvgEngine = !!(data?.schema && (
    isLibrary ||
    isStub ||
    ['circuit-schematic', 'uml-diagram', 'dfd-flow', 'block-diagram', 'layered-stack', 'sequential-flow', 'state-machine', 'sequence', 'tree', 'graph', 'table', '8086-custom', '8085-custom', 'logic-diagram', 'chip-diagram'].includes(data.schema.type || data.diagram_type)
  ))

  const [isEmbed, setIsEmbed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      const embed = params.get('embed') === 'true'
      setIsEmbed(embed)
      if (id) {
        setPrompt(id)
        generate(id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [department, setDepartment] = useState('')
  const [semester, setSemester] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDepartment(localStorage.getItem('mu-selected-dept') || '')
      setSemester(localStorage.getItem('mu-selected-sem') || '')
    }
  }, [])

  const handleDeptChange = (val) => {
    setDepartment(val)
    localStorage.setItem('mu-selected-dept', val)
  }

  const handleSemChange = (val) => {
    setSemester(val)
    localStorage.setItem('mu-selected-sem', val)
  }

  // ── Animate loading steps ──────────────────────────────────────────────────
  const startLoadingAnimation = useCallback(() => {
    setLoadStep(0)
    let step = 0
    stepTimerRef.current = setInterval(() => {
      step++
      if (step >= LOADING_STEPS.length) {
        clearInterval(stepTimerRef.current)
      } else {
        setLoadStep(step)
      }
    }, 550)
  }, [])

  // ── Generate (default or forceAI) ─────────────────────────────────────────
  const handleGenerate = useCallback(async (customPrompt, options = {}) => {
    const p = customPrompt || prompt
    if (!p.trim()) {
      textareaRef.current?.focus()
      return
    }
    setLastPrompt(p)
    startLoadingAnimation()
    setVerificationStatus('idle')
    const result = await generate(p, {
      department,
      semester,
      ...options
    })
    if (result) addToHistory(p, result)
    clearInterval(stepTimerRef.current)
  }, [prompt, generate, addToHistory, startLoadingAnimation, department, semester])

  const handleRequestVerification = useCallback(async () => {
    setVerificationStatus('loading')
    try {
      const res = await fetch('/api/verify-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: lastPrompt || prompt
        })
      })
      if (res.ok) {
        setVerificationStatus('success')
      } else {
        setVerificationStatus('error')
      }
    } catch (e) {
      console.error('Failed to submit verification request:', e)
      setVerificationStatus('error')
    }
  }, [lastPrompt, prompt])

  const handleForceAI = useCallback(() => {
    handleGenerate(lastPrompt || prompt, { forceAI: true })
  }, [lastPrompt, prompt, handleGenerate])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }, [handleGenerate])

  const handleCopyCode = useCallback(async () => {
    const text = isSvgEngine
      ? (data?.schema ? JSON.stringify(data.schema, null, 2) : '')
      : (data?.mermaid_code || '')
    if (!text) return
    await copyToClipboard(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 1800)
  }, [data, isSvgEngine])

  const handleDownload = useCallback(() => {
    downloadSVG(diagramRef.current, `${data?.title || 'diagram'}.svg`)
  }, [data])

  if (isEmbed) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center p-0 overflow-hidden">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-8 h-8 rounded-full border-2 border-gray-100 border-t-[var(--brand)] animate-spin mb-2" />
            <span className="text-xs text-gray-400">Loading diagram…</span>
          </div>
        )}
        {status === 'error' && (
          <div className="p-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg">
            Error: {error}
          </div>
        )}
        {status === 'success' && data && (
          <div ref={diagramRef} className="w-full h-full flex items-center justify-center overflow-hidden">
            <DiagramRenderer
              source={data.source}
              schema={data.schema}
              code={data.mermaid_code}
              useFallback={data.useFallback}
              fallbackJson={data.fallback_json}
              isParameterized={data.isParameterized}
              verificationFailed={data.verificationFailed}
              lintErrors={data.lintErrors}
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-display">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <Network className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">DiagramAI</span>
            <Badge variant="brand">beta</Badge>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={department}
              onChange={e => handleDeptChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1 outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]/10"
            >
              <option value="">All Departments</option>
              <option value="fe">FE (First Year)</option>
              <option value="cmpn">CMPN (Computer)</option>
              <option value="it">IT (Information Tech)</option>
              <option value="extc">EXTC (Electronics)</option>
              <option value="electrical">Electrical</option>
              <option value="mechanical">Mechanical</option>
            </select>
            <select
              value={semester}
              onChange={e => handleSemChange(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1 outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]/10"
            >
              <option value="">All Semesters</option>
              <option value="sem1">Sem I</option>
              <option value="sem2">Sem II</option>
              <option value="sem3">Sem III</option>
              <option value="sem4">Sem IV</option>
              <option value="sem5">Sem V</option>
              <option value="sem6">Sem VI</option>
              <option value="sem7">Sem VII</option>
              <option value="sem8">Sem VIII</option>
            </select>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-mono ml-1.5">
              <span>·</span>
              <span className="font-medium text-gray-600">Groq</span>
              <span>·</span>
              <span className="font-medium text-gray-600">SVGEngine</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        {status === 'idle' && !data && (
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Generate any technical diagram
            </h1>
            <p className="text-gray-400 text-base max-w-lg mx-auto">
              Enter any engineering subject or concept — get a precise, exam-ready diagram with theory instantly.
              8086, OSI model, Waterfall, TCP handshake &amp; more from our accuracy library.
            </p>
          </div>
        )}

        {/* ── Input zone ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-4">
            <div className="flex gap-3 items-start">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 8086 microprocessor architecture, OSI model, waterfall model, TCP handshake, process life cycle…"
                rows={2}
                className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]/20 transition-all font-display leading-relaxed"
                style={{ minHeight: 44 }}
              />
              <Button
                onClick={() => handleGenerate()}
                disabled={status === 'loading' || !prompt.trim()}
                loading={status === 'loading'}
                size="md"
                className="shrink-0 mt-0.5"
              >
                {status !== 'loading' && <Sparkles className="w-4 h-4" />}
                {status === 'loading' ? 'Generating…' : 'Generate'}
              </Button>
            </div>

            {/* Quick prompts — updated to include library diagrams */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {[
                { label: '8086 Architecture', prompt: '8086 microprocessor architecture', icon: Cpu },
                { label: '8085 Architecture', prompt: '8085 microprocessor architecture', icon: Cpu },
                { label: 'OSI Model',         prompt: 'OSI model 7 layers',               icon: Network },
                { label: 'Waterfall Model',   prompt: 'waterfall model SDLC',              icon: Settings },
                { label: 'Process Life Cycle',prompt: 'process life cycle states OS',      icon: RefreshCw },
                { label: 'TCP Handshake',     prompt: 'TCP three way handshake',           icon: Share2 },
                { label: 'Series RLC Circuit', prompt: 'ac series rlc circuit schematic', icon: Zap },
                { label: 'Zener Regulator',   prompt: 'zener voltage regulator circuit',  icon: Zap },
                { label: 'Thevenin Circuit',  prompt: 'thevenins equivalent circuit',     icon: Zap },
                { label: 'BJT as Switch',     prompt: 'bjt switch circuit',               icon: Zap },
                { label: 'Star-Delta Conversion', prompt: 'star delta conversion',        icon: Zap },
                { label: 'Colpitts Oscillator', prompt: 'colpitts oscillator circuit schematic', icon: Zap },
                { label: 'Hartley Oscillator', prompt: 'hartley oscillator circuit schematic', icon: Zap },
                { label: 'Wien Bridge Osc',   prompt: 'wien bridge oscillator circuit schematic', icon: Zap },
                { label: 'RC Phase Shift Osc', prompt: 'rc phase shift oscillator circuit schematic', icon: Zap },
                { label: 'Astable Multivibrator', prompt: 'astable multivibrator circuit using bjt', icon: Zap },
                { label: 'Op-Amp Integrator', prompt: 'opamp integrator circuit schematic', icon: Zap },
                { label: 'Op-Amp Differentiator', prompt: 'opamp differentiator circuit schematic', icon: Zap },
                { label: 'Differential Amp',  prompt: 'bjt differential amplifier circuit', icon: Zap },
                { label: 'Instrumentation Amp', prompt: 'opamp instrumentation amplifier circuit', icon: Zap },
                { label: 'Push-Pull Amplifier', prompt: 'class b push pull power amplifier', icon: Zap },
              ].map(q => {
                const IconComponent = q.icon
                return (
                  <button
                    key={q.label}
                    onClick={() => { setPrompt(q.prompt); handleGenerate(q.prompt) }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-gray-50 border border-gray-200 text-gray-500 hover:border-[var(--brand)] hover:text-[var(--brand)] hover:bg-[#EEEDFE] transition-all duration-150"
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{q.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>



        {/* ── Loading state ──────────────────────────────────────────────────── */}
        {status === 'loading' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center animate-fade-in">
            <div className="w-10 h-10 rounded-full border-2 border-gray-100 border-t-[var(--brand)] animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-6">Generating your diagram…</p>
            <div className="flex flex-col gap-2.5 max-w-xs mx-auto text-left">
              {LOADING_STEPS.map((step, i) => {
                const IconComponent = step.icon
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= loadStep ? 'text-gray-700' : 'text-gray-300'}`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{step.text}</span>
                    {i < loadStep && <Check className="w-3.5 h-3.5 text-green-500 ml-auto" />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Error state ────────────────────────────────────────────────────── */}
        {status === 'error' && error && (
          <div>
            {(error.includes('SCHEMATIC_LINT_ERROR') || /circuit|rectifier|op.?amp|thevenin|norton|amplifier|filter|oscillator|latch|flip.?flop|gate/i.test(lastPrompt || prompt)) ? (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 shadow-sm animate-fade-in">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-amber-900">
                        Accuracy Verification Failed
                      </h3>
                      <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                        This circuit diagram could not be verified for 100% technical accuracy. Our topological validator detected connection anomalies (such as floating pins, missing grounds, or potential short circuits) that violate strict exam standards.
                      </p>
                    </div>

                    {error.includes('SCHEMATIC_LINT_ERROR') && (
                      <div className="bg-white/80 rounded-xl p-4 border border-amber-200/40 space-y-2">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                          Validation Reports:
                        </span>
                        <ul className="space-y-1.5">
                          {error.replace('SCHEMATIC_LINT_ERROR: ', '').split('; ').map((err, idx) => (
                            <li key={idx} className="text-xs text-amber-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <span>{err}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {verificationStatus === 'success' ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                          <Check className="w-4 h-4" />
                          <span>Verification request submitted! Our team will review this diagram.</span>
                        </div>
                      ) : (
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={handleRequestVerification}
                          disabled={verificationStatus === 'loading'}
                          loading={verificationStatus === 'loading'}
                        >
                          Request Verification
                        </Button>
                      )}
                      
                      <Button variant="secondary" size="sm" onClick={reset}>
                        <RefreshCw className="w-3.5 h-3.5" /> Try a different prompt
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3 items-start animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 mb-0.5">Generation failed</p>
                  <p className="text-sm text-red-500">{error}</p>
                  <Button variant="secondary" size="sm" className="mt-3" onClick={reset}>
                    <RefreshCw className="w-3.5 h-3.5" /> Try again
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Result ─────────────────────────────────────────────────────────── */}
        {status === 'success' && data && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">

            {/* Result header */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Network className="w-4 h-4 shrink-0" style={{ color: 'var(--brand)' }} />
                <span className="text-sm font-medium text-gray-900 truncate">{data.title}</span>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* trust badges */}
                  {data?.verificationFailed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      <AlertCircle className="w-2.5 h-2.5" /> VERIFICATION FAILED
                    </span>
                  ) : data?.isParameterized ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      <Library className="w-2.5 h-2.5" /> PARAMETERIZED EXAM DIAGRAM
                    </span>
                  ) : (isLibrary || isStub) ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      <Library className="w-2.5 h-2.5" /> EXAM READY
                    </span>
                  ) : isAI ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      <Cpu className="w-2.5 h-2.5" /> AI VERIFIED
                    </span>
                  ) : null}
                  {data.diagram_type && (
                    <Badge variant="brand">{DIAGRAM_TYPE_LABELS[data.diagram_type] || data.diagram_type}</Badge>
                  )}
                  {data.complexity && (
                    <Badge variant={COMPLEXITY_VARIANT[data.complexity] || 'gray'}>{data.complexity}</Badge>
                  )}
                  {data.subject_category && (
                    <Badge variant="gray" className="hidden sm:inline-flex">{data.subject_category}</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Try AI instead — only shown for library results */}
                {isLibrary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleForceAI}
                    title="Generate with AI instead"
                    className="text-violet-600 hover:text-violet-700 hidden sm:flex"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    Try AI
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleCopyCode} title="Copy code / schema">
                  {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download SVG">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleGenerate()}>
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </Button>
              </div>
            </div>

            {/* ── Exam Tip callout (library only) ────────────────────────────── */}
            {(isLibrary || isStub) && data.examTip && (
              <div className="mx-5 mt-4 mb-0 flex gap-2.5 items-start bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-0.5 uppercase tracking-wide">Exam Tip</p>
                  <p className="text-xs text-amber-700 leading-relaxed">{data.examTip}</p>
                </div>
              </div>
            )}

            {/* ── Assumed Values Alert ────────────────────────────────────────── */}
            {data.assumedValues && data.assumedValues.length > 0 && (
              <div className="mx-5 mt-4 mb-0 flex gap-2.5 items-start bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 animate-fade-in">
                <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-0.5 uppercase tracking-wide">Assumed Textbook Parameters</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {data.assumedValues.map((val, idx) => (
                      <li key={idx} className="text-xs text-blue-700 leading-relaxed">
                        {val}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs tabs={RESULT_TABS} defaultTab="diagram">
              {(tabId) => {
                if (tabId === 'diagram') return (
                  <div ref={diagramRef}>
                    <DiagramRenderer
                      source={data.source}
                      schema={data.schema}
                      code={data.mermaid_code}
                      useFallback={data.useFallback}
                      fallbackJson={data.fallback_json}
                      isParameterized={data.isParameterized}
                      verificationFailed={data.verificationFailed}
                      lintErrors={data.lintErrors}
                      className="w-full"
                    />
                  </div>
                )

                if (tabId === 'theory') return (
                  <div className="p-5 space-y-5">
                    {/* Theory text — rendered as formatted markdown */}
                    <TheoryRenderer content={data.theory} />

                    {/* Key Points */}
                    {data.key_points?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Key Points</h3>
                        <ul className="space-y-2">
                          {data.key_points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: 'var(--brand)' }} />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Use Cases */}
                    {data.use_cases?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Use Cases</h3>
                        <div className="flex flex-wrap gap-2">
                          {data.use_cases.map((uc, i) => (
                            <span key={i} className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">{uc}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Try AI for this topic (library only) */}
                    {isLibrary && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">Want an AI-generated diagram instead?</p>
                        <Button variant="secondary" size="sm" onClick={handleForceAI}>
                          <FlaskConical className="w-3.5 h-3.5" /> Generate with AI
                        </Button>
                      </div>
                    )}
                  </div>
                )

                if (tabId === 'code') return (
                  <div className="p-5">
                    {isSvgEngine ? (
                      /* SVG Engine: show JSON schema */
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400 font-mono">JSON diagram schema (SVGEngine)</span>
                          <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                            {copiedCode ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                          </Button>
                        </div>
                        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-x-auto leading-relaxed custom-scroll whitespace-pre max-h-[400px] overflow-y-auto">
                          {JSON.stringify(data.schema, null, 2)}
                        </pre>
                        <p className="text-xs text-gray-400 mt-3">
                          This is the precision diagram definition — rendered by SVGEngine.
                        </p>
                      </>
                    ) : (
                      /* AI / Mermaid: show Mermaid code */
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400 font-mono">mermaid.js syntax</span>
                          <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                            {copiedCode ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                          </Button>
                        </div>
                        <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-x-auto leading-relaxed custom-scroll whitespace-pre">
                          {data.mermaid_code}
                        </pre>
                        <p className="text-xs text-gray-400 mt-3">
                          Paste this code into <a href="https://mermaid.live" target="_blank" rel="noopener" className="underline hover:text-gray-600">mermaid.live</a> to edit interactively.
                        </p>
                      </>
                    )}
                  </div>
                )

                return null
              }}
            </Tabs>

            {/* Meta footer */}
            <div className="px-5 py-2.5 border-t border-gray-100 flex flex-wrap gap-4 bg-gray-50/50">
              <MetaPill icon={Clock}   label="Just now" />
              <MetaPill
                icon={isLibrary ? Library : isStub ? Library : Cpu}
                label={isLibrary ? 'Static Library' : isStub ? 'Syllabus + AI Layout' : (meta?.model || 'Groq · Llama')}
                className={isLibrary ? 'text-emerald-500' : isStub ? 'text-indigo-500' : ''}
              />
              <MetaPill
                icon={isLibrary ? Network : Zap}
                label={isLibrary ? 'SVGEngine' : 'Mermaid.js'}
              />
              <MetaPill
                icon={DollarSign}
                label={isLibrary ? '$0.000 cost' : '~$0.0001 cost'}
                className={isLibrary ? 'text-emerald-500 font-bold' : ''}
              />
              {meta?.usedFallback && (
                <MetaPill icon={Share2} label="via OpenRouter" className="text-amber-500" />
              )}
            </div>
          </div>
        )}

        {/* ── History ────────────────────────────────────────────────────────── */}
        {history.length > 1 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Recent</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {history.slice(1).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setPrompt(item.prompt)
                    handleGenerate(item.prompt)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white border border-gray-200 text-gray-500 hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all max-w-[200px]"
                >
                  <ChevronRight className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state features ───────────────────────────────────────────── */}
        {status === 'idle' && !data && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
            {[
              { icon: Library,  title: 'Precision Library',   desc: '15+ standardised diagrams: 8086, 8085, OSI, Waterfall, TCP and more — rendered with 100% accuracy' },
              { icon: Sparkles, title: 'AI Fallback',         desc: 'Topics not in the library are generated instantly by Groq Llama — still beautiful, just AI-powered' },
              { icon: Package,  title: 'Export ready',        desc: 'Download as SVG or copy the schema / Mermaid code to use anywhere' },
            ].map(f => {
              const IconComponent = f.icon
              return (
                <div key={f.title} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mb-3" style={{ color: 'var(--brand)' }}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        )}

      </main>
    </div>
  )
}

// ─── Small helper ─────────────────────────────────────────────────────────────
function MetaPill({ icon: Icon, label, className = '' }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs text-gray-400 font-mono ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// ─── Lightweight Markdown Renderer ────────────────────────────────────────────
// Renders: ### h3, #### h4, **bold**, * bullet lists, $formula$ inline
function TheoryRenderer({ content }) {
  if (!content) return null

  // Render inline fragments: **bold** and $formula$
  function renderInline(text) {
    const parts = []
    // Split on **bold** or $formula$
    const regex = /(\*\*(.+?)\*\*|\$([^$]+)\$)/g
    let last = 0
    let m
    let key = 0
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(<span key={key++}>{text.slice(last, m.index)}</span>)
      if (m[0].startsWith('**')) {
        parts.push(<strong key={key++} className="font-semibold text-gray-800">{m[2]}</strong>)
      } else {
        // $formula$ — display inline in monospace
        parts.push(
          <code key={key++} className="font-mono text-[11px] bg-gray-100 text-violet-700 px-1.5 py-0.5 rounded mx-0.5">{m[3]}</code>
        )
      }
      last = m.index + m[0].length
    }
    if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>)
    return parts
  }

  const lines = content.split('\n')
  const elements = []
  let bulletBuffer = []
  let elKey = 0

  function flushBullets() {
    if (bulletBuffer.length === 0) return
    elements.push(
      <ul key={elKey++} className="list-none space-y-1.5 ml-1 my-1">
        {bulletBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-violet-400" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    )
    bulletBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // h4: #### …
    if (line.startsWith('#### ')) {
      flushBullets()
      elements.push(
        <h4 key={elKey++} className="text-sm font-bold text-gray-800 mt-4 mb-1">
          {renderInline(line.slice(5))}
        </h4>
      )
    }
    // h3: ### …
    else if (line.startsWith('### ')) {
      flushBullets()
      elements.push(
        <h3 key={elKey++} className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-5 mb-2 border-t border-gray-100 pt-3">
          {renderInline(line.slice(4))}
        </h3>
      )
    }
    // bullet: * … or - …
    else if (/^[*\-] /.test(line)) {
      bulletBuffer.push(line.slice(2).trim())
    }
    // blank line
    else if (line.trim() === '') {
      flushBullets()
      elements.push(<div key={elKey++} className="h-1" />)
    }
    // plain paragraph
    else {
      flushBullets()
      elements.push(
        <p key={elKey++} className="text-sm text-gray-600 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
  }
  flushBullets()

  return <div className="space-y-0.5">{elements}</div>
}
