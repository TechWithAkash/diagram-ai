import Groq from 'groq-sdk'
import { matchDiagram } from '@/lib/diagramLibrary'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a highly accurate technical education expert and diagram specialist. Your diagrams are used by final-year engineering students to study for exams and understand real systems.

YOUR #1 RESPONSIBILITY IS ACCURACY.
Every component, every connection, every label must be technically correct and complete. A student must be able to read your diagram and fully understand the real system — as it exists in textbooks, academic reference manuals, and Mumbai University syllabus guidelines.

Given a subject or topic, return ONLY a valid JSON object. No markdown, no backticks, no explanation outside JSON.

════════════════════════════════════════════
ACCURACY REQUIREMENTS — NON-NEGOTIABLE CHECKLISTS:
════════════════════════════════════════════

For every system architecture, you MUST include the standard textbook components and correct relationships:

1. MICROPROCESSORS:
   - Intel 8085: Must include Accumulator, Temp Register, 8-bit ALU, Flag Register, Instruction Register, Instruction Decoder, Timing & Control, Register Array (W, Z, B, C, D, E, H, L, SP, PC, Incrementer/Decrementer Latch), Address Buffer, Data/Address Buffer, and bottom buses (A8-A15, AD0-AD7, Control Bus).
   - Intel 8086: Must divide into BIU (Bus Interface Unit containing: Segment Registers CS/DS/SS/ES, IP, 16-bit Adder, 6-byte Instruction Queue) and EU (Execution Unit containing: GP Registers AX/BX/CX/DX, SP/BP/SI/DI, 16-bit ALU, Flags, Temporary Registers).
   - 8255 PPI: Must include Data Bus Buffer, Read/Write Control Logic, Group A Control, Group B Control, Port A (8-bit), Port B (8-bit), Port C Upper (4-bit), and Port C Lower (4-bit).
   - 8259 PIC: Must include IRR (Interrupt Request Register), ISR (In-Service Register), IMR (Interrupt Mask Register), Priority Resolver, Cascade Buffer/Comparator, Read/Write Logic, Control Logic, and Data Bus Buffer.
   - 8257 DMA: Must include Data Bus Buffer, Read/Write Logic, Control Logic, Priority Resolver, Mode Set & Status Register, and four DMA channels (0-3) each with starting Address Register and Terminal Count Register.

2. SOFTWARE ENGINEERING / SDLC:
   - Waterfall Model: Must contain 6 linear phases in order: Requirements Analysis → System Design → Implementation (Coding) → Testing & Integration → Deployment → Maintenance. No backward loops.
   - Spiral Model: Must divide into 4 quadrants clockwise: 1. Determine Objectives & Constraints, 2. Identify & Resolve Risks (Prototyping), 3. Develop & Test, 4. Plan Next Iterations.
   - Prototype Model: Must establish the iterative loop: Requirements Gathering → Quick Design → Build Prototype → Customer Evaluation → Refine Prototype (loops back to Quick Design) → Code & Implement (exit on approval) → Final Product & Maintenance.
   - V-Model: Must match left-side Verification (Requirements, HLD, LLD, Code) and right-side Validation (Unit test, Integration test, System test, UAT) with horizontal validation mapping lines.
   - Agile Scrum: Product Vision → Product Backlog → Sprint Planning → Sprint Backlog → Sprint Execution (with Daily Standup) → Sprint Review & Demo → Sprint Retrospective → Potentially Shippable Increment.

3. DATABASES / DBMS:
   - DBMS Architecture: Must include Users/Interfaces, Query Processor (DDL Interpreter, DML Compiler, Query Optimizer, Evaluation Engine), Storage Manager (Auth & Integrity, Transaction Manager, File Manager, Buffer Manager), and Disk Storage (Data Files, Data Dictionary, Indices).
   - Three-Schema Architecture: External Level (User Views) → Conceptual Level (Logical Schema) → Internal Level (Physical Schema) → Physical Database.

4. COMPUTER NETWORKS:
   - OSI Model: Must contain 7 layers (Physical, Data Link, Network, Transport, Session, Presentation, Application) with associated protocols and physical devices/PDUs.
   - TCP/IP Model: Must contain 4 or 5 layers (Application, Transport, Network/Internet, Link/Network Interface) and map protocols (HTTP/FTP, TCP/UDP, IP/ICMP, Ethernet).
   - GSM Architecture: Mobile Station (ME, SIM) → BSS (BTS, BSC) → NSS (MSC, HLR, VLR, AuC, EIR, GMSC) → External Networks (PSTN/ISDN).

