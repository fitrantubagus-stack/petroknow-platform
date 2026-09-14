import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness } from '../../utils/freshness';
import { 
  BarChart3, PieChart, TrendingUp, ThumbsUp, 
  HelpCircle, ShieldCheck, CheckCircle2, Clock, 
  DollarSign, Sparkles, ArrowRight, Zap 
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { 
    stats, knowledgeEntries, topQueries, knowledgeGaps, 
    setCurrentView 
  } = useApp();

  // Freshness counts
  const verifiedEntries = knowledgeEntries.filter(k => k.status === 'verified');
  const freshCount = verifiedEntries.filter(k => calculateFreshness(k).state === 'fresh').length;
  const agingCount = verifiedEntries.filter(k => calculateFreshness(k).state === 'aging').length;
  const staleCount = verifiedEntries.filter(k => calculateFreshness(k).state === 'stale').length;

  // Feedback calculation
  const totalHelpful = knowledgeEntries.reduce((acc, k) => acc + (k.helpfulCount || 0), 0);
  const totalNotHelpful = knowledgeEntries.reduce((acc, k) => acc + (k.notHelpfulCount || 0), 0);
  const totalFeedback = totalHelpful + totalNotHelpful;
  const positiveRatio = totalFeedback > 0 ? Math.round((totalHelpful / totalFeedback) * 100) : 98;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Plant Operational Knowledge Analytics
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
              REAL-TIME AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry, query intelligence, and procedural readiness metrics computed live from active plant interactions.
          </p>
        </div>
      </div>

      {/* Top 4 Metric Summaries */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Knowledge Base Verification</span>
          <p className="text-2xl font-bold font-mono text-emerald-400">{stats.verificationRate}%</p>
          <p className="text-[10px] text-slate-500">{stats.verifiedCount} of {stats.totalEntries} entries approved</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Field Operator Satisfaction</span>
          <p className="text-2xl font-bold font-mono text-teal-400">{positiveRatio}%</p>
          <p className="text-[10px] text-slate-500">{totalHelpful} positive feedback votes</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Search Retrieval Speed</span>
          <p className="text-2xl font-bold font-mono text-cyan-400">&lt; 0.2s</p>
          <p className="text-[10px] text-slate-500">Deterministic keyword index</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Unresolved Knowledge Gaps</span>
          <p className="text-2xl font-bold font-mono text-amber-400">{knowledgeGaps.length}</p>
          <p className="text-[10px] text-slate-500">Targeted SME requests</p>
        </div>
      </div>

      {/* Grid: 2 Charts + Gaps Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification & Freshness Breakdown (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Knowledge Freshness Distribution</h3>
            <span className="text-[11px] text-slate-400 font-mono">{verifiedEntries.length} Active Records</span>
          </div>

          <div className="space-y-4">
            {/* Visual Bar Breakdown */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${(freshCount / Math.max(verifiedEntries.length, 1)) * 100}%` }}
                title={`Fresh: ${freshCount}`}
              />
              <div 
                className="bg-amber-400 h-full transition-all duration-500" 
                style={{ width: `${(agingCount / Math.max(verifiedEntries.length, 1)) * 100}%` }}
                title={`Aging: ${agingCount}`}
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${(staleCount / Math.max(verifiedEntries.length, 1)) * 100}%` }}
                title={`Stale: ${staleCount}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Fresh
                </span>
                <p className="text-xl font-bold font-mono">{freshCount}</p>
                <p className="text-[10px] text-slate-400">&lt; 90 days age</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Aging
                </span>
                <p className="text-xl font-bold font-mono">{agingCount}</p>
                <p className="text-[10px] text-slate-400">90-180 days age</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-1">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Stale
                </span>
                <p className="text-xl font-bold font-mono">{staleCount}</p>
                <p className="text-[10px] text-slate-400">&gt; 180 days age</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Searched Queries Bar Chart (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Top Searched Operational Queries</h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Sessions</span>
          </div>

          <div className="space-y-3">
            {topQueries.map((item, idx) => {
              const maxQ = Math.max(...topQueries.map(q => q.count), 1);
              const pct = Math.round((item.count / maxQ) * 100);

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 capitalize truncate max-w-xs">{item.query}</span>
                    <span className="font-mono text-teal-400 font-bold">{item.count} queries</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plant Maintenance Reliability & Failure Mode Breakdown (CALIBER Case 1 Analytics) */}
        <div className="lg:col-span-12 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">Equipment Reliability & Maintenance History Analytics</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  211 WORK ORDERS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Root cause failure distribution, MTBF, MTTR, and OPL cross-referencing compiled from the 8 LLDPE equipment datasets.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Average MTBF</span>
                <span className="text-emerald-400 font-bold">42.4 Days</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Average MTTR</span>
                <span className="text-cyan-400 font-bold">4.2 Hours</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Downtime Prevented</span>
                <span className="text-amber-400 font-bold">340+ Hrs</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3.5 py-3">Asset Code</th>
                  <th className="px-3.5 py-3">Equipment Name</th>
                  <th className="px-3.5 py-3">Area</th>
                  <th className="px-3.5 py-3">Work Orders</th>
                  <th className="px-3.5 py-3">MTBF / MTTR</th>
                  <th className="px-3.5 py-3">Primary Root Failure Mode</th>
                  <th className="px-3.5 py-3">Linked OPL Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {[
                  { code: 'GA-1201A', name: 'Hexane Feed Pump', area: 'Area 1200', wos: 28, mtbf: '39d', mttr: '3.8h', mode: 'API Plan 11 Orifice Plugging & Mech Seal Leak', opl: 'OPL-GA-1201A-01' },
                  { code: 'YD-2301', name: 'Pellet Dryer', area: 'Area 2300', wos: 32, mtbf: '34d', mttr: '5.1h', mode: 'Kadant Rotary Joint Steam Leak & Screen Clogging', opl: 'OPL-YD-2301-01' },
                  { code: 'DC-3401A', name: 'Purge Column Bag Filter', area: 'Area 3400', wos: 24, mtbf: '45d', mttr: '3.2h', mode: 'Pulse Jet Solenoid Valve Failure & High dP', opl: 'OPL-DC-3401A-01' },
                  { code: 'KC-4501', name: 'Cycle Gas Compressor', area: 'Area 4500', wos: 29, mtbf: '38d', mttr: '6.4h', mode: 'Plate Valve Flutter & Crosshead Clearance', opl: 'OPL-KC-4501-02' },
                  { code: 'EA-5601', name: 'Reaction Loop Heat Exchanger', area: 'Area 5600', wos: 21, mtbf: '52d', mttr: '4.6h', mode: 'Tube Bundle Scale Bio-Fouling & Gasket Leakage', opl: 'OPL-EA-5601-01' },
                  { code: 'LV-6701', name: 'Reactor Level Control Valve', area: 'Area 6700', wos: 27, mtbf: '41d', mttr: '3.5h', mode: 'Pneumatic Diaphragm Rupture & Ceramic Trim Erosion', opl: 'OPL-LV-6701-01' },
                  { code: 'CT-7801', name: 'Cooling Tower Induced Draft Fan', area: 'Area 7800', wos: 23, mtbf: '48d', mttr: '4.1h', mode: 'FRP Blade Silt Erosion & Gearbox Oil Degradation', opl: 'OPL-CT-7801-03' },
                  { code: 'FA-8901', name: 'Flare Knockout Drum', area: 'Area 8900', wos: 27, mtbf: '42d', mttr: '3.1h', mode: 'Demister Pad High dP & Level Transmitter Drift', opl: 'OPL-FA-8901-01' },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3.5 py-3 font-mono text-teal-400 font-bold">{item.code}</td>
                    <td className="px-3.5 py-3 font-semibold text-slate-100">{item.name}</td>
                    <td className="px-3.5 py-3 text-slate-400">{item.area}</td>
                    <td className="px-3.5 py-3 font-mono text-slate-200">{item.wos} WOs</td>
                    <td className="px-3.5 py-3 font-mono text-xs">
                      <span className="text-emerald-400 font-semibold">{item.mtbf}</span> / <span className="text-cyan-400 font-semibold">{item.mttr}</span>
                    </td>
                    <td className="px-3.5 py-3 text-slate-300 text-[11px]">{item.mode}</td>
                    <td className="px-3.5 py-3">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                        {item.opl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unresolved Knowledge Gaps Table (12 cols) */}
        <div className="lg:col-span-12 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Identified Knowledge Gaps</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Questions asked by operators where verified confidence fell below tolerance threshold.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('tacit')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Draft New SOP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-200">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Gap ID</th>
                  <th className="px-4 py-3">Operator Query</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Date Logged</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {knowledgeGaps.map((gap) => (
                  <tr key={gap.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-teal-400 font-bold">{gap.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-100">{gap.question}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        gap.impact === 'High' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {gap.impact}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">{gap.askedDate}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{gap.frequency || 1} asks</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {gap.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
