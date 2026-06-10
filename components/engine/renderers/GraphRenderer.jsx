'use client'

import React from 'react'

/**
 * GraphRenderer — handles 'graph' type schemas
 * Used for: DFA, Resource Allocation Graph, General Graphs, and Boehm's Spiral Model
 */
export default function GraphRenderer({ schema }) {
  const { nodes = [], edges = [] } = schema
  const isSpiral = schema.id === 'spiral-model'

  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.id] = n })

  // Math-derived spiral path generation for Boehm's Spiral Model
  let spiralPathD = ''
  if (isSpiral) {
    const points = []
    const startTheta = Math.PI
    const endTheta = 7 * Math.PI
    const steps = 300
    for (let i = 0; i <= steps; i++) {
      const theta = startTheta + (endTheta - startTheta) * (i / steps)
      const r = 45 + (theta - Math.PI) * (60 / Math.PI)
      const x = 450 + r * Math.cos(theta)
      const y = 350 + r * Math.sin(theta)
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    spiralPathD = `M ${points.join(' L ')}`
  }

  return (
    <g>
      {/* 1. Render specialized crossing axes, spiral path, quadrant labels, and header for Spiral Model */}
      {isSpiral && (
        <g>
          {/* Header Title Box (Matches standard textbook card style) */}
          <g transform="translate(450, 70)">
            <rect x={-160} y={-24} width={320} height={42} fill="white" stroke="#E2E8F0" strokeWidth={1} rx={6} />
            <text textAnchor="middle" y={3} fill="#0F172A" fontSize={15} fontWeight="700" fontFamily="Poppins, Inter, sans-serif">
              Phases of the Spiral Model
            </text>
          </g>

          {/* Crossing axes */}
          <line x1={50} y1={350} x2={850} y2={350} stroke="#1E293B" strokeWidth={1.5} opacity={0.6} />
          <line x1={450} y1={120} x2={450} y2={730} stroke="#1E293B" strokeWidth={1.5} opacity={0.6} />

          {/* Coiling green spiral path */}
          <path d={spiralPathD} fill="none" stroke="#16A34A" strokeWidth={3.5} strokeLinecap="round" />

          {/* Downward pointing arrowhead at the end (45, 350) */}
          <polygon points="45,350 40,340 50,340" fill="#16A34A" />

          {/* Quadrant Labels */}
          {/* Top-Left Quadrant */}
          <g transform="translate(120, 160)">
            <text fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif">
              1. Objectives determination and
            </text>
            <text fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif" dy="18">
              identify alternative solutions
            </text>
          </g>

          {/* Top-Right Quadrant */}
          <g transform="translate(780, 200)">
            <text textAnchor="end" fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif">
              2. Identify and
            </text>
            <text textAnchor="end" fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif" dy="18">
              resolve Risks
            </text>
          </g>

          {/* Bottom-Right Quadrant */}
          <g transform="translate(780, 620)">
            <text textAnchor="end" fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif">
              3. Develop next
            </text>
            <text textAnchor="end" fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif" dy="18">
              version of the Product
            </text>
          </g>

          {/* Bottom-Left Quadrant */}
          <g transform="translate(120, 620)">
            <text fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif">
              4. Review and plan
            </text>
            <text fill="#0F172A" fontSize={13} fontWeight="700" fontFamily="Poppins, Inter, sans-serif" dy="18">
              for the next Phase
            </text>
          </g>
        </g>
      )}

      {/* 2. Edges */}
      {edges.map((edge, i) => {
        const from = nodeMap[edge.from]
        const to   = nodeMap[edge.to]
        if (!from || !to) return null

        // If spiral model, hide all edges and labels entirely
        if (isSpiral) return null

        const dx = to.x - from.x
        const dy = to.y - from.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const r1 = from.r || 30
        const r2 = to.r   || 30

        const startX = from.x + (dx / dist) * r1
        const startY = from.y + (dy / dist) * r1
        const endX   = to.x   - (dx / dist) * r2
        const endY   = to.y   - (dy / dist) * r2

        const angle = Math.atan2(dy, dx)
        const arrowSize = 8
        const ax1 = endX - arrowSize * Math.cos(angle - 0.4)
        const ay1 = endY - arrowSize * Math.sin(angle - 0.4)
        const ax2 = endX - arrowSize * Math.cos(angle + 0.4)
        const ay2 = endY - arrowSize * Math.sin(angle + 0.4)

        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2

        return (
          <g key={i}>
            <line
              x1={startX} y1={startY}
              x2={endX}   y2={endY}
              stroke="#94A3B8" strokeWidth={1.5}
              strokeDasharray={edge.style === 'dashed' ? '5,3' : '0'}
            />
            {!edge.noArrow && (
              <polygon points={`${endX},${endY} ${ax1},${ay1} ${ax2},${ay2}`} fill="#94A3B8" />
            )}
            {edge.label && (() => {
              const labelPos = edge.labelPos ?? 0.5
              const labelX = startX + (endX - startX) * labelPos + (edge.labelOffsetX ?? 0)
              const labelY = startY + (endY - startY) * labelPos + (edge.labelOffsetY ?? -6)
              const labelWidth = edge.label.length * 5.8
              const labelHeight = 12
              return (
                <g>
                  <rect
                    x={labelX - labelWidth / 2}
                    y={labelY - 9}
                    width={labelWidth}
                    height={labelHeight}
                    fill="#FAFBFC"
                    rx={2}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={8.5}
                    fontWeight="600"
                    fill="#334155"
                    fontFamily="Poppins, Inter, sans-serif"
                  >
                    {edge.label}
                  </text>
                </g>
              )
            })()}
          </g>
        )
      })}

      {/* 3. Nodes */}
      {nodes.map(node => {
        const r      = node.r      || 30
        const color  = node.color  || '#EEF2FF'
        const stroke = node.borderColor || '#6366F1'
        const text   = node.textColor   || '#312E81'

        // If spiral model, hide all nodes entirely
        if (isSpiral) return null

        const isDouble = node.accepting || node.type === 'accepting'
        const isResource = node.type === 'resource'
        const lines = (node.label || '').split('\n')
        const yStart = node.y - (lines.length - 1) * 6 + 3

        if (isResource) {
          // Render resource nodes as rectangles with instance dots inside
          const instances = parseInt(node.instances || 0, 10)
          let dotPositions = []
          if (instances === 1) {
            dotPositions = [{ dx: 0, dy: 0 }]
          } else if (instances === 2) {
            dotPositions = [{ dx: -8, dy: 0 }, { dx: 8, dy: 0 }]
          } else if (instances === 3) {
            dotPositions = [{ dx: -10, dy: 6 }, { dx: 10, dy: 6 }, { dx: 0, dy: -8 }]
          } else if (instances === 4) {
            dotPositions = [{ dx: -8, dy: -8 }, { dx: 8, dy: -8 }, { dx: -8, dy: 8 }, { dx: 8, dy: 8 }]
          }

          return (
            <g key={node.id}>
              {/* Square resource box */}
              <rect
                x={node.x - r}
                y={node.y - r}
                width={r * 2}
                height={r * 2}
                fill={color}
                stroke={stroke}
                strokeWidth={2}
                rx={4}
              />
              {/* Instance dots */}
              {dotPositions.map((pos, idx) => (
                <circle
                  key={idx}
                  cx={node.x + pos.dx}
                  cy={node.y + pos.dy}
                  r={4}
                  fill="#334155"
                />
              ))}
              {/* Label above the box */}
              <text
                x={node.x}
                y={node.y - r - 8}
                textAnchor="middle"
                fontSize={10}
                fontWeight="700"
                fill={text}
                fontFamily="Poppins, Inter, sans-serif"
              >
                {node.label}
              </text>
            </g>
          )
        }

        return (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={r} fill={color} stroke={stroke} strokeWidth={2} />
            {isDouble && (
              <circle cx={node.x} cy={node.y} r={r - 5} fill="none" stroke={stroke} strokeWidth={1.5} />
            )}
            <text x={node.x} y={yStart} textAnchor="middle" fontSize={10} fontWeight="700" fill={text} fontFamily="Poppins, Inter, sans-serif">
              {lines.map((line, idx) => (
                <tspan x={node.x} dy={idx === 0 ? 0 : 12} key={idx}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </g>
  )
}

