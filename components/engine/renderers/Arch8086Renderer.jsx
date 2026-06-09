'use client'

import React from 'react'

/**
 * Arch8086Renderer — pixel-accurate Intel 8086 block diagram
 * Matches canonical textbook layout:
 * • BIU (left): Σ adder, Segment Registers, IP, 6-byte queue, Control Unit
 * • EU (right):  Paired GP Registers, SP/BP/SI/DI, Internal Bus, ALU, Operands, Flags
 * • Three system buses at bottom: 20-bit Address, 16-bit Data, Control
 */
export default function Arch8086Renderer() {
  const W = 900, H = 500

  // ── Palette ────────────────────────────────────────────────────────────────
  const C = {
    biuBg:      '#EFF6FF', biuBorder:   '#1D4ED8',
    euBg:       '#FFF7ED', euBorder:    '#C2410C',
    segColors:  ['#DBEAFE', '#BFDBFE', '#BAE6FD', '#A5F3FC'],
    segBorder:  '#3B82F6',
    ipBg:       '#EDE9FE', ipBorder:    '#7C3AED',
    adderBg:    '#FEF3C7', adderBorder: '#D97706',
    queueBg:    '#DCFCE7', queueBorder: '#16A34A',
    cuBg:       '#F0FDF4', cuBorder:    '#15803D',
    regBg:      '#FED7AA', regBorder:   '#EA580C',
    regHl:      '#FDBA74',
    aluBg:      '#EDE9FE', aluBorder:   '#7C3AED',
    opsBg:      '#F0FDF4', opsBorder:   '#16A34A',
    flagBg:     '#FEF3C7', flagBorder:  '#D97706',
    tmpBg:      '#F1F5F9', tmpBorder:   '#64748B',
    bus20:      '#15803D',
    bus16:      '#1D4ED8',
    busCtrl:    '#DC2626',
    intBus:     '#9333EA',
    arrow:      '#64748B',
    text:       '#1E293B',
    mutedText:  '#64748B',
    white:      '#FFFFFF',
  }

  // ── BIU frame ──────────────────────────────────────────────────────────────
  const biuX = 8, biuY = 48, biuW = 368, biuH = 340

  // ── EU frame ───────────────────────────────────────────────────────────────
  const euX = 390, euY = 48, euW = 502, euH = 340

  // ── Bus bar Y positions ───────────────────────────────────────────────────
  const bus1Y = 415, bus2Y = 438, bus3Y = 461

  // ── 6-Byte queue cells ────────────────────────────────────────────────────
  const qX = 228, qCellH = 26, qCellW = 108, qStartY = 105
  const qCells = Array.from({ length: 6 }, (_, i) => ({
    x: qX, y: qStartY + i * (qCellH + 2), w: qCellW, h: qCellH
  }))

  // ── Segment register rows ─────────────────────────────────────────────────
  const segNames = ['CS — Code Segment', 'DS — Data Segment', 'SS — Stack Segment', 'ES — Extra Segment']
  const segX = 20, segW = 182, segH = 24, segStartY = 178

  // ── GP registers (paired: H|L → 16-bit) ───────────────────────────────────
  const gpRegs = [
    { h: 'AH', l: 'AL', full: 'AX' },
    { h: 'BH', l: 'BL', full: 'BX' },
    { h: 'CH', l: 'CL', full: 'CX' },
    { h: 'DH', l: 'DL', full: 'DX' },
  ]
  const gpX = 400, gpCellW = 55, gpCellH = 24, gpStartY = 105
  const gpGap = 4

  // ── Pointer/Index registers ───────────────────────────────────────────────
  const ptrRegs = [
    { short: 'SP', full: 'Stack Pointer' },
    { short: 'BP', full: 'Base Pointer' },
    { short: 'SI', full: 'Source Index' },
    { short: 'DI', full: 'Dest Index' }
  ]
  const ptrX = 400, ptrW = 112, ptrH = 24, ptrStartY = 234

  // ── Internal bus Y ────────────────────────────────────────────────────────
  const intBusY = 356

  // ── ALU / Operands / Flags ────────────────────────────────────────────────
  const aluX = 660, aluY = 105, aluW = 215, aluH = 68
  const opsY = 182, opsH = 32
  const flagY = 224, flagH = 32
  const tmpY = 266, tmpH = 32

  // ── Control Unit ──────────────────────────────────────────────────────────
  const cuX = biuX + 14, cuY = 326, cuW = 316, cuH = 46



  return (
    <g fontFamily="Poppins, Inter, sans-serif">

      {/* ────────────────────────────────── HEADER ──────────────────────────── */}
      {/* "To memory and Input/Output" arrow at top */}
      <rect x={18} y={4} width={180} height={24} fill="#E0F2FE" stroke="#0284C7" strokeWidth={1.5} rx={6} />
      <text x={108} y={19} textAnchor="middle" fontSize={9.5} fontWeight="700" fill="#0369A1">
        To Memory and Input / Output
      </text>
      {/* Arrow down from that box into BIU */}
      <line x1={108} y1={28} x2={108} y2={biuY} stroke="#0284C7" strokeWidth={2} />
      <polygon points={`${108},${biuY} ${103},${biuY - 7} ${113},${biuY - 7}`} fill="#0284C7" />

      {/* Queue → Memory arrow at top-right */}
      <line x1={qX + qCellW + 4} y1={qStartY + 2 * (qCellH + 2) + qCellH / 2}
            x2={biuX + biuW - 6} y2={qStartY + 2 * (qCellH + 2) + qCellH / 2}
            stroke="#0284C7" strokeWidth={1.5} strokeDasharray="4,3" />

      {/* ─────────────────────────────────── BIU ────────────────────────────── */}
      {/* Outer frame */}
      <rect x={biuX} y={biuY} width={biuW} height={biuH}
        fill={C.biuBg} stroke={C.biuBorder} strokeWidth={2.5} rx={10} />

      {/* BIU label */}
      <text x={biuX + biuW / 2} y={biuY + 22} textAnchor="middle"
        fontSize={13} fontWeight="800" fill={C.biuBorder}>BIU — Bus Interface Unit</text>

      {/* ── Σ Adder ── */}
      <rect x={20} y={105} width={176} height={42}
        fill={C.adderBg} stroke={C.adderBorder} strokeWidth={2} rx={6} />
      {/* Big Σ symbol */}
      <text x={40} y={135} textAnchor="middle" fontSize={24} fontWeight="900" fill={C.adderBorder}>Σ</text>
      {/* Formula */}
      <text x={115} y={120} textAnchor="middle" fontSize={8.5} fontWeight="700" fill="#92400E">Physical Address =</text>
      <text x={115} y={131} textAnchor="middle" fontSize={9} fontWeight="800" fill="#92400E">Segment × 10H + Offset</text>
      <text x={115} y={141} textAnchor="middle" fontSize={8} fill="#92400E" fontStyle="italic">20-bit Physical Address</text>

      {/* Arrow from Σ to Segment Registers */}
      <line x1={150} y1={147} x2={150} y2={segStartY - 4}
        stroke={C.adderBorder} strokeWidth={1.5} markerEnd="url(#arr)" />

      {/* ── Segment Registers ── */}
      <text x={segX + 30} y={segStartY - 10} textAnchor="start"
        fontSize={10} fontWeight="700" fill={C.biuBorder}>Segment Registers</text>
      {segNames.map((name, i) => {
        const y = segStartY + i * (segH + 3)
        const abbr = name.split(' — ')[0]
        return (
          <g key={abbr}>
            <rect x={segX} y={y} width={segW} height={segH}
              fill={C.segColors[i]} stroke={C.segBorder} strokeWidth={1.5} rx={4} />
            <text x={segX + 12} y={y + segH / 2 + 3} fontSize={9.5} fontWeight="700" fill="#1E3A5F">{abbr}</text>
            <text x={segX + 42} y={y + segH / 2 + 3} fontSize={9} fill="#374151">
              {name.split(' — ')[1]}
            </text>
          </g>
        )
      })}

      {/* Arrow: Segment Registers → Σ */}
      <line x1={segX + 15} y1={segStartY}
            x2={segX + 15} y2={147}
            stroke={C.segBorder} strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />

      {/* ── IP Register ── */}
      {(() => {
        const ipY = segStartY + segNames.length * (segH + 3) + 4
        return (
          <g>
            <rect x={segX} y={ipY} width={segW} height={26}
              fill={C.ipBg} stroke={C.ipBorder} strokeWidth={1.5} rx={4} />
            <text x={segX + 12} y={ipY + 17} fontSize={10} fontWeight="700" fill="#581C87">IP</text>
            <text x={segX + 42} y={ipY + 17} fontSize={9} fill="#581C87">Instruction Pointer (16-bit)</text>
          </g>
        )
      })()}

      {/* ── 6-Byte Pre-fetch Queue ── */}
      {/* Queue label */}
      <text
        x={qX + qCellW + 16}
        y={qStartY + 3 * (qCellH + 2)}
        textAnchor="middle"
        fontSize={9}
        fontWeight="700"
        fill={C.queueBorder}
        transform={`rotate(-90, ${qX + qCellW + 16}, ${qStartY + 3 * (qCellH + 2)})`}
      >
        6-Byte Pre-fetch Queue (FIFO)
      </text>

      {qCells.map((cell, i) => (
        <g key={i}>
          <rect x={cell.x} y={cell.y} width={cell.w} height={cell.h}
            fill={i % 2 === 0 ? C.queueBg : '#BBFFD8'}
            stroke={C.queueBorder} strokeWidth={1.5} rx={4} />
          <text x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 + 4}
            textAnchor="middle" fontSize={8.5} fill="#14532D" fontWeight="600">
            Byte {6 - i}
          </text>
        </g>
      ))}

      {/* Arrow from queue → CU */}
      <line x1={qX + qCellW / 2} y1={qStartY + 6 * (qCellH + 2)}
            x2={qX + qCellW / 2} y2={cuY}
            stroke={C.cuBorder} strokeWidth={1.5} />
      <polygon
        points={`${qX + qCellW / 2},${cuY} ${qX + qCellW / 2 - 5},${cuY - 7} ${qX + qCellW / 2 + 5},${cuY - 7}`}
        fill={C.cuBorder} />

      {/* ── Control Unit ── */}
      <rect x={cuX} y={cuY} width={cuW} height={cuH}
        fill={C.cuBg} stroke={C.cuBorder} strokeWidth={2} rx={6} />
      <text x={cuX + cuW / 2} y={cuY + 18} textAnchor="middle"
        fontSize={11} fontWeight="800" fill="#15803D">Control Unit &amp; Instruction Decoder</text>
      <text x={cuX + cuW / 2} y={cuY + 34} textAnchor="middle"
        fontSize={8} fill="#166534">Decodes instructions · Generates timing &amp; control signals</text>

      {/* Arrow CU → 16-bit internal bus area  */}
      <line x1={cuX + cuW} y1={cuY + cuH / 2}
            x2={euX + 10} y2={cuY + cuH / 2}
            stroke={C.intBus} strokeWidth={1.5} strokeDasharray="5,3" />

      {/* ── EU Label ── */}
      <rect x={euX} y={euY} width={euW} height={euH}
        fill={C.euBg} stroke={C.euBorder} strokeWidth={2.5} rx={10} />
      <text x={euX + euW / 2} y={euY + 22} textAnchor="middle"
        fontSize={13} fontWeight="800" fill={C.euBorder}>EU — Execution Unit</text>

      {/* ── General Purpose Registers label ── */}
      <text x={gpX + gpCellW} y={gpStartY - 10} textAnchor="middle"
        fontSize={10} fontWeight="700" fill={C.euBorder}>General Purpose Registers</text>

      {/* ── GP Registers (paired) ── */}
      {gpRegs.map((reg, i) => {
        const y = gpStartY + i * (gpCellH + gpGap)
        const hX = gpX, lX = gpX + gpCellW + 2, lblX = gpX + 2 * gpCellW + 8
        return (
          <g key={reg.full}>
            {/* H half */}
            <rect x={hX} y={y} width={gpCellW} height={gpCellH}
              fill={C.regBg} stroke={C.regBorder} strokeWidth={1.5} rx={4} />
            <text x={hX + gpCellW / 2} y={y + 15} textAnchor="middle" fontSize={10} fill="#7C2D12" fontWeight="700">{reg.h}</text>

            {/* L half */}
            <rect x={lX} y={y} width={gpCellW} height={gpCellH}
              fill={C.regHl} stroke={C.regBorder} strokeWidth={1.5} rx={4} />
            <text x={lX + gpCellW / 2} y={y + 15} textAnchor="middle" fontSize={10} fill="#7C2D12" fontWeight="700">{reg.l}</text>

            {/* 16-bit label next to the pair */}
            <text x={lblX} y={y + 16} textAnchor="start"
              fontSize={9.5} fill="#7C2D12" fontWeight="700">{reg.full} (16-bit)</text>
          </g>
        )
      })}

      {/* ── Pointer / Index Registers ── */}
      <text x={ptrX + gpCellW} y={ptrStartY - 10} textAnchor="middle"
        fontSize={10} fontWeight="700" fill={C.euBorder}>Pointer &amp; Index Registers</text>
      {ptrRegs.map((reg, i) => {
        const y = ptrStartY + i * (ptrH + gpGap)
        const lblX = ptrX + 2 * gpCellW + 8
        return (
          <g key={reg.short}>
            <rect x={ptrX} y={y} width={2 * gpCellW + 2} height={ptrH}
              fill="#FFE4E6" stroke="#F43F5E" strokeWidth={1.5} rx={4} />
            <text x={ptrX + gpCellW} y={y + 15} textAnchor="middle" fontSize={10} fontWeight="700" fill="#9F1239">
              {reg.short}
            </text>
            <text x={lblX} y={y + 16} textAnchor="start" fontSize={9.5} fill="#BE123C" fontWeight="700">
              {reg.full} (16-bit)
            </text>
          </g>
        )
      })}

      {/* ── 16-bit Internal Bus ── */}
      <rect x={euX + 8} y={intBusY} width={euW - 16} height={18}
        fill="#F5F3FF" stroke={C.intBus} strokeWidth={2} rx={4} />
      <text x={euX + euW / 2} y={intBusY + 12} textAnchor="middle"
        fontSize={9} fontWeight="700" fill={C.intBus}>
        16-bit Internal Bus (EU ↔ BIU)
      </text>

      {/* Arrow from Internal Bus → ALU */}
      <line x1={aluX + aluW / 2} y1={intBusY}
            x2={aluX + aluW / 2} y2={aluY + aluH}
            stroke={C.intBus} strokeWidth={1.5} />
      <polygon
        points={`${aluX + aluW / 2},${aluY + aluH} ${aluX + aluW / 2 - 5},${aluY + aluH + 7} ${aluX + aluW / 2 + 5},${aluY + aluH + 7}`}
        fill={C.intBus} />

      {/* Arrow from GP Registers → Internal Bus */}
      <line x1={gpX + gpCellW} y1={intBusY - 1}
            x2={gpX + gpCellW} y2={ptrStartY + ptrRegs.length * (ptrH + gpGap) - gpGap}
            stroke={C.intBus} strokeWidth={1} strokeDasharray="3,2" />

      {/* ── ALU ── */}
      <rect x={aluX} y={aluY} width={aluW} height={aluH}
        fill={C.aluBg} stroke={C.aluBorder} strokeWidth={2.5} rx={8} />
      <text x={aluX + aluW / 2} y={aluY + 20} textAnchor="middle"
        fontSize={15} fontWeight="900" fill="#581C87">ALU</text>
      <text x={aluX + aluW / 2} y={aluY + 34} textAnchor="middle"
        fontSize={9} fontWeight="600" fill="#6D28D9">Arithmetic &amp; Logic Unit</text>
      <text x={aluX + aluW / 2} y={aluY + 48} textAnchor="middle"
        fontSize={8.5} fill="#7C3AED">ADD  SUB  MUL  DIV</text>
      <text x={aluX + aluW / 2} y={aluY + 60} textAnchor="middle"
        fontSize={8.5} fill="#7C3AED">AND  OR  NOT  XOR  CMP</text>

      {/* ALU → Operands arrow */}
      <line x1={aluX + aluW / 2} y1={aluY + aluH}
            x2={aluX + aluW / 2} y2={opsY}
            stroke={C.aluBorder} strokeWidth={1.5} />
      <polygon
        points={`${aluX + aluW / 2},${opsY} ${aluX + aluW / 2 - 5},${opsY - 7} ${aluX + aluW / 2 + 5},${opsY - 7}`}
        fill={C.aluBorder} />

      {/* ── Operands ── */}
      <rect x={aluX} y={opsY} width={aluW} height={opsH}
        fill={C.opsBg} stroke={C.opsBorder} strokeWidth={2} rx={6} />
      <text x={aluX + aluW / 2} y={opsY + 14} textAnchor="middle"
        fontSize={10} fontWeight="800" fill="#166534">Operands</text>
      <text x={aluX + aluW / 2} y={opsY + 26} textAnchor="middle"
        fontSize={8} fill="#15803D">Source &amp; Destination data for ALU</text>

      {/* Operands → Flags arrow */}
      <line x1={aluX + aluW / 2} y1={opsY + opsH}
            x2={aluX + aluW / 2} y2={flagY}
            stroke={C.opsBorder} strokeWidth={1.5} />
      <polygon
        points={`${aluX + aluW / 2},${flagY} ${aluX + aluW / 2 - 5},${flagY - 7} ${aluX + aluW / 2 + 5},${flagY - 7}`}
        fill={C.opsBorder} />

      {/* ── Flag Register ── */}
      <rect x={aluX} y={flagY} width={aluW} height={flagH}
        fill={C.flagBg} stroke={C.flagBorder} strokeWidth={2} rx={6} />
      <text x={aluX + aluW / 2} y={flagY + 14} textAnchor="middle"
        fontSize={10} fontWeight="800" fill="#92400E">Flag Register (16-bit)</text>
      <text x={aluX + aluW / 2} y={flagY + 26} textAnchor="middle"
        fontSize={8} fill="#B45309">CF  PF  AF  ZF  SF  TF  IF  DF  OF</text>

      {/* Flags → Temp arrow */}
      <line x1={aluX + aluW / 2} y1={flagY + flagH}
            x2={aluX + aluW / 2} y2={tmpY}
            stroke={C.flagBorder} strokeWidth={1.5} />
      <polygon
        points={`${aluX + aluW / 2},${tmpY} ${aluX + aluW / 2 - 5},${tmpY - 7} ${aluX + aluW / 2 + 5},${tmpY - 7}`}
        fill={C.flagBorder} />

      {/* ── Temporary Registers ── */}
      <rect x={aluX} y={tmpY} width={aluW} height={tmpH}
        fill={C.tmpBg} stroke={C.tmpBorder} strokeWidth={1.5} rx={6} />
      <text x={aluX + aluW / 2} y={tmpY + 13} textAnchor="middle"
        fontSize={9.5} fontWeight="700" fill="#374151">Temporary Registers</text>
      <text x={aluX + aluW / 2} y={tmpY + 25} textAnchor="middle"
        fontSize={8} fill="#64748B">Internal use only (not programmer-visible)</text>

      {/* ─────────────────────────── BUSES ─────────────────────────────────── */}
      {/* 20-bit Address Bus */}
      <Bus y={bus1Y} label="20-bit Address Bus  (A0 – A19)  →  1 MB Memory Space" color={C.bus20} W={W} />

      {/* 16-bit Data Bus */}
      <Bus y={bus2Y} label="16-bit Data Bus  (D0 – D15)  — Bidirectional" color={C.bus16} W={W} />

      {/* Control Bus */}
      <Bus y={bus3Y} label="Control Bus  (RD, WR, IO/M̄, ALE, READY, RESET, INTR, INTA, CLK)" color={C.busCtrl} W={W} />

      {/* Vertical taps from BIU/EU to buses */}
      {[108, 282, 550, 750].map(x => (
        <line key={x} x1={x} y1={biuY + biuH} x2={x} y2={bus1Y}
          stroke="#CBD5E1" strokeWidth={1} strokeDasharray="3,3" />
      ))}

      {/* ── Arrow defs ── */}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M 0 0 L 6 3 L 0 6 z" fill={C.adderBorder} />
        </marker>
      </defs>

      {/* ── Title banner at very bottom ── */}
      <text x={W / 2} y={H - 4} textAnchor="middle"
        fontSize={11} fontWeight="700" fill="#475569" letterSpacing={1}>
        Intel 8086 Microprocessor — Internal Architecture (Block Diagram)
      </text>
    </g>
  )
}

// ─── Bus bar helper ────────────────────────────────────────────────────────────
function Bus({ y, label, color, W }) {
  const pad = 12, midX = W / 2
  const arrowSize = 7
  return (
    <g>
      <rect x={pad} y={y - 9} width={W - pad * 2} height={18}
        fill={color + '18'} stroke={color} strokeWidth={1.5} rx={4} />
      <text x={midX} y={y + 5} textAnchor="middle"
        fontSize={8.5} fontWeight="700" fill={color}>
        {label}
      </text>
      {/* Left arrowhead */}
      <polygon
        points={`${pad},${y} ${pad + arrowSize},${y - 4} ${pad + arrowSize},${y + 4}`}
        fill={color} />
      {/* Right arrowhead */}
      <polygon
        points={`${W - pad},${y} ${W - pad - arrowSize},${y - 4} ${W - pad - arrowSize},${y + 4}`}
        fill={color} />
    </g>
  )
}
