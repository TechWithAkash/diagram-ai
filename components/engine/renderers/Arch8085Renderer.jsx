'use client'

import React from 'react'

/**
 * Arch8085Renderer — textbook-accurate Intel 8085 block diagram
 * Organizes blocks as in standard textbooks (e.g. Ramesh Gaonkar):
 * • Top: Interrupt Control & Serial I/O Control
 * • Upper Middle: Horizontal 8-bit Internal Data Bus
 * • Bottom Left: Accumulator, Temp Reg, ALU, and Flags
 * • Bottom Center: Instruction Register, Decoder, Timing & Control Unit
 * • Bottom Right: Multiplexer, Register Array (W/Z, B/C, D/E, H/L, SP, PC, Incrementer/Decrementer Latch), and Buffers
 */
export default function Arch8085Renderer() {
  const W = 1000
  const H = 640

  const C = {
    // Component colors
    intBkg: '#FFF7ED', intBorder: '#EA580C',
    serialBkg: '#F5F3FF', serialBorder: '#7C3AED',
    accBkg: '#EFF6FF', accBorder: '#2563EB',
    aluBkg: '#EDE9FE', aluBorder: '#7C3AED',
    flagBkg: '#FEF3C7', flagBorder: '#D97706',
    ctrlBkg: '#ECFDF5', ctrlBorder: '#059669',
    decBkg: '#FFFBEB', decBorder: '#D97706',
    regBkg: '#FFF7ED', regBorder: '#EA580C',
    regHeaderBkg: '#FDE8E8', regHeaderBorder: '#E11D48',
    bufBkg: '#F0FDF4', bufBorder: '#16A34A',
    
    // Buses
    busInternal: '#8B5CF6',
    busAddress: '#16A34A',
    busData: '#2563EB',
    
    // Text and utility
    textMain: '#1E293B',
    textMuted: '#64748B',
    white: '#FFFFFF',
    lineColor: '#64748B',
  }

  // Helper: Arrow line with arrowhead
  function Arrow({ x1, y1, x2, y2, bidirectional = false, dashed = false, color = C.lineColor, label = '' }) {
    const isVertical = x1 === x2
    return (
      <g>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray={dashed ? '4,3' : 'none'}
        />
        {/* Head 2 (at x2, y2) */}
        <polygon
          points={
            isVertical
              ? y2 > y1
                ? `${x2},${y2} ${x2 - 4},${y2 - 6} ${x2 + 4},${y2 - 6}` // pointing down
                : `${x2},${y2} ${x2 - 4},${y2 + 6} ${x2 + 4},${y2 + 6}` // pointing up
              : x2 > x1
              ? `${x2},${y2} ${x2 - 6},${y2 - 4} ${x2 - 6},${y2 + 4}` // pointing right
              : `${x2},${y2} ${x2 + 6},${y2 - 4} ${x2 + 6},${y2 + 4}` // pointing left
          }
          fill={color}
        />
        {/* Head 1 (at x1, y1) for bidirectional */}
        {bidirectional && (
          <polygon
            points={
              isVertical
                ? y2 > y1
                  ? `${x1},${y1} ${x1 - 4},${y1 + 6} ${x1 + 4},${y1 + 6}` // pointing up
                  : `${x1},${y1} ${x1 - 4},${y1 - 6} ${x1 + 4},${y1 - 6}` // pointing down
                : x2 > x1
                ? `${x1},${y1} ${x1 + 6},${y1 - 4} ${x1 + 6},${y1 + 4}` // pointing left
                : `${x1},${y1} ${x1 - 6},${y1 - 4} ${x1 - 6},${y1 + 4}` // pointing right
            }
            fill={color}
          />
        )}
        {label && (
          <text
            x={(x1 + x2) / 2}
            y={(y1 + y2) / 2 - 4}
            textAnchor="middle"
            fontSize={8}
            fontWeight="600"
            fill={color}
          >
            {label}
          </text>
        )}
      </g>
    )
  }

  // Helper: Text Block
  function Block({ x, y, w, h, bg, border, title, desc = '', subdesc = '' }) {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill={bg} stroke={border} strokeWidth={1.5} rx={5} />
        <text
          x={x + w / 2}
          y={y + (desc ? 16 : h / 2 + 4)}
          textAnchor="middle"
          fontSize={10.5}
          fontWeight="800"
          fill={border}
        >
          {title}
        </text>
        {desc && (
          <text x={x + w / 2} y={y + 28} textAnchor="middle" fontSize={8.5} fill={C.textMain}>
            {desc}
          </text>
        )}
        {subdesc && (
          <text x={x + w / 2} y={y + 39} textAnchor="middle" fontSize={8} fill={C.textMuted}>
            {subdesc}
          </text>
        )}
      </g>
    )
  }

  return (
    <g fontFamily="Poppins, Inter, sans-serif">
      {/* ── Outer Chip Border ── */}
      <rect x={5} y={5} width={990} height={630} fill="none" stroke="#94A3B8" strokeWidth={1} rx={8} />

      {/* ═══════════════════ TOP LAYER (Above Bus) ═══════════════════ */}
      {/* Interrupt Control */}
      <Block
        x={200}
        y={40}
        w={280}
        h={50}
        bg={C.intBkg}
        border={C.intBorder}
        title="Interrupt Control"
        desc="TRAP, RST 7.5, RST 6.5, RST 5.5, INTR, INTA"
      />
      {/* Interrupt Lines (Pins) */}
      {[
        { pin: 'TRAP (NMI)', x: 230 },
        { pin: 'RST 7.5', x: 275 },
        { pin: 'RST 6.5', x: 320 },
        { pin: 'RST 5.5', x: 365 },
        { pin: 'INTR', x: 410 },
      ].map((p, idx) => (
        <g key={idx}>
          <line x1={p.x} y1={10} x2={p.x} y2={40} stroke={C.intBorder} strokeWidth={1.2} />
          <polygon points={`${p.x},40 ${p.x - 3},35 ${p.x + 3},35`} fill={C.intBorder} />
          <text x={p.x} y={24} textAnchor="middle" fontSize={7} fontWeight="700" fill={C.intBorder} transform={`rotate(-90, ${p.x}, 24)`}>
            {p.pin}
          </text>
        </g>
      ))}
      {/* INTA Pin (Output) */}
      <g>
        <line x1={455} y1={40} x2={455} y2={10} stroke={C.intBorder} strokeWidth={1.2} />
        <polygon points={`${455},10 ${452},15 ${458},15`} fill={C.intBorder} />
        <text x={459} y={24} fontSize={7} fontWeight="700" fill={C.intBorder} transform={`rotate(-90, 459, 24)`}>
          INTĀ
        </text>
      </g>

      {/* Serial I/O Control */}
      <Block
        x={580}
        y={40}
        w={180}
        h={50}
        bg={C.serialBkg}
        border={C.serialBorder}
        title="Serial I/O Control"
        desc="SID (Input)  /  SOD (Output)"
      />
      {/* SID Pin */}
      <g>
        <line x1={620} y1={10} x2={620} y2={40} stroke={C.serialBorder} strokeWidth={1.2} />
        <polygon points={`${620},40 ${617},35 ${623},35`} fill={C.serialBorder} />
        <text x={617} y={24} textAnchor="end" fontSize={7} fontWeight="700" fill={C.serialBorder} transform={`rotate(-90, 617, 24)`}>
          SID
        </text>
      </g>
      {/* SOD Pin */}
      <g>
        <line x1={720} y1={40} x2={720} y2={10} stroke={C.serialBorder} strokeWidth={1.2} />
        <polygon points={`${720},10 ${717},15 ${723},15`} fill={C.serialBorder} />
        <text x={723} y={24} fontSize={7} fontWeight="700" fill={C.serialBorder} transform={`rotate(-90, 723, 24)`}>
          SOD
        </text>
      </g>


      {/* ═══════════════════ UPPER MIDDLE: 8-BIT INTERNAL BUS ═══════════════════ */}
      <rect x={20} y={120} width={960} height={20} fill="#F5F3FF" stroke={C.busInternal} strokeWidth={2} rx={4} />
      <text x={500} y={133} textAnchor="middle" fontSize={10} fontWeight="900" fill={C.busInternal} letterSpacing={1}>
        8-bit Internal Data Bus
      </text>

      {/* Connections between Top Blocks and Internal Bus */}
      <Arrow x1={340} y1={90} x2={340} y2={120} bidirectional={true} color={C.intBorder} />
      <Arrow x1={670} y1={90} x2={670} y2={120} bidirectional={true} color={C.serialBorder} />


      {/* ═══════════════════ BOTTOM LEFT (ALU / ACC / FLAGS) ═══════════════════ */}
      {/* Accumulator */}
      <Block
        x={20}
        y={190}
        w={115}
        h={45}
        bg={C.accBkg}
        border={C.accBorder}
        title="Accumulator"
        desc="(8-bit)"
      />
      <Arrow x1={77} y1={140} x2={77} y2={190} bidirectional={true} color={C.accBorder} />

      {/* Temporary Register */}
      <Block
        x={150}
        y={190}
        w={115}
        h={45}
        bg={C.accBkg}
        border={C.accBorder}
        title="Temporary Reg"
        desc="(8-bit)"
      />
      <Arrow x1={207} y1={140} x2={207} y2={190} color={C.accBorder} />

      {/* ALU */}
      <g>
        {/* Trapezoidal shape for ALU */}
        <polygon
          points="60,295 220,295 190,340 90,340"
          fill={C.aluBkg}
          stroke={C.aluBorder}
          strokeWidth={2}
        />
        <text x={140} y={322} textAnchor="middle" fontSize={13} fontWeight="900" fill={C.aluBorder}>
          ALU (8-bit)
        </text>
      </g>
      {/* Accumulator → ALU */}
      <Arrow x1={77} y1={235} x2={100} y2={295} color={C.accBorder} />
      {/* Temp Reg → ALU */}
      <Arrow x1={207} y1={235} x2={180} y2={295} color={C.accBorder} />

      {/* Flag Register */}
      <Block
        x={280}
        y={230}
        w={105}
        h={50}
        bg={C.flagBkg}
        border={C.flagBorder}
        title="Flag Register"
        desc="S  Z  AC  P  CY"
        subdesc="Sign, Zero, Aux Carry, Parity, Carry"
      />
      {/* ALU ↔ Flags bidirectional connection */}
      <path
        d="M 190,320 H 332 V 280"
        fill="none"
        stroke={C.aluBorder}
        strokeWidth={1.5}
      />
      <polygon points="190,320 195,317 195,323" fill={C.aluBorder} />
      <polygon points="332,280 329,285 335,285" fill={C.aluBorder} />

      {/* ALU Output back to internal bus */}
      <path
        d="M 140,340 V 360 H 15 M 15,360 V 130 H 20"
        fill="none"
        stroke={C.aluBorder}
        strokeWidth={1.5}
      />
      <polygon points="20,130 15,127 15,133" fill={C.aluBorder} />


      {/* ═══════════════════ BOTTOM CENTER (INSTRUCTION / TIMING) ═══════════════════ */}
      {/* Instruction Register */}
      <Block
        x={430}
        y={190}
        w={130}
        h={45}
        bg={C.decBkg}
        border={C.decBorder}
        title="Instruction Reg"
        desc="(8-bit)"
      />
      <Arrow x1={495} y1={140} x2={495} y2={190} color={C.decBorder} />

      {/* Instruction Decoder */}
      <Block
        x={430}
        y={265}
        w={130}
        h={55}
        bg={C.decBkg}
        border={C.decBorder}
        title="Instruction Decoder"
        desc="&amp; Machine Cycle"
        subdesc="Encoder"
      />
      <Arrow x1={495} y1={235} x2={495} y2={265} color={C.decBorder} />

      {/* Instruction Decoder → Timing & Control */}
      <Arrow x1={495} y1={320} x2={495} y2={400} color={C.decBorder} />

      {/* Timing & Control Unit */}
      <g>
        <rect x={30} y={400} width={550} height={130} fill={C.ctrlBkg} stroke={C.ctrlBorder} strokeWidth={2} rx={6} />
        <text x={305} y={422} textAnchor="middle" fontSize={13} fontWeight="800" fill={C.ctrlBorder}>
          Timing &amp; Control Unit
        </text>
      </g>

      {/* Pins at Bottom of Timing & Control */}
      {/* Group 1: Power & Clock */}
      {[
        { label: 'X1', x: 60, dir: 'in' },
        { label: 'X2', x: 100, dir: 'in' },
        { label: 'CLK OUT', x: 140, dir: 'out' },
      ].map((p, idx) => (
        <g key={idx}>
          {p.dir === 'in' ? (
            <Arrow x1={p.x} y1={560} x2={p.x} y2={530} color={C.ctrlBorder} />
          ) : (
            <Arrow x1={p.x} y1={530} x2={p.x} y2={560} color={C.ctrlBorder} />
          )}
          <text x={p.x} y={575} textAnchor="middle" fontSize={8} fontWeight="700" fill={C.ctrlBorder}>
            {p.label}
          </text>
        </g>
      ))}

      {/* Group 2: Control Signals */}
      {[
        { label: 'RD̄', x: 200 },
        { label: 'WR̄', x: 235 },
        { label: 'ALE', x: 270 },
        { label: 'S0', x: 305 },
        { label: 'S1', x: 340 },
        { label: 'IO/M̄', x: 375 },
      ].map((p, idx) => (
        <g key={idx}>
          <Arrow x1={p.x} y1={530} x2={p.x} y2={560} color={C.ctrlBorder} />
          <text x={p.x} y={575} textAnchor="middle" fontSize={8} fontWeight="700" fill={C.ctrlBorder}>
            {p.label}
          </text>
        </g>
      ))}

      {/* Group 3: Status & Reset */}
      {[
        { label: 'READY', x: 430, dir: 'in' },
        { label: 'HOLD', x: 465, dir: 'in' },
        { label: 'HLDA', x: 500, dir: 'out' },
        { label: 'RESET IN̄', x: 535, dir: 'in' },
        { label: 'RESET OUT', x: 570, dir: 'out' },
      ].map((p, idx) => (
        <g key={idx}>
          {p.dir === 'in' ? (
            <Arrow x1={p.x} y1={560} x2={p.x} y2={530} color={C.ctrlBorder} />
          ) : (
            <Arrow x1={p.x} y1={530} x2={p.x} y2={560} color={C.ctrlBorder} />
          )}
          <text x={p.x} y={575} textAnchor="middle" fontSize={7} fontWeight="700" fill={C.ctrlBorder}>
            {p.label}
          </text>
        </g>
      ))}


      {/* ═══════════════════ BOTTOM RIGHT (MULTIPLEXER & REGISTERS) ═══════════════════ */}
      {/* Register Select / Multiplexer */}
      <Block
        x={690}
        y={190}
        w={150}
        h={32}
        bg={C.regHeaderBkg}
        border={C.regHeaderBorder}
        title="Register Select / Multiplexer"
      />
      <Arrow x1={765} y1={140} x2={765} y2={190} bidirectional={true} color={C.regBorder} />

      {/* Register Array Table */}
      <g transform="translate(690, 222)">
        {/* Table outline */}
        <rect x={0} y={0} width={150} height={196} fill={C.regBkg} stroke={C.regBorder} strokeWidth={1.5} />
        
        {/* Row 1: Temporary registers W & Z */}
        <line x1={0} y1={28} x2={150} y2={28} stroke={C.regBorder} strokeWidth={1} />
        <line x1={75} y1={0} x2={75} y2={28} stroke={C.regBorder} strokeWidth={1} />
        <text x={37.5} y={18} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>W (8-bit)</text>
        <text x={112.5} y={18} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>Z (8-bit)</text>
        
        {/* Row 2: B & C */}
        <line x1={0} y1={56} x2={150} y2={56} stroke={C.regBorder} strokeWidth={1} />
        <line x1={75} y1={28} x2={75} y2={56} stroke={C.regBorder} strokeWidth={1} />
        <text x={37.5} y={46} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>B (8-bit)</text>
        <text x={112.5} y={46} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>C (8-bit)</text>
        
        {/* Row 3: D & E */}
        <line x1={0} y1={84} x2={150} y2={84} stroke={C.regBorder} strokeWidth={1} />
        <line x1={75} y1={56} x2={75} y2={84} stroke={C.regBorder} strokeWidth={1} />
        <text x={37.5} y={74} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>D (8-bit)</text>
        <text x={112.5} y={74} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>E (8-bit)</text>

        {/* Row 4: H & L */}
        <line x1={0} y1={112} x2={150} y2={112} stroke={C.regBorder} strokeWidth={1} />
        <line x1={75} y1={84} x2={75} y2={112} stroke={C.regBorder} strokeWidth={1} />
        <text x={37.5} y={102} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>H (8-bit)</text>
        <text x={112.5} y={102} textAnchor="middle" fontSize={10} fontWeight="700" fill={C.regBorder}>L (8-bit)</text>

        {/* Row 5: Stack Pointer (SP) */}
        <line x1={0} y1={140} x2={150} y2={140} stroke={C.regBorder} strokeWidth={1} />
        <text x={75} y={130} textAnchor="middle" fontSize={9.5} fontWeight="800" fill={C.regBorder}>Stack Pointer (SP) (16-bit)</text>

        {/* Row 6: Program Counter (PC) */}
        <line x1={0} y1={168} x2={150} y2={168} stroke={C.regBorder} strokeWidth={1} />
        <text x={75} y={158} textAnchor="middle" fontSize={9.5} fontWeight="800" fill={C.regBorder}>Program Counter (PC) (16-bit)</text>

        {/* Row 7: Incrementer/Decrementer Address Latch */}
        <text x={75} y={185} textAnchor="middle" fontSize={8} fontWeight="800" fill={C.regBorder}>Incrementer/Decrementer Latch (16-bit)</text>
      </g>

      {/* Reg Select Column (Vertical block to the left of the table) */}
      <g>
        <rect x={660} y={222} width={30} height={196} fill="#FEF3C7" stroke={C.regBorder} strokeWidth={1.5} rx={2} />
        <text x={676} y={320} textAnchor="middle" fontSize={9} fontWeight="800" fill={C.regBorder} transform="rotate(-90, 676, 320)">
          Register Select
        </text>
      </g>


      {/* Address Buffer (16-bit output from PC/SP/Latch) */}
      <Block
        x={630}
        y={460}
        w={130}
        h={35}
        bg={C.bufBkg}
        border={C.bufBorder}
        title="Address Buffer"
        desc="(8-bit)"
      />
      {/* Output from Register Table to Address Buffer */}
      <path
        d="M 725,418 V 440 H 695 V 460"
        fill="none"
        stroke={C.regBorder}
        strokeWidth={1.5}
      />
      <polygon points="695,460 692,455 698,455" fill={C.regBorder} />

      {/* Data/Address Buffer (8-bit bidirectional) */}
      <Block
        x={810}
        y={460}
        w={150}
        h={35}
        bg={C.bufBkg}
        border={C.bufBorder}
        title="Data/Address Buffer"
        desc="(8-bit)"
      />
      {/* Output from Register Table to Data/Address Buffer */}
      <path
        d="M 805,418 V 440 H 885 V 460"
        fill="none"
        stroke={C.regBorder}
        strokeWidth={1.5}
      />
      <polygon points="885,460 882,455 888,455" fill={C.regBorder} />

      {/* Link from Data/Address Buffer back to Internal Bus (bidirectional) */}
      <path
        d="M 940,460 V 160 H 940 Z"
        fill="none"
        stroke={C.bufBorder}
        strokeWidth={1.5}
      />
      <Arrow x1={940} y1={460} x2={940} y2={140} bidirectional={true} color={C.bufBorder} />


      {/* ═══════════════════ EXTERNAL SYSTEM BUSES (Bottom) ═══════════════════ */}
      {/* high-order Address Bus A8 - A15 */}
      <g>
        <rect x={600} y={540} width={180} height={20} fill="#F0FDF4" stroke={C.busAddress} strokeWidth={2} rx={4} />
        <text x={690} y={553} textAnchor="middle" fontSize={8.5} fontWeight="800" fill={C.busAddress}>
          Address Bus (A8 – A15) (Unidirectional)
        </text>
        <Arrow x1={695} y1={495} x2={695} y2={540} color={C.busAddress} />
        <Arrow x1={695} y1={560} x2={695} y2={595} color={C.busAddress} />
      </g>

      {/* multiplexed Address/Data Bus AD0 - AD7 */}
      <g>
        <rect x={800} y={540} width={180} height={20} fill="#EFF6FF" stroke={C.busData} strokeWidth={2} rx={4} />
        <text x={890} y={553} textAnchor="middle" fontSize={8} fontWeight="800" fill={C.busData}>
          Address/Data Bus (AD0 – AD7) (Bidir)
        </text>
        <Arrow x1={885} y1={495} x2={885} y2={540} bidirectional={true} color={C.busData} />
        <Arrow x1={885} y1={560} x2={885} y2={595} bidirectional={true} color={C.busData} />
      </g>

      {/* External bottom arrows for Address / Data */}
      <text x={695} y={610} textAnchor="middle" fontSize={8} fontWeight="700" fill={C.busAddress}>
        A8 – A15 Address
      </text>
      <text x={895} y={610} textAnchor="middle" fontSize={8} fontWeight="700" fill={C.busData}>
        AD0 – AD7 Address/Data
      </text>
    </g>
  )
}
