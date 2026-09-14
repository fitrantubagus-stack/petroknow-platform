import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, ShieldAlert, CheckCircle2, UserCheck, AlertTriangle, 
  X, FileText, Check, ArrowRight, Activity, Wrench, Package, Send
} from 'lucide-react';

export const ShiftHandoverModal: React.FC = () => {
  const { activeModal, setActiveModal, equipmentList, stats, addActivityItem } = useApp();
  const [outgoingSupervisor, setOutgoingSupervisor] = useState('Wahyu Setiadi (Shift A - Day)');
  const [incomingSupervisor, setIncomingSupervisor] = useState('Bambang Trihatmodjo (Shift B - Night)');
  const [handoverNotes, setHandoverNotes] = useState(
    '1. GA-1201A Hexane Feed Pump: Mechanical seal flush Plan 11 orifice was inspected; slight temperature elevation resolved after clearing pipe strain. Monitor bearing housing temperature.\n2. CT-7801 Fan Cell: Dynamic balancing completed by vibration team; vibration steady at 3.2 mm/s (well below 7.1 mm/s trip threshold).\n3. Warehouse: Reserved 1x John Crane 5620 seal kit for scheduled turnaround next Tuesday.'
  );
  const [checklist, setChecklist] = useState({
    logReadings: true,
    lotoPermits: true,
    interlocksNormal: true,
    ppeScbaVerified: true
  });
  const [isSigned, setIsSigned] = useState(false);

  if (activeModal !== 'shift_handover') return null;

  const handleSignHandover = () => {
    setIsSigned(true);
    addActivityItem({
      title: 'Shift Handover Protocol Signed & Completed',
      user: outgoingSupervisor.split(' ')[0],
      targetType: 'DCS Shift Handover Log',
      detail: `Formal 12-hour custody transfer from ${outgoingSupervisor} to ${incomingSupervisor}. 8/8 units verified, 0 active trips.`
    });
    setTimeout(() => {
      setActiveModal(null);
      setIsSigned(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-teal-500/40 shadow-2xl shadow-teal-500/10 p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">12-Hour Operational Shift Handover Cockpit</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  DCS SHIFT-LOG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PT Chandra Asri Pacific Tbk • Shift A (Day: 07:00–19:00) ➔ Shift B (Night: 19:00–07:00)
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

        {/* 12-Hour Operational Summary Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px]">Units Operating</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold font-mono text-emerald-400">8 / 8 Online</p>
            <p className="text-[10px] text-slate-400">1 Advisory Advisory</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px]">WOs Completed</span>
              <Wrench className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-bold font-mono text-cyan-400">2 Closed</p>
            <p className="text-[10px] text-slate-400">WO-0812 & WO-0814</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px]">Tacit Captured</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold font-mono text-indigo-400">1 In Queue</p>
            <p className="text-[10px] text-slate-400">Pending SME verification</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px]">SIS Emergency Trips</span>
              <ShieldAlert className="w-4 h-4 text-teal-400" />
            </div>
            <p className="text-xl font-bold font-mono text-teal-300">0 Trips</p>
            <p className="text-[10px] text-slate-400">Interlocks 100% nominal</p>
          </div>
        </div>

        {/* Handover Specifics: Critical Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Unit Operational Status & Handover Digest</span>
            <span className="text-[10px] font-normal text-slate-400">Logged by Outgoing Shift Lead</span>
          </label>
          <textarea
            rows={4}
            value={handoverNotes}
            onChange={(e) => setHandoverNotes(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition-colors font-mono leading-relaxed"
          />
        </div>

        {/* Safety & Compliance Checklist */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Mandatory Shift Handover Compliance Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={checklist.logReadings} 
                onChange={(e) => setChecklist(prev => ({ ...prev, logReadings: e.target.checked }))}
                className="w-4 h-4 accent-teal-500 rounded" 
              />
              <span>Field round log readings synchronized with DCS telemetry</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={checklist.lotoPermits} 
                onChange={(e) => setChecklist(prev => ({ ...prev, lotoPermits: e.target.checked }))}
                className="w-4 h-4 accent-teal-500 rounded" 
              />
              <span>LOTO isolations & work permits reviewed for Area 1200–8900</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={checklist.interlocksNormal} 
                onChange={(e) => setChecklist(prev => ({ ...prev, interlocksNormal: e.target.checked }))}
                className="w-4 h-4 accent-teal-500 rounded" 
              />
              <span>No unauthorized SIS interlock bypasses in place</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={checklist.ppeScbaVerified} 
                onChange={(e) => setChecklist(prev => ({ ...prev, ppeScbaVerified: e.target.checked }))}
                className="w-4 h-4 accent-teal-500 rounded" 
              />
              <span>ATEX Zone 1 breathing apparatus (SCBA) & muster point ready</span>
            </label>
          </div>
        </div>

        {/* Dual Signature Confirmation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outgoing Custodian</span>
            <p className="text-xs font-bold text-slate-200">{outgoingSupervisor}</p>
            <p className="text-[10px] text-teal-400 font-mono">Digital ID: EMP-1113 • Verified Active</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Incoming Custodian</span>
            <p className="text-xs font-bold text-slate-200">{incomingSupervisor}</p>
            <p className="text-[10px] text-cyan-400 font-mono">Digital ID: EMP-1042 • On Duty Acceptance</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSignHandover}
            disabled={isSigned}
            className={`px-6 py-2.5 rounded-xl text-slate-950 text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
              isSigned 
                ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/30' 
                : 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/25'
            }`}
          >
            {isSigned ? (
              <>
                <Check className="w-4 h-4" />
                <span>Handover Custody Transferred!</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Sign & Transfer 12-Hour Custody</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
