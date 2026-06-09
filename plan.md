# DiagramAI — Final Implementation Plan

## Reusable SVG Engine \+ JSON Diagram Definitions

---

## Why This Architecture Is Better

| Approach | Code to add diagram \#31 | Accuracy | Maintainability |
| :---- | :---- | :---- | :---- |
| 30 hand-coded SVG components | Write a new React file (\~150 lines of SVG) | ✅ High | ❌ Tedious |
| **Engine \+ JSON definitions** | **Add one JSON file (\~40 lines)** | ✅ High | ✅ Excellent |

**One rendering engine handles all 30 diagrams. Each diagram is just data.** Adding a new diagram \= write a JSON file. No SVG knowledge needed.  
---

## System Architecture

┌──────────────────────────────────────────────────────────────┐  
│                     DiagramAI System                         │  
│                                                              │  
│  User Query                                                  │  
│      │                                                       │  
│      ▼                                                       │  
│  ┌──────────────────────────┐                               │  
│  │   Fuzzy Matcher (Fuse.js)│  ← searches diagramLibrary   │  
│  └────────────┬─────────────┘                               │  
│               │ match found (score ≥ 0.75)                  │  
│               │                                             │  
│   ┌───────────┴──────────────────────────────┐             │  
│   │         DiagramRenderer.jsx              │             │  
│   │                                          │             │  
│   │  result.renderType \= 'engine'            │             │  
│   │       ↓                                  │             │  
│   │  SVGEngine.jsx ←── diagram.json          │             │  
│   │  (one component, renders any schema)     │             │  
│   │                                          │             │  
│   │  result.renderType \= 'mermaid'           │             │  
│   │       ↓                                  │             │  
│   │  MermaidRenderer.jsx ← Groq LLM output   │             │  
│   │                                          │             │  
│   │  result.source \= 'not\_found'             │             │  
│   │       ↓                                  │             │  
│   │  NotFoundCard.jsx (suggestions)          │             │  
│   └──────────────────────────────────────────┘             │  
└──────────────────────────────────────────────────────────────┘  
---

## The JSON Schema

Every diagram in the library is described by a single JSON file. The SVGEngine reads this schema and renders the SVG automatically.

### Schema Types (8 layout primitives)

js  
// schema \= one of these layout types:  
{  
 type: 'block-diagram',    // 8086, 8085, Von Neumann — nested boxes \+ buses  
 type: 'layered-stack',    // OSI, TCP/IP, Memory Hierarchy — horizontal layers  
 type: 'sequential-flow',  // Waterfall, Compiler phases — top-down boxes \+ arrows  
 type: 'state-machine',    // Process Life Cycle — circles \+ labeled transitions  
 type: 'sequence',         // TCP Handshake, Client-Server — swimlanes \+ messages  
 type: 'tree',             // BST, File System — nodes \+ parent-child edges  
 type: 'graph',            // DFA, Resource Allocation — general nodes \+ edges  
 type: 'table',            // ACID, Complexity Table — grid layout  
}

### Full Example: 8086 Architecture JSON

