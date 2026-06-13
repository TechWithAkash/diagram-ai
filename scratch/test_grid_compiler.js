// scratch/test_grid_compiler.js
import { compileGridSchematic } from '../lib/gridSchematicCompiler.js';
import assert from 'assert';

console.log('🧪 Testing Grid Schematic Compiler...');

const sampleGridSchema = {
  grid: {
    columns: 3,
    rows: 2,
    colSpacing: 180,
    rowSpacing: 140,
    padding: { left: 100, top: 80 }
  },
  components: [
    { id: 'VS', symbol: 'ac-source', grid: [0, 0.5], rotation: 0, label: 'V(t)' },
    { id: 'R',  symbol: 'resistor',  grid: [1, 0],   rotation: 0, label: 'R', value: '1k' },
    { id: 'L',  symbol: 'inductor',  grid: [2, 0.5], rotation: 90, label: 'L' }
  ],
  netlist: [
    { from: 'VS.top', to: 'R.left' },
    { from: 'R.right', to: 'L.top' },
    { from: 'VS.bottom', to: 'L.bottom' }
  ]
};

const compiled = compileGridSchematic(sampleGridSchema);

console.log('1. Checking output structure...');
assert.strictEqual(compiled.type, 'circuit-schematic');
assert.strictEqual(compiled.components.length, 3);
assert.strictEqual(compiled.wires.length, 6); // 2 wires for diagonal from VS to R, 2 for R to L, 2 for VS to L
console.log('✅ Structure OK.');

console.log('2. Checking coordinates...');
// VS center at col 0, row 0.5 -> x = 100 + 0*180 = 100, y = 80 + 0.5*140 = 150
const vs = compiled.components.find(c => c.id === 'VS');
assert.strictEqual(vs.x, 100);
assert.strictEqual(vs.y, 150);

// R center at col 1, row 0 -> x = 100 + 1*180 = 280, y = 80 + 0*140 = 80
const r = compiled.components.find(c => c.id === 'R');
assert.strictEqual(r.x, 280);
assert.strictEqual(r.y, 80);

// L center at col 2, row 0.5 -> x = 100 + 2*180 = 460, y = 80 + 0.5*140 = 150
const l = compiled.components.find(c => c.id === 'L');
assert.strictEqual(l.x, 460);
assert.strictEqual(l.y, 150);
console.log('✅ Coordinate calculations OK.');

console.log('3. Checking lead connections...');
// VS is ac-source (vertical leads at rotation 0).
// VS.top at rotation 0 is centered at (100, 150). Top lead goes to (100, 150-26) = (100, 124)
// R is resistor (horizontal leads at rotation 0).
// R.left at rotation 0 is centered at (280, 80). Left lead goes to (280-28, 80) = (252, 80)
// The netlist connects VS.top (100, 124) to R.left (252, 80).
// This is diagonal, so it routes vertically from (100, 124) to (100, 80), then horizontally to (252, 80) since VS.top is vertical.
// Let's verify the compiled wires:
const w1 = compiled.wires[0];
const w2 = compiled.wires[1];
assert.strictEqual(w1.x1, 100);
assert.strictEqual(w1.y1, 124);
assert.strictEqual(w1.x2, 100);
assert.strictEqual(w1.y2, 80);

assert.strictEqual(w2.x1, 100);
assert.strictEqual(w2.y1, 80);
assert.strictEqual(w2.x2, 252);
assert.strictEqual(w2.y2, 80);
console.log('✅ Lead offsets and orthogonal routing OK.');

console.log('4. Checking labels and auto opposite value placement...');
const valueLabel = compiled.labels.find(lbl => lbl.text === '1k');
assert.ok(valueLabel);
assert.strictEqual(valueLabel.x, 280);
assert.strictEqual(valueLabel.y, 80 - 18); // placed above horizontal resistor R
console.log('✅ Auto opposite value label OK.');

console.log('🎉 All tests passed successfully!');
