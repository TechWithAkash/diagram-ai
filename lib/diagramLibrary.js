/**
 * diagramLibrary.js
 * Imports all JSON diagram definitions and builds a Fuse.js search index.
 * Used by the /api/generate route for Tier 1 instant library matching.
 */
import Fuse from 'fuse.js'
import compiledCatalog from './mumbai-university-compiled-index.json'

// ─── Import all diagram JSONs ─────────────────────────────────────────────────
import arch8086   from './diagrams/microprocessors/8086-architecture.json'
import arch8085   from './diagrams/microprocessors/8085-architecture.json'
import arch8051   from './diagrams/microprocessors/8051-architecture.json'
import vonNeumann from './diagrams/microprocessors/von-neumann.json'
import ppi8255    from './diagrams/microprocessors/8255-ppi.json'
import pic8259    from './diagrams/microprocessors/8259-pic.json'
import dma8257    from './diagrams/microprocessors/8257-dma.json'
import timer8254  from './diagrams/microprocessors/8254-timer.json'
import dma8237    from './diagrams/microprocessors/8237-dma.json'
import pin8086    from './diagrams/microprocessors/pin-8086.json'
import pin8085    from './diagrams/microprocessors/pin-8085.json'
import timingOpcodeFetch from './diagrams/microprocessors/timing-opcode-fetch.json'
import timingMemoryWrite from './diagrams/microprocessors/timing-memory-write.json'
import timingMemoryRead  from './diagrams/microprocessors/timing-memory-read.json'
import timingIoRead      from './diagrams/microprocessors/timing-io-read.json'
import timingIoWrite     from './diagrams/microprocessors/timing-io-write.json'
import pin8051           from './diagrams/microprocessors/pin-8051.json'
import pin8255           from './diagrams/microprocessors/pin-8255.json'
import stagePipeline5    from './diagrams/microprocessors/5-stage-pipeline.json'
import pipelineHazards      from './diagrams/microprocessors/pipeline-hazards.json'
import cacheDirectMapping   from './diagrams/microprocessors/cache-direct-mapping.json'
import cacheSetAssociative  from './diagrams/microprocessors/cache-set-associative.json'
import cacheAssociative     from './diagrams/microprocessors/cache-associative-mapping.json'
import memoryInterfacing    from './diagrams/microprocessors/memory-interfacing.json'

import osiModel    from './diagrams/networks/osi-model.json'
import tcpIpModel  from './diagrams/networks/tcp-ip-model.json'
import tcpHandshake from './diagrams/networks/tcp-handshake.json'
import gsmArch     from './diagrams/networks/gsm-architecture.json'
import dnsResolution from './diagrams/networks/dns-resolution.json'
import arpProtocol   from './diagrams/networks/arp-protocol.json'
import csmaCdProtocol from './diagrams/networks/csma-cd-protocol.json'
import ethernetFrame  from './diagrams/networks/ethernet-frame.json'
import ipv4Header    from './diagrams/networks/ipv4-header.json'
import dhcpDora       from './diagrams/networks/dhcp-dora.json'
import csmaCaFlowchart   from './diagrams/networks/csma-ca-flowchart.json'
import natTranslation    from './diagrams/networks/nat-translation.json'
import smtpFlow          from './diagrams/networks/smtp-flow.json'
import httpRequestResponse from './diagrams/networks/http-request-response.json'
import routingAlgorithms  from './diagrams/networks/routing-algorithms.json'

import processLifeCycle from './diagrams/os/process-life-cycle.json'
import memoryHierarchy  from './diagrams/os/memory-hierarchy.json'

import waterfallModel from './diagrams/sdlc/waterfall-model.json'
import vModel         from './diagrams/sdlc/v-model.json'
import agileScrum     from './diagrams/sdlc/agile-scrum.json'
import spiralModel    from './diagrams/sdlc/spiral-model.json'
import prototypeModel from './diagrams/sdlc/prototype-model.json'

