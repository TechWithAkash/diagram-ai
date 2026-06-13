const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const CATALOG_DIR = path.join(__dirname, '../lib/catalog')

const ALIASES_MAP = {
  'osi-model': ['osi layers', 'osi 7 layers', 'seven layer model', 'protocol stack', 'network layers', 'open systems interconnection'],
  'tcp-ip-model': ['tcp ip layers', 'tcp ip stack', '4 layer model', '5 layer model', 'internet protocol suite'],
  'tcp-handshake': ['tcp three way handshake', 'three way handshake', 'connection establishment', 'syn syn-ack ack'],
  'gsm-architecture': ['gsm network', 'gsm architecture block diagram', 'mobile network architecture', '2g architecture', 'bss nss oss'],
  'dns-resolution': ['dns query', 'domain name system resolution', 'how dns works', 'dns lookup'],
  'arp-protocol': ['address resolution protocol', 'arp request reply', 'how arp works'],
  'csma-cd-protocol': ['carrier sense multiple access collision detection', 'csma cd flow chart', 'collision detection'],
  'ethernet-frame': ['ethernet frame format', 'ethernet header', 'ieee 802.3 frame'],
  'ipv4-header': ['ipv4 packet format', 'ip header', 'ipv4 packet structure'],
  'dhcp-dora': ['dhcp dora process', 'dora handshake', 'dhcp lease process'],
  'superposition-theorem-circuit': ['superposition theorem', 'superposition numerical', 'superposition circuit'],
  'thevenins-theorem-circuit': ['thevenin theorem', 'thevenin numerical', 'thevenin circuit', 'thevenins theorem equivalent'],
  'nortons-theorem-bee': ['nortons theorem', 'norton numerical', 'norton circuit', 'nortons equivalent'],
  'star-delta-conversion': ['star delta', 'star to delta', 'delta to star', 'star delta conversion numerical'],
  'source-transformation-circuit': ['source transformation', 'source conversion', 'source equivalence'],
  'zener-voltage-regulator': ['zener diode regulator', 'zener regulator circuit', 'zener shunt regulator'],
  'opamp-inverting': ['inverting amplifier', 'opamp inverting circuit', 'inverting opamp'],
  'opamp-noninverting': ['noninverting amplifier', 'opamp noninverting circuit', 'non-inverting opamp'],
  'series-rl-circuit': ['series rl circuit', 'rl series circuit', 'series rl ac'],
  'series-rlc-resonance': ['series rlc resonance', 'rlc series resonance', 'series resonance'],
  'dc-circuit': ['dc circuit', 'dc circuit numerical', 'simple dc circuit'],
  'ac-circuit': ['ac circuit', 'ac circuit numerical', 'ac series circuit'],
  '8085-architecture': ['8085 microprocessor', '8085 block diagram', 'intel 8085'],
  '8086-architecture': ['8086 microprocessor', '8086 block diagram', 'intel 8086', '8086 architecture'],
  'waterfall-model': ['waterfall model', 'linear sequential model', 'classic life cycle'],
  'v-model': ['v model', 'verification and validation model', 'v-model sdlc'],
  'agile-scrum': ['agile scrum framework', 'scrum process', 'agile methodology'],
  'spiral-model': ['spiral model', 'risk driven model', 'spiral sdlc'],
  'prototype-model': ['prototype model', 'prototyping in sdlc', 'rapid prototyping'],
  'three-schema': ['three schema architecture', 'ansi-sparc architecture', 'three level database architecture'],
  'dbms-architecture': ['dbms architecture', 'database system structure', 'components of dbms'],
  'dbms-transaction-state': ['transaction state diagram', 'transaction states', 'acid transaction states'],
  'compiler-phases': ['phases of compiler', 'compiler structure', 'analysis synthesis model'],
  'dfa-automata': ['dfa diagram', 'dfa state machine', 'finite automata dfa'],
  'shift-register': ['siso shift register', '4 bit shift register', 'serial in serial out'],
  'ring-counter': ['ring counter diagram', '4 bit ring counter', 'shift register counter'],
  'signal-flow-graph': ['signal flow graph', 'sfg control systems', 'masons gain formula'],
  'fft-butterfly-dif': ['dif fft butterfly', 'butterfly diagram dif', 'fft butterfly 8 point'],
  'avl-tree': ['avl tree insertion', 'self balancing binary search tree', 'avl rotations'],
  'heap-structure': ['max heap tree', 'min heap', 'heap binary tree'],
  'bplus-tree': ['b+ tree diagram', 'b plus tree structure', 'indexing b+ tree'],
  'general-series-circuit': ['general series circuit', 'custom series rlc', 'arbitrary series circuit'],
  'general-parallel-circuit': ['general parallel circuit', 'custom parallel rlc', 'arbitrary parallel circuit']
}

function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      walkDir(fullPath, fileList)
    } else if (file.endsWith('.json')) {
      fileList.push(fullPath)
    }
  }
  return fileList
}

function addAliases() {
  console.log('Inserting aliases into catalog source files...')
  const files = walkDir(CATALOG_DIR)

  for (const filePath of files) {
    const relative = path.relative(path.join(__dirname, '..'), filePath)
    let content = fs.readFileSync(filePath, 'utf-8')
    let json = JSON.parse(content)
    let modified = false

    for (const diagram of json) {
      const aliases = ALIASES_MAP[diagram.id]
      if (aliases) {
        diagram.aliases = aliases
        modified = true
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8')
      console.log(`Updated aliases for: ${relative}`)
    }
  }

  console.log('Catalog updated! Re-running compile-catalog.js...')
  try {
    const output = execSync('node scripts/compile-catalog.js', { encoding: 'utf-8' })
    console.log(output)
  } catch (err) {
    console.error('Failed to run compile-catalog.js:', err.message)
  }
}

addAliases()
