/**
 * deterministicSolver.js
 * Performs textbook-accurate, deterministic mathematical calculations for circuit parameters.
 * Used by the parameterizer to compute values for numerical exam questions instead of relying on LLM arithmetic.
 */

const getVal = (v, fallback) => (v !== undefined && v !== null && !isNaN(parseFloat(v))) ? parseFloat(v) : fallback;

/**
 * Solve a basic DC Series Circuit (Battery + Switch + Ammeter + Load)
 * @param {object} params - { V: number, R: number }
 */
export function solveDcCircuit(params) {
  const V = parseFloat(params.V) || 0;
  const R = parseFloat(params.R) || 0;
  
  if (V <= 0 || R <= 0) {
    return {
      success: false,
      error: 'Invalid DC circuit parameters (Voltage and Resistance must be > 0)',
    };
  }

  const I = V / R; // Amps
  const P = V * I; // Watts

  return {
    success: true,
    given: {
      'Source Voltage (V)': `${V} V`,
      'Load Resistance (R)': `${R} Ω`,
    },
    calculations: [
      { step: '1. Calculate Loop Current using Ohm\'s Law:', formula: 'I = V / R', substitution: `I = ${V} / ${R}`, result: `${I.toFixed(3)} A` },
      { step: '2. Calculate Total Power Dissipated:', formula: 'P = V * I', substitution: `P = ${V} * ${I.toFixed(3)}`, result: `${P.toFixed(2)} W` }
    ],
    results: {
      I: `${I.toFixed(3)} A`,
      P: `${P.toFixed(2)} W`,
      V_load: `${V} V`
    },
    mappings: [
      { id: 'V1', value: `${V} V` },
      { id: 'Load1', value: `${R} Ω` },
      { id: 'AM1', value: `${I.toFixed(3)} A` },
      { id: 'VM1', value: `${V} V` }
    ]
  };
}

/**
 * Solve a Series RLC AC Circuit
 * @param {object} params - { V: number, f: number, R: number, L: number, C: number }
 * Note: L is in Henries, C is in Farads (e.g. 10uF = 10e-6)
 */
