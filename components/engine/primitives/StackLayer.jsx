'use client'

import React from 'react'

/**
 * StackLayer — horizontal layer row for OSI/TCP-IP/Memory Hierarchy diagrams
 */
export default function StackLayer({ layer, x, y, width, height, index, total }) {
  const {
    number,
    name,
    protocols,
    color = '#E2E8F0',
    pdu,
    device,
    osiEquivalent,
  } = layer

  const textColor = getContrastColor(color)
  const paddingLeft = number !== undefined ? 56 : 16
  const nameX = x + paddingLeft
  const protocolX = x + paddingLeft
  const isTop = index === 0
  const isBottom = index === total - 1
  const rx = isTop ? 10 : isBottom ? 10 : 0
  const ry = rx

  // Rounded corners: top-left/right only for first, bottom-left/right for last
  const clipPath = isTop
    ? `M ${x + rx},${y} h ${width - 2 * rx} a ${rx},${rx} 0 0 1 ${rx},${rx} v ${height - rx} h ${-width} v ${-(height - rx)} a ${rx},${rx} 0 0 1 ${rx},${-rx} z`
    : isBottom
    ? `M ${x},${y} h ${width} v ${height - rx} a ${rx},${rx} 0 0 1 ${-rx},${rx} h ${-(width - 2 * rx)} a ${rx},${rx} 0 0 1 ${-rx},${-rx} v ${-(height - rx)} z`
    : `M ${x},${y} h ${width} v ${height} h ${-width} z`

  return (
    <g>
      <path d={clipPath} fill={color} stroke="white" strokeWidth={1.5} />

      {/* Layer number badge */}
      {number !== undefined && (
        <>
          <rect x={x + 8} y={y + (height - 28) / 2} width={38} height={28} rx={6} fill="rgba(0,0,0,0.18)" />
          <text
            x={x + 27} y={y + height / 2 + 5}
            textAnchor="middle"
            fontSize={13}
            fontWeight="800"
            fill="white"
            fontFamily="Poppins, Inter, sans-serif"
          >
            {number}
          </text>
        </>
      )}

      {/* Layer name */}
      <text
        x={nameX}
        y={y + (protocols ? height / 2 - 3 : height / 2 + 5)}
        fontSize={12}
        fontWeight="700"
        fill={textColor}
        fontFamily="Poppins, Inter, sans-serif"
      >
        {name}
      </text>

      {/* Protocols */}
      {protocols && (
        <text
          x={protocolX}
          y={y + height / 2 + 12}
          fontSize={9.5}
          fill={textColor}
          opacity={0.85}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {protocols}
        </text>
      )}

      {/* PDU badge on the right */}
      {pdu && (
        <>
          <rect x={x + width - 80} y={y + (height - 20) / 2} width={72} height={20} rx={10} fill="rgba(255,255,255,0.3)" />
          <text
            x={x + width - 44} y={y + height / 2 + 4}
            textAnchor="middle"
            fontSize={9}
            fontWeight="600"
            fill={textColor}
            fontFamily="Poppins, Inter, sans-serif"
          >
            {pdu}
          </text>
        </>
      )}
    </g>
  )
}

/** Returns black or white text depending on background brightness */
function getContrastColor(hex) {
  try {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.slice(0, 2), 16)
    const g = parseInt(clean.slice(2, 4), 16)
    const b = parseInt(clean.slice(4, 6), 16)
    // luminance formula
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.55 ? '#1E293B' : '#FFFFFF'
  } catch {
    return '#1E293B'
  }
}
