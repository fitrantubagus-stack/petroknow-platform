import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { decodeBarcodeOrQrFromFile, generateQrCodeDataUrl, generateBarcodeDataUrl } from '../../utils/barcodeUtils';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { 
  QrCode, Barcode, FileText, Camera, Upload, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  RefreshCw, Layers, Download, Check, X, ShieldAlert 
} from 'lucide-react';

export const ScanCenterView: React.FC = () => {
  const { 
    equipmentList, spareParts, openEquipment, openSparePart, 
    addDocument, addKnowledgeEntry, currentUser, role 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'qr' | 'barcode' | 'ocr'>('qr');

  // Scanner states
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showStuckWarning, setShowStuckWarning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const zxingReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Initialize ZXing BrowserMultiFormatReader specifically optimized for 1D Code128 Barcodes
  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    zxingReaderRef.current = new BrowserMultiFormatReader(hints);

    return () => {
      if (zxingReaderRef.current) {
        try {
          zxingReaderRef.current.reset();
        } catch (_) {}
      }
    };
  }, []);

  // OCR Upload States
  const [ocrStep, setOcrStep] = useState<number>(0);
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [extractedTitle, setExtractedTitle] = useState('');
  const [extractedSituation, setExtractedSituation] = useState('');
  const [extractedContent, setExtractedContent] = useState('');
  const [extractedSteps, setExtractedSteps] = useState<string[]>([]);
  const [selectedEqId, setSelectedEqId] = useState<string>('EQ-CMP-204');
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

  // Audio feedback on successful QR / barcode decode
  const playBeep = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch crisp beep (A5)
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio feedback failed or not supported in this browser context:', e);
    }
  }, []);

  const processDecodedCode = useCallback((code: string) => {
    const trimmed = code.trim();
    // Check if matches equipment
    const eq = equipmentList.find(e => e.id.toLowerCase() === trimmed.toLowerCase() || e.code.toLowerCase() === trimmed.toLowerCase());
    if (eq) {
      setScanStatus(`Identified equipment: ${eq.code} (${eq.name})`);
      openEquipment(eq.id);
      return;
    }

    // Check if matches spare part
    const part = spareParts.find(p => p.partNumber.toLowerCase() === trimmed.toLowerCase());
    if (part) {
      setScanStatus(`Identified spare part: ${part.partNumber} (${part.name})`);
      openSparePart(part.partNumber);
      return;
    }

    setScanStatus(`Code "${trimmed}" is not recognized in current plant register.`);
  }, [equipmentList, spareParts, openEquipment, openSparePart]);

  // Clean stop for camera stream and scan loop
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setShowStuckWarning(false);
  }, []);

  // Clean up camera stream and animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Attach stream and run live decoding loop (jsQR for QR tab, ZXing BrowserMultiFormatReader for Barcode tab)
  useEffect(() => {
    if (!cameraActive) {
      setShowStuckWarning(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Reset stuck warning and start 6s countdown
    setShowStuckWarning(false);
    const stuckTimer = setTimeout(() => {
      setShowStuckWarning(true);
    }, 6000);

    const video = videoRef.current;
    const stream = streamRef.current;

    if (video && stream) {
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.play().catch(err => console.error('Video play error:', err));
    }

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      const currentVideo = videoRef.current;
      const canvas = canvasRef.current;

      if (currentVideo && canvas && currentVideo.readyState >= currentVideo.HAVE_CURRENT_DATA) {
        if (currentVideo.videoWidth > 0 && currentVideo.videoHeight > 0) {
          // Speed optimization: downscale offscreen canvas (max 640px width) maintaining aspect ratio
          const MAX_DECODE_WIDTH = 640;
          const scale = Math.min(1, MAX_DECODE_WIDTH / currentVideo.videoWidth);
          const targetWidth = Math.max(1, Math.round(currentVideo.videoWidth * scale));
          const targetHeight = Math.max(1, Math.round(currentVideo.videoHeight * scale));

          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            if (activeTab === 'barcode') {
              // Glare tolerance: grayscale + contrast normalization before ZXing decode
              ctx.filter = 'grayscale(1) contrast(1.4)';
              ctx.drawImage(currentVideo, 0, 0, targetWidth, targetHeight);
              ctx.filter = 'none';

              // 1D Linear Barcode Decoding via ZXing BrowserMultiFormatReader
              if (zxingReaderRef.current) {
                try {
                  const result = zxingReaderRef.current.decode(canvas);
                  if (result && result.getText() && result.getText().trim()) {
                    isScanning = false;
                    const decodedText = result.getText().trim();

                    // Audio beep & vibration feedback
                    playBeep();
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      try {
                        navigator.vibrate(100);
                      } catch (_) {}
                    }

                    // Stop camera, clear stuck warning, and process result
                    clearTimeout(stuckTimer);
                    setShowStuckWarning(false);
                    stopCamera();

                    // Process matched spare part or equipment
                    setScanStatus(`Decoded Barcode: ${decodedText}`);
                    processDecodedCode(decodedText);
                    return;
                  }
                } catch (_zxingErr) {
                  // Normal frame-by-frame NotFoundException when barcode is not yet aligned
                }
              }
            } else {
              // Glare tolerance: jsQR inversionAttempts='attemptBoth' for inverted/glare QR contrast
              ctx.filter = 'none';
              ctx.drawImage(currentVideo, 0, 0, targetWidth, targetHeight);
              const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
              const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth'
              });

              if (qrCode && qrCode.data && qrCode.data.trim()) {
                isScanning = false;
                const decodedText = qrCode.data.trim();

                // Audio beep & vibration feedback
                playBeep();
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  try {
                    navigator.vibrate(100);
                  } catch (_) {}
                }

                // Stop camera, clear stuck warning, and process result
                clearTimeout(stuckTimer);
                setShowStuckWarning(false);
                stopCamera();

                // Process matched equipment or part
                setScanStatus(`Decoded QR: ${decodedText}`);
                processDecodedCode(decodedText);
                return;
              }
            }
          }
        }
      }

      if (isScanning) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      clearTimeout(stuckTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [cameraActive, activeTab, playBeep, processDecodedCode, stopCamera]);

  // Camera start/stop toggle
  const toggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
      setScanStatus(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        streamRef.current = stream;
        setCameraActive(true);
        setScanStatus(
          activeTab === 'barcode'
            ? 'Camera active. Align 1D linear barcode horizontally inside viewfinder...'
            : 'Camera active. Align QR code inside viewfinder...'
        );
      } catch (err) {
        console.error('Camera access error:', err);
        setScanStatus('Camera access not granted or unavailable. Use file upload or test presets below.');
      }
    }
  };

  // Switch tab safely
  const handleTabChange = (tab: 'qr' | 'barcode' | 'ocr') => {
    if (cameraActive) {
      stopCamera();
    }
    setActiveTab(tab);
    setScanStatus(null);
  };

  // Handle uploaded file for QR / Barcode
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecoding(true);
    setScanStatus('Decoding image matrix...');

    const decoded = await decodeBarcodeOrQrFromFile(file);
    setIsDecoding(false);

    if (decoded) {
      playBeep();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(100); } catch (_) {}
      }
      setScanStatus(`Decoded (${decoded.type}): ${decoded.code}`);
      processDecodedCode(decoded.code);
    } else {
      // Fallback filename inspect for demo friendliness
      const fname = file.name.toUpperCase();
      const matchedEq = equipmentList.find(eq => fname.includes(eq.code) || fname.includes(eq.id));
      const matchedPart = spareParts.find(p => fname.includes(p.partNumber));

      if (matchedEq) {
        setScanStatus(`Identified equipment: ${matchedEq.code}`);
        openEquipment(matchedEq.id);
      } else if (matchedPart) {
        setScanStatus(`Identified spare part: ${matchedPart.partNumber}`);
        openSparePart(matchedPart.partNumber);
      } else {
        setScanStatus('No barcode/QR matrix found in image. Please use one of the guaranteed test presets below.');
      }
    }
  };

  // OCR ingestion simulation
  const handleOcrFileSelect = (file: File) => {
    setOcrFile(file);
    setOcrStep(1);
    setOcrSuccessMsg(null);

    // Step 1: Uploading & Preprocessing
    setTimeout(() => {
      setOcrStep(2);
      // Step 2: Running OCR extraction
      setTimeout(() => {
        setOcrStep(3);
        // Step 3: Structuring text & AI summary
        setTimeout(() => {
          setOcrStep(4);
          // Populate extracted form
          setExtractedTitle(`Standard Operating Procedure: ${file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`);
          setExtractedSituation('Field maintenance and inspection protocol extracted from scanned technical documentation.');
          setExtractedSteps([
            'Verify line isolation and execute LOTO (Lockout/Tagout) protocol on primary breaker.',
            'Depressurize chamber to atmospheric pressure through bleed valve HV-204B.',
            'Perform thermographic inspection and check seal face tolerances with feeler gauge (limit < 0.05 mm).'
          ]);
          setExtractedContent(`DOCUMENT EXCERPT:\n- Technical reference standard: API-618\n- Inspection interval: 6 months or 4,000 running hours\n- Hazard classification: Class 1 Div 2\n- Mandatory PPE: Fire-resistant coveralls, impact goggles, H2S personal monitor.`);
        }, 800);
      }, 900);
    }, 700);
  };

  const handleOcrSubmit = () => {
    if (!extractedTitle.trim()) return;

    // Create Document record
    const newDoc = {
      title: extractedTitle,
      fileType: ocrFile?.name.endsWith('.pdf') ? 'PDF' : 'DOCX',
      fileSize: ocrFile ? `${(ocrFile.size / 1024).toFixed(1)} KB` : '1.4 MB',
      source: 'OCR Scan Ingestion' as const,
      extractedSnippet: extractedContent
    };

    const doc = addDocument(newDoc);

    // Create Knowledge Entry record
    addKnowledgeEntry({
      title: extractedTitle,
      category: 'SOP',
      situation: extractedSituation,
      content: extractedContent,
      keySteps: extractedSteps,
      author: currentUser.name,
      authorRole: currentUser.title,
      linkedEquipmentIds: [selectedEqId],
      linkedPartNumbers: [],
      tags: ['OCR_Ingested', 'SOP', 'Standardized'],
      isTacit: false,
      decayDaysThreshold: 180
    });

    setOcrSuccessMsg('Document successfully digitized, indexed in knowledge base, and queued for SME verification.');
    setOcrStep(0);
    setOcrFile(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in text-slate-100">
      {/* Hidden canvas for real-time video frame QR extraction */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-100">
            Physical Scan & Ingestion Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bridge physical plant hardware, spare parts, and paper documentation into the verified digital knowledge hub.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-full sm:w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => handleTabChange('qr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'qr'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Equipment QR Tags</span>
        </button>

        <button
          onClick={() => handleTabChange('barcode')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'barcode'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Spare Part Linear Barcodes</span>
        </button>

        <button
          onClick={() => handleTabChange('ocr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'ocr'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Document OCR Scanner</span>
        </button>
      </div>

      {/* TAB 1: EQUIPMENT QR SCANNER */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Camera / Scanner Viewfinder */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-slate-100">Equipment QR Tag Viewfinder</h3>
                </div>
                <button
                  onClick={toggleCamera}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    cameraActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
                </button>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    {showStuckWarning && (
                      <div className="absolute bottom-3 inset-x-3 z-10 flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs shadow-lg backdrop-blur animate-fade-in pointer-events-none">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Having trouble? Move closer, reduce glare, or ensure the full QR code is visible.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <QrCode className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 font-medium">Camera is in standby mode</p>
                    <p className="text-[11px] text-slate-500">Upload a photo tag or click any guaranteed plant preset below.</p>
                  </div>
                )}

                {/* Laser scan animation overlay */}
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-teal-400 shadow-[0_0_8px_#2dd4bf] animate-pulse pointer-events-none" />
              </div>

              {/* Upload Tag File */}
              <div className="flex items-center justify-between pt-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {scanStatus && (
                  <span className="text-xs font-mono text-teal-300 animate-fade-in">{scanStatus}</span>
                )}
              </div>
            </div>

            {/* Guaranteed Test Presets Grid */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Live Plant Equipment Presets (1-Click Test)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click any floor tag to simulate immediate optical QR decode:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {equipmentList.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => openEquipment(eq.id)}
                    className="cursor-pointer p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-bold text-teal-400">{eq.code}</span>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 line-clamp-1">{eq.name}</p>
                      <p className="text-[10px] text-slate-400">{eq.area}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPARE PART BARCODE SCANNER */}
      {activeTab === 'barcode' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Linear Barcode Scanner Viewfinder */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">1D Linear Barcode Scanner (Code128)</h3>
                </div>
                <button
                  onClick={toggleCamera}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    cameraActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
                </button>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    {/* On-screen alignment hint during live scan */}
                    <div className="absolute top-2.5 inset-x-3 flex justify-center pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur border border-cyan-500/40 text-[11px] text-cyan-200 font-medium shadow-md">
                        Align barcode horizontally to fill frame width
                      </span>
                    </div>
                    {showStuckWarning && (
                      <div className="absolute bottom-3 inset-x-3 z-10 flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs shadow-lg backdrop-blur animate-fade-in pointer-events-none">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Having trouble? Hold steady, align the barcode horizontally across the full width, and avoid reflections.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Barcode className="w-16 h-16 text-cyan-500/60 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">Warehouse Physical Parts Scanner</p>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Point camera at any 1D barcode or upload a tag image to view inventory stock levels.
                    </p>
                  </div>
                )}

                {/* Laser scan animation overlay */}
                <div className="absolute inset-x-8 top-1/2 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse pointer-events-none" />
              </div>

              {/* Upload Barcode Tag */}
              <div className="flex items-center justify-between pt-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Barcode Tag</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {scanStatus && (
                  <span className="text-xs font-mono text-cyan-300 animate-fade-in">{scanStatus}</span>
                )}
              </div>

              {/* 1D Barcode Alignment Guidance */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-950 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1D Barcode Scan Optimization Tips</span>
                </div>
                <ul className="space-y-1 text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Fill horizontal width:</strong> Center the barcode across the full laser line so individual Code128 bars are sharp.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Hold steady:</strong> Hold phone or label still for 1 second to eliminate motion blur.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span><strong className="text-slate-200">Ensure good lighting:</strong> Minimize shiny reflections or hot spots on glossy parts packaging.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Spare Parts Catalog List */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Registered Plant Spare Parts</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click any item to inspect stock, location, and linear barcode:</p>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {spareParts.map((part) => {
                  const isLow = part.currentStock <= part.minThreshold;
                  return (
                    <div
                      key={part.partNumber}
                      onClick={() => openSparePart(part.partNumber)}
                      className="cursor-pointer p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">{part.partNumber}</span>
                          {isLow && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Low Stock ({part.currentStock}/{part.minThreshold})
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">{part.name}</p>
                        <p className="text-[10px] text-slate-400">Bin: {part.binLocation} • Lead: {part.leadTimeDays}d</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT SCANNER & OCR INGESTION */}
      {activeTab === 'ocr' && (
        <div className="space-y-6">
          {ocrSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{ocrSuccessMsg}</span>
              </div>
              <button onClick={() => setOcrSuccessMsg(null)}>
                <X className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Upload Zone & OCR Progress */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Upload Paper SOP or Maintenance Record</h3>
                <p className="text-xs text-slate-400 mt-1">Accepts PDF manuals, maintenance logs, and scanned sheets.</p>
              </div>

              {/* Drag and drop dropzone */}
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-colors">
                <Upload className="w-10 h-10 text-indigo-400 mb-3" />
                <span className="text-xs font-bold text-slate-200">Click to upload document or drag & drop</span>
                <span className="text-[11px] text-slate-500 mt-1">PDF, DOCX, PNG, JPG (up to 25MB)</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleOcrFileSelect(f);
                  }}
                  className="hidden"
                />
              </label>

              {/* OCR Step Progress */}
              {ocrStep > 0 && ocrStep < 4 && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-300">OCR & NLP Ingestion Pipeline</span>
                    <span className="font-mono text-indigo-400 font-bold">{ocrStep * 25}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${ocrStep * 25}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {ocrStep === 1 && 'Uploading document & preprocessing image contrast...'}
                    {ocrStep === 2 && 'Executing optical character recognition across columns...'}
                    {ocrStep === 3 && 'Structuring technical SOP sections & cross-linking equipment...'}
                  </p>
                </div>
              )}
            </div>

            {/* Extracted Structured Form */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Digitized Knowledge Record</h3>
                </div>
                {ocrStep === 4 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    OCR Extracted
                  </span>
                )}
              </div>

              {ocrStep === 4 ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Procedure Title</label>
                    <input
                      type="text"
                      value={extractedTitle}
                      onChange={(e) => setExtractedTitle(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Target Equipment Node</label>
                    <select
                      value={selectedEqId}
                      onChange={(e) => setSelectedEqId(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {equipmentList.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.code} — {eq.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Operational Situation Context</label>
                    <textarea
                      rows={2}
                      value={extractedSituation}
                      onChange={(e) => setExtractedSituation(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Technical Content Excerpt</label>
                    <textarea
                      rows={4}
                      value={extractedContent}
                      onChange={(e) => setExtractedContent(e.target.value)}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setOcrStep(0)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleOcrSubmit}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ingest into Knowledge Base</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                  <FileText className="w-10 h-10 text-slate-700 mx-auto" />
                  <p>Upload a document on the left to view and edit digitized procedural fields.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