import threeSchema    from './diagrams/dbms/three-schema.json'
import dbmsArchitecture from './diagrams/dbms/dbms-architecture.json'
import dbmsTransactionState from './diagrams/dbms/dbms-transaction-state.json'
import bplusTree from './diagrams/dbms/bplus-tree.json'
import compilerPhases from './diagrams/compiler/compiler-phases.json'
import parseTree from './diagrams/compiler/parse-tree.json'
import dfaAutomata from './diagrams/compiler/dfa-automata.json'

import dfdLibrary from './diagrams/se/dfd-library-l0-l1.json'
import dfdHospital from './diagrams/se/dfd-hospital-l0-l1.json'
import dfdHotel from './diagrams/se/dfd-hotel-l0-l1.json'
import umlAtmUsecase from './diagrams/se/uml-atm-usecase.json'
import umlLibraryClass from './diagrams/se/uml-library-class.json'
import umlAtmSequence from './diagrams/se/uml-atm-sequence.json'
import umlShoppingClass from './diagrams/se/uml-shopping-class.json'

import halfAdderGates from './diagrams/electronics/half-adder-gates.json'
import fullAdderGates from './diagrams/electronics/full-adder-gates.json'
import mux2to1Gates from './diagrams/electronics/mux-2to1-gates.json'
import srLatchGates from './diagrams/electronics/sr-latch-gates.json'
import dFlipflopGates from './diagrams/electronics/d-flipflop-gates.json'
import dFlipflopBlock from './diagrams/electronics/d-flipflop-block.json'
import jkFlipflopGates from './diagrams/electronics/jk-flipflop-gates.json'
import jkFlipflopBlock from './diagrams/electronics/jk-flipflop-block.json'
import jkToDConversion from './diagrams/electronics/jk-to-d-conversion.json'
import dToJkConversion from './diagrams/electronics/d-to-jk-conversion.json'
import tFlipflop from './diagrams/electronics/t-flipflop.json'
import shiftRegister from './diagrams/electronics/shift-register.json'
import ringCounter from './diagrams/electronics/ring-counter.json'
import signalFlowGraph from './diagrams/electronics/signal-flow-graph.json'
import fftButterflyDif from './diagrams/electronics/fft-butterfly-dif.json'
import mux4to1Gates from './diagrams/electronics/mux-4to1-gates.json'
import decoder2to4Gates from './diagrams/electronics/decoder-2to4-gates.json'
import encoder4to2Gates from './diagrams/electronics/encoder-4to2-gates.json'
import halfwaveRectifier from './diagrams/electronics/halfwave-rectifier.json'
import fullwaveBridgeRectifier from './diagrams/electronics/fullwave-bridge-rectifier.json'
import opampInverting from './diagrams/electronics/opamp-inverting.json'
import opampNoninverting from './diagrams/electronics/opamp-noninverting.json'
import opampInstrumentation from './diagrams/electronics/opamp-instrumentation.json'

import binarySearchTree from './diagrams/algorithms/binary-search-tree.json'
import bubbleSortSteps from './diagrams/algorithms/bubble-sort-steps.json'
import linearVsBinarySearch from './diagrams/algorithms/linear-vs-binary-search.json'
import avlTree from './diagrams/algorithms/avl-tree.json'
import heapStructure from './diagrams/algorithms/heap-structure.json'

import superpositionTheoremCircuit from './diagrams/electronics/superposition-theorem-circuit.json'
import theveninsTheoremCircuit from './diagrams/electronics/thevenins-theorem-circuit.json'
import transformerEquivalentCircuit from './diagrams/electronics/transformer-equivalent-circuit.json'
import trussCantileverForces from './diagrams/electronics/truss-cantilever-forces.json'
import opticalFiberTir from './diagrams/networks/optical-fiber-tir.json'
import zeoliteProcessFlow from './diagrams/compiler/zeolite-process-flow.json'
import twoportNetworkZ from './diagrams/electronics/twoport-network-z.json'
import dcShuntMotor from './diagrams/electronics/dc-shunt-motor.json'
import closedLoopControl from './diagrams/electronics/closed-loop-control.json'
import carnotCycle from './diagrams/compiler/carnot-cycle.json'
import fftButterflyDit from './diagrams/electronics/fft-butterfly-dit.json'

