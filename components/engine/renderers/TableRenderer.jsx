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
  const HEADER_H   = 44
  const TABLE_X    = MARGIN
  const TABLE_Y    = tableTitle ? 45 : 20

  // 1. Calculate smart column widths based on headers and index
  const getColWidths = (cols, totalW) => {
    const n = cols.length
    if (n === 0) return []
    
    // Heuristic for 3 columns (comparison or details tables)
    if (n === 3) {
      const label0 = cols[0].label.toLowerCase()
      const label1 = cols[1].label.toLowerCase()
      
      if (label0 === 'field' && label1 === 'size') {
        // Ethernet frame table (narrow fields, wide content)
        const w0 = Math.floor(totalW * 0.26)
        const w1 = Math.floor(totalW * 0.16)
        const w2 = totalW - w0 - w1
        return [w0, w1, w2]
      } else if (label0 === 'property' || label0 === 'feature' || label0 === 'parameter') {
        // Linear vs Binary Search Comparison (narrow property, equal contents)
        const w0 = Math.floor(totalW * 0.22)
        const w1 = Math.floor(totalW * 0.39)
        const w2 = totalW - w0 - w1
        return [w0, w1, w2]
      }
    }
    
    // Default: equal split
    return Array(n).fill(Math.floor(totalW / n))
  }

  const tableWidth = width - MARGIN * 2
  const colWidths  = getColWidths(columns, tableWidth)

  // 2. Calculate dynamic row height based on text content length
  const getRowHeight = (row) => {
    let maxLines = 1
    row.forEach((cell, ci) => {
      const text = typeof cell === 'string' ? cell : cell.value
      const colW = colWidths[ci] || 150
      
      // Heuristic: ~5.5 pixels per character at 10px font size. Subtract 16px for padding.
      const charsPerLine = Math.max(Math.floor((colW - 16) / 5.5), 1)
      const lines = Math.ceil(text.length / charsPerLine)
      if (lines > maxLines) {
        maxLines = lines
      }
    })
    
    // 16px per line height + 14px vertical padding
    return Math.max(38, maxLines * 16 + 14)
  }

  const rowHeights = rows.map(row => getRowHeight(row))
  const totalRowsHeight = rowHeights.reduce((a, b) => a + b, 0)
  const tableHeight = HEADER_H + totalRowsHeight

  return (
    <g>
      {/* Table title */}
      {tableTitle && (
        <text x={TABLE_X + tableWidth / 2} y={28} textAnchor="middle" fontSize={14} fontWeight="700" fill="#1E293B" fontFamily="Poppins, Inter, sans-serif">
          {tableTitle}
        </text>
      )}

      {/* Header row */}
      {columns.map((col, ci) => {
        const cellWidth = colWidths[ci]
        const cellX = TABLE_X + colWidths.slice(0, ci).reduce((a, b) => a + b, 0)
        const color = col.color || '#3B82F6'
        
        return (
          <g key={ci}>
            <rect x={cellX} y={TABLE_Y} width={cellWidth} height={HEADER_H}
              fill={color}
              stroke="#E2E8F0" strokeWidth={1}
            />
            <foreignObject
              x={cellX + 6} y={TABLE_Y + 4}
              width={cellWidth - 12} height={HEADER_H - 8}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontSize: '11px',
                  color: 'white',
                  fontWeight: '700',
                  fontFamily: 'Poppins, Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}
              >
                {col.label}
              </div>
            </foreignObject>
          </g>
        )
      })}

      {/* Data rows */}
      {rows.map((row, ri) => {
        const rowHeight = rowHeights[ri]
        const rowY = TABLE_Y + HEADER_H + rowHeights.slice(0, ri).reduce((a, b) => a + b, 0)
        const isEven = ri % 2 === 0
        
        return (
          <g key={ri}>
            {row.map((cell, ci) => {
              const cellWidth = colWidths[ci]
              const cellX = TABLE_X + colWidths.slice(0, ci).reduce((a, b) => a + b, 0)
              const cellText = typeof cell === 'string' ? cell : cell.value
              const highlight = cell.highlight || false
              const color = cell.color || (isEven ? '#F8FAFC' : '#F1F5F9')
              const textColor = cell.textColor || '#374151'
              
              // Align first column left, second column centered if it represents "Size", and third left.
              const label0 = columns[0]?.label?.toLowerCase()
              const label1 = columns[1]?.label?.toLowerCase()
              const isEthernetSize = label0 === 'field' && label1 === 'size' && ci === 1
              const align = (ci === 0 || !isEthernetSize) ? 'left' : 'center'

              return (
                <g key={ci}>
                  <rect x={cellX} y={rowY} width={cellWidth} height={rowHeight}
                    fill={highlight ? '#FEF9C3' : color}
                    stroke="#E2E8F0" strokeWidth={1}
                  />
                  <foreignObject
                    x={cellX + 8} y={rowY + 4}
                    width={cellWidth - 16} height={rowHeight - 8}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      style={{
                        fontSize: '9.5px',
                        color: textColor,
                        lineHeight: '1.4',
                        fontWeight: (cell.color || highlight) ? '600' : '400',
                        fontFamily: 'Poppins, Inter, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: align === 'center' ? 'center' : 'flex-start',
                        height: '100%',
                        textAlign: align,
                      }}
                    >
                      {cellText}
                    </div>
                  </foreignObject>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Border */}
      <rect x={TABLE_X} y={TABLE_Y} width={tableWidth} height={tableHeight}
        fill="none" stroke="#E2E8F0" strokeWidth={1.5} rx={0}
      />
    </g>
  )
}
