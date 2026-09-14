import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness } from '../../utils/freshness';
import { 
  Map, Activity, AlertTriangle, CheckCircle2, 
  ArrowUpRight, ShieldCheck, Layers, Eye, 
  ShieldAlert, Cpu, Gauge, Zap, Compass, Flame,
  FileText, ExternalLink, RefreshCw, Radio
} from 'lucide-react';

// Exact calibrated canvas coordinates (1200 x 720 SCADA grid)
const EQUIPMENT_LAYOUT: Record<string, { 
  x: number; 
  y: number; 
  padX: number;
  padY: number;
  padW: number; 
  padH: number; 
  unitCode: string; 
  unitTitle: string;
  serviceLine: string;
  atexZone?: 'Zone 1' | 'Zone 2';
  hazardRadius?: number;
}> = {
  'GA-1201A': { 
    x: 160, y: 175, 
    padX: 65, padY: 85, padW: 190, padH: 180, 
    unitCode: 'UNIT 1200', unitTitle: 'Feed Preparation',
    serviceLine: '4"-HC-1001 Liquid n-Hexane',
    atexZone: 'Zone 1', hazardRadius: 95
  },
  'YD-2301': { 
    x: 450, y: 175, 
    padX: 355, padY: 85, padW: 190, padH: 180, 
    unitCode: 'UNIT 2300', unitTitle: 'Drying & Separation',
    serviceLine: '8"-PLT-2301 Polyethylene Pellets',
    atexZone: 'Zone 2', hazardRadius: 90
  },
  'DC-3401A': { 
    x: 750, y: 175, 
    padX: 655, padY: 85, padW: 190, padH: 180, 
    unitCode: 'UNIT 3400', unitTitle: 'Catalyst & Degassing',
    serviceLine: '14"-N2-3401 Stripping Gas',
    atexZone: 'Zone 2', hazardRadius: 90
  },
  'KC-4501': { 
    x: 1040, y: 175, 
    padX: 945, padY: 85, padW: 190, padH: 180, 
    unitCode: 'UNIT 4500', unitTitle: 'Cycle Gas Compression',
    serviceLine: '10"-GAS-4501 Unreacted Ethylene',
    atexZone: 'Zone 1', hazardRadius: 105
  },
  'EA-5601': { 
    x: 160, y: 515, 
    padX: 65, padY: 425, padW: 190, padH: 180, 
    unitCode: 'UNIT 5600', unitTitle: 'Thermal Exchanger',
    serviceLine: '12"-RX-5601 Exothermic Loop',
    atexZone: 'Zone 2', hazardRadius: 85
  },
  'LV-6701': { 
    x: 450, y: 515, 
    padX: 355, padY: 425, padW: 190, padH: 180, 
    unitCode: 'UNIT 6700', unitTitle: 'Reaction Slurry Control',
    serviceLine: '4"-SLR-6701 Angle Slurry Discharge'
  },
  'CT-7801': { 
    x: 750, y: 515, 
    padX: 655, padY: 425, padW: 190, padH: 180, 
    unitCode: 'UNIT 7800', unitTitle: 'Utility Cooling Tower',
    serviceLine: '16"-CWR-7801 Cooling Water Loop'
  },
  'FA-8901': { 
    x: 1040, y: 515, 
    padX: 945, padY: 425, padW: 190, padH: 180, 
    unitCode: 'UNIT 8900', unitTitle: 'Safety Flare Knockout',
    serviceLine: '12"-FLR-8901 Emergency Relief Header',
    atexZone: 'Zone 2', hazardRadius: 100
  }
};

