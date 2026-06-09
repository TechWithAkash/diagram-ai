'use client'

import React from 'react'
import LogicGate from '../primitives/LogicGate'

/**
 * LogicDiagramRenderer - Renders a schematic of logic gates, inputs, outputs, and wiring.
 * Schema format:
 * {
 *   "gates": [
 *     { "id": "g1", "type": "AND", "x": 300, "y": 150, "label": "G1", "inputsCount": 2 }
 *   ],
 *   "inputs": [
 *     { "id": "in1", "label": "A", "x": 150, "y": 130 }
 *   ],
 *   "outputs": [
 *     { "id": "out1", "label": "Y", "x": 450, "y": 150 }
 *   ],
 *   "connections": [
 *     { "from": "in1", "to": "g1", "toPort": 0, "route": "Z", "midX": 220 }
 *   ],
 *   "junctions": [
 *     { "x": 220, "y": 130 }
 *   ]
 * }
 */
export default function LogicDiagramRenderer({ schema }) {
  const { gates = [], inputs = [], outputs = [], connections = [], junctions = [] } = schema

  // Flatten all nodes into a map for fast lookup
  const nodeMap = {}
  inputs.forEach(inp => {
    nodeMap[inp.id] = { ...inp, nodeType: 'input' }
  })
  outputs.forEach(out => {
    nodeMap[out.id] = { ...out, nodeType: 'output' }
  })
  gates.forEach(gate => {
    nodeMap[gate.id] = { ...gate, nodeType: 'gate' }
  })

  return (
    <g>
      {/* 1. Render Connection Lines */}
      {connections.map((conn, index) => {
        // Resolve source (x1, y1)
        let x1 = conn.x1
        let y1 = conn.y1

        if (x1 === undefined || y1 === undefined) {
          const src = nodeMap[conn.from]
          if (src) {
            if (src.nodeType === 'input' || src.nodeType === 'output') {
              x1 = src.x
              y1 = src.y
            } else if (src.nodeType === 'gate') {
              const gateType = src.type.toUpperCase()
              x1 = src.x + (gateType === 'NOT' ? 25 : 30)
              y1 = src.y
            } else {
              x1 = 0
              y1 = 0
            }
          } else {
            x1 = 0
            y1 = 0
          }
        }

        // Resolve destination (x2, y2)
        let x2 = conn.x2
        let y2 = conn.y2

        if (x2 === undefined || y2 === undefined) {
          const tgt = nodeMap[conn.to]
          if (tgt) {
            if (tgt.nodeType === 'input' || tgt.nodeType === 'output') {
              x2 = tgt.x
              y2 = tgt.y
            } else if (tgt.nodeType === 'gate') {
              const gateType = tgt.type.toUpperCase()
              const inputsCount = tgt.inputsCount !== undefined ? tgt.inputsCount : (gateType === 'NOT' ? 1 : 2)
              const toPort = conn.toPort || 0

              x2 = tgt.x - 30

              if (inputsCount === 3) {
                if (toPort === 0) y2 = tgt.y - 15
                else if (toPort === 1) y2 = tgt.y
                else y2 = tgt.y + 15
              } else if (inputsCount === 2) {
                if (toPort === 0) y2 = tgt.y - 10
                else y2 = tgt.y + 10
              } else {
                // 1 input
                y2 = tgt.y
              }
            } else {
              x2 = 0
              y2 = 0
            }
          } else {
            x2 = 0
            y2 = 0
          }
        }

        // Calculate path based on routing style
        const dx = x2 - x1
        const dy = y2 - y1
        const route = conn.route || 'Z'
        let pathD = ''

        if (route === 'straight') {
          pathD = `M ${x1} ${y1} L ${x2} ${y2}`
        } else if (route === 'L-horizontal') {
          pathD = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`
        } else if (route === 'L-vertical') {
          pathD = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`
        } else {
          // Z-route
          const midX = conn.midX !== undefined ? conn.midX : (x1 + dx / 2)
          pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
        }

        const strokeColor = conn.color || '#475569'
        const isDashed = conn.style === 'dashed'

        return (
          <path
            key={`conn-${index}`}
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeDasharray={isDashed ? '4,4' : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      })}

      {/* 2. Render Junction Dots */}
      {junctions.map((j, index) => (
        <circle
          key={`junc-${index}`}
          cx={j.x}
          cy={j.y}
          r={3.5}
          fill="#475569"
        />
      ))}

      {/* 3. Render Input Pins */}
      {inputs.map((inp, index) => (
        <g key={`input-${index}`}>
          <circle cx={inp.x} cy={inp.y} r={3} fill="#475569" />
          <text
            x={inp.x - 8}
            y={inp.y + 4}
            textAnchor="end"
            fontSize={12}
            fontWeight="600"
            fill="#1E293B"
            fontFamily="Poppins, Inter, sans-serif"
          >
            {inp.label}
          </text>
        </g>
      ))}

      {/* 4. Render Output Pins */}
      {outputs.map((out, index) => (
        <g key={`output-${index}`}>
          <circle cx={out.x} cy={out.y} r={3} fill="#475569" />
          <text
            x={out.x + 8}
            y={out.y + 4}
            textAnchor="start"
            fontSize={12}
            fontWeight="600"
            fill="#1E293B"
            fontFamily="Poppins, Inter, sans-serif"
          >
            {out.label}
          </text>
        </g>
      ))}

      {/* 5. Render Logic Gates */}
      {gates.map((gate) => (
        <LogicGate
          key={gate.id}
          type={gate.type}
          x={gate.x}
          y={gate.y}
          label={gate.label}
          color={gate.color}
          borderColor={gate.borderColor}
        />
      ))}
    </g>
  )
}
