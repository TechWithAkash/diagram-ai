import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ─── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a highly accurate technical education expert and diagram specialist. Your diagrams are used by final-year engineering students to study for exams and understand real systems.

YOUR #1 RESPONSIBILITY IS ACCURACY.
Every component, every connection, every label must be technically correct and complete. A student must be able to read your diagram and fully understand the real system — as it exists in textbooks and industry.

Given a subject or topic, return ONLY a valid JSON object. No markdown, no backticks, no explanation outside JSON.

════════════════════════════════════════════
ACCURACY REQUIREMENTS — NON-NEGOTIABLE:
════════════════════════════════════════════

1. INCLUDE ALL MAJOR COMPONENTS of the real system. Do not oversimplify.
   - GSM must include: MS, BTS, BSC, MSC, HLR, VLR, EIR, AuC, GMSC, PSTN/ISDN
   - OSI must include: all 7 layers with protocols at each layer
   - DBMS must include: all subsystems (query processor, buffer manager, transaction manager, storage manager, catalog)
   - TCP must include: all handshake steps with SYN/ACK flags and sequence numbers
   - MCC must include: incoming power, bus bar, motor feeders, protection relays, control circuit
   - NEVER produce a diagram with fewer components than the real system has

2. CONNECTIONS must show real data/signal/control flow — not generic arrows.
   Label each arrow with what actually flows: "RF signal", "SS7 protocol", "SQL query", "interrupt signal"

3. GROUPINGS must reflect the real architecture:
   - GSM: group into BSS (BTS + BSC) and NSS (MSC + HLR + VLR + EIR + AuC)
   - Compiler: group into Front End (Lexer + Parser + Semantic) and Back End (IR + Optimizer + Code Gen)
   - Use subgraphs to show these real architectural boundaries

4. THEORY must be technically accurate and complete (minimum 180 words):
   - Explain each major component and its role
   - Explain the data flow through the system
   - Mention real protocols, standards, or specifications where applicable
   - Written for a student who will be examined on this topic

════════════════════════════════════════
DIAGRAM TYPE SELECTION (choose ONE):
════════════════════════════════════════
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
  "diagram_type": "flowchart|erDiagram|sequenceDiagram|stateDiagram|graph",
  "mermaid_code": "complete valid mermaid.js code here",
  "theory": "Minimum 180 words. Technically accurate explanation covering: (1) what the system is, (2) each major component and its specific role, (3) how data/signals flow through the system end-to-end, (4) real protocols or standards used, (5) practical application. Write as if explaining to a student preparing for a university exam.",
  "key_points": ["accurate technical point 1", "accurate technical point 2", "accurate technical point 3", "accurate technical point 4", "accurate technical point 5"],
  "use_cases": ["real-world use case 1", "real-world use case 2", "real-world use case 3"],
  "complexity": "Beginner|Intermediate|Advanced",
  "subject_category": "Electronics|Networks|Database|Software|Control Systems|Other"
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

RULE 9 — erDiagram: entity names CAPS_WITH_UNDERSCORES, proper cardinality
  CUSTOMER ||--o{ ORDER : "places"

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

// ─── OpenRouter fallback ──────────────────────────────────────────────────────
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

// ─── Parse AI response safely ──────────────────────────────────────────────────
function parseResponse(text) {
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  try { return JSON.parse(clean) } catch {}
  const match = clean.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  throw new Error('Could not parse AI response as JSON')
}

// ─── Fix common mermaid syntax issues automatically ───────────────────────────
function fixMermaidCode(code) {
  if (!code) return code

  let fixed = code.trim()

  // Remove backtick fences
  fixed = fixed.replace(/^```[a-z]*\n?/gm, '').replace(/^```\s*$/gm, '').trim()

  // Fix single-quoted labels → double-quoted
  fixed = fixed.replace(/\['([^']+)'\]/g, '["$1"]')
  fixed = fixed.replace(/\('([^']+)'\)/g, '("$1")')
  fixed = fixed.replace(/\{'([^']+)'\}/g, '{"$1"}')
  fixed = fixed.replace(/\|'([^']+)'\|/g, '|"$1"|')

  // Fix parentheses inside subgraph label strings — Mermaid can't parse them
  // e.g. subgraph MS_SUB["Mobile Station (MS)"] → subgraph MS_SUB["Mobile Station - MS"]
  fixed = fixed.replace(
    /subgraph\s+(\w+)\s*\["([^"]+)"\]/g,
    (match, id, label) => {
      const cleanLabel = label.replace(/\(/g, '- ').replace(/\)/g, '').trim()
      return `subgraph ${id}["${cleanLabel}"]`
    }
  )

  // Also fix parentheses inside any node label strings
  // e.g. MS["Mobile Station (MS)"] → MS["Mobile Station - MS"]
  fixed = fixed.replace(
    /(\w+)\s*\["([^"]+)"\]/g,
    (match, id, label) => {
      const cleanLabel = label.replace(/\(/g, '- ').replace(/\)/g, '').trim()
      return `${id}["${cleanLabel}"]`
    }
  )

  // Fix parentheses in rounded node labels: A("text (abc)") → A("text - abc")
  fixed = fixed.replace(
    /(\w+)\s*\("([^"]+)"\)/g,
    (match, id, label) => {
      const cleanLabel = label.replace(/\(/g, '- ').replace(/\)/g, '').trim()
      return `${id}("${cleanLabel}")`
    }
  )

  // Ban check
  if (fixed.startsWith('classDiagram') || fixed.startsWith('block-beta')) {
    return null
  }

  return fixed
}

