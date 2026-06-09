'use client'

import React from 'react'

/**
 * SequenceRenderer — handles 'sequence' type schemas
 * Used for: TCP Handshake, HTTP Request/Response, DNS Resolution, JWT Auth Flow, etc.
 */
export default function SequenceRenderer({ schema }) {
  const { participants = [], messages = [], notes = [], viewBox } = schema
  const { width, height } = viewBox

  const PARTICIPANT_H  = 44
  const PARTICIPANT_W  = 130
  const TOP_MARGIN     = 20
  const LIFELINE_START = TOP_MARGIN + PARTICIPANT_H
  const LIFELINE_END   = height - 30
  const MSG_SPACING    = 54
  const FIRST_MSG_Y    = LIFELINE_START + 30

  // Calculate participant X positions (evenly spaced)
  const n = participants.length
  const spacing = (width - 60) / Math.max(n - 1, 1)

  const pMap = {}
  participants.forEach((p, i) => {
    pMap[p.id] = { ...p, cx: 30 + i * spacing }
  })

  return (
    <g>
      {/* Participant boxes */}
      {participants.map(p => {
        const { cx } = pMap[p.id]
        const bg     = p.color       || '#EEF2FF'
        const stroke = p.borderColor || '#6366F1'
        const text   = p.textColor   || '#312E81'
        return (
          <g key={p.id}>
            <rect
              x={cx - PARTICIPANT_W / 2} y={TOP_MARGIN}
              width={PARTICIPANT_W} height={PARTICIPANT_H}
              fill={bg} stroke={stroke} strokeWidth={2} rx={8}
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
              stroke={stroke} strokeWidth={1.5} strokeDasharray="7,4" opacity={0.5}
            />
          </g>
        )
      })}

      {/* Messages */}
      {messages.map((msg, i) => {
        const fromP = pMap[msg.from]
        const toP   = pMap[msg.to]
        if (!fromP || !toP) return null

        const msgY    = FIRST_MSG_Y + i * MSG_SPACING
        const fromX   = fromP.cx
        const toX     = toP.cx
        const goRight = toX > fromX
        const arrowX  = toX + (goRight ? -10 : 10)
        const arrowW  = 9

        const isData    = msg.type === 'data'
        const dashArray = isData ? '5,3' : '0'
        const lineColor = isData ? '#94A3B8' : '#6366F1'
        const arrowColor = lineColor

        return (
          <g key={i}>
            {/* Activation box on sender */}
            <rect
              x={fromX - 6} y={msgY - 12}
              width={12} height={24}
              fill="#F0F9FF" stroke="#93C5FD" strokeWidth={1} rx={2}
            />

            {/* Arrow line */}
            <line
              x1={fromX} y1={msgY}
              x2={arrowX} y2={msgY}
              stroke={lineColor} strokeWidth={2}
              strokeDasharray={dashArray}
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            {goRight ? (
              <polygon
                points={`${toX},${msgY} ${toX - arrowW},${msgY - arrowW / 2} ${toX - arrowW},${msgY + arrowW / 2}`}
                fill={arrowColor}
              />
            ) : (
              <polygon
                points={`${toX},${msgY} ${toX + arrowW},${msgY - arrowW / 2} ${toX + arrowW},${msgY + arrowW / 2}`}
                fill={arrowColor}
              />
            )}

            {/* Message label */}
            <rect
              x={(fromX + toX) / 2 - 80} y={msgY - 16}
              width={160} height={14}
              fill="white" opacity={0.9} rx={3}
            />
            <text
              x={(fromX + toX) / 2} y={msgY - 4}
              textAnchor="middle"
              fontSize={10} fontWeight="600" fill="#312E81"
              fontFamily="Poppins, Inter, sans-serif"
            >
              {msg.label}
            </text>

            {/* State note */}
            {msg.state && (
              <text
                x={(fromX + toX) / 2} y={msgY + 16}
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

      {/* Bottom notes */}
      {notes.map((note, i) => (
        <text
          key={i}
          x={20}
          y={LIFELINE_END + 15 + i * 14}
          fontSize={9}
          fill="#94A3B8"
          fontFamily="Poppins, Inter, sans-serif"
        >
          {note}
        </text>
      ))}
    </g>
  )
}
