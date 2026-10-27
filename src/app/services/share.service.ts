import {Injectable} from '@angular/core';
import {Capacitor} from '@capacitor/core';
import {Directory, Filesystem} from '@capacitor/filesystem';
import {Share} from '@capacitor/share';

import {Dictation} from '../entity/dictation';

type QrCodeModule = typeof import('qrcode');

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  dictationShareUrl(dictation: Dictation | null | undefined): string | null {
    const id = dictation?.id;
    if (typeof id !== 'number' || !Number.isFinite(id) || id < 0) {
      return null;
    }
    return `https://www.funfunspell.com/link/dictation-view/${id}`;
  }

  shareTitle(dictation: Dictation): string {
    return `Share FunFunSpell Dictation - ${dictation.title}`;
  }

  async canUseSystemShare(): Promise<boolean> {
    try {
      const result = await Share.canShare();
      return result.value === true;
    } catch {
      return false;
    }
  }

  async copyLink(url: string): Promise<void> {
    const writeText = navigator.clipboard?.writeText?.bind(navigator.clipboard);
    if (!writeText) {
      throw new Error('clipboard unavailable');
    }
    await writeText(url);
  }

  async nativeShare(dictation: Dictation): Promise<void> {
    const url = this.dictationShareUrl(dictation);
    if (!url) {
      throw new Error('dictation link unavailable');
    }
    await Share.share({
      title: this.shareTitle(dictation),
      url,
    });
  }

  async qrDataUrl(url: string, size = 280): Promise<string> {
    const qrcode = qrApi(await import('qrcode'));
    return qrcode.toDataURL(url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
  }

  async qrCardDataUrl(url: string, title: string, qrSize = 560): Promise<string> {
    const qr = await this.qrDataUrl(url, qrSize);
    const label = title.trim();
    if (!label) {
      return qr;
    }
    return drawQrCard(qr, label, qrSize);
  }

  async saveQrPng(dataUrl: string, filename: string): Promise<boolean> {
    if (!dataUrl || !filename) {
      return false;
    }
    try {
      if (Capacitor.isNativePlatform()) {
        await this.saveQrOnDevice(dataUrl, filename);
        return true;
      }
      return this.downloadQrPng(dataUrl, filename);
    } catch {
      return false;
    }
  }

  private downloadQrPng(dataUrl: string, filename: string): boolean {
    const link = document.createElement('a');
    if (!('download' in link)) {
      return false;
    }
    link.href = dataUrl;
    link.download = filename;
    try {
      document.body.appendChild(link);
      link.click();
    } catch {
      link.remove();
      return false;
    }
    link.remove();
    return true;
  }

  private async saveQrOnDevice(dataUrl: string, filename: string): Promise<void> {
    const data = pngBase64(dataUrl);
    if (!data) {
      throw new Error('qr png unavailable');
    }
    const written = await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Cache,
    });
    await Share.share({
      title: filename,
      files: [written.uri],
    });
  }
}

function pngBase64(dataUrl: string): string | null {
  const marker = 'base64,';
  const index = dataUrl.indexOf(marker);
  if (index < 0) {
    return null;
  }
  const data = dataUrl.slice(index + marker.length);
  return data.length > 0 ? data : null;
}

const CARD_PADDING = 48;
const CARD_GAP = 28;
const CARD_FONT = '600 36px sans-serif';
const CARD_LINE_HEIGHT = 48;
const CARD_MAX_LINES = 3;
const CARD_LOGO_GAP = 20;
const CARD_LOGO_HEIGHT_AT_560 = 72;
const WORDMARK_SRC = 'assets/img/logo_new.png';

export function wrapCanvasText(
  text: string,
  maxWidth: number,
  maxLines: number,
  measure: (value: string) => number,
): string[] {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
  const lines: string[] = [];
  let current = '';

  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (lines.length === maxLines - 1) {
      lines.push(ellipsize(candidate, maxWidth, measure));
      return lines;
    }
    if (current) {
      lines.push(current);
      current = '';
      index -= 1;
      continue;
    }
    const pieces = breakToken(word, maxWidth, measure);
    for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
      if (lines.length === maxLines - 1) {
        const tail = pieces.slice(pieceIndex).join('')
          + (index < words.length - 1 ? ` ${words.slice(index + 1).join(' ')}` : '');
        lines.push(ellipsize(tail, maxWidth, measure));
        return lines;
      }
      lines.push(pieces[pieceIndex]);
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, maxLines);
}

function breakToken(token: string, maxWidth: number, measure: (value: string) => number): string[] {
  const parts: string[] = [];
  let current = '';
  for (const char of Array.from(token)) {
    const next = current + char;
    if (current && measure(next) > maxWidth) {
      parts.push(current);
      current = char;
    } else {
      current = next;
    }
  }
  if (current) {
    parts.push(current);
  }
  return parts;
}

function ellipsize(value: string, maxWidth: number, measure: (value: string) => number): string {
  if (measure(value) <= maxWidth) {
    return value;
  }
  const ellipsis = '…';
  let end = Array.from(value).length;
  const chars = Array.from(value);
  while (end > 0 && measure(chars.slice(0, end).join('') + ellipsis) > maxWidth) {
    end -= 1;
  }
  return end === 0 ? ellipsis : chars.slice(0, end).join('') + ellipsis;
}

async function drawQrCard(qrDataUrl: string, title: string, qrSize: number): Promise<string> {
  const [image, wordmark] = await Promise.all([
    loadImage(qrDataUrl),
    loadImage(WORDMARK_SRC).catch(() => null),
  ]);
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) {
    return qrDataUrl;
  }
  measureCtx.font = CARD_FONT;
  const lines = wrapCanvasText(title, qrSize, CARD_MAX_LINES, (value) => measureCtx.measureText(value).width);
  if (lines.length === 0) {
    return qrDataUrl;
  }

  const logoHeight = wordmark ? Math.max(1, Math.round(qrSize * CARD_LOGO_HEIGHT_AT_560 / 560)) : 0;
  const logoGap = wordmark ? CARD_LOGO_GAP : 0;
  const canvas = document.createElement('canvas');
  canvas.width = qrSize + CARD_PADDING * 2;
  canvas.height = CARD_PADDING + qrSize + CARD_GAP + lines.length * CARD_LINE_HEIGHT + logoGap + logoHeight + CARD_PADDING;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return qrDataUrl;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, CARD_PADDING, CARD_PADDING, qrSize, qrSize);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = CARD_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const textTop = CARD_PADDING + qrSize + CARD_GAP;
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, textTop + index * CARD_LINE_HEIGHT);
  });
  if (wordmark && logoHeight > 0) {
    const logoWidth = Math.round(logoHeight * (wordmark.naturalWidth / wordmark.naturalHeight));
    const logoTop = textTop + lines.length * CARD_LINE_HEIGHT + logoGap;
    ctx.drawImage(wordmark, (canvas.width - logoWidth) / 2, logoTop, logoWidth, logoHeight);
  }
  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('qr image unavailable'));
    image.src = src;
  });
}

function qrApi(loaded: QrCodeModule): QrCodeModule {
  const module = loaded as QrCodeModule & {default?: QrCodeModule};
  if (typeof module.toDataURL === 'function') {
    return module;
  }
  if (module.default && typeof module.default.toDataURL === 'function') {
    return module.default;
  }
  throw new Error('qrcode unavailable');
}
