/**
 * gridSchematicCompiler.js
 * Compiles a symbolic, grid-based schematic schema into standard CircuitRenderer coordinates.
 * This eliminates coordinate calculation errors by routing wires orthogonally and spacing components dynamically.
 */

// Define standard terminal offsets relative to symbol center (0,0) at rotation = 0.
const TWO_TERM_1 = [-28, 0];
const TWO_TERM_2 = [28, 0];

const CAP_TERM_1 = [-14, 0];
const CAP_TERM_2 = [14, 0];

const DIODE_TERM_1 = [-20, 0];
const DIODE_TERM_2 = [20, 0];

const SOURCE_TERM_1 = [0, -26];
const SOURCE_TERM_2 = [0, 26];

const CIRCLE_TERM_1 = [-26, 0];
const CIRCLE_TERM_2 = [26, 0];

const SYMBOL_OFFSETS = {
  'resistor': {
    'left': TWO_TERM_1, 'right': TWO_TERM_2,
    'top': TWO_TERM_1, 'bottom': TWO_TERM_2,
    '1': TWO_TERM_1, '2': TWO_TERM_2,
    'in': TWO_TERM_1, 'out': TWO_TERM_2,
    'anode': TWO_TERM_1, 'cathode': TWO_TERM_2,
    type: 'horizontal'
  },
  'inductor': {
    'left': TWO_TERM_1, 'right': TWO_TERM_2,
    'top': TWO_TERM_1, 'bottom': TWO_TERM_2,
    '1': TWO_TERM_1, '2': TWO_TERM_2,
    'in': TWO_TERM_1, 'out': TWO_TERM_2,
    type: 'horizontal'
  },
  'capacitor': {
    'left': CAP_TERM_1, 'right': CAP_TERM_2,
    'top': CAP_TERM_1, 'bottom': CAP_TERM_2,
    '1': CAP_TERM_1, '2': CAP_TERM_2,
    'in': CAP_TERM_1, 'out': CAP_TERM_2,
    type: 'horizontal'
  },
  'diode': {
    'left': DIODE_TERM_1, 'right': DIODE_TERM_2,
    'top': DIODE_TERM_1, 'bottom': DIODE_TERM_2,
    '1': DIODE_TERM_1, '2': DIODE_TERM_2,
    'in': DIODE_TERM_1, 'out': DIODE_TERM_2,
    'anode': DIODE_TERM_1, 'cathode': DIODE_TERM_2,
    type: 'horizontal'
  },
  'zener-diode': {
    'left': DIODE_TERM_1, 'right': DIODE_TERM_2,
    'top': DIODE_TERM_1, 'bottom': DIODE_TERM_2,
    '1': DIODE_TERM_1, '2': DIODE_TERM_2,
    'in': DIODE_TERM_1, 'out': DIODE_TERM_2,
    'anode': DIODE_TERM_1, 'cathode': DIODE_TERM_2,
    type: 'horizontal'
  },
  'led': {
    'left': DIODE_TERM_1, 'right': DIODE_TERM_2,
    'top': DIODE_TERM_1, 'bottom': DIODE_TERM_2,
    '1': DIODE_TERM_1, '2': DIODE_TERM_2,
    'in': DIODE_TERM_1, 'out': DIODE_TERM_2,
    'anode': DIODE_TERM_1, 'cathode': DIODE_TERM_2,
    type: 'horizontal'
  },
  'switch': {
    'left': DIODE_TERM_1, 'right': DIODE_TERM_2,
    'top': DIODE_TERM_1, 'bottom': DIODE_TERM_2,
    '1': DIODE_TERM_1, '2': DIODE_TERM_2,
    'in': DIODE_TERM_1, 'out': DIODE_TERM_2,
    type: 'horizontal'
  },
  'ammeter': {
    'left': CIRCLE_TERM_1, 'right': CIRCLE_TERM_2,
    'top': CIRCLE_TERM_1, 'bottom': CIRCLE_TERM_2,
    '1': CIRCLE_TERM_1, '2': CIRCLE_TERM_2,
    'in': CIRCLE_TERM_1, 'out': CIRCLE_TERM_2,
    type: 'horizontal'
  },
  'voltmeter': {
    'left': CIRCLE_TERM_1, 'right': CIRCLE_TERM_2,
    'top': CIRCLE_TERM_1, 'bottom': CIRCLE_TERM_2,
    '1': CIRCLE_TERM_1, '2': CIRCLE_TERM_2,
    'in': CIRCLE_TERM_1, 'out': CIRCLE_TERM_2,
    type: 'horizontal'
  },
  'lamp': {
    'left': CIRCLE_TERM_1, 'right': CIRCLE_TERM_2,
    'top': CIRCLE_TERM_1, 'bottom': CIRCLE_TERM_2,
    '1': CIRCLE_TERM_1, '2': CIRCLE_TERM_2,
    'in': CIRCLE_TERM_1, 'out': CIRCLE_TERM_2,
    type: 'horizontal'
  },
  'load': {
    'left': CIRCLE_TERM_1, 'right': CIRCLE_TERM_2,
    'top': CIRCLE_TERM_1, 'bottom': CIRCLE_TERM_2,
    '1': CIRCLE_TERM_1, '2': CIRCLE_TERM_2,
    'in': CIRCLE_TERM_1, 'out': CIRCLE_TERM_2,
    type: 'horizontal'
  },
  'dc-source': {
    'top': SOURCE_TERM_1, 'bottom': SOURCE_TERM_2,
    'left': SOURCE_TERM_1, 'right': SOURCE_TERM_2,
    '1': SOURCE_TERM_1, '2': SOURCE_TERM_2,
    'in': SOURCE_TERM_1, 'out': SOURCE_TERM_2,
    type: 'vertical'
  },
  'ac-source': {
    'top': SOURCE_TERM_1, 'bottom': SOURCE_TERM_2,
    'left': SOURCE_TERM_1, 'right': SOURCE_TERM_2,
    '1': SOURCE_TERM_1, '2': SOURCE_TERM_2,
    'in': SOURCE_TERM_1, 'out': SOURCE_TERM_2,
    type: 'vertical'
  },
  'current-source': {
    'top': SOURCE_TERM_1, 'bottom': SOURCE_TERM_2,
    'left': SOURCE_TERM_1, 'right': SOURCE_TERM_2,
    '1': SOURCE_TERM_1, '2': SOURCE_TERM_2,
    'in': SOURCE_TERM_1, 'out': SOURCE_TERM_2,
    type: 'vertical'
  },
  'ground': {
    'top': [0, -12],
    '1': [0, -12],
    type: 'vertical'
  },
  'vcc-rail': {
    'bottom': [0, 0],
    '1': [0, 0],
    type: 'vertical'
  },
  'bjt-npn': {
    'base': [-20, 0], 'collector': [20, -32], 'emitter': [20, 32],
    'B': [-20, 0], 'C': [20, -32], 'E': [20, 32],
    'b': [-20, 0], 'c': [20, -32], 'e': [20, 32],
    'left': [-20, 0], 'top': [20, -32], 'bottom': [20, 32],
    '1': [-20, 0], '2': [20, -32], '3': [20, 32],
    type: 'multi'
  },
  'bjt-pnp': {
    'base': [-20, 0], 'collector': [20, -32], 'emitter': [20, 32],
    'B': [-20, 0], 'C': [20, -32], 'E': [20, 32],
    'b': [-20, 0], 'c': [20, -32], 'e': [20, 32],
    'left': [-20, 0], 'top': [20, -32], 'bottom': [20, 32],
    '1': [-20, 0], '2': [20, -32], '3': [20, 32],
    type: 'multi'
  },
  'op-amp': {
    'inverting': [-40, 20], 'non-inverting': [-40, -20], 'output': [40, 0],
    'in-': [-40, 20], 'in+': [-40, -20], 'out': [40, 0],
    '-': [-40, 20], '+': [-40, -20],
    'inv': [-40, 20], 'noninv': [-40, -20],
    'in_inv': [-40, 20], 'in_noninv': [-40, -20],
    'v-': [-40, 20], 'v+': [-40, -20],
    'minus': [-40, 20], 'plus': [-40, -20],
    'in1': [-40, 20], 'in2': [-40, -20],
    'left': [-40, 0], 'right': [40, 0],
    '1': [-40, 20], '2': [-40, -20], '3': [40, 0],
    type: 'multi'
  },
  'node-label': {
    '1': [0, 0], 'top': [0, 0], 'bottom': [0, 0], 'left': [0, 0], 'right': [0, 0],
    type: 'horizontal'
  },
  'wire-junction': {
    '1': [0, 0], 'top': [0, 0], 'bottom': [0, 0], 'left': [0, 0], 'right': [0, 0],
    type: 'horizontal'
  },
  'transformer': {
    'primary-top': [-20, -40], 'primary-bottom': [-20, 40],
    'secondary-top': [20, -40], 'secondary-bottom': [20, 40],
    'primary-ct': [-35, 0], 'secondary-ct': [35, 0],
    'p-top': [-20, -40], 'p-bottom': [-20, 40],
    's-top': [20, -40], 's-bottom': [20, 40],
    'p-ct': [-35, 0], 's-ct': [35, 0],
    '1': [-20, -40], '2': [-20, 40], '3': [20, -40], '4': [20, 40], '5': [-35, 0], '6': [35, 0],
    type: 'multi'
  }
};

