import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RetirementCampaign, CriticalTopic, KnowledgeEntry } from '../../types';
import { 
  UserCheck, AlertTriangle, Clock, CheckCircle2, 
  Plus, Search, ArrowRight, ShieldAlert, Sparkles, 
  BookOpen, ChevronRight, X, UserMinus, Calendar, 
  Building2, Lightbulb, Filter, ExternalLink, Flame 
} from 'lucide-react';

export const RetirementCampaignView: React.FC = () => {
  const { 
    campaigns, addCampaign, updateCampaign, computeCampaignProgress, 
    equipmentList, setCurrentView, openKnowledge, setTacitPrefill, 
    role, setActiveModal 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'urgent' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Campaign Form State
  const [formSmeName, setFormSmeName] = useState('');
  const [formSmeEmail, setFormSmeEmail] = useState('');
  const [formSmeRoleTitle, setFormSmeRoleTitle] = useState('');
  const [formDepartment, setFormDepartment] = useState('Reliability & Asset Integrity');
  const [formDepartureDate, setFormDepartureDate] = useState('2026-09-30');
  const [formNotes, setFormNotes] = useState('');
  const [formTopics, setFormTopics] = useState<Omit<CriticalTopic, 'topicId'>[]>([
    {
      topicTitle: '',
      category: 'Tacit Experience',
      equipmentId: 'EQ-CMP-204',
      importance: 'Critical',
      notes: ''
    }
  ]);

  const handleAddTopicRow = () => {
    setFormTopics(prev => [
      ...prev,
      {
        topicTitle: '',
        category: 'Tacit Experience',
        equipmentId: equipmentList[0]?.id || 'EQ-REC-101',
        importance: 'Critical',
        notes: ''
      }
    ]);
  };

  const handleRemoveTopicRow = (index: number) => {
    if (formTopics.length > 1) {
      setFormTopics(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSmeName.trim() || !formDepartureDate) return;

    const validTopics = formTopics
      .filter(t => t.topicTitle.trim())
      .map((t, idx) => ({
        ...t,
        topicId: `TOPIC-${Date.now()}-${idx + 1}`
      }));

    if (validTopics.length === 0) {
      validTopics.push({
        topicId: `TOPIC-${Date.now()}-1`,
        topicTitle: 'Core Unit Operational Heuristics',
        category: 'Tacit Experience',
        equipmentId: equipmentList[0]?.id,
        importance: 'Critical',
        notes: 'General process stabilization know-how'
      });
    }

    addCampaign({
      smeName: formSmeName.trim(),
      smeEmail: formSmeEmail.trim() || `${formSmeName.toLowerCase().replace(/\s+/g, '.')}@petroknow.internal`,
      smeRoleTitle: formSmeRoleTitle.trim() || 'Principal Subject Matter Expert',
      department: formDepartment,
      targetDepartureDate: formDepartureDate,
      notes: formNotes.trim(),
      criticalTopics: validTopics,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    // Reset Form
    setFormSmeName('');
    setFormSmeEmail('');
    setFormSmeRoleTitle('');
    setFormNotes('');
    setFormTopics([
      {
        topicTitle: '',
        category: 'Tacit Experience',
        equipmentId: 'EQ-CMP-204',
        importance: 'Critical',
        notes: ''
      }
    ]);
    setShowNewModal(false);
  };

  const handleCaptureTopicClick = (campaign: RetirementCampaign, topic: CriticalTopic) => {
    setTacitPrefill({
      title: topic.topicTitle,
      category: topic.category,
      linkedEquipmentIds: topic.equipmentId ? [topic.equipmentId] : [],
      campaignId: campaign.id,
      topicId: topic.topicId,
      situation: `Targeted tacit knowledge capture for retirement handover of ${campaign.smeName} (${campaign.smeRoleTitle}). Focus area: ${topic.notes || topic.topicTitle}`
    });
    setCurrentView('tacit');
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const progress = computeCampaignProgress(campaign);
    
    // Tab filter
    if (activeTab === 'active' && campaign.status !== 'Active') return false;
    if (activeTab === 'urgent' && !progress.isUrgent) return false;
    if (activeTab === 'completed' && campaign.status !== 'Completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSme = campaign.smeName.toLowerCase().includes(q);
      const matchDept = campaign.department.toLowerCase().includes(q);
      const matchTopic = campaign.criticalTopics.some(t => t.topicTitle.toLowerCase().includes(q));
      if (!matchSme && !matchDept && !matchTopic) return false;
    }

    return true;
  });

  // Global Campaign Metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const urgentCount = campaigns.filter(c => computeCampaignProgress(c).isUrgent).length;
  
  const totalTrackedTopics = campaigns.reduce((acc, c) => acc + c.criticalTopics.length, 0);
  const totalCapturedTopics = campaigns.reduce((acc, c) => acc + computeCampaignProgress(c).capturedTopics, 0);
  const globalCompletionRate = totalTrackedTopics > 0 ? Math.round((totalCapturedTopics / totalTrackedTopics) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Retirement Knowledge Capture Campaigns
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
              HANDOVER ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Systematic tacit knowledge elicitation for senior subject matter experts and veteran field operators prior to retirement.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Capture Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Campaigns */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Campaigns</span>
            <UserMinus className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-100">{activeCampaigns.length}</p>
          <p className="text-[11px] text-teal-400 font-semibold">{totalCampaigns} total departing SMEs registered</p>
        </div>

        {/* Global Critical Topics */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Critical Topics Tracked</span>
            <Lightbulb className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-cyan-400">{totalTrackedTopics}</p>
          <p className="text-[11px] text-slate-400">{totalCapturedTopics} captured into verified SOPs/logs</p>
        </div>

        {/* Overall Completion Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Capture Progress Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{globalCompletionRate}%</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${globalCompletionRate}%` }} />
          </div>
        </div>

        {/* Urgent Warnings */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Urgent Departures (&lt;14d)</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-400">{urgentCount}</p>
          <p className="text-[11px] text-rose-300 font-semibold">
            {urgentCount > 0 ? 'Action required before departure date' : 'All campaigns on track'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'all' 
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            All Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('urgent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'urgent' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Urgent (&lt; 14 Days)</span>
            {urgentCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-mono font-bold">
                {urgentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'active' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            Active ({activeCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'completed' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            Completed / Transferred
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SME name, topic, equipment..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
            <Lightbulb className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No retirement capture campaigns match your filters.</p>
            <button
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
              className="text-xs text-teal-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredCampaigns.map(campaign => {
            const progress = computeCampaignProgress(campaign);

            return (
              <div 
                key={campaign.id} 
                className={`p-5 sm:p-6 rounded-2xl bg-slate-900 border transition-all ${
                  progress.isUrgent 
                    ? 'border-rose-500/50 shadow-lg shadow-rose-500/5 ring-1 ring-rose-500/30' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Urgent Banner if applicable */}
                {progress.isUrgent && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-200 animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="font-semibold">
                        High Urgency: Departure scheduled in {progress.daysRemaining} days with only {progress.progressPercent}% of critical knowledge captured!
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const firstUncaptured = progress.topicStatuses.find(t => !t.isCaptured);
                        if (firstUncaptured) handleCaptureTopicClick(campaign, firstUncaptured.topic);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[11px] whitespace-nowrap"
                    >
                      Prioritize Now →
                    </button>
                  </div>
                )}

                {/* SME Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={campaign.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                      alt={campaign.smeName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-100">{campaign.smeName}</h3>
                        <span className="font-mono text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                          {campaign.id}
                        </span>
                        {campaign.status === 'Completed' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Knowledge Fully Preserved
                          </span>
                        ) : progress.isUrgent ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-400" />
                            {progress.daysRemaining} Days Left
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {progress.daysRemaining} Days Remaining
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">{campaign.smeRoleTitle}</p>
                      <p className="text-[11px] text-slate-400">{campaign.department} • Handover Target: {campaign.targetDepartureDate}</p>
                    </div>
                  </div>

                  {/* Progress Ring / Percentage */}
                  <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Captured Wisdom</span>
                      <p className="font-mono text-lg font-bold text-emerald-400">
                        {progress.capturedTopics} / {progress.totalTopics} <span className="text-xs text-slate-400 font-normal">Topics ({progress.progressPercent}%)</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center relative font-mono text-xs font-bold text-slate-100">
                      <span>{progress.progressPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Campaign Notes */}
                {campaign.notes && (
                  <p className="text-xs text-slate-300 italic py-2.5 text-slate-400">
                    "{campaign.notes}"
                  </p>
                )}

                {/* Critical Topics Checklist */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                    <span>Critical Tacit Topics to Preserve ({campaign.criticalTopics.length})</span>
                    <span className="text-[11px] font-mono">Status & Traceability</span>
                  </div>

                  <div className="space-y-2">
                    {progress.topicStatuses.map(({ topic, isCaptured, matchingEntry }) => (
                      <div 
                        key={topic.topicId}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isCaptured 
                            ? 'bg-emerald-500/5 border-emerald-500/30' 
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`w-2 h-2 rounded-full ${isCaptured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            <span className="text-xs font-bold text-slate-100">{topic.topicTitle}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              topic.importance === 'Critical' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                              topic.importance === 'High' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                              'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {topic.importance}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">({topic.category})</span>
                            {topic.equipmentId && (
                              <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-700">
                                {topic.equipmentId}
                              </span>
                            )}
                          </div>
                          {topic.notes && (
                            <p className="text-[11px] text-slate-400 pl-4">
                              Focus: {topic.notes}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isCaptured && matchingEntry ? (
                            <button
                              onClick={() => openKnowledge(matchingEntry.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified Asset ({matchingEntry.id})</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCaptureTopicClick(campaign, topic)}
                              className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-teal-400" />
                              <span>Capture Know-How</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create New Campaign Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scale-up shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-slate-100">Launch Retirement Knowledge Campaign</h3>
              </div>
              <button 
                onClick={() => setShowNewModal(false)} 
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Departing SME / Veteran Name *</label>
                  <input
                    type="text"
                    required
                    value={formSmeName}
                    onChange={(e) => setFormSmeName(e.target.value)}
                    placeholder="e.g. Dr. Irwan Santoso"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Official Job Title / Expertise *</label>
                  <input
                    type="text"
                    required
                    value={formSmeRoleTitle}
                    onChange={(e) => setFormSmeRoleTitle(e.target.value)}
                    placeholder="e.g. Principal Rotating Equipment SME"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Plant Department / Area</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Reliability & Asset Integrity"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Target Retirement / Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={formDepartureDate}
                    onChange={(e) => setFormDepartureDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Handover Strategy / Focus Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Key areas where operational heuristics and tacit tricks are most critical..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Dynamic Critical Topics Builder */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-200 font-bold uppercase tracking-wider">Critical Topics to Capture</label>
                  <button
                    type="button"
                    onClick={handleAddTopicRow}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {formTopics.map((topic, index) => (
                    <div key={index} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">Topic #{index + 1}</span>
                        {formTopics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTopicRow(index)}
                            className="text-slate-500 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        value={topic.topicTitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormTopics(prev => prev.map((t, i) => i === index ? { ...t, topicTitle: val } : t));
                        }}
                        placeholder="e.g. Reciprocating Compressor Flutter Acoustic Signature"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={topic.importance}
                          onChange={(e) => {
                            const val = e.target.value as 'Critical' | 'High' | 'Medium';
                            setFormTopics(prev => prev.map((t, i) => i === index ? { ...t, importance: val } : t));
                          }}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                        >
                          <option value="Critical">Critical</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                        </select>

                        <select
                          value={topic.category}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setFormTopics(prev => prev.map((t, i) => i === index ? { ...t, category: val } : t));
                          }}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                        >
                          <option value="Tacit Experience">Tacit Experience</option>
                          <option value="Troubleshooting">Troubleshooting</option>
                          <option value="Emergency Procedure">Emergency Procedure</option>
                          <option value="Safety Protocol">Safety Protocol</option>
                          <option value="Maintenance Guide">Maintenance Guide</option>
                        </select>

                        <select
                          value={topic.equipmentId || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormTopics(prev => prev.map((t, i) => i === index ? { ...t, equipmentId: val } : t));
                          }}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200"
                        >
                          <option value="">No Equipment</option>
                          {equipmentList.map(eq => (
                            <option key={eq.id} value={eq.id}>{eq.code} ({eq.category})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-teal-500/20"
                >
                  Create & Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