export function solveAcRlcCircuit(params) {
  const V = parseFloat(params.V) || 0;
  const f = parseFloat(params.f) || 50; // default 50Hz
  const R = parseFloat(params.R) || 0;
  const L = parseFloat(params.L) || 0;
  const C = parseFloat(params.C) || 0;

  if (V <= 0 || R < 0 || L < 0 || C < 0 || (L === 0 && C === 0)) {
    return {
      success: false,
      error: 'Invalid AC circuit parameters (Voltage and Resistance must be > 0, L or C must be > 0)',
    };
  }

  const omega = 2 * Math.PI * f;
  
  // Reactances
  const X_L = L > 0 ? omega * L : 0;
  const X_C = C > 0 ? 1 / (omega * C) : 0;
  
  // Impedance
  const X_net = X_L - X_C;
  const Z = Math.sqrt(R * R + X_net * X_net);
  
  // Current
  const I = Z > 0 ? V / Z : 0;
  
  // Voltages
  const V_R = I * R;
  const V_L = I * X_L;
  const V_C = I * X_C;
  
  // Phase and Power Factor
  const phiRad = R > 0 ? Math.atan(X_net / R) : (X_net >= 0 ? Math.PI / 2 : -Math.PI / 2);
  const phiDeg = (phiRad * 180) / Math.PI;
  const pf = Math.cos(phiRad);
  const pfType = X_net > 0 ? 'Lagging' : (X_net < 0 ? 'Leading' : 'Unity');

  // Resonance (if both L and C exist)
  let f_r = 0;
  if (L > 0 && C > 0) {
    f_r = 1 / (2 * Math.PI * Math.sqrt(L * C));
  }

  const formatUnit = (val, symbol) => {
    if (val === 0) return `0 ${symbol}`;
    if (val < 1e-3) return `${(val * 1e6).toFixed(2)} μ${symbol}`;
    if (val < 1) return `${(val * 1e3).toFixed(2)} m${symbol}`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)} M${symbol}`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(2)} k${symbol}`;
    return `${val.toFixed(2)} ${symbol}`;
  };

  const results = {
    X_L: `${X_L.toFixed(2)} Ω`,
    X_C: `${X_C.toFixed(2)} Ω`,
    Z: `${Z.toFixed(2)} Ω`,
    I: `${I.toFixed(3)} A`,
    V_R: `${V_R.toFixed(2)} V`,
    V_L: `${V_L.toFixed(2)} V`,
    V_C: `${V_C.toFixed(2)} V`,
    pf: `${pf.toFixed(3)} (${pfType})`,
    phi: `${phiDeg.toFixed(2)}°`,
    f_r: f_r > 0 ? `${f_r.toFixed(2)} Hz` : 'N/A'
  };

  const given = {
    'Source Voltage (Vs)': `${V} V`,
    'Frequency (f)': `${f} Hz`,
    'Resistance (R)': `${R} Ω`,
  };
  if (L > 0) given['Inductance (L)'] = formatUnit(L, 'H');
  if (C > 0) given['Capacitance (C)'] = formatUnit(C, 'F');

  const calculations = [
    { step: '1. Calculate Angular Frequency (ω):', formula: 'ω = 2 * π * f', substitution: `ω = 2 * π * ${f}`, result: `${omega.toFixed(2)} rad/s` }
  ];

  if (L > 0) {
    calculations.push({ step: '2a. Calculate Inductive Reactance (X_L):', formula: 'X_L = ω * L', substitution: `X_L = ${omega.toFixed(2)} * ${L}`, result: `${X_L.toFixed(2)} Ω` });
  }
  if (C > 0) {
    calculations.push({ step: '2b. Calculate Capacitive Reactance (X_C):', formula: 'X_C = 1 / (ω * C)', substitution: `X_C = 1 / (${omega.toFixed(2)} * ${C})`, result: `${X_C.toFixed(2)} Ω` });
  }

  calculations.push(
    { step: '3. Calculate Total Impedance (Z):', formula: 'Z = √[R² + (X_L - X_C)²]', substitution: `Z = √[${R}² + (${X_L.toFixed(2)} - ${X_C.toFixed(2)})²]`, result: `${Z.toFixed(2)} Ω` },
    { step: '4. Calculate Loop Current (I):', formula: 'I = Vs / Z', substitution: `I = ${V} / ${Z.toFixed(2)}`, result: `${I.toFixed(3)} A` },
    { step: '5. Calculate Voltage Drops:', formula: 'V_R = I*R, V_L = I*X_L, V_C = I*X_C', substitution: `V_R = ${I.toFixed(3)}*${R}, V_L = ${I.toFixed(3)}*${X_L.toFixed(2)}, V_C = ${I.toFixed(3)}*${X_C.toFixed(2)}`, result: `Vr: ${V_R.toFixed(2)}V, Vl: ${V_L.toFixed(2)}V, Vc: ${V_C.toFixed(2)}V` },
    { step: '6. Calculate Power Factor:', formula: 'cos(θ) = R / Z', substitution: `cos(θ) = ${R} / ${Z.toFixed(2)}`, result: `${pf.toFixed(3)} (${pfType})` }
  );

  if (f_r > 0) {
    calculations.push({ step: '7. Calculate Resonant Frequency (f_r):', formula: 'f_r = 1 / (2 * π * √[L * C])', substitution: `f_r = 1 / (2 * π * √[${L} * ${C}])`, result: `${f_r.toFixed(2)} Hz` });
  }

  // Define diagram values overlay mappings
  const mappings = [
    { id: 'VS1', value: `${V} V, ${f} Hz` },
    { id: 'R1', value: `${R} Ω` }
  ];
  if (L > 0) mappings.push({ id: 'L1', value: formatUnit(L, 'H') });
  if (C > 0) mappings.push({ id: 'C1', value: formatUnit(C, 'F') });

  return {
    success: true,
    given,
    calculations,
    results,
    mappings,
    omittedComponents: {
      L1: L === 0,
      C1: C === 0,
      R1: R === 0
    }
  };
}

/**
 * Solve a Zener Voltage Regulator Circuit
 * @param {object} params - { Vin: number, Rs: number, Vz: number, Rl: number }
 */