import process7StateCycle from './diagrams/os/process-7state-cycle.json'
import pagingHardware from './diagrams/os/paging-hardware.json'
import segmentationHardware from './diagrams/os/segmentation-hardware.json'
import tlbHardware from './diagrams/os/tlb-hardware.json'
import deadlockRag from './diagrams/os/deadlock-rag.json'
import erNotationTable from './diagrams/dbms/er-notation-table.json'
import acRlcCircuit from './diagrams/electronics/ac-rlc-circuit.json'
import nortonEquivalent from './diagrams/electronics/norton-equivalent.json'

// BEE paper diagrams
import starDeltaConversion from './diagrams/electronics/star-delta-conversion.json'
import nortonsTheoremBee from './diagrams/electronics/nortons-theorem-bee.json'
import sourceTransformationCircuit from './diagrams/electronics/source-transformation-circuit.json'
import zenerVoltageRegulator from './diagrams/electronics/zener-voltage-regulator.json'
import bjtSwitchCircuit from './diagrams/electronics/bjt-switch-circuit.json'
import seriesRlCircuit from './diagrams/electronics/series-rl-circuit.json'
import seriesRlcResonance from './diagrams/electronics/series-rlc-resonance.json'
import singlePhaseTransformer from './diagrams/electronics/single-phase-transformer.json'
import starConnection from './diagrams/electronics/star-connection.json'
import deltaConnection from './diagrams/electronics/delta-connection.json'
import classbPushpullAmplifier from './diagrams/electronics/classb-pushpull-amplifier.json'
import hartleyOscillator from './diagrams/electronics/hartley-oscillator.json'
import colpittsOscillator from './diagrams/electronics/colpitts-oscillator.json'
import wienBridgeOscillator from './diagrams/electronics/wien-bridge-oscillator.json'
import rcPhaseShiftOscillator from './diagrams/electronics/rc-phase-shift-oscillator.json'
import astableMultivibrator from './diagrams/electronics/astable-multivibrator.json'
import opampIntegrator from './diagrams/electronics/opamp-integrator.json'
import opampDifferentiator from './diagrams/electronics/opamp-differentiator.json'
import bjtDifferentialAmplifier from './diagrams/electronics/bjt-differential-amplifier.json'
import dcCircuit from './diagrams/electronics/dc-circuit.json'
import acCircuit from './diagrams/electronics/ac-circuit.json'

