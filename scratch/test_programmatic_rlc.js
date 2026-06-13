// scratch/test_programmatic_rlc.js
import { resolveParameters } from '../lib/parameterResolver.js';
import { buildSeriesSchematic, buildParallelSchematic } from '../lib/programmaticSchematicBuilder.js';
import { solveGeneralSeriesCircuit, solveGeneralParallelCircuit } from '../lib/deterministicSolver.js';

console.log('--- 1. Testing Parameter Resolver ---');
const raw1 = { V: '230V', f: '50Hz', R: '40mH', L: '0.24', C: '100uF' };
// Wait, R should not be mH! But let's check what resolveParameters does:
// R is Ω. R = '40' or '40k' or '40'. If raw has R: '40', f: '50Hz', L: '40mH', C: '100uF'
const raw2 = { V: '220', f: '50Hz', R: '100', L: '40mH', C: '100uF' };
console.log('Raw Params:', raw2);
const resolved = resolveParameters('general-series-circuit', raw2);
console.log('Resolved Params:', resolved.normalizedParams);
console.log('Assumed Values:', resolved.assumedValues);

console.log('\n--- 2. Testing Series Schematic Builder ---');
const seriesSchema = buildSeriesSchematic(resolved.normalizedParams);
console.log('Series Schema components count:', seriesSchema.components.length);
console.log('Series Schema netlist length:', seriesSchema.netlist.length);

console.log('\n--- 3. Testing Parallel Schematic Builder ---');
const parallelSchema = buildParallelSchematic(resolved.normalizedParams);
console.log('Parallel Schema components count:', parallelSchema.components.length);
console.log('Parallel Schema netlist length:', parallelSchema.netlist.length);

console.log('\n--- 4. Testing General Series Solver ---');
const seriesSolved = solveGeneralSeriesCircuit(resolved.normalizedParams);
console.log('Series Solved success:', seriesSolved.success);
if (seriesSolved.success) {
  console.log('Series Solved results:', seriesSolved.results);
  console.log('Series Solved mappings:', seriesSolved.mappings);
  console.log('Series Solved calculations step count:', seriesSolved.calculations.length);
}

console.log('\n--- 5. Testing General Parallel Solver ---');
const parallelSolved = solveGeneralParallelCircuit(resolved.normalizedParams);
console.log('Parallel Solved success:', parallelSolved.success);
if (parallelSolved.success) {
  console.log('Parallel Solved results:', parallelSolved.results);
  console.log('Parallel Solved mappings:', parallelSolved.mappings);
  console.log('Parallel Solved calculations step count:', parallelSolved.calculations.length);
}

console.log('\n--- 6. Testing Defaults Injection ---');
const resolvedEmpty = resolveParameters('general-series-circuit', {});
console.log('Empty Raw -> Resolved Params:', resolvedEmpty.normalizedParams);
console.log('Empty Raw -> Assumed Values:', resolvedEmpty.assumedValues);