export function solveZenerRegulator(params) {
  const Vin = parseFloat(params.Vin) || 0;
  const Rs = parseFloat(params.Rs) || 0;
  const Vz = parseFloat(params.Vz) || 0;
  const Rl = parseFloat(params.Rl) || 0;

  if (Vin <= 0 || Rs <= 0 || Vz <= 0 || Rl <= 0) {
    return {
      success: false,
      error: 'Invalid Zener Regulator parameters (All parameters must be > 0)',
    };
  }

  // Series Current
  const Is = (Vin - Vz) / Rs;
  // Load Current
  const IL = Vz / Rl;
  // Zener Current
  const Iz = Is - IL;

  const regulates = Iz >= 0;

  return {
    success: true,
    given: {
      'Input Voltage (Vin)': `${Vin} V`,
      'Series Resistance (Rs)': `${Rs} Ω`,
      'Zener Voltage (Vz)': `${Vz} V`,
      'Load Resistance (Rl)': `${Rl} Ω`
    },
    calculations: [
      { step: '1. Calculate Total Series Current (Is):', formula: 'Is = (Vin - Vz) / Rs', substitution: `Is = (${Vin} - ${Vz}) / ${Rs}`, result: `${Is.toFixed(4)} A` },
      { step: '2. Calculate Load Current (IL):', formula: 'IL = Vz / Rl', substitution: `IL = ${Vz} / ${Rl}`, result: `${IL.toFixed(4)} A` },
      { step: '3. Calculate Zener Current (Iz):', formula: 'Iz = Is - IL', substitution: `Iz = ${Is.toFixed(4)} - ${IL.toFixed(4)}`, result: `${Iz.toFixed(4)} A (${regulates ? 'Regulating' : 'OUT OF REGULATION'})` }
    ],
    results: {
      Is: `${Is.toFixed(4)} A`,
      IL: `${IL.toFixed(4)} A`,
      Iz: `${Iz.toFixed(4)} A`,
      status: regulates ? 'Successfully Regulating' : 'Out of Regulation (Iz < 0)'
    },
    mappings: [
      { id: 'Vin', value: `${Vin} V` },
      { id: 'Rs', value: `${Rs} Ω` },
      { id: 'Dz', value: `${Vz} V` },
      { id: 'Rl', value: `${Rl} Ω` }
    ]
  };
}

/**
 * Solve an Inverting Op-Amp Amplifier
 * @param {object} params - { Vin: number, R1: number, Rf: number }
 */
export function solveOpampInverting(params) {
  const Vin = parseFloat(params.Vin) || 0;
  const R1 = parseFloat(params.R1) || 0;
  const Rf = parseFloat(params.Rf) || 0;

  if (R1 <= 0 || Rf <= 0) {
    return {
      success: false,
      error: 'Invalid Inverting Op-Amp parameters (R1 and Rf must be > 0)',
    };
  }

  const Av = -Rf / R1;
  const Vout = Av * Vin;

  return {
    success: true,
    given: {
      'Input Voltage (Vin)': `${Vin} V`,
      'Input Resistance (R1)': `${R1} Ω`,
      'Feedback Resistance (Rf)': `${Rf} Ω`
    },
    calculations: [
      { step: '1. Calculate Closed-Loop Voltage Gain (Av):', formula: 'Av = -Rf / R1', substitution: `Av = -${Rf} / ${R1}`, result: `${Av.toFixed(2)}` },
      { step: '2. Calculate Output Voltage (Vout):', formula: 'Vout = Av * Vin', substitution: `Vout = ${Av.toFixed(2)} * ${Vin}`, result: `${Vout.toFixed(2)} V` }
    ],
    results: {
      Av: `${Av.toFixed(2)}`,
      Vout: `${Vout.toFixed(2)} V`
    },
    mappings: [
      { id: 'R1', value: `${R1} Ω` },
      { id: 'Rf', value: `${Rf} Ω` }
    ]
  };
}

/**
 * Solve a Non-Inverting Op-Amp Amplifier
 * @param {object} params - { Vin: number, R1: number, Rf: number }
 */
export function solveOpampNoninverting(params) {
  const Vin = parseFloat(params.Vin) || 0;
  const R1 = parseFloat(params.R1) || 0;
  const Rf = parseFloat(params.Rf) || 0;

  if (R1 <= 0 || Rf <= 0) {
    return {
      success: false,
      error: 'Invalid Non-Inverting Op-Amp parameters (R1 and Rf must be > 0)',
    };
  }

  const Av = 1 + Rf / R1;
  const Vout = Av * Vin;

  return {
    success: true,
    given: {
      'Input Voltage (Vin)': `${Vin} V`,
      'Input Resistance (R1)': `${R1} Ω`,
      'Feedback Resistance (Rf)': `${Rf} Ω`
    },
    calculations: [
      { step: '1. Calculate Closed-Loop Voltage Gain (Av):', formula: 'Av = 1 + Rf / R1', substitution: `Av = 1 + ${Rf} / ${R1}`, result: `${Av.toFixed(2)}` },
      { step: '2. Calculate Output Voltage (Vout):', formula: 'Vout = Av * Vin', substitution: `Vout = ${Av.toFixed(2)} * ${Vin}`, result: `${Vout.toFixed(2)} V` }
    ],
    results: {
      Av: `${Av.toFixed(2)}`,
      Vout: `${Vout.toFixed(2)} V`
    },
    mappings: [
      { id: 'R1', value: `${R1} Ω` },
      { id: 'Rf', value: `${Rf} Ω` }
    ]
  };
}

/**
 * Solve a Star-to-Delta or Delta-to-Star Conversion
 * @param {object} params - { R1, R2, R3 } for Star or { RAB, RBC, RCA } for Delta
 */
