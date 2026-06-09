const mockAllDiagrams = [
  {
    id: "dfd-library-l0-l1",
    title: "DFD Level 0 & Level 1 — Library Management System",
    aliases: ["library dfd", "library data flow diagram", "dfd level 0 library", "dfd level 1 library", "library management system dfd"]
  },
  {
    id: "uml-library-class",
    title: "UML Class Diagram — Library Management System",
    aliases: ["library class diagram", "uml class library", "library management system class diagram"]
  },
  {
    id: "waterfall-model",
    title: "Waterfall Model SDLC",
    aliases: ["waterfall model", "waterfall process", "linear sequential life cycle"]
  }
];

function testMatch(prompt, matchedItem) {
  if (!matchedItem) return null;
  
  const cleanedPrompt = prompt.trim()
  const titleAndAliases = (
    matchedItem.title + " " + 
    (matchedItem.aliases || []).join(" ") + " " + 
    matchedItem.id
  ).toLowerCase()
  
  const wantsFlowchart = /flowchart/i.test(cleanedPrompt) || /flow[\s-]*chart/i.test(cleanedPrompt)

  // 1. DFD vs Flowchart Check (word boundaries for dfd)
  const wantsDfd = /\bdfd\b/i.test(cleanedPrompt) || /data[\s-]*flow/i.test(cleanedPrompt)
  const isDfd = /\bdfd\b/i.test(titleAndAliases) || /data[\s-]*flow/i.test(titleAndAliases)
  if (wantsDfd && !isDfd) return null
  if (!wantsDfd && isDfd && wantsFlowchart) return null

  // 2. UML Class Diagram Check (word boundaries for class)
  const wantsClass = /class[\s-]*diagram/i.test(cleanedPrompt) || /\bclass\b/i.test(cleanedPrompt)
  const isClass = /class[\s-]*diagram/i.test(titleAndAliases) || /\bclass\b/i.test(titleAndAliases)
  if (wantsClass && !isClass) return null
  if (!wantsClass && isClass && (wantsFlowchart || /\bsequence\b/i.test(cleanedPrompt) || /use[\s-]*case/i.test(cleanedPrompt))) return null

  // 3. Sequence Diagram Check (word boundaries for sequence)
  const wantsSequence = /\bsequence\b/i.test(cleanedPrompt)
  const isSequence = /\bsequence\b/i.test(titleAndAliases)
  if (wantsSequence && !isSequence) return null
  if (!wantsSequence && isSequence && (wantsFlowchart || /\bclass\b/i.test(cleanedPrompt) || /use[\s-]*case/i.test(cleanedPrompt))) return null

  // 4. Use Case Diagram Check
  const wantsUsecase = /use[\s-]*case/i.test(cleanedPrompt) || /\busecase\b/i.test(cleanedPrompt)
  const isUsecase = /use[\s-]*case/i.test(titleAndAliases) || /\busecase\b/i.test(titleAndAliases)
  if (wantsUsecase && !isUsecase) return null
  if (!wantsUsecase && isUsecase && (wantsFlowchart || /\bclass\b/i.test(cleanedPrompt) || /\bsequence\b/i.test(cleanedPrompt))) return null

  // 5. ER Diagram Check (word boundaries for er/erd)
  const wantsEr = /er[\s-]*diagram/i.test(cleanedPrompt) || /\berd\b/i.test(cleanedPrompt) || /entity[\s-]*relationship/i.test(cleanedPrompt) || /\ber\b/i.test(cleanedPrompt)
  const isEr = /er[\s-]*diagram/i.test(titleAndAliases) || /\berd\b/i.test(titleAndAliases) || /entity[\s-]*relationship/i.test(titleAndAliases) || /\ber\b/i.test(titleAndAliases)
  if (wantsEr && !isEr) return null
  if (!wantsEr && isEr && wantsFlowchart) return null

  return matchedItem;
}

const testCases = [
  {
    prompt: "Generate a flowchart of Library Management System",
    mockMatch: mockAllDiagrams[0], // matches DFD
    expected: null
  },
  {
    prompt: "library management system DFD",
    mockMatch: mockAllDiagrams[0], // matches DFD
    expected: mockAllDiagrams[0]
  },
  {
    prompt: "UML class diagram of Library Management System",
    mockMatch: mockAllDiagrams[1], // matches Class
    expected: mockAllDiagrams[1]
  },
  {
    prompt: "sequence diagram of Library Management System",
    mockMatch: mockAllDiagrams[1], // matches Class
    expected: null
  },
  {
    prompt: "waterfall model",
    mockMatch: mockAllDiagrams[2], // matches waterfall
    expected: mockAllDiagrams[2]
  },
  {
    prompt: "waterfall model flowchart",
    mockMatch: mockAllDiagrams[2], // matches waterfall
    expected: mockAllDiagrams[2]
  }
];

console.log("=== SEMANTIC MATCHING UNIT TESTS WITH WORD BOUNDARIES ===");
let allPassed = true;
for (const tc of testCases) {
  const result = testMatch(tc.prompt, tc.mockMatch);
  const passed = result === tc.expected;
  console.log(`Prompt: "${tc.prompt}"`);
  console.log(`Matched ID: ${tc.mockMatch.id}`);
  console.log(`Result: ${result ? result.id : "null"} | Expected: ${tc.expected ? tc.expected.id : "null"}`);
  console.log(passed ? "✅ PASS" : "❌ FAIL");
  console.log("------------------------");
  if (!passed) allPassed = false;
}

if (allPassed) {
  console.log("ALL TESTS PASSED! 🎉");
} else {
  console.log("SOME TESTS FAILED! ❌");
}
