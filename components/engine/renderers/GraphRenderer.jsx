'use client'

import React from 'react'

/**
 * GraphRenderer — handles 'graph' type schemas
 * Used for: DFA, Resource Allocation Graph, General Graphs
 */
export default function GraphRenderer({ schema }) {
  const { nodes = [], edges = [] } = schema

  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.id] = n })

  return (
    <g>
      {/* Edges */}
      {edges.map((edge, i) => {
        const from = nodeMap[edge.from]
        const to   = nodeMap[edge.to]
        if (!from || !to) return null

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
            {edge.label && (
              <text x={midX} y={midY - 6} textAnchor="middle" fontSize={9.5} fill="#475569" fontFamily="Poppins, Inter, sans-serif">
                {edge.label}
              </text>
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const r      = node.r      || 30
        const color  = node.color  || '#EEF2FF'
        const stroke = node.borderColor || '#6366F1'
        const text   = node.textColor   || '#312E81'

        const isDouble = node.accepting || node.type === 'accepting'
        return (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={r}     fill={color}     stroke={stroke} strokeWidth={2} />
            {isDouble && (
              <circle cx={node.x} cy={node.y} r={r - 5} fill="none"    stroke={stroke} strokeWidth={1.5} />
            )}
            <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize={11} fontWeight="700" fill={text} fontFamily="Poppins, Inter, sans-serif">
              {node.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
