/**
 * lib/programmaticSchematicBuilder.js
 * Dynamically constructs symbolic grid layouts for series, parallel, and 3-phase star networks.
 * These are compiled client-side by compileGridSchematic.
 */

export function buildSeriesSchematic(params) {
  const { V = 230, f = 50 } = params;
  const includeSwitch = params.includeSwitch === true;
  const includeGround = params.includeGround === true;

  let compsPresent = [];
  if (Array.isArray(params.components) && params.components.length > 0) {
    compsPresent = params.components.map((comp, idx) => ({
      id: comp.id || `${comp.type.slice(0, 1).toUpperCase()}${idx + 1}`,
      symbol: comp.type === 'resistor' ? 'resistor' : comp.type === 'inductor' ? 'inductor' : comp.type === 'capacitor' ? 'capacitor' : comp.type,
      label: comp.label || `${comp.type.slice(0, 1).toUpperCase()}${idx + 1}`,
      value: comp.rawValue || comp.value
    }));
  } else {
    // Backwards compatibility
    const R = params.R !== undefined ? parseFloat(params.R) : 0;
    const L = params.L !== undefined ? parseFloat(params.L) : 0;
    const C = params.C !== undefined ? parseFloat(params.C) : 0;
    if (R > 0) compsPresent.push({ id: 'R', symbol: 'resistor', label: 'R', value: R });
    if (L > 0) compsPresent.push({ id: 'L', symbol: 'inductor', label: 'L', value: L });
    if (C > 0) compsPresent.push({ id: 'C', symbol: 'capacitor', label: 'C', value: C });
    if (compsPresent.length === 0) {
      compsPresent.push({ id: 'R', symbol: 'resistor', label: 'R', value: 10 });
    }
  }

  const len = compsPresent.length;
  const compStartCol = includeSwitch ? 2 : 1;
  const columns = compStartCol + len; // Col 0: source, Col 1: switch (if any), Col 2..1+len: R/L/C

  const components = [
    { id: 'VS', symbol: f > 0 ? 'ac-source' : 'dc-source', grid: [0, 1.0], label: 'Vs', rotation: 0 },
    { id: 'J_top_left', symbol: 'wire-junction', grid: [0, 0.0] },
    { id: 'J_bot_left', symbol: 'wire-junction', grid: [0, 2.0] }
  ];

  if (includeGround) {
    components.push({ id: 'Gnd', symbol: 'ground', grid: [0, 2.2] });
  }

  if (includeSwitch) {
    components.push({ id: 'SW', symbol: 'switch', grid: [1, 0.0], label: 'Switch', rotation: 0 });
  }

  // Place active components horizontally on row 0
  compsPresent.forEach((comp, idx) => {
    components.push({
      id: comp.id,
      symbol: comp.symbol,
      grid: [compStartCol + idx, 0.0],
      label: comp.label,
      value: comp.value,
      rotation: 0
    });
  });

  // Complete the return loop on row 2 using a bottom-right junction
  components.push({
    id: 'J_bot_right',
    symbol: 'wire-junction',
    grid: [compStartCol + len - 1, 2.0]
  });

  const netlist = [
    { from: 'VS.top', to: 'J_top_left.1' },
    { from: 'VS.bottom', to: 'J_bot_left.1' }
  ];

  if (includeGround) {
    netlist.push({ from: 'Gnd.top', to: 'J_bot_left.1' });
  }

  // Connect top-left junction to first component (via switch if present)
  if (includeSwitch) {
    netlist.push({ from: 'J_top_left.1', to: 'SW.left' });
    netlist.push({ from: 'SW.right', to: `${compsPresent[0].id}.left` });
  } else {
    netlist.push({ from: 'J_top_left.1', to: `${compsPresent[0].id}.left` });
  }

  // Chain components horizontally
  for (let i = 0; i < len - 1; i++) {
    netlist.push({ from: `${compsPresent[i].id}.right`, to: `${compsPresent[i + 1].id}.left` });
  }

  // Connect the last component to the bottom-right junction
  netlist.push({ from: `${compsPresent[len - 1].id}.right`, to: 'J_bot_right.1' });

  // Close the loop by connecting the bottom-right junction to the bottom-left junction
  netlist.push({ from: 'J_bot_right.1', to: 'J_bot_left.1' });

  return {
    type: 'circuit-schematic',
    grid: {
      columns,
      rows: 3,
      colSpacing: 160,
      rowSpacing: 120,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + (columns - 1) * 160,
        height: 60 * 2 + 2 * 120
      }
    },
    components,
    netlist
  };
}