// ─── Validate result ──────────────────────────────────────────────────────────
function validateResult(parsed) {
  if (!parsed.mermaid_code || parsed.mermaid_code.trim().length < 30) {
    throw new Error('Generated diagram code is too short or empty')
  }

  const fixed = fixMermaidCode(parsed.mermaid_code)
  if (!fixed) throw new Error('INVALID_DIAGRAM_TYPE')

  parsed.mermaid_code = fixed
  if (!parsed.theory) parsed.theory = 'Theory not available.'
  if (!Array.isArray(parsed.key_points)) parsed.key_points = []
  if (!Array.isArray(parsed.use_cases)) parsed.use_cases = []

  return parsed
}

// ─── Main handler ──────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json()
    const { prompt, useProModel = false } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 2) {
      return Response.json({ error: 'Please enter a valid subject or topic.' }, { status: 400 })
    }
    if (prompt.trim().length > 300) {
      return Response.json({ error: 'Prompt too long. Keep it under 300 characters.' }, { status: 400 })
    }

    // Use pro model for complex technical topics — better instruction following
    const isComplexTopic = /block|architect|dbms|database|system|circuit|mcc|spcc|control|network|osi|gsm|compiler|processor|memory|cache|pipeline/i.test(prompt)
    const model = (useProModel || isComplexTopic)
      ? (process.env.GROQ_MODEL_PRO || 'llama-3.3-70b-versatile')
      : (process.env.GROQ_MODEL || 'llama-3.1-8b-instant')

    let rawText, usedFallback = false, retried = false

    const tryGroq = async (m) => {
      const completion = await groq.chat.completions.create({
        model: m,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Generate a technically accurate, complete, student-friendly diagram for: ${prompt.trim()}` },
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

    let parsed = parseResponse(rawText)

    try {
      const validated = validateResult(parsed)
      return Response.json({
        success: true,
        data: validated,
        meta: { model: usedFallback ? 'openrouter-fallback' : model, usedFallback, retried, timestamp: new Date().toISOString() },
      })
    } catch (validateErr) {
      if (validateErr.message === 'INVALID_DIAGRAM_TYPE' && !retried) {
        retried = true
        console.warn('Invalid diagram type, retrying with pro model...')
        try {
          rawText = await tryGroq('llama-3.3-70b-versatile')
          parsed = parseResponse(rawText)
          const validated = validateResult(parsed)
          return Response.json({
            success: true,
            data: validated,
            meta: { model: 'llama-3.3-70b-versatile', usedFallback: false, retried: true, timestamp: new Date().toISOString() },
          })
        } catch (retryErr) {
          console.error('Retry failed:', retryErr.message)
        }
      }
      throw validateErr
    }

  } catch (err) {
    console.error('Generate API error:', err)
    return Response.json({
      error: err.message === 'INVALID_DIAGRAM_TYPE'
        ? 'Could not generate a valid diagram. Please try rephrasing your prompt.'
        : (err.message || 'Something went wrong. Please try again.')
    }, { status: 500 })
  }
}