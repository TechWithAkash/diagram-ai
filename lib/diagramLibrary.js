/**
 * diagramLibrary.js
 * Imports all JSON diagram definitions and builds a Fuse.js search index.
 * Used by the /api/generate route for Tier 1 instant library matching.
 */
import Fuse from 'fuse.js'

// ─── Import all diagram JSONs ─────────────────────────────────────────────────
import arch8086   from './diagrams/microprocessors/8086-architecture.json'
import arch8085   from './diagrams/microprocessors/8085-architecture.json'
import arch8051   from './diagrams/microprocessors/8051-architecture.json'
import vonNeumann from './diagrams/microprocessors/von-neumann.json'
import ppi8255    from './diagrams/microprocessors/8255-ppi.json'
import pic8259    from './diagrams/microprocessors/8259-pic.json'
import dma8257    from './diagrams/microprocessors/8257-dma.json'

import osiModel    from './diagrams/networks/osi-model.json'
import tcpIpModel  from './diagrams/networks/tcp-ip-model.json'
import tcpHandshake from './diagrams/networks/tcp-handshake.json'
import gsmArch     from './diagrams/networks/gsm-architecture.json'

import processLifeCycle from './diagrams/os/process-life-cycle.json'
import memoryHierarchy  from './diagrams/os/memory-hierarchy.json'

import waterfallModel from './diagrams/sdlc/waterfall-model.json'
import vModel         from './diagrams/sdlc/v-model.json'
import agileScrum     from './diagrams/sdlc/agile-scrum.json'
import spiralModel    from './diagrams/sdlc/spiral-model.json'
import prototypeModel from './diagrams/sdlc/prototype-model.json'

import threeSchema    from './diagrams/dbms/three-schema.json'
import dbmsArchitecture from './diagrams/dbms/dbms-architecture.json'
import compilerPhases from './diagrams/compiler/compiler-phases.json'

// ─── Aggregate all diagrams ───────────────────────────────────────────────────
export const ALL_DIAGRAMS = [
  arch8086,
  arch8085,
  arch8051,
  vonNeumann,
  ppi8255,
  pic8259,
  dma8257,
  osiModel,
  tcpIpModel,
  tcpHandshake,
  gsmArch,
  processLifeCycle,
  memoryHierarchy,
  waterfallModel,
  vModel,
  agileScrum,
  spiralModel,
  prototypeModel,
  threeSchema,
  dbmsArchitecture,
  compilerPhases,
]

// ─── Build Fuse.js search index ──────────────────────────────────────────────
const fuseOptions = {
  keys: [
    { name: 'aliases', weight: 3.0 },  // aliases have highest weight
    { name: 'title',   weight: 1.5 },
    { name: 'category', weight: 0.8 },
    { name: 'id',       weight: 1.0 },
  ],
  threshold: 0.40,          // 0 = exact match, 1 = match anything. 0.40 is fairly lenient
  distance:  200,            // how far to search from start of string
  includeScore: true,
  ignoreLocation: true,     // search anywhere in the string, not just at start
  useExtendedSearch: false,
}

let _fuse = null

function getFuse() {
  if (!_fuse) {
    _fuse = new Fuse(ALL_DIAGRAMS, fuseOptions)
  }
  return _fuse
}

/**
 * matchDiagram — given a user prompt, returns the best matching library entry or null
 * @param {string} prompt  — raw user prompt
 * @returns {object|null}  — matching diagram JSON or null if no confident match
 */
export function matchDiagram(prompt) {
  if (!prompt || prompt.trim().length < 2) return null

  const fuse = getFuse()
  const results = fuse.search(prompt.trim())

  if (results.length === 0) return null

  const best = results[0]
  // Fuse.js score: 0 = perfect match, 1 = no match
  // We want score <= 0.40 (already enforced by threshold, but double-check)
  if (best.score !== undefined && best.score > 0.40) return null

  return best.item
}
