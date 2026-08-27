import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { decodeBarcodeOrQrFromFile } from '../../utils/barcodeUtils';
import { 
  Bot, Send, Image, ThumbsUp, ThumbsDown, Sparkles, 
  CheckCircle2, AlertTriangle, HelpCircle, ArrowUpRight, 
  RotateCcw, Camera, Flame, Gauge, X, ShieldAlert, WifiOff 
} from 'lucide-react';

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
  const [offlineToast, setOfflineToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isProcessing]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isProcessing) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setIsProcessing(true);

    try {
      await sendChatMessage(query);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePromptChipClick = (chipText: string) => {
    setInputQuery(chipText);
  };

  // Preset plant photos for "Ask by Photo"
  const photoPresets = [
    {
      id: 'photo-1',
      title: 'Compressor High Temp & Flutter Alarm',
      label: 'Compressor C-204 Stage 2 Discharge High Temp flutter alarm',
      thumb: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
      description: 'C-204 Stage 2 cylinder cap thermography readout showing 122°C with flutter code.'
    },
    {
      id: 'photo-2',
      title: 'Reactor Loop Skin Thermocouple High',
      label: 'Loop reactor catalyst injection rate adjustment grade transition',
      thumb: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=80',
      description: 'Catalytic reactor control console during polymer grade transition.'
    },
    {
      id: 'photo-3',
      title: 'Slurry Pump Plan 53B Barrier Fluid',
      label: 'Slurry pump mechanical seal Plan 53B barrier fluid reservoir low',
      thumb: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=300&auto=format&fit=crop&q=80',
      description: 'API Plan 53B seal fluid reservoir sight glass showing low barrier level.'
    },
    {
      id: 'photo-4',
      title: 'Cryogenic Tank Boil-Off Vapor Pressure',
      label: 'Cryogenic liquid ethylene storage tank boil-off gas BOG compressor',
      thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80',
      description: 'TK-501 pressure transmitter PT-501A reading 1.26 bar.'
    }
  ];

  const handleSelectPhoto = async (preset: typeof photoPresets[0]) => {
    setPhotoModalOpen(false);
    setPhotoLoading(true);
    setIsProcessing(true);

    // Simulate OCR text extraction & multimodal inspection
    await new Promise(res => setTimeout(res, 800));

    setPhotoLoading(false);
    await sendChatMessage(`[Analyzed Plant Photo: ${preset.title}]`, {
      url: preset.thumb,
      label: preset.label
    });
    setIsProcessing(false);
  };

  const processUploadedPhotoFile = async (file: File) => {
    setPhotoModalOpen(false);
    setIsProcessing(true);

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
          // Found real equipment
          const linkedKbs = knowledgeEntries.filter(k => 
            matchedEq.linkedKnowledgeIds.includes(k.id) || 
            k.linkedEquipmentIds.includes(matchedEq.id)
          );
          const linkedPartItems = spareParts.filter(p => 
            matchedEq.linkedPartNumbers.includes(p.partNumber) || 
            p.compatibleEquipmentIds.includes(matchedEq.id)
          );

          let responseText = `**Scanned Equipment Identified: ${matchedEq.name} (${matchedEq.code})**\n\n`;
          responseText += `• **Plant Area:** ${matchedEq.area}\n`;
          responseText += `• **Category:** ${matchedEq.category}\n`;
          responseText += `• **Operating Telemetry:** Temp: ${matchedEq.temp} | Pressure: ${matchedEq.pressure} | Flow Rate: ${matchedEq.flowRate}\n`;
          responseText += `• **Status:** ${matchedEq.status.toUpperCase()} (Last inspected: ${matchedEq.lastInspected})\n`;
          responseText += `• **Description:** ${matchedEq.description}\n\n`;

          responseText += `**Linked Standard Procedures & Tacit Wisdom:**\n`;
          if (linkedKbs.length > 0) {
            responseText += linkedKbs.map(k => `• [${k.id}] **${k.title}** (${k.category} — ${k.status.toUpperCase()})`).join('\n') + '\n\n';
          } else {
            responseText += `• No specific procedures currently linked to this tag.\n\n`;
          }

          responseText += `**Associated Spare Parts:**\n`;
          if (linkedPartItems.length > 0) {
            responseText += linkedPartItems.map(p => `• [${p.partNumber}] ${p.name} — Stock: **${p.currentStock} ${p.unit}** (Min: ${p.minThreshold})`).join('\n');
          } else {
            responseText += `• No spare parts listed for this unit.`;
          }

          await sendChatMessage(`[Uploaded Photo: Scanned ${decoded.type} "${cleanCode}"]`, {
            url: dataUrl,
            label: `${decoded.type} Code: ${matchedEq.code} (${matchedEq.name})`
          }, {
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
          });
          return;
        }

        if (matchedPart) {
          // Found real spare part
          const compatEqs = equipmentList.filter(eq => matchedPart.compatibleEquipmentIds.includes(eq.id));
          const relevantKbs = knowledgeEntries.filter(k => 
            k.linkedPartNumbers.includes(matchedPart.partNumber) || 
            matchedPart.compatibleEquipmentIds.some(eid => k.linkedEquipmentIds.includes(eid))
          );

          let responseText = `**Scanned Spare Part Identified: ${matchedPart.name} (${matchedPart.partNumber})**\n\n`;
          responseText += `• **Category:** ${matchedPart.category}\n`;
          responseText += `• **Stock Status:** **${matchedPart.currentStock} ${matchedPart.unit}** available (Min: ${matchedPart.minThreshold} ${matchedPart.unit}) ${matchedPart.currentStock <= matchedPart.minThreshold ? '⚠️ **[LOW STOCK ALERT]**' : '✅ [ADEQUATE STOCK]'}\n`;
          responseText += `• **Warehouse Location:** ${matchedPart.binLocation}\n`;
          responseText += `• **Unit Cost & Lead Time:** $${matchedPart.costUsd.toLocaleString()} USD | ${matchedPart.leadTimeDays} days lead time (Last restocked: ${matchedPart.lastRestocked})\n`;
          responseText += `• **Technical Specifications:** ${matchedPart.specifications}\n\n`;

          responseText += `**Compatible Plant Equipment:**\n`;
          if (compatEqs.length > 0) {
            responseText += compatEqs.map(eq => `• [${eq.code}] ${eq.name} (${eq.area})`).join('\n') + '\n\n';
          } else {
            responseText += `• Universal plant specification.\n\n`;
          }

          if (relevantKbs.length > 0) {
            responseText += `**Associated Operating Procedures:**\n` + relevantKbs.map(k => `• [${k.id}] **${k.title}** (${k.category})`).join('\n');
          }

          await sendChatMessage(`[Uploaded Photo: Scanned ${decoded.type} "${cleanCode}"]`, {
            url: dataUrl,
            label: `${decoded.type} Code: ${matchedPart.partNumber} (${matchedPart.name})`
          }, {
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
          });
          return;
        }

        // Code decoded successfully but not registered in system
        await sendChatMessage(`[Uploaded Photo: Scanned ${decoded.type} "${cleanCode}"]`, {
          url: dataUrl,
          label: `${decoded.type} Code: ${cleanCode}`
        }, {
          text: `I was able to read a ${decoded.type} code in this image ("${cleanCode}"), but it doesn't match any equipment or spare part on file in the PetroKnow system.`
        });
        return;
      }

      // No scannable QR/barcode detected in image -> Fallback to existing mock behavior
      await new Promise(res => setTimeout(res, 400));
      const label = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      await sendChatMessage(`[Analyzed Uploaded Image: ${file.name}]`, {
        url: dataUrl,
        label: `Operational analysis of ${label}`
      });
    } catch (err) {
      console.error('Error analyzing image upload:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedPhotoFile(file);
      // Reset input value so same file can be selected again if desired
      e.target.value = '';
    }
  };

  // Clipboard paste handler for screenshots
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

  // Drag and drop handlers
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
                Deterministic Search Grounded
              </span>
              {isOffline && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Mode</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Retrieves exact verified SOPs and expert tacit wisdom with clickable source traceability.
            </p>
          </div>
        </div>

        {/* Quick Photo Ask Button */}
        <button
          onClick={() => setPhotoModalOpen(true)}
          className="w-full sm:w-auto justify-center px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Camera className="w-3.5 h-3.5 text-teal-400" />
          <span>Ask by Photo / Gauge</span>
        </button>
      </div>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2.5 text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You're offline — standard procedure search and knowledge base are available from cache. Cloud AI generative lookups require an active internet connection.</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';

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
                    ? 'bg-teal-600 text-slate-950 font-medium rounded-tr-none'
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

                      {msg.matchScore !== undefined && (
                        <span className="text-[10px] font-mono text-teal-400 font-bold">
                          {msg.matchScore}% Match Score
                        </span>
                      )}
                    </div>
                  )}

                  {/* Render Message Text with markdown bullet support */}
                  <div className="whitespace-pre-wrap">
                    {msg.text}
                  </div>

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
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
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
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                        msg.feedback === 'up' ? 'bg-teal-500/20 text-teal-300 font-bold' : 'hover:text-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => rateChatAnswer(msg.id, 'down')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
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

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center text-xs shrink-0">
              <Bot className="w-4 h-4 animate-spin text-teal-400" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-teal-300 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Scanning verified knowledge base & matching SOP signatures...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 sm:px-6 py-2 border-t border-slate-800/80 bg-slate-900/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Suggested:</span>
        <button
          onClick={() => handlePromptChipClick('Reciprocating compressor C-204 valve flutter high temperature')}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors"
        >
          Compressor C-204 High Temp
        </button>
        <button
          onClick={() => handlePromptChipClick('Catalyst injection rate adjustment during loop reactor grade transition')}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors"
        >
          Loop Reactor Grade Transition
        </button>
        <button
          onClick={() => handlePromptChipClick('Cryogenic liquid ethylene storage tank boil-off gas BOG compressor balancing')}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors"
        >
          Cryogenic Tank BOG Balancing
        </button>
        <button
          onClick={() => handlePromptChipClick('Emergency thermal runaway quench procedure')}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors"
        >
          Emergency Reactor Quench
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
            placeholder="Type your operational question (e.g. 'How to handle high delta P on demethanizer', 'EQ-CMP-204 lube filter change')..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/25"
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
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
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
