'use client'

import React from 'react'

/**
 * UMLDiagramRenderer — handles 'uml-diagram' type schemas
 * Supports: Class compartments, stick-figure Actors, Use Cases, and UML connectors (inheritance, dependency, etc.)
 */
export default function UMLDiagramRenderer({ schema }) {
  const { nodes = [], connections = [] } = schema

  // Build a map for easy lookup
  const nodeMap = {}
  nodes.forEach(n => {
    nodeMap[n.id] = n
  })

  // Helper: get center of a node
  function getNodeCenter(n) {
    if (!n) return { x: 0, y: 0 }
    if (n.type === 'actor' || n.type === 'use-case') {
      // centered nodes
      return { x: n.x, y: n.y }
    }
    // rectangular nodes starting at (x,y)
    return {
      x: n.x + (n.width || 120) / 2,
      y: n.y + (n.height || 80) / 2
    }
  }

  // Helper: get point on node border along center-to-center vector
  function getBorderPoint(fromNode, toNode) {
    if (!fromNode || !toNode) return { x: 0, y: 0 }
    
    const fromCenter = getNodeCenter(fromNode)
    const toCenter = getNodeCenter(toNode)
    const dx = toCenter.x - fromCenter.x
    const dy = toCenter.y - fromCenter.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 1

    if (fromNode.type === 'actor') {
      // Treat actor as 40x70 bounding box
      const w = 20
      const h = 35
      const scaleX = dx !== 0 ? Math.abs(w / dx) : Infinity
      const scaleY = dy !== 0 ? Math.abs(h / dy) : Infinity
      const scale = Math.min(scaleX, scaleY)
      return { x: fromCenter.x + dx * scale, y: fromCenter.y + dy * scale }
    }

    if (fromNode.type === 'use-case') {
      // Ellipse boundary
      const rx = (fromNode.width || 110) / 2
      const ry = (fromNode.height || 60) / 2
      const term = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry)
      const scale = term > 0 ? 1 / Math.sqrt(term) : 1
      return { x: fromCenter.x + dx * scale, y: fromCenter.y + dy * scale }
    }

    // Class / simple box (rectangular)
    const w = (fromNode.width || 120) / 2
    const h = (fromNode.height || 80) / 2
    const scaleX = dx !== 0 ? Math.abs(w / dx) : Infinity
    const scaleY = dy !== 0 ? Math.abs(h / dy) : Infinity
    const scale = Math.min(scaleX, scaleY)
    return { x: fromCenter.x + dx * scale, y: fromCenter.y + dy * scale }
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
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Draw connection decorations
        let lineD = `M ${start.x} ${start.y} L ${end.x} ${end.y}`
        let strokeDash = conn.style === 'dashed' ? '5,5' : 'none'
        let markerStart = null
        let markerEnd = null

        const arrowSize = 9

        // End arrowheads
        let arrowhead = null
        if (conn.type === 'inheritance') {
          // Empty triangle arrowhead pointing to 'to'
          const tx1 = end.x - arrowSize * Math.cos(angle - 0.4)
          const ty1 = end.y - arrowSize * Math.sin(angle - 0.4)
          const tx2 = end.x - arrowSize * Math.cos(angle + 0.4)
          const ty2 = end.y - arrowSize * Math.sin(angle + 0.4)
          arrowhead = (
            <polygon
              points={`${end.x},${end.y} ${tx1},${ty1} ${tx2},${ty2}`}
              fill="white"
              stroke="#1E293B"
              strokeWidth={1.5}
            />
          )
          lineD = `M ${start.x} ${start.y} L ${(tx1 + tx2) / 2} ${(ty1 + ty2) / 2}`
        } else if (conn.type === 'dependency') {
          // Open arrowhead pointing to 'to'
          const tx1 = end.x - arrowSize * Math.cos(angle - 0.4)
          const ty1 = end.y - arrowSize * Math.sin(angle - 0.4)
          const tx2 = end.x - arrowSize * Math.cos(angle + 0.4)
          const ty2 = end.y - arrowSize * Math.sin(angle + 0.4)
          arrowhead = (
            <path
              d={`M ${tx1} ${ty1} L ${end.x} ${end.y} L ${tx2} ${ty2}`}
              fill="none"
              stroke="#1E293B"
              strokeWidth={1.5}
            />
          )
        } else if (conn.type === 'composition') {
          // Filled diamond at 'from' end
          const hSize = 7
          const fx1 = start.x + hSize * Math.cos(angle)
          const fy1 = start.y + hSize * Math.sin(angle)
          const fx2 = start.x + hSize * 2 * Math.cos(angle)
          const fy2 = start.y + hSize * 2 * Math.sin(angle)
          const fLeftX = fx1 - hSize * Math.sin(angle)
          const fLeftY = fy1 + hSize * Math.cos(angle)
          const fRightX = fx1 + hSize * Math.sin(angle)
          const fRightY = fy1 - hSize * Math.cos(angle)
          arrowhead = (
            <polygon
              points={`${start.x},${start.y} ${fLeftX},${fLeftY} ${fx2},${fy2} ${fRightX},${fRightY}`}
              fill="#1E293B"
              stroke="#1E293B"
              strokeWidth={1.5}
            />
          )
          lineD = `M ${fx2} ${fy2} L ${end.x} ${end.y}`
        } else if (conn.type === 'aggregation') {
          // Empty diamond at 'from' end
          const hSize = 7
          const fx1 = start.x + hSize * Math.cos(angle)
          const fy1 = start.y + hSize * Math.sin(angle)
          const fx2 = start.x + hSize * 2 * Math.cos(angle)
          const fy2 = start.y + hSize * 2 * Math.sin(angle)
          const fLeftX = fx1 - hSize * Math.sin(angle)
          const fLeftY = fy1 + hSize * Math.cos(angle)
          const fRightX = fx1 + hSize * Math.sin(angle)
          const fRightY = fy1 - hSize * Math.cos(angle)
          arrowhead = (
            <polygon
              points={`${start.x},${start.y} ${fLeftX},${fLeftY} ${fx2},${fy2} ${fRightX},${fRightY}`}
              fill="white"
              stroke="#1E293B"
              strokeWidth={1.5}
            />
          )
          lineD = `M ${fx2} ${fy2} L ${end.x} ${end.y}`
        }

        const midX = (start.x + end.x) / 2
        const midY = (start.y + end.y) / 2

        return (
          <g key={i}>
            <path
              d={lineD}
              fill="none"
              stroke="#1E293B"
              strokeWidth={1.5}
              strokeDasharray={strokeDash}
            />
            {arrowhead}
            {conn.label && (
              <g>
                <rect
                  x={midX - (conn.label.length * 5 + 6) / 2}
                  y={midY - 8}
                  width={conn.label.length * 5 + 6}
                  height={15}
                  fill="white"
                  opacity={0.9}
                  rx={3}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8.5}
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
          id, type = 'class', x, y, width = 120, height = 80, label,
          color = '#EFF6FF', borderColor = '#2563EB', textColor = '#1E3A5F',
          attributes = [], operations = []
        } = node

        if (type === 'actor') {
          // Standard UML stick-figure Actor (x, y is the center point)
          return (
            <g key={id} transform={`translate(${x}, ${y})`}>
              <circle cx={0} cy={-18} r={7} fill="white" stroke={borderColor} strokeWidth={2.5} />
              <line x1={0} y1={-11} x2={0} y2={10} stroke={borderColor} strokeWidth={2.5} />
              <line x1={-12} y1={-4} x2={12} y2={-4} stroke={borderColor} strokeWidth={2.5} />
              <line x1={0} y1={10} x2={-10} y2={28} stroke={borderColor} strokeWidth={2.5} />
              <line x1={0} y1={10} x2={10} y2={28} stroke={borderColor} strokeWidth={2.5} />
              <text
                x={0}
                y={40}
                textAnchor="middle"
                fontSize={10.5}
                fontWeight="700"
                fill={textColor}
                fontFamily="Poppins, Inter, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        }

        if (type === 'use-case') {
          // Standard UML Use Case (ellipse centered at x,y)
          const rx = width / 2
          const ry = height / 2
          return (
            <g key={id}>
              <ellipse
                cx={x}
                cy={y}
                rx={rx}
                ry={ry}
                fill={color}
                stroke={borderColor}
                strokeWidth={2}
                filter="url(#block-shadow)"
              />
              <text
                x={x}
                y={y}
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

        // Standard Class Compartment Rectangle (type === 'class')
        return (
          <g key={id} transform={`translate(${x}, ${y})`}>
            {/* Main Class Outer Box */}
            <rect
              width={width}
              height={height}
              fill={color}
              stroke={borderColor}
              strokeWidth={2}
              rx={4}
              filter="url(#block-shadow)"
            />

            {/* Class Name (Compartment 1) */}
            <text
              x={width / 2}
              y={18}
              textAnchor="middle"
              fontSize={11}
              fontWeight="700"
              fill={textColor}
              fontFamily="Poppins, Inter, sans-serif"
            >
              {label}
            </text>
            <line x1={0} y1={28} x2={width} y2={28} stroke={borderColor} strokeWidth={1.5} />

            {/* Attributes (Compartment 2) */}
            <g transform="translate(8, 32)">
              {attributes.map((attr, ai) => (
                <text
                  key={ai}
                  x={0}
                  y={ai * 13 + 9}
                  fontSize={8.5}
                  fontWeight="500"
                  fill={textColor}
                  fontFamily="Courier New, monospace, sans-serif"
                >
                  {attr}
                </text>
              ))}
            </g>

            {/* Separator line 2 (Only if operations are present) */}
            {operations.length > 0 && (
              <>
                <line
                  x1={0}
                  y1={28 + Math.max(1, attributes.length) * 13 + 6}
                  x2={width}
                  y2={28 + Math.max(1, attributes.length) * 13 + 6}
                  stroke={borderColor}
                  strokeWidth={1.5}
                />
                {/* Operations (Compartment 3) */}
                <g transform={`translate(8, ${28 + Math.max(1, attributes.length) * 13 + 10})`}>
                  {operations.map((op, oi) => (
                    <text
                      key={oi}
                      x={0}
                      y={oi * 13 + 9}
                      fontSize={8.5}
                      fontWeight="500"
                      fill={textColor}
                      fontFamily="Courier New, monospace, sans-serif"
                    >
                      {op}
                    </text>
                  ))}
                </g>
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}
