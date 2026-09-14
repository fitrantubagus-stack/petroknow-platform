import { EquipmentNode, SparePart, DocumentItem, KnowledgeEntry } from '../types';

export interface GeneratedBarcodeItem {
  code: string;
  label: string;
  type: 'barcode' | 'qr';
}

export interface GeminiResponse {
  text: string;
  barcodes: GeneratedBarcodeItem[];
  sources?: string[];
  isGreetingOrHelp?: boolean;
}

const DEFAULT_GEMINI_KEY = 'AIzaSyABCrKuJYPQM93mcrgYa-jWPUsjjUnDO74';

export const getGeminiApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('petroknow_gemini_api_key');
    if (saved && saved.trim()) return saved.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) return envKey.trim();
  return DEFAULT_GEMINI_KEY;
};

export const setGeminiApiKey = (key: string) => {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('petroknow_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('petroknow_gemini_api_key');
    }
  }
};

const SYSTEM_INSTRUCTION = `You are PetroKnow AI, the official Autonomous Industrial Manufacturing Knowledge Assistant for PT Chandra Asri Pacific Tbk (Cilegon Petrochemical Complex), built for the CALIBER 2026 Innovation Challenge (Case 1: Manufacturing Knowledge Hub).

CORE MANDATES:
1. LANGUAGE: ALWAYS respond in professional, concise technical English using standard international engineering terminology (API 610, TEMA BEM, ASME Sec VIII, IEC 61508/61511, ISO 14224). Even if the user greets or asks in Indonesian, respond politely in professional technical English.
2. NO ASTERISKS: NEVER output markdown asterisks ("*" or "**"). Do NOT use asterisks for bolding, italics, or list items. Instead, use clean bullet points ("•"), uppercase headers, numbers, and clean spacing.
3. GROUNDING IN CHANDRA ASRI PLANT DATA: Ground all technical answers in the plant's official 8 equipment units and AFC documentation:
   • GA-1201A: API 610 OH2 Hexane Feed Pump (Casing: Carbon Steel, Seal Flush Plan 11, Trip: PSLL-1201 < 0.5 barg, P&ID: TJC-LLD-P-PID-0101, Datasheet: TJC-LLD-M-DS-GA-1201A Rev 3).
   • YD-2301: Rotary Polymer Fluid Bed Dryer (Kadant rotary steam joint, Trip: TSHH-2301 > 95°C, P&ID: TJC-LLD-P-PID-0201).
   • DC-3401A: Catalyst Reduction Reactor / Degassing Purge Column (Trip: PDSHH-3401 > 0.45 bar, P&ID: TJC-LLD-P-PID-0301).
   • KC-4501: Recycle Gas 2-Stage Reciprocating Compressor (Trip: VSHH-4501 > 12.0 mm/s 2oo3 voting logic, P&ID: TJC-LLD-P-PID-0401).
   • EA-5601: Solvent Heater (TEMA BEM Shell and Tube Exchanger, High DP: 1.8 bar, P&ID: TJC-LLD-P-PID-0501).
   • LV-6701: Separator Level Control Angle Valve (Fisher DVC6200 positioner, Trip: LSLL-6701 < 10%, P&ID: TJC-LLD-P-PID-0601).
   • CT-7801: Cooling Tower Induced Draft Cell Fan (6-blade FRP, Trip: VSHH-7801 > 7.1 mm/s, P&ID: TJC-LLD-P-PID-0701).
   • FA-8901: Reflux Accumulator Horizontal Flare Knockout Drum (Trip: LSHH-8901 > 85%, P&ID: TJC-LLD-P-PID-0801).
4. BARCODE & QR GENERATION:
   If the user asks to generate, show, create, or send a barcode or QR code for ANY equipment or spare part (or when sharing a part number), output special directive tags anywhere in your response:
   • For equipment QR code: [GENERATE_QR: <equipmentCode>] e.g. [GENERATE_QR: GA-1201A]
   • For spare part barcode: [GENERATE_BARCODE: <partNumber>] e.g. [GENERATE_BARCODE: PRT-MEC-3112]
   The UI will automatically render the live, scannable interactive visual barcode/QR code card in the chat window.
5. GREETINGS & SELF-EXPLANATION:
   If the user says hello, hi, introduces themselves, or asks what you can do ("what can you do?", "kamu bisa apa?", "help"), respond warmly, elegantly, and concisely. Introduce yourself as PetroKnow AI and summarize the 6 main operational capabilities (Digital Twin telemetry, P&ID and SIS trip queries, Spare parts inventory check, Retiring veteran knowledge retrieval, Barcode generation, and Shift handover log). Provide actionable examples.`;

