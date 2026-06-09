'use client'

import React from 'react'

/**
 * TreeRenderer — handles 'tree' type schemas
 * Used for: BST, File System, Organization Hierarchy, etc.
 */
export default function TreeRenderer({ schema }) {
  const { root, viewBox } = schema
  if (!root) return null

  // Compute layout using simple recursive positioning
  const positions = {}
  let leafIndex = 0

  function countLeaves(node) {
    if (!node.children || node.children.length === 0) return 1
    return node.children.reduce((sum, c) => sum + countLeaves(c), 0)
  }

  function assignPositions(node, depth, startLeaf) {
    const leaves = countLeaves(node)
    const leafSpan = leaves

    if (!node.children || node.children.length === 0) {
      positions[node.id] = { x: (startLeaf + 0.5) * ((viewBox?.width || 700) / countLeaves(root)), y: depth * 80 + 40 }
      return startLeaf + 1
    }

    let currentLeaf = startLeaf
    node.children.forEach(child => {
      currentLeaf = assignPositions(child, depth + 1, currentLeaf)
    })

    // Place parent above the center of its children
    const firstChild = node.children[0]
    const lastChild  = node.children[node.children.length - 1]
    const firstPos   = positions[firstChild.id]
    const lastPos    = positions[lastChild.id]

    if (firstPos && lastPos) {
      positions[node.id] = {
        x: (firstPos.x + lastPos.x) / 2,
        y: depth * 80 + 40,
      }
    }
    return currentLeaf
  }

  assignPositions(root, 0, 0)

  function renderNode(node) {
    const pos = positions[node.id]
    if (!pos) return null
    const color = node.color || '#EEF2FF'
    const stroke = node.borderColor || '#6366F1'
    const text = node.textColor || '#312E81'
    const r = 28

    return (
      <g key={node.id}>
        {/* Edges to children first */}
        {(node.children || []).map(child => {
          const childPos = positions[child.id]
          if (!childPos) return null
          return (
            <line
              key={child.id}
              x1={pos.x} y1={pos.y + r}
              x2={childPos.x} y2={childPos.y - r}
              stroke="#CBD5E1" strokeWidth={1.5}
            />
          )
        })}

        {/* Node circle */}
        <circle cx={pos.x} cy={pos.y} r={r} fill={color} stroke={stroke} strokeWidth={2} />
        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={11} fontWeight="700" fill={text} fontFamily="Poppins, Inter, sans-serif">
          {node.label}
        </text>

        {/* Recurse children */}
        {(node.children || []).map(child => renderNode(child))}
      </g>
    )
  }

  return <g>{renderNode(root)}</g>
}
