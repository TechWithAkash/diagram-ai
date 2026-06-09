'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw, AlertCircle, Sparkles, BookOpen } from 'lucide-react'
import dynamic from 'next/dynamic'

// SVGEngine is loaded dynamically (client-only)
const SVGEngine = dynamic(() => import('@/components/engine/SVGEngine'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[320px]">
      <RefreshCw className="w-5 h-5 animate-spin" style={{ color: 'var(--brand)' }} />
    </div>
  )
})

// ─── Per-diagram-type Mermaid themes ──────────────────────────────────────────
const THEMES = {
  flowchart: {
    primaryColor: '#EEF2FF',
    primaryTextColor: '#312E81',
    primaryBorderColor: '#818CF8',
    lineColor: '#6366F1',
    secondaryColor: '#F0FDF4',
    tertiaryColor: '#FFF7ED',
    clusterBkg: '#F8FAFC',
    clusterBorder: '#CBD5E1',
    edgeLabelBackground: '#F8FAFC',
    titleColor: '#1E1B4B',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
  },
  erDiagram: {
    primaryColor: '#F0FDF4',
    primaryTextColor: '#14532D',
    primaryBorderColor: '#4ADE80',
    lineColor: '#16A34A',
    secondaryColor: '#DCFCE7',
    tertiaryColor: '#F7FEE7',
    edgeLabelBackground: '#F0FDF4',
    attributeBackgroundColorEven: '#F0FDF4',
    attributeBackgroundColorOdd: '#DCFCE7',
    titleColor: '#14532D',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
  },
  sequenceDiagram: {
    primaryColor: '#FFF7ED',
    primaryTextColor: '#7C2D12',
    primaryBorderColor: '#FB923C',
    lineColor: '#EA580C',
    secondaryColor: '#FEF3C7',
    actorBkg: '#FFF7ED',
    actorBorder: '#FB923C',
    actorTextColor: '#431407',
    actorLineColor: '#EA580C',
    signalColor: '#C2410C',
    signalTextColor: '#1C1917',
    noteBkgColor: '#FFFBEB',
    noteBorderColor: '#FCD34D',
    noteTextColor: '#78350F',
    activationBkgColor: '#FEF3C7',
    activationBorderColor: '#F59E0B',
    edgeLabelBackground: '#FFF7ED',
    titleColor: '#7C2D12',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
  },
  stateDiagram: {
    primaryColor: '#FDF4FF',
    primaryTextColor: '#581C87',
    primaryBorderColor: '#C084FC',
    lineColor: '#9333EA',
    secondaryColor: '#F3E8FF',
    tertiaryColor: '#FAF5FF',
    edgeLabelBackground: '#FDF4FF',
    titleColor: '#3B0764',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
  },
  graph: {
    primaryColor: '#EFF6FF',
    primaryTextColor: '#1E3A5F',
    primaryBorderColor: '#60A5FA',
    lineColor: '#2563EB',
    secondaryColor: '#F0F9FF',
    tertiaryColor: '#E0F2FE',
    clusterBkg: '#F8FAFC',
    clusterBorder: '#BFDBFE',
    edgeLabelBackground: '#EFF6FF',
    titleColor: '#1E3A5F',
    fontFamily: 'Poppins, sans-serif',
    fontSize: '13px',
  },
}

function detectType(code = '') {
  const t = code.trim().toLowerCase()
  if (t.startsWith('erdiagram'))       return 'erDiagram'
  if (t.startsWith('sequencediagram')) return 'sequenceDiagram'
  if (t.startsWith('statediagram'))    return 'stateDiagram'
  if (t.startsWith('graph'))           return 'graph'
  return 'flowchart'
}

async function initMermaid(type) {
  const mermaid = (await import('mermaid')).default
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: THEMES[type] || THEMES.flowchart,
    flowchart: { htmlLabels: true, curve: 'basis', padding: 16, nodeSpacing: 45, rankSpacing: 55, useMaxWidth: true },
    er: { diagramPadding: 16, layoutDirection: 'TB', minEntityWidth: 110, minEntityHeight: 60, useMaxWidth: true },
    sequence: { actorMargin: 60, width: 130, height: 50, boxMargin: 8, noteMargin: 8, messageMargin: 32, messageFontSize: 12, showSequenceNumbers: false, useMaxWidth: true },
    state: { padding: 12, useMaxWidth: true },
    graph: { htmlLabels: true, curve: 'basis', nodeSpacing: 45, rankSpacing: 55, useMaxWidth: true },
  })
  return mermaid
}

