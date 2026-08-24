import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness, getFreshnessBadge } from '../../utils/freshness';
import { 
  BookOpen, CheckCircle2, Clock, HelpCircle, Activity, 
  Sparkles, QrCode, ArrowUpRight, Barcode, Flame, 
  MapPin, ShieldAlert, ArrowRight, Check, AlertTriangle, 
  PlusCircle, RefreshCw, UserMinus 
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    stats, knowledgeEntries, equipmentList, activityFeed, 
    topQueries, setCurrentView, openEquipment, openKnowledge, 
    openSparePart, reverifyKnowledgeEntry, role, setActiveModal,
    campaigns, computeCampaignProgress 
  } = useApp();

  // Find overdue / stale entries for Freshness Widget
  const agingEntries = knowledgeEntries
    .filter(k => k.status === 'verified')
    .map(k => ({ entry: k, freshness: calculateFreshness(k) }))
    .filter(item => item.freshness.state === 'stale' || item.freshness.state === 'aging')
    .sort((a, b) => a.freshness.score - b.freshness.score)
    .slice(0, 4);

  // Digital twin quick summary
  const totalNodes = equipmentList.length;
  const nodesWithGaps = equipmentList.filter(eq => eq.status === 'warning').length;
  const healthyNodes = totalNodes - nodesWithGaps;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in text-slate-100">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Plant Knowledge Mission Control
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization across standard operating procedures, veteran tacit logs, and physical floor equipment.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentView('assistant')}
            className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Assistant</span>
          </button>
          <button
            onClick={() => setCurrentView('scancenter')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scan Floor Tag</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Computed Live from State) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Entries */}
        <div 
          onClick={() => setCurrentView('library')}
          className="cursor-pointer p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Total Knowledge</span>
            <BookOpen className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">{stats.totalEntries}</p>
          <p className="text-[10px] text-teal-400 font-semibold">{stats.verifiedCount} verified active</p>
        </div>

        {/* Verification Rate */}
        <div 
          onClick={() => setCurrentView('verification')}
          className="cursor-pointer p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Verification Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{stats.verificationRate}%</p>
          <p className="text-[10px] text-amber-400 font-semibold">{stats.pendingCount} pending queue</p>
        </div>

        {/* Freshness Health */}
        <div 
          onClick={() => setCurrentView('freshness')}
          className="cursor-pointer p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Decay & Freshness</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-400">{stats.freshCount}</p>
          <p className="text-[10px] text-rose-400 font-semibold">{stats.staleCount} stale overdue</p>
        </div>

        {/* Questions Answered */}
        <div 
          onClick={() => setCurrentView('assistant')}
          className="cursor-pointer p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Queries Answered</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">{stats.questionsAnsweredToday}</p>
          <p className="text-[10px] text-indigo-400 font-semibold">98.4% resolution</p>
        </div>

        {/* Knowledge Gaps & Alerts */}
        <div 
          onClick={() => setCurrentView('analytics')}
          className="cursor-pointer p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-1 col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Active Gaps</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">{stats.knowledgeGapsCount}</p>
          <p className="text-[10px] text-slate-400">{stats.lowStockPartsCount} low part alerts</p>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Freshness Widget + Top Queries + Digital Twin Health */}
        <div className="lg:col-span-8 space-y-6">
          {/* Signature Feature: Knowledge Freshness & Decay Widget */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Knowledge Freshness & Decay Alerts</h3>
                  <p className="text-[11px] text-slate-400">Procedures requiring review based on aging safety thresholds</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('freshness')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View Full Decay Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {agingEntries.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/50 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>All active knowledge records are currently 100% fresh and within safety thresholds.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {agingEntries.map(({ entry, freshness }) => {
                  const badge = getFreshnessBadge(freshness.state);
                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{entry.id}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Last: {entry.lastVerifiedDate || entry.submitDate}</span>
                        </div>
                        <h4 
                          onClick={() => openKnowledge(entry.id)}
                          className="text-xs font-bold text-slate-200 hover:text-teal-300 cursor-pointer line-clamp-1"
                        >
                          {entry.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-mono text-xs font-bold ${badge.textClass}`}>
                          {freshness.score}% Fresh ({freshness.daysSinceVerification}d)
                        </span>

                        {(role === 'sme' || role === 'supervisor') && (
                          <button
                            onClick={() => reverifyKnowledgeEntry(entry.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-bold border border-teal-500/40 flex items-center gap-1 transition-colors"
                            title="Re-verify to reset freshness score to 100%"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Re-Verify</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plant Health & Digital Twin Summary Widget */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Plant Floor Digital Twin Health</h3>
                  <p className="text-[11px] text-slate-400">Equipment node status tied to verified documentation</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('map')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Open 2D Plant Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {equipmentList.slice(0, 3).map(eq => {
                const isWarning = eq.status === 'warning';
                return (
                  <div
                    key={eq.id}
                    onClick={() => openEquipment(eq.id)}
                    className="cursor-pointer p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-teal-400">{eq.code}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${isWarning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                    </div>
                    <p className="text-xs font-bold text-slate-200 line-clamp-1">{eq.name}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                      <span>{eq.temp}</span>
                      <span>{eq.pressure}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frequently Asked In-Session Queries Chart */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Top Searched Operational Topics</h3>
                  <p className="text-[11px] text-slate-400">Computed live from operator AI assistant queries</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {topQueries.slice(0, 4).map((item, idx) => {
                const maxCount = Math.max(...topQueries.map(q => q.count), 1);
                const percent = Math.round((item.count / maxCount) * 100);

                return (
                  <div 
                    key={idx}
                    onClick={() => { setCurrentView('assistant'); }}
                    className="cursor-pointer p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 capitalize truncate max-w-xs">{item.query}</span>
                      <span className="font-mono text-teal-400 font-bold">{item.count} asks</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Activity Feed + Low Stock Reorder Widget */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Activity Audit Feed */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-slate-100">Real-Time Activity Audit</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {activityFeed.map((act) => (
                <div 
                  key={act.id} 
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-teal-400">{act.user}</span>
                    <span>{act.timestamp}</span>
                  </div>
                  <p className="font-bold text-slate-200">{act.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{act.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Retirement Knowledge Handover Widget */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Retirement Knowledge Handover</h3>
              </div>
              <button
                onClick={() => setCurrentView('campaigns')}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-0.5"
              >
                <span>Campaigns</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {campaigns.slice(0, 2).map((camp) => {
                const prog = computeCampaignProgress(camp);
                const isUrgent = prog.isUrgent;

                return (
                  <div
                    key={camp.id}
                    onClick={() => setCurrentView('campaigns')}
                    className={`cursor-pointer p-3 rounded-xl border transition-colors space-y-1.5 ${
                      isUrgent
                        ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-200 truncate">{camp.veteranName}</p>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isUrgent ? 'bg-rose-500/20 text-rose-300' : 'bg-teal-500/20 text-teal-300'
                      }`}>
                        {prog.daysRemaining}d to departure
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{camp.role}</span>
                      <span className="font-mono font-semibold text-slate-300">{prog.percent}% Captured</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUrgent ? 'bg-gradient-to-r from-rose-500 to-amber-400' : 'bg-gradient-to-r from-teal-500 to-cyan-400'
                        }`}
                        style={{ width: `${prog.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Stock Reorder Alerts Widget */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Critical Spare Part Alerts</h3>
              </div>
              {stats.lowStockPartsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {stats.lowStockPartsCount} low
                </span>
              )}
            </div>

            <div className="space-y-2">
              {stats.lowStockPartsCount === 0 ? (
                <p className="text-xs text-slate-400">All wear items are adequately stocked.</p>
              ) : (
                <div 
                  onClick={() => setCurrentView('scancenter')}
                  className="cursor-pointer p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors space-y-1"
                >
                  <p className="text-xs font-bold text-rose-300">PRT-MEC-3112 (Mechanical Seal 85mm)</p>
                  <p className="text-[11px] text-slate-300">Current stock: 1 unit (Min threshold: 3 sets)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
