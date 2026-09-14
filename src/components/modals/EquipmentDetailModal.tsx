import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateQrCodeDataUrl, triggerDownload } from '../../utils/barcodeUtils';
import { calculateFreshness, getFreshnessBadge } from '../../utils/freshness';
import { 
  X, QrCode, Download, Activity, Gauge, Flame, Wind, 
  FileText, Lightbulb, AlertTriangle, ShieldCheck, ArrowUpRight, 
  CheckCircle2, PlusCircle, ShieldAlert, Cpu, Wrench, FileSearch, Layers
} from 'lucide-react';

type TabType = 'overview' | 'datasheet' | 'interlocks' | 'crossref' | 'procedures' | 'parts';

export const EquipmentDetailModal: React.FC = () => {
  const { 
    activeModal, closeModal, selectedEquipmentId, equipmentList, 
    knowledgeEntries, spareParts, documents, role, openKnowledge, openSparePart, 
    openDoc, setCurrentView, reverifyKnowledgeEntry, verifyKnowledgeEntry 
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const equipment = equipmentList.find(e => e.id === selectedEquipmentId);

  useEffect(() => {
    if (equipment) {
      generateQrCodeDataUrl(equipment.id).then(url => {
        setQrDataUrl(url);
      });
      // Reset to overview when opening new equipment
      setActiveTab('overview');
    }
  }, [equipment]);

  if (activeModal !== 'equipment_detail' || !equipment) return null;

  const spec = equipment.datasheetSpec;

  // Find linked knowledge
  const linkedKbs = knowledgeEntries.filter(k => 
    equipment.linkedKnowledgeIds.includes(k.id) || k.linkedEquipmentIds.includes(equipment.id)
  );

  // Find linked spare parts
  const linkedParts = spareParts.filter(p => 
    p.compatibleEquipmentIds.includes(equipment.id) || equipment.linkedPartNumbers.includes(p.partNumber)
  );

  // Cross-reference document helper
  const handleOpenDocByNumber = (docNumber: string) => {
    const foundDoc = documents.find(d => 
      d.docNumber.toLowerCase().includes(docNumber.toLowerCase()) ||
      docNumber.toLowerCase().includes(d.docNumber.toLowerCase())
    );
    if (foundDoc) {
      closeModal();
      openDoc(foundDoc.id);
    }
  };

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
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  equipment.status === 'warning' 
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {equipment.status === 'warning' ? 'CAUTION: OPERATING ANOMALY' : 'STATUS: NORMAL & VERIFIED'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">{equipment.name}</h3>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950/60 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview & Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('datasheet')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'datasheet'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Engineering Datasheet</span>
            {spec && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setActiveTab('interlocks')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'interlocks'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Safety Interlocks ({spec?.interlockSetpoints?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('crossref')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'crossref'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>P&ID & Plot Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('procedures')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'procedures'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>SOP & Tacit ({linkedKbs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'parts'
                ? 'border-teal-400 text-teal-300 bg-teal-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Spare Parts ({linkedParts.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Equipment Telemetry & Info */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">{equipment.description}</p>
                    
                    {/* Live Sensor Telemetry Gauges */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-700/50">
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Operating Temp</span>
                        </div>
                        <p className="text-base font-bold text-slate-100 font-mono mt-1">{equipment.temp}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Operating Press.</span>
                        </div>
                        <p className="text-base font-bold text-slate-100 font-mono mt-1">{equipment.pressure}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Wind className="w-3.5 h-3.5 text-teal-400" />
                          <span>Flow / Capacity</span>
                        </div>
                        <p className="text-base font-bold text-slate-100 font-mono mt-1">{equipment.flowRate}</p>
                      </div>
                    </div>

                    {/* Functional & Safety Integrity Badge */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/50 text-[11px]">
                      <div className="p-2 rounded bg-slate-900/90 border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 block">Functional Location</span>
                        <span className="font-mono font-bold text-teal-300 truncate block">{equipment.functionalLoc || 'LLDPE Plant'}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/90 border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 block">Safety Integrity</span>
                        <span className="font-mono font-bold text-cyan-300">{equipment.silLevel || 'SIL-2'}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/90 border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 block">Interlock Loop</span>
                        <span className="font-mono font-bold text-amber-300">{equipment.interlockSeq || 'I-1201'}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/90 border border-slate-700/50">
                        <span className="text-[10px] text-slate-400 block">Manufacturer</span>
                        <span className="font-mono font-bold text-slate-200 truncate block">{spec?.manufacturer || 'OEM Specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReportTacit}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Report Veteran Tacit Wisdom on this Node</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('datasheet')}
                      className="px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Full Datasheet</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Real Floor QR Code Display */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Physical Floor Asset Tag</span>
                  <div className="bg-white p-2.5 rounded-xl shadow-md">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt={`${equipment.code} QR Code`} className="w-36 h-36 object-contain" />
                    ) : (
                      <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">Generating...</div>
                    )}
                  </div>
                  <p className="font-mono text-xs font-bold text-slate-300 mt-2">{equipment.code}</p>
                  <p className="text-[10px] text-slate-400">Scan tag at plant floor to open instant SOP</p>
                  <button
                    onClick={handleDownloadQr}
                    className="mt-2.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Print Tag</span>
                  </button>
                </div>
              </div>

              {/* Quick Summary Cards: Linked Docs & Parts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      Active Knowledge & SOPs ({linkedKbs.length})
                    </span>
                    <button onClick={() => setActiveTab('procedures')} className="text-xs text-teal-400 hover:underline">View all</button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {linkedKbs.slice(0, 2).map(k => k.title).join(' • ') || 'No linked procedures yet.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-cyan-400" />
                      Compatible Spare Parts ({linkedParts.length})
                    </span>
                    <button onClick={() => setActiveTab('parts')} className="text-xs text-cyan-400 hover:underline">View BOM</button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {linkedParts.slice(0, 2).map(p => `${p.name} (${p.currentStock} in stock)`).join(' • ') || 'No parts assigned.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUTHENTIC ENGINEERING DATASHEET */}
          {activeTab === 'datasheet' && spec && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-800/40 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold">
                      {equipment.datasheetDocNo || 'DTS-CAL-SPEC'}
                    </span>
                    <span className="text-xs text-slate-400">PT CHANDRA ASRI PACIFIC TBK - MECHANICAL DATASHEET</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-100 mt-1">{spec.manufacturer} - {spec.modelType}</h4>
                </div>
                <button
                  onClick={() => handleOpenDocByNumber(equipment.datasheetDocNo || '')}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Open Raw PDF Datasheet</span>
                </button>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Process & Design Conditions */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <h5 className="font-bold text-teal-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Process & Operating Conditions
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Service Fluid / Medium:</span>
                      <span className="font-semibold text-slate-200">{spec.serviceFluid}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Rated Design Capacity:</span>
                      <span className="font-mono font-bold text-cyan-300">{spec.capacityRated}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Operating / Design Pressure:</span>
                      <span className="font-mono text-slate-200">{spec.operatingPressure} / <strong className="text-amber-300">{spec.designPressure}</strong></span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Operating / Design Temperature:</span>
                      <span className="font-mono text-slate-200">{spec.operatingTemp} / <strong className="text-amber-300">{spec.designTemp}</strong></span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Head / Differential Pressure:</span>
                      <span className="font-mono font-semibold text-slate-200">{spec.headOrDiffPressure}</span>
                    </div>
                  </div>
                </div>

                {/* Mechanical & Materials of Construction */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                  <h5 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Mechanical & Metallurgy (MOC)
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Casing / Body Metallurgy:</span>
                      <span className="font-mono font-bold text-slate-200">{spec.mocBody}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Internal Trim / Rotor Metallurgy:</span>
                      <span className="font-mono font-bold text-slate-200">{spec.mocTrim}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Mechanical Seal Piping Plan:</span>
                      <span className="font-semibold text-teal-300">{spec.mechanicalSealPlan}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-700/40">
                      <span className="text-slate-400">Electric Driver Rating:</span>
                      <span className="font-mono text-slate-200">{spec.motorPowerKw} @ {spec.motorVoltage}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Flange Standard & Rating:</span>
                      <span className="font-mono font-semibold text-slate-200">{spec.flangeRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engineering Drawings & References */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <h5 className="font-bold text-slate-200 text-xs">Official Chandra Asri Engineering References</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div 
                    onClick={() => handleOpenDocByNumber(spec.pidDocNo)}
                    className="cursor-pointer p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block">Piping & Instrumentation</span>
                      <span className="font-mono font-bold text-teal-400 group-hover:underline">{spec.pidDocNo}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-400" />
                  </div>

                  <div 
                    onClick={() => handleOpenDocByNumber(spec.plotPlanDocNo)}
                    className="cursor-pointer p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block">Plot Plan Drawing</span>
                      <span className="font-mono font-bold text-cyan-400 group-hover:underline">{spec.plotPlanDocNo}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                  </div>

                  <div 
                    onClick={() => handleOpenDocByNumber(equipment.drawingDocNo || '')}
                    className="cursor-pointer p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block">General Arrangement (GA)</span>
                      <span className="font-mono font-bold text-amber-400 group-hover:underline">{equipment.drawingDocNo || 'GAD-CAL-1201'}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SAFETY INTERLOCK & ESD MATRIX */}
          {activeTab === 'interlocks' && spec && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">Safety Instrumented System (SIS) / ESD Logic</h4>
                    <p className="text-[11px] text-slate-400">Automated trip setpoints and voting logic configured in Triconex DCS</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                  {equipment.silLevel || 'SIL-2'} Rated
                </span>
              </div>

              {/* Interlock Table */}
              <div className="border border-slate-700/70 rounded-xl overflow-hidden bg-slate-900">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-slate-700/60 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="p-3">Tag Number</th>
                      <th className="p-3">Monitored Parameter</th>
                      <th className="p-3">Trip Setpoint</th>
                      <th className="p-3">Voting Logic</th>
                      <th className="p-3">Automated Safeguard Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {spec.interlockSetpoints && spec.interlockSetpoints.length > 0 ? (
                      spec.interlockSetpoints.map((interlock, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-400">{interlock.tag}</td>
                          <td className="p-3 font-medium text-slate-200">{interlock.parameter}</td>
                          <td className="p-3 font-mono font-bold text-rose-400">{interlock.tripValue}</td>
                          <td className="p-3 font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-teal-300 font-bold text-[10px]">
                              {interlock.votingLogic}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{interlock.action}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500 italic">No specific trip loops recorded for this equipment.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: P&ID & PLOT PLAN CROSS-REFERENCE */}
          {activeTab === 'crossref' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  Engineering Drawing Cross-Reference Matrix
                </h4>
                <p className="text-xs text-slate-400">
                  Instant visual and operational linkage to verified engineering packages from PT Chandra Asri Pacific Tbk.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* P&ID Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400">P&ID Process Drawing</span>
                    <span className="font-mono text-[10px] text-slate-400">{spec?.pidDocNo || 'PID-CAL'}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Shows suction/discharge lines, bypasses, relief valves (PSV), transmitter tapping points, and emergency shutdown valve interconnections.
                  </p>
                  <button
                    onClick={() => handleOpenDocByNumber(spec?.pidDocNo || '')}
                    className="w-full py-2 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Open P&ID Document</span>
                  </button>
                </div>

                {/* Plot Plan Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">Plot Plan & Elevation Drawing</span>
                    <span className="font-mono text-[10px] text-slate-400">{spec?.plotPlanDocNo || 'PLP-CAL'}</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Physical location inside {equipment.area}, piping rack clearance, maintenance pullout zone, and hazardous classification (Zone 1 / Zone 2).
                  </p>
                  <button
                    onClick={() => handleOpenDocByNumber(spec?.plotPlanDocNo || '')}
                    className="w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Open Plot Plan Document</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROCEDURES & TACIT WISDOM */}
          {activeTab === 'procedures' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Linked SOPs & Tacit Knowledge ({linkedKbs.length})</span>
                </h4>
                <button
                  onClick={handleReportTacit}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add OPL / Wisdom</span>
                </button>
              </div>

              {linkedKbs.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/40 text-center text-xs text-slate-400">
                  No specific knowledge documents linked to this equipment node yet.
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
          )}

          {/* TAB 6: SPARE PARTS BOM */}
          {activeTab === 'parts' && (
            <div className="space-y-4 animate-fade-in">
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
                      className="cursor-pointer p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all space-y-2"
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
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{part.name}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-700/40 pt-1.5">
                        <span>Bin: {part.binLocation}</span>
                        <span className="font-mono text-teal-400">${part.costUsd}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