const NODE_PALETTE = [
  { bg: '#EEF2FF', border: '#6366F1', text: '#312E81' },
  { bg: '#F0FDF4', border: '#22C55E', text: '#14532D' },
  { bg: '#FFF7ED', border: '#F97316', text: '#7C2D12' },
  { bg: '#FDF4FF', border: '#A855F7', text: '#581C87' },
  { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A5F' },
  { bg: '#FFFBEB', border: '#F59E0B', text: '#78350F' },
  { bg: '#FFF1F2', border: '#F43F5E', text: '#881337' },
  { bg: '#F0FDFA', border: '#14B8A6', text: '#134E4A' },
]

const CLUSTER_PALETTE = [
  { bg: '#F0FDF4', border: '#86EFAC', label: '#166534' },
  { bg: '#EEF2FF', border: '#A5B4FC', label: '#3730A3' },
  { bg: '#FFF7ED', border: '#FDBA74', label: '#9A3412' },
  { bg: '#FDF4FF', border: '#E9D5FF', label: '#6B21A8' },
  { bg: '#EFF6FF', border: '#BFDBFE', label: '#1D4ED8' },
  { bg: '#FFFBEB', border: '#FDE68A', label: '#92400E' },
]

function enhanceSVG(svgEl, type) {
  if (!svgEl) return
  svgEl.style.background = 'transparent'
  svgEl.style.display    = 'block'
  svgEl.style.maxWidth   = '100%'
  svgEl.style.height     = 'auto'
  svgEl.removeAttribute('height')

  const vb = svgEl.getAttribute('viewBox')
  if (vb) {
    const parts = vb.split(/\s+|,/).map(Number)
    if (parts.length === 4 && (parts[3] === 0 || isNaN(parts[3]))) {
      svgEl.removeAttribute('viewBox')
    }
  }

  svgEl.querySelectorAll('text, tspan').forEach(el => {
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const cleaned = node.textContent.replace(/^['"]|['"]$/g, '').trim()
        if (cleaned !== node.textContent) node.textContent = cleaned
      }
    })
  })

  svgEl.querySelectorAll('.cluster').forEach((cluster, i) => {
    const c    = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length]
    const rect = cluster.querySelector('rect')
    if (rect) {
      rect.setAttribute('fill',         c.bg)
      rect.setAttribute('stroke',       c.border)
      rect.setAttribute('stroke-width', '1.5')
      rect.setAttribute('rx',           '10')
      rect.setAttribute('ry',           '10')
    }
    cluster.querySelectorAll('.cluster-label text, .cluster-label tspan').forEach(t => {
      t.setAttribute('fill', c.label)
      t.style.fontWeight = '700'
      t.style.fontSize   = '12px'
    })
  })

  if (type === 'flowchart' || type === 'graph') {
    svgEl.querySelectorAll('.node').forEach((node, i) => {
      const c = NODE_PALETTE[i % NODE_PALETTE.length]
      node.querySelectorAll('rect, circle, ellipse, polygon').forEach(shape => {
        shape.setAttribute('fill',         c.bg)
        shape.setAttribute('stroke',       c.border)
        shape.setAttribute('stroke-width', '2')
      })
      node.querySelectorAll('.nodeLabel, .label').forEach(lbl => {
        lbl.style.color      = c.text
        lbl.style.fontWeight = '500'
      })
      node.querySelectorAll('text, tspan').forEach(t => {
        t.setAttribute('fill', c.text)
        t.style.fontWeight = '500'
      })
    })
    svgEl.querySelectorAll('.edgePath path').forEach(p => {
      p.setAttribute('stroke',       '#94A3B8')
      p.setAttribute('stroke-width', '1.5')
    })
    svgEl.querySelectorAll('marker path, marker polygon').forEach(m => {
      m.setAttribute('fill', '#94A3B8')
    })
    svgEl.querySelectorAll('.edgeLabel .label rect').forEach(r => {
      r.setAttribute('fill',   '#F8FAFC')
      r.setAttribute('stroke', 'none')
    })
    svgEl.querySelectorAll('.edgeLabel text, .edgeLabel tspan').forEach(t => {
      t.setAttribute('fill', '#64748B')
      t.style.fontSize = '11px'
    })
  }
}

