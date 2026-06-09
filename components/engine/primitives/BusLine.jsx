'use client'

import React from 'react'

/**
 * BusLine — horizontal or vertical bus primitive
 * Renders a labeled bus with double arrow ends
 */
export default function BusLine({ bus, viewBox }) {
  const {
    label,
    orientation = 'horizontal',
    y: busY,
    x: busX,
    color = '#64748B',
    thickness = 3,
  } = bus

  if (orientation === 'horizontal') {
    const startX = 24
    const endX = (viewBox?.width || 780) - 24
    const mid = (startX + endX) / 2
    const arrowSize = 7

    return (
      <g>
        {/* Bus line */}
        <line
          x1={startX} y1={busY}
          x2={endX}   y2={busY}
          stroke={color} strokeWidth={thickness}
          strokeLinecap="round"
        />
        {/* Left arrowhead */}
        <polygon
          points={`${startX},${busY} ${startX + arrowSize},${busY - arrowSize / 2} ${startX + arrowSize},${busY + arrowSize / 2}`}
          fill={color}
        />
        {/* Right arrowhead */}
        <polygon
          points={`${endX},${busY} ${endX - arrowSize},${busY - arrowSize / 2} ${endX - arrowSize},${busY + arrowSize / 2}`}
          fill={color}
        />
        {/* Label background */}
        <rect
          x={mid - 195} y={busY - 11}
          width={390} height={14}
          fill="white" opacity={0.85} rx={3}
        />
        {/* Label */}
        <text
          x={mid} y={busY + 4}
          textAnchor="middle"
          fontSize={9.5}
          fontWeight="600"
          fill={color}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {label}
        </text>
      </g>
    )
  }

  // Vertical bus
  const startY = 24
  const endY = (viewBox?.height || 560) - 24
  const midY = (startY + endY) / 2
  const arrowSize = 7

  return (
    <g>
      <line
        x1={busX} y1={startY}
        x2={busX} y2={endY}
        stroke={color} strokeWidth={thickness}
        strokeLinecap="round"
      />
      <polygon
        points={`${busX},${startY} ${busX - arrowSize / 2},${startY + arrowSize} ${busX + arrowSize / 2},${startY + arrowSize}`}
        fill={color}
      />
      <polygon
        points={`${busX},${endY} ${busX - arrowSize / 2},${endY - arrowSize} ${busX + arrowSize / 2},${endY - arrowSize}`}
        fill={color}
      />
      <text
        x={busX - 8} y={midY}
        textAnchor="middle"
        fontSize={9.5} fontWeight="600" fill={color}
        transform={`rotate(-90, ${busX - 8}, ${midY})`}
        fontFamily="Poppins, Inter, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}
