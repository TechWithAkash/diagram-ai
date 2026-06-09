'use client'

import React from 'react'
import CircuitSymbol from '../primitives/CircuitSymbol'

/**
 * CircuitRenderer — renders a complete analog circuit schematic from JSON schema.
 *
 * Schema format:
 * {
 *   "type": "circuit-schematic",
 *   "viewBox": { "width": 600, "height": 360 },
 *   "components": [
 *     { "id": "D1", "symbol": "diode", "x": 220, "y": 100, "rotation": 0, "label": "D1" }
 *   ],
 *   "wires": [
 *     { "x1": 100, "y1": 100, "x2": 200, "y2": 100 }
 *   ],
 *   "junctions": [
 *     { "x": 200, "y": 200 }
 *   ],
 *   "labels": [
 *     { "text": "Vin", "x": 80, "y": 140, "fontSize": 12, "fontWeight": "600", "fill": "#1e40af" }
 *   ]
 * }
 */
export default function CircuitRenderer({ schema }) {
  const {
    components = [],
    wires = [],
    junctions = [],
    labels = [],
  } = schema

  return (
    <g>
      {/* ─── 1. Render Wires ─── */}
      {wires.map((wire, index) => (
        <line
          key={`wire-${index}`}
          x1={wire.x1}
          y1={wire.y1}
          x2={wire.x2}
          y2={wire.y2}
          stroke={wire.stroke || '#334155'}
          strokeWidth={wire.strokeWidth || 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* ─── 2. Render Components ─── */}
      {components.map((comp) => (
        <CircuitSymbol
          key={comp.id}
          type={comp.symbol}
          x={comp.x}
          y={comp.y}
          rotation={comp.rotation || 0}
          label={comp.label}
          fill={comp.fill || '#F8FAFC'}
          borderColor={comp.borderColor || '#334155'}
          labelSize={comp.labelSize || 10}
        />
      ))}

      {/* ─── 3. Render Junctions ─── */}
      {junctions.map((j, index) => (
        <circle
          key={`junc-${index}`}
          cx={j.x}
          cy={j.y}
          r={4}
          fill={j.fill || '#334155'}
        />
      ))}

      {/* ─── 4. Render Free Labels ─── */}
      {labels.map((lbl, index) => (
        <text
          key={`label-${index}`}
          x={lbl.x}
          y={lbl.y}
          textAnchor={lbl.textAnchor || 'middle'}
          fontSize={lbl.fontSize || 11}
          fontWeight={lbl.fontWeight || '600'}
          fill={lbl.fill || '#334155'}
          fontFamily={lbl.fontFamily || 'Poppins, Inter, sans-serif'}
          fontStyle={lbl.fontStyle || 'normal'}
        >
          {lbl.text}
        </text>
      ))}
    </g>
  )
}
