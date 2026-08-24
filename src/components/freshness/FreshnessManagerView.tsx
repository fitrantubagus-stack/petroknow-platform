import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness, getFreshnessBadge } from '../../utils/freshness';
import { 
  Clock, RefreshCw, ShieldCheck, AlertTriangle, 
  CheckCircle2, ArrowUpRight, Filter, Info, Lock 
} from 'lucide-react';

export const FreshnessManagerView: React.FC = () => {
  const { knowledgeEntries, reverifyKnowledgeEntry, openKnowledge, role, setActiveModal } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'stale' | 'aging' | 'fresh'>('all');

  const evaluatedEntries = knowledgeEntries
    .filter(k => k.status === 'verified')
    .map(entry => ({
      entry,
      freshness: calculateFreshness(entry)
    }))
    .sort((a, b) => a.freshness.score - b.freshness.score);

  const filtered = evaluatedEntries.filter(({ freshness }) => {
    if (activeFilter === 'stale') return freshness.state === 'stale';
    if (activeFilter === 'aging') return freshness.state === 'aging';
    if (activeFilter === 'fresh') return freshness.state === 'fresh';
    return true;
  });

  const staleCount = evaluatedEntries.filter(e => e.freshness.state === 'stale').length;
  const agingCount = evaluatedEntries.filter(e => e.freshness.state === 'aging').length;
  const freshCount = evaluatedEntries.filter(e => e.freshness.state === 'fresh').length;

  const isAuthorized = role === 'sme' || role === 'supervisor';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Knowledge Freshness & Decay Score Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              DECAY TRACKING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated mathematical decay scoring prevents outdated procedures from being used during critical plant turnarounds.
          </p>
        </div>

        {!isAuthorized && (
          <button
            onClick={() => setActiveModal('login_role')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Switch to SME to Re-Verify</span>
          </button>
        )}
      </div>

      {/* Freshness Health Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveFilter('fresh')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeFilter === 'fresh' ? 'bg-emerald-950/40 border-emerald-500' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Fresh & Valid (&lt; 90 Days)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">{freshCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Optimal operational safety</p>
        </div>

        <div 
          onClick={() => setActiveFilter('aging')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeFilter === 'aging' ? 'bg-amber-950/40 border-amber-500' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Aging Review Queue (90-180 Days)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-amber-400 mt-1">{agingCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Scheduled for upcoming review</p>
        </div>

        <div 
          onClick={() => setActiveFilter('stale')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            activeFilter === 'stale' ? 'bg-rose-950/40 border-rose-500' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Stale & Overdue (&gt; 180 Days)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-mono font-bold text-rose-400 mt-1">{staleCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">High priority safety re-audit</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'all' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Active Procedures ({evaluatedEntries.length})
        </button>
        <button
          onClick={() => setActiveFilter('stale')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'stale' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stale ({staleCount})
        </button>
        <button
          onClick={() => setActiveFilter('aging')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'aging' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Aging ({agingCount})
        </button>
        <button
          onClick={() => setActiveFilter('fresh')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'fresh' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Fresh ({freshCount})
        </button>
      </div>

      {/* Procedures Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Code / Title</th>
                <th className="px-4 py-3.5">Author & Verifier</th>
                <th className="px-4 py-3.5">Last Verified</th>
                <th className="px-4 py-3.5">Freshness Score</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(({ entry, freshness }) => {
                const badge = getFreshnessBadge(freshness.state);

                return (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="space-y-0.5 max-w-sm">
                        <span className="font-mono text-[10px] text-teal-400 font-bold">{entry.id}</span>
                        <p 
                          onClick={() => openKnowledge(entry.id)}
                          className="font-bold text-slate-100 hover:text-teal-300 cursor-pointer line-clamp-1"
                        >
                          {entry.title}
                        </p>
                        <p className="text-[10px] text-slate-400">{entry.category}</p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-[11px] text-slate-300">
                      <p className="font-semibold">{entry.author}</p>
                      <p className="text-[10px] text-slate-500">Verified by: {entry.verifier || 'Initial Seed'}</p>
                    </td>

                    <td className="px-4 py-4 text-[11px] font-mono text-slate-300">
                      {entry.lastVerifiedDate || 'N/A'}
                      <p className="text-[10px] text-slate-500 font-sans">{freshness.daysSinceVerification} days ago</p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1 w-28">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                          <span className={badge.textClass}>{freshness.score}%</span>
                          <span className="text-slate-500 text-[10px]">/ 100%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              freshness.state === 'fresh' ? 'bg-emerald-400' :
                              freshness.state === 'aging' ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${freshness.score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isAuthorized ? (
                        <button
                          onClick={() => reverifyKnowledgeEntry(entry.id)}
                          className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          title="Re-verify procedure to reset freshness to 100%"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-Verify (100%)</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">SME Login Required</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