5. OPERATING SYSTEMS:
   - Process State Transition: 5 or 7 states (New, Ready, Running, Waiting/Blocked, Terminated, Suspend Ready, Suspend Blocked) with transition events (admitted, scheduler dispatch, interrupt, I/O wait, I/O completion, suspend, resume).
   - Memory Hierarchy: Stack/Registers (Fastest, Smallest) → Cache (L1, L2, L3) → Main Memory (RAM) → Secondary Storage (SSD/HDD) → Tertiary Storage (Magnetic tape/Optical - Slowest, Largest).

6. COMPILERS:
   - Compiler Phases: Front End (Lexical Analyzer/Lexer → Syntax Analyzer/Parser → Semantic Analyzer) and Back End (Intermediate Code Generator → Code Optimizer → Target Code Generator) with Symbol Table and Error Handler linked to all.

════════════════════════════════════════
DIAGRAM TYPE SELECTION (choose ONE):
════════════════════════════════════════
- uml-diagram    → UML Class, Use Case, or Sequence diagrams. Must return the custom 'schema' object in JSON.
- dfd-flow       → Data Flow Diagrams (Level 0, 1, 2 DFDs). Must return the custom 'schema' object in JSON.
- flowchart TD  → architecture, systems, block diagrams, workflows, algorithms, MCC, SPCC, DBMS, OS, control systems, compilers
- flowchart LR  → pipelines, left-to-right data flows, horizontal architectures
- graph TD      → hierarchical trees, classification diagrams
- graph LR      → network layers (OSI, GSM subsystems), horizontal hierarchy
- erDiagram     → ONLY for SQL database schemas with tables and foreign keys
- sequenceDiagram → ONLY for step-by-step protocols: TCP handshake, HTTP, JWT, API flows
- stateDiagram-v2 → ONLY for state machines and finite automata with named states

⛔ BANNED — NEVER USE THESE:
- classDiagram (causes render errors, banned entirely)
- block-beta (not supported in this renderer)
- Single quotes inside ANY label (causes literal quote characters to appear)
- Truncated subgraph names

════════════════════════════════════════
RETURN THIS EXACT JSON:
════════════════════════════════════════
{
  "title": "Descriptive title max 5 words",
  "diagram_type": "uml-diagram|dfd-flow|flowchart|erDiagram|sequenceDiagram|stateDiagram|graph",
  "schema": {
    "type": "uml-diagram|dfd-flow",
    "nodes": [
      // For uml-diagram class: { "id": "customer_c", "type": "class", "label": "Customer", "x": 100, "y": 120, "width": 140, "height": 90, "attributes": ["+ id: int", "+ name: string"], "operations": ["+ register(): bool"], "color": "#EFF6FF", "borderColor": "#2563EB", "textColor": "#1E3A5F" }
      // For uml-diagram actor: { "id": "student_a", "type": "actor", "label": "Student", "x": 80, "y": 180 } (centered at x,y)
      // For uml-diagram use-case: { "id": "borrow_u", "type": "use-case", "label": "Borrow Book", "x": 300, "y": 180, "width": 110, "height": 60, "color": "#F0FDF4", "borderColor": "#22C55E", "textColor": "#14532D" }
      // For dfd-flow process: { "id": "p1", "type": "process", "shape": "circle|rectangle", "processId": "1.0", "label": "Issue Book", "x": 300, "y": 200, "width": 90, "height": 90, "color": "#EFF6FF", "borderColor": "#2563EB", "textColor": "#1E3A5F" }
      // For dfd-flow data-store: { "id": "ds1", "type": "data-store", "processId": "D1", "label": "Books DB", "x": 520, "y": 180, "width": 140, "height": 55, "color": "#FAF5FF", "borderColor": "#A855F7", "textColor": "#581C87" }
      // For dfd-flow external: { "id": "user", "type": "external", "label": "Library User", "x": 80, "y": 180, "width": 110, "height": 60, "color": "#FEF2F2", "borderColor": "#EF4444", "textColor": "#7F1D1D" }
    ],
    "connections": [
      // For uml-diagram: { "from": "customer_c", "to": "order_c", "label": "places", "type": "association|inheritance|dependency|composition|aggregation", "style": "solid|dashed" }
      // For dfd-flow: { "from": "p1", "to": "ds1", "label": "update catalog" }
    ]
  },
  "mermaid_code": "complete valid mermaid.js code here (empty/blank if using schema)",
  "theory": "Minimum 180 words. Technically accurate explanation covering: (1) what the system is, (2) each major component and its specific role, (3) how data/signals flow through the system end-to-end, (4) real protocols or standards used, (5) practical application. Write as if explaining to a student preparing for a university exam.",
  "key_points": ["accurate technical point 1", "accurate technical point 2", "accurate technical point 3", "accurate technical point 4", "accurate technical point 5"],
  "use_cases": ["real-world use case 1", "real-world use case 2", "real-world use case 3"],
  "complexity": "Beginner|Intermediate|Advanced",
  "subject_category": "Electronics|Networks|Database|Software|Control Systems|Other",
  "fallback_json": {
    "nodes": [
      { "id": "node_id", "label": "Full Component Name", "type": "rectangle|process|decision|terminal|input_output" }
    ],
    "edges": [
      { "from": "source_id", "to": "target_id", "label": "connection/signal label" }
    ]
  }
}

