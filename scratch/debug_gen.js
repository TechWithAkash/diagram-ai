// scratch/debug_gen.js
import Groq from 'groq-sdk';
import fs from 'fs';

// Manually parse .env.local
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
} catch (err) {
  console.warn('Could not read .env.local:', err.message);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a highly accurate technical education expert and diagram specialist. Your diagrams are used by final-year engineering students to study for exams and understand real systems.

YOUR #1 RESPONSIBILITY IS ACCURACY.
Every component, every connection, every label must be technically correct and complete. A student must be able to read your diagram and fully understand the real system.

Given a subject or topic, return ONLY a valid JSON object. No markdown, no backticks, no explanation outside JSON.

════════════════════════════════════════════════════════════
CIRCUIT-SCHEMATIC SCHEMA (use ONLY for electronic circuits):
════════════════════════════════════════════════════════════
When diagram_type is "circuit-schematic", set schema.type = "circuit-schematic" and return a coordinate-free Grid Netlist. You define components on a virtual grid of columns and rows (e.g. colSpacing=180, rowSpacing=140), and connect them by terminal names. This is compiled into standard vectors automatically.

Available symbol values: "resistor", "capacitor", "inductor", "diode", "zener-diode", "led", "dc-source", "ac-source", "current-source", "op-amp", "bjt-npn", "bjt-pnp", "transformer", "switch", "ground", "vcc-rail"

Grid system: grid: [col, row]. col and row can be floats (e.g. [1, 0.5]) for perfect alignment.
Rotations: 0 (horizontal), 90 (vertical), 180, 270.

Standard Terminal Names:
- For 2-terminal components (resistor, capacitor, inductor, diode, zener-diode, led, switch):
  - "left", "right" (if rotation=0) or "top", "bottom" (if rotation=90). You can also use "1" (first lead) and "2" (second lead).
- For sources (dc-source, ac-source, current-source): "top", "bottom".
- For ground: "top".
- For vcc-rail: "bottom".
- For BJT transistors: "base", "collector", "emitter".
- For op-amps: "inverting" (in-), "non-inverting" (in+), "output" (out).

Netlist format: list of connections: { "from": "compId.termName", "to": "compId.termName" }.
Always route from left to right or follow circuit loop direction.

EXAMPLE — Thevenin Equivalent Circuit:
{
  "type": "circuit-schematic",
  "grid": { "columns": 3, "rows": 2, "colSpacing": 180, "rowSpacing": 140, "padding": { "left": 100, "top": 80 } },
  "components": [
    { "id": "Vth", "symbol": "dc-source", "grid": [0, 0.5], "rotation": 0, "label": "Vth" },
    { "id": "Rth", "symbol": "resistor",  "grid": [1, 0],   "rotation": 0, "label": "Rth", "value": "1k" },
    { "id": "RL",  "symbol": "resistor",  "grid": [2, 0.5], "rotation": 90, "label": "RL" }
  ],
  "netlist": [
    { "from": "Vth.top", "to": "Rth.left" },
    { "from": "Rth.right", "to": "RL.top" },
    { "from": "Vth.bottom", "to": "RL.bottom" }
  ],
  "labels": [
    { "text": "A", "x": 490, "y": 70, "fontSize": 12, "fontWeight": "700" },
    { "text": "B", "x": 490, "y": 230, "fontSize": 12, "fontWeight": "700" }
  ]
}

CRITICAL RULES:
1. Never define "wires" array inside schema. Use "netlist" array with from/to component connections instead.
2. The grid layout engine compiles netlist connections into orthogonal paths automatically.
3. Use the components' "value" property (e.g. "value": "10k") for parameters. They are placed automatically opposite the label.

════════════════════════════════════════
RETURN THIS EXACT JSON:
════════════════════════════════════════
{
  "title": "Descriptive title max 5 words",
  "diagram_type": "circuit-schematic",
  "schema": {
    "type": "circuit-schematic",
    "viewBox": { "width": 620, "height": 380 },
    "grid": { "columns": 3, "rows": 2 },
    "components": [],
    "netlist": [],
    "wires": [],
    "junctions": [],
    "labels": []
  },
  "theory": "Textbook theory here...",
  "key_points": ["point 1", "point 2"],
  "use_cases": ["use case 1"],
  "complexity": "Intermediate",
  "subject_category": "Electronics"
}`;

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: 'Generate a technically accurate, complete, student-friendly diagram for: Draw a common-emitter transistor amplifier' }
      ],
      max_tokens: 3000,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });
    console.log(completion.choices[0].message.content);
  } catch (err) {
    console.error(err);
  }
}

test();
