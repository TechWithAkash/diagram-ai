const fs = require('fs');

function parseFallbackJsonFromMermaid(code) {
  const nodes = []
  const edges = []
  const nodeMap = new Map()

  if (!code) return { nodes, edges }

  const lines = code.split('\n')
  const lowerCode = code.trim().toLowerCase()
  const isSequence = lowerCode.includes('sequencediagram')
  const isER = lowerCode.includes('erdiagram')

  if (isSequence) {
    for (let line of lines) {
      line = line.trim()
      if (!line || line.startsWith('%%') || line.toLowerCase().startsWith('sequencediagram')) continue

      const partMatch = line.match(/^participant\s+([a-zA-Z0-9_]+)(?:\s+as\s+"([^"]+)")?/i)
      if (partMatch) {
        const id = partMatch[1]
        const label = partMatch[2] || id
        nodeMap.set(id, { id, label, type: 'terminal' })
        continue
      }

      const colonIndex = line.indexOf(':')
      if (colonIndex !== -1) {
        const left = line.slice(0, colonIndex).trim()
        const right = line.slice(colonIndex + 1).trim()
        
        const arrowMatch = left.match(/^([a-zA-Z0-9_]+)\s*(?:-[-a-zA-Z0-9>>+x#()]*>|-[a-zA-Z0-9+x#()]*|--?>>|--?>|--?x|--?\))\s*([a-zA-Z0-9_]+)/)
        if (arrowMatch) {
          const from = arrowMatch[1]
          const to = arrowMatch[2]
          const label = right.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim()
          
          edges.push({ from, to, label })
          if (!nodeMap.has(from)) nodeMap.set(from, { id: from, label: from, type: 'terminal' })
          if (!nodeMap.has(to)) nodeMap.set(to, { id: to, label: to, type: 'terminal' })
        }
      }
    }
  } else if (isER) {
    for (let line of lines) {
      line = line.trim()
      if (!line || line.startsWith('%%') || line.toLowerCase().startsWith('erdiagram')) continue

      // Only match entity definition start, not relationship lines containing |{ or o{
      if (line.endsWith('{') && !line.includes('--') && !line.includes('..')) {
        const entNameMatch = line.match(/^([a-zA-Z0-9_]+)\s*\{/)
        if (entNameMatch) {
          const id = entNameMatch[1]
          if (!nodeMap.has(id)) nodeMap.set(id, { id, label: id.replace(/_/g, ' '), type: 'rectangle' })
        }
        continue
      }

      const colonIndex = line.indexOf(':')
      if (colonIndex !== -1) {
        const left = line.slice(0, colonIndex).trim()
        const right = line.slice(colonIndex + 1).trim()
        
        const relMatch = left.match(/^([a-zA-Z0-9_]+)\s*(?:[|o{}]{2}[-.]+[|o{}]{2}|[-.]+)\s*([a-zA-Z0-9_]+)/)
        if (relMatch) {
          const from = relMatch[1]
          const to = relMatch[2]
          const label = right.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim()

          edges.push({ from, to, label })
          if (!nodeMap.has(from)) nodeMap.set(from, { id: from, label: from.replace(/_/g, ' '), type: 'rectangle' })
          if (!nodeMap.has(to)) nodeMap.set(to, { id: to, label: to.replace(/_/g, ' '), type: 'rectangle' })
        }
      } else {
        const word = line.trim()
        if (word && !word.includes('{') && !word.includes('}') && !word.includes('"') && !word.includes('\'') && !word.includes(' ') && !['erdiagram', 'title', 'diagram_type'].includes(word.toLowerCase())) {
          nodeMap.set(word, { id: word, label: word.replace(/_/g, ' '), type: 'rectangle' })
        }
      }
    }
  } else {
    for (let line of lines) {
      line = line.trim()
      if (!line || line.startsWith('%%') || line.toLowerCase().startsWith('flowchart') || line.toLowerCase().startsWith('graph') || line.toLowerCase().startsWith('direction')) {
        continue
      }
      if (line.toLowerCase().startsWith('subgraph')) continue
      if (line.toLowerCase() === 'end') continue
      if (line.toLowerCase().startsWith('style ') || line.toLowerCase().startsWith('class ') || line.toLowerCase().startsWith('click ') || line.toLowerCase().startsWith('linkstyle ')) {
        continue
      }

      const parts = line.split(/(\s*(?:-+\.?-*>|==+>|-{2,}|-+\.-+)\s*(?:\|[^|]+\|\s*)?)/)
      if (parts.length > 1) {
        let prevNodeId = null
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim()
          if (!part) continue
          
          if (i % 2 === 1) continue

          const nodeMatch = part.match(/^([a-zA-Z0-9_-]+)(?:\s*(?:\["([^"]+)"\]|\("([^"]+)"\)|\{"([^"]+)"\}|\[\/([^/]+)\/\]|\(\(([^)]+)\)\)|\[([^\]]+)\]))?/);
          if (nodeMatch) {
            const id = nodeMatch[1].trim()
            let label = id
            let type = 'rectangle'

            if (nodeMatch[2]) { label = nodeMatch[2]; type = 'rectangle'; }
            else if (nodeMatch[3]) { label = nodeMatch[3]; type = 'process'; }
            else if (nodeMatch[4]) { label = nodeMatch[4]; type = 'decision'; }
            else if (nodeMatch[5]) { label = nodeMatch[5]; type = 'input_output'; }
            else if (nodeMatch[6]) { label = nodeMatch[6]; type = 'terminal'; }
            else if (nodeMatch[7]) { label = nodeMatch[7]; type = 'rectangle'; }

            if (!nodeMap.has(id)) {
              nodeMap.set(id, { id, label, type })
            } else if (label !== id) {
              const existing = nodeMap.get(id)
              existing.label = label
              existing.type = type
            }

            if (prevNodeId) {
              const arrowPart = parts[i - 1]
              let edgeLabel = ''
              if (arrowPart) {
                const labelMatch = arrowPart.match(/\|([^|]+)\|/)
                if (labelMatch) {
                  edgeLabel = labelMatch[1].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '')
                }
              }
              edges.push({ from: prevNodeId, to: id, label: edgeLabel })
            }
            prevNodeId = id
          }
        }
      } else {
        const nodeMatch = line.match(/^([a-zA-Z0-9_-]+)(?:\s*(?:\["([^"]+)"\]|\("([^"]+)"\)|\{"([^"]+)"\}|\[\/([^/]+)\/\]|\(\(([^)]+)\)\)|\[([^\]]+)\]))/);
        if (nodeMatch) {
          const id = nodeMatch[1].trim()
          let label = id
          let type = 'rectangle'

          if (nodeMatch[2]) { label = nodeMatch[2]; type = 'rectangle'; }
          else if (nodeMatch[3]) { label = nodeMatch[3]; type = 'process'; }
          else if (nodeMatch[4]) { label = nodeMatch[4]; type = 'decision'; }
          else if (nodeMatch[5]) { label = nodeMatch[5]; type = 'input_output'; }
          else if (nodeMatch[6]) { label = nodeMatch[6]; type = 'terminal'; }
          else if (nodeMatch[7]) { label = nodeMatch[7]; type = 'rectangle'; }

          nodeMap.set(id, { id, label, type })
        }
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges
  }
}

// TEST CASES
const flowchartCode = `flowchart TD
  Hub["Central Hub"]
  Node1("Node 1")
  Node2{"Node 2"}
  Node3[/Node 3/]
  Node4((Node 4))
  Hub -->|"conn 1"| Node1
  Node1 -.->|"conn 2"| Node2
  Node2 ==>|"conn 3"| Node3
  Node3 --- Node4
`;

const sequenceCode = `sequenceDiagram
  participant Client as "Client App"
  participant Server as "Server API"
  Client->>Server: GET /data
  Server-->>Client: 200 OK
`;

const erCode = `erDiagram
  CUSTOMER ||--o{ ORDER : "places"
  ORDER ||--|{ LINE_ITEM : "contains"
  CUSTOMER {
    string name
    string email
  }
`;

console.log("=== PARSING FLOWCHART ===");
console.log(JSON.stringify(parseFallbackJsonFromMermaid(flowchartCode), null, 2));

console.log("\n=== PARSING SEQUENCE ===");
console.log(JSON.stringify(parseFallbackJsonFromMermaid(sequenceCode), null, 2));

console.log("\n=== PARSING ER DIAGRAM ===");
console.log(JSON.stringify(parseFallbackJsonFromMermaid(erCode), null, 2));
