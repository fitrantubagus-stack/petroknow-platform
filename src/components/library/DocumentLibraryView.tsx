import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateFreshness, getFreshnessBadge } from '../../utils/freshness';
import { 
  BookOpen, Search, Filter, ShieldCheck, 
  Clock, ArrowUpRight, FileText, CheckCircle2, 
  AlertCircle, Tag, Plus 
} from 'lucide-react';

export const DocumentLibraryView: React.FC = () => {
  const { knowledgeEntries, documents, openKnowledge, openDoc, setCurrentView } = useApp();

  const [activeTab, setActiveTab] = useState<'entries' | 'documents'>('entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'SOP', 'Emergency', 'Maintenance', 'Process', 'Tacit', 'Troubleshooting'];

  // Filtered knowledge entries
  const filteredEntries = knowledgeEntries.filter(entry => {
    const matchesCat = selectedCategory === 'ALL' || entry.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered raw documents
  const filteredDocs = documents.filter(doc => {
    return !searchQuery.trim() || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
              Plant Document & Knowledge Register
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
              {knowledgeEntries.length} RECORDS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete searchable repository of standard operating procedures, emergency protocols, and veteran field heuristics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('scancenter')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload / Scan New Doc</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('entries')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'entries'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Structured Knowledge Entries ({knowledgeEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'documents'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Source Ingested Documents ({documents.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SOP code, tag, or author..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {activeTab === 'entries' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tab Content: Structured Knowledge Entries */}
      {activeTab === 'entries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => {
            const freshness = calculateFreshness(entry);
            const badge = getFreshnessBadge(freshness.state);

            return (
              <div
                key={entry.id}
                onClick={() => openKnowledge(entry.id)}
                className="cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded">
                      {entry.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-2">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {entry.situation}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Author: {entry.author}</span>
                    <span className="font-mono text-teal-400 font-bold">{freshness.score}% Fresh</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px]">Verified: {entry.lastVerifiedDate || 'Pending'}</span>
                    <span className="text-[10px]">👍 {entry.helpfulCount} | 👎 {entry.notHelpfulCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content: Raw Uploaded Documents */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => openDoc(doc.id)}
              className="cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono text-xs font-bold text-indigo-400">{doc.docNumber}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {doc.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  {doc.extractedSnippet || 'Ingested technical operating procedure document.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>{doc.fileType} • {doc.fileSize}</span>
                <span>{doc.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
