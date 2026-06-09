'use client'

import React from 'react'

/**
 * SequentialFlowRenderer — handles 'sequential-flow' type schemas
 * Used for: Waterfall Model, Compiler Phases, Agile Scrum, V-Model, etc.
 */
export default function SequentialFlowRenderer({ schema }) {
  const { phases = [], viewBox, layout } = schema
  const { width, height } = viewBox

  // V-shape layout (for V-Model)
  if (layout === 'v-shape') {
    return <VShapeLayout phases={phases} width={width} height={height} />
  }

  // Standard top-down sequential flow
  return <SequentialLayout phases={phases} width={width} height={height} />
}

// ─── Standard sequential (Waterfall, Compiler, Agile, etc.) ─────────────────
function SequentialLayout({ phases, width, height }) {
  const MARGIN_X     = 40
  const MARGIN_TOP   = 20
  const PHASE_HEIGHT = 68
  const ARROW_HEIGHT = 30
  const boxWidth     = width - MARGIN_X * 2
  const total        = phases.length
  const totalH       = total * PHASE_HEIGHT + (total - 1) * ARROW_HEIGHT

  // Center vertically if there's space
  const startY = Math.max(MARGIN_TOP, (height - totalH) / 2)

  return (
    <g>
      {phases.map((phase, i) => {
        const boxY  = startY + i * (PHASE_HEIGHT + ARROW_HEIGHT)
        const arrowY1 = boxY  + PHASE_HEIGHT
        const arrowY2 = arrowY1 + ARROW_HEIGHT

        const bg     = phase.color       || '#EEF2FF'
        const stroke = phase.borderColor || '#6366F1'
        const text   = phase.textColor   || '#312E81'

        return (
          <g key={phase.id || i}>
            {/* Phase box */}
            <rect
              x={MARGIN_X} y={boxY}
              width={boxWidth} height={PHASE_HEIGHT}
              fill={bg} stroke={stroke} strokeWidth={2} rx={10}
            />

            {/* Phase name */}
            <text
              x={MARGIN_X + boxWidth / 2}
              y={boxY + (phase.description ? 22 : PHASE_HEIGHT / 2 + 5)}
              textAnchor="middle"
              fontSize={13}
              fontWeight="700"
              fill={text}
              fontFamily="Poppins, Inter, sans-serif"
            >
              {phase.name}
            </text>

            {/* Description */}
            {phase.description && (
              <foreignObject
                x={MARGIN_X + 10}
                y={boxY + 28}
                width={boxWidth - 20}
                height={PHASE_HEIGHT - 32}
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    fontSize: '9.5px',
                    color: text,
                    lineHeight: '1.4',
                    opacity: 0.85,
                    fontFamily: 'Poppins, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  {phase.description}
                </div>
              </foreignObject>
            )}

            {/* Arrow to next */}
            {i < phases.length - 1 && (
              <g>
                <line
                  x1={MARGIN_X + boxWidth / 2} y1={arrowY1}
                  x2={MARGIN_X + boxWidth / 2} y2={arrowY2 - 6}
                  stroke="#CBD5E1" strokeWidth={2} strokeLinecap="round"
                />
                <polygon
                  points={`
                    ${MARGIN_X + boxWidth / 2 - 7},${arrowY2 - 6}
                    ${MARGIN_X + boxWidth / 2 + 7},${arrowY2 - 6}
                    ${MARGIN_X + boxWidth / 2},${arrowY2}
                  `}
                  fill="#CBD5E1"
                />
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
}

// ─── V-Shape layout (for V-Model) ────────────────────────────────────────────
function VShapeLayout({ phases, width, height }) {
  const leftPhases   = phases.filter(p => p.side === 'left')
  const centerPhase  = phases.find(p => p.side === 'center')
  const rightPhases  = phases.filter(p => p.side === 'right')

  const BOX_W = 200
  const BOX_H = 56
  const INDENT = 28
  const GAP_Y = 12
  const START_Y = 20
  const CENTER_Y = height - 100

  const leftX  = 20
  const rightX = width - BOX_W - 20
  const centerX = (width - BOX_W) / 2

  return (
    <g>
      {/* Left side — development phases */}
      {leftPhases.map((phase, i) => {
        const x = leftX + i * INDENT
        const y = START_Y + i * (BOX_H + GAP_Y)
        return (
          <PhaseBox key={phase.id} phase={phase} x={x} y={y} w={BOX_W} h={BOX_H} />
        )
      })}

      {/* Center — coding */}
      {centerPhase && (
        <PhaseBox phase={centerPhase} x={centerX} y={CENTER_Y} w={BOX_W + 20} h={BOX_H + 10} />
      )}

      {/* Right side — testing phases (mirrored) */}
      {rightPhases.map((phase, i) => {
        const reverseI = rightPhases.length - 1 - i
        const x = rightX - reverseI * INDENT
        const y = START_Y + i * (BOX_H + GAP_Y)
        return (
          <PhaseBox key={phase.id} phase={phase} x={x} y={y} w={BOX_W} h={BOX_H} />
        )
      })}

      {/* Horizontal dashed lines connecting each left to right */}
      {leftPhases.map((lp, i) => {
        if (i >= rightPhases.length) return null
        const lx = leftX + i * INDENT + BOX_W
        const rx = rightX - (rightPhases.length - 1 - i) * INDENT
        const ly = START_Y + i * (BOX_H + GAP_Y) + BOX_H / 2
        return (
          <line
            key={`h-${i}`}
            x1={lx} y1={ly}
            x2={rx} y2={ly}
            stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="5,3"
          />
        )
      })}

      {/* Labels: Verification / Validation */}
      <text x={20}         y={height - 10} fontSize={10} fill="#94A3B8" fontFamily="Poppins,sans-serif">← Verification (Building Product Right)</text>
      <text x={width - 20} y={height - 10} textAnchor="end" fontSize={10} fill="#94A3B8" fontFamily="Poppins,sans-serif">Validation (Building Right Product) →</text>
    </g>
  )
}

function PhaseBox({ phase, x, y, w, h }) {
  const bg     = phase.color       || '#EEF2FF'
  const stroke = phase.borderColor || '#6366F1'
  const text   = phase.textColor   || '#312E81'
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={bg} stroke={stroke} strokeWidth={1.5} rx={8} />
      <text x={x + w / 2} y={y + (phase.description ? 18 : h / 2 + 4)} textAnchor="middle" fontSize={10} fontWeight="700" fill={text} fontFamily="Poppins,sans-serif">
        {phase.name}
      </text>
      {phase.description && (
        <text x={x + w / 2} y={y + 32} textAnchor="middle" fontSize={8.5} fill={text} opacity={0.8} fontFamily="Poppins,sans-serif">
          {phase.description.substring(0, 40)}{phase.description.length > 40 ? '…' : ''}
        </text>
      )}
    </g>
  )
}