export function buildParallelSchematic(params) {
  const { V = 230, f = 50 } = params;
  const includeSwitch = params.includeSwitch === true;
  const includeGround = params.includeGround === true;

  let compsPresent = [];
  if (Array.isArray(params.components) && params.components.length > 0) {
    compsPresent = params.components.map((comp, idx) => ({
      id: comp.id || `${comp.type.slice(0, 1).toUpperCase()}${idx + 1}`,
      symbol: comp.type === 'resistor' ? 'resistor' : comp.type === 'inductor' ? 'inductor' : comp.type === 'capacitor' ? 'capacitor' : comp.type,
      label: comp.label || `${comp.type.slice(0, 1).toUpperCase()}${idx + 1}`,
      value: comp.rawValue || comp.value
    }));
  } else {
    // Backwards compatibility
    const R = params.R !== undefined ? parseFloat(params.R) : 0;
    const L = params.L !== undefined ? parseFloat(params.L) : 0;
    const C = params.C !== undefined ? parseFloat(params.C) : 0;
    if (R > 0) compsPresent.push({ id: 'R', symbol: 'resistor', label: 'R', value: R });
    if (L > 0) compsPresent.push({ id: 'L', symbol: 'inductor', label: 'L', value: L });
    if (C > 0) compsPresent.push({ id: 'C', symbol: 'capacitor', label: 'C', value: C });
    if (compsPresent.length === 0) {
      compsPresent.push({ id: 'R', symbol: 'resistor', label: 'R', value: 10 });
    }
  }

  const len = compsPresent.length;

  const components = [
    { id: 'VS', symbol: f > 0 ? 'ac-source' : 'dc-source', grid: [0, 1.0], label: 'Vs', rotation: 0 },
    { id: 'J_top_left', symbol: 'wire-junction', grid: [0, 0.0] },
    { id: 'J_bot_left', symbol: 'wire-junction', grid: [0, 2.0] }
  ];

  if (includeGround) {
    components.push({ id: 'Gnd', symbol: 'ground', grid: [0, 2.2] });
  }

  if (includeSwitch) {
    components.push({ id: 'SW', symbol: 'switch', grid: [0.5, 0.0], label: 'Switch', rotation: 0 });
  }

  // Add parallel branch components and rail junctions
  compsPresent.forEach((comp, idx) => {
    const col = 1 + idx;
    components.push({
      id: comp.id,
      symbol: comp.symbol,
      grid: [col, 1.0],
      label: comp.label,
      value: comp.value,
      rotation: 90
    });
    components.push({
      id: `J_top_${col}`,
      symbol: 'wire-junction',
      grid: [col, 0.0]
    });
    components.push({
      id: `J_bot_${col}`,
      symbol: 'wire-junction',
      grid: [col, 2.0]
    });
  });

  const netlist = [
    { from: 'VS.top', to: 'J_top_left.1' },
    { from: 'VS.bottom', to: 'J_bot_left.1' }
  ];

  if (includeGround) {
    netlist.push({ from: 'Gnd.top', to: 'J_bot_left.1' });
  }

  if (includeSwitch) {
    netlist.push({ from: 'J_top_left.1', to: 'SW.left' });
    netlist.push({ from: 'SW.right', to: 'J_top_1.1' });
  } else {
    netlist.push({ from: 'J_top_left.1', to: 'J_top_1.1' });
  }

  netlist.push({ from: 'J_bot_left.1', to: 'J_bot_1.1' });

  // Connect branches to junctions and chain junctions horizontally to form rails
  for (let idx = 0; idx < len; idx++) {
    const col = 1 + idx;
    const compId = compsPresent[idx].id;

    // Connect top and bottom of branch component to top and bottom junctions
    netlist.push({ from: `J_top_${col}.1`, to: `${compId}.top` });
    netlist.push({ from: `${compId}.bottom`, to: `J_bot_${col}.1` });

    // Connect horizontal rail segments to adjacent branches
    if (idx < len - 1) {
      netlist.push({ from: `J_top_${col}.1`, to: `J_top_${col + 1}.1` });
      netlist.push({ from: `J_bot_${col}.1`, to: `J_bot_${col + 1}.1` });
    }
  }

  return {
    type: 'circuit-schematic',
    grid: {
      columns: 1 + len,
      rows: 3,
      colSpacing: 160,
      rowSpacing: 120,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + len * 160,
        height: 60 * 2 + 2 * 120
      }
    },
    components,
    netlist
  };
}

