import Groq from 'groq-sdk'
import { matchDiagram, ALL_DIAGRAMS } from '@/lib/diagramLibrary'
import { validateSchematicTopology } from '@/lib/gridSchematicCompiler'

import dcCircuitTemplate from '@/lib/diagrams/electronics/dc-circuit.json'
import acCircuitTemplate from '@/lib/diagrams/electronics/ac-circuit.json'
import zenerRegulatorTemplate from '@/lib/diagrams/electronics/zener-voltage-regulator.json'
import opampInvertingTemplate from '@/lib/diagrams/electronics/opamp-inverting.json'
import opampNoninvertingTemplate from '@/lib/diagrams/electronics/opamp-noninverting.json'
import starDeltaConversionTemplate from '@/lib/diagrams/electronics/star-delta-conversion.json'
import nortonsTheoremBeeTemplate from '@/lib/diagrams/electronics/nortons-theorem-bee.json'
import sourceTransformationTemplate from '@/lib/diagrams/electronics/source-transformation-circuit.json'
import seriesRlTemplate from '@/lib/diagrams/electronics/series-rl-circuit.json'
import seriesRlcResonanceTemplate from '@/lib/diagrams/electronics/series-rlc-resonance.json'
import superpositionTemplate from '@/lib/diagrams/electronics/superposition-theorem-circuit.json'
import theveninsTheoremTemplate from '@/lib/diagrams/electronics/thevenins-theorem-circuit.json'

import {
  solveDcCircuit,
  solveAcRlcCircuit,
  solveZenerRegulator,
  solveOpampInverting,
  solveOpampNoninverting,
  solveStarDelta,
  solveNortonsTheorem,
  solveSourceTransformation,
  solveSeriesRlCircuit,
  solveSeriesRlcResonance,
  solveSuperposition,
  solveThevenin
} from '@/lib/deterministicSolver'


function removeComponentAndMergeWires(schema, compId) {
  if (!schema || !schema.components) return;

  const compIndex = schema.components.findIndex(c => c.id === compId);
  if (compIndex === -1) return;

  const comp = schema.components[compIndex];
  const compGridX = comp.grid ? comp.grid[0] : null;

  // Remove associated labels if they align horizontally (same column)
  if (compGridX !== null && schema.labels) {
    schema.labels = schema.labels.filter(label => {
      if (label.grid && Math.abs(label.grid[0] - compGridX) < 0.2) {
        return false;
      }
      return true;
    });
  }

  // Find all connections in netlist involving this component
  const connectedWires = [];
  const otherWires = [];

  if (schema.netlist) {
    for (const wire of schema.netlist) {
      const fromParts = wire.from.split('.');
      const toParts = wire.to.split('.');
      if (fromParts[0] === compId || toParts[0] === compId) {
        connectedWires.push(wire);
      } else {
        otherWires.push(wire);
      }
    }
  }

  if (connectedWires.length === 2) {
    const wire1 = connectedWires[0];
    const wire2 = connectedWires[1];

    const ext1 = wire1.from.split('.')[0] === compId ? wire1.to : wire1.from;
    const ext2 = wire2.from.split('.')[0] === compId ? wire2.to : wire2.from;

    otherWires.push({ from: ext1, to: ext2 });
  }

  schema.netlist = otherWires;
  schema.components.splice(compIndex, 1);
}


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a technical education expert and diagram specialist. Return ONLY a valid JSON object. No markdown, no backticks, no text outside JSON.

YOUR #1 RESPONSIBILITY IS TECHNICAL ACCURACY.
Include standard textbook components and correct relationships:
- Intel 8085: Accumulator, Temp Reg, ALU, Flags, IR, Dec, Timing/Control, Reg Array (W,Z,B,C,D,E,H,L,SP,PC), Buffers, buses.
- Intel 8086: BIU (Segment Regs CS/DS/SS/ES, IP, Queue) and EU (AX/BX/CX/DX, SP/BP/SI/DI, ALU, Flags).
- 8255 PPI: Data Buffer, R/W Logic, Group A/B Control, Ports A, B, C.
- 8259 PIC: IRR, ISR, IMR, Priority Resolver, Control Logic.
- 8257 DMA: Channels 0-3, Mode Set & Status, R/W Control.
- Waterfall: 6 linear phases in order. Spiral: 4 quadrants clockwise. Prototype: Iterative loop. V-Model: Left Verification, Right Validation. Agile: Product/Sprint Backlog, Daily Standup, Increment.
- DBMS: Query Processor, Storage Manager, Disk Storage, 3-Schema Architecture (External, Conceptual, Internal).
- OSI/TCP-IP: All standard layers (7 or 4/5) and protocols. GSM: MS, BSS (BTS, BSC), NSS (MSC, HLR, VLR, AuC, EIR, GMSC).
- OS Process: 5 or 7 states with correct events. Memory: Registers -> Cache -> RAM -> SSD/HDD -> Tape.
- Compiler: Lexer -> Parser -> Semantic -> ICG -> Optimizer -> CodeGen (all linked to Symbol Table & Error Handler).

DIAGRAM TYPES:
- circuit-schematic: Return coordinate-free Grid Netlist in 'schema' object.
- uml-diagram, dfd-flow: Return custom nodes/connections in 'schema' object.
- flowchart TD/LR, graph TD/LR, erDiagram, sequenceDiagram, stateDiagram-v2: Return Mermaid syntax in 'mermaid_code' string.
* BANNED: classDiagram, block-beta, single quotes inside labels, truncated subgraphs.

CIRCUIT-SCHEMATIC SCHEMA:
Define components on a grid (colSpacing=180, rowSpacing=140). Connect them by terminal names in 'netlist' using { "from": "c1.term", "to": "c2.term" }.
- Symbols: resistor, capacitor, inductor, diode, zener-diode, led, dc-source, ac-source, current-source, op-amp, bjt-npn, bjt-pnp, transformer, switch, ground, vcc-rail, node-label, wire-junction.
- Terminals: left, right, top, bottom, 1, 2, base, collector, emitter, inverting (in-), non-inverting (in+), output.
- Rules: Vcc on top (row 0), Ground on bottom. Vertical branches must have rotation=90. Do not run wires through component bodies. Op-amp in+ must not float. Transistors: connect base, collector, emitter.
- Example: { "type": "circuit-schematic", "grid": { "columns": 3, "rows": 2 }, "components": [{ "id": "V1", "symbol": "dc-source", "grid": [0, 0.5] }, { "id": "R1", "symbol": "resistor", "grid": [1, 0] }, { "id": "R2", "symbol": "resistor", "grid": [2, 0.5], "rotation": 90 }], "netlist": [{ "from": "V1.top", "to": "R1.left" }, { "from": "R1.right", "to": "R2.top" }, { "from": "V1.bottom", "to": "R2.bottom" }] }