// Map of diagram coordinates from the static imports by ID
const coordinateMap = new Map();
[
  arch8086,
  arch8085,
  arch8051,
  vonNeumann,
  ppi8255,
  pic8259,
  dma8257,
  timer8254,
  dma8237,
  pin8086,
  pin8085,
  timingOpcodeFetch,
  timingMemoryWrite,
  osiModel,
  tcpIpModel,
  tcpHandshake,
  gsmArch,
  dnsResolution,
  arpProtocol,
  csmaCdProtocol,
  ethernetFrame,
  ipv4Header,
  dhcpDora,
  processLifeCycle,
  memoryHierarchy,
  waterfallModel,
  vModel,
  agileScrum,
  spiralModel,
  prototypeModel,
  threeSchema,
  dbmsArchitecture,
  dbmsTransactionState,
  compilerPhases,
  parseTree,
  dfdLibrary,
  dfdHospital,
  dfdHotel,
  umlAtmUsecase,
  umlLibraryClass,
  umlAtmSequence,
  umlShoppingClass,
  halfAdderGates,
  fullAdderGates,
  mux2to1Gates,
  srLatchGates,
  dFlipflopGates,
  dFlipflopBlock,
  jkFlipflopGates,
  jkFlipflopBlock,
  jkToDConversion,
  dToJkConversion,
  tFlipflop,
  mux4to1Gates,
  decoder2to4Gates,
  encoder4to2Gates,
  halfwaveRectifier,
  fullwaveBridgeRectifier,
  opampInverting,
  opampNoninverting,
  opampInstrumentation,
  binarySearchTree,
  bubbleSortSteps,
  linearVsBinarySearch,
  superpositionTheoremCircuit,
  theveninsTheoremCircuit,
  transformerEquivalentCircuit,
  trussCantileverForces,
  opticalFiberTir,
  zeoliteProcessFlow,
  twoportNetworkZ,
  dcShuntMotor,
  closedLoopControl,
  carnotCycle,
  fftButterflyDit,
  process7StateCycle,
  pagingHardware,
  segmentationHardware,
  tlbHardware,
  deadlockRag,
  erNotationTable,
  acRlcCircuit,
  nortonEquivalent,
  timingMemoryRead,
  timingIoRead,
  timingIoWrite,
  pin8051,
  pin8255,
  stagePipeline5,
  pipelineHazards,
  dfaAutomata,
  shiftRegister,
  ringCounter,
  signalFlowGraph,
  fftButterflyDif,
  avlTree,
  heapStructure,
  bplusTree,
  cacheDirectMapping,
  cacheSetAssociative,
  cacheAssociative,
  memoryInterfacing,
  csmaCaFlowchart,
  natTranslation,
  smtpFlow,
  httpRequestResponse,
  routingAlgorithms,
  starDeltaConversion,
  nortonsTheoremBee,
  sourceTransformationCircuit,
  zenerVoltageRegulator,
  bjtSwitchCircuit,
  seriesRlCircuit,
  seriesRlcResonance,
  singlePhaseTransformer,
  starConnection,
  deltaConnection,
  classbPushpullAmplifier,
  hartleyOscillator,
  colpittsOscillator,
  wienBridgeOscillator,
  rcPhaseShiftOscillator,
  astableMultivibrator,
  opampIntegrator,
  opampDifferentiator,
  bjtDifferentialAmplifier,
  dcCircuit,
  acCircuit,
].forEach(d => {
  if (d && d.id) {
    coordinateMap.set(d.id, d);
  }
});

// Build ALL_DIAGRAMS by merging compiledCatalog with coordinateMap
const mergedDiagrams = compiledCatalog.map(catalogItem => {
  const coordinateItem = coordinateMap.get(catalogItem.id);
  if (coordinateItem) {
    return {
      ...catalogItem,
      ...coordinateItem,
      subject_category: catalogItem.subject,
      category: catalogItem.subject,
      syllabus_reference: catalogItem.syllabus_reference,
      textbook_reference: catalogItem.textbook_reference,
      exam_relevance: catalogItem.exam_relevance,
      department: catalogItem.department,
      semester: catalogItem.semester,
      isStub: false
    };
  }
  return {
    ...catalogItem,
    isStub: true
  }; // Stub diagram (has metadata but no coordinates)
});

// Include any static diagrams that aren't represented in the catalog
const catalogIds = new Set(compiledCatalog.map(c => c.id));
coordinateMap.forEach((d, id) => {
  if (!catalogIds.has(id)) {
    mergedDiagrams.push(d);
  }
});

export const ALL_DIAGRAMS = mergedDiagrams;

// ─── Build Fuse.js search index ──────────────────────────────────────────────
const fuseOptions = {
  keys: [
    { name: 'aliases', weight: 3.0 },  // aliases have highest weight
    { name: 'title',   weight: 1.5 },
    { name: 'category', weight: 0.8 },
    { name: 'id',       weight: 1.0 },
  ],
  threshold: 0.30,          // 0 = exact match, 1 = match anything. Tightened from 0.40
  distance:  200,            // how far to search from start of string
  includeScore: true,
  ignoreLocation: true,     // search anywhere in the string, not just at start
  useExtendedSearch: false,
}