/**
 * Programmatic layout for balanced 3-phase star connected load (T-connection representation)
 */
export function buildStarSchematic(params) {
  const R = params.R !== undefined ? parseFloat(params.R) : 10;
  let XL = params.XL !== undefined ? parseFloat(params.XL) : 10;
  const L = params.L !== undefined ? parseFloat(params.L) : 0;
  const V = params.V !== undefined ? parseFloat(params.V) : 400;
  const f = params.f !== undefined ? parseFloat(params.f) : 50;

  if (XL === 0 && L > 0 && f > 0) {
    XL = 2 * Math.PI * f * L;
  }

  const xlStr = `${XL.toFixed(2)} Ω`;

  const components = [
    // Line A branch (top horizontal)
    { id: 'RA', symbol: 'resistor', grid: [1, 0.0], label: 'RA', value: `${R} Ω`, rotation: 0 },
    { id: 'LA', symbol: 'inductor', grid: [2, 0.0], label: 'LA', value: xlStr, rotation: 0 },
    
    // Line B branch (bottom horizontal)
    { id: 'RB', symbol: 'resistor', grid: [1, 2.0], label: 'RB', value: `${R} Ω`, rotation: 0 },
    { id: 'LB', symbol: 'inductor', grid: [2, 2.0], label: 'LB', value: xlStr, rotation: 0 },
    
    // Line C branch (center vertical)
    { id: 'RC', symbol: 'resistor', grid: [3, 1.4], label: 'RC', value: `${R} Ω`, rotation: 90 },
    { id: 'LC', symbol: 'inductor', grid: [3, 2.1], label: 'LC', value: xlStr, rotation: 90 },

    // Junctions
    { id: 'J_A', symbol: 'wire-junction', grid: [3, 0.0] },
    { id: 'J_B', symbol: 'wire-junction', grid: [3, 2.0] },
    { id: 'J_N', symbol: 'wire-junction', grid: [3, 0.8] }, // Neutral point

    // Input line terminals
    { id: 'Term_A', symbol: 'wire-junction', grid: [0, 0.0] },
    { id: 'Term_B', symbol: 'wire-junction', grid: [0, 2.0] },
    { id: 'Term_C', symbol: 'wire-junction', grid: [3, 2.8] }
  ];

  const netlist = [
    // Branch A connections
    { from: 'Term_A.1', to: 'RA.left' },
    { from: 'RA.right', to: 'LA.left' },
    { from: 'LA.right', to: 'J_A.1' },
    { from: 'J_A.1', to: 'J_N.1' },

    // Branch B connections
    { from: 'Term_B.1', to: 'RB.left' },
    { from: 'RB.right', to: 'LB.left' },
    { from: 'LB.right', to: 'J_B.1' },
    { from: 'J_B.1', to: 'J_N.1' },

    // Branch C connections
    { from: 'J_N.1', to: 'RC.top' },
    { from: 'RC.bottom', to: 'LC.top' },
    { from: 'LC.bottom', to: 'Term_C.1' }
  ];

  const supplyText = `${V} V, ${f} Hz Supply`;

  return {
    type: 'circuit-schematic',
    grid: {
      columns: 4,
      rows: 4,
      colSpacing: 160,
      rowSpacing: 110,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + 3 * 160,
        height: 60 * 2 + 3 * 110
      }
    },
    components,
    netlist,
    labels: [
      { text: 'Line A (R)', x: 65, y: 55, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'end' },
      { text: 'Line B (Y)', x: 65, y: 275, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'end' },
      { text: 'Line C (B)', x: 575, y: 380, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'middle' },
      { text: 'Neutral N', x: 580, y: 140, fontSize: 11, fontWeight: '700', fill: '#475569', textAnchor: 'start' },
      { text: supplyText, x: 240, y: 380, fontSize: 12, fontWeight: '700', fill: '#0f172a', textAnchor: 'middle' }
    ]
  };
}

