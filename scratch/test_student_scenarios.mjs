/**
 * scratch/test_student_scenarios.mjs
 * Automated test script to evaluate 11 first-year basic engineering scenarios.
 */


const SCENARIOS = [
  {
    name: '1. Star-Delta Conversion (Star to Delta)',
    query: 'Find equivalent delta resistance for star branch resistances RA=3 ohm, RB=4 ohm, RC=5 ohm.'
  },
  {
    name: '2. Star-Delta Conversion (Delta to Star)',
    query: 'Convert a delta circuit with RAB=10 ohm, RBC=20 ohm, RCA=30 ohm to equivalent star circuit.'
  },
  {
    name: '3. Balanced 3-Phase Star Load',
    query: 'A balanced 3-phase star connected load consists of R=15 ohm and L=0.03H coil in each phase connected to 415V, 50Hz supply.'
  },
  {
    name: '4. Balanced 3-Phase Delta Load',
    query: 'A balanced three-phase delta load has resistance of 20 ohm and inductance of 0.05H in each phase connected to 400V, 50Hz supply.'
  },
  {
    name: '5. Series RLC Circuit (AC)',
    query: 'A series RLC circuit has R=10 ohm, L=0.1H, and C=100uF connected across a 230V, 50Hz supply.'
  },
  {
    name: '6. Series RL Circuit (AC)',
    query: 'An inductive coil with R=15 ohm, L=0.04H is connected in series with a 10 ohm resistor across 200V, 50Hz.'
  },
  {
    name: '7. Parallel RLC Circuit (AC / Series-Parallel Branches)',
    query: 'A parallel circuit consists of two branches. Branch 1 has R=10 ohm and L=0.02H. Branch 2 has R=20 ohm and C=50uF. Connected to 230V, 50Hz supply.'
  },
  {
    name: '8. Thevenin Equivalent Circuit',
    query: 'Find Thevenins equivalent circuit across terminals A and B where Vth=10V, Rth=5 ohm, and RL=15 ohm.'
  },
  {
    name: '9. Superposition Theorem Circuit',
    query: 'A circuit has two sources: V1=20V in series with R1=4 ohm, and V2=10V in series with R2=6 ohm, connected in parallel with R3=10 ohm.'
  },
  {
    name: '10. Zener Voltage Regulator',
    query: 'A Zener voltage regulator has input voltage Vin=15V, series resistor Rs=220 ohm, zener voltage Vz=6.2V, and load resistance Rl=1000 ohm.'
  },
  {
    name: '11. Inverting Op-Amp circuit',
    query: 'An inverting op-amp has input voltage Vin=1V, input resistor R1=10k ohm, and feedback resistor Rf=100k ohm.'
  }
];

async function runTests() {
  console.log('=== STARTING FIRST-YEAR ENGINEERING CIRCUIT SCENARIO TESTS ===\n');

  let passedCount = 0;

  for (const scenario of SCENARIOS) {
    console.log(`Running Scenario: ${scenario.name}`);
    console.log(`Prompt: "${scenario.query}"`);

    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: scenario.query, useProModel: false })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`✗ Failed with Status: ${response.status}`);
        console.error(`  Error message: ${errText}`);
        continue;
      }

      const json = await response.json();
      if (json.success) {
        passedCount++;
        console.log(`✓ Success: true`);
        console.log(`  Source: ${json.data.source}`);
        console.log(`  Title: ${json.data.title}`);
        console.log(`  Matched Template: ${json.meta?.model || 'N/A'}`);
        if (json.data.schema) {
          console.log(`  Grid Columns: ${json.data.schema.grid?.columns}, Rows: ${json.data.schema.grid?.rows}`);
          console.log(`  Components count: ${json.data.schema.components?.length}`);
          console.log(`  Netlist connections: ${json.data.schema.netlist?.length}`);
        }
      } else {
        console.log(`✗ Success: false`);
      }
    } catch (err) {
      console.error(`✗ Network/Server error:`, err.message);
    }
    console.log('---------------------------------------------------\n');
  }

  console.log(`=== SCENARIO RUN COMPLETED ===`);
  console.log(`Passed Scenarios: ${passedCount} / ${SCENARIOS.length}`);
}

runTests();
