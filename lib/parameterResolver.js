/**
 * lib/parameterResolver.js
 * Scans, normalizes engineering notation, and injects textbook defaults for circuit parameters.
 */

const PARAM_LABELS = {
  V: { label: 'Source Voltage', unit: 'V' },
  f: { label: 'Frequency', unit: 'Hz' },
  R: { label: 'Resistance', unit: 'Ω' },
  L: { label: 'Inductance', unit: 'H' },
  C: { label: 'Capacitance', unit: 'F' },
  Vin: { label: 'Input Voltage', unit: 'V' },
  Rs: { label: 'Series Resistance', unit: 'Ω' },
  Vz: { label: 'Zener Voltage', unit: 'V' },
  Rl: { label: 'Load Resistance', unit: 'Ω' },
  R1: { label: 'Resistance R1', unit: 'Ω' },
  R2: { label: 'Resistance R2', unit: 'Ω' },
  R3: { label: 'Resistance R3', unit: 'Ω' },
  R4: { label: 'Resistance R4', unit: 'Ω' },
  R5: { label: 'Resistance R5', unit: 'Ω' },
  Rf: { label: 'Feedback Resistance Rf', unit: 'Ω' },
  Vth: { label: 'Thevenin Voltage', unit: 'V' },
  Rth: { label: 'Thevenin Resistance', unit: 'Ω' },
  RL: { label: 'Load Resistance RL', unit: 'Ω' },
  Vcc: { label: 'Vcc Rail Voltage', unit: 'V' },
  RC: { label: 'Collector Resistance RC', unit: 'Ω' },
  RE: { label: 'Emitter Resistance RE', unit: 'Ω' },
  V1: { label: 'Input Voltage V1', unit: 'V' },
  V2: { label: 'Input Voltage V2', unit: 'V' },
  V3: { label: 'Input Voltage V3', unit: 'V' }
};

export const TEMPLATE_DEFAULTS = {
  'dc-circuit': { V: 230, R: 10 },
  'ac-circuit': { V: 230, f: 50, R: 10, L: 0.1, C: 0.0001 },
  'zener-voltage-regulator': { Vin: 12, Rs: 100, Vz: 5, Rl: 500 },
  'opamp-inverting': { Vin: 1, R1: 10000, Rf: 100000 },
  'opamp-noninverting': { Vin: 1, R1: 10000, Rf: 100000 },
  'star-delta-conversion': { R1: 10, R2: 10, R3: 10, RAB: 30, RBC: 30, RCA: 30 },
  'nortons-theorem-bee': { V1: 15, R1: 8, V2: 5, R2: 2, R3: 2, R4: 16, R5: 10, RL: 3 },
  'source-transformation-circuit': { V: 12, rv: 10, I: 1.2, ri: 10 },
  'series-rl-circuit': { V: 230, f: 50, R: 10, L: 0.1 },
  'series-rlc-resonance': { V: 230, R: 10, L: 0.1, C: 0.0001 },
  'superposition-theorem-circuit': { V1: 20, R1: 4, R2: 6, R3: 10, V2: 10 },
  'thevenins-theorem-circuit': { Vth: 12, Rth: 10, RL: 5 },
  'general-series-circuit': { V: 230, f: 50, R: 10, L: 0.1, C: 0.0001 },
  'general-parallel-circuit': { V: 230, f: 50, R: 10, L: 0.1, C: 0.0001 },
  'star-connection': { V: 400, f: 50, R: 10, XL: 10 },
  'delta-connection': { V: 400, f: 50, R: 12, XL: 16 },
  'series-parallel-circuit': { V: 230, f: 50 },
  'wheatstone-bridge': { R1: 10, R2: 10, R3: 10, R4: 10, R5: 10, V: 10, f: 0 },
  'bjt-bias-circuit': { Vcc: 12, R1: 10000, R2: 2200, RC: 1000, RE: 500 },
  'opamp-summing': { Rf: 10000, R1: 1000, R2: 1000, R3: 1000, V1: 1, V2: 1, V3: 1 }
};


/**
 * Normalizes a parameter string with engineering notation (e.g. 40mH -> 0.04, 100uF -> 0.0001).
 * Supports standard prefixes: p, n, u, μ, m, k, K, M, G, T.
 */
export function normalizeValue(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (!str) return null;

  // Regex matches number part, optional SI prefix, and optional trailing unit
  const match = str.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s*([pnuμmKkMGT]?)(.*)$/);
  if (!match) {
    const parsed = parseFloat(str);
    return isNaN(parsed) ? null : parsed;
  }

  const num = parseFloat(match[1]);
  const prefix = match[2];

  if (isNaN(num)) return null;

  switch (prefix) {
    case 'p': return num * 1e-12;
    case 'n': return num * 1e-9;
    case 'u':
    case 'μ': return num * 1e-6;
    case 'm': return num * 1e-3;
    case 'k':
    case 'K': return num * 1e3;
    case 'M': return num * 1e6;
    case 'G': return num * 1e9;
    case 'T': return num * 1e12;
    default: return num;
  }
}

