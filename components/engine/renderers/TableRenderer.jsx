'use client'

import React from 'react'

/**
 * TableRenderer — handles 'table' type schemas
 * Used for: ACID Properties, Complexity Tables, Comparison Tables, etc.
 */
export default function TableRenderer({ schema }) {
  const { columns = [], rows = [], title: tableTitle, viewBox } = schema
  const { width } = viewBox || { width: 700 }

  const MARGIN     = 20
  const HEADER_H   = 40
  const ROW_H      = 36
  const COL_W      = Math.floor((width - MARGIN * 2) / Math.max(columns.length, 1))
  const TABLE_X    = MARGIN
  const TABLE_Y    = tableTitle ? 40 : 20

  const tableWidth  = COL_W * columns.length
  const tableHeight = HEADER_H + rows.length * ROW_H

  return (
    <g>
      {/* Table title */}
      {tableTitle && (
        <text x={TABLE_X + tableWidth / 2} y={25} textAnchor="middle" fontSize={13} fontWeight="700" fill="#1E293B" fontFamily="Poppins, Inter, sans-serif">
          {tableTitle}
        </text>
      )}

      {/* Header row */}
      {columns.map((col, ci) => {
        const x = TABLE_X + ci * COL_W
        const color = col.color || '#3B82F6'
        return (
          <g key={ci}>
            <rect x={x} y={TABLE_Y} width={COL_W} height={HEADER_H}
              fill={color}
              stroke="white" strokeWidth={1}
              rx={ci === 0 ? 8 : ci === columns.length - 1 ? 8 : 0}
            />
            <text x={x + COL_W / 2} y={TABLE_Y + HEADER_H / 2 + 5}
              textAnchor="middle" fontSize={11} fontWeight="700" fill="white"
              fontFamily="Poppins, Inter, sans-serif"
            >
              {col.label}
            </text>
          </g>
        )
      })}

      {/* Data rows */}
      {rows.map((row, ri) => {
        const y = TABLE_Y + HEADER_H + ri * ROW_H
        const isEven = ri % 2 === 0
        return (
          <g key={ri}>
            {row.map((cell, ci) => {
              const x     = TABLE_X + ci * COL_W
              const color = cell.color || (isEven ? '#F8FAFC' : '#F1F5F9')
              return (
                <g key={ci}>
                  <rect x={x} y={y} width={COL_W} height={ROW_H}
                    fill={cell.highlight ? '#FEF9C3' : color}
                    stroke="white" strokeWidth={1}
                  />
                  <text x={x + COL_W / 2} y={y + ROW_H / 2 + 4}
                    textAnchor="middle" fontSize={10} fill="#374151"
                    fontFamily="Poppins, Inter, sans-serif"
                  >
                    {typeof cell === 'string' ? cell : cell.value}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Border */}
      <rect x={TABLE_X} y={TABLE_Y} width={tableWidth} height={tableHeight}
        fill="none" stroke="#E2E8F0" strokeWidth={1.5} rx={8}
      />
    </g>
  )
}
