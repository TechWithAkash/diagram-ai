import { useState, useMemo } from 'react'
import { 
  BookOpen, ChevronDown, ChevronRight, Award, 
  HelpCircle, ShieldCheck, Cpu, Library, HelpCircle as HelpIcon, ArrowRight
} from 'lucide-react'
import compiledCatalog from '@/lib/mumbai-university-compiled-index.json'

export default function SyllabusBrowser({ onSelectDiagram }) {
  const [activeDept, setActiveDept] = useState(null)
  const [activeSem, setActiveSem] = useState(null)
  const [activeSubject, setActiveSubject] = useState(null)

  // ─── Group catalog data by Department ➔ Semester ➔ Subject ──────────────────
  const hierarchicalData = useMemo(() => {
    const data = {}
    
    compiledCatalog.forEach(diagram => {
      const dept = diagram.department || 'Other'
      const sem = diagram.semester || 'Other'
      const subj = diagram.subject || 'Other'
      
      if (!data[dept]) data[dept] = {}
      if (!data[dept][sem]) data[dept][sem] = {}
      if (!data[dept][sem][subj]) data[dept][sem][subj] = []
      
      data[dept][sem][subj].push(diagram)
    })
    
    return data
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Mumbai University Syllabus Catalog</h2>
          <p className="text-xs text-gray-400">Browse and study exam-relevant diagrams by department and subject</p>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(hierarchicalData).map(([deptName, semesters]) => {
          const isDeptOpen = activeDept === deptName
          
          return (
            <div key={deptName} className="border border-gray-100 rounded-xl overflow-hidden">
              {/* Department Row */}
              <button
                onClick={() => {
                  setActiveDept(isDeptOpen ? null : deptName)
                  setActiveSem(null)
                  setActiveSubject(null)
                }}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-left text-sm font-semibold transition-all ${
                  isDeptOpen 
                    ? 'bg-violet-50/50 text-violet-700' 
                    : 'bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDeptOpen ? 'bg-violet-600' : 'bg-gray-300'}`} />
                  <span>{deptName}</span>
                </div>
                {isDeptOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {/* Semesters list */}
              {isDeptOpen && (
                <div className="bg-gray-50/30 border-t border-gray-100 p-3 space-y-2">
                  {Object.entries(semesters).map(([semName, subjects]) => {
                    const isSemOpen = activeSem === semName
                    
                    return (
                      <div key={semName} className="border border-gray-100 rounded-lg overflow-hidden bg-white">
                        {/* Semester Row */}
                        <button
                          onClick={() => {
                            setActiveSem(isSemOpen ? null : semName)
                            setActiveSubject(null)
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-bold transition-all ${
                            isSemOpen 
                              ? 'bg-gray-100 text-gray-900' 
                              : 'bg-white hover:bg-gray-50/50 text-gray-500'
                          }`}
                        >
                          <span>{semName}</span>
                          {isSemOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        {/* Subjects list */}
                        {isSemOpen && (
                          <div className="border-t border-gray-50 p-2 space-y-1">
                            {Object.entries(subjects).map(([subjName, diagrams]) => {
                              const isSubjOpen = activeSubject === subjName
                              
                              return (
                                <div key={subjName} className="rounded">
                                  {/* Subject Row */}
                                  <button
                                    onClick={() => setActiveSubject(isSubjOpen ? null : subjName)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold rounded transition-all ${
                                      isSubjOpen 
                                        ? 'bg-violet-50 text-violet-700' 
                                        : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                                  >
                                    <span>{subjName}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">({diagrams.length} diagrams)</span>
                                  </button>

                                  {/* Diagrams list */}
                                  {isSubjOpen && (
                                    <div className="pl-4 pr-2 py-1.5 space-y-1 bg-gray-50/50 rounded-b mt-1">
                                      {diagrams.map(diagram => (
                                        <div 
                                          key={diagram.id}
                                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white border border-gray-100 rounded-lg hover:border-violet-300 hover:shadow-sm transition-all"
                                        >
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-xs font-bold text-gray-800">{diagram.title}</span>
                                              {diagram.isStub ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                  <Cpu className="w-2.5 h-2.5" /> AI LAYOUT + TEXTBOOK CARD
                                                </span>
                                              ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                  <Library className="w-2.5 h-2.5" /> STANDARD LAYOUT
                                                </span>
                                              )}
                                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                diagram.exam_relevance?.frequency === 'High'
                                                  ? 'bg-red-50 text-red-700 border border-red-100'
                                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                                              }`}>
                                                {diagram.exam_relevance?.frequency} Weightage
                                              </span>
                                            </div>
                                            
                                            <p className="text-[10px] text-gray-400 mt-1 font-mono italic">
                                              Ref: {diagram.textbook_reference}
                                            </p>
                                          </div>
                                          
                                          <button
                                            onClick={() => onSelectDiagram(diagram.title)}
                                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow transition-all"
                                          >
                                            Study Diagram
                                            <ArrowRight className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
