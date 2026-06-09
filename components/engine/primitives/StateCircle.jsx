'use client'

import React from 'react'

/**
 * StateCircle — circle node for state machine diagrams
 * Special types: 'start' (filled black dot), 'end' (double ring), 'normal' (default)
 */
export default function StateCircle({ state }) {
  const {
    x, y, r = 40,
    label,
    description,
    color = '#EFF6FF',
    borderColor = '#3B82F6',
    textColor = '#1E3A5F',
    type = 'normal',
  } = state

  if (type === 'start') {
    return (
      <g>
        <circle cx={x} cy={y} r={10} fill="#1E293B" />
      </g>
    )
  }

  if (type === 'end') {
    return (
      <g>
        <circle cx={x} cy={y} r={12} fill="none" stroke="#1E293B" strokeWidth={2} />
        <circle cx={x} cy={y} r={8}  fill="#1E293B" />
      </g>
    )
  }

  return (
    <g>
      {/* Shadow */}
      <circle cx={x + 2} cy={y + 2} r={r} fill="rgba(0,0,0,0.08)" />
      {/* Main circle */}
      <circle
        cx={x} cy={y} r={r}
        fill={color}
        stroke={borderColor}
        strokeWidth={2.5}
      />
      {/* Label */}
      <text
        x={x} y={y + 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
        fontWeight="700"
        fill={textColor}
        fontFamily="Poppins, Inter, sans-serif"
      >
        {label}
      </text>
      {/* Description (small, below label) */}
      {description && (
        <text
          x={x} y={y + 18}
          textAnchor="middle"
          fontSize={8.5}
          fill={textColor}
          opacity={0.7}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {description}
        </text>
      )}
    </g>
  )
}