function formatAssumptionValue(val, unit) {
  if (val === 0) return `0 ${unit}`;
  if (unit === 'H') {
    if (val < 1) return `${(val * 1000).toFixed(0)}m${unit}`;
  }
  if (unit === 'F') {
    if (val < 1e-3) return `${(val * 1e6).toFixed(0)}μ${unit}`;
    if (val < 1) return `${(val * 1000).toFixed(0)}m${unit}`;
  }
  if (unit === 'Ω') {
    if (val >= 1e6) return `${(val / 1e6).toFixed(0)}M${unit}`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(0)}k${unit}`;
  }
  return `${val} ${unit}`;
}

function extractParametersFromPrompt(templateName, prompt) {
  if (!prompt) return {};
  const p = prompt.toLowerCase();
  const params = {};

  // 1. Star-Delta Conversion
  if (templateName === 'star-delta-conversion') {
    const raMatch = p.match(/\b(?:r1|ra|a)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const rbMatch = p.match(/\b(?:r2|rb|b)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const rcMatch = p.match(/\b(?:r3|rc|c)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    if (raMatch) params.R1 = raMatch[1];
    if (rbMatch) params.R2 = rbMatch[1];
    if (rcMatch) params.R3 = rcMatch[1];

    const rabMatch = p.match(/\b(?:rab|ab)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const rbcMatch = p.match(/\b(?:rbc|bc)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const rcaMatch = p.match(/\b(?:rca|ca)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    if (rabMatch) params.RAB = rabMatch[1];
    if (rbcMatch) params.RBC = rbcMatch[1];
    if (rcaMatch) params.RCA = rcaMatch[1];
    
    if (Object.keys(params).length === 0) {
      const ohmMatches = [...prompt.matchAll(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)/gi)];
      if (ohmMatches.length >= 3) {
        params.R1 = ohmMatches[0][1];
        params.R2 = ohmMatches[1][1];
        params.R3 = ohmMatches[2][1];
      }
    }
  }

  // 2. Star Connection
  if (templateName === 'star-connection') {
    const rMatch = p.match(/\br\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)\s*(?:resis|)/i);
    const xlMatch = p.match(/\b(?:xl|x_l|reactance)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)\s*(?:react)\b/i);
    const lMatch = p.match(/\bl\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:h|mh|uh)?/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:h|mh|uh)\b/i);
    const vMatch = p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v(?:olt)?\b/i);
    const fMatch = p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*hz/i);

    if (rMatch) params.R = rMatch[1];
    if (xlMatch) params.XL = xlMatch[1];
    if (lMatch) {
      const unit = lMatch[0].toLowerCase().includes('mh') ? 'mH' : lMatch[0].toLowerCase().includes('uh') ? 'μH' : 'H';
      params.L = lMatch[1] + unit;
    }
    if (vMatch) params.V = vMatch[1];
    if (fMatch) params.f = fMatch[1];
  }

  // 3. Delta Connection
  if (templateName === 'delta-connection') {
    const rMatch = p.match(/\br\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)\s*(?:resis|)/i);
    const xlMatch = p.match(/\b(?:xl|x_l|reactance)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)\s*(?:react)\b/i);
    const lMatch = p.match(/\bl\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:h|mh|uh)?/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:h|mh|uh)\b/i);
    const vMatch = p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v(?:olt)?\b/i);
    const fMatch = p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*hz/i);

    if (rMatch) params.R = rMatch[1];
    if (xlMatch) params.XL = xlMatch[1];
    if (lMatch) {
      const unit = lMatch[0].toLowerCase().includes('mh') ? 'mH' : lMatch[0].toLowerCase().includes('uh') ? 'μH' : 'H';
      params.L = lMatch[1] + unit;
    }
    if (vMatch) params.V = vMatch[1];
    if (fMatch) params.f = fMatch[1];
  }

  // 4. Zener regulator
  if (templateName === 'zener-voltage-regulator') {
    const vinMatch = p.match(/(?:vin|input\s*voltage)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v\s+input/i);
    const rsMatch = p.match(/(?:rs|series\s*resistance|series\s*resistor)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const vzMatch = p.match(/(?:vz|zener\s*voltage|zener\s*diode)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const rlMatch = p.match(/(?:rl|load\s*resistance|load\s*resistor)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    if (vinMatch) params.Vin = vinMatch[1];
    if (rsMatch) params.Rs = rsMatch[1];
    if (vzMatch) params.Vz = vzMatch[1];
    if (rlMatch) params.Rl = rlMatch[1];
  }

  // 5. Thevenin
  if (templateName === 'thevenins-theorem-circuit') {
    const vthMatch = p.match(/(?:vth|thevenin\s*voltage)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v\s+thevenin/i) || p.match(/vth\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v/i);
    const rthMatch = p.match(/(?:rth|thevenin\s*resistance)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/rth\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)/i);
    const rlMatch = p.match(/(?:rl|load\s*resistance|load\s*resistor)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/rl\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)/i);
    if (vthMatch) params.Vth = vthMatch[1];
    if (rthMatch) params.Rth = rthMatch[1];
    if (rlMatch) params.RL = rlMatch[1];
  }

  // 6. Superposition
  if (templateName === 'superposition-theorem-circuit') {
    const v1Match = p.match(/v1\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r1Match = p.match(/r1\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const v2Match = p.match(/v2\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r2Match = p.match(/r2\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r3Match = p.match(/r3\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    if (v1Match) params.V1 = v1Match[1];
    if (r1Match) params.R1 = r1Match[1];
    if (v2Match) params.V2 = v2Match[1];
    if (r2Match) params.R2 = r2Match[1];
    if (r3Match) params.R3 = r3Match[1];

    const ohmMatches = [...p.matchAll(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)/gi)];
    const voltMatches = [...p.matchAll(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v/gi)];
    if (!params.V1 && voltMatches.length >= 1) params.V1 = voltMatches[0][1];
    if (!params.V2 && voltMatches.length >= 2) params.V2 = voltMatches[1][1];
    if (!params.R1 && ohmMatches.length >= 1) params.R1 = ohmMatches[0][1];
    if (!params.R2 && ohmMatches.length >= 2) params.R2 = ohmMatches[1][1];
    if (!params.R3 && ohmMatches.length >= 3) params.R3 = ohmMatches[2][1];
  }

  // 7. Op-Amp Inverting / Non-inverting
  if (templateName === 'opamp-inverting' || templateName === 'opamp-noninverting') {
    const vinMatch = p.match(/(?:vin|input\s*voltage)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i) || p.match(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v\s+input/i) || p.match(/vin\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v/i);
    // Parse R1 and Rf: capture number and unit separately to avoid double-suffix (e.g. '10kk')
    const r1Match = p.match(/(?:r1|input\s*resistor|input\s*resistance)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(k|m|ohm|Ω)?/i);
    const rfMatch = p.match(/(?:rf|feedback\s*resistor|feedback\s*resistance)\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(k|m|ohm|Ω)?/i);
    if (vinMatch) params.Vin = vinMatch[1];
    if (r1Match) {
      const numPart = r1Match[1];
      const unitPart = (r1Match[2] || '').toLowerCase();
      params.R1 = numPart + ((unitPart === 'k' || unitPart === 'm') ? unitPart : '');
    }
    if (rfMatch) {
      const numPart = rfMatch[1];
      const unitPart = (rfMatch[2] || '').toLowerCase();
      params.Rf = numPart + ((unitPart === 'k' || unitPart === 'm') ? unitPart : '');
    }
  }

  // 8. Norton
  if (templateName === 'nortons-theorem-bee') {
    const v1Match = p.match(/v1\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r1Match = p.match(/r1\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const v2Match = p.match(/v2\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r2Match = p.match(/r2\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r3Match = p.match(/r3\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r4Match = p.match(/r4\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const r5Match = p.match(/r5\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);
    const rlMatch = p.match(/rl\s*=\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/i);

    if (v1Match) params.V1 = v1Match[1];
    if (r1Match) params.R1 = r1Match[1];
    if (v2Match) params.V2 = v2Match[1];
    if (r2Match) params.R2 = r2Match[1];
    if (r3Match) params.R3 = r3Match[1];
    if (r4Match) params.R4 = r4Match[1];
    if (r5Match) params.R5 = r5Match[1];
    if (rlMatch) params.RL = rlMatch[1];

    const ohmMatches = [...p.matchAll(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(?:ohm|Ω)/gi)];
    const voltMatches = [...p.matchAll(/([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*v/gi)];

    if (!params.V1 && voltMatches.length >= 1) params.V1 = voltMatches[0][1];
    if (!params.V2 && voltMatches.length >= 2) params.V2 = voltMatches[1][1];
    if (!params.R1 && ohmMatches.length >= 1) params.R1 = ohmMatches[0][1];
    if (!params.R2 && ohmMatches.length >= 2) params.R2 = ohmMatches[1][1];
    if (!params.R3 && ohmMatches.length >= 3) params.R3 = ohmMatches[2][1];
    if (!params.R4 && ohmMatches.length >= 4) params.R4 = ohmMatches[3][1];
    if (!params.R5 && ohmMatches.length >= 5) params.R5 = ohmMatches[4][1];
    if (!params.RL && ohmMatches.length >= 6) params.RL = ohmMatches[5][1];
  }

  return params;
}

/**
 * Normalizes all fields in rawParams and fills in missing required fields for the template.
 */
export function resolveParameters(templateName, rawParams = {}, prompt = '') {
  const normalizedParams = {};
  const assumedValues = [];

  // Local regex extractor safety layer to merge missing or incorrectly parsed parameters
  const queryText = prompt || rawParams.query || '';
  const extracted = extractParametersFromPrompt(templateName, queryText);
  const mergedParams = { ...rawParams };
  for (const [key, val] of Object.entries(extracted)) {
    if (mergedParams[key] === undefined || mergedParams[key] === null || mergedParams[key] === 0 || mergedParams[key] === '0' || mergedParams[key] === '0 ohm' || mergedParams[key] === 0.0) {
      mergedParams[key] = val;
    }
  }

  // 1. Copy over includeSwitch, includeGround, and query if present
  if (mergedParams.includeSwitch !== undefined) {
    normalizedParams.includeSwitch = mergedParams.includeSwitch;
  }
  if (mergedParams.includeGround !== undefined) {
    normalizedParams.includeGround = mergedParams.includeGround;
  }
  if (mergedParams.query !== undefined) {
    normalizedParams.query = mergedParams.query;
  }

  // 1b. Group flat keys (e.g. R, L, C, R1, L1, R2, L2) into components array if components is missing
  const flatCompKeys = Object.keys(mergedParams).filter(k => /^([RLC])(\d*)$/i.test(k));
  if (flatCompKeys.length > 0 && (!Array.isArray(mergedParams.components) || mergedParams.components.length === 0)) {
    flatCompKeys.sort((a, b) => {
      const matchA = a.match(/^([RLC])(\d*)$/i);
      const matchB = b.match(/^([RLC])(\d*)$/i);
      const idxA = matchA[2] ? parseInt(matchA[2], 10) : 1;
      const idxB = matchB[2] ? parseInt(matchB[2], 10) : 1;
      if (idxA !== idxB) return idxA - idxB;
      const order = { R: 1, L: 2, C: 3 };
      const typeA = matchA[1].toUpperCase();
      const typeB = matchB[1].toUpperCase();
      return (order[typeA] || 0) - (order[typeB] || 0);
    });

    mergedParams.components = flatCompKeys.map(key => {
      const match = key.match(/^([RLC])(\d*)$/i);
      const typeChar = match[1].toUpperCase();
      const type = typeChar === 'R' ? 'resistor' : typeChar === 'L' ? 'inductor' : 'capacitor';
      return {
        type,
        value: mergedParams[key],
        label: key,
        id: key
      };
    });
  }

  // 2. Handle dynamic components array if present
  const hasDynamicComponents = Array.isArray(mergedParams.components) && mergedParams.components.length > 0;
  if (hasDynamicComponents) {
    normalizedParams.components = mergedParams.components.map((comp, idx) => {
      const normVal = normalizeValue(comp.value);
      return {
        ...comp,
        rawValue: comp.value, // preserve raw string (e.g. 40mH)
        value: normVal !== null ? normVal : 0,
        id: comp.id || `${comp.type.slice(0, 1).toUpperCase()}${idx + 1}`,
        label: comp.label || `${comp.type.slice(0, 1).toUpperCase()}${idx + 1}`
      };
    });
  }

  // 3. Normalize all present key-value parameters
  for (const [key, val] of Object.entries(mergedParams)) {
    if (key !== 'components' && val !== undefined && val !== null) {
      const norm = normalizeValue(val);
      if (norm !== null && !isNaN(norm)) {
        normalizedParams[key] = norm;
      }
    }
  }

  // 4. Inject defaults for required keys
  const defaults = TEMPLATE_DEFAULTS[templateName] || {};
  for (const [key, defaultVal] of Object.entries(defaults)) {
    // If we have dynamic components, skip defaulting passive circuit components R, L, C
    if (hasDynamicComponents && (key === 'R' || key === 'L' || key === 'C' || key === 'XL')) {
      continue;
    }

    if (normalizedParams[key] === undefined) {
      normalizedParams[key] = defaultVal;
      const metadata = PARAM_LABELS[key];
      if (metadata) {
        const formatted = formatAssumptionValue(defaultVal, metadata.unit);
        assumedValues.push(`${metadata.label} assumed to be ${formatted}`);
      } else {
        assumedValues.push(`${key} assumed to be ${defaultVal}`);
      }
    }
  }

  return {
    normalizedParams,
    assumedValues
  };
}