════════════════════════════════════════
MERMAID SYNTAX RULES (follow exactly):
════════════════════════════════════════

RULE 1 — NODE IDs: short alphanumeric only, no spaces, no special chars
  GOOD: MS, BTS, BSC, MSC, HLR
  BAD:  Mobile_Station, 'BTS', base-station

RULE 2 — NODE LABELS: double quotes only for multi-word labels, NEVER single quotes, NO parentheses
  GOOD: MS["Mobile Station"]
  BAD:  MS['Mobile Station']        ← NEVER single quotes
  BAD:  MS["Mobile Station (MS)"]   ← parentheses break the Mermaid parser
  BAD:  MS[Mobile Station]          ← NEVER unquoted multi-word

RULE 3 — SUBGRAPH titles: always use quoted format, never truncate, NO parentheses inside labels
  GOOD: subgraph BSS["Base Station Subsystem"]
  BAD:  subgraph BSS["Base Station Subsystem (BSS)"]  ← parentheses break parser
  BAD:  subgraph Base   ← truncated

RULE 4 — ARROW LABELS: 2-4 words max, double quotes
  GOOD: MS -->|"radio signal"| BTS
  BAD:  MS -->|'radio'| BTS   ← single quotes banned

RULE 5 — SHAPES: vary shapes to distinguish component types
  [rectangle]       → main components and subsystems
  (rounded)         → processes and functions
  {diamond}         → decision points
  ((circle))        → start/end/terminal nodes
  [/parallelogram/] → input/output data

RULE 6 — SUBGRAPH syntax:
  subgraph ID["Full Title"]
    A["Node A"]
    B["Node B"]
  end

RULE 7 — NODE COUNT: minimum 10 nodes, maximum 18 nodes

RULE 8 — FULL NAMES: never use abbreviations as the visible label
  GOOD: HLR["Home Location Register"]
  BAD:  HLR["HLR"]