RETURN THIS EXACT JSON:
{
  "title": "Title max 5 words",
  "diagram_type": "circuit-schematic|flowchart|erDiagram|sequenceDiagram|stateDiagram|graph|uml-diagram|dfd-flow",
  "schema": {
    "type": "circuit-schematic|uml-diagram|dfd-flow",
    "viewBox": { "width": 620, "height": 380 },
    "grid": { "columns": 4, "rows": 3 },
    "components": [], "netlist": [], "labels": [], "nodes": [], "connections": []
  },
  "mermaid_code": "Mermaid string",
  "theory": "Minimum 180 words technical textbook-style explanation.",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "use_cases": ["case 1", "case 2", "case 3"],
  "complexity": "Beginner|Intermediate|Advanced",
  "subject_category": "Electronics|Networks|Database|Software|Control Systems|Other",
  "fallback_json": {
    "nodes": [{ "id": "n1", "label": "Label", "type": "rectangle" }],
    "edges": [{ "from": "n1", "to": "n2", "label": "signal" }]
  }
}

MERMAID RULES:
1. Node IDs: short alphanumeric, no spaces/special characters.
2. Node labels: Double quotes only. NEVER single quotes. No parentheses inside labels.
3. Subgraphs: Must be quoted. No parentheses.
4. Arrow labels: Double quotes (e.g. -->|\"label\"|).
5. Shapes: [rect], (round), {diamond}, ((circle)), [/parallelogram/].
6. erDiagram: Entity ALL_CAPS. Line exactly '--' or '..'. Cardinality: ||, |o, o|, |{, }|, o{, }o. Label: : \"label\".
7. sequenceDiagram: Single-word participants, use activate/deactivate.
8. GSM Example Flowchart:
flowchart TD
  MS["Mobile Station"] -->|"Um"| BTS["Base Transceiver Station"]
  BTS -->|"Abis"| BSC["Base Station Controller"]
  BSC -->|"A"| MSC["Mobile Switching Center"]`

// OpenRouter fallback with model rotation support
async function callOpenRouter(prompt, modelName = 'meta-llama/llama-3.3-70b-instruct:free', customPrompt = null) {
  const promptToUse = customPrompt || `Generate a technically accurate, complete, student-friendly diagram for: ${prompt.trim()}`
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'DiagramAI',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptToUse },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }),
  })
  if (!res.ok) throw new Error(`OpenRouter (${modelName}) error: ${res.status}`)
  const data = await res.json()
  if (!data.choices || data.choices.length === 0) {
    throw new Error(`OpenRouter (${modelName}) returned no choices`)
  }
  return data.choices[0].message.content
}

//  Parse AI response safely 
function parseResponse(text) {
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  try { return JSON.parse(clean) } catch {}
  const match = clean.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  throw new Error('Could not parse AI response as JSON')
}

// Helper to clean a single node definition or reference part in flowchart/graph diagrams
function cleanNodePart(part, definedNodeIds = new Set(), printedNodeIds = new Set()) {
  part = part.trim()
  if (!part) return ''
  
  // Find the first shape bracket: [, (, {, >
  const match = part.match(/^([^\[\(\{\>]+)(.*)$/)
  if (!match) return part // fallback
  
  let id = match[1].trim()
  let labelPart = match[2].trim()
  
  // Clean up ID: replace spaces/hyphens/special chars with underscores to make it a valid Mermaid ID
  const cleanId = id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '')
  
  if (!labelPart) {
    if (id !== cleanId) {
      if (definedNodeIds.has(cleanId) || printedNodeIds.has(cleanId)) {
        return cleanId
      }
      printedNodeIds.add(cleanId)
      return `${cleanId}["${id}"]`
    }
    return cleanId
  }
  
  printedNodeIds.add(cleanId)
  
  // Custom shape-matching logic check
  const pairs = [
    { start: '([', end: '])' },
    { start: '[(', end: ')]' },
    { start: '[[', end: ']]' },
    { start: '((', end: '))' },
    { start: '{{', end: '}}' },
    { start: '[/', end: '/]' },
    { start: '[\\', end: '\\]' },
    { start: '[/', end: '\\]' },
    { start: '[\\', end: '/]' },
    { start: '[', end: ']' },
    { start: '(', end: ')' },
    { start: '{', end: '}' },
    { start: '>', end: ']' }
  ]
  
  let matchedPair = null
  for (const pair of pairs) {
    if (labelPart.startsWith(pair.start) && labelPart.endsWith(pair.end)) {
      matchedPair = pair
      break
    }
  }
  
  if (matchedPair) {
    const bracketStart = matchedPair.start
    const bracketEnd = matchedPair.end
    let text = labelPart.slice(bracketStart.length, labelPart.length - bracketEnd.length).trim()
    
    // Clean quotes from the text
    text = text.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim()
    text = text.replace(/"/g, '') // remove double quotes from inside the text
    
    return `${cleanId}${bracketStart}"${text}"${bracketEnd}`
  }
  
  // Fallback: wrap in standard rectangular brackets with double quotes
  return `${cleanId}["${labelPart.replace(/"/g, '')}"]`
}