json  
{  
 "id": "8086-architecture",  
 "type": "block-diagram",  
 "title": "Intel 8086 Microprocessor Architecture",  
 "category": "Microprocessors",  
 "aliases": \["8086", "intel 8086", "8086 microprocessor", "8086 block diagram", "8086 arch", "8086 internal"\],  
 "examTip": "BIU handles bus operations. EU handles execution. They work in parallel — BIU fetches next instruction while EU executes current one.",  
 "viewBox": { "width": 780, "height": 540 },  
 "blocks": \[  
   {  
     "id": "biu",  
     "label": "Bus Interface Unit (BIU)",  
     "x": 30, "y": 40, "width": 320, "height": 420,  
     "color": "\#E8F4FD",  
     "borderColor": "\#2196F3",  
     "children": \[  
       { "id": "seg-regs", "label": "Segment Registers", "x": 50, "y": 80, "width": 260, "height": 80,  
         "sublabels": \["CS — Code Segment", "DS — Data Segment", "SS — Stack Segment", "ES — Extra Segment"\] },  
       { "id": "ip", "label": "Instruction Pointer (IP)", "x": 50, "y": 180, "width": 260, "height": 50 },  
       { "id": "adder", "label": "16-bit Adder", "x": 50, "y": 250, "width": 260, "height": 50 },  
       { "id": "queue", "label": "6-Byte Instruction Queue", "x": 50, "y": 320, "width": 260, "height": 60,  
         "note": "Pre-fetched instruction bytes" }  
     \]  
   },  
   {  
     "id": "eu",  
     "label": "Execution Unit (EU)",  
     "x": 420, "y": 40, "width": 320, "height": 420,  
     "color": "\#FFF3E0",  
     "borderColor": "\#FF9800",  
     "children": \[  
       { "id": "gen-regs", "label": "General Purpose Registers", "x": 440, "y": 80, "width": 280, "height": 100,  
         "sublabels": \["AX (Accumulator)   BX (Base)", "CX (Counter)       DX (Data)", "SP (Stack Ptr)     BP (Base Ptr)", "SI (Source Index)  DI (Dest Index)"\] },  
       { "id": "alu", "label": "Arithmetic & Logic Unit (ALU)", "x": 440, "y": 200, "width": 280, "height": 70 },  
       { "id": "flags", "label": "Flag Register (16-bit)", "x": 440, "y": 290, "width": 280, "height": 50,  
         "sublabels": \["CF PF AF ZF SF TF IF DF OF"\] },  
       { "id": "temp-regs", "label": "Temporary Registers", "x": 440, "y": 360, "width": 280, "height": 40 }  
     \]  
   }  
 \],  
 "connections": \[  
   { "from": "queue", "to": "eu", "label": "16-bit Internal Bus", "type": "bidirectional", "style": "dashed" }  
 \],  
 "buses": \[  
   { "id": "addr-bus", "label": "20-bit Address Bus (AB0–AB19)", "orientation": "horizontal", "y": 490, "color": "\#4CAF50" },  
   { "id": "data-bus", "label": "16-bit Data Bus (DB0–DB15)", "orientation": "horizontal", "y": 515, "color": "\#F44336" }  
 \]  
}

### Example: OSI Model JSON (layered-stack type)

json  
{  
 "id": "osi-model",  
 "type": "layered-stack",  
 "title": "OSI Reference Model (7 Layers)",  
 "aliases": \["OSI", "OSI model", "OSI layers", "open systems interconnection"\],  
 "examTip": "Mnemonic (top-down): All People Seem To Need Data Processing",  
 "layers": \[  
   { "number": 7, "name": "Application",   "protocols": "HTTP, FTP, SMTP, DNS, Telnet", "color": "\#FF6B6B" },  
   { "number": 6, "name": "Presentation",  "protocols": "SSL/TLS, JPEG, MPEG, ASCII", "color": "\#FF8E53" },  
   { "number": 5, "name": "Session",       "protocols": "NetBIOS, RPC, SQL, NFS", "color": "\#FFC353" },  
   { "number": 4, "name": "Transport",     "protocols": "TCP, UDP, SCTP", "color": "\#69DB7C" },  
   { "number": 3, "name": "Network",       "protocols": "IP, ICMP, OSPF, BGP", "color": "\#4DABF7" },  
   { "number": 2, "name": "Data Link",     "protocols": "Ethernet, MAC, PPP, ARP", "color": "\#748FFC" },  
   { "number": 1, "name": "Physical",      "protocols": "RS-232, DSL, 802.11, Fiber", "color": "\#DA77F2" }  
 \],  
 "sideLabel": "PDU: Data → Data → Data → Segment → Packet → Frame → Bits"  
}

### Example: Process Life Cycle JSON (state-machine type)

json  
{  
 "id": "process-life-cycle",  
 "type": "state-machine",  
 "title": "Process Life Cycle (5-State Model)",  
 "aliases": \["process life cycle", "process states", "process state diagram", "CPU scheduling states"\],  
 "states": \[  
   { "id": "new",       "label": "New",       "x": 380, "y": 30 },  
   { "id": "ready",     "label": "Ready",     "x": 160, "y": 200 },  
   { "id": "running",   "label": "Running",   "x": 380, "y": 200 },  
   { "id": "waiting",   "label": "Waiting",   "x": 600, "y": 200 },  
   { "id": "terminated","label": "Terminated","x": 380, "y": 370 }  
 \],  
 "transitions": \[  
   { "from": "new",       "to": "ready",     "label": "Admitted" },  
   { "from": "ready",     "to": "running",   "label": "Scheduler\\nDispatches" },  
   { "from": "running",   "to": "ready",     "label": "Interrupt /\\nTime Quantum Expired" },  
   { "from": "running",   "to": "waiting",   "label": "I/O or Event\\nWait" },  
   { "from": "waiting",   "to": "ready",     "label": "I/O or Event\\nCompletion" },  
   { "from": "running",   "to": "terminated","label": "Exit" }  
 \]  
}  
---

