// scratch/test_parameterizer.js
const fs = require('fs');
const path = require('path');
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
        if (key && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn('Could not read .env.local file', e.message);
}

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const dcCircuitTemplate = require('../lib/diagrams/electronics/dc-circuit.json');
const acCircuitTemplate = require('../lib/diagrams/electronics/ac-circuit.json');
const zenerRegulatorTemplate = require('../lib/diagrams/electronics/zener-voltage-regulator.json');
const opampInvertingTemplate = require('../lib/diagrams/electronics/opamp-inverting.json');
const opampNoninvertingTemplate = require('../lib/diagrams/electronics/opamp-noninverting.json');

const {
  solveDcCircuit,
  solveAcRlcCircuit,
  solveZenerRegulator,
  solveOpampInverting,
  solveOpampNoninverting
} = require('../lib/deterministicSolver.js');

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

async function runClassifier(prompt) {
  const classifierPrompt = `You are a technical diagram classifier and parameter extractor for engineering students.
Analyze this user query: "${prompt.trim()}"

Classify it into one of these three categories:
1. "theory_request": A request for a standard theory concept, architecture, SDLC, flowchart, or diagram WITHOUT specific numerical parameter calculations (e.g., "draw a colpitts oscillator", "8085 architecture block diagram", "explain waterfall model").
2. "numerical_problem": A simple circuit analysis/design question containing specific custom component values or source parameters that fits EXACTLY one of our 5 templates (e.g., "An RLC circuit with R=12 ohm, L=0.1H, C=100uF connected to 220V 50Hz supply", "Zener voltage regulator Vin=12V Rs=100 Vz=5V Rl=500", "Inverting op-amp Rf=100k, R1=10k, Vin=1V").
3. "unsupported_custom_circuit": A request for a custom, arbitrary, or complex circuit layout (e.g. "three-phase motor controller", "rectifier with 4 diodes", "transistor amplifier", "bridge circuit", "circuit with 5 relays") that does not match the basic topology of our 5 templates. If a circuit has components or topologies not present in our 5 templates (like three-phase, relays, multiple transistors), it MUST be classified as "unsupported_custom_circuit". Do NOT force it to match "numerical_problem".

Our 5 verified circuit templates are:
   - "dc-circuit" (for simple DC circuit with voltage source, switch, ammeter, resistor/lamp/load, voltmeter)
   - "ac-circuit" (for AC series circuits containing any combination of Resistor, Inductor, Capacitor: R, L, C, RC, RL, LC, RLC)
   - "zener-voltage-regulator" (for Zener diode regulator circuit)
   - "opamp-inverting" (for inverting operational amplifier)
   - "opamp-noninverting" (for non-inverting operational amplifier)

If it is "numerical_problem", you MUST match it to one of these 5 templates (choose the closest matching one based on topology) and extract the numerical parameters:
- For "dc-circuit": V, R
- For "ac-circuit": V, f, R, L, C
- For "zener-voltage-regulator": Vin, Rs, Vz, Rl
- For "opamp-inverting": Vin, R1, Rf
- For "opamp-noninverting": Vin, R1, Rf

Note: Normalize all values (e.g., 100uF to 0.0001, 10k to 10000, 5V to 5). If a component in the template is explicitly omitted or not mentioned in the query (e.g. no inductor in an RC circuit, or no resistor in an LC circuit), set its value to 0.

Return ONLY a valid JSON object of this format:
{
  "classification": "theory_request" | "numerical_problem" | "unsupported_custom_circuit",
  "matched_template": "dc-circuit" | "ac-circuit" | "zener-voltage-regulator" | "opamp-inverting" | "opamp-noninverting" | null,
  "parameters": { ... },
  "unsupported_reason": "Explanation of why the circuit is unsupported, if applicable"
}`;

  const classifierResponse = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: classifierPrompt }],
    max_tokens: 500,
    temperature: 0.0,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(classifierResponse.choices[0].message.content);
}

async function test(prompt) {
  console.log(`\n==================================================`);
  console.log(`TESTING PROMPT: "${prompt}"`);
  console.log(`==================================================`);

  const res = await runClassifier(prompt);
  console.log(`\n[Classification Result]:`, JSON.stringify(res, null, 2));

  if (res.classification === 'numerical_problem') {
    const templateName = res.matched_template;
    let baseTemplate = null;
    let solverFn = null;

    if (templateName === 'dc-circuit') {
      baseTemplate = JSON.parse(JSON.stringify(dcCircuitTemplate));
      solverFn = solveDcCircuit;
    } else if (templateName === 'ac-circuit') {
      baseTemplate = JSON.parse(JSON.stringify(acCircuitTemplate));
      solverFn = solveAcRlcCircuit;
    } else if (templateName === 'zener-voltage-regulator') {
      baseTemplate = JSON.parse(JSON.stringify(zenerRegulatorTemplate));
      solverFn = solveZenerRegulator;
    } else if (templateName === 'opamp-inverting') {
      baseTemplate = JSON.parse(JSON.stringify(opampInvertingTemplate));
      solverFn = solveOpampInverting;
    } else if (templateName === 'opamp-noninverting') {
      baseTemplate = JSON.parse(JSON.stringify(opampNoninvertingTemplate));
      solverFn = solveOpampNoninverting;
    }

    if (baseTemplate && solverFn) {
      const solverResult = solverFn(res.parameters);
      console.log(`\n[Solver Success]:`, solverResult.success);
      if (solverResult.success) {
        console.log(`[Solver Given]:`, JSON.stringify(solverResult.given, null, 2));
        console.log(`[Solver Results]:`, JSON.stringify(solverResult.results, null, 2));

        // Bypass omitted components
        if (solverResult.omittedComponents) {
          for (const [compId, isOmitted] of Object.entries(solverResult.omittedComponents)) {
            if (isOmitted) {
              console.log(`[Bypass] Bypassing ${compId}...`);
              removeComponentAndMergeWires(baseTemplate, compId);
            }
          }
        }

        // Overlay parameters
        if (solverResult.mappings) {
          for (const mapping of solverResult.mappings) {
            const comp = baseTemplate.components.find(c => c.id === mapping.id);
            if (comp) {
              comp.value = mapping.value;
              console.log(`[Overlay] Updated ${mapping.id} value to: "${comp.value}"`);
            }
          }
        }

        console.log(`[Success] Base template component count: ${baseTemplate.components.length}`);
      } else {
        console.log(`[Error]:`, solverResult.error);
      }
    }
  }
}

async function runAll() {
  try {
    await test("A series RLC circuit with R=12 ohm, L=0.1H, C=100uF connected to 220V 50Hz supply");
    await test("A series RC circuit with R=100 ohm, C=10uF connected to 10V 1kHz AC");
    await test("Draw a three-phase motor controller with five relays");
  } catch (err) {
    console.error(err);
  }
}

runAll();