function constrainSVGSize(svgEl, containerEl) {
  if (!svgEl || !containerEl) return
  let naturalW = parseFloat(svgEl.getAttribute('width'))  || 800
  let naturalH = parseFloat(svgEl.getAttribute('height')) || 600
  const vb = svgEl.getAttribute('viewBox')
  if (vb) {
    const parts = vb.split(/\s+|,/).map(Number)
    if (parts.length === 4) { naturalW = parts[2] || naturalW; naturalH = parts[3] || naturalH }
  }
  const maxW = containerEl.clientWidth || 800
  const maxH = 520
  const scale = Math.min(naturalW > maxW ? maxW / naturalW : 1, naturalH > maxH ? maxH / naturalH : 1)
  if (scale < 1) { svgEl.style.width = `${naturalW * scale}px`; svgEl.style.height = `${naturalH * scale}px` }
  else           { svgEl.style.width = '100%'; svgEl.style.height = 'auto' }
  svgEl.style.maxWidth = '100%'; svgEl.style.display = 'block'; svgEl.style.margin = '0 auto'
}

// ─── Mermaid renderer (AI-generated diagrams) ─────────────────────────────────
function MermaidRenderer({ code, className = '' }) {
  const containerRef = useRef(null)
  const [status, setStatus]     = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const renderIdRef             = useRef(0)

  useEffect(() => {
    if (!code) return
    const renderId = ++renderIdRef.current
    setStatus('rendering')
    setErrorMsg('')

    async function render() {
      try {
        const type    = detectType(code)
        const mermaid = await initMermaid(type)
        await mermaid.parse(code)
        const id = `mmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const { svg } = await mermaid.render(id, code)
        if (renderId !== renderIdRef.current) return
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            enhanceSVG(svgEl, type)
            requestAnimationFrame(() => constrainSVGSize(svgEl, containerRef.current))
          }
        }
        setStatus('done')
      } catch (err) {
        if (renderId !== renderIdRef.current) return
        console.error('Mermaid render error:', err)
        setErrorMsg(err.message || 'Render failed')
        setStatus('error')
      }
    }

    render()
  }, [code])

  if (status === 'error') {
    return (
      <div className={`flex items-center justify-center min-h-[320px] ${className}`}>
        <div className="text-center max-w-sm px-6">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">Render issue</p>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            The AI generated invalid diagram syntax. Click Regenerate to try again.
          </p>
          {process.env.NODE_ENV === 'development' && errorMsg && (
            <pre className="text-xs text-red-400 bg-red-50 p-3 rounded-lg text-left overflow-auto font-mono leading-relaxed">
              {errorMsg}
            </pre>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {status === 'rendering' && (
        <div className={`flex items-center justify-center min-h-[320px] ${className}`}>
          <div className="text-center">
            <RefreshCw className="w-5 h-5 mx-auto mb-3 animate-spin" style={{ color: 'var(--brand)' }} />
            <p className="text-sm text-gray-400 font-mono">Rendering diagram…</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`
          mermaid-container w-full overflow-auto
          flex items-start justify-center
          p-6 bg-gray-50 rounded-b-xl
          ${className}
          ${status === 'done' ? 'block animate-fade-in' : 'hidden'}
        `}
        style={{ maxHeight: '580px', overflowY: 'auto' }}
      />
    </div>
  )
}

// ─── Main DiagramRenderer (router) ────────────────────────────────────────────
/**
 * Routes to SVGEngine (library) or MermaidRenderer (AI) based on `source` prop
 *
 * Props:
 *   source: 'library' | 'ai' — where the diagram came from
 *   schema: object            — for library diagrams (passed to SVGEngine)
 *   code:   string            — for AI diagrams (Mermaid code string)
 */
export default function DiagramRenderer({ source, schema, code, className = '' }) {
  // Library diagram → precision SVGEngine or Mermaid (if schema contains mermaid_code)
  if (source === 'library' && schema) {
    const isMermaid = schema.mermaid_code && (
      schema.type === 'flowchart' ||
      schema.type === 'sequenceDiagram' ||
      schema.type === 'erDiagram' ||
      schema.type === 'stateDiagram' ||
      schema.type === 'graph'
    );

    return (
      <div className="w-full">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 border-b border-emerald-100">
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-emerald-700">
            Precision Library Diagram — 100% accurate for exams
          </span>
        </div>
        {isMermaid ? (
          <MermaidRenderer code={schema.mermaid_code} className={className} />
        ) : (
          <SVGEngine schema={schema} className={className} />
        )}
      </div>
    )
  }

  // AI diagram → Mermaid.js renderer
  if (source === 'ai' && code) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 border-b border-violet-100">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-violet-700">
            AI-Generated Diagram — verify key details
          </span>
        </div>
        <MermaidRenderer code={code} className={className} />
      </div>
    )
  }

  // Fallback: legacy Mermaid-only usage
  if (code) return <MermaidRenderer code={code} className={className} />

  return null
}
