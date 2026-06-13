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

  const formatVal = (val, num, denom) => {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const d = gcd(Math.round(num * 100), Math.round(denom * 100));
    const d_scaled = Math.round(denom * 100) / d;
    const n_scaled = Math.round(num * 100) / d;
    if (d_scaled === 1) return `${n_scaled} Ω`;
    return `${val.toFixed(2)} Ω (or ${n_scaled}/${d_scaled} Ω)`;
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
          result: formatVal(rab, termSum, R3)
        },
        {
          step: '3. Calculate Delta Resistance RBC:',
          formula: 'RBC = (R1·R2 + R2·R3 + R3·R1) / R1',
          substitution: `${termSum} / ${R1}`,
          result: formatVal(rbc, termSum, R1)
        },
        {
          step: '4. Calculate Delta Resistance RCA:',
          formula: 'RCA = (R1·R2 + R2·R3 + R3·R1) / R2',
          substitution: `${termSum} / ${R2}`,
          result: formatVal(rca, termSum, R2)
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
        { id: 'RAB_D', value: formatVal(rab, termSum, R3) },
        { id: 'RBC_D', value: formatVal(rbc, termSum, R1) },
        { id: 'RCA_D', value: formatVal(rca, termSum, R2) }
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
          result: formatVal(r1, RAB * RCA, sumDelta)
        },
        {
          step: '3. Calculate Star Resistance R2 (RB):',
          formula: 'R2 = (RAB · RBC) / Sum',
          substitution: `(${RAB} · ${RBC}) / ${sumDelta}`,
          result: formatVal(r2, RAB * RBC, sumDelta)
        },
        {
          step: '4. Calculate Star Resistance R3 (RC):',
          formula: 'R3 = (RBC · RCA) / Sum',
          substitution: `(${RBC} · ${RCA}) / ${sumDelta}`,
          result: formatVal(r3, RBC * RCA, sumDelta)
        }
      ],
      results: {
        R1: `${r1.toFixed(2)} Ω`,
        R2: `${r2.toFixed(2)} Ω`,
        R3: `${r3.toFixed(2)} Ω`
      },
      mappings: [
        { id: 'RA_S', value: formatVal(r1, RAB * RCA, sumDelta) },
        { id: 'RB_S', value: formatVal(r2, RAB * RBC, sumDelta) },
        { id: 'RC_S', value: formatVal(r3, RBC * RCA, sumDelta) },
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

/**
 * Solve a General Series RLC Circuit
 * @param {object} params - { V, f, R, L, C }
 */
export function solveGeneralSeriesCircuit(params) {
  const V = parseFloat(params.V) || 0;
  const f = parseFloat(params.f) !== undefined ? parseFloat(params.f) : 50;

  let R = 0;
  let L = 0;
  let C_inv_sum = 0;
  let hasC = false;

  const given = {
    'Source Voltage (V)': `${V} V`,
    'Frequency (f)': f > 0 ? `${f} Hz` : '0 Hz (DC)'
  };

  const mappings = [
    { id: 'VS', value: f > 0 ? `${V} V, ${f} Hz` : `${V} V (DC)` }
  ];

  const formatUnit = (val, symbol) => {
    if (val === 0) return `0 ${symbol}`;
    if (val === Infinity) return `∞ ${symbol}`;
    let num = val;
    let prefix = '';
    if (val < 1e-3) { num = val * 1e6; prefix = 'μ'; }
    else if (val < 1) { num = val * 1e3; prefix = 'm'; }
    else if (val >= 1e6) { num = val / 1e6; prefix = 'M'; }
    else if (val >= 1e3) { num = val / 1e3; prefix = 'k'; }
    const str = Number(num.toFixed(4)).toString();
    return `${str} ${prefix}${symbol}`;
  };

  if (Array.isArray(params.components) && params.components.length > 0) {
    params.components.forEach(comp => {
      let unit = 'Ω';
      if (comp.type === 'resistor') {
        R += comp.value;
      } else if (comp.type === 'inductor') {
        L += comp.value;
        unit = 'H';
      } else if (comp.type === 'capacitor') {
        unit = 'F';
        if (comp.value > 0) {
          C_inv_sum += 1 / comp.value;
          hasC = true;
        }
      }
      given[comp.label || comp.id] = comp.rawValue || formatUnit(comp.value, unit);
      mappings.push({ id: comp.id, value: comp.rawValue || formatUnit(comp.value, unit) });
    });
  } else {
    R = parseFloat(params.R) || 0;
    L = parseFloat(params.L) || 0;
    const rawC = parseFloat(params.C) || 0;
    if (rawC > 0) {
      C_inv_sum = 1 / rawC;
      hasC = true;
    }
    if (R > 0) { given['Resistance (R)'] = formatUnit(R, 'Ω'); mappings.push({ id: 'R', value: formatUnit(R, 'Ω') }); }
    if (L > 0) { given['Inductance (L)'] = formatUnit(L, 'H'); mappings.push({ id: 'L', value: formatUnit(L, 'H') }); }
    if (rawC > 0) { given['Capacitance (C)'] = formatUnit(rawC, 'F'); mappings.push({ id: 'C', value: formatUnit(rawC, 'F') }); }
  }

  const C = hasC ? 1 / C_inv_sum : 0;

  if (V <= 0) {
    return {
      success: false,
      error: 'Invalid source voltage (must be > 0)',
    };
  }

  if (R < 0 || L < 0 || C < 0 || (R === 0 && L === 0 && C === 0)) {
    return {
      success: false,
      error: 'At least one component (R, L, or C) must be greater than 0',
    };
  }

  const isAc = f > 0;
  const omega = isAc ? 2 * Math.PI * f : 0;

  const X_L = (L > 0 && isAc) ? omega * L : 0;
  const X_C = (C > 0 && isAc) ? 1 / (omega * C) : (C > 0 ? Infinity : 0);

  const X_net = X_L - X_C;

  let Z, I, V_R = 0, V_L = 0, V_C = 0, phiRad = 0, phiDeg = 0, pf = 1, pfType = 'Unity';

  if (C > 0 && !isAc) {
    Z = Infinity;
    I = 0;
    V_R = 0;
    V_L = 0;
    V_C = V;
    pf = 0;
    pfType = 'Leading';
  } else {
    Z = Math.sqrt(R * R + X_net * X_net);
    I = Z > 0 ? V / Z : 0;
    V_R = I * R;
    V_L = I * X_L;
    V_C = I * X_C;

    if (Z > 0) {
      phiRad = R > 0 ? Math.atan(X_net / R) : (X_net >= 0 ? Math.PI / 2 : -Math.PI / 2);
      phiDeg = (phiRad * 180) / Math.PI;
      pf = Math.cos(phiRad);
      pfType = X_net > 0 ? 'Lagging' : (X_net < 0 ? 'Leading' : 'Unity');
    }
  }

  let f_r = 0;
  if (L > 0 && C > 0) {
    f_r = 1 / (2 * Math.PI * Math.sqrt(L * C));
  }

  const calculations = [];
  if (isAc) {
    calculations.push({
      step: '1. Calculate Angular Frequency (ω):',
      formula: 'ω = 2 · π · f',
      substitution: `ω = 2 · π · ${f}`,
      result: `${omega.toFixed(2)} rad/s`
    });
    if (L > 0) {
      calculations.push({
        step: '2a. Calculate Inductive Reactance (X_L):',
        formula: 'X_L = ω · L',
        substitution: `X_L = ${omega.toFixed(2)} · ${L}`,
        result: `${X_L.toFixed(2)} Ω`
      });
    }
    if (C > 0) {
      calculations.push({
        step: '2b. Calculate Capacitive Reactance (X_C):',
        formula: 'X_C = 1 / (ω · C)',
        substitution: `X_C = 1 / (${omega.toFixed(2)} · ${C})`,
        result: `${X_C.toFixed(2)} Ω`
      });
    }
    calculations.push({
      step: '3. Calculate Total Impedance (Z):',
      formula: 'Z = √[R² + (X_L - X_C)²]',
      substitution: `Z = √[${R}² + (${X_L.toFixed(2)} - ${X_C.toFixed(2)})²]`,
      result: `${Z.toFixed(2)} Ω`
    });
    calculations.push({
      step: '4. Calculate Total Current (I):',
      formula: 'I = V / Z',
      substitution: `I = ${V} / ${Z.toFixed(2)}`,
      result: `${I.toFixed(3)} A`
    });
  } else {
    if (C > 0) {
      calculations.push({
        step: '1. Analyze steady-state capacitor behavior under DC:',
        formula: 'X_C = 1 / (2 · π · 0 · C) = ∞',
        substitution: `Capacitor acts as open circuit`,
        result: 'Z = ∞ Ω, I = 0 A'
      });
    } else {
      calculations.push({
        step: '1. Calculate DC Resistance (Z = R):',
        formula: 'Z = R',
        substitution: `Z = ${R}`,
        result: `${R} Ω`
      });
      calculations.push({
        step: '2. Calculate Current (I):',
        formula: 'I = V / R',
        substitution: `I = ${V} / ${R}`,
        result: `${I.toFixed(3)} A`
      });
    }
  }

  calculations.push({
    step: '5. Calculate Voltage Drops across components:',
    formula: 'V_R = I·R, V_L = I·X_L, V_C = I·X_C',
    substitution: `V_R = ${I.toFixed(3)}·${R}, V_L = ${I.toFixed(3)}·${X_L.toFixed(2)}, V_C = ${I.toFixed(3)}·${X_C.toFixed(2)}`,
    result: `V_R = ${V_R.toFixed(2)} V, V_L = ${V_L.toFixed(2)} V, V_C = ${V_C.toFixed(2)} V`
  });

  calculations.push({
    step: '6. Calculate Power Factor and Phase Angle:',
    formula: 'cos(θ) = R / Z, θ = atan(X_net / R)',
    substitution: `cos(θ) = ${R} / ${Z === Infinity ? '∞' : Z.toFixed(2)}`,
    result: `pf = ${pf.toFixed(3)} (${pfType}), θ = ${phiDeg.toFixed(2)}°`
  });

  if (f_r > 0) {
    calculations.push({
      step: '7. Calculate Resonant Frequency (f_r):',
      formula: 'f_r = 1 / (2 · π · √[L · C])',
      substitution: `f_r = 1 / (2 · π · √[${L} · ${C}])`,
      result: `${f_r.toFixed(2)} Hz`
    });
  }

  const results = {
    Z: Z === Infinity ? '∞ Ω' : `${Z.toFixed(2)} Ω`,
    I: `${I.toFixed(3)} A`,
    V_R: `${V_R.toFixed(2)} V`,
    V_L: `${V_L.toFixed(2)} V`,
    V_C: `${V_C.toFixed(2)} V`,
    pf: `${pf.toFixed(3)} (${pfType})`,
    phi: `${phiDeg.toFixed(2)}°`,
  };
  if (isAc) {
    if (L > 0) results.X_L = `${X_L.toFixed(2)} Ω`;
    if (C > 0) results.X_C = `${X_C.toFixed(2)} Ω`;
    if (f_r > 0) results.f_r = `${f_r.toFixed(2)} Hz`;
  }

  return {
    success: true,
    given,
    calculations,
    results,
    mappings
  };
}

export function solveGeneralParallelCircuit(params) {
  const V = parseFloat(params.V) || 0;
  const f = parseFloat(params.f) !== undefined ? parseFloat(params.f) : 50;

  let R_inv_sum = 0;
  let L_inv_sum = 0;
  let C = 0;
  let hasR = false;
  let hasL = false;

  const given = {
    'Source Voltage (V)': `${V} V`,
    'Frequency (f)': f > 0 ? `${f} Hz` : '0 Hz (DC)'
  };

  const mappings = [
    { id: 'VS', value: f > 0 ? `${V} V, ${f} Hz` : `${V} V (DC)` }
  ];

  const formatUnit = (val, symbol) => {
    if (val === 0) return `0 ${symbol}`;
    if (val === Infinity) return `∞ ${symbol}`;
    let num = val;
    let prefix = '';
    if (val < 1e-3) { num = val * 1e6; prefix = 'μ'; }
    else if (val < 1) { num = val * 1e3; prefix = 'm'; }
    else if (val >= 1e6) { num = val / 1e6; prefix = 'M'; }
    else if (val >= 1e3) { num = val / 1e3; prefix = 'k'; }
    const str = Number(num.toFixed(4)).toString();
    return `${str} ${prefix}${symbol}`;
  };

  if (Array.isArray(params.components) && params.components.length > 0) {
    params.components.forEach(comp => {
      let unit = 'Ω';
      if (comp.type === 'resistor') {
        if (comp.value > 0) {
          R_inv_sum += 1 / comp.value;
          hasR = true;
        }
      } else if (comp.type === 'inductor') {
        unit = 'H';
        if (comp.value > 0) {
          L_inv_sum += 1 / comp.value;
          hasL = true;
        }
      } else if (comp.type === 'capacitor') {
        unit = 'F';
        C += comp.value;
      }
      given[comp.label || comp.id] = comp.rawValue || formatUnit(comp.value, unit);
      mappings.push({ id: comp.id, value: comp.rawValue || formatUnit(comp.value, unit) });
    });
  } else {
    const rawR = parseFloat(params.R) || 0;
    const rawL = parseFloat(params.L) || 0;
    C = parseFloat(params.C) || 0;
    if (rawR > 0) { R_inv_sum = 1 / rawR; hasR = true; given['Resistance (R)'] = formatUnit(rawR, 'Ω'); mappings.push({ id: 'R', value: formatUnit(rawR, 'Ω') }); }
    if (rawL > 0) { L_inv_sum = 1 / rawL; hasL = true; given['Inductance (L)'] = formatUnit(rawL, 'H'); mappings.push({ id: 'L', value: formatUnit(rawL, 'H') }); }
    if (C > 0) { given['Capacitance (C)'] = formatUnit(C, 'F'); mappings.push({ id: 'C', value: formatUnit(C, 'F') }); }
  }

  const R = hasR ? 1 / R_inv_sum : 0;
  const L = hasL ? 1 / L_inv_sum : 0;

  if (V <= 0) {
    return {
      success: false,
      error: 'Invalid source voltage (must be > 0)',
    };
  }

  if ((!hasR && !hasL && C <= 0) || (R === 0 && L === 0 && C === 0)) {
    return {
      success: false,
      error: 'At least one component (R, L, or C) must be greater than 0',
    };
  }

  const isAc = f > 0;
  const omega = isAc ? 2 * Math.PI * f : 0;

  const X_L = (L > 0 && isAc) ? omega * L : 0;
  const X_C = (C > 0 && isAc) ? 1 / (omega * C) : (C > 0 ? Infinity : 0);

  const G = R > 0 ? 1 / R : 0;
  const B_L = (L > 0 && isAc) ? 1 / X_L : 0;
  const B_C = (C > 0 && isAc) ? 1 / X_C : 0;
  const B = B_C - B_L;

  let Y, Z, I, I_R = 0, I_L = 0, I_C = 0, phiRad = 0, phiDeg = 0, pf = 1, pfType = 'Unity';

  if (!isAc) {
    if (L > 0) {
      Z = 0;
      I = Infinity;
      I_R = R > 0 ? V / R : 0;
      I_L = Infinity;
      I_C = 0;
      pf = 1;
      pfType = 'Unity';
    } else if (C > 0) {
      Z = R > 0 ? R : Infinity;
      I = R > 0 ? V / R : 0;
      I_R = I;
      I_L = 0;
      I_C = 0;
      pf = 1;
      pfType = 'Unity';
    } else {
      Z = R;
      I = V / R;
      I_R = I;
      I_L = 0;
      I_C = 0;
    }
  } else {
    Y = Math.sqrt(G * G + B * B);
    Z = Y > 0 ? 1 / Y : Infinity;
    I = V * Y;
    I_R = V * G;
    I_L = B_L > 0 ? V * B_L : 0;
    I_C = V * B_C;

    if (Y > 0) {
      phiRad = G > 0 ? Math.atan(B / G) : (B >= 0 ? Math.PI / 2 : -Math.PI / 2);
      phiDeg = (phiRad * 180) / Math.PI;
      pf = Math.cos(phiRad);
      pfType = B > 0 ? 'Leading' : (B < 0 ? 'Lagging' : 'Unity');
    }
  }

  let f_r = 0;
  if (L > 0 && C > 0) {
    f_r = 1 / (2 * Math.PI * Math.sqrt(L * C));
  }

  const calculations = [];
  if (isAc) {
    calculations.push({
      step: '1. Calculate Conductance (G) and Susceptances (B_L, B_C):',
      formula: 'G = 1/R, B_L = 1/(ω·L), B_C = ω·C',
      substitution: `G = 1/${R || '∞'}, B_L = 1/(${omega.toFixed(1)}·${L || '0'}), B_C = ${omega.toFixed(1)}·${C}`,
      result: `G = ${G.toFixed(4)} S, B_L = ${B_L.toFixed(4)} S, B_C = ${B_C.toFixed(4)} S`
    });
    calculations.push({
      step: '2. Calculate Total Admittance (Y):',
      formula: 'Y = √[G² + (B_C - B_L)²]',
      substitution: `Y = √[${G.toFixed(4)}² + (${B_C.toFixed(4)} - ${B_L.toFixed(4)})²]`,
      result: `${Y.toFixed(4)} S`
    });
    calculations.push({
      step: '3. Calculate Total Impedance (Z):',
      formula: 'Z = 1 / Y',
      substitution: `Z = 1 / ${Y.toFixed(4)}`,
      result: `${Z.toFixed(2)} Ω`
    });
    calculations.push({
      step: '4. Calculate Branch Currents and Total Current (I):',
      formula: 'I_R = V·G, I_L = V·B_L, I_C = V·B_C, I = V·Y',
      substitution: `I_R = ${V}·${G.toFixed(4)}, I_L = ${V}·${B_L.toFixed(4)}, I_C = ${V}·${B_C.toFixed(4)}`,
      result: `I_R = ${I_R.toFixed(3)} A, I_L = ${I_L.toFixed(3)} A, I_C = ${I_C.toFixed(3)} A, Total I = ${I.toFixed(3)} A`
    });
  } else {
    calculations.push({
      step: '1. Calculate Current:',
      formula: 'I = V / R',
      substitution: `I = ${V} / ${R}`,
      result: `${I.toFixed(3)} A`
    });
  }

  calculations.push({
    step: '5. Calculate Power Factor and Phase Angle:',
    formula: 'cos(θ) = G / Y, θ = atan(B / G)',
    substitution: `cos(θ) = ${G.toFixed(4)} / ${Y === undefined ? '0' : Y.toFixed(4)}`,
    result: `pf = ${pf.toFixed(3)} (${pfType}), θ = ${phiDeg.toFixed(2)}°`
  });

  if (f_r > 0) {
    calculations.push({
      step: '6. Calculate Resonant Frequency (f_r):',
      formula: 'f_r = 1 / (2 · π · √[L · C])',
      substitution: `f_r = 1 / (2 · π · √[${L} · ${C}])`,
      result: `${f_r.toFixed(2)} Hz`
    });
  }

  const results = {
    Y: Y === undefined ? 'N/A' : `${Y.toFixed(4)} S`,
    Z: Z === Infinity ? '∞ Ω' : `${Z.toFixed(2)} Ω`,
    I: I === Infinity ? '∞ A' : `${I.toFixed(3)} A`,
    I_R: `${I_R.toFixed(3)} A`,
    I_L: I_L === Infinity ? '∞ A' : `${I_L.toFixed(3)} A`,
    I_C: `${I_C.toFixed(3)} A`,
    pf: `${pf.toFixed(3)} (${pfType})`,
    phi: `${phiDeg.toFixed(2)}°`,
  };
  if (isAc) {
    if (L > 0) results.X_L = `${X_L.toFixed(2)} Ω`;
    if (C > 0) results.X_C = `${X_C.toFixed(2)} Ω`;
    if (f_r > 0) results.f_r = `${f_r.toFixed(2)} Hz`;
  }

  return {
    success: true,
    given,
    calculations,
    results,
    mappings
  };
}

export function solveStarConnection(params) {
  const V = parseFloat(params.V) || 400; // Line voltage
  const f = parseFloat(params.f) !== undefined ? parseFloat(params.f) : 50;
  const R = parseFloat(params.R) !== undefined ? parseFloat(params.R) : 10;
  
  let XL = parseFloat(params.XL) !== undefined ? parseFloat(params.XL) : 0;
  const L = parseFloat(params.L) || 0;
  
  const isAc = f > 0;
  const omega = isAc ? 2 * Math.PI * f : 0;

  if (XL === 0 && L > 0 && isAc) {
    XL = omega * L;
  }

  const Z_ph = Math.sqrt(R * R + XL * XL);
  const V_ph = V / Math.sqrt(3);
  const I_ph = Z_ph > 0 ? V_ph / Z_ph : 0;
  const I_L = I_ph; // For star connection, Line Current = Phase Current

  const pf = Z_ph > 0 ? R / Z_ph : 1;
  const pfType = XL > 0 ? 'Lagging' : 'Unity';
  const thetaDeg = Math.acos(pf) * 180 / Math.PI;

  const P = Math.sqrt(3) * V * I_L * pf; // Active power in Watts

  const given = {
    'Line Voltage (V_L)': `${V} V`,
    'Frequency (f)': isAc ? `${f} Hz` : '0 Hz (DC)',
    'Coil Resistance (R)': `${R} Ω`,
    'Coil Reactance (X_L)': `${XL.toFixed(2)} Ω`
  };

  const calculations = [
    {
      step: '1. Calculate Phase Voltage (V_ph):',
      formula: 'V_ph = V_line / √3',
      substitution: `V_ph = ${V} / √3`,
      result: `${V_ph.toFixed(2)} V`
    },
    {
      step: '2. Calculate Phase Impedance (Z_ph):',
      formula: 'Z_ph = √[R² + X_L²]',
      substitution: `Z_ph = √[${R}² + ${XL.toFixed(2)}²]`,
      result: `${Z_ph.toFixed(2)} Ω`
    },
    {
      step: '3. Calculate Phase Current (I_ph):',
      formula: 'I_ph = V_ph / Z_ph',
      substitution: `I_ph = ${V_ph.toFixed(2)} / ${Z_ph.toFixed(2)}`,
      result: `${I_ph.toFixed(3)} A`
    },
    {
      step: '4. Determine Line Current (I_L) for Star Connection:',
      formula: 'I_L = I_ph',
      substitution: `I_L = ${I_ph.toFixed(3)} A`,
      result: `${I_L.toFixed(3)} A`
    },
    {
      step: '5. Calculate Power Factor (pf):',
      formula: 'pf = R / Z_ph',
      substitution: `pf = ${R} / ${Z_ph.toFixed(2)}`,
      result: `${pf.toFixed(3)} (${pfType})`
    },
    {
      step: '6. Calculate Total Active Power (P):',
      formula: 'P = √3 · V_line · I_line · pf',
      substitution: `P = √3 · ${V} · ${I_L.toFixed(3)} · ${pf.toFixed(3)}`,
      result: `${(P / 1000).toFixed(3)} kW`
    }
  ];

  return {
    success: true,
    given,
    calculations,
    results: {
      V_ph: `${V_ph.toFixed(2)} V`,
      Z_ph: `${Z_ph.toFixed(2)} Ω`,
      I_ph: `${I_ph.toFixed(3)} A`,
      I_L: `${I_L.toFixed(3)} A`,
      pf: `${pf.toFixed(3)} (${pfType})`,
      phi: `${thetaDeg.toFixed(2)}°`,
      P: `${(P / 1000).toFixed(3)} kW`
    },
    mappings: [
      { id: 'RA', value: `${R} Ω` },
      { id: 'LA', value: `${XL.toFixed(1)} Ω` },
      { id: 'RB', value: `${R} Ω` },
      { id: 'LB', value: `${XL.toFixed(1)} Ω` },
      { id: 'RC', value: `${R} Ω` },
      { id: 'LC', value: `${XL.toFixed(1)} Ω` }
    ]
  };
}

class Complex {
  constructor(r, i = 0) {
    this.r = r;
    this.i = i;
  }
  add(other) {
    const o = typeof other === 'number' ? new Complex(other) : other;
    return new Complex(this.r + o.r, this.i + o.i);
  }
  sub(other) {
    const o = typeof other === 'number' ? new Complex(other) : other;
    return new Complex(this.r - o.r, this.i - o.i);
  }
  mul(other) {
    const o = typeof other === 'number' ? new Complex(other) : other;
    return new Complex(this.r * o.r - this.i * o.i, this.r * o.i + this.i * o.r);
  }
  div(other) {
    const o = typeof other === 'number' ? new Complex(other) : other;
    const denom = o.r * o.r + o.i * o.i;
    if (denom === 0) throw new Error('Complex division by zero');
    return new Complex(
      (this.r * o.r + this.i * o.i) / denom,
      (this.i * o.r - this.r * o.i) / denom
    );
  }
  inv() {
    const denom = this.r * this.r + this.i * this.i;
    if (denom === 0) throw new Error('Complex division by zero');
    return new Complex(this.r / denom, -this.i / denom);
  }
  mag() {
    return Math.sqrt(this.r * this.r + this.i * this.i);
  }
  angle() {
    return Math.atan2(this.i, this.r);
  }
}

export function solveDeltaConnection(params) {
  const V = parseFloat(params.V) || 400; 
  const f = parseFloat(params.f) !== undefined ? parseFloat(params.f) : 50;
  const R = parseFloat(params.R) !== undefined ? parseFloat(params.R) : 12;
  
  let XL = parseFloat(params.XL) !== undefined ? parseFloat(params.XL) : 0;
  const L = parseFloat(params.L) || 0;
  
  const isAc = f > 0;
  const omega = isAc ? 2 * Math.PI * f : 0;

  if (XL === 0 && L > 0 && isAc) {
    XL = omega * L;
  }

  const Z_ph = Math.sqrt(R * R + XL * XL);
  const V_ph = V; 
  const I_ph = Z_ph > 0 ? V_ph / Z_ph : 0;
  const I_L = Math.sqrt(3) * I_ph; 

  const pf = Z_ph > 0 ? R / Z_ph : 1;
  const pfType = XL > 0 ? 'Lagging' : 'Unity';
  const thetaDeg = Math.acos(pf) * 180 / Math.PI;

  const P = Math.sqrt(3) * V * I_L * pf; 

  const given = {
    'Line Voltage (V_L)': `${V} V`,
    'Frequency (f)': isAc ? `${f} Hz` : '0 Hz (DC)',
    'Phase Resistance (R)': `${R} Ω`,
    'Phase Reactance (X_L)': `${XL.toFixed(2)} Ω`
  };

  const calculations = [
    {
      step: '1. Phase Voltage (V_ph) for Delta Connection:',
      formula: 'V_ph = V_line',
      substitution: `V_ph = ${V} V`,
      result: `${V_ph.toFixed(2)} V`
    },
    {
      step: '2. Calculate Phase Impedance (Z_ph):',
      formula: 'Z_ph = √[R² + X_L²]',
      substitution: `Z_ph = √[${R}² + ${XL.toFixed(2)}²]`,
      result: `${Z_ph.toFixed(2)} Ω`
    },
    {
      step: '3. Calculate Phase Current (I_ph):',
      formula: 'I_ph = V_ph / Z_ph',
      substitution: `I_ph = ${V_ph.toFixed(2)} / ${Z_ph.toFixed(2)}`,
      result: `${I_ph.toFixed(3)} A`
    },
    {
      step: '4. Calculate Line Current (I_L):',
      formula: 'I_L = √3 · I_ph',
      substitution: `I_L = √3 · ${I_ph.toFixed(3)} A`,
      result: `${I_L.toFixed(3)} A`
    },
    {
      step: '5. Calculate Power Factor (pf):',
      formula: 'pf = R / Z_ph',
      substitution: `pf = ${R} / ${Z_ph.toFixed(2)}`,
      result: `${pf.toFixed(3)} (${pfType})`
    },
    {
      step: '6. Calculate Total Active Power (P):',
      formula: 'P = √3 · V_line · I_line · pf',
      substitution: `P = √3 · ${V} · ${I_L.toFixed(3)} · ${pf.toFixed(3)}`,
      result: `${(P / 1000).toFixed(3)} kW`
    }
  ];

  return {
    success: true,
    given,
    calculations,
    results: {
      V_ph: `${V_ph.toFixed(2)} V`,
      Z_ph: `${Z_ph.toFixed(2)} Ω`,
      I_ph: `${I_ph.toFixed(3)} A`,
      I_L: `${I_L.toFixed(3)} A`,
      pf: `${pf.toFixed(3)} (${pfType})`,
      phi: `${thetaDeg.toFixed(2)}°`,
      P: `${(P / 1000).toFixed(3)} kW`
    },
    mappings: [
      { id: 'RAB', value: `${R} Ω` },
      { id: 'LAB', value: `${XL.toFixed(1)} Ω` },
      { id: 'RBC', value: `${R} Ω` },
      { id: 'LBC', value: `${XL.toFixed(1)} Ω` },
      { id: 'RCA', value: `${R} Ω` },
      { id: 'LCA', value: `${XL.toFixed(1)} Ω` }
    ]
  };
}

export function solveSeriesParallelCircuit(params) {
  const V = parseFloat(params.V) || 230;
  const f = parseFloat(params.f) !== undefined ? parseFloat(params.f) : 50;

  let R_s = parseFloat(params.Rs || params.R_s) || 0;
  let L_s = parseFloat(params.Ls || params.L_s) || 0;
  let R1 = parseFloat(params.R1) || 0;
  let L1 = parseFloat(params.L1) || 0;
  let C1 = parseFloat(params.C1) || 0;
  let R2 = parseFloat(params.R2) || 0;
  let L2 = parseFloat(params.L2) || 0;
  let C2 = parseFloat(params.C2) || 0;

  if (Array.isArray(params.seriesComponents)) {
    params.seriesComponents.forEach(c => {
      const v = parseFloat(c.rawValue || c.value) || 0;
      if (c.type === 'resistor') R_s = v;
      if (c.type === 'inductor') L_s = v;
    });
  }
  if (Array.isArray(params.branches)) {
    if (params.branches[0]) {
      params.branches[0].forEach(c => {
        const v = parseFloat(c.rawValue || c.value) || 0;
        if (c.type === 'resistor') R1 = v;
        if (c.type === 'inductor') L1 = v;
        if (c.type === 'capacitor') C1 = v;
      });
    }
    if (params.branches[1]) {
      params.branches[1].forEach(c => {
        const v = parseFloat(c.rawValue || c.value) || 0;
        if (c.type === 'resistor') R2 = v;
        if (c.type === 'inductor') L2 = v;
        if (c.type === 'capacitor') C2 = v;
      });
    }
  }

  const omega = 2 * Math.PI * f;
  
  const XL_s = omega * L_s;
  const Z_s = new Complex(R_s, XL_s);

  const XL1 = omega * L1;
  const XC1 = C1 > 0 ? 1 / (omega * C1) : 0;
  const Z1 = new Complex(R1, XL1 - XC1);

  const XL2 = omega * L2;
  const XC2 = C2 > 0 ? 1 / (omega * C2) : 0;
  const Z2 = new Complex(R2, XL2 - XC2);

  const Y1 = Z1.mag() > 0 ? Z1.inv() : new Complex(0, 0);
  const Y2 = Z2.mag() > 0 ? Z2.inv() : new Complex(0, 0);
  const Yp = Y1.add(Y2);
  const Zp = Yp.mag() > 0 ? Yp.inv() : new Complex(0, 0);

  const Zt = Z_s.add(Zp);
  const Zt_mag = Zt.mag();

  const I_t = Zt_mag > 0 ? V / Zt_mag : 0;
  const V_p = I_t * Zp.mag();

  const I1 = Z1.mag() > 0 ? V_p / Z1.mag() : 0;
  const I2 = Z2.mag() > 0 ? V_p / Z2.mag() : 0;

  const pf = Zt_mag > 0 ? Zt.r / Zt_mag : 1;
  const pfType = Zt.i >= 0 ? 'Lagging' : 'Leading';
  const thetaDeg = Math.acos(pf) * 180 / Math.PI;

  const given = {
    'Supply Voltage (V)': `${V} V`,
    'Frequency (f)': `${f} Hz`,
    'Series Impedance': `Rs = ${R_s} Ω, Ls = ${L_s} H`,
    'Branch 1': `R1 = ${R1} Ω, L1 = ${L1} H, C1 = ${C1 * 1e6} μF`,
    'Branch 2': `R2 = ${R2} Ω, L2 = ${L2} H, C2 = ${C2 * 1e6} μF`
  };

  const calculations = [
    {
      step: '1. Calculate Branch 1 Impedance (Z1):',
      formula: 'Z1 = R1 + j(X_L1 - X_C1)',
      substitution: `Z1 = ${R1} + j(${XL1.toFixed(2)} - ${XC1.toFixed(2)})`,
      result: `${Z1.r.toFixed(2)} + j(${Z1.i.toFixed(2)}) Ω (Magnitude: ${Z1.mag().toFixed(2)} Ω)`
    },
    {
      step: '2. Calculate Branch 2 Impedance (Z2):',
      formula: 'Z2 = R2 + j(X_L2 - X_C2)',
      substitution: `Z2 = ${R2} + j(${XL2.toFixed(2)} - ${XC2.toFixed(2)})`,
      result: `${Z2.r.toFixed(2)} + j(${Z2.i.toFixed(2)}) Ω (Magnitude: ${Z2.mag().toFixed(2)} Ω)`
    },
    {
      step: '3. Calculate Parallel Branch Impedance (Zp):',
      formula: 'Zp = (Z1 · Z2) / (Z1 + Z2)',
      substitution: `Zp = ((${Z1.r.toFixed(2)} + j${Z1.i.toFixed(2)}) · (${Z2.r.toFixed(2)} + j${Z2.i.toFixed(2)})) / ...`,
      result: `${Zp.r.toFixed(2)} + j(${Zp.i.toFixed(2)}) Ω (Magnitude: ${Zp.mag().toFixed(2)} Ω)`
    },
    {
      step: '4. Calculate Total Circuit Impedance (Zt):',
      formula: 'Zt = Z_series + Zp',
      substitution: `Zt = (${R_s} + j${XL_s.toFixed(2)}) + (${Zp.r.toFixed(2)} + j${Zp.i.toFixed(2)})`,
      result: `${Zt.r.toFixed(2)} + j(${Zt.i.toFixed(2)}) Ω (Magnitude: ${Zt_mag.toFixed(2)} Ω)`
    },
    {
      step: '5. Calculate Total Current (It):',
      formula: 'It = V / |Zt|',
      substitution: `It = ${V} / ${Zt_mag.toFixed(2)}`,
      result: `${I_t.toFixed(3)} A`
    },
    {
      step: '6. Calculate Branch Currents (I1, I2):',
      formula: 'I1 = Vp / |Z1|, I2 = Vp / |Z2|',
      substitution: `Vp = ${V_p.toFixed(2)} V`,
      result: `I1 = ${I1.toFixed(3)} A, I2 = ${I2.toFixed(3)} A`
    }
  ];

  return {
    success: true,
    given,
    calculations,
    results: {
      Zp: `${Zp.mag().toFixed(2)} Ω`,
      Zt: `${Zt_mag.toFixed(2)} Ω`,
      It: `${I_t.toFixed(3)} A`,
      I1: `${I1.toFixed(3)} A`,
      I2: `${I2.toFixed(3)} A`,
      pf: `${pf.toFixed(3)} (${pfType})`,
      phi: `${thetaDeg.toFixed(2)}°`
    },
    mappings: []
  };
}

export function solveBridgeCircuit(params) {
  const R1 = parseFloat(params.R1) || 10;
  const R2 = parseFloat(params.R2) || 10;
  const R3 = parseFloat(params.R3) || 10;
  const R4 = parseFloat(params.R4) || 10;
  const R5 = parseFloat(params.R5) || 10; 
  const V = parseFloat(params.V) || 10;

  const G1 = 1 / R1;
  const G2 = 1 / R2;
  const G3 = 1 / R3;
  const G4 = 1 / R4;
  const G5 = 1 / R5;

  const A = G1 + G3 + G5;
  const B = -G5;
  const C = V * G1;
  const D = -G5;
  const E = G2 + G4 + G5;
  const F = V * G2;

  const det = A * E - B * D;
  let V1 = 0;
  let V2 = 0;
  if (Math.abs(det) > 1e-9) {
    V1 = (C * E - B * F) / det;
    V2 = (A * F - C * D) / det;
  }

  const V_det = Math.abs(V1 - V2);
  const I_det = V_det / R5;

  const isBalanced = V_det < 1e-5;

  const given = {
    'R1 (Top-Left)': `${R1} Ω`,
    'R2 (Top-Right)': `${R2} Ω`,
    'R3 (Bottom-Left)': `${R3} Ω`,
    'R4 (Bottom-Right)': `${R4} Ω`,
    'R5 (Detector)': `${R5} Ω`,
    'Supply Voltage (V)': `${V} V`
  };

  const calculations = [
    {
      step: '1. Check Balance Condition:',
      formula: 'R1/R3 = R2/R4',
      substitution: `${R1}/${R3} vs ${R2}/${R4}`,
      result: isBalanced ? 'Bridge is Balanced' : 'Bridge is Unbalanced'
    },
    {
      step: '2. Nodal Equation at Left Detector Node (V1):',
      formula: 'V1·(1/R1 + 1/R3 + 1/R5) - V2/R5 = V/R1',
      substitution: `V1·(${(G1+G3+G5).toFixed(4)}) - V2·(${G5.toFixed(4)}) = ${(V*G1).toFixed(4)}`,
      result: `V1 = ${V1.toFixed(3)} V`
    },
    {
      step: '3. Nodal Equation at Right Detector Node (V2):',
      formula: 'V2·(1/R2 + 1/R4 + 1/R5) - V1/R5 = V/R2',
      substitution: `V2·(${(G2+G4+G5).toFixed(4)}) - V1·(${G5.toFixed(4)}) = ${(V*G2).toFixed(4)}`,
      result: `V2 = ${V2.toFixed(3)} V`
    },
    {
      step: '4. Calculate Detector Voltage (V_det) & Current (I_det):',
      formula: 'V_det = |V1 - V2|, I_det = V_det / R5',
      substitution: `V_det = |${V1.toFixed(3)} - ${V2.toFixed(3)}|, I_det = ${V_det.toFixed(3)} / ${R5}`,
      result: `V_det = ${V_det.toFixed(4)} V, I_det = ${I_det.toFixed(5)} A`
    }
  ];

  return {
    success: true,
    given,
    calculations,
    results: {
      V1: `${V1.toFixed(2)} V`,
      V2: `${V2.toFixed(2)} V`,
      V_det: `${V_det.toFixed(4)} V`,
      I_det: `${I_det.toFixed(5)} A`,
      balanceState: isBalanced ? 'Balanced' : 'Unbalanced'
    },
    mappings: [
      { id: 'R1', value: `${R1} Ω` },
      { id: 'R2', value: `${R2} Ω` },
      { id: 'R3', value: `${R3} Ω` },
      { id: 'R4', value: `${R4} Ω` },
      { id: 'R5', value: `${R5} Ω` }
    ]
  };
}

export function solveBjtBiasCircuit(params) {
  const Vcc = parseFloat(params.Vcc) || 12;
  const R1 = parseFloat(params.R1) || 10000;
  const R2 = parseFloat(params.R2) || 2200;
  const RC = parseFloat(params.RC) || 1000;
  const RE = parseFloat(params.RE) || 500;
  const Vbe = 0.7; 

  const VB = Vcc * (R2 / (R1 + R2));
  const VE = Math.max(0, VB - Vbe);
  const IE = RE > 0 ? VE / RE : 0;
  const IC = IE; 
  const VC = Vcc - IC * RC;
  const VCE = VC - VE;

  const given = {
    'Vcc Rail': `${Vcc} V`,
    'Base Resistor R1': `${(R1/1000).toFixed(1)} kΩ`,
    'Base Resistor R2': `${(R2/1000).toFixed(1)} kΩ`,
    'Collector Resistor Rc': `${(RC/1000).toFixed(1)} kΩ`,
    'Emitter Resistor Re': `${RE} Ω`
  };

  const calculations = [
    {
      step: '1. Calculate Base Voltage (VB):',
      formula: 'VB = Vcc · [R2 / (R1 + R2)]',
      substitution: `VB = ${Vcc} · [${R2} / (${R1} + ${R2})]`,
      result: `${VB.toFixed(2)} V`
    },
    {
      step: '2. Calculate Emitter Voltage (VE):',
      formula: 'VE = VB - Vbe',
      substitution: `VE = ${VB.toFixed(2)} - ${Vbe}`,
      result: `${VE.toFixed(2)} V`
    },
    {
      step: '3. Calculate Emitter Current (IE):',
      formula: 'IE = VE / RE',
      substitution: `IE = ${VE.toFixed(2)} / ${RE}`,
      result: `${(IE * 1000).toFixed(3)} mA`
    },
    {
      step: '4. Calculate Collector Voltage (VC):',
      formula: 'VC = Vcc - IC · RC',
      substitution: `VC = ${Vcc} - ${(IC).toFixed(5)} · ${RC}`,
      result: `${VC.toFixed(2)} V`
    },
    {
      step: '5. Calculate Collector-Emitter Voltage (VCE):',
      formula: 'VCE = VC - VE',
      substitution: `VCE = ${VC.toFixed(2)} - ${VE.toFixed(2)}`,
      result: `${VCE.toFixed(2)} V`
    }
  ];

  return {
    success: true,
    given,
    calculations,
    results: {
      VB: `${VB.toFixed(2)} V`,
      VE: `${VE.toFixed(2)} V`,
      IC: `${(IC * 1000).toFixed(2)} mA`,
      VC: `${VC.toFixed(2)} V`,
      VCE: `${VCE.toFixed(2)} V`
    },
    mappings: [
      { id: 'R1', value: `${(R1/1000).toFixed(1)} kΩ` },
      { id: 'R2', value: `${(R2/1000).toFixed(1)} kΩ` },
      { id: 'RC', value: `${(RC/1000).toFixed(1)} kΩ` },
      { id: 'RE', value: `${RE} Ω` }
    ]
  };
}

export function solveOpampSumming(params) {
  const Rf = parseFloat(params.Rf) || 10000;
  const R1 = parseFloat(params.R1) || 1000;
  const R2 = parseFloat(params.R2) || 1000;
  const R3 = parseFloat(params.R3) || 1000;
  
  const V1 = parseFloat(params.V1) || 1;
  const V2 = parseFloat(params.V2) || 1;
  const V3 = parseFloat(params.V3) || 0; 

  const Vout = -Rf * (V1 / R1 + V2 / R2 + V3 / R3);

  const given = {
    'Feedback Rf': `${(Rf/1000).toFixed(1)} kΩ`,
    'Resistor R1': `${(R1/1000).toFixed(1)} kΩ`,
    'Resistor R2': `${(R2/1000).toFixed(1)} kΩ`,
    'Input Voltage V1': `${V1} V`,
    'Input Voltage V2': `${V2} V`
  };

  const calculations = [
    {
      step: '1. Inverting Summing Amplifier Formula:',
      formula: 'Vout = -Rf · [V1/R1 + V2/R2 + V3/R3]',
      substitution: `Vout = -${Rf} · [${V1}/${R1} + ${V2}/${R2} + ${V3}/${R3}]`,
      result: `${Vout.toFixed(3)} V`
    }
  ];

  return {
    success: true,
    given,
    calculations,
    results: {
      Vout: `${Vout.toFixed(2)} V`
    },
    mappings: [
      { id: 'R_in1', value: `${(R1/1000).toFixed(1)} kΩ` },
      { id: 'R_in2', value: `${(R2/1000).toFixed(1)} kΩ` },
      { id: 'RF', value: `${(Rf/1000).toFixed(1)} kΩ` }
    ]
  };
}



