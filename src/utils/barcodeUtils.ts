import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader } from '@zxing/library';

/**
 * Generates a real dataURL for an equipment QR code
 */
export async function generateQrCodeDataUrl(equipmentId: string): Promise<string> {
  try {
    return await QRCode.toDataURL(equipmentId, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}

/**
 * Renders a linear 1D barcode (Code128) onto a canvas or SVG element using JsBarcode
 */
export function renderLinearBarcode(element: HTMLCanvasElement | SVGElement, partNumber: string): void {
  try {
    JsBarcode(element, partNumber, {
      format: 'CODE128',
      lineColor: '#0f172a',
      width: 2,
      height: 70,
      displayValue: true,
      font: 'JetBrains Mono, monospace',
      fontSize: 14,
      textMargin: 6,
      margin: 10,
      background: '#ffffff'
    });
  } catch (err) {
    console.error('Failed to render barcode', err);
  }
}

/**
 * Generates a downloadable PNG data URL for a linear barcode
 */
export function generateBarcodeDataUrl(partNumber: string): string {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, partNumber, {
      format: 'CODE128',
      lineColor: '#0f172a',
      width: 2.5,
      height: 80,
      displayValue: true,
      font: 'JetBrains Mono, monospace',
      fontSize: 16,
      textMargin: 8,
      margin: 14,
      background: '#ffffff'
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate barcode data URL', err);
    return '';
  }
}

/**
 * Decodes a QR code from image element or raw canvas imageData using jsQR
 */
export function decodeQrFromImageData(imageData: ImageData): string | null {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });
    if (code && code.data) {
      return code.data.trim();
    }
  } catch (err) {
    console.error('jsQR decode error', err);
  }
  return null;
}

/**
 * Decodes a QR or 1D linear barcode from an uploaded image File using ZXing / jsQR
 */
export async function decodeBarcodeOrQrFromFile(file: File): Promise<{ code: string; type: 'QR' | 'BARCODE' } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 1. Try jsQR first for 2D QR codes
        const qrResult = decodeQrFromImageData(imageData);
        if (qrResult) {
          resolve({ code: qrResult, type: 'QR' });
          return;
        }

        // 2. Try ZXing MultiFormatReader for 1D barcodes and QR
        try {
          const zxingReader = new BrowserMultiFormatReader();
          const result = await zxingReader.decodeFromImageElement(img);
          if (result && result.getText()) {
            const formatName = result.getBarcodeFormat()?.toString() || '';
            const isQr = formatName.includes('QR') || formatName.includes('MATRIX');
            resolve({
              code: result.getText().trim(),
              type: isQr ? 'QR' : 'BARCODE'
            });
            return;
          }
        } catch {
          // ZXing failed to find barcode in this image
        }

        resolve(null);
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to download an image data URL as a file
 */
export function triggerDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
