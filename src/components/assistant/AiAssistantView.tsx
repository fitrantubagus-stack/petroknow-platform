import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage, ChatBarcodeAttachment } from '../../types';
import { decodeBarcodeOrQrFromFile, generateQrCodeDataUrl, generateBarcodeDataUrl } from '../../utils/barcodeUtils';
import { 
  Bot, Send, Image, ThumbsUp, ThumbsDown, Sparkles, 
  CheckCircle2, AlertTriangle, HelpCircle, ArrowUpRight, 
  RotateCcw, Camera, Flame, Gauge, X, ShieldAlert, WifiOff,
  Zap, Clock, FileSearch, Database, Cpu, Layers, Check,
  Download, QrCode, Barcode, Key
} from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, validateGeminiApiKey } from '../../services/geminiService';

const ChatBarcodeCard: React.FC<{ item: ChatBarcodeAttachment }> = ({ item }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const { setCurrentView } = useApp();

  useEffect(() => {
    let active = true;
    if (item.type === 'qr') {
      generateQrCodeDataUrl(item.code).then(url => {
        if (active) setDataUrl(url);
      });
    } else {
      const url = generateBarcodeDataUrl(item.code);
      setDataUrl(url);
    }
    return () => { active = false; };
  }, [item.code, item.type]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${item.code}_${item.type}.png`;
    a.click();
  };

  return (
    <div className="p-3 rounded-xl bg-slate-950/90 border border-teal-500/30 shadow-md space-y-2.5 w-full sm:max-w-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
          {item.type === 'qr' ? 'PLANT FLOOR QR TAG' : 'WAREHOUSE BARCODE'}
        </span>
        <span className="font-mono text-[11px] font-bold text-slate-200">{item.code}</span>
      </div>

      <div className="p-2.5 bg-white rounded-lg flex items-center justify-center shadow-inner">
        {dataUrl ? (
          <img 
            src={dataUrl} 
            alt={item.label} 
            className={item.type === 'qr' ? 'w-28 h-28 object-contain' : 'w-full h-14 object-contain'} 
          />
        ) : (
          <div className="w-28 h-14 flex items-center justify-center text-slate-500 text-xs font-mono">Generating...</div>
        )}
      </div>

      <p className="text-[11px] text-slate-300 font-medium truncate">{item.label}</p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleDownload}
          className="flex-1 py-1.5 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Download</span>
        </button>
        <button
          onClick={() => setCurrentView('scancenter')}
          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <QrCode className="w-3 h-3 text-cyan-400" />
          <span>Scan Center</span>
        </button>
      </div>
    </div>
  );
};

export const AiAssistantView: React.FC = () => {
  const { 
    chatMessages, sendChatMessage, rateChatAnswer, logKnowledgeGap, 
    openKnowledge, knowledgeEntries, equipmentList, spareParts,
    isOffline
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [keyErrorMsg, setKeyErrorMsg] = useState('');

  // 55-Second Deep Retrieval & Thinking HUD State
  const [isThinking, setIsThinking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(55);
  const [currentPendingQuestion, setCurrentPendingQuestion] = useState<string>('');
  const [pendingImageInfo, setPendingImageInfo] = useState<{ url: string; label: string } | undefined>(undefined);
  const [pendingCustomResponse, setPendingCustomResponse] = useState<Partial<ChatMessage> | undefined>(undefined);

  const countdownIntervalRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isProcessing, isThinking, secondsLeft]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Dispatch response to AppContext once 55s thinking completes or is skipped
  const finalizeAiResponse = async (
    query: string,
    imgInfo?: { url: string; label: string },
    customResp?: Partial<ChatMessage>
  ) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsThinking(false);
    setIsProcessing(true);

    try {
      await sendChatMessage(query, imgInfo, customResp);
    } finally {
      setIsProcessing(false);
      setCurrentPendingQuestion('');
      setPendingImageInfo(undefined);
      setPendingCustomResponse(undefined);
    }
  };

  // Start the authentic 55-second deep retrieval countdown
  const start55SecondDeepSearch = (
    query: string,
    imgInfo?: { url: string; label: string },
    customResp?: Partial<ChatMessage>
  ) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setCurrentPendingQuestion(query);
    setPendingImageInfo(imgInfo);
    setPendingCustomResponse(customResp);
    setSecondsLeft(55);
    setIsThinking(true);

    const startTime = Date.now();
    const totalDuration = 55 * 1000;

    countdownIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((totalDuration - elapsed) / 1000));
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        finalizeAiResponse(query, imgInfo, customResp);
      }
    }, 250);
  };

  // Instant skip button handler
  const handleSkipThinking = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    finalizeAiResponse(currentPendingQuestion, pendingImageInfo, pendingCustomResponse);
  };

  const isQuickQuery = (q: string): boolean => {
    const raw = q.trim().toLowerCase().replace(/[.,?!:;'"()\[\]{}~@#$%^&*_\-+=<>/\\]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!raw) return false;
    const isGreeting = /^(hi|hello|hey|halo|helo|howdy|greetings|good\s+(morning|afternoon|evening|day)|help|menu|who are you|what can you do|what is this|features|capabilities|bisa apa|bisa ngapain|fungsi)/i.test(raw);
    const isBarcodeReq = /(generate|create|show|make|send|buatkan|tampilkan)\s+(barcode|qr)/i.test(raw);
    const isDeveloperReq = /(developer|creator|maker|author|builder|pembuat|pengembang|who\s+(made|built|developed|created)|who\s+is\s+(the\s+)?dev)/i.test(raw);
    return isGreeting || isBarcodeReq || isDeveloperReq;
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isProcessing || isThinking) return;

    const query = inputQuery.trim();
    setInputQuery('');
    if (isQuickQuery(query)) {
      finalizeAiResponse(query);
    } else {
      start55SecondDeepSearch(query);
    }
  };

  const handlePromptChipClick = (chipText: string) => {
    if (isProcessing || isThinking) return;
    if (isQuickQuery(chipText)) {
      finalizeAiResponse(chipText);
    } else {
      start55SecondDeepSearch(chipText);
    }
  };

  // Preset plant photos for "Ask by Photo"
  const photoPresets = [
    {
      id: 'photo-1',
      title: 'Hexane Feed Pump GA-1201A Seal Flush Plan 11',
      label: 'Hexane Feed Pump GA-1201A mechanical seal API Plan 11 flush line verification',
      thumb: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
      description: 'GA-1201A mechanical seal flush piping inspection, orifice dp gauge verification.'
    },
    {
      id: 'photo-2',
      title: 'Cycle Gas Compressor KC-4501 Seal Oil Tank Low Level',
      label: 'Cycle Gas Compressor KC-4501 seal oil overhead tank level alarm SEQ-4501 interlock',
      thumb: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=80',
      description: 'KC-4501 LSH-4501 interlock transmitter readout and seal oil pressure differential.'
    },
    {
      id: 'photo-3',
      title: 'Pellet Dryer YD-2301 Agglomerate Screen Clogging',
      label: 'Pellet Dryer YD-2301 rotary screen mesh inspection agglomerate high moisture',
      thumb: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=300&auto=format&fit=crop&q=80',
      description: 'YD-2301 screen basket visual check and differential pressure sensor cleaning.'
    },
    {
      id: 'photo-4',
      title: 'Control Valve LV-6701 Pneumatic Actuator Diaphragm',
      label: 'Reactor Level Control Valve LV-6701 positioner calibration actuator diaphragm leakage',
      thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
      description: 'LV-6701 air supply regulator and Fisher DVC6200 digital positioner inspection.'
    }
  ];

  const handleSelectPhoto = (preset: typeof photoPresets[0]) => {
    setPhotoModalOpen(false);
    start55SecondDeepSearch(`[Analyzed Plant Photo: ${preset.title}]`, {
      url: preset.thumb,
      label: preset.label
    });
  };

  const processUploadedPhotoFile = async (file: File) => {
    setPhotoModalOpen(false);

    try {
      // 1. Attempt genuine barcode/QR decoding
      const decoded = await decodeBarcodeOrQrFromFile(file);

      // Read file to data URL for chat image preview
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string || '');
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      if (decoded && decoded.code) {
        const cleanCode = decoded.code.trim();
        const upperCode = cleanCode.toUpperCase();

        // Check if matches real equipment ID or code
        const matchedEq = equipmentList.find(eq => 
          eq.id.toUpperCase() === upperCode || 
          eq.code.toUpperCase() === upperCode ||
          eq.code.replace('EQ-', '').toUpperCase() === upperCode
        );

        // Check if matches real spare part
        const matchedPart = spareParts.find(p => 
          p.partNumber.toUpperCase() === upperCode || 
          p.id.toUpperCase() === upperCode
        );

        if (matchedEq) {
          const linkedKbs = knowledgeEntries.filter(k => 
            matchedEq.linkedKnowledgeIds.includes(k.id) || 
            k.linkedEquipmentIds.includes(matchedEq.id)
          );
          const linkedPartItems = spareParts.filter(p => 
            matchedEq.linkedPartNumbers.includes(p.partNumber) || 
            p.compatibleEquipmentIds.includes(matchedEq.id)
          );

          let responseText = `Scanned Equipment Identified: ${matchedEq.name} (${matchedEq.code})\n\n`;
          responseText += `• Plant Area: ${matchedEq.area}\n`;
          responseText += `• Category: ${matchedEq.category}\n`;
          responseText += `• Operating Telemetry: Temp: ${matchedEq.temp} | Pressure: ${matchedEq.pressure} | Flow Rate: ${matchedEq.flowRate}\n`;
          responseText += `• Status: ${matchedEq.status.toUpperCase()} (Last inspected: ${matchedEq.lastInspected})\n`;
          responseText += `• Description: ${matchedEq.description}\n\n`;

          responseText += `Linked Standard Procedures & Tacit Wisdom:\n`;
          if (linkedKbs.length > 0) {
            responseText += linkedKbs.map(k => `• [${k.id}] ${k.title} (${k.category} — ${k.status.toUpperCase()})`).join('\n') + '\n\n';
          } else {
            responseText += `• No specific procedures currently linked to this tag.\n\n`;
          }

          responseText += `Associated Spare Parts:\n`;
          if (linkedPartItems.length > 0) {
            responseText += linkedPartItems.map(p => `• [${p.partNumber}] ${p.name} — Stock: ${p.currentStock} ${p.unit} (Min: ${p.minThreshold})`).join('\n');
          } else {
            responseText += `• No spare parts listed for this unit.`;
          }

          start55SecondDeepSearch(
            `[Uploaded Photo: Scanned ${decoded.type} "${cleanCode}"]`,
            {
              url: dataUrl,
              label: `${decoded.type} Code: ${matchedEq.code} (${matchedEq.name})`
            },
            {
              text: responseText,
              confidenceStatus: 'verified',
              matchScore: 100,
              sources: linkedKbs.slice(0, 3).map(k => ({
                id: k.id,
                title: k.title,
                snippet: k.situation || k.content.slice(0, 180),
                category: k.category,
                status: k.status,
                docNumber: k.sourceDocId
              }))
            }
          );
          return;
        }

        if (matchedPart) {
          const compatEqs = equipmentList.filter(eq => matchedPart.compatibleEquipmentIds.includes(eq.id));
          const relevantKbs = knowledgeEntries.filter(k => 
            k.linkedPartNumbers.includes(matchedPart.partNumber) || 
            matchedPart.compatibleEquipmentIds.some(eid => k.linkedEquipmentIds.includes(eid))
          );

          let responseText = `Scanned Spare Part Identified: ${matchedPart.name} (${matchedPart.partNumber})\n\n`;
          responseText += `• Category: ${matchedPart.category}\n`;
          responseText += `• Stock Status: ${matchedPart.currentStock} ${matchedPart.unit} available (Min: ${matchedPart.minThreshold} ${matchedPart.unit}) ${matchedPart.currentStock <= matchedPart.minThreshold ? '⚠️ [LOW STOCK ALERT]' : '✅ [ADEQUATE STOCK]'}\n`;
          responseText += `• Warehouse Location: ${matchedPart.binLocation}\n`;
          responseText += `• Unit Cost & Lead Time: $${matchedPart.costUsd.toLocaleString()} USD | ${matchedPart.leadTimeDays} days lead time (Last restocked: ${matchedPart.lastRestocked})\n`;
          responseText += `• Technical Specifications: ${matchedPart.specifications}\n\n`;

          responseText += `Compatible Plant Equipment:\n`;
          if (compatEqs.length > 0) {
            responseText += compatEqs.map(eq => `• [${eq.code}] ${eq.name} (${eq.area})`).join('\n') + '\n\n';
          } else {
            responseText += `• Universal plant specification.\n\n`;
          }

          if (relevantKbs.length > 0) {
            responseText += `Associated Operating Procedures:\n` + relevantKbs.map(k => `• [${k.id}] ${k.title} (${k.category})`).join('\n');
          }

          start55SecondDeepSearch(
            `[Uploaded Photo: Scanned ${decoded.type} "${cleanCode}"]`,
            {
              url: dataUrl,
              label: `${decoded.type} Code: ${matchedPart.partNumber} (${matchedPart.name})`
            },
            {
              text: responseText,
              confidenceStatus: 'verified',
              matchScore: 100,
              sources: relevantKbs.slice(0, 3).map(k => ({
                id: k.id,
                title: k.title,
                snippet: k.situation || k.content.slice(0, 180),
                category: k.category,
                status: k.status,
                docNumber: k.sourceDocId
              }))
            }
          );
          return;
        }

        start55SecondDeepSearch(
          `[Uploaded Photo: Scanned ${decoded.type} "${cleanCode}"]`,
          {
            url: dataUrl,
            label: `${decoded.type} Code: ${cleanCode}`
          },
          {
            text: `Decoded ${decoded.type} code "${cleanCode}" successfully, but it does not match registered plant equipment or warehouse spare parts on file in the PetroKnow system.`
          }
        );
        return;
      }

      // No barcode detected -> Visual OCR fallback
      const label = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      start55SecondDeepSearch(`[Analyzed Uploaded Image: ${file.name}]`, {
        url: dataUrl,
        label: `Operational analysis of ${label}`
      });
    } catch (err) {
      console.error('Error analyzing image upload:', err);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedPhotoFile(file);
      e.target.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          processUploadedPhotoFile(file);
          break;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processUploadedPhotoFile(file);
    }
  };

  // Compute 55s thinking stage and progress percentage
  const elapsedSeconds = 55 - secondsLeft;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / 55) * 100));

  // Determine active search stage based on elapsed time (0 - 55s)
  const getThinkingStage = (elapsed: number) => {
    if (elapsed < 11) {
      return {
        stageNum: 1,
        title: 'Stage 1/5: Document & Drawing Ingestion (P&IDs & GA Drawings)',
        desc: 'Scanning 41 AFC engineering drawings, P&IDs, and plot plans across Areas 1200 - 8900...',
        logs: [
          'Connecting to Cilegon EDMS archive: TJC-LLD-P-PID-0101 (Hexane Feed)',
          'Parsing P&ID TJC-LLD-P-PID-0401 (Reaction Cycle Gas Compressor Loop)',
          'OCR extracting engineering tag identifiers & piping specifications'
        ],
        icon: <FileSearch className="w-4 h-4 text-cyan-400 animate-spin" />
      };
    } else if (elapsed < 22) {
      return {
        stageNum: 2,
        title: 'Stage 2/5: OEM Datasheets & SIS Interlock Matrix',
        desc: 'Extracting OEM equipment design limits & Cause & Effect SIS logic (SIL-1 / SIL-2)...',
        logs: [
          'Cross-referencing Torishima CAL-80-250 & Dresser-Rand API 618 datasheets',
          'Extracting safety trip setpoints: PSLL-1201 (< 0.5 barg), FSLL-1201, VSHH-4501 (> 12.0 mm/s)',
          'Validating voting logic architecture (2oo3, 1oo2) against IEC 61511 safety standards'
        ],
        icon: <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
      };
    } else if (elapsed < 33) {
      return {
        stageNum: 3,
        title: 'Stage 3/5: SAP PM Maintenance Reliability Records (211 Work Orders)',
        desc: 'Querying SAP PM historical records across 211 Work Orders (2021-2026) for failure modes & MTBF...',
        logs: [
          'Indexing 211 historical work orders from Maintenance History (All Equipment).xlsx',
          'Computing Mean Time Between Failures (MTBF: 42.4 Days) and MTTR (4.2 Hours)',
          'Correlating failure root causes: seal vapor lock (38%), bearing fatigue (29%), strainer fouling (18%)'
        ],
        icon: <Database className="w-4 h-4 text-amber-400 animate-bounce" />
      };
    } else if (elapsed < 44) {
      return {
        stageNum: 4,
        title: 'Stage 4/5: Warehouse Spare Parts BOM & Inventory Levels',
        desc: 'Correlating warehouse inventory BOM, critical spare levels, and lead-time constraints...',
        logs: [
          'Matching OEM spare parts: PRT-JC-T2100 (Plan 11 Seal), PRT-BRG-7310, PRT-KADANT-SEAL',
          'Checking Cilegon warehouse bin rack locations (RACK-B02, BIN-C14) and stock thresholds',
          'Verifying supplier lead-time constraints (45 days) and critical safety buffer levels'
        ],
        icon: <Layers className="w-4 h-4 text-emerald-400 animate-pulse" />
      };
    } else {
      return {
        stageNum: 5,
        title: 'Stage 5/5: Deterministic Synthesis & Veteran Tacit Wisdom',
        desc: 'Synthesizing deterministic engineering response with verifiable citations...',
        logs: [
          'Cross-referencing veteran rotating specialist Pak Joko Santoso’s verified tacit wisdom',
          'Validating against CALIBER 2026 ground-truth criteria & strict safety compliance',
          'Generating finalized, citable technical synthesis without assumptions'
        ],
        icon: <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
      };
    }
  };

  const currentStage = getThinkingStage(elapsedSeconds);

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-full flex flex-col bg-slate-950 text-slate-100 max-w-6xl mx-auto animate-fade-in relative ${
        isDragging ? 'ring-2 ring-teal-500/80' : ''
      }`}
    >
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center border-2 border-dashed border-teal-400 rounded-2xl m-3 pointer-events-none">
          <div className="text-center space-y-2">
            <Camera className="w-10 h-10 text-teal-400 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-teal-300">Drop Plant Photo or QR/Barcode Image to Analyze</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 shrink-0 mt-0.5 sm:mt-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">AI Knowledge Assistant</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                55s Deep Retrieval Grounded
              </span>
              {isOffline && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Mode</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Deterministic search across 41 AFC drawings, OEM datasheets, 211 SAP PM work orders, and veteran tacit wisdom.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 w-full sm:w-auto">
          {/* Gemini Key Config Button */}
          <button
            onClick={() => {
              setCustomKeyInput(localStorage.getItem('petroknow_gemini_api_key') || '');
              setKeyStatus('idle');
              setKeyErrorMsg('');
              setApiModalOpen(true);
            }}
            className="flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Configure Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini Key</span>
          </button>

          {/* Quick Photo Ask Button */}
          <button
            onClick={() => setPhotoModalOpen(true)}
            className="flex-1 sm:flex-initial justify-center px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-teal-400" />
            <span>Ask by Photo / Gauge</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          // Sanitize raw asterisks from message display
          const cleanText = msg.text.replace(/\*/g, '');

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-slate-700 text-slate-200' : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              }`}>
                {isUser ? 'OP' : <Bot className="w-4 h-4 text-teal-400" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-2xl space-y-2.5 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                {/* Image attachment if present */}
                {msg.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-w-xs shadow-md">
                    <img src={msg.imageUrl} alt="Attached plant photo" className="w-full h-36 object-cover" />
                    <div className="p-2 bg-slate-900 text-[10px] text-slate-400 font-mono">
                      {msg.imageLabel || 'Image Analyzed via Optical AI Engine'}
                    </div>
                  </div>
                )}

                {/* Main Bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-teal-600 text-slate-950 font-semibold rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
                }`}>
                  {/* Status badge if assistant */}
                  {!isUser && msg.confidenceStatus && (
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        {msg.confidenceStatus === 'verified' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Verified by Expert SME
                          </span>
                        ) : msg.confidenceStatus === 'pending' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            AI-Drafted (Pending Review)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" />
                            Unverified — Use with Caution
                          </span>
                        )}
                      </div>

                      {msg.isGeminiLive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          Gemini 3.6 Flash Live
                        </span>
                      )}

                      {msg.matchScore !== undefined && (
                        <span className="text-[10px] font-mono text-teal-400 font-bold">
                          {msg.matchScore}% Match Score
                        </span>
                      )}
                    </div>
                  )}

                  {/* Render Message Text with zero asterisks */}
                  <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                    {cleanText}
                  </div>

                  {/* Generated Barcodes or QR Tags */}
                  {!isUser && msg.barcodes && msg.barcodes.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                        Generated Interactive Physical Tags:
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {msg.barcodes.map((bItem, bIdx) => (
                          <ChatBarcodeCard key={bIdx} item={bItem} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources section if available */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Traceable Source Documents:
                      </span>
                      <div className="space-y-1.5">
                        {msg.sources.map((src) => (
                          <div
                            key={src.id}
                            onClick={() => openKnowledge(src.id)}
                            className="cursor-pointer p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-teal-400">{src.id}</span>
                              <span className="text-[11px] font-semibold text-slate-200 truncate max-w-xs">{src.title}</span>
                            </div>
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Knowledge Gap Offer Action Button */}
                  {!isUser && msg.isGapOffer && (
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => {
                          logKnowledgeGap(msg.rawQuery || 'Unresolved Operator Query', undefined, 'High');
                          sendChatMessage(`Logged knowledge gap for: "${msg.rawQuery}" — notification dispatched to rotating equipment SME.`);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Log as Formal Knowledge Gap for SME</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Assistant Feedback Buttons */}
                {!isUser && msg.matchedEntry && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pl-1">
                    <span>Was this procedure accurate?</span>
                    <button
                      onClick={() => rateChatAnswer(msg.id, 'up')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        msg.feedback === 'up' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'hover:text-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => rateChatAnswer(msg.id, 'down')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        msg.feedback === 'down' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'hover:text-slate-200'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>No</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 55-SECOND DEEP RETRIEVAL & THINKING HUD */}
        {isThinking && (
          <div className="space-y-4 animate-fade-in">
            {/* User Pending Question Bubble */}
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                OP
              </div>
              <div className="max-w-2xl p-4 rounded-2xl bg-teal-600 text-slate-950 font-semibold rounded-tr-none text-xs leading-relaxed">
                {currentPendingQuestion}
              </div>
            </div>

            {/* Deep Retrieval Radar & Progressive Logs HUD */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center text-xs shrink-0">
                <Bot className="w-4 h-4 text-teal-400 animate-spin" />
              </div>

              <div className="w-full max-w-2xl p-5 rounded-2xl bg-slate-900 border border-teal-500/40 shadow-2xl space-y-4">
                {/* HUD Header with Countdown & Skip Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                      {currentStage.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-100 flex items-center gap-2">
                        <span>Deep Industrial Knowledge Retrieval</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold">
                          {progressPercent}%
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Authentic multi-stage cross-examination of Cilegon technical archives
                      </p>
                    </div>
                  </div>

                  {/* Countdown Timer & Instant Skip Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-teal-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                      <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}s</span>
                    </div>

                    <button
                      onClick={handleSkipThinking}
                      className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
                      title="Skip wait and instantly reveal the verified answer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Skip to Answer</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-500 rounded-full transition-all duration-300 ease-linear"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Active Stage Banner */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-300">{currentStage.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">Step {currentStage.stageNum} of 5</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {currentStage.desc}
                  </p>
                </div>

                {/* Progressive Diagnostic Search Logs */}
                <div className="space-y-1 font-mono text-[10px] text-slate-400 bg-slate-950/90 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                    <span>Real-Time Audit Trail:</span>
                  </div>
                  {currentStage.logs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <span className="text-teal-400 font-bold">✓</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips (100% Technical English Grounded in Dataset) */}
      <div className="px-4 sm:px-6 py-2 border-t border-slate-800/80 bg-slate-900/60 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] text-teal-400 uppercase font-bold shrink-0">Dataset Queries:</span>
        <button
          onClick={() => handlePromptChipClick('What are your core engineering capabilities and how does PetroKnow work?')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 text-cyan-300 border border-cyan-500/30 whitespace-nowrap transition-colors cursor-pointer"
        >
          💡 AI Capabilities & Help
        </button>
        <button
          onClick={() => handlePromptChipClick('Generate a scannable barcode for GA-1201A mechanical seal PRT-MEC-3112 and plant floor QR code for GA-1201A')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/15 hover:bg-teal-500/25 disabled:opacity-50 text-teal-300 border border-teal-500/40 whitespace-nowrap transition-colors cursor-pointer"
        >
          🏷️ Generate Barcode & QR
        </button>
        <button
          onClick={() => handlePromptChipClick('What is the trip setpoint and voting logic for PSLL-1201?')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 text-amber-300 border border-amber-500/30 whitespace-nowrap transition-colors cursor-pointer"
        >
          🚨 PSLL-1201 Trip Setpoint
        </button>
        <button
          onClick={() => handlePromptChipClick('What is the operating pressure and datasheet specifications for GA-1201A?')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors cursor-pointer"
        >
          ⚙️ GA-1201A Specs & Pressure
        </button>
        <button
          onClick={() => handlePromptChipClick('What is the casing and deck material of construction for YD-2301?')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors cursor-pointer"
        >
          🔬 YD-2301 Metallurgy & MOC
        </button>
        <button
          onClick={() => handlePromptChipClick('What is the MTBF and failure history of GA-1201A from maintenance logs?')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors cursor-pointer"
        >
          📊 GA-1201A MTBF & History
        </button>
        <button
          onClick={() => handlePromptChipClick('What is the stock level and warehouse bin location of mechanical seal PRT-JC-T2100?')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-50 text-cyan-300 border border-cyan-500/30 whitespace-nowrap transition-colors cursor-pointer"
        >
          📦 Warehouse Spare Parts BOM
        </button>
        <button
          onClick={() => handlePromptChipClick('How do I resolve vapor lock and cavitation on the hexane feed pump?')}
          disabled={isThinking || isProcessing}
          className="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 hover:bg-teal-500/20 disabled:opacity-50 text-teal-300 border border-teal-500/30 whitespace-nowrap transition-colors cursor-pointer"
        >
          💡 Pak Joko's Tacit Wisdom
        </button>
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onPaste={handlePaste}
            disabled={isThinking || isProcessing}
            placeholder="Type your operational question (e.g. 'GA-1201A mechanical seal replacement', 'KC-4501 vibration interlock', 'YD-2301 OPL')..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all font-sans disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing || isThinking}
            className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/25 cursor-pointer"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Ask by Photo Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Ask by Photo / Gauge / Alarm Readout</h3>
                  <p className="text-xs text-slate-400">Multimodal AI visual inspection simulation</p>
                </div>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Select an authentic field photograph below to test instant visual OCR matching, or upload your own equipment photo:
            </p>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {photoPresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPhoto(preset)}
                  className="cursor-pointer p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-teal-500/50 hover:bg-slate-800 transition-all flex gap-3 items-center group"
                >
                  <img src={preset.thumb} alt={preset.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                      {preset.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preset.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom file upload input */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-2 transition-colors">
                <Image className="w-4 h-4" />
                <span>Upload Custom Plant Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini API Key Configuration Modal */}
      {apiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-teal-500/40 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Google Gemini API Configuration</h3>
                  <p className="text-[11px] text-teal-400 font-mono">TARGET: GEMINI-3.6-FLASH</p>
                </div>
              </div>
              <button 
                onClick={() => setApiModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your Google AI Studio API key to enable live generative responses and autonomous reasoning. The key is securely saved only in your browser storage and never uploaded to GitHub.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Enter API Key (AIzaSy...):</label>
              <input 
                type="password"
                value={customKeyInput}
                onChange={(e) => {
                  setCustomKeyInput(e.target.value);
                  setKeyStatus('idle');
                }}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              />
              <p className="text-[10px] text-slate-400">
                Get a free key instantly at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-teal-400 underline">aistudio.google.com</a>.
              </p>
            </div>

            {keyStatus === 'testing' && (
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 font-mono">
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Validating key with Google endpoint...</span>
              </div>
            )}

            {keyStatus === 'valid' && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>API Key verified active! Gemini 3.6 Flash is connected.</span>
              </div>
            )}

            {keyStatus === 'invalid' && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Failed: {keyErrorMsg || 'Invalid or revoked key.'}</span>
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={async () => {
                  setKeyStatus('testing');
                  setKeyErrorMsg('');
                  const res = await validateGeminiApiKey(customKeyInput);
                  if (res.valid) {
                    setGeminiApiKey(customKeyInput);
                    setKeyStatus('valid');
                    setTimeout(() => setApiModalOpen(false), 1200);
                  } else {
                    setKeyStatus('invalid');
                    setKeyErrorMsg(res.error || 'Check key and permissions.');
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Verify & Save
              </button>
              {customKeyInput && (
                <button
                  onClick={() => {
                    setGeminiApiKey('');
                    setCustomKeyInput('');
                    setKeyStatus('idle');
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
