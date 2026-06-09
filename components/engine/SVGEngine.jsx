'use client'

import React from 'react'
import BlockDiagramRenderer    from './renderers/BlockDiagramRenderer'
import LayeredStackRenderer    from './renderers/LayeredStackRenderer'
import SequentialFlowRenderer  from './renderers/SequentialFlowRenderer'
import StateMachineRenderer    from './renderers/StateMachineRenderer'
import SequenceRenderer        from './renderers/SequenceRenderer'
import TreeRenderer            from './renderers/TreeRenderer'
import GraphRenderer           from './renderers/GraphRenderer'
import TableRenderer           from './renderers/TableRenderer'
import Arch8086Renderer        from './renderers/Arch8086Renderer'
import Arch8085Renderer        from './renderers/Arch8085Renderer'

/** Map schema type string → renderer component */
const RENDERERS = {
  'block-diagram':   BlockDiagramRenderer,
  'layered-stack':   LayeredStackRenderer,
  'sequential-flow': SequentialFlowRenderer,
  'state-machine':   StateMachineRenderer,
  'sequence':        SequenceRenderer,
  'tree':            TreeRenderer,
  'graph':           GraphRenderer,
  'table':           TableRenderer,
  '8086-custom':     Arch8086Renderer,
  '8085-custom':     Arch8085Renderer,
}

/**
 * SVGEngine — master dispatcher
 * Reads schema.type, routes to the correct sub-renderer,
 * wraps everything in an <svg> with the correct viewBox.
 */
export default function SVGEngine({ schema, className = '' }) {
  if (!schema) {
    return (
      <div className={`flex items-center justify-center min-h-[280px] text-sm text-gray-400 ${className}`}>
        No diagram data.
      </div>
    )
  }

  const Renderer = RENDERERS[schema.type]
  if (!Renderer) {
    return (
      <div className={`flex items-center justify-center min-h-[280px] text-sm text-amber-500 ${className}`}>
        Unknown diagram type: {schema.type}
      </div>
    )
  }

  const { width = 780, height = 560 } = schema.viewBox || {}

  return (
    <div className={`w-full flex items-center justify-center p-4 bg-gray-50 rounded-b-xl overflow-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ maxWidth: width, maxHeight: '580px', display: 'block' }}
        role="img"
        aria-label={schema.title}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{schema.title}</title>

        {/* Global defs: drop shadow filter */}
        <defs>
          <filter id="block-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.08" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* White background */}
        <rect width={width} height={height} fill="#FAFBFC" rx={0} />

        {/* The actual diagram */}
        <Renderer schema={schema} />
      </svg>
    </div>
  )
}
