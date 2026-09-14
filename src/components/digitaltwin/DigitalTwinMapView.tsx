import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness } from '../../utils/freshness';
import { 
  Map, Activity, AlertTriangle, CheckCircle2, 
  QrCode, ArrowUpRight, ShieldCheck, Clock, 
  Layers, RefreshCw, ZoomIn, ZoomOut, Compass, Info,
  Box, Eye, ShieldAlert, Cpu
} from 'lucide-react';

export const DigitalTwinMapView: React.FC = () => {
  const { equipmentList, knowledgeEntries, openEquipment, openKnowledge } = useApp();
  const [selectedEqId, setSelectedEqId] = useState<string>('GA-1201A');
  const [filterArea, setFilterArea] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'2d' | '2.5d'>('2d');
  const [showHazardZones, setShowHazardZones] = useState<boolean>(true);

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
              {viewMode === '2d' ? '2D PLOT PLAN SCHEMATIC' : '2.5D ISOMETRIC GRID'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Spatial representation of Cilegon petrochemical equipment nodes reflecting real-time telemetry, interlocks, and procedural health.
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 2D / 2.5D Isometric Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700/80">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '2d'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>2D Plot Plan</span>
            </button>
            <button
              onClick={() => setViewMode('2.5d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === '2.5d'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>2.5D Isometric</span>
            </button>
          </div>

          {/* Hazard Zones Toggle */}
          <button
            onClick={() => setShowHazardZones(!showHazardZones)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showHazardZones 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ATEX Zones</span>
          </button>

          {/* Dynamic Filter Area Selector */}
          <div className="flex items-center gap-2">
            <select
              value={filterArea}
              onChange={(e) => {
                setFilterArea(e.target.value);
                if (e.target.value !== 'ALL') {
                  const firstInNewArea = equipmentList.find(eq => eq.area === e.target.value);
                  if (firstInNewArea) setSelectedEqId(firstInNewArea.id);
                }
              }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
            >
              {areas.map(a => (
                <option key={a} value={a}>{a === 'ALL' ? 'All Areas (1200 - 8900)' : a}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Plant Map Canvas */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pb-2 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-4 text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" /> Normal & Verified</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" /> Telemetry Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" /> Overdue SOP Decay</span>
              {showHazardZones && (
                <span className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-sm bg-amber-500/40 border border-amber-400" /> Zone 1 / Zone 2 Classified
                </span>
              )}
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              {filteredEquipment.length} Assets Monitored
            </span>
          </div>

          {/* SVG Map Container (Supports 2D and 2.5D Isometric Tilt) */}
          <div 
            className="relative aspect-[16/10] w-full bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center"
            style={viewMode === '2.5d' ? { perspective: '1200px' } : undefined}
          >
            <div 
              className="w-full h-full transition-transform duration-700 ease-out flex items-center justify-center"
              style={
                viewMode === '2.5d' 
                  ? { transform: 'rotateX(52deg) rotateZ(-28deg) scale(0.95)', transformStyle: 'preserve-3d' } 
                  : undefined
              }
            >
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
                  <radialGradient id="hazardZone1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Background Grid */}
                <rect width="1000" height="650" fill="url(#grid)" />

                {/* ATEX Hazardous Gas Envelopes (Zone 1 / Zone 2) */}
                {showHazardZones && (
                  <g className="hazard-zones" opacity="0.8">
                    {/* Zone around Feed Pump GA-1201A & Heater EA-5601 (Hexane Zone 1) */}
                    <ellipse cx="180" cy="182" rx="90" ry="60" fill="url(#hazardZone1)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="110" y="115" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">ATEX ZONE 1 (HEXANE)</text>

                    {/* Zone around Recycle Gas Compressor KC-4501 (Ethylene Zone 1) */}
                    <ellipse cx="620" cy="182" rx="100" ry="70" fill="url(#hazardZone1)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="560" y="105" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">ATEX ZONE 1 (ETHYLENE)</text>

                    {/* Zone around Knock Out Drum FA-8901 */}
                    <ellipse cx="680" cy="422" rx="95" ry="65" fill="url(#hazardZone1)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="615" y="350" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">ATEX ZONE 2 (HC GAS)</text>
                  </g>
                )}

                {/* Plot Plan Industrial Boundaries & Main Pipe Rack */}
                <g className="plot-plan-structures" opacity="0.9">
                  {/* Battery Limit Top */}
                  <line x1="40" y1="50" x2="960" y2="50" stroke="#475569" strokeWidth="2" strokeDasharray="12 6" />
                  <text x="50" y="44" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">BATTERY LIMIT [NORTH] - PT CHANDRA ASRI PACIFIC TBK</text>

                  {/* Main Pipe Rack */}
                  <rect x="60" y="275" width="880" height="70" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 3" fillOpacity="0.6" />
                  <line x1="60" y1="310" x2="940" y2="310" stroke="#0369a1" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="500" y="315" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace" letterSpacing="3">
                    MAIN PIPE RACK (4"-HC-1002 / MP STEAM / N2 HEADER)
                  </text>

                  {/* 6m Plant Road at Bottom */}
                  <rect x="60" y="550" width="880" height="40" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" fillOpacity="0.4" />
                  <line x1="60" y1="570" x2="940" y2="570" stroke="#475569" strokeWidth="1" strokeDasharray="10 10" />
                  <text x="500" y="574" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    ASPHALT ACCESS ROAD (6m CLEARANCE - FIRE TRUCK ACCESS)
                  </text>
                </g>

                {/* Inter-Equipment Process Transfer Piping */}
                <g className="pipelines" opacity="0.85">
                  <path d="M 180 182 L 180 280 L 460 280 L 460 182" fill="none" stroke="url(#pipeGrad)" strokeWidth="3.5" strokeDasharray="8 4" />
                  <path d="M 460 182 L 540 182 L 540 280 L 620 280 L 620 182" fill="none" stroke="url(#pipeGrad)" strokeWidth="3" strokeDasharray="6 3" />
                  <path d="M 340 422 L 340 340 L 320 340 L 320 182" fill="none" stroke="url(#pipeGrad)" strokeWidth="3" strokeDasharray="8 4" />
                  <path d="M 180 422 L 180 490 L 680 490 L 680 422" fill="none" stroke="url(#pipeGrad)" strokeWidth="3.5" strokeDasharray="8 4" />
                  <path d="M 520 422 L 520 340 L 520 280" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="5 3" />
                </g>

                {/* Area Group Outlines */}
                <g className="area-boxes">
                  <rect x="110" y="110" width="130" height="140" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="120" y="130" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 1200: FEED</text>

                  <rect x="255" y="110" width="130" height="140" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="265" y="130" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 2300: DRYING</text>

                  <rect x="395" y="110" width="140" height="140" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="405" y="130" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 3400: CATALYST</text>

                  <rect x="550" y="110" width="150" height="140" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="560" y="130" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 4500: RECYCLE</text>

                  <rect x="110" y="370" width="130" height="150" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="120" y="390" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 5600: HEATER</text>

                  <rect x="270" y="370" width="140" height="150" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="280" y="390" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 6700: VALVE</text>

                  <rect x="445" y="370" width="150" height="150" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="455" y="390" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 7800: COOLING</text>

                  <rect x="615" y="370" width="150" height="150" rx="10" fill="#0f172a" fillOpacity="0.4" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="625" y="390" fill="#64748b" fontSize="9" fontWeight="bold" fontFamily="monospace">AREA 8900: REFLUX</text>
                </g>

                {/* Equipment Nodes */}
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
                      {/* Isometric 3D Base Shadow if in 2.5D Mode */}
                      {viewMode === '2.5d' && (
                        <ellipse cx="0" cy="18" rx="34" ry="16" fill="#020617" opacity="0.75" />
                      )}

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

                      {/* Node Sub-label */}
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

            {/* In-Canvas Badge indicating mode */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="font-mono font-bold">
                {viewMode === '2d' ? 'COORDINATES: ASTM E1488 P&ID' : 'PROJECTION: ISOMETRIC AXIS 30°/30°'}
              </span>
            </div>
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
                  <span>Full Profile</span>
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
                    <span className="text-slate-400 font-medium">Operating Temp</span>
                    <span className="font-mono font-bold text-teal-400">{selectedEq.temp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Operating Pressure</span>
                    <span className="font-mono font-bold text-cyan-400">{selectedEq.pressure}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Flow / Capacity</span>
                    <span className="font-mono font-bold text-emerald-400">{selectedEq.flowRate}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Engineering Purpose</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedEq.description}
                  </p>
                </div>
              </div>

              {/* Linked SOPs for this Node */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Linked Standard Procedures</h4>
                  <span className="text-[10px] font-mono text-teal-400 font-bold">{linkedSops.length} linked</span>
                </div>
                
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
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