export function solveStarDelta(params) {
  // Star values
  const R1 = parseFloat(params.R1 || params.RA || params.Ra) || 0;
  const R2 = parseFloat(params.R2 || params.RB || params.Rb) || 0;
  const R3 = parseFloat(params.R3 || params.RC || params.Rc) || 0;
  
  // Delta values
  const RAB = parseFloat(params.RAB || params.Rab) || 0;
  const RBC = parseFloat(params.RBC || params.Rbc) || 0;
  const RCA = parseFloat(params.RCA || params.Rca) || 0;

  const formatFract = (num, denom) => {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const d = gcd(Math.round(num * 100), Math.round(denom * 100));
    const n_scaled = Math.round(num * 100) / d;
    const d_scaled = Math.round(denom * 100) / d;
    if (d_scaled === 1) return `${n_scaled}`;
    return `${n_scaled}/${d_scaled}`;
  };

  if (R1 > 0 && R2 > 0 && R3 > 0) {
    const termSum = R1 * R2 + R2 * R3 + R3 * R1;
    const rab = termSum / R3;
    const rbc = termSum / R1;
    const rca = termSum / R2;

    return {
      success: true,
      given: {
        'Star Resistance R1 (RA)': `${R1} Ω`,
        'Star Resistance R2 (RB)': `${R2} Ω`,
        'Star Resistance R3 (RC)': `${R3} Ω`,
      },
      calculations: [
        {
          step: '1. Calculate the sum of products of adjacent resistors:',
          formula: 'Sum = R1·R2 + R2·R3 + R3·R1',
          substitution: `${R1}·${R2} + ${R2}·${R3} + ${R3}·${R1}`,
          result: `${termSum} Ω²`
        },
        {
          step: '2. Calculate Delta Resistance RAB:',
          formula: 'RAB = (R1·R2 + R2·R3 + R3·R1) / R3',
          substitution: `${termSum} / ${R3}`,
          result: `${rab.toFixed(2)} Ω (or ${formatFract(termSum, R3)} Ω)`
        },
        {
          step: '3. Calculate Delta Resistance RBC:',
          formula: 'RBC = (R1·R2 + R2·R3 + R3·R1) / R1',
          substitution: `${termSum} / ${R1}`,
          result: `${rbc.toFixed(2)} Ω (or ${formatFract(termSum, R1)} Ω)`
        },
        {
          step: '4. Calculate Delta Resistance RCA:',
          formula: 'RCA = (R1·R2 + R2·R3 + R3·R1) / R2',
          substitution: `${termSum} / ${R2}`,
          result: `${rca.toFixed(2)} Ω (or ${formatFract(termSum, R2)} Ω)`
        }
      ],
      results: {
        RAB: `${rab.toFixed(2)} Ω`,
        RBC: `${rbc.toFixed(2)} Ω`,
        RCA: `${rca.toFixed(2)} Ω`
      },
      mappings: [
        { id: 'RA_S', value: `${R1} Ω` },
        { id: 'RB_S', value: `${R2} Ω` },
        { id: 'RC_S', value: `${R3} Ω` },
        { id: 'RAB_D', value: `${rab.toFixed(2)} Ω (or ${formatFract(termSum, R3)} Ω)` },
        { id: 'RBC_D', value: `${rbc.toFixed(2)} Ω (or ${formatFract(termSum, R1)} Ω)` },
        { id: 'RCA_D', value: `${rca.toFixed(2)} Ω (or ${formatFract(termSum, R2)} Ω)` }
      ]
    };
  } else if (RAB > 0 && RBC > 0 && RCA > 0) {
    const sumDelta = RAB + RBC + RCA;
    const r1 = (RAB * RCA) / sumDelta;
    const r2 = (RAB * RBC) / sumDelta;
    const r3 = (RBC * RCA) / sumDelta;

    return {
      success: true,
      given: {
        'Delta Resistance RAB': `${RAB} Ω`,
        'Delta Resistance RBC': `${RBC} Ω`,
        'Delta Resistance RCA': `${RCA} Ω`,
      },
      calculations: [
        {
          step: '1. Calculate the sum of all Delta resistances:',
          formula: 'Sum = RAB + RBC + RCA',
          substitution: `${RAB} + ${RBC} + ${RCA}`,
          result: `${sumDelta} Ω`
        },
        {
          step: '2. Calculate Star Resistance R1 (RA):',
          formula: 'R1 = (RAB · RCA) / Sum',
          substitution: `(${RAB} · ${RCA}) / ${sumDelta}`,
          result: `${r1.toFixed(2)} Ω (or ${formatFract(RAB * RCA, sumDelta)} Ω)`
        },
        {
          step: '3. Calculate Star Resistance R2 (RB):',
          formula: 'R2 = (RAB · RBC) / Sum',
          substitution: `(${RAB} · ${RBC}) / ${sumDelta}`,
          result: `${r2.toFixed(2)} Ω (or ${formatFract(RAB * RBC, sumDelta)} Ω)`
        },
        {
          step: '4. Calculate Star Resistance R3 (RC):',
          formula: 'R3 = (RBC · RCA) / Sum',
          substitution: `(${RBC} · ${RCA}) / ${sumDelta}`,
          result: `${r3.toFixed(2)} Ω (or ${formatFract(RBC * RCA, sumDelta)} Ω)`
        }
      ],
      results: {
        R1: `${r1.toFixed(2)} Ω`,
        R2: `${r2.toFixed(2)} Ω`,
        R3: `${r3.toFixed(2)} Ω`
      },
      mappings: [
        { id: 'RA_S', value: `${r1.toFixed(2)} Ω (or ${formatFract(RAB * RCA, sumDelta)} Ω)` },
        { id: 'RB_S', value: `${r2.toFixed(2)} Ω (or ${formatFract(RAB * RBC, sumDelta)} Ω)` },
        { id: 'RC_S', value: `${r3.toFixed(2)} Ω (or ${formatFract(RBC * RCA, sumDelta)} Ω)` },
        { id: 'RAB_D', value: `${RAB} Ω` },
        { id: 'RBC_D', value: `${RBC} Ω` },
        { id: 'RCA_D', value: `${RCA} Ω` }
      ]
    };
  }

  return {
    success: false,
    error: 'Invalid Star-Delta parameters. Provide either Star (R1, R2, R3) or Delta (RAB, RBC, RCA).'
  };
}

