// scratch/test_ce_amplifier.js
import { compileGridSchematic } from '../lib/gridSchematicCompiler.js';

const ceAmplifierSchema = {
  "type": "circuit-schematic",
  "viewBox": { "width": 820, "height": 480 },
  "grid": { "columns": 5, "rows": 3, "colSpacing": 180, "rowSpacing": 140, "padding": { "left": 100, "top": 80 } },
  "components": [
    { "id": "Q1", "symbol": "bjt-npn", "grid": [1, 1], "rotation": 0, "label": "Q1" },
    { "id": "Rb1", "symbol": "resistor", "grid": [0, 0.5], "rotation": 90, "label": "Rb1", "value": "10k" },
    { "id": "Rb2", "symbol": "resistor", "grid": [0, 1.5], "rotation": 90, "label": "Rb2", "value": "10k" },
    { "id": "Re", "symbol": "resistor", "grid": [2, 2], "rotation": 0, "label": "Re", "value": "1k" },
    { "id": "Rc", "symbol": "resistor", "grid": [3, 1], "rotation": 0, "label": "Rc", "value": "10k" },
    { "id": "Vcc", "symbol": "vcc-rail", "grid": [4, 1], "rotation": 0, "label": "Vcc" },
    { "id": "Vin", "symbol": "ac-source", "grid": [0, 1], "rotation": 0, "label": "Vin" },
    { "id": "Gnd", "symbol": "ground", "grid": [2, 0], "rotation": 0, "label": "Gnd" }
  ],
  "netlist": [
    { "from": "Rb1.top", "to": "Q1.base" },
    { "from": "Rb2.bottom", "to": "Q1.base" },
    { "from": "Rb1.bottom", "to": "Vcc.bottom" },
    { "from": "Rb2.top", "to": "Vin.top" },
    { "from": "Vin.bottom", "to": "Gnd.top" },
    { "from": "Q1.emitter", "to": "Re.left" },
    { "from": "Re.right", "to": "Gnd.top" },
    { "from": "Q1.collector", "to": "Rc.left" },
    { "from": "Rc.right", "to": "Vcc.bottom" }
  ],
  "labels": [
    { "text": "Input", "x": 120, "y": 200, "fontSize": 12, "fontWeight": "700" },
    { "text": "Output", "x": 680, "y": 200, "fontSize": 12, "fontWeight": "700" }
  ]
};

try {
  const result = compileGridSchematic(ceAmplifierSchema);
  console.log('Success! Compiled wires count:', result.wires.length);
} catch (err) {
  console.error('Compilation failed with error:', err);
}
