const Groq = require('groq-sdk');
const fs = require('fs');

// Load env
try {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
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

async function runClassifier(promptText) {
  const classifierPrompt = `You are a technical diagram classifier and parameter extractor for engineering students.
Analyze this user query: "${promptText}"

Classify it into one of these three categories:
1. "theory_request": A request for a standard theory concept, architecture, SDLC, flowchart, or diagram WITHOUT specific numerical parameter calculations (e.g., "draw a colpitts oscillator", "8085 architecture block diagram", "explain waterfall model").
2. "numerical_problem": A circuit analysis/design question containing specific custom component values or source parameters that fits one of our templates.
3. "unsupported_custom_circuit": A request for a custom, arbitrary, or complex circuit layout (e.g. "three-phase motor controller", "rectifier with 6 diodes", "circuit with 5 relays") that does not match the basic topology of our templates.

Our verified templates are:
   - "dc-circuit" (for simple DC circuit with voltage source, switch, ammeter, resistor/lamp/load, voltmeter)
   - "general-series-circuit" (for AC/DC series circuits containing Resistor, Inductor, Capacitor: R, L, C, RC, RL, LC, RLC in series)
   - "general-parallel-circuit" (for AC/DC parallel circuits containing Resistor, Inductor, Capacitor: R, L, C, RC, RL, LC, RLC in parallel)
   - "ac-circuit" (for AC series circuits containing Resistor, Inductor, Capacitor: R, L, C, RC, RL, LC, RLC in series)
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
- For "general-series-circuit": V, f, components (an array of components in the exact connection order mentioned, e.g. [{"type": "resistor", "value": "25 ohm", "label": "R1"}, {"type": "inductor", "value": "0.04H", "label": "L1"}]), includeSwitch (boolean), includeGround (boolean)
- For "general-parallel-circuit": V, f, components (an array of components in the exact connection order mentioned, e.g. [{"type": "resistor", "value": "25 ohm", "label": "R1"}, {"type": "inductor", "value": "0.04H", "label": "L1"}]), includeSwitch (boolean), includeGround (boolean)
- For "star-connection": V (line voltage, e.g. "400V"), f (frequency, e.g. "50Hz"), R (resistance, e.g. "6 ohm"), XL (reactance, e.g. "8 ohm") or L (inductance, e.g. "0.04H")
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

CRITICAL RULES FOR CIRCUIT CLASSIFICATION:
1. ANY series AC or DC circuit containing R, L, C, RL, RC, RLC components, or series resonance with custom values MUST be classified as "general-series-circuit". DO NOT classify them as "ac-circuit", "series-rl-circuit", or "series-rlc-resonance".
2. ANY parallel AC or DC circuit containing R, L, C, RL, RC, RLC components, or parallel resonance with custom values MUST be classified as "general-parallel-circuit".
3. ONLY use "series-rlc-resonance" or "series-rl-circuit" or "ac-circuit" if they are purely theoretical requests without custom numerical parameters (which should be "theory_request"). If they have custom numbers, classify as "general-series-circuit" or "general-parallel-circuit".
4. DO NOT assume or inject components that are not mentioned in the query. For example, if the query does not contain a capacitor, do NOT include a capacitor in the components array. Set "includeSwitch" to true ONLY if a switch is mentioned. Set "includeGround" to true ONLY if ground is mentioned.

Return ONLY a valid JSON object of this format:
{
  "classification": "theory_request" | "numerical_problem" | "unsupported_custom_circuit",
  "matched_template": "dc-circuit" | "general-series-circuit" | "general-parallel-circuit" | "ac-circuit" | "zener-voltage-regulator" | "opamp-inverting" | "opamp-noninverting" | "star-delta-conversion" | "nortons-theorem-bee" | "source-transformation-circuit" | "series-rl-circuit" | "series-rlc-resonance" | "superposition-theorem-circuit" | "thevenins-theorem-circuit" | "bjt-switch-circuit" | "classb-pushpull-amplifier" | "hartley-oscillator" | "colpitts-oscillator" | "wien-bridge-oscillator" | "rc-phase-shift-oscillator" | "astable-multivibrator" | "opamp-integrator" | "opamp-differentiator" | "bjt-differential-amplifier" | "single-phase-transformer" | "star-connection" | "delta-connection" | null,
  "parameters": { ... },
  "unsupported_reason": "Explanation of why the circuit is unsupported, if applicable"
}

Ensure you normalize numerical values (e.g. 100uF -> 0.0001, 10k -> 10000).`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: classifierPrompt }],
    max_tokens: 500,
    temperature: 0.0,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function test() {
  const q1 = "Convert the star circuit into its equivalent delta circuit where Star resistances connected to terminals A, B, and C are 2 ohm, 4 ohm, and 6 ohm respectively.";

  console.log(`Query 1: "${q1}"`);
  console.log(await runClassifier(q1));
}

test();
