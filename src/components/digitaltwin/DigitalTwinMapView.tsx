import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness } from '../../utils/freshness';
import { 
  Map, Activity, AlertTriangle, CheckCircle2, 
  QrCode, ArrowUpRight, ShieldCheck, Clock, 
  Layers, RefreshCw, ZoomIn, ZoomOut, Compass, Info 
} from 'lucide-react';

export const DigitalTwinMapView: React.FC = () => {
  const { equipmentList, knowledgeEntries, openEquipment, openKnowledge } = useApp();
  const [selectedEqId, setSelectedEqId] = useState<string>('EQ-CMP-204');
  const [filterArea, setFilterArea] = useState<string>('ALL');

  // Dynamically compute list of areas from equipmentList
  const areas = ['ALL', ...Array.from(new Set(equipmentList.map(e => e.area)))];

  // Filter equipment based on dynamic area
  const filteredEquipment = filterArea === 'ALL' 
    ? equipmentList 
    : equipmentList.filter(e => e.area === filterArea);

  // Safe selected equipment fallback
  const selectedEq = filteredEquipment.find(e => e.id === selectedEqId) 
    || filteredEquipment[0] 
    || equipmentList.find(e => e.id === selectedEqId) 
    || equipmentList[0];

  // Linked SOPs for selected equipment
  const linkedSops = selectedEq 
    ? knowledgeEntries.filter(k => k.linkedEquipmentIds.includes(selectedEq.id))
    : [];

  // Determine health color for each equipment node based on status and knowledge freshness
  const getNodeHealth = (eqId: string, status: string) => {
    if (status === 'warning') return { color: '#f59e0b', ring: 'stroke-amber-400', fill: 'fill-amber-500/20', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30', text: 'Telemetry Warning' };
    const sops = knowledgeEntries.filter(k => k.linkedEquipmentIds.includes(eqId));
    const hasStale = sops.some(s => calculateFreshness(s).state === 'stale');
    if (hasStale) return { color: '#f43f5e', ring: 'stroke-rose-400', fill: 'fill-rose-500/20', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30', text: 'Overdue SOP Decay' };
    return { color: '#10b981', ring: 'stroke-emerald-400', fill: 'fill-emerald-500/20', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', text: 'Verified & Healthy' };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Digital Twin Plant Floor Map
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              2D SCHEMATIC
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial representation of plant equipment nodes reflecting real-time knowledge health, sensor telemetry, and verified procedural links.
          </p>
        </div>

        {/* Dynamic Filter Area Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Filter Area:</label>
          <select
            value={filterArea}
            onChange={(e) => {
              setFilterArea(e.target.value);
              // If current selectedEqId is not in new filter, switch to first in filter
              if (e.target.value !== 'ALL') {
                const firstInNewArea = equipmentList.find(eq => eq.area === e.target.value);
                if (firstInNewArea) setSelectedEqId(firstInNewArea.id);
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Map + Sidebar Layout (Responsive stack on mobile, 2-col on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Interactive Plant Map Canvas */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-4 text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" /> Healthy & Verified</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" /> Sensor Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" /> Overdue SOP Decay</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              Showing {filteredEquipment.length} of {equipmentList.length} Nodes
            </span>
          </div>

          {/* SVG Map Container */}
          <div className="relative aspect-[16/10] w-full bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center">
            {/* SVG Canvas with 1000x650 coordinate grid */}
            <svg className="w-full h-full select-none" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.22)" strokeWidth="1" />
                </pattern>
                <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.45" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Grid */}
              <rect width="1000" height="650" fill="url(#grid)" />

              {/* Process Flow Pipelines (Connecting the real node canvas coordinates) */}
              <g className="pipelines" opacity="0.8">
                {/* Tank 501 (820, 195) -> Compressor 204 (480, 182) */}
                <path d="M 820 195 L 650 195 L 650 182 L 480 182" fill="none" stroke="url(#pipeGrad)" strokeWidth="4" strokeDasharray="8 4" />
                
                {/* Compressor 204 (480, 182) -> Reactor 101 (240, 227) */}
                <path d="M 480 182 L 360 182 L 360 227 L 240 227" fill="none" stroke="url(#pipeGrad)" strokeWidth="4" strokeDasharray="8 4" />
                
                {/* Reactor 101 (240, 227) -> Relief Valve 302 (280, 403) */}
                <path d="M 240 227 L 240 350 L 280 350 L 280 403" fill="none" stroke="url(#pipeGrad)" strokeWidth="3" strokeDasharray="6 3" />
                
                {/* Reactor 101 (240, 227) -> Feed Preheater 602 (420, 455) */}
                <path d="M 240 227 L 240 455 L 420 455" fill="none" stroke="url(#pipeGrad)" strokeWidth="4" strokeDasharray="8 4" />
                
                {/* Preheater 602 (420, 455) -> Column 701 (600, 507) */}
                <path d="M 420 455 L 510 455 L 510 507 L 600 507" fill="none" stroke="url(#pipeGrad)" strokeWidth="4" strokeDasharray="8 4" />
                
                {/* Column 701 (600, 507) -> Slurry Pump 405 (680, 338) */}
                <path d="M 600 507 L 680 507 L 680 338" fill="none" stroke="url(#pipeGrad)" strokeWidth="4" strokeDasharray="8 4" />
                
                {/* Pump 405 (680, 338) -> Tank 501 (820, 195) */}
                <path d="M 680 338 L 820 338 L 820 195" fill="none" stroke="url(#pipeGrad)" strokeWidth="3" strokeDasharray="6 3" />
              </g>

              {/* Area Group Zone Outlines (Background decorative zones) */}
              <rect x="180" y="160" width="160" height="300" rx="12" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <text x="190" y="180" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">ZONE A: REACTOR & VALVE</text>

              <rect x="370" y="120" width="280" height="440" rx="12" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <text x="380" y="140" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">ZONE B: COMPRESSION & FRACTIONATION</text>

              <rect x="670" y="270" width="120" height="150" rx="12" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <text x="680" y="290" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">ZONE C: PUMPS</text>

              <rect x="760" y="120" width="180" height="280" rx="12" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <text x="770" y="140" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">ZONE D: TANK FARM</text>

              {/* Equipment Nodes (Positioned with 0-100% converted to 1000x650 pixels) */}
              {filteredEquipment.map((eq) => {
                const canvasX = (eq.x / 100) * 1000;
                const canvasY = (eq.y / 100) * 650;
                const health = getNodeHealth(eq.id, eq.status);
                const isSelected = selectedEq?.id === eq.id;

                return (
                  <g
                    key={eq.id}
                    className="cursor-pointer transition-all group"
                    onClick={() => setSelectedEqId(eq.id)}
                    transform={`translate(${canvasX}, ${canvasY})`}
                  >
                    {/* Glowing pulse halo */}
                    <circle
                      r={isSelected ? 42 : 30}
                      className={`${health.fill} transition-all duration-300`}
                    />
                    
                    {/* Outer border ring */}
                    <circle
                      r={isSelected ? 32 : 24}
                      fill="#090d16"
                      stroke={health.color}
                      strokeWidth={isSelected ? 3.5 : 2}
                      className="transition-all duration-200"
                      filter={isSelected ? "url(#glow)" : undefined}
                    />

                    {/* Node Code Label */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="select-none pointer-events-none"
                    >
                      {eq.code.replace('EQ-', '')}
                    </text>

                    {/* Node Sub-label below */}
                    <text
                      textAnchor="middle"
                      dy="44"
                      fill={isSelected ? '#38bdf8' : '#94a3b8'}
                      fontSize="10"
                      fontWeight="600"
                      className="select-none pointer-events-none"
                    >
                      {eq.name.split(' ')[0]} {eq.name.split(' ')[1]}
                    </text>

                    {/* Tooltip on hover */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" transform="translate(0, -36)">
                      <rect x="-70" y="-22" width="140" height="24" rx="6" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
                      <text textAnchor="middle" dy="-6" fill="#f8fafc" fontSize="9" fontWeight="bold">
                        {eq.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Equipment Telemetry & Linked SOP Inspector */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          {selectedEq ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-400">{selectedEq.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getNodeHealth(selectedEq.id, selectedEq.status).bg}`}>
                      {getNodeHealth(selectedEq.id, selectedEq.status).text}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{selectedEq.name}</h3>
                </div>
                <button
                  onClick={() => openEquipment(selectedEq.id)}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Area & Telemetry */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Plant Location</span>
                    <span className="font-semibold text-slate-200 text-right">{selectedEq.area}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Category</span>
                    <span className="font-semibold text-slate-200">{selectedEq.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Live Temperature</span>
                    <span className="font-mono font-bold text-teal-400">{selectedEq.temp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Operating Pressure</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedEq.pressure}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Flow Rate</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedEq.flowRate}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Functional Role</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedEq.description}
                  </p>
                </div>
              </div>

              {/* Linked SOPs for this Node */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Linked Operating Procedures</h4>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{linkedSops.length} linked</span>
                </div>
                
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {linkedSops.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-lg text-center">No direct SOPs linked yet.</p>
                  ) : (
                    linkedSops.map(sop => (
                      <div
                        key={sop.id}
                        onClick={() => openKnowledge(sop.id)}
                        className="cursor-pointer p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between transition-colors group"
                      >
                        <div className="overflow-hidden pr-2">
                          <span className="font-mono text-[10px] text-teal-400 block">{sop.id}</span>
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-teal-300 transition-colors">{sop.title}</p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 shrink-0 transition-colors" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select an equipment node on the map to inspect live telemetry and linked procedures.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
