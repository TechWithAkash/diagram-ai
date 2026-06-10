'use client'

import React from 'react'

/**
 * CircuitSymbol — renders standard IEC/ANSI analog circuit schematic symbols.
 * Each symbol is centered at (0, 0) locally, then translated to (x, y).
 *
 * Supported type values:
 *  diode, resistor, capacitor, ground, ac-source, dc-source,
 *  op-amp, wire-junction, node-label, vcc-rail, gnd-rail
 */
export default function CircuitSymbol({
  type = 'resistor',
  x = 0,
  y = 0,
  rotation = 0,
  label,
  fill = '#F8FAFC',
  borderColor = '#334155',
  labelSize = 10,
}) {
  const symType = type.toLowerCase()

  // Wire / label-only types — no drop shadow
  const isWireType = symType === 'wire-junction' || symType === 'node-label'

  let symbol = null
  let shadowSymbol = null
  let labelElement = null

  switch (symType) {
    // ─────────────────────────── DIODE ───────────────────────────
    case 'diode': {
      const body = (
        <>
          {/* Triangle pointing right */}
          <polygon
            points="-15,-12 15,0 -15,12"
            fill={fill}
            stroke={borderColor}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Cathode bar */}
          <line x1={15} y1={-12} x2={15} y2={12} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Lead lines */}
          <line x1={-20} y1={0} x2={-15} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={15} y1={0} x2={20} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <polygon points="-15,-12 15,0 -15,12" fill="black" />
          <line x1={15} y1={-12} x2={15} y2={12} stroke="black" strokeWidth={2} />
        </g>
      )
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text
          x={isRotated ? 26 : 0}
          y={isRotated ? 4 : 24}
          transform={`rotate(${-rotation})`}
          textAnchor={isRotated ? "start" : "middle"}
          fontSize={labelSize}
          fontWeight="600"
          fill={borderColor}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── RESISTOR ───────────────────────────
    case 'resistor': {
      const body = (
        <>
          {/* IEC rectangle body */}
          <rect x={-20} y={-8} width={40} height={16} fill={fill} stroke={borderColor} strokeWidth={2} rx={1} />
          {/* Lead lines */}
          <line x1={-28} y1={0} x2={-20} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={20} y1={0} x2={28} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <rect x={-20} y={-8} width={40} height={16} fill="black" />
        </g>
      )
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text
          x={isRotated ? 26 : 0}
          y={isRotated ? 4 : 22}
          transform={`rotate(${-rotation})`}
          textAnchor={isRotated ? "start" : "middle"}
          fontSize={labelSize}
          fontWeight="600"
          fill={borderColor}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── CAPACITOR ───────────────────────────
    case 'capacitor': {
      const body = (
        <>
          {/* Left plate */}
          <line x1={-4} y1={-14} x2={-4} y2={14} stroke={borderColor} strokeWidth={3} strokeLinecap="round" />
          {/* Right plate */}
          <line x1={4} y1={-14} x2={4} y2={14} stroke={borderColor} strokeWidth={3} strokeLinecap="round" />
          {/* Lead lines */}
          <line x1={-14} y1={0} x2={-4} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={4} y1={0} x2={14} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      // No structural shadow needed for lines, use a light glow rect
      shadowSymbol = null
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text
          x={isRotated ? 20 : 0}
          y={isRotated ? 4 : 24}
          transform={`rotate(${-rotation})`}
          textAnchor={isRotated ? "start" : "middle"}
          fontSize={labelSize}
          fontWeight="600"
          fill={borderColor}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── GROUND ───────────────────────────
    case 'ground':
    case 'gnd-rail': {
      const body = (
        <>
          {/* Vertical lead */}
          <line x1={0} y1={-12} x2={0} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Three horizontal lines, decreasing width */}
          <line x1={-10} y1={0} x2={10} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={-6} y1={5} x2={6} y2={5} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={-2} y1={10} x2={2} y2={10} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = null
      labelElement = null
      break
    }

    // ─────────────────────────── AC SOURCE ───────────────────────────
    case 'ac-source': {
      const body = (
        <>
          {/* Circle */}
          <circle cx={0} cy={0} r={18} fill={fill} stroke={borderColor} strokeWidth={2} />
          {/* Sine wave inside */}
          <path d="M -10 0 Q -5 -8 0 0 Q 5 8 10 0" fill="none" stroke={borderColor} strokeWidth={1.5} strokeLinecap="round" />
          {/* Lead lines — top and bottom */}
          <line x1={0} y1={-18} x2={0} y2={-26} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={0} y1={18} x2={0} y2={26} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <circle cx={0} cy={0} r={18} fill="black" />
        </g>
      )
      labelElement = label && (
        <text x={-28} y={4} transform={`rotate(${-rotation})`} textAnchor="end" fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── DC SOURCE ───────────────────────────
    case 'dc-source': {
      const body = (
        <>
          {/* Circle */}
          <circle cx={0} cy={0} r={18} fill={fill} stroke={borderColor} strokeWidth={2} />
          {/* Plus sign */}
          <text x={0} y={-2} textAnchor="middle" fontSize={12} fontWeight="700" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
            +
          </text>
          {/* Minus sign */}
          <text x={0} y={13} textAnchor="middle" fontSize={13} fontWeight="700" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
            −
          </text>
          {/* Lead lines — top and bottom */}
          <line x1={0} y1={-18} x2={0} y2={-26} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={0} y1={18} x2={0} y2={26} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <circle cx={0} cy={0} r={18} fill="black" />
        </g>
      )
      labelElement = label && (
        <text x={-28} y={4} transform={`rotate(${-rotation})`} textAnchor="end" fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── OP-AMP ───────────────────────────
    case 'op-amp': {
      const body = (
        <>
          {/* Main triangle body pointing RIGHT */}
          <polygon
            points="-30,-36 -30,36 30,0"
            fill={fill}
            stroke={borderColor}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* IN+ input stub (non-inverting, lower = positive) */}
          <line x1={-40} y1={-20} x2={-30} y2={-20} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* IN- input stub (inverting, upper = negative) */}
          <line x1={-40} y1={20} x2={-30} y2={20} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* OUT output stub */}
          <line x1={30} y1={0} x2={40} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* + and − labels inside triangle */}
          <text x={-22} y={-15} textAnchor="middle" fontSize={10} fontWeight="700" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
            +
          </text>
          <text x={-22} y={25} textAnchor="middle" fontSize={11} fontWeight="700" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
            −
          </text>
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <polygon points="-30,-36 -30,36 30,0" fill="black" />
        </g>
      )
      labelElement = label && (
        <text x={0} y={-44} transform={`rotate(${-rotation})`} textAnchor="middle" fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── WIRE JUNCTION ───────────────────────────
    case 'wire-junction': {
      symbol = (
        <circle cx={0} cy={0} r={4} fill={borderColor} />
      )
      shadowSymbol = null
      labelElement = null
      break
    }

    // ─────────────────────────── NODE LABEL ───────────────────────────
    case 'node-label': {
      symbol = (
        <text
          x={0}
          y={0}
          transform={`rotate(${-rotation})`}
          textAnchor="middle"
          fontSize={labelSize}
          fontWeight="600"
          fill={borderColor}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {label}
        </text>
      )
      shadowSymbol = null
      labelElement = null
      break
    }

    // ─────────────────────────── VCC RAIL ───────────────────────────
    case 'vcc-rail': {
      const body = (
        <>
          {/* Vertical line going up */}
          <line x1={0} y1={0} x2={0} y2={-20} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Triangle pointing up at top */}
          <polygon points="-6,-20 6,-20 0,-30" fill={borderColor} />
        </>
      )
      symbol = body
      shadowSymbol = null
      labelElement = label && (
        <text x={0} y={-34} transform={`rotate(${-rotation})`} textAnchor="middle" fontSize={labelSize} fontWeight="700" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── FALLBACK ───────────────────────────
    default: {
      symbol = (
        <rect x={-20} y={-10} width={40} height={20} fill={fill} stroke={borderColor} strokeWidth={2} rx={3} />
      )
      shadowSymbol = null
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text
          x={isRotated ? 26 : 0}
          y={isRotated ? 4 : 20}
          transform={`rotate(${-rotation})`}
          textAnchor={isRotated ? "start" : "middle"}
          fontSize={labelSize}
          fontWeight="600"
          fill={borderColor}
          fontFamily="Poppins, Inter, sans-serif"
        >
          {label}
        </text>
      )
    }
  }

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Drop shadow for structural components */}
      {!isWireType && shadowSymbol}

      {/* Main symbol */}
      {symbol}

      {/* Label */}
      {labelElement}
    </g>
  )
}
