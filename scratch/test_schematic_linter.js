// scratch/test_schematic_linter.js
import { validateSchematicTopology } from '../lib/gridSchematicCompiler.js';
import assert from 'assert';

console.log('🧪 Testing Schematic Topology Linter...');

// 1. Missing Ground Reference Check
console.log('\nTesting ground reference check...');
const noGndSchema = {
  components: [
    { id: 'Vcc1', symbol: 'vcc-rail', grid: [0, 0] },
    { id: 'R1', symbol: 'resistor', grid: [0, 1] }
  ],
  netlist: [
    { from: 'Vcc1.bottom', to: 'R1.top' }
  ]
};
const resNoGnd = validateSchematicTopology(noGndSchema);
console.log('Errors:', resNoGnd.errors);
assert.strictEqual(resNoGnd.valid, false);
assert.ok(resNoGnd.errors.some(e => e.includes('Ground')));
console.log('✅ Missing ground check passed.');

// 2. Active Circuit Missing Vcc Rail Check
console.log('\nTesting active circuit missing Vcc rail check...');
const activeNoVccSchema = {
  components: [
    { id: 'Gnd1', symbol: 'ground', grid: [0, 2] },
    { id: 'Q1', symbol: 'bjt-npn', grid: [0, 1] }
  ],
  netlist: [
    { from: 'Q1.emitter', to: 'Gnd1.top' }
  ]
};
const resActiveNoVcc = validateSchematicTopology(activeNoVccSchema);
console.log('Errors:', resActiveNoVcc.errors);
assert.strictEqual(resActiveNoVcc.valid, false);
assert.ok(resActiveNoVcc.errors.some(e => e.includes('Vcc power rail')));
console.log('✅ Active circuit missing Vcc check passed.');

// 3. Short Circuit Detection (Vcc to Ground direct path)
console.log('\nTesting direct short circuit detection...');
const shortCircuitSchema = {
  components: [
    { id: 'Vcc1', symbol: 'vcc-rail', grid: [0, 0] },
    { id: 'Gnd1', symbol: 'ground', grid: [0, 2] }
  ],
  netlist: [
    { from: 'Vcc1.bottom', to: 'Gnd1.top' }
  ]
};
const resShort = validateSchematicTopology(shortCircuitSchema);
console.log('Errors:', resShort.errors);
assert.strictEqual(resShort.valid, false);
assert.ok(resShort.errors.some(e => e.includes('Direct Short Circuit')));
console.log('✅ Short circuit detection check passed.');

// 4. Floating Pin Check (BJTs)
console.log('\nTesting floating pin check for transistors...');
const floatingBjtSchema = {
  components: [
    { id: 'Vcc1', symbol: 'vcc-rail', grid: [0, 0] },
    { id: 'Gnd1', symbol: 'ground', grid: [0, 2] },
    { id: 'Q1', symbol: 'bjt-npn', grid: [0, 1] }
  ],
  netlist: [
    { from: 'Vcc1.bottom', to: 'Q1.collector' },
    { from: 'Q1.emitter', to: 'Gnd1.top' }
    // base is left unconnected (floating)
  ]
};
const resBjt = validateSchematicTopology(floatingBjtSchema);
console.log('Errors:', resBjt.errors);
assert.strictEqual(resBjt.valid, false);
assert.ok(resBjt.errors.some(e => e.includes('Transistor Q1 base is unconnected')));
console.log('✅ Transistor floating pin check passed.');

// 5. Floating Pin Check (Op-Amps)
console.log('\nTesting floating pin check for op-amps...');
const floatingOpAmpSchema = {
  components: [
    { id: 'Gnd1', symbol: 'ground', grid: [0, 2] },
    { id: 'U1', symbol: 'op-amp', grid: [0, 1] }
  ],
  netlist: [
    { from: 'U1.inverting', to: 'Gnd1.top' }
    // non-inverting and output are floating
  ]
};
const resOpAmp = validateSchematicTopology(floatingOpAmpSchema);
console.log('Errors:', resOpAmp.errors);
assert.strictEqual(resOpAmp.valid, false);
assert.ok(resOpAmp.errors.some(e => e.includes('Op-Amp U1 non-inverting input is unconnected')));
assert.ok(resOpAmp.errors.some(e => e.includes('Op-Amp U1 output is unconnected')));
console.log('✅ Op-Amp floating pin check passed.');

// 6. Floating Component Check (zero connections)
console.log('\nTesting floating component check...');
const floatingCompSchema = {
  components: [
    { id: 'Vcc1', symbol: 'vcc-rail', grid: [0, 0] },
    { id: 'Gnd1', symbol: 'ground', grid: [0, 2] },
    { id: 'R1', symbol: 'resistor', grid: [1, 1] } // unconnected resistor
  ],
  netlist: [
    { from: 'Vcc1.bottom', to: 'Gnd1.top' } // short circuit but R1 is floating
  ]
};
const resComp = validateSchematicTopology(floatingCompSchema);
console.log('Errors:', resComp.errors);
assert.strictEqual(resComp.valid, false);
assert.ok(resComp.errors.some(e => e.includes('Component R1 (resistor) has zero connections')));
console.log('✅ Floating component check passed.');

// 7. Valid Passive Circuit (RC Filter - no Vcc rail required)
console.log('\nTesting valid passive circuit (should pass)...');
const passiveValidSchema = {
  components: [
    { id: 'Vin', symbol: 'node-label', grid: [0, 0] },
    { id: 'R1', symbol: 'resistor', grid: [1, 0] },
    { id: 'C1', symbol: 'capacitor', grid: [2, 0.5], rotation: 90 },
    { id: 'Gnd1', symbol: 'ground', grid: [2, 1.5] }
  ],
  netlist: [
    { from: 'Vin.1', to: 'R1.left' },
    { from: 'R1.right', to: 'C1.top' },
    { from: 'C1.bottom', to: 'Gnd1.top' }
  ]
};
const resPassive = validateSchematicTopology(passiveValidSchema);
console.log('Errors:', resPassive.errors);
assert.strictEqual(resPassive.valid, true);
console.log('✅ Valid passive circuit passed.');

// 8. Valid Active Circuit (Transistor Amplifier - Vcc, GND, BJT, all connected)
console.log('\nTesting valid active circuit (should pass)...');
const activeValidSchema = {
  components: [
    { id: 'Vcc1', symbol: 'vcc-rail', grid: [1, 0] },
    { id: 'Rc', symbol: 'resistor', grid: [1, 0.5], rotation: 90 },
    { id: 'Q1', symbol: 'bjt-npn', grid: [1, 1] },
    { id: 'Rb', symbol: 'resistor', grid: [0, 1] },
    { id: 'Vin', symbol: 'node-label', grid: [0, 1] },
    { id: 'Re', symbol: 'resistor', grid: [1, 1.5], rotation: 90 },
    { id: 'Gnd1', symbol: 'ground', grid: [1, 2] }
  ],
  netlist: [
    { from: 'Vcc1.bottom', to: 'Rc.top' },
    { from: 'Rc.bottom', to: 'Q1.collector' },
    { from: 'Vin.1', to: 'Rb.left' },
    { from: 'Rb.right', to: 'Q1.base' },
    { from: 'Q1.emitter', to: 'Re.top' },
    { from: 'Re.bottom', to: 'Gnd1.top' }
  ]
};
const resActive = validateSchematicTopology(activeValidSchema);
console.log('Errors:', resActive.errors);
assert.strictEqual(resActive.valid, true);
console.log('✅ Valid active circuit passed.');

console.log('\n🎉 All schematic topology linter tests passed successfully!');
