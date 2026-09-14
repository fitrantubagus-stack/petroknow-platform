import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, FileText, ArrowUpRight, CheckCircle2, AlertCircle, Clock, 
  Download, ExternalLink, ShieldCheck, Tag, Building2, Layers
} from 'lucide-react';

export const DocDetailModal: React.FC = () => {
  const { activeModal, closeModal, selectedDocId, documents, openKnowledge, equipmentList, openEquipment } = useApp();

  const doc = documents.find(d => d.id === selectedDocId);

  if (activeModal !== 'doc_detail' || !doc) return null;

  // Attempt to match equipment from doc title or docNumber (e.g. GA-1201A, YD-2301, etc.)
  const matchedEquipment = equipmentList.find(eq => 
    doc.docNumber.includes(eq.code.replace('EQ-', '')) || 
    doc.title.includes(eq.code.replace('EQ-', '')) ||
    doc.docNumber.includes(eq.id) ||
    doc.title.includes(eq.name)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-teal-400 font-bold bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded">
                  {doc.docNumber}
                </span>
                <span className="text-xs text-slate-400">{doc.category}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  AFC / APPROVED
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{doc.title}</h3>
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
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Petrochemical Title Block Header */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-slate-200 tracking-wide">
                  PT CHANDRA ASRI PACIFIC TBK
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">
                CILEGON PETROCHEMICAL COMPLEX • UNIT 1200-8900
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Document Standard</span>
                <p className="font-semibold text-slate-200 mt-0.5">{doc.category}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Source Format & Size</span>
                <p className="font-mono text-slate-200 mt-0.5">{doc.fileType} ({doc.fileSize})</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Indexing Pipeline</span>
                <p className="font-semibold text-teal-400 mt-0.5">{doc.source} (OCR Verified)</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Revision / Effective Date</span>
                <p className="font-mono text-slate-200 mt-0.5">{doc.uploadDate}</p>
              </div>
            </div>
          </div>

          {/* Linked Equipment Quick-Access if applicable */}
          {matchedEquipment && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block">Associated Digital Twin Node</span>
                  <span className="text-xs font-bold text-slate-200">{matchedEquipment.code}: {matchedEquipment.name}</span>
                </div>
              </div>
              <button
                onClick={() => { closeModal(); openEquipment(matchedEquipment.id); }}
                className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>View Node Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Document Content / OCR Extracted View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Extracted Technical Specifications & Text</span>
              </h4>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-800/50 px-2 py-0.5 rounded">
                CALIBER 2026 GROUND TRUTH
              </span>
            </div>
            
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-[320px] overflow-y-auto">
              {doc.extractedSnippet || 'Full document content structured and indexed in active knowledge base.'}
            </div>
          </div>

          {/* Linked Knowledge Record CTA */}
          {doc.linkedKnowledgeId && (
            <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-teal-400 block">Structured Knowledge & Interactive SOP</span>
                <p className="text-xs text-slate-300 mt-0.5">
                  Extracted into active procedural step-by-step with verified safety alerts (Ref: {doc.linkedKnowledgeId})
                </p>
              </div>
              <button
                onClick={() => { closeModal(); openKnowledge(doc.linkedKnowledgeId!); }}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Open SOP Record</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
