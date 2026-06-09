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

  // Wrap description if it is longer than 13 characters
  const words = (description || '').split(' ')
  const descLines = []
  let currentLine = ''
  words.forEach(word => {
    if ((currentLine + ' ' + word).trim().length > 13) {
      if (currentLine) descLines.push(currentLine.trim())
      currentLine = word
    } else {
      currentLine = (currentLine + ' ' + word)
    }
  })
  if (currentLine) descLines.push(currentLine.trim())

  const hasDesc = descLines.length > 0
  const labelY = hasDesc ? (descLines.length > 1 ? y - 8 : y - 5) : y + 4
  const descStartY = hasDesc ? (descLines.length > 1 ? y + 7.5 : y + 10) : y

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
        x={x} y={labelY}
        textAnchor="middle"
        dominantBaseline={hasDesc ? "alphabetic" : "middle"}
        fontSize={11.5}
        fontWeight="700"
        fill={textColor}
        fontFamily="Poppins, Inter, sans-serif"
      >
        {label}
      </text>
      {/* Description lines */}
      {hasDesc && descLines.map((line, idx) => (
        <text
          key={idx}
          x={x} y={descStartY + idx * 8.5}
          textAnchor="middle"
          fontSize={7.2}
          fontWeight="500"
          fill={textColor}
          opacity={0.8}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {line}
        </text>
      ))}
    </g>
  )
}