/**
 * Solve a Norton's Theorem Circuit
 * @param {object} params - { V1, R1, V2, R2, R3, R4, R5, RL }
 */
export function solveNortonsTheorem(params) {
  const V1 = getVal(params.V1, 15);
  const R1 = getVal(params.R1, 8);
  const V2 = getVal(params.V2, 5);
  const R2 = getVal(params.R2, 2);
  const R3 = getVal(params.R3, 2);
  const R4 = getVal(params.R4, 16);
  const R5 = getVal(params.R5, 10);
  const RL = getVal(params.RL, 3);

  if (R1 <= 0 || R2 <= 0 || R3 <= 0 || R4 <= 0 || R5 <= 0 || RL <= 0) {
    return {
      success: false,
      error: 'All resistances must be > 0'
    };
  }

  const R_45 = (R4 * R5) / (R4 + R5);

  const g1 = 1 / R3 + 1 / R1;
  const g2 = 1 / R1;
  const I1 = V1 / R3;
  const g3 = 1 / R1 + 1 / R_45 + 1 / R2;
  const I2 = V2 / R_45;

  const V_C = (I2 + g2 * I1 / g1) / (g3 - (g2 * g2) / g1);
  const I_sc = V_C / R2;

  const R_left = R1 + R3;
  const R_C_gnd = (R_left * R_45) / (R_left + R_45);
  const R_N = R2 + R_C_gnd;

  const I_L = I_sc * (R_N / (R_N + RL));

  const formatFract = (num, denom) => {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const d = gcd(Math.round(num * 100), Math.round(denom * 100));
    const n_scaled = Math.round(num * 100) / d;
    const d_scaled = Math.round(denom * 100) / d;
    if (d_scaled === 1) return `${n_scaled}`;
    return `${n_scaled}/${d_scaled}`;
  };

  return {
    success: true,
    given: {
      'Source V1': `${V1} V`,
      'Resistor R3': `${R3} Ω`,
      'Resistor R1': `${R1} Ω`,
      'Source V2': `${V2} V`,
      'Resistors R4, R5': `${R4} Ω, ${R5} Ω`,
      'Resistor R2': `${R2} Ω`,
      'Load RL': `${RL} Ω`
    },
    calculations: [
      {
        step: '1. Calculate equivalent parallel resistance of R4 and R5:',
        formula: 'R45 = (R4 · R5) / (R4 + R5)',
        substitution: `(${R4} · ${R5}) / (${R4} + ${R5})`,
        result: `${R_45.toFixed(3)} Ω (or ${formatFract(R4 * R5, R4 + R5)} Ω)`
      },
      {
        step: '2. Short-circuit terminals A-B and apply Nodal Analysis at node C:',
        formula: 'I_N = I_sc = V_C / R2',
        substitution: `Solving KCL equations with A-B shorted`,
        result: `V_C = ${V_C.toFixed(3)} V, I_sc = ${I_sc.toFixed(3)} A`
      },
      {
        step: '3. Calculate Norton Equivalent Resistance RN seen looking into terminals A-B:',
        formula: 'RN = R2 + [ (R1 + R3) || R45 ]',
        substitution: `${R2} + [ (${R1} + ${R3}) · ${R_45.toFixed(3)} / (${R1} + ${R3} + ${R_45.toFixed(3)}) ]`,
        result: `${R_N.toFixed(3)} Ω`
      },
      {
        step: '4. Calculate Load Current IL through RL using current division:',
        formula: 'IL = I_N · RN / (RN + RL)',
        substitution: `${I_sc.toFixed(3)} · ${R_N.toFixed(3)} / (${R_N.toFixed(3)} + ${RL})`,
        result: `${I_L.toFixed(3)} A`
      }
    ],
    results: {
      IN: `${I_sc.toFixed(3)} A`,
      RN: `${R_N.toFixed(3)} Ω`,
      IL: `${I_L.toFixed(3)} A`
    },
    mappings: [
      { id: 'V1', value: `${V1} V` },
      { id: 'R3', value: `${R3} Ω` },
      { id: 'R1', value: `${R1} Ω` },
      { id: 'V2', value: `${V2} V` },
      { id: 'R4', value: `${R4} Ω` },
      { id: 'R5', value: `${R5} Ω` },
      { id: 'R2', value: `${R2} Ω` },
      { id: 'RL', value: `${RL} Ω` },
      { id: 'IN_eq', value: `${I_sc.toFixed(3)} A` },
      { id: 'RN_eq', value: `${R_N.toFixed(2)} Ω` },
      { id: 'RL_eq', value: `${RL} Ω` }
    ]
  };
}