export const DigitalTwinMapView: React.FC = () => {
  const { equipmentList, knowledgeEntries, documents, openEquipment, openKnowledge, openDoc } = useApp();
  const [selectedEqId, setSelectedEqId] = useState<string>('GA-1201A');
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'scada' | 'pid' | 'isometric'>('scada');
  const [showHazardZones, setShowHazardZones] = useState<boolean>(true);
  const [showPipelines, setShowPipelines] = useState<boolean>(true);
  const [showInterlocks, setShowInterlocks] = useState<boolean>(true);

  // Safe selected equipment fallback
  const selectedEq = equipmentList.find(e => e.id === selectedEqId) || equipmentList[0];

  // Linked SOPs and documents for selected equipment
  const linkedSops = selectedEq 
    ? knowledgeEntries.filter(k => k.linkedEquipmentIds.includes(selectedEq.id))
    : [];

  const linkedDocs = selectedEq
    ? documents.filter(d => 
        d.equipmentId === selectedEq.id || 
        d.docNumber.includes(selectedEq.id) ||
        (selectedEq.datasheetDocNo && d.docNumber.includes(selectedEq.datasheetDocNo))
      )
    : [];

  // Determine health color for each equipment node based on status and knowledge freshness
  const getNodeHealth = (eqId: string, status: string) => {
    if (status === 'warning') return { 
      color: '#f59e0b', 
      ring: 'stroke-amber-400', 
      fill: '#f59e0b',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30', 
      text: 'Telemetry Warning',
      pulse: 'bg-amber-400'
    };
    const sops = knowledgeEntries.filter(k => k.linkedEquipmentIds.includes(eqId));
    const hasStale = sops.some(s => calculateFreshness(s).state === 'stale');
    if (hasStale) return { 
      color: '#f43f5e', 
      ring: 'stroke-rose-400', 
      fill: '#f43f5e',
      badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30', 
      text: 'Procedure Stale',
      pulse: 'bg-rose-400'
    };
    return { 
      color: '#10b981', 
      ring: 'stroke-emerald-400', 
      fill: '#10b981',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', 
      text: 'Optimal / Verified',
      pulse: 'bg-emerald-400'
    };
  };

  // Render SVG Vector glyph depending on machine category
  const renderEquipmentGlyph = (id: string, isSelected: boolean, healthColor: string) => {
    const strokeWidth = isSelected ? 2.5 : 1.75;
    const strokeColor = isSelected ? '#38bdf8' : '#cbd5e1';

    switch (id) {
      case 'GA-1201A':
        // Centrifugal End-Suction Pump with Impeller and Motor Skid
        return (
          <g className="eq-glyph-pump">
            {/* Baseplate Skid */}
            <rect x="-38" y="-22" width="76" height="44" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Motor Body */}
            <rect x="-32" y="-12" width="24" height="24" rx="3" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-28" y1="-12" x2="-28" y2="12" stroke="#475569" strokeWidth="1" />
            <line x1="-24" y1="-12" x2="-24" y2="12" stroke="#475569" strokeWidth="1" />
            <line x1="-20" y1="-12" x2="-20" y2="12" stroke="#475569" strokeWidth="1" />
            {/* Coupling */}
            <rect x="-8" y="-5" width="6" height="10" rx="1" fill="#475569" />
            {/* Pump Volute Casing */}
            <circle cx="12" cy="0" r="16" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="12" cy="0" r="7" fill="none" stroke={healthColor} strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Tangential Discharge Flange */}
            <path d="M 12 -16 L 12 -28 L 22 -28 L 22 -14" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="10" y1="-28" x2="24" y2="-28" stroke={strokeColor} strokeWidth="2.5" />
            {/* Suction Nozzle */}
            <line x1="28" y1="0" x2="34" y2="0" stroke={strokeColor} strokeWidth="2" />
            <line x1="34" y1="-6" x2="34" y2="6" stroke={strokeColor} strokeWidth="2.5" />
          </g>
        );

      case 'YD-2301':
        // Horizontal Rotary Polymer Dryer Drum
        return (
          <g className="eq-glyph-dryer">
            {/* Foundation plinth */}
            <rect x="-42" y="-22" width="84" height="44" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Rotary Drum */}
            <rect x="-32" y="-14" width="64" height="28" rx="6" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Steam Tube Bands */}
            <line x1="-16" y1="-14" x2="-16" y2="14" stroke="#475569" strokeWidth="1.5" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke={healthColor} strokeWidth="1.5" strokeDasharray="2 2" />
            <line x1="16" y1="-14" x2="16" y2="14" stroke="#475569" strokeWidth="1.5" />
            {/* Drive Sprocket Ring */}
            <circle cx="0" cy="0" r="18" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4 2" />
            {/* Feed Chute & Discharge */}
            <path d="M -32 -8 L -40 -16" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 32 8 L 40 16" stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'DC-3401A':
        // Degassing Column & Pulse-Jet Dust Collector
        return (
          <g className="eq-glyph-column">
            {/* Tall Vertical Shell */}
            <rect x="-16" y="-34" width="32" height="46" rx="4" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Conical Hopper Bottom */}
            <polygon points="-16,12 16,12 5,28 -5,28" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Rotary Valve */}
            <circle cx="0" cy="33" r="5" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
            {/* Internal Bag Filters */}
            <line x1="-8" y1="-26" x2="-8" y2="6" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="0" y1="-26" x2="0" y2="6" stroke={healthColor} strokeWidth="1.5" strokeDasharray="3 2" />
            <line x1="8" y1="-26" x2="8" y2="6" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Pulse Header */}
            <line x1="-14" y1="-30" x2="14" y2="-30" stroke="#0ea5e9" strokeWidth="2" />
          </g>
        );

      case 'KC-4501':
        // 2-Stage Reciprocating Compressor Train
        return (
          <g className="eq-glyph-compressor">
            <rect x="-42" y="-24" width="84" height="48" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Motor Drive */}
            <rect x="-36" y="-14" width="22" height="28" rx="3" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Frame Crankcase */}
            <rect x="-10" y="-12" width="20" height="24" rx="2" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Opposed Cylinders */}
            <rect x="14" y="-18" width="24" height="14" rx="2" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect x="14" y="4" width="24" height="14" rx="2" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Pulsation Dampener Bottles */}
            <ellipse cx="26" cy="-24" rx="14" ry="4" fill="#0f172a" stroke={healthColor} strokeWidth="1.5" />
            <ellipse cx="26" cy="24" rx="14" ry="4" fill="#0f172a" stroke={healthColor} strokeWidth="1.5" />
          </g>
        );

      case 'EA-5601':
        // Shell & Tube Heat Exchanger (TEMA BEM)
        return (
          <g className="eq-glyph-exchanger">
            {/* Outer Shell */}
            <rect x="-32" y="-16" width="64" height="32" rx="4" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Tubesheet Flanges */}
            <line x1="-24" y1="-18" x2="-24" y2="18" stroke={strokeColor} strokeWidth="2.5" />
            <line x1="24" y1="-18" x2="24" y2="18" stroke={strokeColor} strokeWidth="2.5" />
            {/* Dished End Caps */}
            <path d="M -24 -16 C -36 -10, -36 10, -24 16" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 24 -16 C 36 -10, 36 10, 24 16" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Process Tube Bundle Lines */}
            <line x1="-22" y1="-7" x2="22" y2="-7" stroke={healthColor} strokeWidth="1.5" strokeDasharray="4 2" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#0ea5e9" strokeWidth="1.5" />
            <line x1="-22" y1="7" x2="22" y2="7" stroke={healthColor} strokeWidth="1.5" strokeDasharray="4 2" />
            {/* Shell Nozzles */}
            <line x1="-12" y1="-16" x2="-12" y2="-24" stroke={strokeColor} strokeWidth="2" />
            <line x1="12" y1="16" x2="12" y2="24" stroke={strokeColor} strokeWidth="2" />
          </g>
        );

      case 'LV-6701':
        // Severe-Service Angle Control Valve with Pneumatic Diaphragm Actuator
        return (
          <g className="eq-glyph-valve">
            {/* Valve Angle Body */}
            <polygon points="-16,-12 16,12 16,-12 -16,12" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Central Orifice Plug */}
            <circle cx="0" cy="0" r="4" fill={healthColor} />
            {/* Valve Stem */}
            <line x1="0" y1="-12" x2="0" y2="-26" stroke={strokeColor} strokeWidth="2" />
            {/* Fisher Diaphragm Actuator Dome */}
            <ellipse cx="0" cy="-30" rx="16" ry="7" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M -16 -30 Q 0 -40 16 -30" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Positioner Box */}
            <rect x="6" y="-24" width="8" height="10" rx="1" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          </g>
        );

      case 'CT-7801':
        // Induced Draft Cooling Tower Fan Cell
        return (
          <g className="eq-glyph-fan">
            {/* Tower Plinth */}
            <rect x="-36" y="-30" width="72" height="60" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            {/* Aerodynamic Fan Cowl Ring */}
            <circle cx="0" cy="0" r="24" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Center Hub */}
            <circle cx="0" cy="0" r="7" fill="#0f172a" stroke={healthColor} strokeWidth="2" />
            {/* 6 Fan Blades */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="0"
                x2={19 * Math.cos((deg * Math.PI) / 180)}
                y2={19 * Math.sin((deg * Math.PI) / 180)}
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </g>
        );

      case 'FA-8901':
        // Horizontal Flare Knockout Drum with Mist Pad & Boot
        return (
          <g className="eq-glyph-drum">
            {/* Saddle Supports */}
            <rect x="-24" y="14" width="8" height="10" fill="#475569" />
            <rect x="16" y="14" width="8" height="10" fill="#475569" />
            {/* Horizontal Cylinder Vessel */}
            <rect x="-30" y="-14" width="60" height="28" rx="6" fill="#1e293b" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Internal Liquid Level line */}
            <line x1="-26" y1="4" x2="26" y2="4" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Liquid Boot Reservoir */}
            <rect x="8" y="14" width="10" height="14" rx="2" fill="#1e293b" stroke={strokeColor} strokeWidth="1.5" />
            {/* Top Mist Pad Housing */}
            <rect x="-8" y="-22" width="16" height="8" rx="2" fill="#0f172a" stroke={healthColor} strokeWidth="1.5" />
            {/* Relief Flare Stack Outlet */}
            <line x1="0" y1="-22" x2="0" y2="-30" stroke={strokeColor} strokeWidth="2" />
            <line x1="-5" y1="-30" x2="5" y2="-30" stroke={strokeColor} strokeWidth="2.5" />
          </g>
        );

      default:
        return <circle r="20" fill="#1e293b" stroke={strokeColor} strokeWidth="2" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in text-slate-100">
      {/* Control Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Digital Twin Plant Floor Map
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
              CILEGON PETROCHEMICAL COMPLEX · 8 MONITORED UNITS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time industrial SCADA topology reflecting live operating telemetry, ATEX explosive atmosphere envelopes, and safety instrumented loops (SIL-1 / SIL-2).
          </p>
        </div>

        {/* Console Controls Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Modes */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700/80">
            <button
              onClick={() => setViewMode('scada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'scada'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>SCADA Plot Plan</span>
            </button>
            <button
              onClick={() => setViewMode('pid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'pid'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>P&ID Process Flow</span>
            </button>
            <button
              onClick={() => setViewMode('isometric')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'isometric'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2.5D Isometric</span>
            </button>
          </div>

          {/* Toggle ATEX Zones */}
          <button
            onClick={() => setShowHazardZones(!showHazardZones)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showHazardZones 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10' 
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ATEX Zones</span>
          </button>

          {/* Filter Unit Selector */}
          <select
            value={filterUnit}
            onChange={(e) => {
              setFilterUnit(e.target.value);
              if (e.target.value !== 'ALL') {
                const matched = equipmentList.find(eq => eq.id === e.target.value);
                if (matched) setSelectedEqId(matched.id);
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium cursor-pointer"
          >
            <option value="ALL">All Process Units (1200 - 8900)</option>
            {equipmentList.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.code} - {eq.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Visual Map Canvas + Telemetry & Procedure Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SCADA / Digital Twin Canvas Panel */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          {/* Top Bar Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs pb-3 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-4 text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span>Normal & Verified</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span>Telemetry Warning</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
                <span>SOP Stale / Needs Review</span>
              </span>
              {showHazardZones && (
                <span className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-400" />
                  <span>ATEX Zone 1 / Zone 2</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-teal-400">
              <Compass className="w-3.5 h-3.5" />
              <span>PLANT AXIS: TRUE NORTH 000°</span>
            </div>
          </div>

          {/* SVG Map Container */}
          <div 
            className="relative aspect-[16/10] w-full bg-[#070b14] rounded-xl border border-slate-800/90 overflow-hidden shadow-2xl flex items-center justify-center select-none"
            style={viewMode === 'isometric' ? { perspective: '1100px' } : undefined}
          >
            <div 
              className="w-full h-full transition-transform duration-700 ease-out flex items-center justify-center"
              style={
                viewMode === 'isometric' 
                  ? { transform: 'rotateX(38deg) rotateZ(-18deg) scale(0.92)', transformStyle: 'preserve-3d' } 
                  : undefined
              }
            >
              {/* High-Resolution SVG Canvas (1200 x 720) */}
              <svg 
                className="w-full h-full" 
                viewBox="0 0 1200 720" 
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Subtle Blueprint SCADA Grid */}
                  <pattern id="scadaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="1" />
                  </pattern>
                  <pattern id="majorGrid" width="200" height="200" patternUnits="userSpaceOnUse">
                    <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(51, 65, 85, 0.35)" strokeWidth="1.5" />
                  </pattern>

                  {/* Flowing Process Pipeline Gradients */}
                  <linearGradient id="hydrocarbonFeedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#2dd4bf" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="gasRecycleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="coolingWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
                  </linearGradient>

                  {/* ATEX Zone Radial Gradients */}
                  <radialGradient id="atexZone1Grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="atexZone2Grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                    <stop offset="75%" stopColor="#06b6d4" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </radialGradient>

                  {/* Node Glow Filter */}
                  <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Active Selection Pulsing Filter */}
                  <filter id="selectionGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* SCADA Canvas Grids */}
                <rect width="1200" height="720" fill="#060913" />
                <rect width="1200" height="720" fill="url(#scadaGrid)" />
                <rect width="1200" height="720" fill="url(#majorGrid)" opacity="0.6" />

                {/* Plant Coordinates & Battery Limit Borders */}
                <g className="plant-boundaries" opacity="0.75">
                  {/* North Battery Limit */}
                  <line x1="40" y1="45" x2="1160" y2="45" stroke="#334155" strokeWidth="2" strokeDasharray="10 5" />
                  <text x="50" y="38" fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    NORTH BATTERY LIMIT [N 520.00] · PT CHANDRA ASRI PACIFIC TBK CILEGON
                  </text>

                  {/* Compass Rose */}
                  <g transform="translate(1130, 45)">
                    <circle r="16" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                    <polygon points="0,-13 4,-2 0,0 -4,-2" fill="#38bdf8" />
                    <polygon points="0,13 4,2 0,0 -4,2" fill="#475569" />
                    <text x="0" y="-16" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold" fontFamily="monospace">N</text>
                  </g>
                </g>

                {/* ATEX Hazardous Gas Envelopes (Zone 1 / Zone 2) */}
                {showHazardZones && (
                  <g className="atex-zones" opacity="0.85">
                    {Object.entries(EQUIPMENT_LAYOUT).map(([eqId, layout]) => {
                      if (!layout.atexZone || !layout.hazardRadius) return null;
                      const isZone1 = layout.atexZone === 'Zone 1';
                      return (
                        <g key={`atex-${eqId}`}>
                          <circle
                            cx={layout.x}
                            cy={layout.y}
                            r={layout.hazardRadius}
                            fill={isZone1 ? "url(#atexZone1Grad)" : "url(#atexZone2Grad)"}
                            stroke={isZone1 ? "#f59e0b" : "#06b6d4"}
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={layout.x}
                            y={layout.y - layout.hazardRadius - 6}
                            textAnchor="middle"
                            fill={isZone1 ? "#f59e0b" : "#06b6d4"}
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                            letterSpacing="1"
                          >
                            {layout.atexZone.toUpperCase()} CLASSIFICATION
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Central Multi-Tier Industrial Pipe Rack */}
                <g className="main-pipe-rack">
                  {/* Steel Truss Shadow */}
                  <rect x="50" y="325" width="1100" height="60" rx="4" fill="#0a0f1d" stroke="#1e293b" strokeWidth="2" />
                  
                  {/* Rack Stanchion Columns */}
                  {[100, 280, 450, 620, 790, 960, 1100].map(xCol => (
                    <line key={xCol} x1={xCol} y1="320" x2={xCol} y2="390" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
                  ))}

                  {/* High-Contrast Pipe Headers */}
                  <line x1="60" y1="340" x2="1140" y2="340" stroke="#0ea5e9" strokeWidth="3" opacity="0.8" />
                  <line x1="60" y1="355" x2="1140" y2="355" stroke="#14b8a6" strokeWidth="3" opacity="0.8" />
                  <line x1="60" y1="370" x2="1140" y2="370" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8" />

                  <rect x="420" y="344" width="360" height="22" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="1" />
                  <text x="600" y="358" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" fontWeight="bold" letterSpacing="2">
                    CENTRAL PROCESS PIPE RACK (4"-HC / 10"-GAS / 16"-CWR / MP STEAM)
                  </text>
                </g>

                {/* Animated Flowing Process Stream Pipelines */}
                {showPipelines && (
                  <g className="process-streams" opacity="0.9">
                    {/* 1. Feed Pump GA-1201A -> Pipe Rack -> Heat Exchanger EA-5601 */}
                    <path
                      d="M 160 175 L 160 340 L 220 340 L 220 515 L 160 515"
                      fill="none"
                      stroke="url(#hydrocarbonFeedGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="8 6"
                      filter="url(#neonGlow)"
                    />

                    {/* 2. Heat Exchanger EA-5601 -> Slurry Valve LV-6701 */}
                    <path
                      d="M 195 515 L 415 515"
                      fill="none"
                      stroke="url(#hydrocarbonFeedGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                    />

                    {/* 3. Slurry Valve LV-6701 -> Polymer Dryer YD-2301 */}
                    <path
                      d="M 450 515 L 450 355 L 450 205"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeDasharray="7 5"
                    />

                    {/* 4. Polymer Dryer YD-2301 -> Degassing Bag Filter DC-3401A */}
                    <path
                      d="M 485 175 L 715 175"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                    />

                    {/* 5. Cycle Gas Compressor KC-4501 -> Pipe Rack Loop */}
                    <path
                      d="M 1040 175 L 1040 370 L 600 370"
                      fill="none"
                      stroke="url(#gasRecycleGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="8 5"
                      filter="url(#neonGlow)"
                    />

                    {/* 6. Utility Cooling Tower CT-7801 -> Exchanger EA-5601 */}
                    <path
                      d="M 750 515 L 750 340 L 250 340 L 250 480"
                      fill="none"
                      stroke="url(#coolingWaterGrad)"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />

                    {/* 7. Relief Line to Flare Knockout Drum FA-8901 */}
                    <path
                      d="M 850 370 L 1040 370 L 1040 480"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      strokeDasharray="5 4"
                    />
                  </g>
                )}

                {/* Concrete Equipment Foundations & Secondary Containment Berms */}
                <g className="equipment-plinthes">
                  {Object.entries(EQUIPMENT_LAYOUT).map(([eqId, layout]) => {
                    const isSelected = selectedEq?.id === eqId;
                    return (
                      <g key={`plinth-${eqId}`}>
                        {/* Chamfered Concrete Pad */}
                        <rect
                          x={layout.padX}
                          y={layout.padY}
                          width={layout.padW}
                          height={layout.padH}
                          rx="10"
                          fill={isSelected ? "#0c1527" : "#090d18"}
                          stroke={isSelected ? "#0284c7" : "#1e293b"}
                          strokeWidth={isSelected ? 1.5 : 1}
                          strokeDasharray={isSelected ? undefined : "4 3"}
                        />

                        {/* Pad Header Label */}
                        <text
                          x={layout.padX + 12}
                          y={layout.padY + 18}
                          fill={isSelected ? "#38bdf8" : "#64748b"}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          letterSpacing="1"
                        >
                          {layout.unitCode}: {layout.unitTitle.toUpperCase()}
                        </text>

                        {/* Pipeline Tag Marker */}
                        <text
                          x={layout.padX + 12}
                          y={layout.padY + layout.padH - 12}
                          fill="#475569"
                          fontSize="7.5"
                          fontFamily="monospace"
                        >
                          {layout.serviceLine}
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* 8 Authentic Equipment Nodes */}
                {equipmentList.map((eq) => {
                  const layout = EQUIPMENT_LAYOUT[eq.id];
                  if (!layout) return null;

                  const isSelected = selectedEq?.id === eq.id;
                  const health = getNodeHealth(eq.id, eq.status);

                  return (
                    <g
                      key={eq.id}
                      className="cursor-pointer transition-all group"
                      onClick={() => setSelectedEqId(eq.id)}
                      transform={`translate(${layout.x}, ${layout.y})`}
                    >
                      {/* Active Selection Glow Ring */}
                      {isSelected && (
                        <circle
                          r="54"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          filter="url(#selectionGlow)"
                          className="animate-pulse"
                        />
                      )}

                      {/* Health Halo Ring */}
                      <circle
                        r="44"
                        fill="#0c1322"
                        stroke={health.color}
                        strokeWidth={isSelected ? 3 : 1.75}
                        className="transition-colors duration-200"
                      />

                      {/* Equipment Custom Vector Glyph */}
                      {renderEquipmentGlyph(eq.id, isSelected, health.color)}

                      {/* Equipment Tag Badge (Top Pill) */}
                      <g transform="translate(0, -50)">
                        <rect
                          x="-42"
                          y="-10"
                          width="84"
                          height="20"
                          rx="5"
                          fill="#020617"
                          stroke={isSelected ? "#38bdf8" : "#334155"}
                          strokeWidth={isSelected ? 1.5 : 1}
                        />
                        <text
                          textAnchor="middle"
                          dy="4"
                          fill={isSelected ? "#38bdf8" : "#f1f5f9"}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {eq.code}
                        </text>
                      </g>

                      {/* Live Telemetry Readout Pill (Bottom Pill) */}
                      <g transform="translate(0, 48)">
                        <rect
                          x="-58"
                          y="-9"
                          width="116"
                          height="18"
                          rx="4"
                          fill="#020617"
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                        <circle cx="-48" cy="0" r="3" fill={health.color} />
                        <text
                          textAnchor="middle"
                          dx="6"
                          dy="3.5"
                          fill="#94a3b8"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {eq.pressure.split(' ')[0]} | {eq.temp}
                        </text>
                      </g>

                      {/* SIL Safety Badge */}
                      {eq.silLevel && showInterlocks && (
                        <g transform="translate(42, -34)">
                          <rect
                            x="-14"
                            y="-7"
                            width="28"
                            height="14"
                            rx="3"
                            fill="#1e1b4b"
                            stroke="#6366f1"
                            strokeWidth="1"
                          />
                          <text
                            textAnchor="middle"
                            dy="3.5"
                            fill="#a5b4fc"
                            fontSize="7"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {eq.silLevel}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 6m Heavy Crane & Fire Tender Roadway (Bottom Corridor) */}
                <g className="access-road" opacity="0.8">
                  <rect x="50" y="650" width="1100" height="38" rx="4" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.5" />
                  <line x1="60" y1="669" x2="1140" y2="669" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="14 10" />
                  <text x="600" y="673" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    6.0m ASPHALT ACCESS ROADWAY · HEAVY CRANE MAINTENANCE & EMERGENCY FIRE TENDER CORRIDOR
                  </text>
                </g>
              </svg>
            </div>

            {/* In-Canvas Live Status Badge */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[10px] text-slate-300 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span className="font-mono font-bold text-teal-300">
                SCADA TELEMETRY: LIVE POLLING (1.0 Hz)
              </span>
            </div>

            {/* In-Canvas Coordinates Badge */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-mono text-slate-400">
              E 120.40 - 180.90 · N 450.10 - 520.00
            </div>
          </div>
        </div>

        {/* Selected Equipment Telemetry & Linked SOP Inspector Sidebar */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          {selectedEq ? (
            <>
              {/* Asset Header Card */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-teal-400">
                      {selectedEq.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getNodeHealth(selectedEq.id, selectedEq.status).badgeBg}`}>
                      {getNodeHealth(selectedEq.id, selectedEq.status).text}
                    </span>
                  </div>
                  <button
                    onClick={() => openEquipment(selectedEq.id)}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Full Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-1.5">{selectedEq.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEq.area}</p>
              </div>

              {/* DCS Operating Telemetry Gauge Bars */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5 text-teal-400">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Operating Parameters</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">DCS POLL: OK</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">Pressure</span>
                    <p className="font-mono font-bold text-teal-300 text-sm">{selectedEq.pressure}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">Temperature</span>
                    <p className="font-mono font-bold text-cyan-300 text-sm">{selectedEq.temp}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">Flow / Duty</span>
                    <p className="font-mono font-bold text-emerald-300 text-sm">{selectedEq.flowRate}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">Safety Loop</span>
                    <p className="font-mono font-bold text-indigo-300 text-sm">{selectedEq.silLevel || 'SIL 1'}</p>
                  </div>
                </div>
              </div>

              {/* SIS Emergency Interlock Matrix */}
              {selectedEq.datasheetSpec?.interlockSetpoints && (
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>SIS Interlock Matrix ({selectedEq.interlockSeq})</span>
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {selectedEq.datasheetSpec.interlockSetpoints.map(sp => (
                      <div key={sp.tag} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-300">{sp.tag}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {sp.votingLogic}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[10px]">{sp.parameter}: <strong className="text-slate-100">{sp.tripValue}</strong></p>
                        <p className="text-[9px] text-slate-400 italic">{sp.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked AFC Engineering Documents */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Linked Engineering Drawings & Datasheets
                  </h4>
                  <span className="text-[10px] font-mono text-teal-400 font-bold">{linkedDocs.length} Docs</span>
                </div>
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {linkedDocs.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => openDoc(doc.id)}
                      className="cursor-pointer p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between transition-colors group"
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="font-mono text-[9px] text-teal-400 block">{doc.docNumber}</span>
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-teal-300 transition-colors">
                          {doc.title}
                        </p>
                      </div>
                      <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Standard Operating Procedures (OPLs) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Verified Operating Procedures (OPLs)
                  </h4>
                  <span className="text-[10px] font-mono text-teal-400 font-bold">{linkedSops.length} Linked</span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {linkedSops.map(sop => (
                    <div
                      key={sop.id}
                      onClick={() => openKnowledge(sop.id)}
                      className="cursor-pointer p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between transition-colors group"
                    >
                      <div className="overflow-hidden pr-2">
                        <span className="font-mono text-[9px] text-teal-400 block">{sop.id}</span>
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-teal-300 transition-colors">
                          {sop.title}
                        </p>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select an equipment node on the SCADA map to inspect real-time telemetry, interlocks, and operating procedures.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