//  Fix common mermaid syntax issues automatically 
function fixMermaidCode(code) {
  if (!code) return code

  let fixed = code.trim()

  // 1. Sanitize unicode characters and tabs
  fixed = fixed.replace(/\t/g, ' ') // Replace tabs with spaces
  
  // Replace unicode arrow heads with standard equivalents
  fixed = fixed.replace(/[\u25B6\u25B7\u25BA]/g, '>') // ▶, ▷, ► -> >
  fixed = fixed.replace(/[\u25C0\u25C1\u25C4]/g, '<') // ◀, ◁, ◄ -> <
  
  // Replace all box drawing characters and horizontal dash-like characters with standard hyphens
  fixed = fixed.replace(/[\u2500-\u257F\u2013\u2014\u2212]/g, '-')

  // Fix trailing greater-than symbols after connection labels (e.g. -->|label|> -> -->|label|)
  fixed = fixed.replace(/((?:<|>)?[-=]+\.?->\s*\|[^|]+\|)\s*>/g, '$1')

  // Fix erDiagram relationship cardinality and lines (e.g. ||-o|{ -> ||--o{)
  fixed = fixed.replace(/(\w+)\s*([|o{}]{2,})\s*([-.]+)\s*([|o{}]{2,})\s*(\w+)/g, (match, ent1, card1, line, card2, ent2) => {
    let normalizedLine = line;
    if (line.includes('.')) normalizedLine = '..';
    else normalizedLine = '--';

    const normalizeLeftCard = (c) => {
      if (c === '||') return '||';
      if (c.includes('o') && c.includes('|')) return '|o';
      if (c.includes('o')) return '}o';
      if (c.includes('|')) return '}|';
      return '||';
    };

    const normalizeRightCard = (c) => {
      if (c === '||') return '||';
      if (c.includes('o') && c.includes('|')) return 'o|';
      if (c.includes('o')) return 'o{';
      if (c.includes('|')) return '|{';
      return '||';
    };

    return `${ent1} ${normalizeLeftCard(card1)}${normalizedLine}${normalizeRightCard(card2)} ${ent2}`;
  });

  // Fix missing colon in erDiagram relationship labels (e.g. Entity1 ||--o{ Entity2 "label" -> Entity1 ||--o{ Entity2 : "label")
  fixed = fixed.replace(/((\w+)\s+([|o{}]{2,}[-.]+[|o{}]{2,})\s+(\w+))\s+["']([^"']+)["']/g, '$1 : "$5"');

  // Fix single quotes in erDiagram labels (e.g. : 'label' -> : "label")
  fixed = fixed.replace(/:\s*'([^']+)'/g, ': "$1"');

  // Fix unquoted labels in erDiagram (including multi-word labels) (e.g. : places -> : "places")
  fixed = fixed.replace(/:\s*([^"\x27\s\n][^"\x27\n]*?)(?=\s*(?:%%|$))/mg, ': "$1"');

  // Remove backtick fences
  fixed = fixed.replace(/^```[a-z]*\n?/gm, '').replace(/^```\s*$/gm, '').trim()

  // Fix missing diagram headers (e.g. sequenceDiagram, erDiagram, stateDiagram-v2)
  const lower = fixed.toLowerCase()
  const hasHeader = lower.startsWith('flowchart') ||
                    lower.startsWith('graph') ||
                    lower.startsWith('sequencediagram') ||
                    lower.startsWith('erdiagram') ||
                    lower.startsWith('statediagram')

  if (!hasHeader) {
    if (fixed.includes('participant') || fixed.includes('->>')) {
      fixed = 'sequenceDiagram\n' + fixed
    } else if (fixed.includes('||--') || fixed.includes('}|--') || fixed.includes('o{')) {
      fixed = 'erDiagram\n' + fixed
    } else if (fixed.includes('[*]')) {
      fixed = 'stateDiagram-v2\n' + fixed
    } else {
      fixed = 'flowchart TD\n' + fixed
    }
  }

  const isFlowchartOrGraph = fixed.toLowerCase().startsWith('flowchart') || fixed.toLowerCase().startsWith('graph')

  if (isFlowchartOrGraph) {
    const lines = fixed.split('\n')
    const definedNodeIds = new Set()
    
    // First pass: find all node IDs that are defined with a label/shape
    lines.forEach(line => {
      const trimmed = line.trim()
      const lower = trimmed.toLowerCase()
      if (
        !trimmed || 
        trimmed.startsWith('%%') || 
        lower.startsWith('subgraph') || 
        lower.startsWith('flowchart') || 
        lower.startsWith('graph') ||
        lower.startsWith('style ') ||
        lower.startsWith('linkstyle ') ||
        lower.startsWith('classdef ') ||
        lower.startsWith('class ') ||
        lower.startsWith('click ') ||
        lower.startsWith('direction ')
      ) {
        return
      }
      
      const parts = trimmed.split(/(\s*(?:-+\.?-*>|==+>|-{2,}|-+\.-+)\s*(?:\|[^|]+\|\s*)?)/)
      parts.forEach((part, i) => {
        if (i % 2 === 0) { // Node part
          const match = part.trim().match(/^([^\[\(\{\>]+)(.+)$/)
          if (match) {
            const id = match[1].trim()
            const cleanId = id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '')
            definedNodeIds.add(cleanId)
          }
        }
      })
    })

    const printedNodeIds = new Set()
    const cleanedLines = lines.map(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('%%') || trimmed.toLowerCase().startsWith('flowchart') || trimmed.toLowerCase().startsWith('graph')) {
        return line
      }

      // Check for subgraph start
      if (trimmed.toLowerCase().startsWith('subgraph')) {
        const rest = trimmed.slice(8).trim()
        const match = rest.match(/^([^\[\(\{\"\n]+)(.*)$/)
        if (match) {
          let id = match[1].trim()
          let labelPart = match[2].trim()
          const cleanId = id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '')
          
          if (!labelPart) {
            return `  subgraph ${cleanId}["${id}"]`
          } else {
            let text = labelPart.replace(/^\["|\]$/g, '').replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim()
            return `  subgraph ${cleanId}["${text}"]`
          }
        }
        return line
      }

      if (trimmed.toLowerCase() === 'end') {
        return '  end'
      }

      // Check for config, styling, click, direction lines and handle them separately
      const lowerTrimmed = trimmed.toLowerCase()
      
      if (lowerTrimmed.startsWith('direction ')) {
        return '  ' + trimmed
      }
      
      if (lowerTrimmed.startsWith('style ')) {
        const rest = trimmed.slice(6).trim()
        const firstSpaceIndex = rest.indexOf(' ')
        if (firstSpaceIndex !== -1) {
          const idsPart = rest.slice(0, firstSpaceIndex)
          const stylePart = rest.slice(firstSpaceIndex)
          const cleanedIds = idsPart.split(',').map(id => {
            const trimmedId = id.trim()
            return trimmedId.replace(/[^a-zA-Z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '')
          }).join(',')
          return `  style ${cleanedIds}${stylePart}`
        }
        return '  ' + trimmed
      }

      if (lowerTrimmed.startsWith('linkstyle ')) {
        return '  ' + trimmed
      }

      if (lowerTrimmed.startsWith('classdef ')) {
        return '  ' + trimmed
      }

      if (lowerTrimmed.startsWith('class ')) {
        const rest = trimmed.slice(6).trim()
        const firstSpaceIndex = rest.indexOf(' ')
        if (firstSpaceIndex !== -1) {
          const idsPart = rest.slice(0, firstSpaceIndex)
          const classPart = rest.slice(firstSpaceIndex)
          const cleanedIds = idsPart.split(',').map(id => {
            const trimmedId = id.trim()
            return trimmedId.replace(/[^a-zA-Z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '')
          }).join(',')
          return `  class ${cleanedIds}${classPart}`
        }
        return '  ' + trimmed
      }

      if (lowerTrimmed.startsWith('click ')) {
        const rest = trimmed.slice(6).trim()
        const firstSpaceIndex = rest.indexOf(' ')
        if (firstSpaceIndex !== -1) {
          const id = rest.slice(0, firstSpaceIndex).trim()
          const restPart = rest.slice(firstSpaceIndex)
          const cleanId = id.replace(/[^a-zA-Z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '')
          return `  click ${cleanId}${restPart}`
        } else {
          const cleanId = rest.replace(/[^a-zA-Z0-9_]/g, '_').replace(/__+/g, '_').replace(/^_+|_+$/g, '')
          return `  click ${cleanId}`
        }
      }

      // Process connections and node definitions (arrow connectors must have at least 2 hyphens: -{2,})
      const parts = trimmed.split(/(\s*(?:-+\.?-*>|==+>|-{2,}|-+\.-+)\s*(?:\|[^|]+\|\s*)?)/)
      
      const cleanedParts = parts.map((part, i) => {
        if (i % 2 === 1) { // Arrow connector
          let arrow = part
          const labelMatch = arrow.match(/\|([^|]+)\|/)
          if (labelMatch) {
            let label = labelMatch[1].trim()
            label = label.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim()
            arrow = arrow.replace(/\|[^|]+\|/, `|"${label}"|`)
          }
          arrow = arrow.replace(/(==>|-->|-\.->|->)\s*\|([^|]+)\|\s*>/g, '$1|$2|')
          return arrow
        } else { // Node ID & shape definition
          return cleanNodePart(part, definedNodeIds, printedNodeIds)
        }
      })

      return '  ' + cleanedParts.join('')
    })
    fixed = cleanedLines.join('\n')
  }

  // Fallback cleanup for other diagram types/general rules
  fixed = fixed.replace(/\['([^']+)'\]/g, '["$1"]')
  fixed = fixed.replace(/\('([^']+)'\)/g, '("$1")')
  fixed = fixed.replace(/\{'([^']+)'\}/g, '{"$1"}')
  fixed = fixed.replace(/\|'([^']+)'\|/g, '|"$1"|')

  // Clean unclosed HTML brackets or generic parameters inside double quotes
  fixed = fixed.replace(/"([^"]+)"/g, (match, content) => {
    if (content.includes('<') || content.includes('>')) {
      return `"${content.replace(/</g, '[').replace(/>/g, ']')}"`
    }
    return match
  })

  // Ban check
  if (fixed.startsWith('classDiagram') || fixed.startsWith('block-beta')) {
    return null
  }

  return fixed
}

function detectType(code = '') {
  const t = code.trim().toLowerCase()
  if (t.startsWith('erdiagram'))       return 'erDiagram'
  if (t.startsWith('sequencediagram')) return 'sequenceDiagram'
  if (t.startsWith('statediagram'))    return 'stateDiagram'
  if (t.startsWith('graph'))           return 'graph'
  return 'flowchart'
}

// Lightweight syntax validator
function validateMermaidSyntax(code) {
  if (!code || code.trim().length < 30) {
    return { valid: false, error: 'Mermaid code is too short or empty.' }
  }
  
  const type = detectType(code)
  const lines = code.split('\n')
  
  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1
    const line = lines[idx].trim()
    
    if (!line || line.startsWith('%%') || line.toLowerCase().startsWith('flowchart') || line.toLowerCase().startsWith('graph') || line.toLowerCase().startsWith('sequencediagram') || line.toLowerCase().startsWith('erdiagram') || line.toLowerCase().startsWith('statediagram')) {
      continue
    }
    
    // Check unclosed double quotes
    const quoteCount = (line.match(/"/g) || []).length
    if (quoteCount % 2 !== 0) {
      return { valid: false, error: `Unclosed double quotes on line ${lineNum}: ${line}` }
    }
    
    // Flowchart specific validation
    if (type === 'flowchart' || type === 'graph') {
      // Check unclosed shapes or parentheses
      if (!line.includes('"')) {
        const openParen = (line.match(/\(/g) || []).length
        const closeParen = (line.match(/\)/g) || []).length
        if (openParen !== closeParen) {
          return { valid: false, error: `Unbalanced parentheses on line ${lineNum}: ${line}` }
        }
        
        const openBracket = (line.match(/\[/g) || []).length
        const closeBracket = (line.match(/\]/g) || []).length
        if (openBracket !== closeBracket) {
          return { valid: false, error: `Unbalanced square brackets on line ${lineNum}: ${line}` }
        }
        
        const openCurly = (line.match(/\{/g) || []).length
        const closeCurly = (line.match(/\}/g) || []).length
        if (openCurly !== closeCurly) {
          return { valid: false, error: `Unbalanced curly brackets on line ${lineNum}: ${line}` }
        }
      }
      
      // Check single quotes inside flowchart labels
      if (line.includes("'") && !line.includes('"')) {
        return { valid: false, error: `Single quotes are not supported inside flowchart labels on line ${lineNum}. Use double quotes instead: ${line}` }
      }
      
      // Check invalid connection syntax
      if (line.includes('-->') || line.includes('==>') || line.includes('->') || line.includes('---')) {
        if (line.startsWith('-->') || line.endsWith('-->') || line.startsWith('==>') || line.endsWith('==>')) {
          return { valid: false, error: `Connector starts or ends line on line ${lineNum}: ${line}` }
        }
      }
    }
    
    // ER Diagram specific validation
    if (type === 'erDiagram') {
      if (line.includes('||--') || line.includes('}|--') || line.includes('o{') || line.includes('}|') || line.includes('o|')) {
        if (!line.includes(':')) {
          return { valid: false, error: `Missing colon (':') in relationship definition on line ${lineNum}: ${line}` }
        }
      }
    }
  }
  
  return { valid: true, error: null }
}

// ─── Validate result ──────────────────────────────────────────────────────────
function validateResult(parsed) {
  // Custom SVG schema types — bypass Mermaid pipeline entirely
  const CUSTOM_SCHEMA_TYPES = ['uml-diagram', 'dfd-flow', 'circuit-schematic']
  const isCustomSchema = CUSTOM_SCHEMA_TYPES.includes(parsed.diagram_type) ||
    (parsed.schema && CUSTOM_SCHEMA_TYPES.includes(parsed.schema?.type))

  if (isCustomSchema) {
    if (!parsed.schema) {
      throw new Error('Custom diagram schema object is missing')
    }
    // circuit-schematic: must have components array
    if (parsed.diagram_type === 'circuit-schematic' || parsed.schema?.type === 'circuit-schematic') {
      if (!Array.isArray(parsed.schema.components)) {
        parsed.schema.components = []
      }
      if (!Array.isArray(parsed.schema.wires))     parsed.schema.wires = []
      if (!Array.isArray(parsed.schema.junctions))  parsed.schema.junctions = []
      if (!Array.isArray(parsed.schema.labels))     parsed.schema.labels = []
      parsed.schema.type = 'circuit-schematic'
      parsed.diagram_type = 'circuit-schematic'
      if (parsed.schema.components.length === 0) {
        throw new Error('Circuit schema has no components — cannot render empty circuit')
      }
      // Run Schematic Linter checks
      const lint = validateSchematicTopology(parsed.schema)
      if (!lint.valid) {
        throw new Error(`SCHEMATIC_LINT_ERROR: ${lint.errors.join('; ')}`)
      }
    }
    // uml-diagram / dfd-flow: must have nodes array
    if ((parsed.diagram_type === 'uml-diagram' || parsed.diagram_type === 'dfd-flow') &&
        !Array.isArray(parsed.schema.nodes)) {
      throw new Error('Custom diagram schema is missing nodes array')
    }
    parsed.mermaid_code = '' // clear mermaid code for all custom schemas
  } else {
    if (!parsed.mermaid_code || parsed.mermaid_code.trim().length < 30) {
      throw new Error('Generated diagram code is too short or empty')
    }

    const fixed = fixMermaidCode(parsed.mermaid_code)
    if (!fixed) throw new Error('INVALID_DIAGRAM_TYPE')

    parsed.mermaid_code = fixed

    // Validate syntax
    const val = validateMermaidSyntax(parsed.mermaid_code)
    if (!val.valid) {
      throw new Error(`SYNTAX_ERROR: ${val.error}`)
    }
  }

  if (!parsed.theory) parsed.theory = 'Theory not available.'
  if (!Array.isArray(parsed.key_points)) parsed.key_points = []
  if (!Array.isArray(parsed.use_cases)) parsed.use_cases = []

  return parsed
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json()
    const { prompt, useProModel = false, forceAI = false } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
      return Response.json({ error: 'Please enter a valid subject or topic.' }, { status: 400 })
    }
    if (prompt.trim().length > 300) {
      return Response.json({ error: 'Prompt too long. Keep it under 300 characters.' }, { status: 400 })
    }

    let stubMetadata = null

    // ── CLASSIFIER & INTERCEPTOR ───────────────────────────────────────────
    let classificationResult = null
    if (!forceAI) {
      try {
        const classifierPrompt = `You are a technical diagram classifier and parameter extractor for engineering students.
Analyze this user query: "${prompt.trim()}"

Classify it into one of these three categories:
1. "theory_request": A request for a standard theory concept, architecture, SDLC, flowchart, or diagram WITHOUT specific numerical parameter calculations (e.g., "draw a colpitts oscillator", "8085 architecture block diagram", "explain waterfall model").
2. "numerical_problem": A circuit analysis/design question containing specific custom component values or source parameters that fits one of our templates.
3. "unsupported_custom_circuit": A request for a custom, arbitrary, or complex circuit layout (e.g. "three-phase motor controller", "rectifier with 6 diodes", "circuit with 5 relays") that does not match the basic topology of our templates.

Our verified templates are:
   - "dc-circuit" (for simple DC circuit with voltage source, switch, ammeter, resistor/lamp/load, voltmeter)
   - "ac-circuit" (for AC series circuits containing any combination of Resistor, Inductor, Capacitor: R, L, C, RC, RL, LC, RLC)
   - "zener-voltage-regulator" (for Zener diode regulator circuit)
   - "opamp-inverting" (for inverting operational amplifier)
   - "opamp-noninverting" (for non-inverting operational amplifier)
   - "star-delta-conversion" (for star-to-delta or delta-to-star conversion)
   - "nortons-theorem-bee" (for Norton's theorem circuit problems)
   - "source-transformation-circuit" (for source transformation equivalence)
   - "series-rl-circuit" (for series RL circuit questions)
   - "series-rlc-resonance" (for RLC resonance questions)
   - "superposition-theorem-circuit" (for Superposition theorem questions)
   - "thevenins-theorem-circuit" (for Thevenin's theorem equivalent circuit questions)
   - "bjt-switch-circuit" (for BJT switch questions)
   - "classb-pushpull-amplifier" (for class B push-pull amplifiers)
   - "hartley-oscillator" (for Hartley oscillators)
   - "colpitts-oscillator" (for Colpitts oscillators)
   - "wien-bridge-oscillator" (for Wien bridge oscillators)
   - "rc-phase-shift-oscillator" (for RC phase shift oscillators)
   - "astable-multivibrator" (for astable multivibrators)
   - "opamp-integrator" (for op-amp integrator circuits)
   - "opamp-differentiator" (for op-amp differentiator circuits)
   - "bjt-differential-amplifier" (for BJT differential amplifiers)
   - "single-phase-transformer" (for single-phase transformers)
   - "star-connection" (for Star connection Y and T representations)
   - "delta-connection" (for Delta connection Triangle and Pi representations)

If it is "numerical_problem", you MUST match it to one of these templates and extract the numerical parameters:
- For "dc-circuit": V, R
- For "ac-circuit": V, f, R, L, C
- For "zener-voltage-regulator": Vin, Rs, Vz, Rl
- For "opamp-inverting": Vin, R1, Rf
- For "opamp-noninverting": Vin, R1, Rf
- For "star-delta-conversion": Star resistances R1, R2, R3 (or RA, RB, RC) OR Delta resistances RAB, RBC, RCA
- For "nortons-theorem-bee": V1, R1, V2, R2, R3, R4, R5, RL
- For "source-transformation-circuit": V, rv, I, ri
- For "series-rl-circuit": V, f, R, L
- For "series-rlc-resonance": V, R, L, C
- For "superposition-theorem-circuit": V1, R1, R2, R3, V2
- For "thevenins-theorem-circuit": Vth, Rth, RL

Return ONLY a valid JSON object of this format:
{
  "classification": "theory_request" | "numerical_problem" | "unsupported_custom_circuit",
  "matched_template": "dc-circuit" | "ac-circuit" | "zener-voltage-regulator" | "opamp-inverting" | "opamp-noninverting" | "star-delta-conversion" | "nortons-theorem-bee" | "source-transformation-circuit" | "series-rl-circuit" | "series-rlc-resonance" | "superposition-theorem-circuit" | "thevenins-theorem-circuit" | "bjt-switch-circuit" | "classb-pushpull-amplifier" | "hartley-oscillator" | "colpitts-oscillator" | "wien-bridge-oscillator" | "rc-phase-shift-oscillator" | "astable-multivibrator" | "opamp-integrator" | "opamp-differentiator" | "bjt-differential-amplifier" | "single-phase-transformer" | "star-connection" | "delta-connection" | null,
  "parameters": { ... },
  "unsupported_reason": "Explanation of why the circuit is unsupported, if applicable"
}

Ensure you normalize numerical values (e.g. 100uF -> 0.0001, 10k -> 10000).`;

        const classifierModel = (useProModel || /circuit|oscillator|op.?amp|zener/i.test(prompt))
          ? 'llama-3.3-70b-versatile'
          : 'llama-3.1-8b-instant';

        const classifierResponse = await groq.chat.completions.create({
          model: classifierModel,
          messages: [{ role: 'user', content: classifierPrompt }],
          max_tokens: 500,
          temperature: 0.0,
          response_format: { type: 'json_object' }
        });

        classificationResult = JSON.parse(classifierResponse.choices[0].message.content);
        console.log('[Classifier] Result:', classificationResult);
      } catch (classErr) {
        console.error('[Classifier] Error running classifier:', classErr.message);
      }
    }

    if (classificationResult && classificationResult.classification === 'unsupported_custom_circuit') {
      return Response.json({
        error: `Unsupported Custom Circuit: ${classificationResult.unsupported_reason || 'This circuit layout differs fundamentally from our base templates and cannot be constructed on a grid.'}`
      }, { status: 400 })
    }

    if (classificationResult && classificationResult.matched_template) {
      const templateName = classificationResult.matched_template
      const templateObj = ALL_DIAGRAMS.find(d => d.id === templateName)

      if (templateObj) {
        let baseTemplate = JSON.parse(JSON.stringify(templateObj))

        const SOLVERS = {
          'dc-circuit': solveDcCircuit,
          'ac-circuit': solveAcRlcCircuit,
          'zener-voltage-regulator': solveZenerRegulator,
          'opamp-inverting': solveOpampInverting,
          'opamp-noninverting': solveOpampNoninverting,
          'star-delta-conversion': solveStarDelta,
          'nortons-theorem-bee': solveNortonsTheorem,
          'source-transformation-circuit': solveSourceTransformation,
          'series-rl-circuit': solveSeriesRlCircuit,
          'series-rlc-resonance': solveSeriesRlcResonance,
          'superposition-theorem-circuit': solveSuperposition,
          'thevenins-theorem-circuit': solveThevenin
        }

        const solverFn = SOLVERS[templateName]

        if (classificationResult.classification === 'numerical_problem' && solverFn) {
          const solverResult = solverFn(classificationResult.parameters)
          if (solverResult && solverResult.success) {
            // 1. Handle component bypassing
            if (solverResult.omittedComponents) {
              for (const [compId, isOmitted] of Object.entries(solverResult.omittedComponents)) {
                if (isOmitted) {
                  console.log(`[Bypass] Bypassing omitted component ${compId}`);
                  removeComponentAndMergeWires(baseTemplate, compId)
                }
              }
            }

            // 2. Overlay parameters on base template components
            if (solverResult.mappings) {
              for (const mapping of solverResult.mappings) {
                const comp = baseTemplate.components.find(c => c.id === mapping.id)
                if (comp) {
                  comp.value = mapping.value;
                  if (comp.label) {
                    if (comp.label.includes('Ω') || comp.label.includes('V') || comp.label.includes('A') || comp.label.includes('F') || comp.label.includes('H') || comp.label.includes('Hz')) {
                      comp.label = mapping.value;
                    } else {
                      comp.label = `${comp.label} = ${mapping.value}`;
                    }
                  } else {
                    comp.label = mapping.value;
                  }
                }
              }
            }

            // 3. Special handling for zener-voltage-regulator labels overlay
            if (templateName === 'zener-voltage-regulator') {
              const rsComp = baseTemplate.components.find(c => c.id === 'RS')
              if (rsComp) {
                const val = solverResult.mappings.find(m => m.id === 'Rs')?.value
                if (val) rsComp.label = `Rs = ${val}`
              }
              const rlComp = baseTemplate.components.find(c => c.id === 'RL')
              if (rlComp) {
                const val = solverResult.mappings.find(m => m.id === 'Rl')?.value
                if (val) rlComp.label = `RL = ${val}`
              }
              const zdComp = baseTemplate.components.find(c => c.id === 'ZD')
              if (zdComp) {
                const val = solverResult.mappings.find(m => m.id === 'Dz')?.value
                if (val) zdComp.label = `Vz = ${val}`
              }
              const vinLabel = baseTemplate.labels.find(l => l.text.includes('Vin') || l.text.includes('Unregulated'))
              if (vinLabel) {
                const val = solverResult.mappings.find(m => m.id === 'Vin')?.value
                if (val) vinLabel.text = `Vin = ${val}`
              }
              const voutLabel = baseTemplate.labels.find(l => l.text.includes('Vz') || l.text.includes('Regulated'))
              if (voutLabel) {
                const val = solverResult.mappings.find(m => m.id === 'Dz')?.value
                if (val) voutLabel.text = `Vout = ${val}`
              }
            }

            let theoryText = ''
            let examTip = ''
            let keyPoints = []
            let useCases = []

            try {
              const explanationPrompt = `You are a textbook writer. Write a detailed, exam-ready textbook-style explanation for this circuit problem:
Query: "${prompt.trim()}"
Solved parameters:
${JSON.stringify(solverResult.results, null, 2)}
Given parameters:
${JSON.stringify(solverResult.given, null, 2)}
Mathematical steps used by the solver:
${JSON.stringify(solverResult.calculations, null, 2)}

Ensure your explanation uses the EXACT same formulas, values, and calculations shown in the mathematical steps above. DO NOT invent other formulas or perform any other arithmetic that contradicts the solver's steps.

Provide your response in JSON format matching these fields:
{
  "theory": "A detailed 180+ words engineering explanation of the circuit operation, explaining the given parameters, how the calculations are performed, and what the results mean physically.",
  "exam_tips": "Practical tips for scoring full marks when drawing or solving this circuit in a university exam.",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "use_cases": ["case 1", "case 2", "case 3"]
}`;

              const explanationResponse = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: explanationPrompt }],
                max_tokens: 1000,
                temperature: 0.1,
                response_format: { type: 'json_object' }
              });

              const expResult = JSON.parse(explanationResponse.choices[0].message.content)
              theoryText = expResult.theory
              examTip = expResult.exam_tips
              keyPoints = expResult.key_points || []
              useCases = expResult.use_cases || []
            } catch (llmErr) {
              console.error('[Solver LLM] Error fetching explanations:', llmErr.message)
              theoryText = baseTemplate.theory || ''
              examTip = baseTemplate.examTip || ''
              keyPoints = baseTemplate.keyPoints || []
              useCases = baseTemplate.useCases || []
            }

            let theoryTabContent = `### Given Data:\n`
            for (const [key, val] of Object.entries(solverResult.given)) {
              theoryTabContent += `* **${key}**: ${val}\n`
            }

            theoryTabContent += `\n### Step-by-Step Mathematical Solution:\n`
            for (const calc of solverResult.calculations) {
              theoryTabContent += `#### ${calc.step}\n`
              theoryTabContent += `* **Formula**: $${calc.formula}$\n`
              theoryTabContent += `* **Substitution**: $${calc.substitution}$\n`
              theoryTabContent += `* **Result**: **${calc.result}**\n\n`
            }

            theoryTabContent += `### textbook Theory Explanation:\n${theoryText}`

            return Response.json({
              success: true,
              data: {
                schema: baseTemplate,
                title: `${baseTemplate.title} (Solved)`,
                theory: theoryTabContent,
                key_points: keyPoints,
                use_cases: useCases,
                examTip: examTip,
                complexity: baseTemplate.complexity || 'Intermediate',
                subject_category: baseTemplate.category || 'Electronics',
                diagram_type: baseTemplate.type || 'circuit-schematic',
                source: 'library',
                isParameterized: true
              },
              meta: {
                model: 'deterministic-solver',
                usedFallback: false,
                fromLibrary: true,
                isStub: false,
                timestamp: new Date().toISOString()
              }
            })
          }
        }

        // If it is a theory request or the solver failed/doesn't exist, serve the template directly
        console.log(`[Library] Servicing matched template: ${baseTemplate.id} for prompt: "${prompt.trim()}"`)
        return Response.json({
          success: true,
          data: {
            schema: baseTemplate,
            title: baseTemplate.title,
            theory: baseTemplate.theory || '',
            key_points: baseTemplate.keyPoints || baseTemplate.key_points || [],
            use_cases: baseTemplate.useCases || baseTemplate.use_cases || [],
            examTip: baseTemplate.examTip || '',
            complexity: baseTemplate.complexity || 'Intermediate',
            subject_category: baseTemplate.category || 'Other',
            diagram_type: baseTemplate.type,
            source: 'library',
            mermaid_code: baseTemplate.mermaid_code || '',
          },
          meta: {
            model: 'static-library',
            usedFallback: false,
            fromLibrary: true,
            timestamp: new Date().toISOString(),
          },
        })
      }
    }


    // ── TIER 1: Static Library Lookup (free, instant, 100% accurate) ──────────
    if (!forceAI) {
      try {
        const libraryMatch = matchDiagram(prompt.trim())
        if (libraryMatch) {
          if (libraryMatch.isStub) {
            console.log(`[Library] Matched stub: ${libraryMatch.id}. Storing metadata for AI fallback.`)
            stubMetadata = libraryMatch
          } else {
            console.log(`[Library] Matched: ${libraryMatch.id} for prompt: "${prompt.trim()}"`)
            return Response.json({
              success: true,
              data: {
                schema: libraryMatch,
                title: libraryMatch.title,
                theory: libraryMatch.theory || '',
                key_points: libraryMatch.keyPoints || libraryMatch.key_points || [],
                use_cases: libraryMatch.useCases || libraryMatch.use_cases || [],
                examTip: libraryMatch.examTip || '',
                complexity: libraryMatch.complexity || 'Intermediate',
                subject_category: libraryMatch.category || 'Other',
                diagram_type: libraryMatch.type,
                source: 'library',
                mermaid_code: libraryMatch.mermaid_code || '',
              },
              meta: {
                model: 'static-library',
                usedFallback: false,
                fromLibrary: true,
                timestamp: new Date().toISOString(),
              },
            })
          }
        }
      } catch (libErr) {
        console.warn('[Library] Lookup error, falling through to AI:', libErr.message)
      }
    }

    // ── TIER 2: AI Generation (Groq & OpenRouter rotation pipelines) ───────────
    const isComplexTopic = /block|architect|dbms|database|system|circuit|rectifier|op.?amp|thevenin|norton|amplifier|filter|oscillator|mcc|spcc|control|network|osi|gsm|compiler|processor|memory|cache|pipeline|flip.?flop|latch|adder/i.test(prompt)
    let primaryModel = (useProModel || isComplexTopic)
      ? (process.env.GROQ_MODEL_PRO || 'llama-3.3-70b-versatile')
      : (process.env.GROQ_MODEL || 'llama-3.1-8b-instant')

    // Define Groq model rotation order
    const groqModelRotation = [
      primaryModel,
      primaryModel === 'llama-3.3-70b-versatile' ? 'llama-3.1-8b-instant' : 'llama-3.3-70b-versatile',
      'mixtral-8x7b-32768'
    ].filter((m, i, arr) => arr.indexOf(m) === i) // unique list

    // Define OpenRouter model rotation order
    const openRouterModelRotation = [
      'meta-llama/llama-3.3-70b-instruct:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      'google/gemma-2-9b-it:free'
    ]

    let rawText, usedFallback = false, retried = false, activeModelUsed = primaryModel

    const tryGroq = async (m, customPrompt = null) => {
      const promptToUse = customPrompt || `Generate a technically accurate, complete, student-friendly diagram for: ${prompt.trim()}`
      const completion = await groq.chat.completions.create({
        model: m,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptToUse },
        ],
        max_tokens: 2000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      })
      return completion.choices[0].message.content
    }

    // Attempt Groq models in rotation
    let groqSuccess = false
    let lastGroqError = null
    for (const m of groqModelRotation) {
      try {
        console.log(`[API] Attempting Groq with model: ${m}`)
        rawText = await tryGroq(m)
        activeModelUsed = m
        groqSuccess = true
        break
      } catch (err) {
        lastGroqError = err
        console.warn(`[API] Groq model ${m} failed: ${err.message}`)
      }
    }

    // If Groq fails entirely, attempt OpenRouter models in rotation
    if (!groqSuccess) {
      console.warn('[API] All Groq models failed. Falling back to OpenRouter rotation. Last Groq error:', lastGroqError?.message)
      let openRouterSuccess = false
      let lastOpenRouterError = null
      for (const m of openRouterModelRotation) {
        try {
          console.log(`[API] Attempting OpenRouter with model: ${m}`)
          rawText = await callOpenRouter(prompt, m)
          activeModelUsed = m
          usedFallback = true
          openRouterSuccess = true
          break
        } catch (err) {
          lastOpenRouterError = err
          console.warn(`[API] OpenRouter model ${m} failed: ${err.message}`)
        }
      }
      if (!openRouterSuccess) {
        console.error('[API] All AI providers failed. Last OpenRouter error:', lastOpenRouterError?.message)
        return Response.json({ 
          error: 'AI providers are currently unavailable or rate-limited. Please try again in a few minutes.' 
        }, { status: 503 })
      }
    }

    let parsed
    try {
      parsed = parseResponse(rawText)
      const validated = validateResult(parsed)

      if (stubMetadata) {
        // Merge verified catalog metadata with AI layout
        return Response.json({
          success: true,
          data: {
            ...validated,
            title: stubMetadata.title,
            theory: stubMetadata.theory || validated.theory,
            key_points: stubMetadata.key_points || stubMetadata.keyPoints || validated.key_points,
            use_cases: stubMetadata.use_cases || stubMetadata.useCases || validated.use_cases,
            examTip: stubMetadata.examTip || '',
            complexity: stubMetadata.complexity || validated.complexity,
            subject_category: stubMetadata.category || validated.subject_category,
            source: 'library-stub',
          },
          meta: { model: activeModelUsed, usedFallback, retried, fromLibrary: true, isStub: true, timestamp: new Date().toISOString() },
        })
      }

      return Response.json({
        success: true,
        data: { ...validated, source: 'ai', useFallback: false },
        meta: { model: activeModelUsed, usedFallback, retried, fromLibrary: false, timestamp: new Date().toISOString() },
      })
    } catch (validateErr) {
      const isSyntaxOrInvalid = validateErr.message.startsWith('SYNTAX_ERROR') || 
                                validateErr.message === 'INVALID_DIAGRAM_TYPE' || 
                                validateErr.message.includes('JSON') ||
                                validateErr.message.startsWith('SCHEMATIC_LINT_ERROR')
      
      if (isSyntaxOrInvalid && !retried) {
        retried = true
        const errDetails = validateErr.message
        console.warn(`Initial generation failed (${errDetails}). Retrying with correction prompt...`)
        
        let correctionPrompt
        if (errDetails.includes('JSON')) {
          correctionPrompt = `You previously generated a response for "${prompt.trim()}" but it was not valid JSON. Please generate a valid JSON object matching the requested schema exactly. Include the required fallback_json structure.`
        } else if (errDetails.startsWith('SCHEMATIC_LINT_ERROR')) {
          const cleanErrors = errDetails.slice('SCHEMATIC_LINT_ERROR: '.length);
          correctionPrompt = `You previously generated a circuit schematic for "${prompt.trim()}" but it failed our topological linter checks with the following errors:
${cleanErrors.split('; ').map(e => `* ${e}`).join('\n')}

Please regenerate the circuit diagram JSON. Ensure you fix these errors:
- If a terminal is unconnected/floating, connect it to a valid terminal (e.g. Q1.base or GND.top) in the netlist.
- If there is a Vcc-to-GND short circuit, insert a resistor/component between them instead of a direct wire.
- Keep all other fields (title, theory, key_points, use_cases, fallback_json) complete and accurate. Return ONLY valid JSON.`
        } else {
          correctionPrompt = `You previously generated a diagram for "${prompt.trim()}" but it failed validation with error: "${errDetails}".
Here is the invalid Mermaid code you generated:
\`\`\`
${parsed ? parsed.mermaid_code : 'unknown'}
\`\`\`
Please regenerate the JSON, correcting the specific syntax error. Ensure the Mermaid code compiles perfectly. Keep all other fields (title, theory, key_points, use_cases, fallback_json) complete and accurate.`
        }

        try {
          console.log(`[API] Retrying correction with model: ${activeModelUsed}`)
          if (usedFallback) {
            rawText = await callOpenRouter(prompt, activeModelUsed, correctionPrompt)
          } else {
            rawText = await tryGroq(activeModelUsed, correctionPrompt)
          }
          parsed = parseResponse(rawText)
          
          let validated;
          try {
            validated = validateResult(parsed)
          } catch (retryValErr) {
            console.warn('[API] Retry validation failed:', retryValErr.message)
            if (retryValErr.message.startsWith('SCHEMATIC_LINT_ERROR:')) {
              const cleanErrors = retryValErr.message.slice('SCHEMATIC_LINT_ERROR: '.length).split('; ')
              return Response.json({
                success: true,
                data: {
                  verificationFailed: true,
                  source: 'failed',
                  lintErrors: cleanErrors,
                  title: parsed?.title || 'Diagram Verification Failed',
                  theory: 'Verification Failed: This diagram could not be topologically validated to textbook standards. Do not study from this diagram.',
                  key_points: parsed?.key_points || [],
                  use_cases: parsed?.use_cases || [],
                  complexity: parsed?.complexity || 'Intermediate',
                  subject_category: parsed?.subject_category || 'Electronics'
                },
                meta: { model: activeModelUsed, usedFallback, retried: true, fromLibrary: false, timestamp: new Date().toISOString() }
              })
            }
            throw retryValErr;
          }

          if (stubMetadata) {
            return Response.json({
              success: true,
              data: {
                ...validated,
                title: stubMetadata.title,
                theory: stubMetadata.theory || validated.theory,
                key_points: stubMetadata.key_points || stubMetadata.keyPoints || validated.key_points,
                use_cases: stubMetadata.use_cases || stubMetadata.useCases || validated.use_cases,
                examTip: stubMetadata.examTip || '',
                complexity: stubMetadata.complexity || validated.complexity,
                subject_category: stubMetadata.category || validated.subject_category,
                source: 'library-stub',
              },
              meta: { model: activeModelUsed, usedFallback, retried: true, fromLibrary: true, isStub: true, timestamp: new Date().toISOString() },
            })
          }

          return Response.json({
            success: true,
            data: { ...validated, source: 'ai', useFallback: false },
            meta: { model: activeModelUsed, usedFallback, retried: true, fromLibrary: false, timestamp: new Date().toISOString() },
          })
        } catch (retryErr) {
          console.error('Retry failed:', retryErr.message)
          if (parsed && parsed.fallback_json) {
            console.warn('Retry failed to generate valid Mermaid syntax. Switching to fallback HTML/CSS renderer.')
            
            if (stubMetadata) {
              return Response.json({
                success: true,
                data: {
                  ...parsed,
                  title: stubMetadata.title,
                  theory: stubMetadata.theory || parsed.theory,
                  key_points: stubMetadata.key_points || stubMetadata.keyPoints || parsed.key_points,
                  use_cases: stubMetadata.use_cases || stubMetadata.useCases || parsed.use_cases,
                  examTip: stubMetadata.examTip || '',
                  complexity: parsed.complexity,
                  subject_category: stubMetadata.category || parsed.subject_category,
                  source: 'library-stub',
                  useFallback: true,
                  mermaid_code: parsed.mermaid_code || ''
                },
                meta: { model: activeModelUsed, usedFallback, retried: true, fromLibrary: true, isStub: true, timestamp: new Date().toISOString(), fallbackActive: true },
              })
            }

            return Response.json({
              success: true,
              data: {
                ...parsed,
                source: 'ai',
                useFallback: true,
                mermaid_code: parsed.mermaid_code || ''
              },
              meta: { model: activeModelUsed, usedFallback, retried: true, fromLibrary: false, timestamp: new Date().toISOString(), fallbackActive: true },
            })
          }
          throw retryErr
        }
      }
      throw validateErr
    }

  } catch (err) {
    console.error('Generate API error:', err)
    return Response.json({
      error: err.message.startsWith('SYNTAX_ERROR') || err.message === 'INVALID_DIAGRAM_TYPE'
        ? 'Could not generate a valid diagram. Please try rephrasing your prompt.'
        : (err.message || 'Something went wrong. Please try again.')
    }, { status: 500 })
  }
}