/**
 * Solve Source Transformation Circuit
 * @param {object} params - { V, rv } or { I, ri }
 */
export function solveSourceTransformation(params) {
  const V = parseFloat(params.V) || 0;
  const rv = parseFloat(params.rv || params.R || params.Rs) || 0;
  const I = parseFloat(params.I) || 0;
  const ri = parseFloat(params.ri || params.Rp) || 0;

  if (V > 0 && rv > 0) {
    const calculated_I = V / rv;
    const calculated_ri = rv;
    return {
      success: true,
      given: {
        'Voltage source V': `${V} V`,
        'Series Resistance rv': `${rv} Ω`
      },
      calculations: [
        {
          step: '1. Calculate equivalent current source (I):',
          formula: 'I = V / rv',
          substitution: `${V} / ${rv}`,
          result: `${calculated_I.toFixed(3)} A`
        },
        {
          step: '2. Determine parallel resistance (ri):',
          formula: 'ri = rv',
          substitution: `${rv}`,
          result: `${calculated_ri} Ω`
        }
      ],
      results: {
        I: `${calculated_I.toFixed(3)} A`,
        ri: `${calculated_ri} Ω`
      },
      mappings: [
        { id: 'V_A', value: `${V} V` },
        { id: 'RV_A', value: `${rv} Ω` },
        { id: 'I_B', value: `${calculated_I.toFixed(3)} A` },
        { id: 'RI_B', value: `${calculated_ri} Ω` }
      ]
    };
  } else if (I > 0 && ri > 0) {
    const calculated_V = I * ri;
    const calculated_rv = ri;
    return {
      success: true,
      given: {
        'Current source I': `${I} A`,
        'Parallel Resistance ri': `${ri} Ω`
      },
      calculations: [
        {
          step: '1. Calculate equivalent voltage source (V):',
          formula: 'V = I · ri',
          substitution: `${I} · ${ri}`,
          result: `${calculated_V.toFixed(2)} V`
        },
        {
          step: '2. Determine series resistance (rv):',
          formula: 'rv = ri',
          substitution: `${ri}`,
          result: `${calculated_rv} Ω`
        }
      ],
      results: {
        V: `${calculated_V.toFixed(2)} V`,
        rv: `${calculated_rv} Ω`
      },
      mappings: [
        { id: 'V_A', value: `${calculated_V.toFixed(2)} V` },
        { id: 'RV_A', value: `${calculated_rv} Ω` },
        { id: 'I_B', value: `${I} A` },
        { id: 'RI_B', value: `${ri} Ω` }
      ]
    };
  }

  return {
    success: false,
    error: 'Invalid Source Transformation parameters. Provide (V and rv) or (I and ri).'
  };
}

/**
 * Solve a Series RL AC Circuit
 * @param {object} params - { V, f, R, L }
 */
