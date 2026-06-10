const fs = require('fs')
const path = require('path')

const CATALOG_DIR = path.join(__dirname, '../lib/catalog')
const OUTPUT_FILE = path.join(__dirname, '../lib/mumbai-university-compiled-index.json')

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

function compileCatalog() {
  console.log('🔨 Compiling Mumbai University diagram catalog...')
  const catalogFiles = walkDir(CATALOG_DIR)
  const allDiagrams = []

  for (const filePath of catalogFiles) {
    try {
      const relativePath = path.relative(path.join(__dirname, '..'), filePath)
      const content = fs.readFileSync(filePath, 'utf-8')
      const json = JSON.parse(content)

      if (!Array.isArray(json)) {
        console.warn(`⚠️ Warning: [${relativePath}] does not contain a JSON array. Skipping.`)
        continue
      }

      // Infer department and semester from the folder structure if not explicit
      // e.g. lib/catalog/cmpn/sem3.json -> dept: CMPN, sem: Semester 3
      const pathParts = filePath.split(path.sep)
      const semFile = pathParts.pop().replace('.json', '')
      const deptFolder = pathParts.pop()

      const deptName = getDeptName(deptFolder)
      const semName = getSemesterName(semFile)

      for (const diagram of json) {
        // Enforce department and semester tags
        diagram.department = diagram.department || deptName
        diagram.semester = diagram.semester || semName
        diagram.isStub = !diagram.schema_template || Object.keys(diagram.schema_template).length === 0
        allDiagrams.push(diagram)
      }
      console.log(`✅ Loaded: [${relativePath}] (${json.length} diagrams)`)
    } catch (err) {
      console.error(`❌ Error parsing [${filePath}]:`, err.message)
    }
  }

  // Write compiled output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allDiagrams, null, 2) + '\n', 'utf-8')
  console.log(`\n🎉 Compiled catalog index successfully with ${allDiagrams.length} diagrams.`)
  console.log(`💾 Saved to: ${OUTPUT_FILE}\n`)
}

function getDeptName(folder) {
  const mapping = {
    'fe': 'First Year Engineering (FE)',
    'cmpn': 'Computer Engineering (CMPN)',
    'extc': 'Electronics & EXTC',
    'electrical': 'Electrical Engineering',
    'mechanical': 'Mechanical Engineering'
  }
  return mapping[folder.toLowerCase()] || folder.toUpperCase()
}

function getSemesterName(file) {
  const mapping = {
    'sem1': 'Semester I',
    'sem2': 'Semester II',
    'sem3': 'Semester III',
    'sem4': 'Semester IV',
    'sem5': 'Semester V',
    'sem6': 'Semester VI',
    'sem7': 'Semester VII',
    'sem8': 'Semester VIII'
  }
  return mapping[file.toLowerCase()] || file.toUpperCase()
}

compileCatalog()