export function buildDeltaSchematic(params) {
  const R = params.R !== undefined ? parseFloat(params.R) : 12;
  let XL = params.XL !== undefined ? parseFloat(params.XL) : 16;
  const L = params.L !== undefined ? parseFloat(params.L) : 0;
  const V = params.V !== undefined ? parseFloat(params.V) : 400;
  const f = params.f !== undefined ? parseFloat(params.f) : 50;

  if (XL === 0 && L > 0 && f > 0) {
    XL = 2 * Math.PI * f * L;
  }

  const xlStr = `${XL.toFixed(2)} Ω`;

  const isPureResistor = params.RAB !== undefined || params.RBC !== undefined || params.RCA !== undefined;
  
  const rab_val = params.RAB || params.R12 || R;
  const rbc_val = params.RBC || params.R23 || R;
  const rca_val = params.RCA || params.R31 || R;

  const components = [];
  const netlist = [];

  // Terminal Line inputs
  components.push({ id: 'Term_A', symbol: 'wire-junction', grid: [0, 0] });
  components.push({ id: 'Term_B', symbol: 'wire-junction', grid: [0, 3] });
  components.push({ id: 'Term_C', symbol: 'wire-junction', grid: [4, 1.5] });

  // Main Delta vertices junctions
  components.push({ id: 'J_A', symbol: 'wire-junction', grid: [1, 0] });
  components.push({ id: 'J_B', symbol: 'wire-junction', grid: [1, 3] });
  components.push({ id: 'J_C', symbol: 'wire-junction', grid: [3, 1.5] });

  // Corner junctions for routing top/bottom lines to C
  components.push({ id: 'J_CA_corner', symbol: 'wire-junction', grid: [3, 0] });
  components.push({ id: 'J_BC_corner', symbol: 'wire-junction', grid: [3, 3] });

  netlist.push({ from: 'Term_A.1', to: 'J_A.1' });
  netlist.push({ from: 'Term_B.1', to: 'J_B.1' });
  netlist.push({ from: 'Term_C.1', to: 'J_C.1' });

  if (isPureResistor) {
    // Pure Resistor delta configuration
    components.push({ id: 'RAB', symbol: 'resistor', grid: [1, 1.5], label: 'RAB', value: `${rab_val} Ω`, rotation: 90 });
    components.push({ id: 'RBC', symbol: 'resistor', grid: [2.0, 3], label: 'RBC', value: `${rbc_val} Ω`, rotation: 0 });
    components.push({ id: 'RCA', symbol: 'resistor', grid: [2.0, 0], label: 'RCA', value: `${rca_val} Ω`, rotation: 0 });

    netlist.push({ from: 'J_A.1', to: 'RAB.top' });
    netlist.push({ from: 'RAB.bottom', to: 'J_B.1' });

    netlist.push({ from: 'J_B.1', to: 'RBC.left' });
    netlist.push({ from: 'RBC.right', to: 'J_BC_corner.1' });
    netlist.push({ from: 'J_BC_corner.1', to: 'J_C.1' });

    netlist.push({ from: 'J_A.1', to: 'RCA.left' });
    netlist.push({ from: 'RCA.right', to: 'J_CA_corner.1' });
    netlist.push({ from: 'J_CA_corner.1', to: 'J_C.1' });
  } else {
    // Delta load with series R-L coils (standard for 3-phase numericals)
    components.push({ id: 'RAB', symbol: 'resistor', grid: [1, 1.0], label: 'RAB', value: `${rab_val} Ω`, rotation: 90 });
    components.push({ id: 'LAB', symbol: 'inductor', grid: [1, 2.0], label: 'LAB', value: xlStr, rotation: 90 });

    components.push({ id: 'RBC', symbol: 'resistor', grid: [2.0, 3.0], label: 'RBC', value: `${rbc_val} Ω`, rotation: 0 });
    components.push({ id: 'LBC', symbol: 'inductor', grid: [3.0, 2.25], label: 'LBC', value: xlStr, rotation: 90 });

    components.push({ id: 'RCA', symbol: 'resistor', grid: [2.0, 0.0], label: 'RCA', value: `${rca_val} Ω`, rotation: 0 });
    components.push({ id: 'LCA', symbol: 'inductor', grid: [3.0, 0.75], label: 'LCA', value: xlStr, rotation: 90 });

    netlist.push({ from: 'J_A.1', to: 'RAB.top' });
    netlist.push({ from: 'RAB.bottom', to: 'LAB.top' });
    netlist.push({ from: 'LAB.bottom', to: 'J_B.1' });

    netlist.push({ from: 'J_B.1', to: 'RBC.left' });
    netlist.push({ from: 'RBC.right', to: 'J_BC_corner.1' });
    netlist.push({ from: 'J_BC_corner.1', to: 'LBC.bottom' });
    netlist.push({ from: 'LBC.top', to: 'J_C.1' });

    netlist.push({ from: 'J_A.1', to: 'RCA.left' });
    netlist.push({ from: 'RCA.right', to: 'J_CA_corner.1' });
    netlist.push({ from: 'J_CA_corner.1', to: 'LCA.top' });
    netlist.push({ from: 'LCA.bottom', to: 'J_C.1' });
  }

  const supplyText = `${V} V, ${f} Hz 3-Phase Supply`;

  return {
    type: 'circuit-schematic',
    grid: {
      columns: 5,
      rows: 4,
      colSpacing: 160,
      rowSpacing: 110,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + 4 * 160,
        height: 60 * 2 + 3 * 110
      }
    },
    components,
    netlist,
    labels: [
      { text: 'Line A (R)', x: 65, y: 55, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'end' },
      { text: 'Line B (Y)', x: 65, y: 375, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'end' },
      { text: 'Line C (B)', x: 735, y: 225, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'start' },
      { text: supplyText, x: 320, y: 400, fontSize: 12, fontWeight: '700', fill: '#0f172a', textAnchor: 'middle' }
    ]
  };
}