export function solveSeriesRlCircuit(params) {
  const V = parseFloat(params.V || params.Vs) || 0;
  const f = parseFloat(params.f) || 50;
  const R = parseFloat(params.R) || 0;
  const L = parseFloat(params.L) || 0;

  if (V <= 0 || R <= 0 || L <= 0) {
    return {
      success: false,
      error: 'Voltage, Resistance, and Inductance must be > 0'
    };
  }

  const omega = 2 * Math.PI * f;
  const XL = omega * L;
  const Z = Math.sqrt(R * R + XL * XL);
  const I = V / Z;
  const VR = I * R;
  const VL = I * XL;
  const phiRad = Math.atan(XL / R);
  const phiDeg = (phiRad * 180) / Math.PI;
  const pf = Math.cos(phiRad);
  const P = V * I * pf;

  return {
    success: true,
    given: {
      'Source Voltage (V)': `${V} V`,
      'Frequency (f)': `${f} Hz`,
      'Resistance (R)': `${R} Ω`,
      'Inductance (L)': `${L} H`
    },
    calculations: [
      {
        step: '1. Calculate angular frequency (ω):',
        formula: 'ω = 2 · π · f',
        substitution: `2 · π · ${f}`,
        result: `${omega.toFixed(2)} rad/s`
      },
      {
        step: '2. Calculate inductive reactance (XL):',
        formula: 'XL = ω · L',
        substitution: `${omega.toFixed(2)} · ${L}`,
        result: `${XL.toFixed(2)} Ω`
      },
      {
        step: '3. Calculate circuit impedance (Z):',
        formula: 'Z = √(R² + XL²)',
        substitution: `√(${R}² + ${XL.toFixed(2)}²)`,
        result: `${Z.toFixed(2)} Ω`
      },
      {
        step: '4. Calculate circuit current (I):',
        formula: 'I = V / Z',
        substitution: `${V} / ${Z.toFixed(2)}`,
        result: `${I.toFixed(3)} A`
      },
      {
        step: '5. Calculate power factor (cos φ):',
        formula: 'cos φ = R / Z',
        substitution: `${R} / ${Z.toFixed(2)}`,
        result: `${pf.toFixed(3)} (Lagging)`
      },
      {
        step: '6. Calculate total power consumed (P):',
        formula: 'P = V · I · cos φ',
        substitution: `${V} · ${I.toFixed(3)} · ${pf.toFixed(3)}`,
        result: `${P.toFixed(2)} W`
      }
    ],
    results: {
      XL: `${XL.toFixed(2)} Ω`,
      Z: `${Z.toFixed(2)} Ω`,
      I: `${I.toFixed(3)} A`,
      pf: `${pf.toFixed(3)} (Lagging)`,
      VR: `${VR.toFixed(2)} V`,
      VL: `${VL.toFixed(2)} V`,
      P: `${P.toFixed(2)} W`
    },
    mappings: [
      { id: 'VS', value: `${V} V, ${f} Hz` },
      { id: 'R', value: `${R} Ω` },
      { id: 'L', value: `${L} H` }
    ]
  };
}

/**
 * Solve a Series RLC Resonance Circuit
 * @param {object} params - { V, R, L, C }
 */
export function solveSeriesRlcResonance(params) {
  const V = parseFloat(params.V || params.Vs) || 0;
  const R = parseFloat(params.R) || 0;
  const L = parseFloat(params.L) || 0;
  const C = parseFloat(params.C) || 0;

  if (R <= 0 || L <= 0 || C <= 0) {
    return {
      success: false,
      error: 'R, L, and C must be > 0'
    };
  }

  const fr = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const Q = (1 / R) * Math.sqrt(L / C);
  const BW = fr / Q;

  return {
    success: true,
    given: {
      'Source Voltage (V)': V > 0 ? `${V} V` : 'N/A',
      'Resistance (R)': `${R} Ω`,
      'Inductance (L)': `${L} H`,
      'Capacitance (C)': `${C} F`
    },
    calculations: [
      {
        step: '1. Calculate Resonant Frequency (fr):',
        formula: 'fr = 1 / (2·π·√(L·C))',
        substitution: `1 / (2·π·√(${L} · ${C}))`,
        result: `${fr.toFixed(2)} Hz`
      },
      {
        step: '2. Calculate Quality Factor (Q):',
        formula: 'Q = (1/R) · √(L/C)',
        substitution: `(1/${R}) · √(${L} / ${C})`,
        result: `${Q.toFixed(2)}`
      },
      {
        step: '3. Calculate Bandwidth (BW):',
        formula: 'BW = fr / Q',
        substitution: `${fr.toFixed(2)} / ${Q.toFixed(2)}`,
        result: `${BW.toFixed(2)} Hz`
      }
    ],
    results: {
      fr: `${fr.toFixed(2)} Hz`,
      Q: `${Q.toFixed(2)}`,
      BW: `${BW.toFixed(2)} Hz`
    },
    mappings: [
      { id: 'VS', value: V > 0 ? `${V} V` : 'Vs' },
      { id: 'R', value: `${R} Ω` },
      { id: 'L', value: `${L} H` },
      { id: 'C', value: `${C} F` }
    ]
  };
}

