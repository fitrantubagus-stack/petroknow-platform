import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, ShieldCheck, CheckCircle2, XCircle, 
  Clock, User, Tag, ArrowUpRight, AlertTriangle, 
  HelpCircle, Sparkles, Filter, Lock 
} from 'lucide-react';

export const VerificationQueueView: React.FC = () => {
  const { 
    knowledgeEntries, verifyKnowledgeEntry, openKnowledge, 
    role, setActiveModal 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'tacit' | 'sop'>('all');

  const pendingEntries = knowledgeEntries.filter(k => k.status === 'pending');

  const filteredEntries = pendingEntries.filter(entry => {
    if (activeFilter === 'tacit') return entry.isTacit;
    if (activeFilter === 'sop') return !entry.isTacit;
    return true;
  });

  const isAuthorized = role === 'sme' || role === 'supervisor';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              SME & Supervisor Verification Queue
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
              {pendingEntries.length} PENDING REVIEW
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validate field tacit submissions and scanned operating drafts before they enter the AI-retrievable plant knowledge register.
          </p>
        </div>

        {/* Role Guard Notification if in Operator role */}
        {!isAuthorized && (
          <button
            onClick={() => setActiveModal('login_role')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Switch to SME / Supervisor to Approve</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Pending ({pendingEntries.length})
        </button>
        <button
          onClick={() => setActiveFilter('tacit')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'tacit' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tacit Field Heuristics ({pendingEntries.filter(e => e.isTacit).length})
        </button>
        <button
          onClick={() => setActiveFilter('sop')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'sop' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Scanned SOP Drafts ({pendingEntries.filter(e => !e.isTacit).length})
        </button>
      </div>

      {/* Queue List */}
      {filteredEntries.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">Verification Queue is Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All submitted tacit procedures and OCR documents have been reviewed and verified. New submissions from operators will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition-all"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                    {entry.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Awaiting Expert Review
                  </span>
                  {entry.isTacit && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Tacit Operator Submission
                    </span>
                  )}
                  <span className="text-xs text-slate-400">Category: {entry.category}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Submitted by <strong>{entry.author}</strong> ({entry.authorRole})</span>
                </div>
              </div>

              {/* Title & Situation */}
              <div className="space-y-1.5">
                <h3 
                  onClick={() => openKnowledge(entry.id)}
                  className="text-base font-bold text-slate-100 hover:text-teal-300 cursor-pointer transition-colors"
                >
                  {entry.title}
                </h3>
                <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                  <strong className="text-slate-400">Operational Context:</strong> {entry.situation}
                </p>
              </div>

              {/* Key Steps if available */}
              {entry.keySteps && entry.keySteps.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proposed Operating Steps:</span>
                  <div className="space-y-1.5">
                    {entry.keySteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                        <span className="w-4 h-4 rounded bg-teal-500/20 text-teal-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Content */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  {entry.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => verifyKnowledgeEntry(entry.id, 'reject')}
                    disabled={!isAuthorized}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Submission</span>
                  </button>

                  <button
                    onClick={() => verifyKnowledgeEntry(entry.id, 'approve')}
                    disabled={!isAuthorized}
                    className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Verify Entry</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
