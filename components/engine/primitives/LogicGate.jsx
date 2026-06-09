'use client'

import React from 'react'

/**
 * LogicGate - renders a standard logic gate (AND, OR, NOT, NAND, NOR, XOR)
 * Centered at (x, y) with nominal width 60 and height 40.
 * Output is at:
 *  - (x + 25, y) for NOT
 *  - (x + 30, y) for others
 * Inputs are at:
 *  - (x - 30, y) for 1-input NOT
 *  - (x - 30, y - 10) & (x - 30, y + 10) for 2-input gates
 *  - (x - 30, y - 15), (x - 30, y), & (x - 30, y + 15) for 3-input gates
 */
export default function LogicGate({
  type = 'AND',
  x = 0,
  y = 0,
  label,
  color = '#F8FAFC',
  borderColor = '#475569',
}) {
  const gateType = type.toUpperCase()

  // Define paths and elements for each gate type centered at (0, 0)
  let mainPath = ''
  let extraElements = null

  switch (gateType) {
    case 'AND':
      // Proper IEEE AND gate: flat left edge, curved right side using cubic bezier
      mainPath = 'M -30 -20 L 5 -20 C 30 -20 30 20 5 20 L -30 20 Z'
      // Short output stub from curve tip to port
      extraElements = (
        <line x1={18} y1={0} x2={30} y2={0} stroke={borderColor} strokeWidth={2} />
      )
      break

    case 'NAND':
      // AND body shortened slightly so bubble fits
      mainPath = 'M -30 -20 L 0 -20 C 22 -20 22 20 0 20 L -30 20 Z'
      extraElements = (
        <>
          <line x1={14} y1={0} x2={20} y2={0} stroke={borderColor} strokeWidth={2} />
          <circle cx={25} cy={0} r={5} fill={color} stroke={borderColor} strokeWidth={2} />
        </>
      )
      break

    case 'OR':
      // IEEE OR gate: curved left back, pointed right tip
      mainPath = 'M -30 -20 Q -10 -20 15 0 Q -10 20 -30 20 Q -12 0 -30 -20 Z'
      break

    case 'NOR':
      // OR body ending at ~10, then bubble
      mainPath = 'M -30 -20 Q -10 -20 10 0 Q -10 20 -30 20 Q -12 0 -30 -20 Z'
      extraElements = (
        <>
          <line x1={10} y1={0} x2={20} y2={0} stroke={borderColor} strokeWidth={2} />
          <circle cx={25} cy={0} r={5} fill={color} stroke={borderColor} strokeWidth={2} />
        </>
      )
      break

    case 'XOR':
      // OR shape with extra back curve
      mainPath = 'M -30 -20 Q -10 -20 15 0 Q -10 20 -30 20 Q -12 0 -30 -20 Z'
      extraElements = (
        <>
          {/* Extra back curve (the XOR distinguishing mark) */}
          <path
            d="M -36 -20 Q -18 0 -36 20"
            fill="none"
            stroke={borderColor}
            strokeWidth={2}
          />
          {/* Small input extension lines to clear the extra curve */}
          <line x1={-30} y1={-10} x2={-33} y2={-10} stroke={borderColor} strokeWidth={2} />
          <line x1={-30} y1={10} x2={-33} y2={10} stroke={borderColor} strokeWidth={2} />
        </>
      )
      break

    case 'NOT':
      // Triangle pointing right, bubble at tip
      mainPath = 'M -25 -18 L 15 0 L -25 18 Z'
      extraElements = (
        <>
          <circle cx={20} cy={0} r={5} fill={color} stroke={borderColor} strokeWidth={2} />
          {/* Input lead line */}
          <line x1={-30} y1={0} x2={-25} y2={0} stroke={borderColor} strokeWidth={2} />
        </>
      )
      break

    default:
      // Fallback rectangular block
      mainPath = 'M -30 -20 L 30 -20 L 30 20 L -30 20 Z'
      break
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Drop shadow for the gate */}
      <path
        d={mainPath}
        fill="rgba(0, 0, 0, 0.05)"
        transform="translate(1.5, 1.5)"
      />
      {extraElements && (
        <g transform="translate(1.5, 1.5)" opacity="0.05">
          {extraElements}
        </g>
      )}

      {/* Main gate shape */}
      <path
        d={mainPath}
        fill={color}
        stroke={borderColor}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Additional gate-specific elements (bubbles, extra curves) */}
      {extraElements}

      {/* Label above the gate */}
      {label && (
        <text
          x={0}
          y={-26}
          textAnchor="middle"
          fontSize={10}
          fontWeight="600"
          fill="#475569"
          fontFamily="Poppins, Inter, sans-serif"
        >
          {label}
        </text>
      )}
    </g>
  )
}
