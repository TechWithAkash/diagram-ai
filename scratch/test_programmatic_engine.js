/**
 * scratch/test_programmatic_engine.js
 * Run using node to verify solver mathematics, unit normalization, and programmatic layout generation.
 */
const { resolveParameters, normalizeValue } = require('../lib/parameterResolver')
const { buildSeriesSchematic, buildParallelSchematic, buildStarSchematic } = require('../lib/programmaticSchematicBuilder')
const { solveGeneralSeriesCircuit, solveGeneralParallelCircuit, solveStarConnection } = require('../lib/deterministicSolver')
const { validateSchematicTopology } = require('../lib/gridSchematicCompiler')

function runTests() {
  console.log('🧪 Starting DiagramAI Programmatic Engine Unit Tests...\n')

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      passed++
      console.log(`✅ PASS: ${message}`)
    } else {
      failed++
      console.error(`❌ FAIL: ${message}`)
    }
  }

  // ─── Test 1: Unit Normalization ──────────────────────────────────────────────
  console.log('--- Test Group 1: Unit Normalizer ---')
  assert(normalizeValue('40mH') === 0.04, 'Normalizes 40mH to 0.04')
  assert(Math.abs(normalizeValue('100uF') - 0.0001) < 1e-9, 'Normalizes 100uF to 0.0001')
  assert(normalizeValue('10k') === 10000, 'Normalizes 10k to 10000')
  assert(normalizeValue('230V') === 230, 'Normalizes 230V to 230')
  assert(normalizeValue('50Hz') === 50, 'Normalizes 50Hz to 50')

  // ─── Test 2: Parameter Resolver & Defaults ───────────────────────────────
  console.log('\n--- Test Group 2: Parameter Resolver ---')
  const { normalizedParams, assumedValues } = resolveParameters('general-series-circuit', {
    R: '25',
    L: '40mH'
  })
  assert(normalizedParams.components && normalizedParams.components.length === 2, 'Groups flat R and L into components')
  assert(normalizedParams.components[0].value === 25, 'Keeps custom R value')
  assert(normalizedParams.components[1].value === 0.04, 'Normalizes L value')
  assert(normalizedParams.C === undefined, 'Does not inject default C when R and L are specified')
  assert(normalizedParams.V === 230, 'Injects default Voltage (230V)')
  assert(!assumedValues.some(a => a.includes('Capacitance')), 'Assumed values does not list C')
  assert(assumedValues.some(a => a.includes('Voltage')), 'Assumed values lists V')

  // ─── Test 3: Programmatic Schematic Layouts ──────────────────────────────
  console.log('\n--- Test Group 3: Schematic Layout Builder ---')
  const seriesLayout = buildSeriesSchematic({ R: 10, L: 0.1, C: 0.0001, f: 50 })
  assert(seriesLayout.type === 'circuit-schematic', 'Series layout type is correct')
  assert(seriesLayout.components.length > 0, 'Series layout contains components')
  assert(seriesLayout.netlist.length > 0, 'Series layout contains netlist connections')
  
  const seriesLint = validateSchematicTopology(seriesLayout)
  assert(seriesLint.valid, 'Programmatic series layout passes topological linter')

  const parallelLayout = buildParallelSchematic({ R: 10, L: 0.1, C: 0.0001, f: 50 })
  const parallelLint = validateSchematicTopology(parallelLayout)
  assert(parallelLint.valid, 'Programmatic parallel layout passes topological linter')

  // ─── Test 4: General Solver Mathematics ────────────────────────────────────
  console.log('\n--- Test Group 4: Generalized Circuit Solver Math ---')
  
  // Custom series RLC math check: R=40, L=0.24H, C=100uF (similar to Q3a in BEEE paper)
  // At f=50Hz:
  // XL = 2*pi*50*0.24 = 75.40 ohm
  // XC = 1/(2*pi*50*100e-6) = 31.83 ohm
  // Z = sqrt(40^2 + (75.40 - 31.83)^2) = sqrt(1600 + 1898.3) = 59.15 ohm
  // I = 230 / 59.15 = 3.89 A
  const seriesSolve = solveGeneralSeriesCircuit({ V: 230, f: 50, R: 40, L: 0.24, C: 0.0001 })
  assert(seriesSolve.success, 'Generalized series solver runs successfully')
  const Z_val = parseFloat(seriesSolve.results.Z)
  const I_val = parseFloat(seriesSolve.results.I)
  assert(Math.abs(Z_val - 59.15) < 1.0, `Calculated impedance Z = ${seriesSolve.results.Z} is accurate`)
  assert(Math.abs(I_val - 3.89) < 0.2, `Calculated current I = ${seriesSolve.results.I} is accurate`)

  // Custom parallel RLC math check: R=10, L=0.1, C=0.0001, f=50 (DC check)
  const dcParallelSolve = solveGeneralParallelCircuit({ V: 12, f: 0, R: 10, L: 0.1, C: 0.0001 })
  assert(dcParallelSolve.success, 'Generalized parallel DC solver runs successfully')
  assert(dcParallelSolve.results.I === '∞ A', 'Inductor acts as short circuit in parallel DC, I is infinity')

  // Star Connection schematic layout and solver math check
  // Balanced 3-phase star connected load: R=6, XL=8, V=400 (Line), f=50
  // Vph = 400 / sqrt(3) = 230.94 V
  // Zph = sqrt(6^2 + 8^2) = 10 ohm
  // Iph = 230.94 / 10 = 23.09 A
  // IL = Iph = 23.09 A
  // pf = 6 / 10 = 0.6
  const starLayout = buildStarSchematic({ R: 6, XL: 8, V: 400, f: 50 })
  assert(starLayout.type === 'circuit-schematic', 'Star connection layout type is correct')
  assert(starLayout.components.length > 0, 'Star connection layout contains components')
  
  const starLint = validateSchematicTopology(starLayout)
  assert(starLint.valid, 'Programmatic star layout passes topological linter')

  const starSolve = solveStarConnection({ R: 6, XL: 8, V: 400, f: 50 })
  assert(starSolve.success, 'Star connection solver runs successfully')
  assert(Math.abs(parseFloat(starSolve.results.I_L) - 23.09) < 0.2, `Calculated star line current I_L = ${starSolve.results.I_L} is accurate`)
  assert(Math.abs(parseFloat(starSolve.results.pf) - 0.6) < 0.01, `Calculated star power factor pf = ${starSolve.results.pf} is accurate`)

  console.log(`\n🎉 Tests completed: ${passed} passed, ${failed} failed.\n`)
  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
