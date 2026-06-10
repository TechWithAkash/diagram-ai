'use client'

import { useEffect, useRef, useState } from 'react'
import {
  RefreshCw, AlertCircle, Sparkles, BookOpen,
  Layers, GitFork, Terminal, Database, HelpCircle,
  ArrowRight, Activity
} from 'lucide-react'
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
    flowchart: { htmlLabels: false, curve: 'basis', padding: 32, nodeSpacing: 45, rankSpacing: 55, useMaxWidth: true },
    er: { diagramPadding: 32, layoutDirection: 'TB', minEntityWidth: 110, minEntityHeight: 60, useMaxWidth: true },
    sequence: { actorMargin: 60, width: 130, height: 50, boxMargin: 8, noteMargin: 8, messageMargin: 32, messageFontSize: 12, showSequenceNumbers: false, useMaxWidth: true },
    state: { padding: 24, useMaxWidth: true },
    graph: { htmlLabels: false, curve: 'basis', nodeSpacing: 45, rankSpacing: 55, useMaxWidth: true },
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
    cluster.querySelectorAll('text, tspan').forEach(t => {
      const isSubgraphLabel = (t.closest('.cluster-label') || t.closest('.cluster')) && !t.closest('.node');
      if (isSubgraphLabel) {
        t.setAttribute('fill', c.label)
        t.style.fontWeight = '700'
        t.style.fontSize   = '13px'
        t.setAttribute('dy', '0.4em')
      }
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

// ─── Fallback Parser & Renderer (premium HTML/CSS visualization) ─────────────

function parseFallbackJsonFromMermaid(code) {
  const nodes = []
  const edges = []
  const nodeMap = new Map()

  if (!code) return { nodes, edges }

  const lines = code.split('\n')
  const lowerCode = code.trim().toLowerCase()
  const isSequence = lowerCode.includes('sequencediagram')
  const isER = lowerCode.includes('erdiagram')

  if (isSequence) {
    for (let line of lines) {
      line = line.trim()
      if (!line || line.startsWith('%%') || line.toLowerCase().startsWith('sequencediagram')) continue

      const partMatch = line.match(/^participant\s+([a-zA-Z0-9_]+)(?:\s+as\s+"([^"]+)")?/i)
      if (partMatch) {
        const id = partMatch[1]
        const label = partMatch[2] || id
        nodeMap.set(id, { id, label, type: 'terminal' })
        continue
      }

      const colonIndex = line.indexOf(':')
      if (colonIndex !== -1) {
        const left = line.slice(0, colonIndex).trim()
        const right = line.slice(colonIndex + 1).trim()
        
        const arrowMatch = left.match(/^([a-zA-Z0-9_]+)\s*(?:-[-a-zA-Z0-9>>+x#()]*>|-[a-zA-Z0-9+x#()]*|--?>>|--?>|--?x|--?\))\s*([a-zA-Z0-9_]+)/)
        if (arrowMatch) {
          const from = arrowMatch[1]
          const to = arrowMatch[2]
          const label = right.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim()
          
          edges.push({ from, to, label })
          if (!nodeMap.has(from)) nodeMap.set(from, { id: from, label: from, type: 'terminal' })
          if (!nodeMap.has(to)) nodeMap.set(to, { id: to, label: to, type: 'terminal' })
        }
      }
    }
  } else if (isER) {
    for (let line of lines) {
      line = line.trim()
      if (!line || line.startsWith('%%') || line.toLowerCase().startsWith('erdiagram')) continue

      if (line.endsWith('{') && !line.includes('--') && !line.includes('..')) {
        const entNameMatch = line.match(/^([a-zA-Z0-9_]+)\s*\{/)
        if (entNameMatch) {
          const id = entNameMatch[1]
          if (!nodeMap.has(id)) nodeMap.set(id, { id, label: id.replace(/_/g, ' '), type: 'rectangle' })
        }
        continue
      }

      const colonIndex = line.indexOf(':')
      if (colonIndex !== -1) {
        const left = line.slice(0, colonIndex).trim()
        const right = line.slice(colonIndex + 1).trim()
        
        const relMatch = left.match(/^([a-zA-Z0-9_]+)\s*(?:[|o{}]{2}[-.]+[|o{}]{2}|[-.]+)\s*([a-zA-Z0-9_]+)/)
        if (relMatch) {
          const from = relMatch[1]
          const to = relMatch[2]
          const label = right.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim()

          edges.push({ from, to, label })
          if (!nodeMap.has(from)) nodeMap.set(from, { id: from, label: from.replace(/_/g, ' '), type: 'rectangle' })
          if (!nodeMap.has(to)) nodeMap.set(to, { id: to, label: to.replace(/_/g, ' '), type: 'rectangle' })
        }
      } else {
        const word = line.trim()
        if (word && !word.includes('{') && !word.includes('}') && !word.includes('"') && !word.includes('\'') && !word.includes(' ') && !['erdiagram', 'title', 'diagram_type'].includes(word.toLowerCase())) {
          nodeMap.set(word, { id: word, label: word.replace(/_/g, ' '), type: 'rectangle' })
        }
      }
    }
  } else {
    for (let line of lines) {
      line = line.trim()
      if (!line || line.startsWith('%%') || line.toLowerCase().startsWith('flowchart') || line.toLowerCase().startsWith('graph') || line.toLowerCase().startsWith('direction')) {
        continue
      }
      if (line.toLowerCase().startsWith('subgraph')) continue
      if (line.toLowerCase() === 'end') continue
      if (line.toLowerCase().startsWith('style ') || line.toLowerCase().startsWith('class ') || line.toLowerCase().startsWith('click ') || line.toLowerCase().startsWith('linkstyle ')) {
        continue
      }

      const parts = line.split(/(\s*(?:-+\.?-*>|==+>|-{2,}|-+\.-+)\s*(?:\|[^|]+\|\s*)?)/)
      if (parts.length > 1) {
        let prevNodeId = null
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()
          if (!part) continue
          
          if (i % 2 === 1) continue

          const nodeMatch = part.match(/^([a-zA-Z0-9_-]+)(?:\s*(?:\["([^"]+)"\]|\("([^"]+)"\)|\{"([^"]+)"\}|\[\/([^/]+)\/\]|\(\(([^)]+)\)\)|\[([^\]]+)\]))?/);
          if (nodeMatch) {
            const id = nodeMatch[1].trim()
            let label = id
            let type = 'rectangle'

            if (nodeMatch[2]) { label = nodeMatch[2]; type = 'rectangle'; }
            else if (nodeMatch[3]) { label = nodeMatch[3]; type = 'process'; }
            else if (nodeMatch[4]) { label = nodeMatch[4]; type = 'decision'; }
            else if (nodeMatch[5]) { label = nodeMatch[5]; type = 'input_output'; }
            else if (nodeMatch[6]) { label = nodeMatch[6]; type = 'terminal'; }
            else if (nodeMatch[7]) { label = nodeMatch[7]; type = 'rectangle'; }

            if (!nodeMap.has(id)) {
              nodeMap.set(id, { id, label, type })
            } else if (label !== id) {
              const existing = nodeMap.get(id)
              existing.label = label
              existing.type = type
            }

            if (prevNodeId) {
              const arrowPart = parts[i - 1]
              let edgeLabel = ''
              if (arrowPart) {
                const labelMatch = arrowPart.match(/\|([^|]+)\|/)
                if (labelMatch) {
                  edgeLabel = labelMatch[1].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')
                }
              }
              edges.push({ from: prevNodeId, to: id, label: edgeLabel })
            }
            prevNodeId = id
          }
        }
      } else {
        const nodeMatch = line.match(/^([a-zA-Z0-9_-]+)(?:\s*(?:\["([^"]+)"\]|\("([^"]+)"\)|\{"([^"]+)"\}|\[\/([^/]+)\/\]|\(\(([^)]+)\)\)|\[([^\]]+)\]))/);
        if (nodeMatch) {
          const id = nodeMatch[1].trim()
          let label = id
          let type = 'rectangle'

          if (nodeMatch[2]) { label = nodeMatch[2]; type = 'rectangle'; }
          else if (nodeMatch[3]) { label = nodeMatch[3]; type = 'process'; }
          else if (nodeMatch[4]) { label = nodeMatch[4]; type = 'decision'; }
          else if (nodeMatch[5]) { label = nodeMatch[5]; type = 'input_output'; }
          else if (nodeMatch[6]) { label = nodeMatch[6]; type = 'terminal'; }
          else if (nodeMatch[7]) { label = nodeMatch[7]; type = 'rectangle'; }

          nodeMap.set(id, { id, label, type })
        }
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges
  }
}

const getNodeTypeConfig = (type) => {
  const t = (type || 'rectangle').toLowerCase()
  if (t === 'decision' || t === 'choice') {
    return {
      bg: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
      border: 'border-amber-200 hover:border-amber-400 dark:border-amber-900/50 dark:hover:border-amber-700',
      glow: 'shadow-amber-100 dark:shadow-amber-900/20',
      text: 'text-amber-900 dark:text-amber-200',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      icon: GitFork,
      label: 'Decision'
    }
  }
  if (t === 'terminal' || t === 'circle' || t === 'ellipse') {
    return {
      bg: 'from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20',
      border: 'border-rose-200 hover:border-rose-400 dark:border-rose-900/50 dark:hover:border-rose-700',
      glow: 'shadow-rose-100 dark:shadow-rose-900/20',
      text: 'text-rose-900 dark:text-rose-200',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
      icon: Terminal,
      label: 'Terminal'
    }
  }
  if (t === 'input_output' || t === 'parallelogram' || t === 'data') {
    return {
      bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-emerald-950/20',
      border: 'border-emerald-200 hover:border-emerald-400 dark:border-emerald-900/50 dark:hover:border-emerald-700',
      glow: 'shadow-emerald-100 dark:shadow-emerald-900/20',
      text: 'text-emerald-900 dark:text-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      icon: Database,
      label: 'Data I/O'
    }
  }
  return {
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    border: 'border-blue-200 hover:border-blue-400 dark:border-blue-900/50 dark:hover:border-blue-700',
    glow: 'shadow-blue-100 dark:shadow-blue-900/20',
    text: 'text-blue-900 dark:text-blue-200',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    icon: Layers,
    label: 'Process'
  }
}

export function MermaidFallbackRenderer({ code, fallbackJson, className = '' }) {
  const [activeNodeIds, setActiveNodeIds] = useState(new Set())
  const [activeEdgeIndex, setActiveEdgeIndex] = useState(-1)

  const finalNodes = (fallbackJson?.nodes && fallbackJson.nodes.length > 0)
    ? fallbackJson.nodes
    : parseFallbackJsonFromMermaid(code).nodes

  const finalEdges = (fallbackJson?.edges && fallbackJson.edges.length > 0)
    ? fallbackJson.edges
    : parseFallbackJsonFromMermaid(code).edges

  const handleNodeMouseEnter = (nodeId) => {
    setActiveNodeIds(new Set([nodeId]))
  }

  const handleNodeMouseLeave = () => {
    setActiveNodeIds(new Set())
  }

  const handleEdgeMouseEnter = (edge, index) => {
    setActiveNodeIds(new Set([edge.from, edge.to]))
    setActiveEdgeIndex(index)
  }

  const handleEdgeMouseLeave = () => {
    setActiveNodeIds(new Set())
    setActiveEdgeIndex(-1)
  }

  if (finalNodes.length === 0) {
    return (
      <div className={`p-8 text-center bg-gray-50 rounded-b-xl border border-gray-100 ${className}`}>
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-700">No components to display</p>
        <p className="text-xs text-gray-400 mt-1">
          This diagram does not have structured component information.
        </p>
      </div>
    )
  }

  return (
    <div className={`p-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-b-xl border border-t-0 border-slate-100 dark:border-slate-800/80 backdrop-blur-sm ${className}`}>
      <div className="mb-6 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-500 animate-pulse" />
            Structured System Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            A high-fidelity structured breakdown of the system components and signal flows.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 tracking-wider uppercase">
          Dynamic Flow
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              System Components ({finalNodes.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Hover card to trace paths</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {finalNodes.map((node) => {
              const config = getNodeTypeConfig(node.type)
              const Icon = config.icon
              const isHighlighted = activeNodeIds.has(node.id)
              
              return (
                <div
                  key={node.id}
                  onMouseEnter={() => handleNodeMouseEnter(node.id)}
                  onMouseLeave={handleNodeMouseLeave}
                  className={`
                    group relative p-4 rounded-xl border bg-gradient-to-br transition-all duration-300 cursor-pointer
                    ${config.bg} ${config.border}
                    ${isHighlighted ? `ring-2 ring-violet-500/30 scale-[1.02] shadow-md ${config.glow}` : 'shadow-sm'}
                  `}
                >
                  <div className="absolute inset-0 rounded-xl bg-white/40 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider ${config.badge}`}>
                        {config.label}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug truncate">
                        {node.label}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        ID: {node.id}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/60 shadow-sm border border-slate-100 dark:border-slate-800/40">
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-violet-500 transition-colors" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Signal &amp; Connection Flow ({finalEdges.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Hover step to trace nodes</span>
          </div>

          <div className="relative border-l border-slate-200/80 dark:border-slate-800/80 ml-3 pl-6 space-y-6 max-h-[420px] overflow-y-auto pr-2 custom-scroll">
            {finalEdges.map((edge, idx) => {
              const isEdgeHighlighted = activeEdgeIndex === idx
              const fromNode = finalNodes.find(n => n.id === edge.from)
              const toNode = finalNodes.find(n => n.id === edge.to)
              
              return (
                <div
                  key={idx}
                  onMouseEnter={() => handleEdgeMouseEnter(edge, idx)}
                  onMouseLeave={handleEdgeMouseLeave}
                  className={`
                    relative group transition-all duration-300 p-3 rounded-lg border cursor-pointer
                    ${isEdgeHighlighted 
                      ? 'bg-violet-50/70 border-violet-200 dark:bg-violet-950/10 dark:border-violet-900/50 scale-[1.01]' 
                      : 'bg-white/40 border-transparent dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-800/20'
                    }
                  `}
                >
                  <div className={`
                    absolute -left-[31px] top-4 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all duration-300
                    ${isEdgeHighlighted 
                      ? 'bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-500/20 scale-110' 
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                    }
                  `}
                  style={{ width: '18px', height: '18px' }}>
                    {idx + 1}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {fromNode ? fromNode.label : edge.from}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 transition-colors group-hover:translate-x-0.5" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {toNode ? toNode.label : edge.to}
                      </span>
                    </div>

                    {edge.label && (
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/60 px-2 py-1 rounded italic leading-relaxed">
                        {edge.label}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Mermaid renderer (AI-generated diagrams) ─────────────────────────────────
function MermaidRenderer({ code, fallbackJson, className = '' }) {
  const containerRef = useRef(null)
  const [status, setStatus]     = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [clientFallback, setClientFallback] = useState(false)
  const renderIdRef             = useRef(0)

  useEffect(() => {
    if (!code) return
    const renderId = ++renderIdRef.current
    setStatus('rendering')
    setErrorMsg('')
    setClientFallback(false)

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
        console.error('Mermaid render error, switching to client fallback:', err)
        setClientFallback(true)
        setStatus('done')
      }
    }

    render()
  }, [code])

  if (clientFallback) {
    return <MermaidFallbackRenderer code={code} fallbackJson={fallbackJson} className={className} />
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
 *   useFallback: boolean      — forces rendering the HTML/CSS fallback layout
 *   fallbackJson: object      — structured nodes/edges representation
 */
export default function DiagramRenderer({ source, schema, code, useFallback, fallbackJson, className = '' }) {
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

  // AI-generated JSON schema -> precision SVGEngine
  if (source === 'ai' && schema) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-1.5 px-4 py-2 bg-violet-50 border-b border-violet-100">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-violet-700">
            AI-Generated Diagram (Dynamic SVGEngine) — verify key details
          </span>
        </div>
        <SVGEngine schema={schema} className={className} />
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
        {useFallback ? (
          <MermaidFallbackRenderer code={code} fallbackJson={fallbackJson} className={className} />
        ) : (
          <MermaidRenderer code={code} fallbackJson={fallbackJson} className={className} />
        )}
      </div>
    )
  }

  // Fallback: legacy Mermaid-only usage
  if (code) {
    return useFallback ? (
      <MermaidFallbackRenderer code={code} fallbackJson={fallbackJson} className={className} />
    ) : (
      <MermaidRenderer code={code} fallbackJson={fallbackJson} className={className} />
    )
  }

  return null
}