/**
 * Rotates a 2D vector by multiples of 90 degrees.
 */
function rotateOffset(x, y, rotation) {
  const angle = ((rotation % 360) + 360) % 360;
  if (angle === 90)  return [-y, x];
  if (angle === 180) return [-x, -y];
  if (angle === 270) return [y, -x];
  return [x, y];
}

function cleanLatexSymbols(text) {
  if (!text) return "";
  return text
    .replace(/\\Omega/g, "Ω")
    .replace(/\\omega/g, "ω")
    .replace(/\\mu/g, "μ")
    .replace(/\\pi/g, "π")
    .replace(/\\theta/g, "θ")
    .replace(/\\phi/g, "φ")
    .replace(/\\degree/g, "°")
    .replace(/\\leftarrow/g, "←")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\to/g, "→")
    .replace(/\\gets/g, "←")
    .replace(/\\\$/g, "$")
    .replace(/\$/g, "");
}

/**
 * Compiles a grid-schematic schema to standard schematic JSON coordinate layout.
 */
export function compileGridSchematic(gridSchema) {
  const {
    grid = {},
    components = [],
    netlist = [],
    labels = [],
    junctions = [],
    boxes = []
  } = gridSchema;

  const colSpacing = grid.colSpacing || 180;
  const rowSpacing = grid.rowSpacing || 140;
  const paddingLeft = grid.padding?.left || 100;
  const paddingTop = grid.padding?.top || 80;

  // 1. Calculate Component Center Coordinates
  const resolvedComponents = components.map(comp => {
    const [c, r] = comp.grid;
    const x = paddingLeft + c * colSpacing;
    const y = paddingTop + r * rowSpacing;
    return {
      ...comp,
      x,
      y,
      rotation: comp.rotation || 0
    };
  });

  const componentMap = new Map(resolvedComponents.map(c => [c.id, c]));

  // Helper to resolve terminal position
  function getTerminalPos(compId, terminalName) {
    const comp = componentMap.get(compId);
    if (!comp) return null;

    const symType = comp.symbol.toLowerCase();
    const offsets = SYMBOL_OFFSETS[symType];
    if (!offsets) return { x: comp.x, y: comp.y, type: 'unknown' };

    const rawOffset = offsets[terminalName.toLowerCase()];
    if (!rawOffset) return { x: comp.x, y: comp.y, type: offsets.type || 'unknown' };

    const offsetX = rawOffset[0];
    const offsetY = comp.mirrorY ? -rawOffset[1] : rawOffset[1];

    const rotated = rotateOffset(offsetX, offsetY, comp.rotation);
    return {
      x: comp.x + rotated[0],
      y: comp.y + rotated[1],
      type: offsets.type || 'unknown'
    };
  }

  // 2. Generate Wires from Netlist
  const resolvedWires = [];

  netlist.forEach((connection) => {
    const { from, to, stroke, strokeWidth, strokeDasharray } = connection;

    // Parse compId and terminalName
    const [fromComp, fromTerm] = from.split('.');
    const [toComp, toTerm] = to.split('.');

    const p1 = getTerminalPos(fromComp, fromTerm);
    const p2 = getTerminalPos(toComp, toTerm);

    if (!p1 || !p2) {
      console.warn(`[GridCompiler] Could not resolve connection between ${from} and ${to}`);
      return;
    }

    const wireDefaults = {
      stroke: stroke || '#334155',
      strokeWidth: strokeWidth || 2,
      strokeDasharray: strokeDasharray || undefined
    };

    // Route Orthogonally
    if (Math.abs(p1.x - p2.x) < 1.5) {
      // Straight vertical wire
      resolvedWires.push({ x1: p1.x, y1: p1.y, x2: p1.x, y2: p2.y, ...wireDefaults });
    } else if (Math.abs(p1.y - p2.y) < 1.5) {
      // Straight horizontal wire
      resolvedWires.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p1.y, ...wireDefaults });
    } else {
      // Diagonal: needs a 90-degree corner
      // Choose corner based on terminal lead direction
      let cornerX, cornerY;
      
      if (p1.type === 'horizontal') {
        // Start horizontal, then vertical
        cornerX = p2.x;
        cornerY = p1.y;
      } else if (p1.type === 'vertical') {
        // Start vertical, then horizontal
        cornerX = p1.x;
        cornerY = p2.y;
      } else {
        // Fallback L-shape
        cornerX = p2.x;
        cornerY = p1.y;
      }

      resolvedWires.push(
        { x1: p1.x, y1: p1.y, x2: cornerX, y2: cornerY, ...wireDefaults },
        { x1: cornerX, y1: cornerY, x2: p2.x, y2: p2.y, ...wireDefaults }
      );
    }
  });

  // 3. Resolve Junctions
  const resolvedJunctions = junctions.map(j => {
    if (j.grid) {
      const [c, r] = j.grid;
      return {
        x: paddingLeft + c * colSpacing,
        y: paddingTop + r * rowSpacing,
        r: j.r || 4,
        fill: j.fill || '#334155'
      };
    }
    return j; // absolute junction
  });

  // 4. Resolve Free Labels & Opposite Values
  const resolvedLabels = labels.map(lbl => {
    const cleanText = cleanLatexSymbols(lbl.text || "");
    if (lbl.grid) {
      const [c, r] = lbl.grid;
      const x = paddingLeft + c * colSpacing + (lbl.offset?.[0] || 0);
      const y = paddingTop + r * rowSpacing + (lbl.offset?.[1] || 0);
      return {
        ...lbl,
        text: cleanText,
        x,
        y
      };
    }
    return {
      ...lbl,
      text: cleanText
    };
  });

  resolvedComponents.forEach(comp => {
    const symType = comp.symbol.toLowerCase();
    const offsets = SYMBOL_OFFSETS[symType];
    const baseType = offsets?.type || 'horizontal'; // 'horizontal', 'vertical', or 'multi'
    const isRotated = comp.rotation === 90 || comp.rotation === 270;

    // Check if the wires enter horizontally (leads are left/right)
    const hasHorizontalLeads = (baseType === 'horizontal' && !isRotated) || (baseType === 'vertical' && isRotated);

    let compLabel = comp.label || "";
    let compValue = comp.value || "";

    // Clean up LaTeX symbols
    compLabel = cleanLatexSymbols(compLabel);
    compValue = cleanLatexSymbols(compValue);

    // If comp.label contains '=' (e.g. 'R = 10 Ω'), split it into label and value to avoid wire overlaps!
    if (compLabel.includes('=')) {
      const parts = compLabel.split('=');
      compLabel = parts[0].trim();
      compValue = parts.slice(1).join('=').trim();
    }

    // Clear local labels on the component so CircuitSymbol renders only the base graphics
    comp.label = "";
    comp.value = "";

    // 1. Position main label (if exists)
    if (compLabel) {
      let lblX = comp.x;
      let lblY = comp.y;
      let anchor = 'middle';

      if (hasHorizontalLeads) {
        // Wires are horizontal (enter left/right). Place label ABOVE the component.
        lblX = comp.x;
        lblY = comp.y - 20; // 20px above
        anchor = 'middle';
      } else {
        // Wires are vertical (enter top/bottom). Place label on the RIGHT.
        lblX = comp.x + 28;
        lblY = comp.y + 4;
        anchor = 'start';
      }

      resolvedLabels.push({
        text: compLabel,
        x: lblX,
        y: lblY,
        fontSize: comp.labelSize || 10,
        fontWeight: '600',
        fill: '#334155',
        textAnchor: anchor
      });
    }

    // 2. Position value label (if exists)
    if (compValue) {
      let valX = comp.x;
      let valY = comp.y;
      let anchor = 'middle';

      if (hasHorizontalLeads) {
        // Wires are horizontal (enter left/right). Place value BELOW the component.
        valX = comp.x;
        valY = comp.y + 20; // 20px below
        anchor = 'middle';
      } else {
        // Wires are vertical (enter top/bottom). Place value on the LEFT.
        valX = comp.x - 28;
        valY = comp.y + 4;
        anchor = 'end';
      }

      resolvedLabels.push({
        text: compValue,
        x: valX,
        y: valY,
        fontSize: (comp.labelSize || 10) - 1,
        fontWeight: '500',
        fill: '#64748B',
        textAnchor: anchor
      });
    }
  });

  // Calculate ViewBox dimensions if not provided
  const cols = grid.columns || 3;
  const rows = grid.rows || 2;
  const width = grid.viewBox?.width || (paddingLeft * 2 + (cols - 1) * colSpacing);
  const height = grid.viewBox?.height || (paddingTop * 2 + (rows - 1) * rowSpacing);

  return {
    type: 'circuit-schematic',
    viewBox: { width, height },
    components: resolvedComponents,
    wires: resolvedWires,
    junctions: resolvedJunctions,
    labels: resolvedLabels,
    boxes: boxes
  };
}

