'use client'

import React from 'react'
import Block from '../primitives/Block'
import BusLine from '../primitives/BusLine'
import Arrow from '../primitives/Arrow'

/**
 * BlockDiagramRenderer — handles 'block-diagram' type schemas
 * Used for: 8086, 8085, 8051, Von Neumann, GSM, DBMS Architecture, etc.
 */
export default function BlockDiagramRenderer({ schema }) {
  const { blocks = [], connections = [], buses = [], viewBox } = schema

  // Build a flat map of all blocks (including children) by ID for connection lookup
  const blockMap = {}
  function flattenBlocks(blockList) {
    blockList.forEach(b => {
      blockMap[b.id] = b
      if (b.children?.length) flattenBlocks(b.children)
    })
  }
  flattenBlocks(blocks)

  return (
    <g>
      {/* Render all top-level blocks (children rendered recursively inside Block) */}
      {blocks.map(block => (
        <Block key={block.id} block={block} depth={0} />
      ))}

      {/* Render connections between blocks */}
      {connections.map((conn, i) => {
        // Use explicit coordinates if provided, else compute from block centers
        const x1 = conn.x1 ?? (blockMap[conn.from]?.x ?? 0) + (blockMap[conn.from]?.width ?? 0)
        const y1 = conn.y1 ?? (blockMap[conn.from]?.y ?? 0) + (blockMap[conn.from]?.height ?? 0) / 2
        const x2 = conn.x2 ?? (blockMap[conn.to]?.x ?? 0)
        const y2 = conn.y2 ?? (blockMap[conn.to]?.y ?? 0) + (blockMap[conn.to]?.height ?? 0) / 2
        return (
          <Arrow
            key={i}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            label={conn.label}
            style={conn.style || 'solid'}
            type={conn.type === 'bidirectional' ? 'bidirectional' : 'unidirectional'}
            color="#7C8DB0"
          />
        )
      })}

      {/* Render buses */}
      {buses.map(bus => (
        <BusLine key={bus.id} bus={bus} viewBox={viewBox} />
      ))}
    </g>
  )
}