export function buildSeriesParallelSchematic(params) {
  const { V = 230, f = 50 } = params;
  const includeSwitch = params.includeSwitch === true;
  const includeGround = params.includeGround === true;

  const seriesComps = params.seriesComponents || [];
  const branches = params.branches || [];

  const components = [];
  const netlist = [];

  // Col 0: source
  components.push({ id: 'VS', symbol: f > 0 ? 'ac-source' : 'dc-source', grid: [0, 1.5], label: 'Vs', rotation: 0 });
  components.push({ id: 'J_top_left', symbol: 'wire-junction', grid: [0, 0] });
  components.push({ id: 'J_bot_left', symbol: 'wire-junction', grid: [0, 3] });

  netlist.push({ from: 'VS.top', to: 'J_top_left.1' });
  netlist.push({ from: 'VS.bottom', to: 'J_bot_left.1' });

  if (includeGround) {
    components.push({ id: 'Gnd', symbol: 'ground', grid: [0, 3.2] });
    netlist.push({ from: 'Gnd.top', to: 'J_bot_left.1' });
  }

  let currentX = 0;
  let lastTopNode = 'J_top_left.1';

  if (includeSwitch) {
    currentX += 0.8;
    components.push({ id: 'SW', symbol: 'switch', grid: [currentX, 0], label: 'Switch', rotation: 0 });
    netlist.push({ from: lastTopNode, to: 'SW.left' });
    lastTopNode = 'SW.right';
  }

  // Place series components horizontally on row 0
  seriesComps.forEach((comp, idx) => {
    currentX += 1.0;
    const compId = comp.id || `Rs${idx + 1}`;
    components.push({
      id: compId,
      symbol: comp.type === 'resistor' ? 'resistor' : comp.type === 'inductor' ? 'inductor' : comp.type === 'capacitor' ? 'capacitor' : comp.type,
      grid: [currentX, 0],
      label: comp.label || compId,
      value: comp.value,
      rotation: 0
    });
    netlist.push({ from: lastTopNode, to: `${compId}.left` });
    lastTopNode = `${compId}.right`;
  });

  // Now the parallel branches
  currentX += 0.8; 
  const branchStartX = currentX;
  
  components.push({ id: 'J_branch_top_in', symbol: 'wire-junction', grid: [branchStartX, 0] });
  netlist.push({ from: lastTopNode, to: 'J_branch_top_in.1' });

  components.push({ id: 'J_branch_bot_out', symbol: 'wire-junction', grid: [branchStartX, 3] });
  netlist.push({ from: 'J_branch_bot_out.1', to: 'J_bot_left.1' });

  branches.forEach((branch, bIdx) => {
    const colX = branchStartX + bIdx + 1;
    
    components.push({ id: `J_top_b${bIdx}`, symbol: 'wire-junction', grid: [colX, 0] });
    components.push({ id: `J_bot_b${bIdx}`, symbol: 'wire-junction', grid: [colX, 3] });

    if (bIdx === 0) {
      netlist.push({ from: 'J_branch_top_in.1', to: `J_top_b${bIdx}.1` });
      netlist.push({ from: 'J_branch_bot_out.1', to: `J_bot_b${bIdx}.1` });
    } else {
      netlist.push({ from: `J_top_b${bIdx - 1}.1`, to: `J_top_b${bIdx}.1` });
      netlist.push({ from: `J_bot_b${bIdx - 1}.1`, to: `J_bot_b${bIdx}.1` });
    }

    const numComps = branch.length;
    let lastBranchNode = `J_top_b${bIdx}.1`;

    branch.forEach((comp, cIdx) => {
      const compId = comp.id || `B${bIdx + 1}_C${cIdx + 1}`;
      let rowY = 1.5;
      if (numComps === 2) {
        rowY = cIdx === 0 ? 1.0 : 2.0;
      } else if (numComps === 3) {
        rowY = cIdx === 0 ? 0.75 : cIdx === 1 ? 1.5 : 2.25;
      }
      
      components.push({
        id: compId,
        symbol: comp.type === 'resistor' ? 'resistor' : comp.type === 'inductor' ? 'inductor' : comp.type === 'capacitor' ? 'capacitor' : comp.type,
        grid: [colX, rowY],
        label: comp.label || compId,
        value: comp.value,
        rotation: 90
      });

      netlist.push({ from: lastBranchNode, to: `${compId}.top` });
      lastBranchNode = `${compId}.bottom`;
    });

    netlist.push({ from: lastBranchNode, to: `J_bot_b${bIdx}.1` });
  });

  const columns = branchStartX + branches.length + 1;

  return {
    type: 'circuit-schematic',
    grid: {
      columns,
      rows: 4,
      colSpacing: 150,
      rowSpacing: 110,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + (columns - 1) * 150,
        height: 60 * 2 + 3 * 110
      }
    },
    components,
    netlist
  };
}

