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
  mirrorY = false,
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
          {/* Zig-zag resistor body (ANSI standard) */}
          <path
            d="M -20 0 L -16 -8 L -12 8 L -8 -8 L -4 8 L 0 -8 L 4 8 L 8 -8 L 12 8 L 16 -8 L 20 0"
            fill="none"
            stroke={borderColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lead lines */}
          <line x1={-28} y1={0} x2={-20} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={20} y1={0} x2={28} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <path
            d="M -20 0 L -16 -8 L -12 8 L -8 -8 L -4 8 L 0 -8 L 4 8 L 8 -8 L 12 8 L 16 -8 L 20 0"
            fill="none"
            stroke="black"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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

    // ─────────────────────────── INDUCTOR ───────────────────────────
    case 'inductor': {
      const body = (
        <>
          {/* Coil path */}
          <path
            d="M -20 0 C -20 -12, -10 -12, -10 0 C -10 -12, 0 -12, 0 0 C 0 -12, 10 -12, 10 0 C 10 -12, 20 -12, 20 0"
            fill="none"
            stroke={borderColor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Lead lines */}
          <line x1={-28} y1={0} x2={-20} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={20} y1={0} x2={28} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <path
            d="M -20 0 C -20 -12, -10 -12, -10 0 C -10 -12, 0 -12, 0 0 C 0 -12, 10 -12, 10 0 C 10 -12, 20 -12, 20 0"
            fill="none"
            stroke="black"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text
          x={isRotated ? 22 : 0}
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

    // ─────────────────────────── CURRENT SOURCE ───────────────────────────
    case 'current-source': {
      const body = (
        <>
          {/* Circle */}
          <circle cx={0} cy={0} r={18} fill={fill} stroke={borderColor} strokeWidth={2} />
          {/* Arrow pointing up */}
          <line x1={0} y1={10} x2={0} y2={-4} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <polygon points="-4,-4 4,-4 0,-11" fill={borderColor} />
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

    // ─────────────────────────── AMMETER ───────────────────────────
    case 'ammeter': {
      const body = (
        <>
          {/* Circle */}
          <circle cx={0} cy={0} r={18} fill={fill} stroke={borderColor} strokeWidth={2} />
          {/* 'A' text */}
          <text x={0} y={4} textAnchor="middle" fontSize={12} fontWeight="700" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
            A
          </text>
          {/* Lead lines — left and right */}
          <line x1={-18} y1={0} x2={-26} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={18} y1={0} x2={26} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <circle cx={0} cy={0} r={18} fill="black" />
        </g>
      )
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text x={isRotated ? 26 : 0} y={isRotated ? 4 : 26} transform={`rotate(${-rotation})`} textAnchor={isRotated ? "start" : "middle"} fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── VOLTMETER ───────────────────────────
    case 'voltmeter': {
      const body = (
        <>
          {/* Circle */}
          <circle cx={0} cy={0} r={18} fill={fill} stroke={borderColor} strokeWidth={2} />
          {/* 'V' text */}
          <text x={0} y={4} textAnchor="middle" fontSize={12} fontWeight="700" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
            V
          </text>
          {/* Lead lines — left and right */}
          <line x1={-18} y1={0} x2={-26} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={18} y1={0} x2={26} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <circle cx={0} cy={0} r={18} fill="black" />
        </g>
      )
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text x={isRotated ? 26 : 0} y={isRotated ? 4 : 26} transform={`rotate(${-rotation})`} textAnchor={isRotated ? "start" : "middle"} fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── LAMP / LOAD ───────────────────────────
    case 'lamp':
    case 'load': {
      const body = (
        <>
          {/* Circle */}
          <circle cx={0} cy={0} r={18} fill={fill} stroke={borderColor} strokeWidth={2} />
          {/* Cross lines inside */}
          <line x1={-12} y1={-12} x2={12} y2={12} stroke={borderColor} strokeWidth={1.5} />
          <line x1={12} y1={-12} x2={-12} y2={12} stroke={borderColor} strokeWidth={1.5} />
          {/* Lead lines — left and right */}
          <line x1={-18} y1={0} x2={-26} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={18} y1={0} x2={26} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <circle cx={0} cy={0} r={18} fill="black" />
        </g>
      )
      const isRotated = rotation === 90 || rotation === 270 || rotation === -90 || rotation === -270
      labelElement = label && (
        <text x={isRotated ? 26 : 0} y={isRotated ? 4 : 26} transform={`rotate(${-rotation})`} textAnchor={isRotated ? "start" : "middle"} fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
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

    // ─────────────────────────── ZENER DIODE ───────────────────────────
    case 'zener-diode': {
      const body = (
        <>
          {/* Triangle pointing right */}
          <polygon points="-15,-12 15,0 -15,12" fill={fill} stroke={borderColor} strokeWidth={2} strokeLinejoin="round" />
          {/* Zener cathode bar with bent ends (Z shape) */}
          <line x1={15} y1={-12} x2={15} y2={12} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={15} y1={-12} x2={21} y2={-18} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={15} y1={12}  x2={9}  y2={18}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Lead lines */}
          <line x1={-20} y1={0} x2={-15} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={15}  y1={0} x2={20}  y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (
        <g transform="translate(1.5, 1.5)" opacity={0.06}>
          <polygon points="-15,-12 15,0 -15,12" fill="black" />
        </g>
      )
      const isRotated = rotation === 90 || rotation === 270
      labelElement = label && (
        <text x={isRotated ? 26 : 0} y={isRotated ? 4 : 26}
          transform={`rotate(${-rotation})`} textAnchor={isRotated ? "start" : "middle"}
          fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── LED ───────────────────────────
    case 'led': {
      const body = (
        <>
          <polygon points="-15,-12 15,0 -15,12" fill={fill} stroke={borderColor} strokeWidth={2} strokeLinejoin="round" />
          <line x1={15} y1={-12} x2={15} y2={12} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Emission arrows */}
          <line x1={18} y1={-8}  x2={26} y2={-16} stroke={borderColor} strokeWidth={1.5} strokeLinecap="round" />
          <polygon points="26,-16 20,-16 26,-10" fill={borderColor} />
          <line x1={22} y1={-4}  x2={30} y2={-12} stroke={borderColor} strokeWidth={1.5} strokeLinecap="round" />
          <polygon points="30,-12 24,-12 30,-6" fill={borderColor} />
          {/* Lead lines */}
          <line x1={-20} y1={0} x2={-15} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={15}  y1={0} x2={20}  y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = (<g transform="translate(1.5,1.5)" opacity={0.06}><polygon points="-15,-12 15,0 -15,12" fill="black"/></g>)
      const isRotated = rotation === 90 || rotation === 270
      labelElement = label && (
        <text x={isRotated ? 26 : 0} y={isRotated ? 4 : 26}
          transform={`rotate(${-rotation})`} textAnchor={isRotated ? "start" : "middle"}
          fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
          {label}
        </text>
      )
      break
    }

    // ─────────────────────────── BJT NPN ───────────────────────────
    case 'bjt-npn': {
      const body = (
        <>
          {/* Vertical base line */}
          <line x1={-8} y1={-22} x2={-8} y2={22} stroke={borderColor} strokeWidth={3} strokeLinecap="round" />
          {/* Collector line (up-right, arrow out) */}
          <line x1={-8} y1={-12} x2={16} y2={-28} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Emitter line (down-right, arrow) */}
          <line x1={-8} y1={12}  x2={16} y2={28}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Emitter arrow (pointing outward / down-right) */}
          <polygon points="12,24 18,32 20,22" fill={borderColor} />
          {/* Base lead */}
          <line x1={-20} y1={0} x2={-8} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Collector terminal stub */}
          <line x1={16} y1={-28} x2={20} y2={-32} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* Emitter terminal stub */}
          <line x1={16} y1={28}  x2={20} y2={32}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      symbol = body
      shadowSymbol = null
      labelElement = label && (
        <text x={0} y={-36} textAnchor="middle" fontSize={labelSize} fontWeight="600"
          fill={borderColor} fontFamily="Poppins, Inter, sans-serif">{label}</text>
      )
      // Pin labels
      symbol = (
        <>
          {body}
          <text x={-24} y={4}  textAnchor="end"   fontSize={8} fill="#64748B" fontFamily="Poppins, Inter, sans-serif">B</text>
          <text x={24}  y={-28} textAnchor="start" fontSize={8} fill="#64748B" fontFamily="Poppins, Inter, sans-serif">C</text>
          <text x={24}  y={32}  textAnchor="start" fontSize={8} fill="#64748B" fontFamily="Poppins, Inter, sans-serif">E</text>
        </>
      )
      break
    }

    // ─────────────────────────── BJT PNP ───────────────────────────
    case 'bjt-pnp': {
      symbol = (
        <>
          <line x1={-8} y1={-22} x2={-8} y2={22} stroke={borderColor} strokeWidth={3} strokeLinecap="round" />
          <line x1={-8} y1={-12} x2={16} y2={-28} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={-8} y1={12}  x2={16} y2={28}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          {/* PNP emitter arrow points INTO base (inward on collector line) */}
          <polygon points="-4,-14 4,-8 -2,-20" fill={borderColor} />
          <line x1={-20} y1={0} x2={-8} y2={0}   stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={16}  y1={-28} x2={20} y2={-32} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={16}  y1={28}  x2={20} y2={32}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <text x={-24} y={4}   textAnchor="end"   fontSize={8} fill="#64748B" fontFamily="Poppins, Inter, sans-serif">B</text>
          <text x={24}  y={-28} textAnchor="start" fontSize={8} fill="#64748B" fontFamily="Poppins, Inter, sans-serif">C</text>
          <text x={24}  y={32}  textAnchor="start" fontSize={8} fill="#64748B" fontFamily="Poppins, Inter, sans-serif">E</text>
        </>
      )
      shadowSymbol = null
      labelElement = label && (
        <text x={0} y={-36} textAnchor="middle" fontSize={labelSize} fontWeight="600"
          fill={borderColor} fontFamily="Poppins, Inter, sans-serif">{label}</text>
      )
      break
    }


    // ─────────────────────────── TRANSFORMER ───────────────────────────
    case 'transformer': {
      symbol = (
        <>
          {/* Vertical core lines in the middle */}
          <line x1={-3} y1={-30} x2={-3} y2={30} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={3}  y1={-30} x2={3}  y2={30} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          
          {/* Primary winding on the left (x = -20, bumps pointing left to x = -30) */}
          <path d="M -20 -30 C -30 -30, -30 -20, -20 -20 C -30 -20, -30 -10, -20 -10 C -30 -10, -30 0, -20 0 C -30 0, -30 10, -20 10 C -30 10, -30 20, -20 20 C -30 20, -30 30, -20 30"
            fill="none" stroke={borderColor} strokeWidth={2.5} strokeLinecap="round" />
          
          {/* Secondary winding on the right (x = 20, bumps pointing right to x = 30) */}
          <path d="M 20 -30 C 30 -30, 30 -20, 20 -20 C 30 -20, 30 -10, 20 -10 C 30 -10, 30 0, 20 0 C 30 0, 30 10, 20 10 C 30 10, 30 20, 20 20 C 30 20, 30 30, 20 30"
            fill="none" stroke={borderColor} strokeWidth={2.5} strokeLinecap="round" />
            
          {/* Primary lead lines (top, bottom) */}
          <line x1={-20} y1={-30} x2={-20} y2={-40} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={-20} y1={30}  x2={-20} y2={40}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          
          {/* Secondary lead lines (top, bottom) */}
          <line x1={20} y1={-30} x2={20} y2={-40} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <line x1={20} y1={30}  x2={20} y2={40}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          
          {/* Primary center-tap lead line (optional, extends to x = -35) */}
          <line x1={-20} y1={0} x2={-35} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          
          {/* Secondary center-tap lead line (optional, extends to x = 35) */}
          <line x1={20} y1={0} x2={35} y2={0} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      shadowSymbol = null
      labelElement = label && (
        <text x={0} y={48} transform={`rotate(${-rotation})`} textAnchor="middle" fontSize={labelSize} fontWeight="600"
          fill={borderColor} fontFamily="Poppins, Inter, sans-serif">{label}</text>
      )
      break
    }

    // ─────────────────────────── SWITCH ───────────────────────────
    case 'switch': {
      symbol = (
        <>
          <line x1={-20} y1={0} x2={-10} y2={0}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <circle cx={-10} cy={0} r={3} fill={borderColor} />
          <line x1={-10} y1={0} x2={10} y2={-12} stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
          <circle cx={10}  cy={0} r={3} fill={borderColor} />
          <line x1={10}  y1={0} x2={20}  y2={0}  stroke={borderColor} strokeWidth={2} strokeLinecap="round" />
        </>
      )
      shadowSymbol = null
      const isRotated = rotation === 90 || rotation === 270
      labelElement = label && (
        <text x={isRotated ? 26 : 0} y={isRotated ? 4 : 18}
          transform={`rotate(${-rotation})`} textAnchor={isRotated ? "start" : "middle"}
          fontSize={labelSize} fontWeight="600" fill={borderColor} fontFamily="Poppins, Inter, sans-serif">
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
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(1, ${mirrorY ? -1 : 1})`}>
      {/* Drop shadow for structural components */}
      {!isWireType && shadowSymbol}

      {/* Main symbol */}
      {symbol}

      {/* Label */}
      {labelElement}
    </g>
  )
}
