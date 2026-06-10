'use client'

import React from 'react'

/**
 * Block — SVG box primitive.
 *
 * Key fix: every block gets a <clipPath> so text NEVER overflows
 * into neighbouring blocks — regardless of length.
 *
 * Text strategy:
 *  - Label    : centered, max 2 wrapped lines, sized to block height.
 *  - Sublabels: one <text> per item (single line), font-size auto-shrinks
 *               so all items fit, then SVG textLength compresses if still wide.
 *  - Note     : small italic line anchored near bottom.
 *  - clipPath : clips ALL text to the block rect (4px inner inset).
 */
let _blockIdCounter = 0

export default function Block({ block, depth = 0 }) {
  // Stable unique id for clipPath (React stable across renders for same block)
  const clipId = `bclip-${block.id ?? ++_blockIdCounter}`

  const {
    x, y, width, height,
    label = '',
    color = '#F8FAFC',
    borderColor = '#CBD5E1',
    children = [],
    sublabels = [],
    note,
    labelSize,
  } = block

  const isRoot  = depth === 0
  const rx      = isRoot ? 10 : 6

  // Clip region (inset 4px so text doesn't touch the border)
  const clipInset = 4
  const cx = x + clipInset
  const cy = y + clipInset
  const cw = width  - clipInset * 2
  const ch = height - clipInset * 2

  const textColor  = darkenHex(borderColor, 80)
  const PADX       = 8   // horizontal padding for text
  const PADY       = 6   // vertical padding top/bottom
  const usableW    = Math.max(width  - PADX * 2, 10)
  const usableH    = Math.max(height - PADY * 2, 10)

  const hasSublabels = sublabels.length > 0
  const hasNote      = !!note

  /* ── Label font size ─────────────────────────────────────────── */
  const maxLabelSz = hasSublabels
    ? Math.min(usableH * 0.32, 24)
    : Math.min(usableH * 0.55, 24)

  const labelFontSize = Math.max(9, Math.min(
    labelSize ?? (isRoot ? 14 : 13),
    maxLabelSz
  ))
  const labelLineH = labelFontSize * 1.25

  // Wrap label (max 2 lines)
  const labelLines  = wrapLines(label, usableW, labelFontSize, 2)
  const labelBlockH = labelLines.length * labelLineH

  /* ── Sublabel font size ──────────────────────────────────────── */
  const noteAreaH      = hasNote ? 16 : 0
  const slAvailableH   = usableH - labelBlockH - noteAreaH - (hasSublabels ? 8 : 0)
  const slCount        = sublabels.length
  const slFontSizeRaw  = slCount > 0 ? (slAvailableH / slCount) / 1.40 : 11
  const slFontSize     = Math.max(8.5, Math.min(12.5, slFontSizeRaw))
  const slLineH        = slFontSize * 1.38

  /* ── Vertical layout ─────────────────────────────────────────── */
  const totalContentH = labelBlockH
    + (hasSublabels ? 8 + slCount * slLineH : 0)
    + (hasNote       ? 4 + 14               : 0)

  const startY         = y + PADY + Math.max(0, (usableH - totalContentH) / 2) + labelFontSize
  const labelStartY    = startY
  const sublabelStartY = startY + labelBlockH + 8 + slFontSize
  const noteY          = y + height - 6

  return (
    <g>
      {/* ── Clip definition ── */}
      <defs>
        <clipPath id={clipId}>
          <rect x={cx} y={cy} width={cw} height={ch} rx={rx} />
        </clipPath>
      </defs>

      {/* ── Drop shadow ── */}
      <rect
        x={x + 2} y={y + 2}
        width={width} height={height}
        rx={rx} ry={rx}
        fill="rgba(0,0,0,0.07)"
      />

      {/* ── Background box ── */}
      <rect
        x={x} y={y}
        width={width} height={height}
        fill={color}
        stroke={borderColor}
        strokeWidth={isRoot ? 2 : 1.5}
        rx={rx} ry={rx}
      />

      {/* ── All text inside a clipped group ── */}
      <g clipPath={`url(#${clipId})`}>

        {/* Label */}
        <text
          fontWeight={isRoot ? '700' : '600'}
          fill={textColor}
          fontFamily="Inter, system-ui, sans-serif"
          fontSize={labelFontSize}
          textAnchor="middle"
        >
          {labelLines.map((line, i) => {
            const estW = line.length * labelFontSize * 0.58
            return (
              <tspan
                key={i}
                x={x + width / 2}
                y={labelStartY + i * labelLineH}
                textLength={estW > usableW ? usableW : undefined}
                lengthAdjust={estW > usableW ? 'spacingAndGlyphs' : undefined}
              >
                {line}
              </tspan>
            )
          })}
        </text>

        {/* Sublabels */}
        {hasSublabels && sublabels.map((sl, i) => {
          const estW = sl.length * slFontSize * 0.56
          return (
            <text
              key={i}
              x={x + PADX}
              y={sublabelStartY + i * slLineH}
              fontSize={slFontSize}
              fill="#374151"
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight="400"
              textLength={estW > usableW ? usableW : undefined}
              lengthAdjust={estW > usableW ? 'spacingAndGlyphs' : undefined}
            >
              {sl}
            </text>
          )
        })}

        {/* Note */}
        {hasNote && (
          <text
            x={x + width / 2}
            y={noteY}
            textAnchor="middle"
            fontSize={Math.max(8, slFontSize - 1)}
            fill="#6B7280"
            fontStyle="italic"
            fontFamily="Inter, system-ui, sans-serif"
            textLength={
              String(note).length * (slFontSize - 1) * 0.55 > usableW
                ? usableW
                : undefined
            }
            lengthAdjust="spacingAndGlyphs"
          >
            {note}
          </text>
        )}

      </g>{/* end clip group */}

      {/* ── Children (recursive) ── */}
      {children.map(child => (
        <Block key={child.id} block={child} depth={depth + 1} />
      ))}
    </g>
  )
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function wrapLines(text, maxWidth, fontSize, maxLines = 2) {
  if (!text) return ['']
  const avgCW       = fontSize * 0.58
  const charsPerLine = Math.max(8, Math.floor(maxWidth / avgCW))
  const words        = String(text).split(' ')
  const lines        = []
  let cur            = ''

  for (const word of words) {
    if (lines.length >= maxLines) break
    const test = cur ? `${cur} ${word}` : word
    if (test.length <= charsPerLine) {
      cur = test
    } else {
      if (cur) lines.push(cur)
      cur = word.length > charsPerLine ? word.slice(0, charsPerLine) : word
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur)
  return lines.length ? lines : ['']
}

function darkenHex(hex, amount = 60) {
  try {
    const c = hex.replace('#', '')
    const r = Math.max(0, parseInt(c.slice(0, 2), 16) - amount)
    const g = Math.max(0, parseInt(c.slice(2, 4), 16) - amount)
    const b = Math.max(0, parseInt(c.slice(4, 6), 16) - amount)
    return `rgb(${r},${g},${b})`
  } catch {
    return '#1E293B'
  }
}