RULE 9 — erDiagram (Entity-Relationship):
  - Entity names MUST be in ALL_CAPS_WITH_UNDERSCORES (e.g., CUSTOMER_ORDER).
  - Relationships MUST use exactly double-hyphens '--' (solid line) or double-dots '..' (dashed line). Single hyphens '-' or single dots '.' are strictly banned.
  - Cardinality markers MUST be exactly '||', '|o', 'o|', '|{', '}|', 'o{', or '}o'.
  - Always separate entities, relationship line, colon, and labels with spaces.
  - Labels MUST be enclosed in double quotes.
  - Correct Format: CUSTOMER ||--o{ ORDER : "places"

RULE 10 — sequenceDiagram: single-word participant names, use activate/deactivate
  participant Client
  participant Server
  activate Server
  Client->>Server: "GET /resource"

════════════════════════════════════════════
REFERENCE: CORRECT GSM ARCHITECTURE EXAMPLE
(use this level of completeness for all diagrams)
════════════════════════════════════════════
flowchart TD
  subgraph MS_SUB["Mobile Station"]
    ME["Mobile Equipment"]
    SIM["SIM Card"]
  end
  subgraph BSS["Base Station Subsystem"]
    BTS["Base Transceiver Station"]
    BSC["Base Station Controller"]
  end
  subgraph NSS["Network Switching Subsystem"]
    MSC["Mobile Switching Center"]
    HLR["Home Location Register"]
    VLR["Visitor Location Register"]
    AUC["Authentication Center"]
    EIR["Equipment Identity Register"]
    GMSC["Gateway MSC"]
  end
  PSTN["PSTN - External Network"]
  ME -->|"radio Um interface"| BTS
  BTS -->|"Abis interface"| BSC
  BSC -->|"A interface"| MSC
  MSC -->|"queries subscriber"| HLR
  MSC -->|"roaming info"| VLR
  MSC -->|"authenticates"| AUC
  MSC -->|"checks IMEI"| EIR
  MSC -->|"external calls"| GMSC
  GMSC -->|"connects to"| PSTN`

// OpenRouter fallback
async function callOpenRouter(prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'DiagramAI',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a technically accurate, complete, student-friendly diagram for: ${prompt}` },
      ],
      max_tokens: 3000,
      temperature: 0.1,
    }),
  })
  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  const data = await res.json()
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
  const isCustomSchema = parsed.diagram_type === 'uml-diagram' || parsed.diagram_type === 'dfd-flow'

  if (isCustomSchema) {
    if (!parsed.schema || !Array.isArray(parsed.schema.nodes)) {
      throw new Error('Custom diagram schema is missing or invalid')
    }
    parsed.mermaid_code = '' // clear mermaid code
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
                key_points: libraryMatch.keyPoints || [],
                use_cases: libraryMatch.useCases || [],
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

    // ── TIER 2: AI Generation (existing Groq / OpenRouter pipeline) ───────────
    const isComplexTopic = /block|architect|dbms|database|system|circuit|mcc|spcc|control|network|osi|gsm|compiler|processor|memory|cache|pipeline/i.test(prompt)
    let model = (useProModel || isComplexTopic)
      ? (process.env.GROQ_MODEL_PRO || 'llama-3.3-70b-versatile')
      : (process.env.GROQ_MODEL || 'llama-3.1-8b-instant')

    let rawText, usedFallback = false, retried = false

    const tryGroq = async (m, customPrompt = null) => {
      const promptToUse = customPrompt || `Generate a technically accurate, complete, student-friendly diagram for: ${prompt.trim()}`
      const completion = await groq.chat.completions.create({
        model: m,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptToUse },
        ],
        max_tokens: 3000,
        temperature: 0.1,
        response_format: { type: 'json_object' },
      })
      return completion.choices[0].message.content
    }

    try {
      rawText = await tryGroq(model)
    } catch (groqErr) {
      console.warn('Groq failed, trying OpenRouter:', groqErr.message)
      try {
        rawText = await callOpenRouter(prompt)
        usedFallback = true
      } catch (fallbackErr) {
        return Response.json({ error: 'AI providers temporarily unavailable. Please try again.' }, { status: 503 })
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
          meta: { model: usedFallback ? 'openrouter-fallback' : model, usedFallback, retried, fromLibrary: true, isStub: true, timestamp: new Date().toISOString() },
        })
      }

      return Response.json({
        success: true,
        data: { ...validated, source: 'ai', useFallback: false },
        meta: { model: usedFallback ? 'openrouter-fallback' : model, usedFallback, retried, fromLibrary: false, timestamp: new Date().toISOString() },
      })
    } catch (validateErr) {
      const isSyntaxOrInvalid = validateErr.message.startsWith('SYNTAX_ERROR') || validateErr.message === 'INVALID_DIAGRAM_TYPE' || validateErr.message.includes('JSON')
      
      if (isSyntaxOrInvalid && !retried) {
        retried = true
        const errDetails = validateErr.message
        console.warn(`Initial generation failed (${errDetails}). Retrying with correction prompt...`)
        
        let correctionPrompt
        if (errDetails.includes('JSON')) {
          correctionPrompt = `You previously generated a response for "${prompt.trim()}" but it was not valid JSON. Please generate a valid JSON object matching the requested schema exactly. Include the required fallback_json structure.`
        } else {
          correctionPrompt = `You previously generated a diagram for "${prompt.trim()}" but it failed validation with error: "${errDetails}".
Here is the invalid Mermaid code you generated:
\`\`\`
${parsed ? parsed.mermaid_code : 'unknown'}
\`\`\`
Please regenerate the JSON, correcting the specific syntax error. Ensure the Mermaid code compiles perfectly. Keep all other fields (title, theory, key_points, use_cases, fallback_json) complete and accurate.`
        }

        try {
          rawText = await tryGroq('llama-3.3-70b-versatile', correctionPrompt)
          parsed = parseResponse(rawText)
          const validated = validateResult(parsed)

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
              meta: { model: 'llama-3.3-70b-versatile', usedFallback: false, retried: true, fromLibrary: true, isStub: true, timestamp: new Date().toISOString() },
            })
          }

          return Response.json({
            success: true,
            data: { ...validated, source: 'ai', useFallback: false },
            meta: { model: 'llama-3.3-70b-versatile', usedFallback: false, retried: true, fromLibrary: false, timestamp: new Date().toISOString() },
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
                  complexity: stubMetadata.complexity || parsed.complexity,
                  subject_category: stubMetadata.category || parsed.subject_category,
                  source: 'library-stub',
                  useFallback: true,
                  mermaid_code: parsed.mermaid_code || ''
                },
                meta: { model: 'llama-3.3-70b-versatile', usedFallback: false, retried: true, fromLibrary: true, isStub: true, timestamp: new Date().toISOString(), fallbackActive: true },
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
              meta: { model: 'llama-3.3-70b-versatile', usedFallback: false, retried: true, fromLibrary: false, timestamp: new Date().toISOString(), fallbackActive: true },
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