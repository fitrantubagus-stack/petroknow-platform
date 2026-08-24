import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness, getFreshnessBadge } from '../../utils/freshness';
import { 
  X, ShieldCheck, Clock, User, Tag, ArrowUpRight, 
  CheckCircle2, RefreshCw, AlertTriangle, Printer 
} from 'lucide-react';

export const KnowledgeDetailModal: React.FC = () => {
  const { 
    activeModal, closeModal, selectedKnowledgeId, knowledgeEntries, 
    equipmentList, openEquipment, reverifyKnowledgeEntry, verifyKnowledgeEntry, role 
  } = useApp();

  const entry = knowledgeEntries.find(k => k.id === selectedKnowledgeId);

  if (activeModal !== 'knowledge_detail' || !entry) return null;

  const freshness = calculateFreshness(entry);
  const badge = getFreshnessBadge(freshness.state);
  const isPending = entry.status === 'pending';
  const isStale = freshness.state === 'stale';

  const linkedEqs = equipmentList.filter(e => entry.linkedEquipmentIds.includes(e.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-400">{entry.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                  {badge.label}
                </span>
                {entry.isTacit && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tacit Wisdom
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{entry.title}</h3>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Banner */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Author / Contributor</span>
              <p className="font-semibold text-slate-200 mt-0.5">{entry.author}</p>
              <p className="text-[10px] text-slate-400">{entry.authorRole}</p>
            </div>
            <div>
              <span className="text-slate-400">Verified By</span>
              <p className="font-semibold text-slate-200 mt-0.5">{entry.verifier || 'Pending Verification'}</p>
              <p className="text-[10px] text-slate-400">{entry.lastVerifiedDate || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400">Freshness Score</span>
              <p className={`font-bold font-mono text-sm mt-0.5 ${badge.textClass}`}>
                {freshness.score}% Fresh
              </p>
              <p className="text-[10px] text-slate-400">{freshness.daysSinceVerification}d ago (Limit: {freshness.maxFreshDays}d)</p>
            </div>
            <div>
              <span className="text-slate-400">Feedback Metrics</span>
              <p className="font-semibold text-slate-200 mt-0.5">👍 {entry.helpfulCount} | 👎 {entry.notHelpfulCount}</p>
              <p className="text-[10px] text-slate-400">{entry.viewsCount} total views</p>
            </div>
          </div>

          {/* Operational Situation */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Applicable Operational Context</h4>
            <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs text-slate-300 leading-relaxed">
              {entry.situation}
            </div>
          </div>

          {/* Key Execution Steps */}
          {entry.keySteps && entry.keySteps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Standard Operating Steps</h4>
              <div className="space-y-2">
                {entry.keySteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-200">
                    <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-300 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Technical Content */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Technical Details</h4>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {entry.content}
            </div>
          </div>

          {/* Linked Equipment */}
          {linkedEqs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Linked Plant Equipment</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {linkedEqs.map(eq => (
                  <button
                    key={eq.id}
                    onClick={() => { closeModal(); openEquipment(eq.id); }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-2 transition-colors"
                  >
                    <span className="font-mono text-teal-400 font-bold">{eq.code}</span>
                    <span className="text-slate-400">— {eq.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-800">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {entry.tags.map((tag, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print SOP</span>
          </button>

          {/* Supervisor / SME Re-Verify or Approve Actions */}
          {(role === 'sme' || role === 'supervisor') && (
            <div className="flex items-center gap-2">
              {isPending ? (
                <>
                  <button
                    onClick={() => { verifyKnowledgeEntry(entry.id, 'reject'); closeModal(); }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { verifyKnowledgeEntry(entry.id, 'approve'); closeModal(); }}
                    className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-teal-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Verify Entry</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { reverifyKnowledgeEntry(entry.id); closeModal(); }}
                  className="px-4 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold border border-teal-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Verify Freshness (Reset to 100%)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
