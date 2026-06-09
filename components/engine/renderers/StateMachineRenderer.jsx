'use client'

import React from 'react'
import StateCircle from '../primitives/StateCircle'

/**
 * StateMachineRenderer — handles 'state-machine' type schemas
 * Used for: Process Life Cycle, DFA, Traffic Light State Machine, etc.
 */
export default function StateMachineRenderer({ schema }) {
  const { states = [], transitions = [] } = schema

  // Build state position map
  const stateMap = {}
  states.forEach(s => { stateMap[s.id] = s })

  return (
    <g>
      {/* Render transitions first (under circles) */}
      {transitions.map((t, i) => (
        <TransitionArrow
          key={i}
          transition={t}
          stateMap={stateMap}
          index={i}
        />
      ))}

      {/* Render state circles on top */}
      {states.map(state => (
        <StateCircle key={state.id} state={state} />
      ))}
    </g>
  )
}

// ─── Transition Arrow with label ─────────────────────────────────────────────
function TransitionArrow({ transition, stateMap, index }) {
  const from = stateMap[transition.from]
  const to   = stateMap[transition.to]
  if (!from || !to) return null

  const { label = '', curve = 'straight' } = transition

  // Start: edge of 'from' circle, End: edge of 'to' circle
  const dx = to.x - from.x
  const dy = to.y - from.y
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const unitX = dx / dist
  const unitY = dy / dist

  const r1 = from.r || 40
  const r2 = to.r   || 40

  const startX = from.x + unitX * r1
  const startY = from.y + unitY * r1
  const endX   = to.x   - unitX * r2
  const endY   = to.y   - unitY * r2

  // Mid-point for label placement
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2

  // Curved control point — offset perpendicular to avoid overlap with return arrows
  const perpX = -unitY * 55
  const perpY =  unitX * 55
  const cpX   = midX + perpX
  const cpY   = midY + perpY

  // Path
  const useCurve = curve !== 'straight' || transition.curve === 'top' || transition.curve === 'bottom'
  const d = useCurve
    ? `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`
    : `M ${startX} ${startY} L ${endX} ${endY}`

  // Arrowhead at end
  const arrowAngle = useCurve
    ? Math.atan2(endY - cpY, endX - cpX)
    : Math.atan2(dy, dx)
  const arrowSize = 9
  const ax1 = endX - arrowSize * Math.cos(arrowAngle - 0.4)
  const ay1 = endY - arrowSize * Math.sin(arrowAngle - 0.4)
  const ax2 = endX - arrowSize * Math.cos(arrowAngle + 0.4)
  const ay2 = endY - arrowSize * Math.sin(arrowAngle + 0.4)

  // Label position: control point for curved, midpoint for straight
  const lblX = useCurve ? cpX : midX
  const lblY = useCurve ? cpY : midY

  // Multi-line label handling
  const lines = label.split('\n').filter(Boolean)

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke="#94A3B8"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polygon points={`${endX},${endY} ${ax1},${ay1} ${ax2},${ay2}`} fill="#94A3B8" />

      {/* Label */}
      {lines.length > 0 && (
        <g>
          <rect
            x={lblX - 60} y={lblY - lines.length * 8 - 4}
            width={120} height={lines.length * 14 + 8}
            fill="white" opacity={0.92} rx={5}
            stroke="#E2E8F0" strokeWidth={1}
          />
          {lines.map((line, li) => (
            <text
              key={li}
              x={lblX}
              y={lblY - (lines.length - 1 - li) * 14 + 2}
              textAnchor="middle"
              fontSize={9.5}
              fontWeight="600"
              fill="#475569"
              fontFamily="Poppins, Inter, sans-serif"
            >
              {line}
            </text>
          ))}
        </g>
      )}
    </g>
  )
}