export function buildBridgeSchematic(params) {
  const { R1 = '10', R2 = '10', R3 = '10', R4 = '10', R5 = '10', V = '10', f = '0' } = params;

  const components = [
    { id: 'VS', symbol: parseFloat(f) > 0 ? 'ac-source' : 'dc-source', grid: [0, 2], label: 'Vs', value: `${V}V`, rotation: 0 },
    
    { id: 'J_TL', symbol: 'wire-junction', grid: [1, 0] },
    { id: 'J_BL', symbol: 'wire-junction', grid: [1, 4] },
    
    { id: 'J_top_mid_L', symbol: 'wire-junction', grid: [1.5, 0] },
    { id: 'J_top_mid_R', symbol: 'wire-junction', grid: [3.5, 0] },
    { id: 'J_bot_mid_L', symbol: 'wire-junction', grid: [1.5, 4] },
    { id: 'J_bot_mid_R', symbol: 'wire-junction', grid: [3.5, 4] },

    { id: 'J_ML', symbol: 'wire-junction', grid: [1.5, 2] },
    { id: 'J_MR', symbol: 'wire-junction', grid: [3.5, 2] },

    { id: 'J_TR', symbol: 'wire-junction', grid: [4, 0] },
    { id: 'J_BR', symbol: 'wire-junction', grid: [4, 4] },

    { id: 'R1', symbol: 'resistor', grid: [1.5, 1], label: 'R1', value: `${R1} Ω`, rotation: 90 },
    { id: 'R2', symbol: 'resistor', grid: [3.5, 1], label: 'R2', value: `${R2} Ω`, rotation: 90 },
    { id: 'R3', symbol: 'resistor', grid: [1.5, 3], label: 'R3', value: `${R3} Ω`, rotation: 90 },
    { id: 'R4', symbol: 'resistor', grid: [3.5, 3], label: 'R4', value: `${R4} Ω`, rotation: 90 },
    
    { id: 'R5', symbol: 'resistor', grid: [2.5, 2], label: 'R5', value: `${R5} Ω`, rotation: 0 }
  ];

  const netlist = [
    { from: 'VS.top', to: 'J_TL.1' },
    { from: 'VS.bottom', to: 'J_BL.1' },

    { from: 'J_TL.1', to: 'J_top_mid_L.1' },
    { from: 'J_top_mid_L.1', to: 'R1.top' },
    { from: 'J_top_mid_L.1', to: 'J_top_mid_R.1' },
    { from: 'J_top_mid_R.1', to: 'R2.top' },
    { from: 'J_top_mid_R.1', to: 'J_TR.1' },

    { from: 'J_BL.1', to: 'J_bot_mid_L.1' },
    { from: 'J_bot_mid_L.1', to: 'R3.bottom' },
    { from: 'J_bot_mid_L.1', to: 'J_bot_mid_R.1' },
    { from: 'J_bot_mid_R.1', to: 'R4.bottom' },
    { from: 'J_bot_mid_R.1', to: 'J_BR.1' },

    { from: 'J_TR.1', to: 'J_BR.1' },

    { from: 'R1.bottom', to: 'J_ML.1' },
    { from: 'R3.top', to: 'J_ML.1' },
    { from: 'R2.bottom', to: 'J_MR.1' },
    { from: 'R4.top', to: 'J_MR.1' },

    { from: 'J_ML.1', to: 'R5.left' },
    { from: 'R5.right', to: 'J_MR.1' }
  ];

  return {
    type: 'circuit-schematic',
    grid: {
      columns: 5,
      rows: 5,
      colSpacing: 140,
      rowSpacing: 100,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + 4 * 140,
        height: 60 * 2 + 4 * 100
      }
    },
    components,
    netlist
  };
}

