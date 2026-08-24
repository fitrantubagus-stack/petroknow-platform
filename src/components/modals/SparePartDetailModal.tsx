import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { renderLinearBarcode, generateBarcodeDataUrl, triggerDownload } from '../../utils/barcodeUtils';
import { 
  X, Barcode, Download, AlertCircle, CheckCircle2, 
  MapPin, Package, Clock, DollarSign, ArrowUpRight, Plus 
} from 'lucide-react';

export const SparePartDetailModal: React.FC = () => {
  const { 
    activeModal, closeModal, selectedPartNumber, spareParts, 
    equipmentList, knowledgeEntries, openKnowledge, openEquipment, 
    restockPart, role 
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const part = spareParts.find(p => p.partNumber === selectedPartNumber);

  useEffect(() => {
    if (part && canvasRef.current) {
      renderLinearBarcode(canvasRef.current, part.partNumber);
    }
  }, [part]);

  if (activeModal !== 'sparepart_detail' || !part) return null;

  const isLowStock = part.currentStock <= part.minThreshold;

  // Find compatible equipment
  const compatibleEqs = equipmentList.filter(e => 
    part.compatibleEquipmentIds.includes(e.id) || e.linkedPartNumbers.includes(part.partNumber)
  );

  // Find linked knowledge
  const linkedKbs = knowledgeEntries.filter(k => 
    k.linkedPartNumbers.includes(part.partNumber) || 
    part.compatibleEquipmentIds.some(eqId => k.linkedEquipmentIds.includes(eqId))
  );

  const handleDownloadBarcode = () => {
    const dataUrl = generateBarcodeDataUrl(part.partNumber);
    if (dataUrl) {
      triggerDownload(dataUrl, `BARCODE-${part.partNumber}-PetroKnow.png`);
    }
  };

  const handleRestock = (qty: number) => {
    restockPart(part.partNumber, qty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
                  {part.partNumber}
                </span>
                <span className="text-xs text-slate-400">{part.category}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{part.name}</h3>
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
          {/* Top Barcode & Stock Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Real Linear Barcode Display */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Physical Linear 1D Barcode</span>
              <div className="bg-white p-2.5 rounded-xl shadow-md flex items-center justify-center max-w-full overflow-hidden">
                <canvas ref={canvasRef} className="max-w-full h-auto" />
              </div>
              <p className="font-mono text-xs font-bold text-slate-300 mt-2">{part.partNumber}</p>
              <button
                onClick={handleDownloadBarcode}
                className="mt-2.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Print Tag</span>
              </button>
            </div>

            {/* Inventory & Stock Health */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Inventory Stock Status</span>
                  {isLowStock ? (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Low Stock Alert
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Stock Adequate
                    </span>
                  )}
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-700/40">
                    <span className="text-[11px] text-slate-400">Available Stock</span>
                    <p className={`text-xl font-bold font-mono mt-0.5 ${isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {part.currentStock} <span className="text-xs text-slate-400 font-sans">{part.unit}</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-700/40">
                    <span className="text-[11px] text-slate-400">Reorder Threshold</span>
                    <p className="text-xl font-bold text-slate-200 font-mono mt-0.5">
                      {part.minThreshold} <span className="text-xs text-slate-400 font-sans">{part.unit}</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-700/40">
                    <span className="text-[11px] text-slate-400">Lead Time</span>
                    <p className="text-xl font-bold text-slate-200 font-mono mt-0.5">
                      {part.leadTimeDays} <span className="text-xs text-slate-400 font-sans">days</span>
                    </p>
                  </div>
                </div>

                {/* Warehouse Location */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-700/40">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Bin Location: <strong className="text-slate-200">{part.binLocation}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Unit Cost: ${part.costUsd} USD</span>
                  </div>
                </div>
              </div>

              {/* Restock action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRestock(5)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Receive Shipment (+5 units)</span>
                </button>
                <button
                  onClick={() => handleRestock(1)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Test Restock</span>
                </button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-slate-200">Technical Specifications:</span>
            <p className="text-slate-400 leading-relaxed">{part.specifications}</p>
          </div>

          {/* Compatible Equipment */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Compatible Plant Equipment</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {compatibleEqs.map(eq => (
                <button
                  key={eq.id}
                  onClick={() => { closeModal(); openEquipment(eq.id); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-2 transition-colors"
                >
                  <span className="font-mono text-teal-400 font-bold">{eq.code}</span>
                  <span className="text-slate-400">— {eq.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cross-linked SOPs */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Referenced in Standard Operating Procedures</h4>
            <div className="space-y-2">
              {linkedKbs.map(kb => (
                <div
                  key={kb.id}
                  onClick={() => { closeModal(); openKnowledge(kb.id); }}
                  className="cursor-pointer p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] text-teal-400 font-mono font-semibold mr-2">{kb.id}</span>
                    <span className="text-xs font-semibold text-slate-200">{kb.title}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
