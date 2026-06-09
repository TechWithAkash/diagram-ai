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
  let perpX = -unitY * 55
  let perpY =  unitX * 55

  // Support explicit vertical top/bottom curves
  if (curve === 'top' || transition.curve === 'top') {
    if (Math.abs(unitX) > 0.3) {
      perpX = 0
      perpY = -Math.abs(perpY || 55)
    }
  } else if (curve === 'bottom' || transition.curve === 'bottom') {
    if (Math.abs(unitX) > 0.3) {
      perpX = 0
      perpY = Math.abs(perpY || 55)
    }
  }

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

  const lineStrokeColor = '#64748B' // darker slate for premium contrast

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={lineStrokeColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polygon points={`${endX},${endY} ${ax1},${ay1} ${ax2},${ay2}`} fill={lineStrokeColor} />

      {/* Label */}
      {lines.length > 0 && (() => {
        const maxChar = Math.max(...lines.map(l => l.length))
        const boxWidth = Math.max(65, maxChar * 6.0 + 14)
        const lineHeight = 13
        const totalHeight = lines.length * lineHeight
        const boxHeight = totalHeight + 10
        const boxY = lblY - boxHeight / 2
        return (
          <g>
            <rect
              x={lblX - boxWidth / 2}
              y={boxY}
              width={boxWidth}
              height={boxHeight}
              fill="white"
              opacity={0.96}
              rx={6}
              stroke="#CBD5E1"
              strokeWidth={1}
              filter="url(#block-shadow)"
            />
            {lines.map((line, li) => {
              const lineY = lblY - (totalHeight / 2) + (li + 0.5) * lineHeight
              return (
                <text
                  key={li}
                  x={lblX}
                  y={lineY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9.5}
                  fontWeight="600"
                  fill="#334155"
                  fontFamily="Poppins, Inter, sans-serif"
                >
                  {line}
                </text>
              )
            })}
          </g>
        )
      })()}
    </g>
  )
}