/**
 * matchDiagram — given a user prompt, returns the best matching library entry or null
 * @param {string} prompt  — raw user prompt
 * @param {object} context  — optional filters context (department, semester)
 * @returns {object|null}  — matching diagram JSON or null if no confident match
 */
export function matchDiagram(prompt, context = {}) {
  if (!prompt || prompt.trim().length < 2) return null

  const cleanedPrompt = prompt.trim()
  const lowercasePrompt = cleanedPrompt.toLowerCase()
  
  const { department, semester } = context
  let pool = ALL_DIAGRAMS

  // Direct keyword intercepts for high-frequency BEE/Electronics circuits
  if (/\bstar\b/i.test(lowercasePrompt) && /\bdelta\b/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'star-delta-conversion');
    if (matched) return matched;
  }
  if (/\bsuperposition\b/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'superposition-theorem-circuit');
    if (matched) return matched;
  }
  if (/\bthevenin/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'thevenins-theorem-circuit');
    if (matched) return matched;
  }
  if (/\bnorton/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'nortons-theorem-bee');
    if (matched) return matched;
  }
  if (/\bzener\b/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'zener-voltage-regulator');
    if (matched) return matched;
  }
  if (/\bsource\s+transformation\b/i.test(lowercasePrompt) || (/\bsource\b/i.test(lowercasePrompt) && /\btransform/i.test(lowercasePrompt))) {
    const matched = pool.find(d => d.id === 'source-transformation-circuit');
    if (matched) return matched;
  }
  if (/\bpush[\s-]*pull\b/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'classb-pushpull-amplifier');
    if (matched) return matched;
  }
  if (/\binstrumentation\b/i.test(lowercasePrompt) && (/\bop[\s-]*amp\b/i.test(lowercasePrompt) || /\bamplifier\b/i.test(lowercasePrompt))) {
    const matched = pool.find(d => d.id === 'opamp-instrumentation');
    if (matched) return matched;
  }
  if (/\bopcode\s+fetch\b/i.test(lowercasePrompt) || (/\bfetch\b/i.test(lowercasePrompt) && /\btiming\b/i.test(lowercasePrompt) && /8085/i.test(lowercasePrompt))) {
    const matched = pool.find(d => d.id === 'timing-opcode-fetch');
    if (matched) return matched;
  }
  if (/\bmemory\s+read\b/i.test(lowercasePrompt) && /\btiming\b/i.test(lowercasePrompt) && /8085/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'timing-memory-read');
    if (matched) return matched;
  }
  if (/\bmemory\s+write\b/i.test(lowercasePrompt) && /\btiming\b/i.test(lowercasePrompt) && /8085/i.test(lowercasePrompt)) {
    const matched = pool.find(d => d.id === 'timing-memory-write');
    if (matched) return matched;
  }

  if (department) {
    pool = pool.filter(d => {
      if (!d.department) return true
      const cleanItem = d.department.toLowerCase().replace(/[^a-z0-9]/g, '')
      const cleanContext = department.toLowerCase().replace(/[^a-z0-9]/g, '')
      return cleanItem.includes(cleanContext) || cleanContext.includes(cleanItem)
    })
  }

  if (semester) {
    pool = pool.filter(d => {
      if (!d.semester) return true
      
      const romanToNum = { 'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8 }
      const getSemNumber = (str) => {
        const s = str.toLowerCase()
        const digitMatch = s.match(/\b\d+\b/)
        if (digitMatch) return parseInt(digitMatch[0], 10)
        for (const [rom, num] of Object.entries(romanToNum)) {
          const regex = new RegExp(`\\b${rom}\\b`)
          if (regex.test(s)) return num
        }
        return null
      }
      
      const itemVal = getSemNumber(d.semester)
      const contextVal = getSemNumber(semester)
      if (itemVal !== null && contextVal !== null) {
        return itemVal === contextVal
      }
      
      const cleanItem = d.semester.toLowerCase().replace(/[^a-z0-9]/g, '')
      const cleanContext = semester.toLowerCase().replace(/[^a-z0-9]/g, '')
      return cleanItem.includes(cleanContext) || cleanContext.includes(cleanItem)
    })
  }

  const fuse = new Fuse(pool, fuseOptions)
  const results = fuse.search(cleanedPrompt)

  if (results.length === 0) return null

  const best = results[0]
  // Fuse.js score: 0 = perfect match, 1 = no match
  // We want score <= 0.30 (already enforced by threshold, but double-check)
  if (best.score !== undefined && best.score > 0.30) return null

  const matchedItem = best.item
  
  // ─── Semantic Diagram Type Validation ──────────────────────────────────────
  // Extract all text content from the matched item for type scanning
  const titleAndAliases = (
    matchedItem.title + " " + 
    (matchedItem.aliases || []).join(" ") + " " + 
    matchedItem.id
  ).toLowerCase()
  
  const wantsFlowchart = /flowchart/i.test(cleanedPrompt) || /flow[\s-]*chart/i.test(cleanedPrompt)

    // 1. DFD vs Flowchart Check
  const wantsDfd = /\bdfd\b/i.test(cleanedPrompt) || /data[\s-]*flow/i.test(cleanedPrompt)
  const isDfd = /\bdfd\b/i.test(titleAndAliases) || /data[\s-]*flow/i.test(titleAndAliases)
  if (wantsDfd && !isDfd) return null
  if (!wantsDfd && isDfd && wantsFlowchart) return null

  // 2. UML Class Diagram Check
  const wantsClass = /class[\s-]*diagram/i.test(cleanedPrompt) || /\bclass\b/i.test(cleanedPrompt)
  const isClass = /class[\s-]*diagram/i.test(titleAndAliases) || /\bclass\b/i.test(titleAndAliases)
  if (wantsClass && !isClass) return null
  if (!wantsClass && isClass && (wantsFlowchart || /\bsequence\b/i.test(cleanedPrompt) || /use[\s-]*case/i.test(cleanedPrompt))) return null

  // 3. Sequence Diagram Check
  const wantsSequence = /\bsequence\b/i.test(cleanedPrompt)
  const isSequence = /\bsequence\b/i.test(titleAndAliases)
  if (wantsSequence && !isSequence) return null
  if (!wantsSequence && isSequence && (wantsFlowchart || /\bclass\b/i.test(cleanedPrompt) || /use[\s-]*case/i.test(cleanedPrompt))) return null

  // 4. Use Case Diagram Check
  const wantsUsecase = /use[\s-]*case/i.test(cleanedPrompt) || /\busecase\b/i.test(cleanedPrompt)
  const isUsecase = /use[\s-]*case/i.test(titleAndAliases) || /\busecase\b/i.test(titleAndAliases)
  if (wantsUsecase && !isUsecase) return null
  if (!wantsUsecase && isUsecase && (wantsFlowchart || /\bclass\b/i.test(cleanedPrompt) || /\bsequence\b/i.test(cleanedPrompt))) return null

  // 5. ER Diagram Check
  const wantsEr = /er[\s-]*diagram/i.test(cleanedPrompt) || /\berd\b/i.test(cleanedPrompt) || /entity[\s-]*relationship/i.test(cleanedPrompt) || /\ber\b/i.test(cleanedPrompt)
  const isEr = /er[\s-]*diagram/i.test(titleAndAliases) || /\berd\b/i.test(titleAndAliases) || /entity[\s-]*relationship/i.test(titleAndAliases) || /\ber\b/i.test(titleAndAliases)
  if (wantsEr && !isEr) return null
  if (!wantsEr && isEr && wantsFlowchart) return null

  return matchedItem
}