## File Structure

app/  
├── lib/  
│   ├── diagrams/                      ← JSON definitions (one file per diagram)  
│   │   ├── microprocessors/  
│   │   │   ├── 8086-architecture.json  
│   │   │   ├── 8085-architecture.json  
│   │   │   ├── 8051-architecture.json  
│   │   │   ├── von-neumann.json  
│   │   │   └── harvard-architecture.json  
│   │   ├── networks/  
│   │   │   ├── osi-model.json  
│   │   │   ├── tcp-ip-model.json  
│   │   │   ├── tcp-handshake.json  
│   │   │   └── topologies.json  
│   │   ├── os/  
│   │   │   ├── process-life-cycle.json  
│   │   │   ├── process-life-cycle-7state.json  
│   │   │   └── memory-hierarchy.json  
│   │   ├── sdlc/  
│   │   │   ├── waterfall-model.json  
│   │   │   ├── spiral-model.json  
│   │   │   ├── v-model.json  
│   │   │   ├── agile-scrum.json  
│   │   │   └── prototype-model.json  
│   │   ├── dbms/  
│   │   │   ├── three-schema.json  
│   │   │   └── er-diagram-guide.json  
│   │   └── compiler/  
│   │       ├── compiler-phases.json  
│   │       └── dfa-example.json  
│   │  
│   ├── diagramLibrary.js              ← imports all JSONs, builds Fuse.js index  
│   ├── utils.js                       ← fuzzy match, classifier, cleaner  
│   ├── useGenerateDiagram.js          ← React hook for generation state  
│   └── useHistory.js                  ← localStorage history hook  
│  
├── components/  
│   ├── engine/                        ← THE CORE: reusable SVG rendering engine  
│   │   ├── SVGEngine.jsx              ← master dispatcher (reads type, routes to sub-renderer)  
│   │   ├── renderers/  
│   │   │   ├── BlockDiagramRenderer.jsx   ← handles 'block-diagram' type  
│   │   │   ├── LayeredStackRenderer.jsx   ← handles 'layered-stack' type  
│   │   │   ├── SequentialFlowRenderer.jsx ← handles 'sequential-flow' type  
│   │   │   ├── StateMachineRenderer.jsx   ← handles 'state-machine' type  
│   │   │   ├── SequenceRenderer.jsx       ← handles 'sequence' type  
│   │   │   ├── TreeRenderer.jsx           ← handles 'tree' type  
│   │   │   ├── GraphRenderer.jsx          ← handles 'graph' type  
│   │   │   └── TableRenderer.jsx          ← handles 'table' type  
│   │   └── primitives/  
│   │       ├── Block.jsx              ← reusable SVG box with nested children  
│   │       ├── Arrow.jsx              ← labeled directional/bidirectional arrow  
│   │       ├── BusLine.jsx            ← horizontal/vertical bus with label  
│   │       ├── StateCircle.jsx        ← circle with label (for state machines)  
│   │       └── StackLayer.jsx         ← horizontal layer row (for OSI-type)  
│   │  
│   ├── diagram/  
│   │   ├── DiagramRenderer.jsx        ← routes to SVGEngine or MermaidRenderer  
│   │   ├── MermaidRenderer.jsx        ← Mermaid.js for LLM fallback diagrams  
│   │   └── NotFoundCard.jsx           ← "not in library" UI with suggestions  
│   │  
│   └── ui/  
│       ├── Button.jsx  
│       ├── Badge.jsx  
│       └── Tabs.jsx  
│  
├── api/  
│   └── generate/  
│       └── route.js                   ← 3-tier pipeline: library → LLM → not\_found  
│  
├── page.js                            ← main UI  
├── globals.css  
└── layout.js  
---

## SVGEngine.jsx — How It Works