export function buildBjtBiasSchematic(params) {
  const { Vcc = '12', R1 = '10k', R2 = '2.2k', RC = '1k', RE = '500' } = params;
  
  const components = [
    { id: 'VCC', symbol: 'vcc-rail', grid: [2, 0], label: `Vcc = ${Vcc}V` },
    { id: 'Gnd1', symbol: 'ground', grid: [1, 4.2] },
    { id: 'Gnd2', symbol: 'ground', grid: [2, 4.2] },
    
    { id: 'Q1', symbol: 'bjt-npn', grid: [2, 2], label: 'Q1' },

    { id: 'R1', symbol: 'resistor', grid: [1, 1], label: 'R1', value: R1, rotation: 90 },
    { id: 'R2', symbol: 'resistor', grid: [1, 3], label: 'R2', value: R2, rotation: 90 },
    { id: 'RC', symbol: 'resistor', grid: [2, 1], label: 'Rc', value: RC, rotation: 90 },
    { id: 'RE', symbol: 'resistor', grid: [2, 3], label: 'Re', value: RE, rotation: 90 },

    { id: 'J_base', symbol: 'wire-junction', grid: [1, 2] },
    { id: 'J_vcc', symbol: 'wire-junction', grid: [1, 0] }
  ];

  const netlist = [
    { from: 'VCC.bottom', to: 'RC.top' },
    { from: 'RC.top', to: 'J_vcc.1' },
    { from: 'J_vcc.1', to: 'R1.top' },

    { from: 'R1.bottom', to: 'J_base.1' },
    { from: 'J_base.1', to: 'R2.top' },
    { from: 'J_base.1', to: 'Q1.base' },

    { from: 'RC.bottom', to: 'Q1.collector' },
    { from: 'Q1.emitter', to: 'RE.top' },

    { from: 'R2.bottom', to: 'Gnd1.top' },
    { from: 'RE.bottom', to: 'Gnd2.top' }
  ];

  return {
    type: 'circuit-schematic',
    grid: {
      columns: 3,
      rows: 5,
      colSpacing: 150,
      rowSpacing: 100,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + 2 * 150,
        height: 60 * 2 + 4 * 100
      }
    },
    components,
    netlist
  };
}

