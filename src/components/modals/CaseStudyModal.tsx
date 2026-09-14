import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft, 
  Layers, CheckCircle2, Wrench, Sparkles, TrendingUp, 
  Clock, DollarSign, Activity, FileText, ChevronRight
} from 'lucide-react';

export const CaseStudyModal: React.FC = () => {
  const { activeModal, closeModal, openEquipment, openDoc, openKnowledge, openSparePart } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (activeModal !== 'case_study') return null;

  const totalSteps = 5;

  const handleStepJump = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  CALIBER 2026 CASE STUDY
                </span>
                <span className="text-xs text-slate-400">PT Chandra Asri Pacific Tbk</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                Hexane Feed Pump GA-1201A Anomaly Resolution Flow
              </h3>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {[
            { step: 1, label: '1. DCS Alarm Trigger' },
            { step: 2, label: '2. P&ID Cross-Ref' },
            { step: 3, label: '3. Veteran Tacit Wisdom' },
            { step: 4, label: '4. Spare Part BOM' },
            { step: 5, label: '5. Impact & ROI' },
          ].map(s => (
            <button
              key={s.step}
              onClick={() => handleStepJump(s.step)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                currentStep === s.step
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : currentStep > s.step
                  ? 'bg-teal-950/60 text-teal-300 border border-teal-800/60'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{s.label}</span>
              {currentStep > s.step && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
            </button>
          ))}
        </div>

        {/* Body Content by Step */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* STEP 1: DCS ALARM TRIGGER */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-300">
                    Incident Trigger: High Vibration (VSHH-1201) & Suction Pressure Dip
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    At 03:14 WIB, DCS reported vibration spike on Hexane Feed Pump <strong>GA-1201A</strong> reaching 
                    <strong> 4.8 mm/s RMS</strong> (threshold 4.5 mm/s alarm, 7.1 mm/s trip). Simultaneously, suction 
                    pressure transmitter <strong>PT-1201</strong> dropped to <strong>0.42 barg</strong> (trip setpoint 0.50 barg 2oo3).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Vibration (VSHH-1201)</span>
                  <p className="text-xl font-bold font-mono text-amber-400">4.8 mm/s</p>
                  <p className="text-[10px] text-rose-400">Trip Setpoint: &gt; 7.1 mm/s (1oo2)</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Suction Press (PSLL-1201)</span>
                  <p className="text-xl font-bold font-mono text-rose-400">0.42 barg</p>
                  <p className="text-[10px] text-amber-400">Normal Range: 0.8 - 1.2 barg</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mechanical Seal Flush</span>
                  <p className="text-xl font-bold font-mono text-cyan-400">Plan 11 + 62</p>
                  <p className="text-[10px] text-teal-400">Discharge to Seal Chamber</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Inspect the digital twin node profile directly:</span>
                <button
                  onClick={() => { closeModal(); openEquipment('GA-1201A'); }}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Open GA-1201A Twin Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: P&ID & PLOT PLAN CROSS-REFERENCE */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3">
                <Layers className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-teal-300">
                    Step 2: Instant P&ID & Plot Plan Cross-Referencing
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Without leaving PetroKnow, the shift engineer cross-references P&ID <strong>PID-CAL-1201-01</strong> and 
                    Plot Plan <strong>PLP-CAL-1201-01</strong> to trace the suction strainer <strong>STR-1201</strong> differential 
                    pressure tapping and mechanical seal flush tubing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">P&ID Drawing</span>
                    <span className="font-mono text-[10px] text-teal-400">PID-CAL-1201-01</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Reveals 4"-HC-1001 line from Tank TK-1101, strainer STR-1201 with bypass valve, and Plan 11 flush line tapping off pump discharge.
                  </p>
                  <button
                    onClick={() => { closeModal(); openDoc('doc-set-1-pid'); }}
                    className="w-full py-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-teal-500/30 transition-colors"
                  >
                    <span>View P&ID Drawing Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Plot Plan & Elevation</span>
                    <span className="font-mono text-[10px] text-cyan-400">PLP-CAL-1201-01</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Confirms GA-1201A is in Area 1200, Bay 4 (ATEX Zone 1 classified), requiring intrinsically safe (Ex d) diagnostic tools.
                  </p>
                  <button
                    onClick={() => { closeModal(); openDoc('doc-set-1-plot'); }}
                    className="w-full py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-cyan-500/30 transition-colors"
                  >
                    <span>View Plot Plan Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: VETERAN TACIT WISDOM RETRIEVAL */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-purple-300">
                    Step 3: AI Retrieval of Veteran Tacit Knowledge (Retiring Expert Wisdom)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    PetroKnow AI Assistant automatically surfaces the tacit troubleshooting lesson submitted by 
                    Senior Rotating Specialist <strong>Pak Joko Santoso</strong> (28 years at Chandra Asri):
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-teal-400">SOP-TAC-2024-001 (One Point Lesson)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    SME VERIFIED
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-100">
                  Hexane Pump Plan 11 Flush Line Vapor Locking & Cavitation Trap
                </h5>
                <blockquote className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border-l-2 border-teal-400 italic">
                  &quot;When feed tank TK-1101 level drops below 35% during ambient heat (&gt;34°C), hexane vaporizes inside 
                  the 3/4-inch Plan 11 flush orifice. Do NOT immediately dismantle the pump. First, open flush vent valve 
                  V-1201-F to purge vapor pocket into closed drain, then switch to backup pump GA-1201B.&quot;
                </blockquote>
                <div className="flex justify-end">
                  <button
                    onClick={() => { closeModal(); openKnowledge('tac-001'); }}
                    className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-teal-500/30 transition-colors"
                  >
                    <span>Read Full Tacit Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SPARE PART BOM */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                <Wrench className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-cyan-300">
                    Step 4: Real-time Compatible Spare Part Reservation
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    If seal face refurbishment is necessary, the technician checks inventory and locates the certified 
                    API 682 Plan 11 seal cartridge without navigating away.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">PRT-MEC-3112</span>
                  <h5 className="text-sm font-bold text-slate-100 mt-0.5">Torishima CAL-80-250 Plan 11 Mechanical Seal Cartridge</h5>
                  <p className="text-xs text-slate-400 mt-0.5">Bin Location: Warehouse A-04, Bay 2 • Current Stock: 2 sets</p>
                </div>
                <button
                  onClick={() => { closeModal(); openSparePart('PRT-MEC-3112'); }}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-cyan-500/30 transition-colors shrink-0"
                >
                  <span>View Part Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: IMPACT & ROI */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    Step 5: Operational Results & Business Impact (ROI)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    By combining P&ID cross-referencing with Pak Joko's tacit wisdom, the incident was safely resolved in 
                    <strong> 4.2 hours MTTR</strong> instead of an 18.5-hour emergency shutdown.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">MTTR Reduction</span>
                  <p className="text-2xl font-bold font-mono text-teal-400">77% Faster</p>
                  <p className="text-[10px] text-slate-400">4.2h vs 18.5h baseline</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Downtime Prevented</span>
                  <p className="text-2xl font-bold font-mono text-cyan-400">14.3 Hours</p>
                  <p className="text-[10px] text-slate-400">Zero flaring or trip</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Direct Cost Savings</span>
                  <p className="text-2xl font-bold font-mono text-emerald-400">$85,000 USD</p>
                  <p className="text-[10px] text-slate-400">Calculated from Chandra Asri OPEX</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <h5 className="font-bold text-slate-100 mb-1">Conclusion for CALIBER 2026 Evaluation:</h5>
                PetroKnow is not merely a document viewer—it is an intelligent, active operational nervous system that turns static PDF archives and veteran tacit experience into live, accessible, and measurable plant reliability.
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/95">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            Step {currentStep} of {totalSteps}
          </span>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-teal-500/20"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
            >
              <span>Complete Walkthrough</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
