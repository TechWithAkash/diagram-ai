'use client'

import React from 'react'

/**
 * DFDFlowRenderer — handles 'dfd-flow' type schemas
 * Supports: Yourdon/Gane-Sarson Process bubbles, Open-ended Data Stores, and External Entities.
 */
export default function DFDFlowRenderer({ schema }) {
  const { nodes = [], connections = [] } = schema

  // Build node lookup map
  const nodeMap = {}
  nodes.forEach(n => {
    nodeMap[n.id] = n
  })

  // Helper: get center of a node
  function getNodeCenter(n) {
    if (!n) return { x: 0, y: 0 }
    if (n.type === 'process' && n.shape === 'circle') {
      return { x: n.x, y: n.y }
    }
    return {
      x: n.x + (n.width || 120) / 2,
      y: n.y + (n.height || 70) / 2
    }
  }

  // Helper: get point on node border along center-to-center vector
  function getBorderPoint(fromNode, toNode) {
    if (!fromNode || !toNode) return { x: 0, y: 0 }

    const fromCenter = getNodeCenter(fromNode)
    const toCenter = getNodeCenter(toNode)
    const dx = toCenter.x - fromCenter.x
    const dy = toCenter.y - fromCenter.y

    if (fromNode.type === 'process' && fromNode.shape === 'circle') {
      // Circle boundary
      const r = (fromNode.width || 80) / 2
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      return {
        x: fromCenter.x + (dx / dist) * r,
        y: fromCenter.y + (dy / dist) * r
      }
    }

    // Rectangular nodes (external, data-store, rectangular process)
    const w = (fromNode.width || 120) / 2
    const h = (fromNode.height || 70) / 2
    const scaleX = dx !== 0 ? Math.abs(w / dx) : Infinity
    const scaleY = dy !== 0 ? Math.abs(h / dy) : Infinity
    const scale = Math.min(scaleX, scaleY)
    
    return {
      x: fromCenter.x + dx * scale,
      y: fromCenter.y + dy * scale
    }
  }

  return (
    <g>
      {/* 1. Connections (Render under nodes) */}
      {connections.map((conn, i) => {
        const from = nodeMap[conn.from]
        const to = nodeMap[conn.to]
        if (!from || !to) return null

        const start = getBorderPoint(from, to)
        const end = getBorderPoint(to, from)

        const dx = end.x - start.x
        const dy = end.y - start.y
        const angle = Math.atan2(dy, dx)

        const arrowSize = 8
        const ax1 = end.x - arrowSize * Math.cos(angle - 0.4)
        const ay1 = end.y - arrowSize * Math.sin(angle - 0.4)
        const ax2 = end.x - arrowSize * Math.cos(angle + 0.4)
        const ay2 = end.y - arrowSize * Math.sin(angle + 0.4)

        const midX = (start.x + end.x) / 2
        const midY = (start.y + end.y) / 2

        return (
          <g key={i}>
            <line
              x1={start.x} y1={start.y}
              x2={end.x} y2={end.y}
              stroke="#475569"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <polygon
              points={`${end.x},${end.y} ${ax1},${ay1} ${ax2},${ay2}`}
              fill="#475569"
            />
            {conn.label && (
              <g>
                <rect
                  x={midX - (conn.label.length * 5.5 + 8) / 2}
                  y={midY - 9}
                  width={conn.label.length * 5.5 + 8}
                  height={17}
                  fill="white"
                  opacity={0.95}
                  rx={4}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight="600"
                  fill="#475569"
                  fontFamily="Poppins, Inter, sans-serif"
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* 2. Nodes (Render on top of connections) */}
      {nodes.map(node => {
        const {
          id, type = 'process', shape = 'circle', processId = '',
          x, y, width = 120, height = 70, label,
          color = '#F8FAFC', borderColor = '#475569', textColor = '#1E293B'
        } = node

        if (type === 'process') {
          if (shape === 'circle') {
            // Yourdon & Coad style process (circle)
            const r = width / 2
            return (
              <g key={id}>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={color}
                  stroke={borderColor}
                  strokeWidth={2}
                  filter="url(#block-shadow)"
                />
                {processId && (
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight="700"
                    fill={textColor}
                    opacity={0.7}
                    fontFamily="Poppins, Inter, sans-serif"
                  >
                    {processId}
                  </text>
                )}
                <text
                  x={x}
                  y={processId ? y + 6 : y}
                  textAnchor="middle"
                  dominantBaseline={processId ? "alphabetic" : "middle"}
                  fontSize={10}
                  fontWeight="600"
                  fill={textColor}
                  fontFamily="Poppins, Inter, sans-serif"
                >
                  {label}
                </text>
              </g>
            )
          }

          // Gane-Sarson style process (rounded rectangle with top ID bar)
          return (
            <g key={id} transform={`translate(${x}, ${y})`}>
              <rect
                width={width}
                height={height}
                fill={color}
                stroke={borderColor}
                strokeWidth={2}
                rx={8}
                filter="url(#block-shadow)"
              />
              <line x1={0} y1={22} x2={width} y2={22} stroke={borderColor} strokeWidth={1.5} />
              
              {/* Process ID (Top strip) */}
              <text
                x={width / 2}
                y={14}
                textAnchor="middle"
                fontSize={8.5}
                fontWeight="700"
                fill={textColor}
                opacity={0.7}
                fontFamily="Poppins, Inter, sans-serif"
              >
                {processId || 'Process'}
              </text>

              {/* Process Name (Lower block) */}
              <text
                x={width / 2}
                y={22 + (height - 22) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight="600"
                fill={textColor}
                fontFamily="Poppins, Inter, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        }

        if (type === 'data-store') {
          // Gane-Sarson open-ended Data Store (no right border, ID section on left)
          const idWidth = 26
          return (
            <g key={id} transform={`translate(${x}, ${y})`}>
              {/* Background fill */}
              <rect width={width} height={height} fill={color} stroke="none" />
              
              {/* Open-ended lines: Top, Bottom, and Left vertical */}
              <line x1={0} y1={0} x2={width} y2={0} stroke={borderColor} strokeWidth={2} />
              <line x1={0} y1={height} x2={width} y2={height} stroke={borderColor} strokeWidth={2} />
              <line x1={0} y1={0} x2={0} y2={height} stroke={borderColor} strokeWidth={2} />
              
              {/* Inner vertical separator */}
              <line x1={idWidth} y1={0} x2={idWidth} y2={height} stroke={borderColor} strokeWidth={2} />

              {/* Data Store ID (Left compartment) */}
              <text
                x={idWidth / 2}
                y={height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9.5}
                fontWeight="700"
                fill={textColor}
                fontFamily="Poppins, Inter, sans-serif"
              >
                {processId || 'D'}
              </text>

              {/* Data Store Name (Right compartment) */}
              <text
                x={idWidth + (width - idWidth) / 2}
                y={height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight="600"
                fill={textColor}
                fontFamily="Poppins, Inter, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        }

        // External Entity (Sharp double-lined or single-lined square/rectangle)
        return (
          <g key={id} transform={`translate(${x}, ${y})`}>
            <rect
              width={width}
              height={height}
              fill={color}
              stroke={borderColor}
              strokeWidth={2}
              filter="url(#block-shadow)"
            />
            {/* Draw a subtle inner border for premium visual weight (optional Yourdon shadow box style) */}
            <rect
              x={3}
              y={3}
              width={width - 6}
              height={height - 6}
              fill="none"
              stroke={borderColor}
              strokeWidth={0.5}
              opacity={0.5}
            />
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight="600"
              fill={textColor}
              fontFamily="Poppins, Inter, sans-serif"
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