export function buildOpampMathSchematic(params) {
  const { Rf = '10k', R1 = '1k', R2 = '1k', R3 = '1k', V1 = '1', V2 = '1', V3 = '1' } = params;

  const components = [
    { id: 'OP1', symbol: 'op-amp', grid: [3, 2], label: 'LM741' },

    { id: 'R_in1', symbol: 'resistor', grid: [1, 1.0], label: 'R1', value: R1, rotation: 0 },
    { id: 'R_in2', symbol: 'resistor', grid: [1, 1.8], label: 'R2', value: R2, rotation: 0 },
    
    { id: 'RF', symbol: 'resistor', grid: [2.5, 0.8], label: 'Rf', value: Rf, rotation: 0 },

    { id: 'J_sum', symbol: 'wire-junction', grid: [2, 1.8] },
    { id: 'J_fb_out', symbol: 'wire-junction', grid: [3.8, 2] },
    { id: 'J_fb_in', symbol: 'wire-junction', grid: [2, 0.8] },

    { id: 'Gnd', symbol: 'ground', grid: [2.5, 2.4] }
  ];

  const netlist = [
    { from: 'R_in1.right', to: 'J_sum.1' },
    { from: 'R_in2.right', to: 'J_sum.1' },

    { from: 'J_sum.1', to: 'OP1.inverting' },

    { from: 'J_sum.1', to: 'J_fb_in.1' },
    { from: 'J_fb_in.1', to: 'RF.left' },
    { from: 'RF.right', to: 'J_fb_out.1' },
    { from: 'J_fb_out.1', to: 'OP1.output' },

    { from: 'Gnd.top', to: 'OP1.non-inverting' }
  ];

  return {
    type: 'circuit-schematic',
    grid: {
      columns: 5,
      rows: 4,
      colSpacing: 150,
      rowSpacing: 100,
      padding: { left: 80, top: 60 },
      viewBox: {
        width: 80 * 2 + 4 * 150,
        height: 60 * 2 + 3 * 100
      }
    },
    components,
    netlist,
    labels: [
      { text: `V1 = ${V1}V`, x: 65, y: 105, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'end' },
      { text: `V2 = ${V2}V`, x: 65, y: 185, fontSize: 11, fontWeight: '700', fill: '#0f172a', textAnchor: 'end' }
    ]
  };
}

