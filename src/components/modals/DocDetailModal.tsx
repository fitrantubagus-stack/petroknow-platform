import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, ArrowUpRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const DocDetailModal: React.FC = () => {
  const { activeModal, closeModal, selectedDocId, documents, openKnowledge } = useApp();

  const doc = documents.find(d => d.id === selectedDocId);

  if (activeModal !== 'doc_detail' || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs text-teal-400 font-bold">{doc.docNumber}</span>
              <h3 className="text-base font-bold text-slate-100">{doc.title}</h3>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div>
              <span className="text-slate-400">Source Format</span>
              <p className="font-semibold text-slate-200 mt-0.5">{doc.fileType} ({doc.fileSize})</p>
            </div>
            <div>
              <span className="text-slate-400">Ingestion Method</span>
              <p className="font-semibold text-slate-200 mt-0.5">{doc.source}</p>
            </div>
            <div>
              <span className="text-slate-400">Status</span>
              <p className="font-semibold text-teal-400 mt-0.5">{doc.status}</p>
            </div>
            <div>
              <span className="text-slate-400">Uploaded On</span>
              <p className="font-semibold text-slate-200 mt-0.5">{doc.uploadDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Extracted OCR / Document Content</h4>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {doc.extractedSnippet || 'Full document content structured and indexed in active knowledge base.'}
            </div>
          </div>

          {doc.linkedKnowledgeId && (
            <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-800/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-teal-400">Structured Knowledge Entry</span>
                <p className="text-xs text-slate-300 mt-0.5">Linked to live retrievable knowledge ID: {doc.linkedKnowledgeId}</p>
              </div>
              <button
                onClick={() => { closeModal(); openKnowledge(doc.linkedKnowledgeId!); }}
                className="px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>View Knowledge Record</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
