import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Flame, ShieldAlert, AlertTriangle, ArrowRight, 
  CheckCircle2, X, RefreshCw, Zap, Layers, Sparkles, BookOpen
} from 'lucide-react';

interface ScenarioDef {
  title: string;
  triggerAlarm: string;
  cascadingImpact: string;
  sisAction: string;
  mitigationSteps: string[];
  downstreamEquipment: string;
}

const SCENARIOS_MAP: Record<string, Record<string, ScenarioDef>> = {
  'GA-1201A': {
    'orifice_plug': {
      title: 'API Plan 11 Flush Orifice Plugging & Seal Cavitation',
      triggerAlarm: 'Seal Flush Orifice DP drop; seal pot temperature spikes past 78°C',
      cascadingImpact: 'Loss of cooling flow to SiC/Carbon faces triggers vapor pocketing in stuffing box, creating secondary mechanical seal face scorching and pump vibration rise.',
      sisAction: 'If casing pressure drops below 0.5 barg, PSLL-1201 (1oo2 voting) trips GA-1201A motor starter and closes suction SDV-1201.',
      mitigationSteps: [
        'Immediately switch suction and discharge to standby pump GA-1201B.',
        'Isolate Plan 11 flush line and purge strainer orifice using low-pressure nitrogen.',
        'Inspect mechanical seal leakage sight glass for hydrocarbon misting before restarting.'
      ],
      downstreamEquipment: 'Solvent Heater EA-5601 & Separator LV-6701'
    },
    'suction_loss': {
      title: 'Feed Tank Starvation & Low Suction Pressure',
      triggerAlarm: 'PIT-1201 indicates suction pressure falling rapidly from 2.8 barg to 0.6 barg',
      cascadingImpact: 'NPSH available drops below NPSH required (2.4m), triggering violent acoustic cavitation and impeller erosion.',
      sisAction: 'PSLL-1201 trips at 0.5 barg (1oo2 voting). Interlock SEQ-1201 executes immediate emergency stop to prevent dry running.',
      mitigationSteps: [
        'Verify upstream feed vessel buffer level and booster pump delivery.',
        'Throttle discharge control valve FCV-1201 to reduce flow rate and suppress cavitation noise.',
        'Perform field vibration spot-check on bearing housing.'
      ],
      downstreamEquipment: 'Dryer YD-2301 Feed Loop'
    }
  },
  'KC-4501': {
    'valve_flutter': {
      title: 'Recycle Gas Compressor Stage 2 Suction Valve Flutter',
      triggerAlarm: 'VSHH-4501 crosshead vibration exceeds 8.5 mm/s (Advisory threshold)',
      cascadingImpact: 'Fatigue fracture of valve plate springs creates reverse gas leakage, elevating Stage 2 discharge temperature past 140°C.',
      sisAction: 'VSHH-4501 trips compressor drive motor at 12.0 mm/s (2oo3 voting logic), opening emergency anti-surge kickback valves.',
      mitigationSteps: [
        'Unload cylinder clearance pockets to 50% capacity via DCS.',
        'Check suction pulsation bottle damper pressure delta.',
        'Prepare Hoerbiger plate valve spare kit PRT-VLV-4501 for hot swap.'
      ],
      downstreamEquipment: 'Reactor DC-3401A Recycle Loop'
    }
  },
  'EA-5601': {
    'tube_fouling': {
      title: 'Shell-and-Tube Exchanger Severe Tube Bundle Fouling',
      triggerAlarm: 'Differential pressure transmitter PDT-5601 reaches 1.65 bar (Normal: 0.8 bar)',
      cascadingImpact: 'Thermal transfer efficiency drops by 34%, leading to sub-cooled hexane delivery to separator column and heavy reflux carryover.',
      sisAction: 'High differential pressure alarm activates in DCS; if shell overpressure occurs, safety relief valve PSV-5601 relieves to Flare FA-8901.',
      mitigationSteps: [
        'Increase steam supply valve opening gradually to compensate heat transfer loss.',
        'Initiate online chemical solvent backflush sequence per SOP-PET-2024-056.',
        'Schedule ultrasonic tube wall thickness inspection during upcoming turnaround.'
      ],
      downstreamEquipment: 'Level Control Valve LV-6701 & Flare Drum FA-8901'
    }
  },
  'LV-6701': {
    'positioner_stiction': {
      title: 'Fisher DVC6200 Positioner Linkage Slop & Severe Hunting',
      triggerAlarm: 'Level transmitter LT-6701 oscillates between 32% and 68% with 45-second period',
      cascadingImpact: 'Downstream flow surging destabilizes the hydrocarbon separation interface, risking liquid carryover into gas compressors.',
      sisAction: 'If separator liquid level drops below 10%, LSLL-6701 triggers SIS emergency closure of LV-6701 to protect pump suction.',
      mitigationSteps: [
        'Switch loop from Cascade to Manual mode at 48% fixed output to stabilize plant level.',
        'Inspect Fisher DVC6200 travel feedback magnet array for dirt and mechanical play.',
        'Apply pneumatic bypass filter regulator clean-out to remove moisture.'
      ],
      downstreamEquipment: 'Flare Drum FA-8901 & Hexane Recovery'
    }
  }
};

