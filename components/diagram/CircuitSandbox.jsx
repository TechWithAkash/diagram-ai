'use client';

import React, { useState, useEffect } from 'react';

/**
 * CircuitSandbox component provides a premium, interactive grid-based editor
 * where students can visually adjust, rewire, and calibrate schematic coordinates.
 */
export default function CircuitSandbox({ initialSchema, onSave }) {
  const [schema, setSchema] = useState(initialSchema || { components: [], netlist: [], labels: [] });
  const [selectedComp, setSelectedComp] = useState(null);
  const [draggedComp, setDraggedComp] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lintResult, setLintResult] = useState({ valid: true, errors: [] });

  const gridScale = 120; // grid spacing multiplier
  const padding = 60;

  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema);
    }
  }, [initialSchema]);

  // Handle local linter run
  const runLocalLinter = (currentSchema) => {
    const { components = [], netlist = [] } = currentSchema;
    const errors = [];

    if (components.length === 0) {
      return { valid: false, errors: ['Circuit has no components'] };
    }

    const adj = {};
    const addEdge = (u, v) => {
      if (!adj[u]) adj[u] = [];
      if (!adj[v]) adj[v] = [];
      adj[u].push(v);
      adj[v].push(u);
    };

    netlist.forEach(conn => {
      if (conn.from && conn.to) {
        addEdge(conn.from, conn.to);
      }
    });

    components.forEach(c => {
      const hasAnyConnection = Object.keys(adj).some(t => t.startsWith(c.id + '.'));
      if (!hasAnyConnection && c.symbol !== 'wire-junction') {
        errors.push(`Component ${c.id} (${c.symbol}) has zero connections`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  };

  useEffect(() => {
    const result = runLocalLinter(schema);
    setLintResult(result);
  }, [schema]);

  const handleMouseDown = (e, comp) => {
    e.preventDefault();
    setSelectedComp(comp);
    setDraggedComp(comp);
    
    // Find initial screen coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragOffset({
      x: x - (comp.grid[0] * gridScale + padding),
      y: y - (comp.grid[1] * gridScale + padding)
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedComp) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate new grid coordinates
    const rawGridX = (x - padding - dragOffset.x) / gridScale;
    const rawGridY = (y - padding - dragOffset.y) / gridScale;
    
    // Snap to 0.5 grid increment
    const gridX = Math.round(rawGridX * 2) / 2;
    const gridY = Math.round(rawGridY * 2) / 2;

    setSchema(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === draggedComp.id ? { ...c, grid: [gridX, gridY] } : c
      )
    }));
  };

  const handleMouseUp = () => {
    setDraggedComp(null);
  };

  const handleValueChange = (compId, newValue) => {
    setSchema(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === compId ? { ...c, value: newValue, label: `${c.id} = ${newValue}` } : c
      )
    }));
  };

  const renderComponentSymbol = (comp) => {
    const sym = comp.symbol?.toLowerCase();
    const rotation = comp.rotation || 0;
    
    let path = '';
    let color = selectedComp?.id === comp.id ? '#3b82f6' : '#1e293b';

    if (sym === 'resistor') {
      path = 'M -30,0 L -15,0 L -10,-10 L 0,10 L 10,-10 L 15,0 L 30,0';
    } else if (sym === 'inductor') {
      path = 'M -30,0 L -15,0 C -10,-10 -5,-10 0,0 C 5,-10 10,-10 15,0 L 30,0';
    } else if (sym === 'capacitor') {
      path = 'M -30,0 L -5,0 M -5,-15 L -5,15 M 5,-15 L 5,15 M 5,0 L 30,0';
    } else if (sym === 'ground') {
      path = 'M 0,-15 L 0,0 M -15,0 L 15,0 M -10,5 L 10,5 M -5,10 L 5,10';
    } else if (sym === 'ac-source' || sym === 'dc-source') {
      return (
        <g transform={`rotate(${rotation})`}>
          <circle cx="0" cy="0" r="20" fill="none" stroke={color} strokeWidth="2.5" />
          <path d="M -30,0 L -20,0 M 20,0 L 30,0" stroke={color} strokeWidth="2" />
          {sym === 'ac-source' ? (
            <path d="M -8,0 C -4,-8 0,8 8,0" fill="none" stroke={color} strokeWidth="2" />
          ) : (
            <path d="M -5,-5 L -5,5 M 5,-10 L 5,10" stroke={color} strokeWidth="2" />
          )}
        </g>
      );
    } else {
      // General square block symbol
      return (
        <rect x="-25" y="-15" width="50" height="30" rx="4" fill="#f8fafc" stroke={color} strokeWidth="2" />
      );
    }

    return (
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" transform={`rotate(${rotation})`} />
    );
  };

  const width = 800;
  const height = 450;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Interactive Circuit Sandbox
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${lintResult.valid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            {lintResult.valid ? '✓ Connection Check Passed' : '⚠️ Floating Pins Detected'}
          </span>
        </div>

        <div 
          className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 cursor-crosshair shadow-inner"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid background dots */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}></div>

          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="select-none">
            {/* Draw Netlist Wires */}
            {schema.netlist?.map((wire, idx) => {
              const [fromId, fromPin] = wire.from.split('.');
              const [toId, toPin] = wire.to.split('.');
              const fromComp = schema.components.find(c => c.id === fromId);
              const toComp = schema.components.find(c => c.id === toId);

              if (!fromComp || !toComp) return null;

              const x1 = fromComp.grid[0] * gridScale + padding;
              const y1 = fromComp.grid[1] * gridScale + padding;
              const x2 = toComp.grid[0] * gridScale + padding;
              const y2 = toComp.grid[1] * gridScale + padding;

              return (
                <path 
                  key={idx} 
                  d={`M ${x1},${y1} L ${x2},${y2}`} 
                  stroke="#475569" 
                  strokeWidth="2" 
                  fill="none" 
                  strokeDasharray="4,4" 
                />
              );
            })}

            {/* Draw Components */}
            {schema.components?.map((comp) => {
              const cx = comp.grid[0] * gridScale + padding;
              const cy = comp.grid[1] * gridScale + padding;

              return (
                <g 
                  key={comp.id} 
                  transform={`translate(${cx}, ${cy})`}
                  onMouseDown={(e) => handleMouseDown(e, comp)}
                  className="cursor-move"
                >
                  {/* Interaction touch target */}
                  <circle cx="0" cy="0" r="35" fill="transparent" className="hover:fill-blue-500/5 transition-colors" />

                  {/* Icon / Symbol */}
                  {renderComponentSymbol(comp)}

                  {/* Labels */}
                  <text 
                    y="-25" 
                    textAnchor="middle" 
                    className="text-xs font-bold fill-slate-300"
                  >
                    {comp.id}
                  </text>
                  <text 
                    y="30" 
                    textAnchor="middle" 
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {comp.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Editor & Calculations sidebar */}
      <div className="flex flex-col gap-5 bg-slate-950 p-5 rounded-xl border border-slate-800">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Parameters & Values</h4>
        
        <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-3 pr-2 scrollbar-thin">
          {schema.components?.filter(c => c.symbol !== 'wire-junction' && c.symbol !== 'ground').map((comp) => (
            <div key={comp.id} className="flex flex-col gap-1.5 p-3 bg-slate-900 rounded-lg border border-slate-850">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-200">{comp.id} ({comp.symbol})</span>
                <span className="text-[10px] text-slate-500 font-mono">Grid: [{comp.grid.join(', ')}]</span>
              </div>
              <input 
                type="text" 
                value={comp.value || ''} 
                onChange={(e) => handleValueChange(comp.id, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-slate-850">
          <button 
            onClick={() => onSave && onSave(schema)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 text-xs font-bold transition-all shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active:scale-[0.98]"
          >
            Solve & Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
