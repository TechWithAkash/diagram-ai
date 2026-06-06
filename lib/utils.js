import clsx from 'clsx'
import { Zap, Factory, Database, Globe, Radio, Lock, Atom, Rocket, Link, Puzzle } from 'lucide-react'

export { clsx }

// Download SVG from a DOM element
export function downloadSVG(containerEl, filename = 'diagram.svg') {
  const svgEl = containerEl?.querySelector('svg')
  if (!svgEl) return false

  const svgData = new XMLSerializer().serializeToString(svgEl)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return true
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  }
}

// Map diagram type to readable label
export const DIAGRAM_TYPE_LABELS = {
  flowchart: 'Flowchart',
  erDiagram: 'ER Diagram',
  sequenceDiagram: 'Sequence',
  classDiagram: 'Class Diagram',
  stateDiagram: 'State Machine',
  graph: 'Graph',
}

// Map complexity to badge variant
export const COMPLEXITY_VARIANT = {
  Beginner: 'success',
  Intermediate: 'warning',
  Advanced: 'info',
}

// Quick prompt suggestions
export const QUICK_PROMPTS = [
  { label: 'MCC Circuit',        prompt: 'MCC Motor Control Center circuit diagram with components', icon: Zap },
  { label: 'SPCC System',        prompt: 'SPCC Steel Plant Control Center system architecture',      icon: Factory },
  { label: 'ER Diagram',         prompt: 'Database ER diagram for e-commerce platform',              icon: Database },
  { label: 'TCP/IP Handshake',   prompt: 'TCP/IP three-way handshake connection sequence',           icon: Globe },
  { label: 'OSI Model',          prompt: 'OSI network model all 7 layers with protocols',            icon: Radio },
  { label: 'JWT Auth Flow',      prompt: 'JWT authentication and authorization flow',                icon: Lock },
  { label: 'React Lifecycle',    prompt: 'React component lifecycle hooks and methods',              icon: Atom },
  { label: 'CI/CD Pipeline',     prompt: 'CI/CD pipeline from code commit to production deploy',     icon: Rocket },
  { label: 'REST API Design',    prompt: 'REST API request response cycle with middleware',          icon: Link },
  { label: 'Microservices',      prompt: 'Microservices architecture with API gateway',              icon: Puzzle },
]
