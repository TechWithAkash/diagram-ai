'use client'

import React from 'react'

/**
 * Arrow — labeled directional SVG arrow
 * Supports: straight, curved (quadratic bezier)
 * style: 'solid' | 'dashed'
 * type: 'unidirectional' | 'bidirectional'
 */
export default function Arrow({ x1, y1, x2, y2, label, style = 'solid', type = 'unidirectional', color = '#94A3B8', curve = false }) {
  const strokeDash = style === 'dashed' ? '6,3' : '0'
  const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
  const arrowSize = 7

  // Compute angle for arrowhead at x2, y2
  const angle = Math.atan2(y2 - y1, x2 - x1)

  // Path
  let d
  if (curve) {
    // Quadratic bezier with control point offset
    const cpX = mid.x
    const cpY = mid.y - 40
    d = `M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`
  } else {
    d = `M ${x1} ${y1} L ${x2} ${y2}`
  }

  // Arrowhead tip at (x2, y2)
  const ax1 = x2 - arrowSize * Math.cos(angle - Math.PI / 6)
  const ay1 = y2 - arrowSize * Math.sin(angle - Math.PI / 6)
  const ax2 = x2 - arrowSize * Math.cos(angle + Math.PI / 6)
  const ay2 = y2 - arrowSize * Math.sin(angle + Math.PI / 6)

  // Bidirectional: also draw arrowhead at x1, y1
  const bAngle = Math.atan2(y1 - y2, x1 - x2)
  const bax1 = x1 - arrowSize * Math.cos(bAngle - Math.PI / 6)
  const bay1 = y1 - arrowSize * Math.sin(bAngle - Math.PI / 6)
  const bax2 = x1 - arrowSize * Math.cos(bAngle + Math.PI / 6)
  const bay2 = y1 - arrowSize * Math.sin(bAngle + Math.PI / 6)

  // Label position: slightly above midpoint
  const labelX = mid.x
  const labelY = curve ? (mid.y - 40 + mid.y) / 2 - 8 : mid.y - 8

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={strokeDash}
        strokeLinecap="round"
      />
      {/* Forward arrowhead */}
      <polygon
        points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`}
        fill={color}
      />
      {/* Backward arrowhead (bidirectional) */}
      {type === 'bidirectional' && (
        <polygon
          points={`${x1},${y1} ${bax1},${bay1} ${bax2},${bay2}`}
          fill={color}
        />
      )}
      {/* Label */}
      {label && (
        <>
          <rect
            x={labelX - label.length * 3.2}
            y={labelY - 9}
            width={label.length * 6.4}
            height={13}
            fill="white"
            opacity={0.9}
            rx={3}
          />
          <text
            x={labelX}
            y={labelY + 2}
            textAnchor="middle"
            fontSize={9}
            fill="#475569"
            fontFamily="Poppins, Inter, sans-serif"
          >
            {label}
          </text>
        </>
      )}
    </g>
  )
}
