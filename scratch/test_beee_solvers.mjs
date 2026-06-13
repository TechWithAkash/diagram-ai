// scratch/test_beee_solvers.mjs
// Test script to verify the deterministic solvers

import {
  solveDcCircuit,
  solveAcRlcCircuit,
  solveZenerRegulator,
  solveOpampInverting,
  solveOpampNoninverting,
  solveStarDelta,
  solveNortonsTheorem,
  solveSourceTransformation,
  solveSeriesRlCircuit,
  solveSeriesRlcResonance,
  solveSuperposition,
  solveThevenin
} from '../lib/deterministicSolver.js'

function testSolver(name, result) {
  console.log(`\n==================================================`);
  console.log(`TESTING: ${name}`);
  console.log(`==================================================`);
  if (!result.success) {
    console.error(`❌ FAILED:`, result.error);
    return;
  }
  console.log(`Given:`, result.given);
  console.log(`Results:`, result.results);
  console.log(`Calculations:`);
  result.calculations.forEach((c, i) => {
    console.log(`  Step ${i+1}: ${c.step}`);
    console.log(`    Formula: ${c.formula}`);
    console.log(`    Sub:     ${c.substitution}`);
    console.log(`    Result:  ${c.result}`);
  });
  console.log(`Mappings count: ${result.mappings.length}`);
  console.log(`✅ PASSED`);
}

// 1. Star-Delta (Star-to-Delta)
testSolver('solveStarDelta (Star-to-Delta)', solveStarDelta({ R1: 2, R2: 4, R3: 6 }));

// 2. Star-Delta (Delta-to-Star)
testSolver('solveStarDelta (Delta-to-Star)', solveStarDelta({ RAB: 10, RBC: 20, RCA: 30 }));

// 3. Norton's Theorem
testSolver('solveNortonsTheorem', solveNortonsTheorem({
  V1: 15, R1: 8, V2: 5, R2: 2, R3: 2, R4: 16, R5: 10, RL: 3
}));

// 4. Source Transformation (V to I)
testSolver('solveSourceTransformation (V to I)', solveSourceTransformation({ V: 18, rv: 6 }));

// 5. Source Transformation (I to V)
testSolver('solveSourceTransformation (I to V)', solveSourceTransformation({ I: 2, ri: 6 }));

// 6. Series RL
testSolver('solveSeriesRlCircuit', solveSeriesRlCircuit({ V: 230, f: 50, R: 40, L: 0.24 }));

// 7. Series RLC Resonance
testSolver('solveSeriesRlcResonance', solveSeriesRlcResonance({ R: 10, L: 0.1, C: 100e-6 }));

// 8. Superposition
testSolver('solveSuperposition', solveSuperposition({ V1: 20, R1: 4, R2: 6, R3: 10, V2: 10 }));

// 9. Thevenin
testSolver('solveThevenin', solveThevenin({ Vth: 10, Rth: 5, RL: 15 }));
