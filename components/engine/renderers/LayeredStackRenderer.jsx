'use client'

import React from 'react'
import StackLayer from '../primitives/StackLayer'

/**
 * LayeredStackRenderer — handles 'layered-stack' type schemas
 * Used for: OSI Model, TCP/IP, Memory Hierarchy, DBMS Three-Schema, etc.
 */
export default function LayeredStackRenderer({ schema }) {
  const { layers = [], viewBox, sideLabels } = schema
  const { width, height } = viewBox

  // Layout constants
  const MARGIN_TOP    = 45
  const MARGIN_BOTTOM = 30
  const MARGIN_LEFT   = 16
  const MARGIN_RIGHT  = 16

  const usableHeight = height - MARGIN_TOP - MARGIN_BOTTOM
  const usableWidth  = width  - MARGIN_LEFT - MARGIN_RIGHT
  const layerHeight  = Math.floor(usableHeight / layers.length)
  const layerGap     = 3

  // Side label presence
  const hasSideLeft  = sideLabels?.left
  const hasSideRight = sideLabels?.right

  const effectiveX = MARGIN_LEFT + (hasSideLeft ? 18 : 0)
  const effectiveW = usableWidth - (hasSideLeft ? 18 : 0) - (hasSideRight ? 18 : 0)

  return (
    <g>
      {/* Title hint / encapsulation label */}
      {hasSideLeft && (
        <text
          x={MARGIN_LEFT + 9}
          y={MARGIN_TOP + usableHeight / 2}
          textAnchor="middle"
          fontSize={9}
          fill="#64748B"
          fontWeight="600"
          fontFamily="Poppins, Inter, sans-serif"
          transform={`rotate(-90, ${MARGIN_LEFT + 9}, ${MARGIN_TOP + usableHeight / 2})`}
        >
          {sideLabels.left}
        </text>
      )}

      {hasSideRight && (
        <text
          x={width - MARGIN_RIGHT - 9}
          y={MARGIN_TOP + usableHeight / 2}
          textAnchor="middle"
          fontSize={9}
          fill="#64748B"
          fontWeight="600"
          fontFamily="Poppins, Inter, sans-serif"
          transform={`rotate(90, ${width - MARGIN_RIGHT - 9}, ${MARGIN_TOP + usableHeight / 2})`}
        >
          {sideLabels.right}
        </text>
      )}

      {/* Layers */}
      {layers.map((layer, i) => {
        const layerY = MARGIN_TOP + i * (layerHeight + layerGap)
        return (
          <StackLayer
            key={layer.number ?? i}
            layer={layer}
            x={effectiveX}
            y={layerY}
            width={effectiveW}
            height={layerHeight - layerGap}
            index={i}
            total={layers.length}
          />
        )
      })}

      {/* Encapsulation arrow: Data flows down on left, up on right */}
      <text
        x={width - 12}
        y={MARGIN_TOP + usableHeight / 2}
        textAnchor="middle"
        fontSize={8}
        fill="#94A3B8"
        fontFamily="Poppins, Inter, sans-serif"
        transform={`rotate(90, ${width - 12}, ${MARGIN_TOP + usableHeight / 2})`}
      >
        ← Decapsulation (Receiver)
      </text>
      <text
        x={12}
        y={MARGIN_TOP + usableHeight / 2}
        textAnchor="middle"
        fontSize={8}
        fill="#94A3B8"
        fontFamily="Poppins, Inter, sans-serif"
        transform={`rotate(-90, 12, ${MARGIN_TOP + usableHeight / 2})`}
      >
        Encapsulation (Sender) →
      </text>
    </g>
  )
}