jsx  
// SVGEngine.jsx — reads schema.type, delegates to correct sub-renderer  
export default function SVGEngine({ schema, className }) {  
 const renderers \= {  
   'block-diagram':    BlockDiagramRenderer,  
   'layered-stack':    LayeredStackRenderer,  
   'sequential-flow':  SequentialFlowRenderer,  
   'state-machine':    StateMachineRenderer,  
   'sequence':         SequenceRenderer,  
   'tree':             TreeRenderer,  
   'graph':            GraphRenderer,  
   'table':            TableRenderer,  
 }  
 const Renderer \= renderers\[schema.type\]  
 if (\!Renderer) return \<ErrorFallback schema\={schema} /\>  
 return (  
   \<svg  
     viewBox\={\`0 0 ${schema.viewBox.width} ${schema.viewBox.height}\`}  
     className\={className}  
     role\="img"  
     aria-label\={schema.title}  
   \>  
     \<title\>{schema.title}\</title\>  
     \<Renderer schema\={schema} /\>  
   \</svg\>  
 )  
}  
---

## Benefits of This Architecture

### Adding Diagram \#31 (e.g., "8257 DMA Controller")

bash  
\# Before (hand-coded SVG): write \~200 lines of SVG React code  
\# Now: write one JSON file  
\# Create: app/lib/diagrams/microprocessors/8257-dma.json  
{  
 "id": "8257-dma",  
 "type": "block-diagram",  
 "title": "8257 DMA Controller",  
 ...  
}  
\# Done. Engine renders it automatically.

### Fixing an Error in 8086 Diagram

bash  
\# Before: find the SVG coordinate, adjust x/y pixel values by trial-and-error  
\# Now: edit the JSON label or sublabels field — plain text

### Consistent Styling

All 30 diagrams automatically get:

* Same font (Syne from layout.js)  
* Same box shadows, border radius  
* Same arrow style  
* Same light-mode color palette

---

## API Route Pipeline (unchanged logic, updated response shape)

POST /api/generate  
{ prompt: "8086 architecture" }  
1\. Fuzzy match → finds "8086-architecture" with score 0.97  
2\. Load JSON from diagramLibrary  
3\. Return:  
  {  
    source: 'library',  
    schema: { ...full JSON definition... },  ← SVGEngine renders this  
    title: 'Intel 8086 Microprocessor Architecture',  
    category: 'Microprocessors',  
    examTip: '...'  
  }  
POST /api/generate  
{ prompt: "insertion sort steps" }  
1\. Fuzzy match → no match (score \< 0.75)  
2\. Classify → 'sequential-flow'  
3\. Call Groq → get Mermaid code  
4\. Return:  
  {  
    source: 'ai',  
    mermaidCode: 'flowchart TD\\n  A\[Start\]...',  ← MermaidRenderer renders this  
    title: 'Insertion Sort Steps'  
  }  
---

## Verification Plan

### Engine Tests

* Each of the 8 renderer types must render without errors  
* SVG output must be valid (no missing viewBox, proper nesting)

### Accuracy Tests (Library diagrams)

| Query | Diagram | Check |
| :---- | :---- | :---- |
| "8086 architecture" | BlockDiagramRenderer | BIU \+ EU with all sub-blocks visible |
| "8085 microprocessor" | BlockDiagramRenderer | ALU, registers, control unit, buses |
| "OSI model" | LayeredStackRenderer | 7 layers with correct protocols |
| "waterfall model" | SequentialFlowRenderer | 6 phases in order |
| "process life cycle" | StateMachineRenderer | 5 states, all 6 transitions labeled |
| "TCP handshake" | SequenceRenderer | SYN → SYN-ACK → ACK |
| "compiler phases" | SequentialFlowRenderer | All 6 phases in order |

### Export Test

* "Download SVG" serializes the live SVG DOM → valid .svg file

### LLM Fallback Test

* Novel query renders Mermaid without errors

---

## Implementation Order

1. npm install mermaid fuse.js  
2. Build primitives: Block.jsx, Arrow.jsx, BusLine.jsx, StateCircle.jsx, StackLayer.jsx  
3. Build 8 sub-renderers (one per layout type)  
4. Build SVGEngine.jsx (dispatcher)  
5. Write 30 JSON diagram definitions (fastest with engine in place)  
6. diagramLibrary.js — import \+ index all JSONs  
7. utils.js — fuzzy match \+ classifier  
8. route.js — 3-tier API pipeline  
9. useGenerateDiagram.js \+ useHistory.js  
10. DiagramRenderer.jsx, MermaidRenderer.jsx, NotFoundCard.jsx  
11. UI components: Button.jsx, Badge.jsx, Tabs.jsx  
12. page.js — full UI  
13. globals.css — polish