/**
 * Validates a grid-schematic schema topology to ensure technical accuracy.
 * Checks for:
 * 1. Adaptive active vs. passive checks.
 * 2. Vcc-to-GND direct short circuits.
 * 3. Floating pins on BJTs and Op-Amps.
 * 4. Entirely unconnected components.
 * 5. Ground reference existence.
 */
export function validateSchematicTopology(gridSchema) {
  const { components = [], netlist = [] } = gridSchema;
  const errors = [];

  if (components.length === 0) {
    return { valid: false, errors: ['Circuit has no components'] };
  }

  // 1. Classify circuit as active or passive
  const activeSymbols = ['bjt-npn', 'bjt-pnp', 'op-amp'];
  const isActive = components.some(c => activeSymbols.includes(c.symbol.toLowerCase()));

  // 2. Build adjacency list of connected terminals
  const adj = {};
  function addEdge(u, v) {
    if (!adj[u]) adj[u] = [];
    if (!adj[v]) adj[v] = [];
    adj[u].push(v);
    adj[v].push(u);
  }

  netlist.forEach(conn => {
    if (conn.from && conn.to) {
      addEdge(conn.from, conn.to);
    }
  });

  // Internally connect all terminals of wire-junction and node-label components
  const zeroOhmComponents = components.filter(c => 
    c.symbol.toLowerCase() === 'wire-junction' || 
    c.symbol.toLowerCase() === 'node-label'
  );
  zeroOhmComponents.forEach(comp => {
    const terms = [];
    netlist.forEach(conn => {
      const [fromComp] = conn.from.split('.');
      const [toComp] = conn.to.split('.');
      if (fromComp === comp.id) terms.push(conn.from);
      if (toComp === comp.id) terms.push(conn.to);
    });
    for (let i = 0; i < terms.length; i++) {
      for (let j = i + 1; j < terms.length; j++) {
        addEdge(terms[i], terms[j]);
      }
    }
  });

  // 3. Ground Presence Check (only enforced for active circuits)
  const hasGround = components.some(c => c.symbol.toLowerCase() === 'ground');
  if (isActive && !hasGround) {
    errors.push('Active circuit (contains BJT/Op-Amp) lacks a reference Ground (ground)');
  }

  // 4. Active Circuit Vcc Rail Check
  const hasVcc = components.some(c => c.symbol.toLowerCase() === 'vcc-rail');
  if (isActive && !hasVcc) {
    errors.push('Active circuit (contains BJT/Op-Amp) lacks a Vcc power rail (vcc-rail)');
  }

  // 5. Short Circuit Detection (Vcc to Ground path check)
  const vccTerminals = [];
  components.forEach(c => {
    if (c.symbol.toLowerCase() === 'vcc-rail') {
      Object.keys(adj).forEach(t => {
        if (t.startsWith(c.id + '.')) {
          vccTerminals.push(t);
        }
      });
    }
  });

  const gndTerminals = [];
  components.forEach(c => {
    if (c.symbol.toLowerCase() === 'ground') {
      Object.keys(adj).forEach(t => {
        if (t.startsWith(c.id + '.')) {
          gndTerminals.push(t);
        }
      });
    }
  });

  let hasShort = false;
  vccTerminals.forEach(vccTerm => {
    const visited = new Set();
    const queue = [vccTerm];
    visited.add(vccTerm);

    while (queue.length > 0) {
      const curr = queue.shift();
      if (gndTerminals.includes(curr)) {
        hasShort = true;
        break;
      }
      const neighbors = adj[curr] || [];
      neighbors.forEach(n => {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      });
    }
  });

  if (hasShort) {
    errors.push('Critical Error: Direct Short Circuit detected between Vcc and Ground');
  }

  // 6. Floating Pins check for active multi-terminal components
  components.forEach(c => {
    const sym = c.symbol.toLowerCase();
    if (sym === 'bjt-npn' || sym === 'bjt-pnp') {
      const baseConnected = Object.keys(adj).some(t => {
        if (!t.startsWith(c.id + '.')) return false;
        const term = t.slice(c.id.length + 1).toLowerCase();
        return term === 'base' || term === 'b' || term === 'left' || term === '1';
      });
      const collConnected = Object.keys(adj).some(t => {
        if (!t.startsWith(c.id + '.')) return false;
        const term = t.slice(c.id.length + 1).toLowerCase();
        return term === 'collector' || term === 'c' || term === 'top' || term === '2';
      });
      const emitConnected = Object.keys(adj).some(t => {
        if (!t.startsWith(c.id + '.')) return false;
        const term = t.slice(c.id.length + 1).toLowerCase();
        return term === 'emitter' || term === 'e' || term === 'bottom' || term === '3';
      });

      if (!baseConnected) errors.push(`Floating Pin: Transistor ${c.id} base is unconnected`);
      if (!collConnected) errors.push(`Floating Pin: Transistor ${c.id} collector is unconnected`);
      if (!emitConnected) errors.push(`Floating Pin: Transistor ${c.id} emitter is unconnected`);
    } else if (sym === 'op-amp') {
      const invConnected = Object.keys(adj).some(t => {
        if (!t.startsWith(c.id + '.')) return false;
        const term = t.slice(c.id.length + 1).toLowerCase();
        return term === 'inverting' || term === 'in-' || term === 'inv' || term === 'in_inv' || term === 'v-' || term === 'minus' || term === '-' || term === 'left' || term === '1';
      });
      const nonInvConnected = Object.keys(adj).some(t => {
        if (!t.startsWith(c.id + '.')) return false;
        const term = t.slice(c.id.length + 1).toLowerCase();
        return term === 'non-inverting' || term === 'in+' || term === 'noninv' || term === 'in_noninv' || term === 'v+' || term === 'plus' || term === '+' || term === '2';
      });
      const outConnected = Object.keys(adj).some(t => {
        if (!t.startsWith(c.id + '.')) return false;
        const term = t.slice(c.id.length + 1).toLowerCase();
        return term === 'output' || term === 'out' || term === 'out1' || term === 'right' || term === '3';
      });

      if (!invConnected) errors.push(`Floating Pin: Op-Amp ${c.id} inverting input is unconnected`);
      if (!nonInvConnected) errors.push(`Floating Pin: Op-Amp ${c.id} non-inverting input is unconnected`);
      if (!outConnected) errors.push(`Floating Pin: Op-Amp ${c.id} output is unconnected`);
    }
  });

  // 7. Floating Component check
  components.forEach(c => {
    const hasAnyConnection = Object.keys(adj).some(t => t.startsWith(c.id + '.'));
    if (!hasAnyConnection) {
      errors.push(`Floating Component: Component ${c.id} (${c.symbol}) has zero connections`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