/**
 * Solve a Superposition Theorem Circuit
 * @param {object} params - { V1, R1, R2, R3, V2 }
 */
export function solveSuperposition(params) {
  const V1 = getVal(params.V1, 20);
  const R1 = getVal(params.R1, 4);
  const R2 = getVal(params.R2, 6);
  const R3 = getVal(params.R3, 10);
  const V2 = getVal(params.V2, 10);

  if (R1 <= 0 || R2 <= 0 || R3 <= 0) {
    return {
      success: false,
      error: 'All resistances must be > 0'
    };
  }

  const g_total = 1 / R1 + 1 / R2 + 1 / R3;
  const V_node = (V1 / R1 + V2 / R2) / g_total;
  const I3 = V_node / R3;

  const V_node_1 = (V1 / R1) / g_total;
  const I3_1 = V_node_1 / R3;

  const V_node_2 = (V2 / R2) / g_total;
  const I3_2 = V_node_2 / R3;

  return {
    success: true,
    given: {
      'Source V1': `${V1} V`,
      'Resistor R1': `${R1} Ω`,
      'Resistor R2': `${R2} Ω`,
      'Resistor R3': `${R3} Ω`,
      'Source V2': `${V2} V`
    },
    calculations: [
      {
        step: '1. Calculate Node Conductance sum:',
        formula: 'G = 1/R1 + 1/R2 + 1/R3',
        substitution: `1/${R1} + 1/${R2} + 1/${R3}`,
        result: `${g_total.toFixed(4)} S`
      },
      {
        step: '2. Case 1: Active V1 alone (V2 shorted):',
        formula: 'I3\' = [V1 / R1] / [G · R3]',
        substitution: `[${V1} / ${R1}] / [${g_total.toFixed(4)} · ${R3}]`,
        result: `${I3_1.toFixed(3)} A`
      },
      {
        step: '3. Case 2: Active V2 alone (V1 shorted):',
        formula: 'I3\'\' = [V2 / R2] / [G · R3]',
        substitution: `[${V2} / ${R2}] / [${g_total.toFixed(4)} · ${R3}]`,
        result: `${I3_2.toFixed(3)} A`
      },
      {
        step: '4. Superpose current contributions in R3:',
        formula: 'I3 = I3\' + I3\'\'',
        substitution: `${I3_1.toFixed(3)} + ${I3_2.toFixed(3)}`,
        result: `${I3.toFixed(3)} A`
      }
    ],
    results: {
      I3: `${I3.toFixed(3)} A`,
      I3_prime: `${I3_1.toFixed(3)} A`,
      I3_double_prime: `${I3_2.toFixed(3)} A`
    },
    mappings: [
      { id: 'v1', value: `${V1} V` },
      { id: 'r1', value: `${R1} Ω` },
      { id: 'r2', value: `${R2} Ω` },
      { id: 'r3', value: `${R3} Ω` },
      { id: 'v2', value: `${V2} V` }
    ]
  };
}

/**
 * Solve a Thevenin's Equivalent Circuit
 * @param {object} params - { Vth, Rth, RL }
 */
export function solveThevenin(params) {
  const Vth = parseFloat(params.Vth || params.Vopen) || 0;
  const Rth = parseFloat(params.Rth || params.Req) || 0;
  const RL = parseFloat(params.RL || params.Rload) || 0;

  if (Vth <= 0 || Rth <= 0 || RL <= 0) {
    return {
      success: false,
      error: 'Vth, Rth, and RL must be > 0'
    };
  }

  const IL = Vth / (Rth + RL);
  const VL = IL * RL;

  return {
    success: true,
    given: {
      'Thevenin Voltage (Vth)': `${Vth} V`,
      'Thevenin Resistance (Rth)': `${Rth} Ω`,
      'Load Resistance (RL)': `${RL} Ω`
    },
    calculations: [
      {
        step: '1. Calculate Load Current (IL):',
        formula: 'IL = Vth / (Rth + RL)',
        substitution: `${Vth} / (${Rth} + ${RL})`,
        result: `${IL.toFixed(3)} A`
      },
      {
        step: '2. Calculate Load Voltage (VL):',
        formula: 'VL = IL · RL',
        substitution: `${IL.toFixed(3)} · ${RL}`,
        result: `${VL.toFixed(2)} V`
      }
    ],
    results: {
      IL: `${IL.toFixed(3)} A`,
      VL: `${VL.toFixed(2)} V`
    },
    mappings: [
      { id: 'Vth', value: `${Vth} V` },
      { id: 'Rth', value: `${Rth} Ω` },
      { id: 'RL', value: `${RL} Ω` }
    ]
  };
}