export async function askGemini(
  query: string,
  contextData?: {
    equipmentList?: EquipmentNode[];
    spareParts?: SparePart[];
    documents?: DocumentItem[];
    knowledgeEntries?: KnowledgeEntry[];
  }
): Promise<GeminiResponse> {
  const apiKey = getGeminiApiKey();

  // Primary model: gemini-3.6-flash, fallback: gemini-3.5-flash-lite
  const models = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];

  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contextSummary = contextData?.equipmentList
        ? `\nCURRENT PLANT REAL-TIME STATE:
Equipments Monitored: ${contextData.equipmentList.map(e => `${e.code} (${e.name}, Status: ${e.status}, Temp: ${e.temp}, Press: ${e.pressure})`).join('; ')}
Spare Parts Catalog: ${(contextData.spareParts || []).slice(0, 8).map(p => `${p.partNumber} (${p.name}, Stock: ${p.currentStock}, Bin: ${p.binLocation})`).join('; ')}`
        : '';

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_INSTRUCTION}${contextSummary}\n\nUSER INQUIRY:\n${query}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} returned error:`, errorText);
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) continue;

      // Clean asterisks completely
      const cleanedText = rawText.replace(/\*\*/g, '').replace(/\*/g, '');

      // Parse any [GENERATE_BARCODE: ...] or [GENERATE_QR: ...] tags
      const barcodes: GeneratedBarcodeItem[] = [];
      const qrRegex = /\[GENERATE_QR:\s*([^\]]+)\]/gi;
      let qrMatch;
      while ((qrMatch = qrRegex.exec(cleanedText)) !== null) {
        barcodes.push({
          code: qrMatch[1].trim(),
          label: `Plant Floor QR Tag • ${qrMatch[1].trim()}`,
          type: 'qr'
        });
      }

      const barcodeRegex = /\[GENERATE_BARCODE:\s*([^\]]+)\]/gi;
      let barcodeMatch;
      while ((barcodeMatch = barcodeRegex.exec(cleanedText)) !== null) {
        barcodes.push({
          code: barcodeMatch[1].trim(),
          label: `Warehouse Bin Barcode • ${barcodeMatch[1].trim()}`,
          type: 'barcode'
        });
      }

      // If user specifically asked for barcode or QR code but model forgot directive tag, auto-inject
      if (barcodes.length === 0 && /(barcode|qr\s*code|qr\s*tag)/i.test(query)) {
        if (/GA-1201A|pump/i.test(query)) {
          barcodes.push({ code: 'GA-1201A', label: 'Plant Floor QR Tag • GA-1201A', type: 'qr' });
          barcodes.push({ code: 'PRT-MEC-3112', label: 'Warehouse Bin Barcode • PRT-MEC-3112 (John Crane Seal)', type: 'barcode' });
        } else if (/KC-4501|compressor/i.test(query)) {
          barcodes.push({ code: 'KC-4501', label: 'Plant Floor QR Tag • KC-4501', type: 'qr' });
          barcodes.push({ code: 'PRT-VLV-4501', label: 'Warehouse Bin Barcode • PRT-VLV-4501 (Hoerbiger Plate Valve)', type: 'barcode' });
        } else if (/LV-6701|valve/i.test(query)) {
          barcodes.push({ code: 'LV-6701', label: 'Plant Floor QR Tag • LV-6701', type: 'qr' });
          barcodes.push({ code: 'PRT-POS-6701', label: 'Warehouse Bin Barcode • PRT-POS-6701 (DVC6200 Kit)', type: 'barcode' });
        } else {
          barcodes.push({ code: 'GA-1201A', label: 'Plant Floor QR Tag • GA-1201A', type: 'qr' });
        }
      }

      // Check if text has AFC sources
      const sources: string[] = [];
      if (/TJC-LLD|PID|API 610|TEMA|Datasheet/i.test(cleanedText)) {
        sources.push('PT Chandra Asri AFC Engineering Master Archives (Rev 3)');
        sources.push('IEC 61511 Safety Instrumented System Setpoint Matrix');
      }

      const isGreeting = /^(hi|hello|hey|halo|greetings|help|who are you|what can you do)/i.test(query.trim());

      return {
        text: cleanedText.replace(/\[GENERATE_(?:QR|BARCODE):\s*[^\]]+\]/gi, '').trim(),
        barcodes,
        sources: sources.length > 0 ? sources : undefined,
        isGreetingOrHelp: isGreeting
      };
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with ${model} failed:`, err);
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed.');
}
