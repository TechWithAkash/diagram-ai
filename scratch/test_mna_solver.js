/**
 * scratch/test_mna_solver.js
 * Unit test runner to verify mathematical correctness of custom solvers.
 */

import { 
  solveDeltaConnection, 
  solveSeriesParallelCircuit, 
  solveBridgeCircuit, 
  solveBjtBiasCircuit, 
  solveOpampSumming 
} from '../lib/deterministicSolver.js';

console.log('--- RUNNING DETERMINISTIC CIRCUIT SOLVERS UNIT TESTS ---');

// 1. Test Delta Connection
console.log('\n[Test 1] solveDeltaConnection (Balanced 3-Phase Delta)');
try {
  const deltaParams = { V: 400, f: 50, R: 12, XL: 16 };
  const res = solveDeltaConnection(deltaParams);
  console.log('✓ Success:', res.success);
  console.log('  Calculated Phase Voltage (V_ph):', res.results.V_ph, '(Expected: 400 V)');
  console.log('  Calculated Phase Impedance (Z_ph):', res.results.Z_ph, '(Expected: 20.00 Ω)');
  console.log('  Calculated Phase Current (I_ph):', res.results.I_ph, '(Expected: 20 A)');
  console.log('  Calculated Line Current (I_L):', res.results.I_L, '(Expected: 34.641 A)');
  console.log('  Calculated Power Factor (pf):', res.results.pf, '(Expected: 0.600 Lagging)');
  console.log('  Calculated Active Power (P):', res.results.P, '(Expected: 14.400 kW)');
} catch (err) {
  console.error('✗ Test 1 Failed:', err.message);
}

// 2. Test Series-Parallel Circuit
console.log('\n[Test 2] solveSeriesParallelCircuit (R-L series branch, R-C series branch, in series with Rs)');
try {
  const spParams = {
    V: 230,
    f: 50,
    Rs: 5,
    Ls: 0,
    R1: 10,
    L1: 0.04,
    R2: 20,
    C2: 0.0001
  };
  const res = solveSeriesParallelCircuit(spParams);
  console.log('✓ Success:', res.success);
  console.log('  Parallel Branch Impedance magnitude (Zp):', res.results.Zp);
  console.log('  Total Impedance magnitude (Zt):', res.results.Zt);
  console.log('  Total Line Current (It):', res.results.It);
  console.log('  Branch 1 Current (I1):', res.results.I1);
  console.log('  Branch 2 Current (I2):', res.results.I2);
  console.log('  Power Factor (pf):', res.results.pf);
} catch (err) {
  console.error('✗ Test 2 Failed:', err.message);
}

// 3. Test Wheatstone Bridge
console.log('\n[Test 3] solveBridgeCircuit (Wheatstone Bridge)');
try {
  const bridgeParams = { R1: 100, R2: 100, R3: 100, R4: 100, R5: 50, V: 10 };
  const res = solveBridgeCircuit(bridgeParams);
  console.log('✓ Success:', res.success);
  console.log('  Balance State:', res.results.balanceState, '(Expected: Balanced)');
  console.log('  Detector Voltage:', res.results.V_det, '(Expected: 0 V)');
  console.log('  Detector Current:', res.results.I_det, '(Expected: 0 A)');

  const unbalancedParams = { R1: 100, R2: 150, R3: 100, R4: 100, R5: 50, V: 10 };
  const resUnbalanced = solveBridgeCircuit(unbalancedParams);
  console.log('  Unbalanced Balance State:', resUnbalanced.results.balanceState, '(Expected: Unbalanced)');
  console.log('  Unbalanced Detector Voltage:', resUnbalanced.results.V_det);
} catch (err) {
  console.error('✗ Test 3 Failed:', err.message);
}

// 4. Test BJT Bias Circuit
console.log('\n[Test 4] solveBjtBiasCircuit (Voltage Divider Bias)');
try {
  const bjtParams = { Vcc: 12, R1: 10000, R2: 2200, RC: 1000, RE: 500 };
  const res = solveBjtBiasCircuit(bjtParams);
  console.log('✓ Success:', res.success);
  console.log('  Calculated Base Voltage (VB):', res.results.VB);
  console.log('  Calculated Emitter Voltage (VE):', res.results.VE);
  console.log('  Calculated Collector Current (IC):', res.results.IC);
  console.log('  Calculated Collector Voltage (VC):', res.results.VC);
  console.log('  Calculated Collector-Emitter Voltage (VCE):', res.results.VCE);
} catch (err) {
  console.error('✗ Test 4 Failed:', err.message);
}

// 5. Test Op-Amp Summing
console.log('\n[Test 5] solveOpampSumming (Summing Amplifier)');
try {
  const opampParams = { Rf: 10000, R1: 1000, R2: 2000, V1: 1, V2: 2 };
  const res = solveOpampSumming(opampParams);
  console.log('✓ Success:', res.success);
  console.log('  Calculated Vout:', res.results.Vout, '(Expected: -20 V)');
} catch (err) {
  console.error('✗ Test 5 Failed:', err.message);
}

console.log('\n--- TESTS COMPLETED ---');
