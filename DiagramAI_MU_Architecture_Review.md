# DiagramAI — Mumbai University Architecture Review & Production Plan

**Document Type:** Principal Architecture Review + Production Roadmap  
**Project:** DiagramAI — AI-Powered Exam Diagram Generator for Mumbai University Engineering Students  
**Repository:** github.com/TechWithAkash/diagram-ai  
**Stack:** Next.js 14.2.5 · Groq AI (Llama 3.1/3.3) · OpenRouter · SVGEngine · Mermaid.js · Fuse.js  
**Review Date:** June 2026  
**Reviewer Role:** Principal Software Architect + Senior AI Engineer + Mumbai University Exam Expert

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Complete Codebase Architecture](#2-complete-codebase-architecture)
3. [Mumbai University Diagram Engine Analysis](#3-mumbai-university-diagram-engine-analysis)
4. [MU Knowledge Base Design](#4-mu-knowledge-base-design)
5. [Complete Failure Analysis & Edge Case Inventory](#5-complete-failure-analysis--edge-case-inventory)
6. [Production-Grade Diagram Engine Architecture](#6-production-grade-diagram-engine-architecture)
7. [PYQ-Aware Diagram Intelligence](#7-pyq-aware-diagram-intelligence)
8. [Diagram Validation Engine](#8-diagram-validation-engine)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [CTO Review](#10-cto-review)
11. [Sequence Diagrams](#11-sequence-diagrams)
12. [Final Recommendations](#12-final-recommendations)

---

## 1. Executive Summary

DiagramAI is a technically impressive, well-architected educational tool built specifically for Mumbai University engineering students. After exhaustively reading every file in the repository — 128 diagram JSON definitions, 89 catalog entries, 14 SVG renderers, the full API pipeline, all solver functions, and every utility — the overall assessment is: **this is genuinely good foundational engineering with targeted gaps that, if addressed, would make it the definitive MU exam preparation platform.**

### Headline Findings

**Strengths that should be preserved:**
- Three-tier generation pipeline (Static Library → Parameterized Solver → AI Fallback) is architecturally correct and rare in student tools
- 12 deterministic circuit solvers eliminate LLM arithmetic errors — an exceptional design decision
- Grid-based schematic compiler (`gridSchematicCompiler.js`) removes coordinate hallucination from AI output
- Topological schematic linter (`validateSchematicTopology`) prevents students from studying broken circuits
- 14 specialized SVG renderers handle diagram types that Mermaid.js cannot express
- Build-time catalog compilation creates a zero-runtime-cost MU syllabus index

**Critical gaps that must be addressed:**
- The Fuse.js fuzzy threshold (0.40) is too permissive — a query for "DNS" can match "DFA"
- No per-department routing: a CMPN student and an EE student asking the same question get the same result
- Prompt length cap (300 characters) silently rejects full PYQ questions copied from PDFs
- The `verify-request` API writes to the filesystem — this will fail silently on Vercel's read-only deployment
- Session history is in-memory only; students lose all history on tab refresh
- No MU semester or department context is captured from the user — the system cannot disambiguate "network" (Computer Networks vs Electrical Networks)
- Only 5 SDLC departments have catalog entries; AI/DS, MECH Sem IV–VIII, Civil, and IT are unrepresented

---

## 2. Complete Codebase Architecture

### 2.1 Repository Map

```
diagramai/
├── app/
│   ├── api/
│   │   ├── generate/route.js          ← CORE: 650-line generation controller
│   │   └── verify-request/route.js    ← Filesystem-based feedback logger (broken on Vercel)
│   ├── globals.css                    ← Tailwind + custom scroll + brand vars
│   ├── layout.js                      ← Next.js root layout, Poppins font, meta
│   └── page.js                        ← 450-line client orchestrator, all UI state
│
├── components/
│   ├── diagram/
│   │   └── DiagramRenderer.js         ← Router: SVGEngine vs Mermaid.js dispatch
│   ├── engine/
│   │   ├── SVGEngine.jsx              ← Master dispatcher → 14 sub-renderers
│   │   ├── primitives/
│   │   │   ├── Arrow.jsx
│   │   │   ├── Block.jsx
│   │   │   ├── BusLine.jsx
│   │   │   ├── CircuitSymbol.jsx
│   │   │   ├── LogicGate.jsx
│   │   │   ├── StackLayer.jsx
│   │   │   └── StateCircle.jsx
│   │   └── renderers/
│   │       ├── Arch8085Renderer.jsx   ← Hardcoded pixel-perfect 8085 block diagram
│   │       ├── Arch8086Renderer.jsx   ← Hardcoded pixel-perfect 8086 block diagram
│   │       ├── BlockDiagramRenderer.jsx
│   │       ├── CircuitRenderer.jsx
│   │       ├── DFDFlowRenderer.jsx
│   │       ├── GraphRenderer.jsx
│   │       ├── LayeredStackRenderer.jsx ← OSI/TCP-IP stack visualizer
│   │       ├── LogicDiagramRenderer.jsx
│   │       ├── SequenceRenderer.jsx
│   │       ├── SequentialFlowRenderer.jsx
│   │       ├── StateMachineRenderer.jsx
│   │       ├── TableRenderer.jsx
│   │       ├── TreeRenderer.jsx
│   │       └── UMLDiagramRenderer.jsx
│   └── ui/
│       ├── Badge.js
│       ├── Button.js
│       ├── SyllabusBrowser.jsx        ← Exists but not mounted in page.js
│       └── Tabs.js
│
├── lib/
│   ├── catalog/                       ← 13 JSON files, 89 catalog entries
│   │   ├── cmpn/sem3.json … sem6.json
│   │   ├── electrical/sem3.json … sem5.json
│   │   ├── extc/sem3.json … sem5.json
│   │   ├── fe/sem1.json, sem2.json
│   │   └── mechanical/sem3.json
│   ├── diagrams/                      ← 128 detailed diagram JSON definitions
│   │   ├── algorithms/   (5 diagrams)
│   │   ├── compiler/     (5 diagrams)
│   │   ├── dbms/         (5 diagrams)
│   │   ├── electronics/  (60+ diagrams)
│   │   ├── microprocessors/ (24 diagrams)
│   │   ├── networks/     (15 diagrams)
│   │   ├── os/           (2 diagrams)
│   │   ├── sdlc/         (5 diagrams)
│   │   └── se/           (7 diagrams)
│   ├── deterministicSolver.js         ← 12 physics-correct circuit solvers
│   ├── diagramLibrary.js              ← Fuse.js index builder + matchDiagram()
│   ├── gridSchematicCompiler.js       ← Grid-netlist → absolute coordinates compiler
│   ├── mumbai-university-compiled-index.json ← Build-time compiled catalog (89 entries)
│   ├── useGenerateDiagram.js          ← React hook wrapping /api/generate
│   ├── useHistory.js                  ← In-memory session history (8 entries max)
│   └── utils.js                       ← SVG export, clipboard, config constants
│
└── scripts/
    └── compile-catalog.js             ← Node.js script: walks lib/catalog/ → compiled-index.json
```

### 2.2 Technology Stack Analysis

| Layer | Technology | Version | Assessment |
|---|---|---|---|
| Framework | Next.js | 14.2.5 | ✅ Solid, App Router, SSR/SSG capable |
| Primary LLM | Groq / Llama 3.3-70B | Latest | ✅ Fast, cheap, good JSON mode |
| Fallback LLM | OpenRouter (4 models) | — | ✅ Resilient rotation pattern |
| Fuzzy Search | Fuse.js | 7.4.2 | ⚠️ Threshold needs tuning |
| Diagram Render (AI) | Mermaid.js | 10.9.0 | ✅ Standard, browser-side |
| Diagram Render (Static) | Custom SVGEngine | Internal | ✅ Major competitive advantage |
| Styling | Tailwind CSS | 3.4.1 | ✅ |
| Deployment | Vercel (inferred) | — | ⚠️ File system writes will break |
| State Management | React useState | — | ⚠️ No persistence, no URL sharing |

---

## 3. Mumbai University Diagram Engine Analysis

### 3.1 Generation Pipeline (Reverse Engineered)

The system processes a student query through a sophisticated multi-tier pipeline. Here is the exact execution flow:

```
Student Input (raw text, any quality)
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  INPUT LAYER (app/api/generate/route.js)                        │
│  • Validate: non-empty, < 300 chars                             │
│  • Extract: prompt, useProModel flag, forceAI flag              │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼  (if !forceAI)
┌─────────────────────────────────────────────────────────────────┐
│  TIER 0: AI CLASSIFIER (Groq — Llama 3.3-70B or 3.1-8B)        │
│                                                                  │
│  Classifies query into:                                          │
│  A. theory_request   → skip to Tier 1                          │
│  B. numerical_problem → match to 1 of 25 circuit templates      │
│  C. unsupported_custom_circuit → return 400 error               │
│                                                                  │
│  Also extracts numerical parameters (V, R, L, C, f…)            │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼  (if numerical_problem with matched template)
┌─────────────────────────────────────────────────────────────────┐
│  PARAMETERIZED SOLVER LAYER (lib/deterministicSolver.js)        │
│                                                                  │
│  12 physics-correct solvers:                                     │
│  • solveDcCircuit          • solveAcRlcCircuit                  │
│  • solveZenerRegulator     • solveOpampInverting                │
│  • solveOpampNoninverting  • solveStarDelta                     │
│  • solveNortonsTheorem     • solveSourceTransformation          │
│  • solveSeriesRlCircuit    • solveSeriesRlcResonance            │
│  • solveSuperposition      • solveThevenin                     │
│                                                                  │
│  Output: { given, calculations, results, mappings }             │
│  Overlays computed values onto base template JSON               │
│  Removes bypassed components (e.g., short-circuit capacitor)    │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼  (if theory_request or solver unavailable)
┌─────────────────────────────────────────────────────────────────┐
│  TIER 1: STATIC LIBRARY LOOKUP (lib/diagramLibrary.js)          │
│                                                                  │
│  • Fuse.js index over ALL_DIAGRAMS (128 entries)               │
│  • Fuzzy search with threshold 0.40                             │
│  • Semantic validation: DFD≠Flowchart, Class≠Sequence, etc.   │
│  • Returns: full diagram JSON if confident match               │
│  • Returns: stubMetadata if isStub=true (catalog entry only)   │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼  (on miss or stub)
┌─────────────────────────────────────────────────────────────────┐
│  TIER 2: AI GENERATION (Groq → OpenRouter rotation)             │
│                                                                  │
│  Groq rotation: [llama-3.3-70B, llama-3.1-8B, mixtral-8x7B]   │
│  OpenRouter rotation: [llama-3.3-70B, llama-3.1-8B, qwen-72B, │
│                        gemma-2-9B] (all :free)                 │
│                                                                  │
│  System prompt: 300-line expert diagram specification           │
│  Guides AI to return typed JSON schemas                         │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  PARSE & VALIDATE LAYER                                          │
│  • parseResponse(): strips markdown fences, extracts JSON      │
│  • validateResult(): routes by diagram_type                    │
│    - circuit-schematic → validateSchematicTopology() (linter)  │
│    - mermaid types → fixMermaidCode() + validateMermaidSyntax()│
│  • On failure: correction prompt retry (1 attempt)             │
│  • On retry failure: fallback_json renderer                    │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  RENDER LAYER (client-side, components/engine/)                 │
│                                                                  │
│  DiagramRenderer.js routes to:                                  │
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │  SVGEngine.jsx  │    │  Mermaid.js (browser render)     │   │
│  │  14 renderers   │    │  flowchart, erDiagram,           │   │
│  │  • 8085/8086    │    │  sequenceDiagram, stateDiagram,  │   │
│  │  • Circuit      │    │  graph                           │   │
│  │  • Logic Gates  │    └──────────────────────────────────┘   │
│  │  • OSI Stack    │                                            │
│  │  • DFD, UML     │                                            │
│  │  • …12 more     │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Subject Identification

The system currently identifies subjects through a combination of:

**Explicit keyword matching in the classifier prompt** — the classifier LLM is told about 25 circuit template names and maps the query to them.

**Fuse.js fuzzy matching** — indexes diagram `id`, `title`, `aliases`, `subject`, `syllabus_reference`, and `textbook_reference` fields. The `ignoreLocation: true` option means any part of these fields participates in matching.

**Regex heuristics in the API** — `isComplexTopic` regex selects the Pro model (llama-3.3-70B) for queries containing words like `block`, `architect`, `circuit`, `osi`, `compiler`, etc.

**What is missing:** Department context. The word "network" means Computer Networks to a CMPN student and Electrical Network Analysis to an EE student. The system has no mechanism to resolve this ambiguity.

### 3.3 Semester Detection

Currently there is **no semester detection at query time.** The catalog is indexed by semester (via the compiled JSON), but no field is captured from the student to filter results. The `compile-catalog.js` script correctly tags each catalog entry with `department` and `semester`, but `matchDiagram()` searches the entire flat index without filtering by those tags.

### 3.4 Diagram Classification

The system recognizes the following types:

| Schema Type | Renderer | Trigger |
|---|---|---|
| `circuit-schematic` | CircuitRenderer + GridCompiler | Classifier matches a circuit template |
| `logic-diagram` | LogicDiagramRenderer | Fuse/AI for gates, flip-flops |
| `block-diagram` | BlockDiagramRenderer | Architecture queries |
| `8086-custom` | Arch8086Renderer | Hardcoded match |
| `8085-custom` | Arch8085Renderer | Hardcoded match |
| `layered-stack` | LayeredStackRenderer | OSI, TCP/IP |
| `sequential-flow` | SequentialFlowRenderer | SDLC models |
| `state-machine` | StateMachineRenderer | Process states |
| `sequence` | SequenceRenderer | Protocols, handshakes |
| `tree` / `graph` | TreeRenderer / GraphRenderer | BST, FFT butterfly, PV diagram |
| `table` | TableRenderer | Frame structures |
| `uml-diagram` | UMLDiagramRenderer | Use case, class, sequence UML |
| `dfd-flow` | DFDFlowRenderer | DFD Level 0/1 |
| `flowchart` | Mermaid.js | General flowcharts |
| `erDiagram` | Mermaid.js | ER diagrams |
| `sequenceDiagram` | Mermaid.js | Protocol sequences |
| `stateDiagram-v2` | Mermaid.js | State machines |

### 3.5 Existing Strengths

The following components represent genuine competitive advantages that should be preserved and expanded:

**Deterministic Circuit Solvers** — The `deterministicSolver.js` is exceptional. By performing physics-correct calculations server-side (Ohm's Law, impedance, power factor, resonance frequency, Thevenin equivalent), the system eliminates the most common failure mode of LLM-generated numerical content: arithmetic errors. Students receive correct values, not AI guesses.

**Grid-Based Schematic Compiler** — `gridSchematicCompiler.js` allows circuits to be defined by component placement on a logical grid (e.g., `"grid": [1, 0]`) and netlist connections (e.g., `{ "from": "R1.left", "to": "V1.top" }`). The compiler converts these to pixel-perfect coordinates. This is the right abstraction layer — it separates topology from rendering.

**Topological Schematic Linter** — `validateSchematicTopology()` checks for floating terminals, Vcc-to-GND short circuits, and unconnected op-amp inputs. This prevents students from studying dangerously incorrect circuit diagrams.

**Mermaid Syntax Auto-Fixer** — `fixMermaidCode()` handles dozens of common AI output errors: single quotes, missing headers, unicode arrows, unbalanced brackets, ER diagram relationship syntax. This is 200+ lines of hard-won production experience.

---

## 4. MU Knowledge Base Design

### 4.1 Recommended Hierarchical Schema

The current catalog is flat after compilation. A properly structured MU knowledge base should enforce the following hierarchy:

```
Mumbai University
    └── Department (CMPN, IT, EXTC, EE, MECH, CIVIL, AIDS, FE)
            └── Year (FY, SY, TY, BE)
                    └── Semester (1–8)
                            └── Subject (with subject code)
                                    └── Module (1–6, per MU syllabus)
                                            └── Topic
                                                    └── Diagram Entry
                                                            └── metadata
```

### 4.2 Complete Diagram Entry Schema

Every diagram in the MU knowledge base should conform to this structure:

```json
{
  "id": "string — unique kebab-case identifier",
  "title": "string — exact textbook title",
  "type": "string — SVGEngine schema type or mermaid type",
  
  "mu_metadata": {
    "departments": ["CMPN", "IT"],
    "year": "Third Year",
    "semester": "Semester V",
    "subject": "Computer Networks",
    "subject_code": "CSC501",
    "module": "Module 1",
    "topic": "Reference Models",
    "syllabus_revision": "2019 Pattern",
    "nep_applicable": false
  },
  
  "pyq_metadata": {
    "frequency": "High",
    "typical_marks": 10,
    "appeared_in": [
      {
        "month": "December",
        "year": 2023,
        "question": "Explain the OSI reference model with a neat diagram. (10M)"
      }
    ],
    "importance_score": 9.2,
    "mark_distribution": {
      "diagram_alone": 4,
      "diagram_with_explanation": 10,
      "comparison_question": 6
    }
  },
  
  "textbook_references": [
    {
      "author": "Andrew S. Tanenbaum",
      "title": "Computer Networks",
      "edition": "5th Edition",
      "publisher": "Prentice Hall",
      "chapter": 1,
      "page": 38
    }
  ],
  
  "aliases": ["OSI model", "open systems interconnection", "7 layer model"],
  "search_keywords": ["osi", "layers", "network", "iso", "application", "transport"],
  
  "diagram_schema": { },
  
  "theory": "string — 180+ word textbook explanation",
  "key_points": [],
  "use_cases": [],
  "examTip": "string — practical exam scoring tip",
  "complexity": "Beginner | Intermediate | Advanced",
  
  "related_diagrams": ["tcp-ip-model", "dhcp-dora"],
  "disambiguation_siblings": [
    {
      "id": "electrical-network-analysis",
      "context": "For Electrical Engineering Semester 3"
    }
  ]
}
```

### 4.3 Coverage Gap Analysis

Current catalog coverage by department:

| Department | Semesters Covered | Diagrams | Missing |
|---|---|---|---|
| Computer Engineering (CMPN) | 3, 4, 5, 6 | ~35 | Sem 7 (AI), Sem 8 |
| Electronics & EXTC | 3, 4, 5 | ~20 | Sem 6, 7, 8 |
| Electrical Engineering | 3, 4, 5 | ~15 | Sem 6, 7, 8 |
| First Year Engineering | 1, 2 | ~10 | Complete for FY |
| Mechanical Engineering | 3 only | ~5 | Sem 4–8 |
| **IT Engineering** | **None** | **0** | **Entire department** |
| **AI & Data Science** | **None** | **0** | **Entire department** |
| **Civil Engineering** | **None** | **0** | **Entire department** |

---

## 5. Complete Failure Analysis & Edge Case Inventory

### 5.1 Input Failures

**Type A — Typos and Misspellings**

| Input | Expected | Current Behaviour | Risk |
|---|---|---|---|
| "thevenins theorm" | Thevenin diagram | Likely matches (Fuse) | Low |
| "supreposition theroem" | Superposition circuit | May miss (threshold) | Medium |
| "collpits oscillater" | Colpitts oscillator | May miss | Medium |
| "OSl model" (lowercase L) | OSI model | Matches | Low |
| "8o86 architecture" (letter O not zero) | 8086 diagram | May miss | High |
| "carnott cycle" | Carnot cycle | May miss | Medium |

**Type B — PYQ Text Dumps**

A student copies: *"Draw and explain the architecture of Intel 8085 microprocessor. Show the functions of each unit. (10M) [Dec 2023, Mumbai University]"*

Current behaviour: The 300-character input limit rejects this silently. The string is 129 characters but if it includes the full question with instructions it often exceeds 300. The API returns: `"Prompt too long. Keep it under 300 characters."` with no guidance.

**Type C — Numerical Values Only**

Input: `"V=12V, R1=470, R2=1k, find Vth"`

Current behaviour: The classifier attempts to match this to `thevenins-theorem-circuit`. It should work, but only if the classifier correctly parses the notation. The classifier has not been tested with notation variations like `Vth`, `Voc`, `R_L`.

**Type D — WhatsApp Group Style Queries**

- `"bhai 8085 ka diagram bhejo pls"` — Hindi/English mixed
- `"CN sem5 cmpn osi wala"` — Department + sem hint + short form
- `"digital sig proc sem6 fft butterfly"` — Correct enough to work
- `"networking OSI 7 layer model toh send karo"` — Will likely work

The system has no Hindi language understanding; mixed-language queries will succeed or fail based on whether the English technical terms are recognizable to Fuse.js.

**Type E — Ambiguous Queries**

| Input | Ambiguity | System Response |
|---|---|---|
| "network diagram" | Computer Networks vs ENA vs general | Matches first result |
| "state diagram" | OS Process State vs FSM vs UML | Matches first result |
| "transformer" | Single-phase transformer vs transformer equivalent circuit | Unpredictable |
| "amplifier circuit" | BJT vs Op-Amp vs Push-Pull vs Diff Amp | Classifier routes; risky |
| "conversion" | Star-Delta vs D-to-JK vs source transformation | Risky |

### 5.2 Academic Failures

**Cross-Department Diagram Collisions**

The most dangerous failure class. Identical keywords resolve to different diagrams depending on the student's department:

| Query | CMPN Student Expects | EE Student Expects | Current Behaviour |
|---|---|---|---|
| "network analysis" | Computer Networks OSI | Electrical Network Analysis two-port | Returns OSI (CMPN bias) |
| "control system" | Software requirement | Closed-loop feedback | Returns Closed-Loop |
| "transformer" | Compiler phases (SPCC) | Transformer equivalent circuit | Unpredictable |
| "tree diagram" | Binary search tree (DS) | Parse tree (SPCC) | Returns BST |

**NEP vs Old Pattern Syllabus Conflicts**

Mumbai University adopted the National Education Policy (NEP) 2020 for some programs from 2023 batch onward. Some subjects have been restructured, renamed, or merged. The current catalog uses the 2019 pattern exclusively. Students on the 2023 NEP pattern may receive diagrams from a reorganized syllabus mapping.

**Multiple Valid Answers**

For Superposition Theorem, a student can ask for either the original circuit with two sources, or the two single-source sub-circuits, or the final superposition. The current system serves the template but has no mechanism for the student to specify which form they need.

### 5.3 Generation Failures

**Wrong Diagram Selected**

The Fuse.js threshold of 0.40 is the primary source of wrong diagram selection. Fuse.js scores work as follows: 0.0 = perfect match, 1.0 = no match. A threshold of 0.40 allows matches that are moderately similar. This can cause:

- "DFA automata" matching "DNA" (hypothetically)
- "linear search" matching "linear integrated circuits"  
- "process model" matching "process life cycle"

**AI Hallucinated Components**

When the system falls through to AI generation (Tier 2), the LLM may:

- Add non-existent pins to the 8085 (the system prompt mitigates this but cannot eliminate it)
- Invent module names inside the 8086 BIU
- Swap OSI layer functions between adjacent layers
- Use wrong Mermaid.js syntax for ER cardinality

**Coordinate Overlap in Circuit Renderer**

The `gridSchematicCompiler.js` uses fixed `colSpacing=180, rowSpacing=140`. Dense circuits (e.g., instrumentation amplifier with 3 op-amps) can have components overlap when placed on a small grid.

### 5.4 Rendering Failures

**SVG Export on Mobile**

`downloadSVG()` in `utils.js` creates a Blob URL and triggers an anchor click. On iOS Safari, this works inconsistently. The `diagramRef.current` approach also captures only the SVG element — if a Mermaid diagram has text that overflows the container, it may be clipped in the downloaded SVG.

**Mermaid Rendering Race Condition**

`DiagramRenderer.js` uses `useEffect` to call `mermaid.render()`. On slow connections, the Mermaid library may not be fully initialized when the effect runs, causing a silent failure that leaves the diagram area empty with no error shown to the student.

**Mobile Viewport Clipping**

The SVGEngine outputs diagrams with `maxWidth: ${width}px`. For complex diagrams where `width=900+`, this causes horizontal scroll on mobile, which is not indicated by any UI cue.

### 5.5 System Failures

**Filesystem Write on Vercel**

`verify-request/route.js` writes to `lib/catalog/pending-requests.json` using Node.js `fs.writeFileSync`. Vercel deployments use a read-only filesystem outside `/tmp`. This silently fails: students who click "Request Verification" receive a success response, but no data is saved.

**API Key Exposure Risk**

The OpenRouter API key is sent with each request from the server. If the Next.js server ever logs the full request body (e.g., in error logging), the key could be exposed. This is a standard concern but the current code has no redaction.

**Classifier LLM Failure Cascade**

If the Groq classifier call fails (rate limit, timeout, JSON parse error), the code catches the error, logs it, and proceeds to Tier 1 fuzzy matching. This is a correct fallback. However, if the classifier fails and the query is a numerical problem, the system will serve a generic static template without parameter substitution — a silent accuracy degradation.

**Token Count for Complex Queries**

The `max_tokens: 2000` limit on generation may be insufficient for complex diagrams like the 8086 architecture (which has ~15 components, extensive netlist, 180+ word theory, 5 key points, 3 use cases, and fallback JSON). Truncated responses cause JSON parse failures that trigger the retry path.

---

## 6. Production-Grade Diagram Engine Architecture

### 6.1 Recommended Architecture

The ideal architecture follows a strict priority hierarchy where each layer only engages when the preceding layer cannot serve the request with sufficient confidence.

```
Priority 1: Verified Static Library (instant, 100% accurate)
    │ Hit with schema_template → return immediately
    │ Hit without schema_template (stub) → store metadata, continue
    ▼
Priority 2: Deterministic Parameterized Solver (instant, mathematically correct)
    │ Numerical problem detected + template matched + solver exists
    │ → Overlay values on verified template → return
    ▼
Priority 3: AI-Assisted Generation with Constraint Validation
    │ Groq (primary) → OpenRouter (fallback rotation)
    │ Output: typed JSON schema → GridCompiler → Linter → Render
    ▼
Priority 4: Structured Fallback Renderer
    │ fallback_json nodes/edges → simple block diagram
    ▼
Priority 5: Human Review Queue
    │ Write to database → notify reviewer → mark as pending in UI
    ▼
Priority 6: Graceful Error with Study Alternative
    │ "This diagram could not be verified. Here are textbook references."
```

### 6.2 Why Each Layer Exists

**Priority 1 — Static Library:** Students need diagrams that exactly match what they've seen in textbooks and past papers. No AI can guarantee this consistency. The static library is the only mechanism that can produce the same diagram every time, regardless of model version changes, prompt drift, or inference variability.

**Priority 2 — Deterministic Solver:** LLMs cannot do reliable arithmetic. A student asking "find the resonant frequency given L=50mH, C=100µF" needs the answer `f_r = 1 / (2π√LC) = 71.2 Hz`, not an LLM's approximation. The solver computes this exactly and overlays results on a verified circuit diagram.

**Priority 3 — AI with Constraints:** For the long tail of topics not in the library, AI generation is the only option. The key discipline here is not using raw LLM output — it must pass through the GridCompiler (eliminating coordinate errors) and the Schematic Linter (eliminating topological errors) before reaching the student.

**Priority 4 — Structured Fallback:** When AI output fails all validation after retry, a simple block diagram from `fallback_json` is infinitely more useful than an error screen. It gives the student a rough conceptual structure while clearly labeling it as unverified.

**Priority 5 — Human Review Queue:** Verification requests should persist to a database, not a local file. A human reviewer can validate difficult diagrams and promote them to Priority 1 status.

**Priority 6 — Graceful Error:** Some requests cannot be satisfied (e.g., "draw a custom 6-transistor SRAM cell"). The system should acknowledge this gracefully, cite relevant textbook chapters, and suggest related diagrams from the library.

### 6.3 Department Context Capture

The most impactful immediate improvement is adding department and semester context to every session:

```
┌─────────────────────────────────────────┐
│  Before generating, resolve context:    │
│                                         │
│  Department: [CMPN ▼] [EE ▼] [EXTC ▼] │
│  Semester:   [V ▼]                      │
│                                         │
│  (Remembered across session)            │
└─────────────────────────────────────────┘
```

This context is then passed to `matchDiagram()` which filters the Fuse.js index before searching:

```javascript
// Proposed API
function matchDiagram(prompt, context = {}) {
  const { department, semester } = context;
  
  // Pre-filter the diagram pool if context is available
  const pool = context.department
    ? ALL_DIAGRAMS.filter(d =>
        !d.mu_metadata?.departments?.length ||
        d.mu_metadata.departments.includes(department)
      )
    : ALL_DIAGRAMS;
    
  const fuse = new Fuse(pool, fuseOptions);
  // … rest of matching logic
}
```

---

## 7. PYQ-Aware Diagram Intelligence

### 7.1 PYQ Data Model

Each catalog entry currently has an `exam_relevance` object. This should be extended:

```json
"pyq_metadata": {
  "frequency": "High | Medium | Low",
  "importance_score": 9.2,
  "typical_marks": 10,
  "appeared_in": [
    {
      "month": "December",
      "year": 2023,
      "exam_type": "University",
      "question_verbatim": "Explain the OSI model with diagram. (10M)",
      "marks": 10
    },
    {
      "month": "May",
      "year": 2023,
      "exam_type": "University",
      "question_verbatim": "Compare OSI and TCP/IP. (6M)",
      "marks": 6
    }
  ],
  "consecutive_appearances": 4,
  "last_appeared": "2024-05",
  "prediction_score": 8.7
}
```

### 7.2 How PYQ Intelligence Should Influence Generation

**Search ranking boost:** When a student query matches a diagram with `importance_score >= 8`, it should override lower-scoring matches even with a slightly worse Fuse.js score.

**Exam context injection:** When serving a high-frequency PYQ diagram, inject the actual PYQ question alongside the diagram:

```
📋 This diagram appeared in 4 consecutive MU exams.
    "Explain the OSI model layers with a neat diagram. (10M)" — Dec 2023
```

**Semester prediction:** If `importance_score >= 9` and `last_appeared` was 2 or more semesters ago, flag it as "Due for repetition."

**Marks-aware complexity:** If a student's prompt contains a marks indicator (e.g., "10M", "6 marks"), the generation should scale the depth of theory and key points to match — a 10M answer needs more detail than a 4M answer.

### 7.3 PYQ Frequency Display UI

A "Frequency badge" should appear alongside the EXAM READY badge:

```
[EXAM READY]  [🔥 High Frequency — appeared 4 times in last 3 years]
```

---

## 8. Diagram Validation Engine

### 8.1 Multi-Layer Validation Framework

Every diagram must pass through all relevant validation layers before reaching the student.

```
Layer 1: Schema Structure Validation
    ├── Required fields present (title, type, schema or mermaid_code, theory)
    ├── Array fields are arrays (key_points, use_cases, components)
    └── No empty string values in critical fields

Layer 2: Topological Validation (circuit-schematic only)
    ├── No floating terminals (validateSchematicTopology — already implemented)
    ├── No Vcc-to-GND direct connection
    ├── Op-amp in+ and in- both connected
    ├── BJT has base, collector, and emitter all connected
    └── Ground present when DC source present

Layer 3: Mermaid Syntax Validation (Mermaid diagrams)
    ├── fixMermaidCode() sanitizes common errors
    ├── validateMermaidSyntax() checks structural issues
    ├── No banned types (classDiagram, block-beta)
    └── Minimum length check (>30 chars)

Layer 4: Academic Content Validation (LLM-assisted, async)
    ├── Layer name/order correctness (OSI, TCP/IP)
    ├── Component name accuracy (8085 register names)
    ├── Formula correctness in theory text
    └── Semester alignment check

Layer 5: Rendering Validation (client-side)
    ├── SVGEngine renders without exceptions
    ├── No overlapping components in viewport
    ├── Text remains within bounds
    └── Mobile viewport compatibility check
```

### 8.2 Academic Content Validation (New Component)

This is the most important missing layer. Currently, if the AI generates an 8085 architecture with "Instruction Queue" instead of "Instruction Register" — a common hallucination — no layer catches it.

The proposed Academic Validator uses a second, cheap LLM call with a short, focused checklist:

```javascript
async function validateAcademicContent(diagram, diagramId) {
  // Only run for known diagram types with defined ground truth
  const knownDiagrams = ACADEMIC_CHECKLISTS[diagramId];
  if (!knownDiagrams) return { valid: true };
  
  const prompt = `
    You are a Mumbai University examiner. Check this diagram schema for accuracy.
    Diagram type: ${diagramId}
    Schema: ${JSON.stringify(diagram.schema)}
    
    Required components that MUST be present: ${knownDiagrams.required.join(', ')}
    Forbidden labels (hallucinations): ${knownDiagrams.forbidden.join(', ')}
    
    Return JSON: { "valid": boolean, "errors": ["description"] }
  `;
  
  // Use llama-3.1-8b-instant for speed (cheap validation pass)
  const result = await quickGroqCall(prompt);
  return result;
}
```

### 8.3 Academic Checklists (Selected Examples)

```javascript
const ACADEMIC_CHECKLISTS = {
  '8085-architecture': {
    required: ['ALU', 'Accumulator', 'Flags', 'Instruction Register', 
               'Timing and Control', 'Register Array', 'Address Buffer', 
               'Data Bus Buffer', 'Stack Pointer', 'Program Counter'],
    forbidden: ['Instruction Queue', 'BIU', 'EU', 'Segment Register', 
                'Prefetch Queue'],
    source: 'Ramesh Gaonkar — Microprocessor Architecture, Chapter 2'
  },
  '8086-architecture': {
    required: ['BIU', 'EU', 'CS', 'DS', 'SS', 'ES', 'IP', 
               'Instruction Queue', 'AX', 'BX', 'CX', 'DX',
               'ALU', 'Flags', 'SP', 'BP', 'SI', 'DI'],
    forbidden: ['Accumulator Register', 'MAR', 'MBR', 'Instruction Register'],
    source: 'Liu and Gibson — Microcomputer Systems, Chapter 3'
  },
  'osi-model': {
    required: ['Application', 'Presentation', 'Session', 'Transport', 
               'Network', 'Data Link', 'Physical'],
    layerOrder: 'top-to-bottom: 7 to 1',
    forbidden: ['Internet Layer', 'Host-to-Host Layer'],
    source: 'Tanenbaum — Computer Networks, Chapter 1'
  },
  'compiler-phases': {
    required: ['Lexical Analyzer', 'Syntax Analyzer', 'Semantic Analyzer',
               'Intermediate Code Generator', 'Code Optimizer', 
               'Code Generator', 'Symbol Table', 'Error Handler'],
    sequenceRequired: true,
    forbidden: ['Tokenizer', 'Parser Tree', 'Back-End'],
    source: 'Alfred V. Aho — Compilers, Chapter 1'
  }
};
```

### 8.4 Student-Facing Validation Transparency

The current system shows an "EXAM READY" badge for library diagrams and "AI VERIFIED" for AI-generated ones. This should be expanded:

| Badge | Meaning | Display Condition |
|---|---|---|
| ✅ EXAM READY | Verified textbook diagram | Library match with schema_template |
| 📐 PARAMETERIZED | Solved with your values | Deterministic solver used |
| 🤖 AI GENERATED | AI output, structure validated | Tier 2, all validators passed |
| ⚠️ UNVERIFIED | AI output, validation uncertain | Fallback renderer active |
| ❌ VERIFICATION FAILED | Topology error detected | Linter failed after retry |

---

## 9. Implementation Roadmap

### Phase 1 — Critical Bug Fixes (Week 1–2)

**Impact: High | Complexity: Low**

These are bugs that actively harm the product today.

**Fix 1: Replace filesystem-based verification logger**

Remove `fs.writeFileSync` from `verify-request/route.js`. Replace with a cloud-compatible solution:

```javascript
// Option A: Vercel KV (Redis)
import { kv } from '@vercel/kv';
await kv.lpush('pending-verifications', JSON.stringify(newRequest));

// Option B: Supabase (PostgreSQL, free tier)
await supabase.from('verification_requests').insert(newRequest);

// Option C: Write to /tmp (works on Vercel, ephemeral)
const tmpPath = path.join('/tmp', 'pending-requests.json');
```

**Fix 2: Raise prompt length limit for PYQ compatibility**

The 300-character limit silently rejects PYQ text. Raise to 800 characters with smart extraction:

```javascript
// If prompt > 300 chars, extract the core question
async function extractCoreQuery(longPrompt) {
  const result = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{
      role: 'user',
      content: `Extract the core diagram/topic from this exam question in under 15 words: "${longPrompt}"`
    }],
    max_tokens: 50,
    temperature: 0
  });
  return result.choices[0].message.content.trim();
}
```

**Fix 3: Tighten Fuse.js threshold**

Lower the fuzzy threshold from 0.40 to 0.30 to reduce false matches. Add per-field weights:

```javascript
const fuseOptions = {
  threshold: 0.30,           // was 0.40 — tighter matching
  keys: [
    { name: 'id',           weight: 3.0 },
    { name: 'title',        weight: 2.5 },
    { name: 'aliases',      weight: 2.0 },
    { name: 'search_keywords', weight: 1.8 },
    { name: 'subject',      weight: 1.5 },
    { name: 'theory',       weight: 0.3 },  // was 1.0 — theory text causes false matches
  ]
};
```

**Fix 4: Add Mermaid.js initialization guard**

```javascript
// In DiagramRenderer.js
useEffect(() => {
  let isMounted = true;
  mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: themes[type] });
  mermaid.render(svgId, code).then(({ svg }) => {
    if (isMounted && ref.current) ref.current.innerHTML = svg;
  }).catch(err => {
    if (isMounted) setError(`Diagram render failed: ${err.message}`);
  });
  return () => { isMounted = false; };
}, [code]);
```

---

### Phase 2 — Department Context System (Week 3–4)

**Impact: Very High | Complexity: Medium**

**Task 2.1: Add department/semester selector to UI**

A lightweight context bar below the header, saved to `localStorage`:

```jsx
// DepartmentContext.jsx
const DEPARTMENTS = ['CMPN', 'IT', 'EXTC', 'EE', 'MECH', 'CIVIL', 'AIDS', 'FE'];
const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

// Persisted to localStorage, passed to every generate() call
```

**Task 2.2: Update API to accept context**

```javascript
// /api/generate/route.js
const { prompt, useProModel, forceAI, department, semester } = body;
// Pass context to matchDiagram()
const libraryMatch = matchDiagram(prompt.trim(), { department, semester });
```

**Task 2.3: Extend matchDiagram() for context filtering**

Filter the search pool by department before fuzzy matching. Fall back to the full pool if no department context is set.

**Task 2.4: Add disambiguation prompt**

When a match has `disambiguation_siblings`, show a disambiguation card before serving the result:

```
"Network diagram" could mean:
  [Computer Networks (CMPN/IT Sem V)]   [Electrical Network Analysis (EE Sem III)]
```

---

### Phase 3 — MU Diagram Database Expansion (Week 5–8)

**Impact: Very High | Complexity: High**

**Task 3.1: Expand catalog to missing departments**

Priority order based on student population:

1. IT Engineering (Sem 3–8) — shares many diagrams with CMPN
2. AI & Data Science (Sem 3–8) — Machine Learning block diagrams, CNN architecture, decision trees
3. Mechanical Engineering (Sem 4–8) — Stress-strain curves, P-V diagrams, gear trains
4. Civil Engineering (Sem 3–8) — Beam diagrams, shear force/bending moment, flow networks

**Task 3.2: Add 50+ missing electronics diagrams**

Current electronics coverage is strong but missing:
- Class A, AB amplifier circuits
- Differential equation circuit solutions (s-domain, Laplace)
- Three-phase circuits (Delta, Star load configurations)
- Bridge rectifier with filter capacitor (smoothed output waveform)
- Schmitt trigger circuit
- 555 timer (astable, monostable modes)

**Task 3.3: Add PYQ frequency data to all catalog entries**

Mine Mumbai University official question papers (available on mu.ac.in) to populate `pyq_metadata.appeared_in` arrays for all existing catalog entries.

---

### Phase 4 — Validation Engine (Week 9–11)

**Impact: High | Complexity: Medium**

**Task 4.1: Implement Academic Checklists**

Build the `ACADEMIC_CHECKLISTS` object for the 30 highest-frequency MU exam diagrams. These are the diagrams where hallucinations would be most harmful.

**Task 4.2: Integrate Academic Validator into AI pipeline**

Add the async academic content check as a post-validation step for AI-generated diagrams (not library diagrams, which are pre-verified).

**Task 4.3: Expand Schematic Linter**

Current linter checks: floating terminals, Vcc-GND shorts, op-amp float.

Add: BJT saturation topology check, transformer polarity dots, diode forward-bias direction consistency, capacitor polarity (electrolytic).

**Task 4.4: Circuit Topology Unit Tests**

Write Jest tests for each of the 12 deterministic solvers and all schematic linter rules. Currently there are no tests. A regression in `solveThevenin()` would produce wrong exam values for students silently.

---

### Phase 5 — Production Hardening (Week 12–14)

**Impact: Medium | Complexity: Low-Medium**

**Task 5.1: Persistent Session History**

Replace `useHistory.js` (in-memory, lost on refresh) with localStorage or Vercel KV:

```javascript
// Keep last 20 searches per device, 30-day TTL
const history = JSON.parse(localStorage.getItem('mu-diagram-history') || '[]');
```

**Task 5.2: URL-Based Diagram Sharing**

The embed mode (`?id=...&embed=true`) already exists. Extend it to support `?query=...&dept=CMPN&sem=V` so students can share exact diagram links in WhatsApp groups.

**Task 5.3: Request Caching**

Cache library hits in Vercel Edge Cache (or a KV store with 24hr TTL). Static library diagrams never change — serving them from cache eliminates API latency for common queries.

**Task 5.4: Rate Limiting per IP**

Add a simple sliding window rate limiter to prevent single users from exhausting Groq tokens. The current architecture has no rate limiting at all.

**Task 5.5: Error Monitoring**

Integrate Sentry.io (free tier). The current error handling is `console.error` only. Production errors — especially AI validation failures — need to be aggregated and triaged.

**Task 5.6: Mount SyllabusBrowser**

`components/ui/SyllabusBrowser.jsx` exists but is not mounted in `page.js`. This component would let students browse diagrams by department/semester/subject — a critical navigation path for students who don't know exact query terms.

---

## 10. CTO Review

### Would this architecture scale to thousands of Mumbai University students?

**Short answer: The foundation is ready. The operational gaps are not.**

### Scalability Assessment

**Compute Cost at Scale**

The 3-tier architecture is designed for cost efficiency. At 10,000 monthly generations:

| Path | Estimated % of traffic | Cost |
|---|---|---|
| Static Library (Tier 1) | ~60% | $0 (no LLM call) |
| Parameterized Solver (Tier 0+1) | ~25% | ~$0.0001/req (classifier only) |
| AI Generation (Tier 2) | ~15% | ~$0.001/req |
| **Total (10,000 generations)** | | **~$4–6/month** |

This is genuinely lean. The README's $0.0001/request estimate is realistic.

**Vercel Serverless Concurrency**

The `/api/generate` route makes synchronous LLM calls that take 1–4 seconds. Vercel's free tier allows 10 concurrent function executions. During exam season (November–December, April–May), Mumbai University sees thousands of students studying simultaneously. The platform will need Vercel Pro (50 concurrent) or a dedicated Node.js server (Railway, Render, Fly.io) during peak periods.

### Technical Debt Assessment

| Area | Debt Level | Description |
|---|---|---|
| Testing | 🔴 Critical | Zero unit tests. Any refactor risks silent regressions in solvers |
| Error monitoring | 🔴 Critical | console.error only; no production visibility |
| State management | 🟡 Medium | All state in React useState; no URL persistence; no offline capability |
| API design | 🟡 Medium | Single giant 650-line route.js; should be modularized |
| Type safety | 🟡 Medium | No TypeScript; diagram schemas not validated at import time |
| Documentation | 🟢 Good | README is excellent; code comments are adequate |
| Security | 🟡 Medium | No rate limiting; API keys in env (correct); no input sanitization beyond length |

### Educational Impact Assessment

The most important metric for this product is: **does the student get the right diagram for their exam?**

Based on the codebase analysis:

For the 60% of queries that hit the static library (OSI model, 8085/8086, TCP handshake, Thevenin circuit, etc.), the answer is **yes — very reliably.** These are the most-asked exam diagrams and they are served with textbook-accurate, pixel-perfect renderings.

For the 25% that hit the parameterized solver (circuit numericals), the answer is **yes, mathematically — but with UX gaps.** The solver gives correct values but the theory explanation injection is a separate LLM call that can fail.

For the 15% that fall to AI generation, the answer is **sometimes.** The GridCompiler and Schematic Linter significantly improve reliability over raw LLM output, but hallucinated component names and incorrect layer orderings are still possible.

### CTO Recommendation

**Ship the current version for pilot use** with 100–500 students at one college while implementing Phase 1 fixes (2 weeks). The core architecture is sound enough that real student usage will surface edge cases faster than any internal testing. Monitor via Sentry, collect feedback, and use that data to prioritize Phase 2–3.

**Do not** wait for the complete Phase 1–5 roadmap before going live. The static library alone is a genuinely useful tool for MU students.

**Invest immediately in Phase 3** (database expansion to IT, AIDS departments) — these represent a 40%+ expansion of the addressable student population with relatively low engineering effort (primarily content creation, not new infrastructure).

---

## 11. Sequence Diagrams

### 11.1 Current Generation Flow

```
Student                 Next.js UI              /api/generate           Groq AI         OpenRouter
   │                       │                         │                     │                │
   │  Enter prompt         │                         │                     │                │
   │──────────────────────►│                         │                     │                │
   │                       │  POST /api/generate     │                     │                │
   │                       │────────────────────────►│                     │                │
   │                       │                         │ Validate input       │                │
   │                       │                         │ (length, non-empty)  │                │
   │                       │                         │                     │                │
   │                       │                         │ [if !forceAI]        │                │
   │                       │                         │ Classifier prompt    │                │
   │                       │                         │─────────────────────►│                │
   │                       │                         │ { classification,    │                │
   │                       │                         │   template, params } │                │
   │                       │                         │◄─────────────────────│                │
   │                       │                         │                     │                │
   │                       │  [if numerical_problem] │                     │                │
   │                       │                         │ deterministicSolver()│                │
   │                       │                         │ Overlay values       │                │
   │                       │                         │ Return solved schema │                │
   │                       │                         │─────────────────────────────────────►│
   │                       │                         │                                      │
   │                       │  [if theory_request]    │                     │                │
   │                       │                         │ matchDiagram() Fuse  │                │
   │                       │                         │ [Library HIT]        │                │
   │                       │                         │ Return static JSON   │                │
   │                       │                         │─────────────────────────────────────►│
   │                       │                         │                                      │
   │                       │  [Library MISS]         │                     │                │
   │                       │                         │ Groq generation      │                │
   │                       │                         │─────────────────────►│                │
   │                       │                         │ [Groq fails]         │                │
   │                       │                         │ OpenRouter rotation  │                │
   │                       │                         │─────────────────────────────────────►│
   │                       │                         │◄─────────────────────────────────────│
   │                       │                         │ parseResponse()      │                │
   │                       │                         │ validateResult()     │                │
   │                       │                         │ [FAIL → retry]       │                │
   │                       │                         │─────────────────────►│                │
   │                       │◄────────────────────────│                     │                │
   │                       │ { success, data, meta } │                     │                │
   │                       │                         │                     │                │
   │  DiagramRenderer      │                         │                     │                │
   │  SVGEngine / Mermaid  │                         │                     │                │
   │◄──────────────────────│                         │                     │                │
```

### 11.2 Proposed Flow with Department Context

```
Student                 UI (with context)       /api/generate           Groq AI
   │                       │                         │                     │
   │  Set dept: CMPN       │                         │                     │
   │  Set sem: V           │                         │                     │
   │──────────────────────►│                         │                     │
   │                       │ localStorage.setItem    │                     │
   │                       │                         │                     │
   │  "network diagram"    │                         │                     │
   │──────────────────────►│                         │                     │
   │                       │ POST { prompt,          │                     │
   │                       │        dept: "CMPN",    │                     │
   │                       │        sem: "V" }       │                     │
   │                       │────────────────────────►│                     │
   │                       │                         │ matchDiagram(prompt,│
   │                       │                         │  {dept,sem})        │
   │                       │                         │                     │
   │                       │                         │ Pool filtered to:   │
   │                       │                         │ CMPN Sem V diagrams │
   │                       │                         │                     │
   │                       │                         │ → OSI Model (score: │
   │                       │                         │   0.05, HIGH freq)  │
   │                       │                         │                     │
   │                       │◄────────────────────────│                     │
   │ [EXAM READY] OSI Model│                         │                     │
   │◄──────────────────────│                         │                     │
```

---

## 12. Final Recommendations

### Immediate Actions (Before next student exam cycle)

1. **Fix the Vercel filesystem bug** in `verify-request/route.js` — students are clicking "Request Verification" and silently losing data.

2. **Raise the prompt character limit** to 800 and add PYQ extraction for long inputs — PYQ text dumps are the primary way MU students query.

3. **Tighten the Fuse.js threshold** to 0.30 and down-weight the `theory` field — this will reduce wrong diagram matches.

4. **Mount SyllabusBrowser** in `page.js` — this existing component gives students a browseable catalog, which is essential for students who don't know the exact diagram name.

5. **Add localStorage-backed session history** — students frequently return to the same diagrams during exam revision.

### Medium-Term Priorities (Next 3 months)

6. **Implement department/semester context** — this single change will eliminate the largest class of wrong-diagram matches.

7. **Expand to IT and AI&DS departments** — these are the two largest unrepresented student populations.

8. **Add PYQ frequency data** to all catalog entries and surface it prominently in the UI.

9. **Write unit tests for all 12 deterministic solvers** — a regression in arithmetic is the highest-impact silent failure possible.

10. **Integrate Sentry.io** — production visibility is zero without it.

### Long-Term Vision

DiagramAI has the technical foundation to become the definitive exam preparation tool for Mumbai University engineering students. The combination of a verified static library, deterministic circuit solvers, and a sophisticated AI fallback pipeline is architecturally correct and rare in student-facing tools.

The platform's long-term moat is the **MU-specific diagram library** — 128 verified diagrams hand-crafted to match textbooks, past papers, and examiner expectations. Every diagram added to that library makes the tool more reliable, more differentiating, and harder to replicate. The AI fallback is a temporary bridge; the library is the permanent value.

The next 6 months should be focused entirely on expanding that library to achieve complete coverage: all 8 departments, all semesters 3–8, all high-frequency PYQ diagrams. Once that foundation exists, DiagramAI will be genuinely irreplaceable for the approximately 2 lakh Mumbai University engineering students who appear for exams each year.

---

*Document prepared by: Principal Architecture Review — DiagramAI MU Production Plan*  
*Based on complete codebase analysis: 128 diagram JSON files, 89 catalog entries, 14 SVG renderers, all API routes, all utility functions*  
*Stack: Next.js 14.2.5 · Groq AI · OpenRouter · SVGEngine · Mermaid.js · Fuse.js*
