'use client'

import React from 'react'

/**
 * Block — reusable SVG box primitive
 * Supports: nested children, sublabels, notes
 * All coordinates are absolute in the viewBox coordinate space
 */
export default function Block({ block, depth = 0 }) {
  const {
    x, y, width, height,
    label,
    color = '#F8FAFC',
    borderColor = '#CBD5E1',
    children = [],
    sublabels = [],
    note,
    labelSize,
  } = block

  const isRoot = depth === 0
  const rx = isRoot ? 12 : 8
  const labelY = y + (isRoot ? 22 : 18)
  const labelFontSize = labelSize || (isRoot ? 13 : 11)
  const labelFontWeight = isRoot ? '700' : '600'

  // Darken the borderColor for text
  const textColor = darkenHex(borderColor, 60)

  return (
    <g>
      {/* Drop shadow */}
      <rect
        x={x + 2} y={y + 2}
        width={width} height={height}
        rx={rx} ry={rx}
        fill="rgba(0,0,0,0.06)"
      />
      {/* Main box */}
      <rect
        x={x} y={y}
        width={width} height={height}
        fill={color}
        stroke={borderColor}
        strokeWidth={isRoot ? 2.5 : 1.5}
        rx={rx} ry={rx}
      />

      {/* Label */}
      <text
        x={x + width / 2}
        y={labelY}
        textAnchor="middle"
        fontSize={labelFontSize}
        fontWeight={labelFontWeight}
        fill={textColor}
        fontFamily="Poppins, Inter, sans-serif"
      >
        {label}
      </text>

      {/* Sublabels */}
      {sublabels.map((sl, i) => (
        <text
          key={i}
          x={x + 10}
          y={y + (isRoot ? 40 : 33) + i * 15}
          fontSize={9.5}
          fill="#475569"
          fontFamily="Poppins, Inter, sans-serif"
        >
          {sl}
        </text>
      ))}

      {/* Note (bottom italic) */}
      {note && (
        <text
          x={x + width / 2}
          y={y + height - 7}
          textAnchor="middle"
          fontSize={9}
          fill="#94A3B8"
          fontStyle="italic"
          fontFamily="Poppins, Inter, sans-serif"
        >
          {note}
        </text>
      )}

      {/* Children (recursive) */}
      {children.map(child => (
        <Block key={child.id} block={child} depth={depth + 1} />
      ))}
    </g>
  )
}

/** Simple hex darkening utility */
function darkenHex(hex, amount = 40) {
  try {
    const clean = hex.replace('#', '')
    const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount)
    const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount)
    const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount)
    return `rgb(${r},${g},${b})`
  } catch {
    return '#1E293B'
  }
}