export const WhatIfSimulatorModal: React.FC = () => {
  const { activeModal, setActiveModal, equipmentList, sendChatMessage, setCurrentView } = useApp();
  const [selectedEqId, setSelectedEqId] = useState('GA-1201A');
  const [selectedDisturbance, setSelectedDisturbance] = useState('orifice_plug');
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  if (activeModal !== 'what_if_simulator') return null;

  const currentEquipment = equipmentList.find(e => e.code === selectedEqId || e.id === selectedEqId) || equipmentList[0];
  const eqScenarios = SCENARIOS_MAP[selectedEqId] || SCENARIOS_MAP['GA-1201A'];
  const activeScenario = eqScenarios[selectedDisturbance] || Object.values(eqScenarios)[0];

  const handleAskAiAboutScenario = () => {
    setActiveModal(null);
    setCurrentView('assistant');
    sendChatMessage(`What is the emergency mitigation protocol for ${selectedEqId} when encountering ${activeScenario.title}? Detail the SIS interlocks and spare parts.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl shadow-amber-500/10 p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">"What-If" Process Safety & Cascading Incident Simulator</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HAZOP SANDBOX
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate process disturbances, trace multi-unit domino propagation, and verify emergency SIS barrier mitigation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Equipment & Anomaly Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Equipment Node</label>
            <select
              value={selectedEqId}
              onChange={(e) => {
                setSelectedEqId(e.target.value);
                const newEqScenarios = SCENARIOS_MAP[e.target.value] || SCENARIOS_MAP['GA-1201A'];
                setSelectedDisturbance(Object.keys(newEqScenarios)[0]);
                setCheckedSteps({});
              }}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
            >
              <option value="GA-1201A">GA-1201A • API 610 Hexane Feed Pump</option>
              <option value="KC-4501">KC-4501 • 2-Stage Recycle Gas Compressor</option>
              <option value="EA-5601">EA-5601 • TEMA BEM Solvent Shell & Tube Heater</option>
              <option value="LV-6701">LV-6701 • Severe Service Separator Level Valve</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Disturbance Trigger</label>
            <select
              value={selectedDisturbance}
              onChange={(e) => {
                setSelectedDisturbance(e.target.value);
                setCheckedSteps({});
              }}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
            >
              {Object.entries(eqScenarios).map(([key, def]) => (
                <option key={key} value={key}>{def.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3-Stage Cascading Process Domino Visualizer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
            <span>Dynamic Cascading Impact Propagation</span>
            <span className="text-[10px] text-amber-400 font-mono">3-STAGE HAZOP BARRIER</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                  STAGE 1: ROOT TRIGGER
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-100">{activeScenario.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">{activeScenario.triggerAlarm}</p>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  STAGE 2: PROCESS SPREAD
                </span>
                <Layers className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-100">Downstream Impact</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">{activeScenario.cascadingImpact}</p>
              <span className="text-[10px] font-mono text-cyan-400 block pt-1 border-t border-slate-700/40">
                Affects: {activeScenario.downstreamEquipment}
              </span>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  STAGE 3: SIS INTERLOCK
                </span>
                <ShieldAlert className="w-4 h-4 text-teal-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-100">Automated ESD Action</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">{activeScenario.sisAction}</p>
            </div>
          </div>
        </div>

        {/* Interactive Emergency Mitigation Checklist */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Operator Emergency Mitigation Protocol (Verified SOP)
            </span>
            <span className="text-[11px] font-mono text-teal-400 font-bold">
              {Object.values(checkedSteps).filter(Boolean).length} of {activeScenario.mitigationSteps.length} Actions Completed
            </span>
          </div>

          <div className="space-y-2">
            {activeScenario.mitigationSteps.map((step, idx) => (
              <label 
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedSteps[idx] 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checkedSteps[idx]}
                  onChange={(e) => setCheckedSteps(prev => ({ ...prev, [idx]: e.target.checked }))}
                  className="w-4 h-4 mt-0.5 accent-teal-500 rounded shrink-0"
                />
                <span className="text-xs leading-relaxed">{step}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">
            Ground Truth: PT Chandra Asri Pacific Tbk P&ID TJC-LLD & SIS Interlock Matrix
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleAskAiAboutScenario}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI Deep Troubleshooting</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
