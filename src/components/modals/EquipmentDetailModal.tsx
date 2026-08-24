import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateQrCodeDataUrl, triggerDownload } from '../../utils/barcodeUtils';
import { calculateFreshness, getFreshnessBadge } from '../../utils/freshness';
import { 
  X, QrCode, Download, Activity, Gauge, Flame, Wind, 
  FileText, Lightbulb, AlertTriangle, ShieldCheck, ArrowUpRight, 
  CheckCircle2, PlusCircle 
} from 'lucide-react';

export const EquipmentDetailModal: React.FC = () => {
  const { 
    activeModal, closeModal, selectedEquipmentId, equipmentList, 
    knowledgeEntries, spareParts, role, openKnowledge, openSparePart, 
    setCurrentView, reverifyKnowledgeEntry, verifyKnowledgeEntry 
  } = useApp();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const equipment = equipmentList.find(e => e.id === selectedEquipmentId);

  useEffect(() => {
    if (equipment) {
      generateQrCodeDataUrl(equipment.id).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [equipment]);

  if (activeModal !== 'equipment_detail' || !equipment) return null;

  // Find linked knowledge
  const linkedKbs = knowledgeEntries.filter(k => 
    equipment.linkedKnowledgeIds.includes(k.id) || k.linkedEquipmentIds.includes(equipment.id)
  );

  // Find linked spare parts
  const linkedParts = spareParts.filter(p => 
    p.compatibleEquipmentIds.includes(equipment.id) || equipment.linkedPartNumbers.includes(p.partNumber)
  );

  const handleDownloadQr = () => {
    if (qrDataUrl) {
      triggerDownload(qrDataUrl, `QR-${equipment.code}-PetroKnow.png`);
    }
  };

  const handleReportTacit = () => {
    closeModal();
    setCurrentView('tacit');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded">
                  {equipment.code}
                </span>
                <span className="text-xs text-slate-400">{equipment.area}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{equipment.name}</h3>
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
          {/* Top Section: Telemetry & QR Code Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Equipment Telemetry & Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">{equipment.description}</p>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-700/50">
                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/40">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Temperature</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">{equipment.temp}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/40">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Pressure</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">{equipment.pressure}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-700/40">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                      <span>Flow Rate</span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">{equipment.flowRate}</p>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReportTacit}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Report Tacit Issue on this Node</span>
                </button>
              </div>
            </div>

            {/* Real QR Code Display */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Physical Equipment QR</span>
              <div className="bg-white p-2.5 rounded-xl shadow-md">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt={`${equipment.code} QR Code`} className="w-36 h-36 object-contain" />
                ) : (
                  <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">Generating...</div>
                )}
              </div>
              <p className="font-mono text-xs font-bold text-slate-300 mt-2">{equipment.code}</p>
              <button
                onClick={handleDownloadQr}
                className="mt-2.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print Tag</span>
              </button>
            </div>
          </div>

          {/* Linked Knowledge Entries Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Linked SOPs & Tacit Knowledge ({linkedKbs.length})</span>
              </h4>
            </div>

            {linkedKbs.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 text-center text-xs text-slate-400">
                No specific knowledge documents linked to this node yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {linkedKbs.map(kb => {
                  const freshness = calculateFreshness(kb);
                  const badge = getFreshnessBadge(freshness.state);
                  const isPending = kb.status === 'pending';
                  const isStale = freshness.state === 'stale';

                  return (
                    <div
                      key={kb.id}
                      className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.badgeClass}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{kb.id}</span>
                        </div>
                        <h5 
                          onClick={() => { closeModal(); openKnowledge(kb.id); }}
                          className="text-xs font-bold text-slate-100 hover:text-teal-300 cursor-pointer line-clamp-2"
                        >
                          {kb.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{kb.situation}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-700/40 text-[11px]">
                        <span className="text-slate-400">
                          {kb.isTacit ? 'Tacit Wisdom' : 'SOP'} by {kb.author}
                        </span>

                        {/* Inline Verify Now Shortcut if Pending or Stale (for SME/Supervisor) */}
                        {(role === 'sme' || role === 'supervisor') && (isPending || isStale) ? (
                          <button
                            onClick={() => {
                              if (isPending) {
                                verifyKnowledgeEntry(kb.id, 'approve');
                              } else {
                                reverifyKnowledgeEntry(kb.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-semibold border border-teal-500/40 flex items-center gap-1 text-[11px] transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-teal-400" />
                            <span>{isPending ? 'Approve Now' : 'Re-Verify'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => { closeModal(); openKnowledge(kb.id); }}
                            className="text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                          >
                            <span>Read</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Linked Spare Parts Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Compatible Spare Parts & Wear Items ({linkedParts.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {linkedParts.map(part => {
                const isLow = part.currentStock <= part.minThreshold;
                return (
                  <div
                    key={part.id}
                    onClick={() => { closeModal(); openSparePart(part.partNumber); }}
                    className="cursor-pointer p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-cyan-400">{part.partNumber}</span>
                      {isLow ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold">
                          Low Stock ({part.currentStock} left)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">{part.currentStock} {part.unit}</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">{part.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{part.binLocation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
