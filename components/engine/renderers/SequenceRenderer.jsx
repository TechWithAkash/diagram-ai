'use client'

import React from 'react'

/**
 * Helper to render multi-line notes on the left/right of lifelines
 */
const renderSideNote = (text, x, y, anchor, color = '#475569') => {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <text
      x={x}
      y={y - (lines.length - 1) * 6 + 3}
      textAnchor={anchor}
      fontSize={10}
      fontWeight="600"
      fill={color}
      fontFamily="Poppins, Inter, sans-serif"
    >
      {lines.map((line, idx) => (
        <tspan key={idx} x={x} dy={idx > 0 ? 12 : 0}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

/**
 * SequenceRenderer — handles 'sequence' type schemas
 * Used for: TCP Handshake, HTTP Request/Response, DNS Resolution, JWT Auth Flow, etc.
 */
export default function SequenceRenderer({ schema }) {
  const { participants = [], messages = [], notes = [], viewBox } = schema
  const { width, height } = viewBox

  const isTextbook = schema.theme === 'textbook'
  const PARTICIPANT_H  = 44
  const PARTICIPANT_W  = 130
  const TOP_MARGIN     = 20
  const LIFELINE_START = TOP_MARGIN + PARTICIPANT_H
  
  const bottomTitle = schema.bottomTitle
  const hasBottomTitle = !!bottomTitle
  const titleHeight = hasBottomTitle ? 30 : 0
  const noteHeight     = notes.length * 18
  const LIFELINE_END   = height - 35 - noteHeight - titleHeight

  const MSG_SPACING    = schema.slanted ? 70 : 54
  const FIRST_MSG_Y    = LIFELINE_START + 30
  const slant          = schema.slanted ? (schema.slantHeight || 25) : 0

  // Calculate participant X positions (evenly spaced to prevent clipping)
  const n = participants.length
  const marginOffset = schema.marginOffset || (schema.slanted ? 50 : 25)
  const horizontalMargin = PARTICIPANT_W / 2 + marginOffset
  const activeWidth = width - 2 * horizontalMargin
  const spacing = n > 1 ? activeWidth / (n - 1) : 0

  const pMap = {}
  participants.forEach((p, i) => {
    pMap[p.id] = { ...p, cx: horizontalMargin + i * spacing }
  })

  return (
    <g>
      {/* Participant boxes */}
      {participants.map(p => {
        const { cx } = pMap[p.id]
        const bg     = isTextbook ? '#FFFFFF' : (p.color       || '#EEF2FF')
        const stroke = isTextbook ? '#000000' : (p.borderColor || '#6366F1')
        const text   = isTextbook ? '#000000' : (p.textColor   || '#312E81')
        const rx     = isTextbook ? 0 : 8
        const strokeWidth = isTextbook ? 2.5 : 2

        return (
          <g key={p.id}>
            <rect
              x={cx - PARTICIPANT_W / 2} y={TOP_MARGIN}
              width={PARTICIPANT_W} height={PARTICIPANT_H}
              fill={bg} stroke={stroke} strokeWidth={strokeWidth} rx={rx}
            />
            <text
              x={cx} y={TOP_MARGIN + PARTICIPANT_H / 2 + 5}
              textAnchor="middle"
              fontSize={12} fontWeight="700" fill={text}
              fontFamily="Poppins, Inter, sans-serif"
            >
              {p.label}
            </text>
            {/* Lifeline */}
            <line
              x1={cx} y1={LIFELINE_START}
              x2={cx} y2={LIFELINE_END}
              stroke={stroke}
              strokeWidth={isTextbook ? 3 : 1.5}
              strokeDasharray={isTextbook ? 'none' : '7,4'}
              opacity={isTextbook ? 1 : 0.5}
            />
          </g>
        )
      })}

      {/* Messages */}
      {messages.map((msg, i) => {
        const fromP = pMap[msg.from]
        const toP   = pMap[msg.to]
        if (!fromP || !toP) return null

        const yStart  = FIRST_MSG_Y + i * MSG_SPACING
        const yEnd    = yStart + slant
        const fromX   = fromP.cx
        const toX     = toP.cx
        const goRight = toX > fromX
        const arrowX  = toX + (goRight ? -8 : 8)
        const arrowW  = 9

        const isData    = msg.type === 'data'
        const dashArray = isData ? '5,3' : '0'
        
        // Support custom message colors
        const lineColor = msg.color || (isData ? '#94A3B8' : '#6366F1')
        const arrowColor = lineColor

        const fromAnchor = fromX < toX ? 'end' : 'start'
        const toAnchor = toX < fromX ? 'end' : 'start'

        const fromNoteX = fromX + (fromX < toX ? -15 : 15)
        const toNoteX = toX + (toX < fromX ? -15 : 15)

        const hideAct = schema.hideActivation || isTextbook

        const labelX = (fromX + toX) / 2
        const labelY = yStart + slant / 2

        return (
          <g key={i}>
            {/* Activation box on sender */}
            {!hideAct && (
              <rect
                x={fromX - 6} y={yStart - 12}
                width={12} height={24}
                fill="#F0F9FF" stroke="#93C5FD" strokeWidth={1} rx={2}
              />
            )}

            {/* Side-notes on lifelines (Textbook style) */}
            {msg.fromNote && renderSideNote(msg.fromNote, fromNoteX, yStart, fromAnchor, isTextbook ? lineColor : '#475569')}
            {msg.toNote && renderSideNote(msg.toNote, toNoteX, yEnd, toAnchor, isTextbook ? lineColor : '#475569')}

            {/* Arrow line */}
            <line
              x1={fromX} y1={yStart}
              x2={arrowX} y2={yEnd}
              stroke={lineColor} strokeWidth={2}
              strokeDasharray={dashArray}
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            {goRight ? (
              <polygon
                points={`${toX},${yEnd} ${toX - arrowW},${yEnd - arrowW / 2} ${toX - arrowW},${yEnd + arrowW / 2}`}
                fill={arrowColor}
              />
            ) : (
              <polygon
                points={`${toX},${yEnd} ${toX + arrowW},${yEnd - arrowW / 2} ${toX + arrowW},${yEnd + arrowW / 2}`}
                fill={arrowColor}
              />
            )}

            {/* Message label */}
            <rect
              x={labelX - 80} y={labelY - 14}
              width={160} height={14}
              fill="white" opacity={0.9} rx={3}
            />
            <text
              x={labelX} y={labelY - 2}
              textAnchor="middle"
              fontSize={10} fontWeight="600" fill={isTextbook ? '#000000' : '#312E81'}
              fontFamily="Poppins, Inter, sans-serif"
            >
              {msg.label}
            </text>

            {/* State note */}
            {msg.state && (
              <text
                x={labelX} y={labelY + 12}
                textAnchor="middle"
                fontSize={8.5} fill="#64748B" fontStyle="italic"
                fontFamily="Poppins, Inter, sans-serif"
              >
                {msg.state}
              </text>
            )}
          </g>
        )
      })}

      {/* Bottom title (underlined, centered) */}
      {bottomTitle && (
        <g>
          <text
            x={width / 2}
            y={LIFELINE_END + 30}
            textAnchor="middle"
            fontSize={14}
            fontWeight="700"
            fill={isTextbook ? '#000000' : '#1E293B'}
            fontFamily="Poppins, Inter, sans-serif"
          >
            {bottomTitle}
          </text>
          <line
            x1={width / 2 - bottomTitle.length * 4.2}
            y1={LIFELINE_END + 36}
            x2={width / 2 + bottomTitle.length * 4.2}
            y2={LIFELINE_END + 36}
            stroke={isTextbook ? '#000000' : '#1E293B'}
            strokeWidth={1.5}
          />
        </g>
      )}

      {/* Bottom notes */}
      {notes.map((note, i) => (
        <text
          key={i}
          x={20}
          y={LIFELINE_END + 20 + titleHeight + i * 16}
          fontSize={10}
          fontWeight="500"
          fill="#475569"
          fontFamily="Poppins, Inter, sans-serif"
        >
          • {note}
        </text>
      ))}
    </g>
  )
}
