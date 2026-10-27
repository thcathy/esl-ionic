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
    const [image, logo] = await Promise.all([
      loadImage(qr),
      loadImage(SAVED_QR.logoSrc).catch(() => null),
    ]);
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    if (!measureCtx) {
      return qr;
    }
    measureCtx.font = SAVED_QR.font;
    const lines = wrapCanvasText(title, qrSize, SAVED_QR.maxLines, (value) => measureCtx.measureText(value).width);
    const logoHeight = logo ? Math.max(1, Math.round(qrSize * SAVED_QR.logoHeight / SAVED_QR.logoQrSize)) : 0;
    const logoGap = logo ? SAVED_QR.logoGap : 0;
    const canvas = document.createElement('canvas');
    canvas.width = qrSize + SAVED_QR.padding * 2;
    canvas.height = SAVED_QR.padding + qrSize + SAVED_QR.gap + lines.length * SAVED_QR.lineHeight + logoGap + logoHeight + SAVED_QR.padding;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return qr;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, SAVED_QR.padding, SAVED_QR.padding, qrSize, qrSize);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = SAVED_QR.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const textTop = SAVED_QR.padding + qrSize + SAVED_QR.gap;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, textTop + index * SAVED_QR.lineHeight);
    });
    if (logo && logoHeight > 0) {
      const logoWidth = Math.round(logoHeight * (logo.naturalWidth / logo.naturalHeight));
      const logoTop = textTop + lines.length * SAVED_QR.lineHeight + logoGap;
      ctx.drawImage(logo, (canvas.width - logoWidth) / 2, logoTop, logoWidth, logoHeight);
    }
    return canvas.toDataURL('image/png');
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

const SAVED_QR = {
  padding: 48,
  gap: 28,
  font: '600 36px sans-serif',
  lineHeight: 48,
  maxLines: 3,
  logoGap: 20,
  logoHeight: 72,
  logoQrSize: 560,
  logoSrc: 'assets/img/logo_new.png',
} as const;

type TextMeasure = (value: string) => number;

export function wrapCanvasText(
  text: string,
  maxWidth: number,
  maxLines: number,
  measure: TextMeasure,
): string[] {
  const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
  const lines: string[] = [];
  let current = '';
  let index = 0;

  while (index < words.length && lines.length < maxLines) {
    const step = appendWord(lines, current, words, index, maxWidth, maxLines, measure);
    if (step.done) {
      return lines;
    }
    current = step.current;
    index = step.index;
  }

  if (current.length > 0 && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

function appendWord(
  lines: string[],
  current: string,
  words: string[],
  index: number,
  maxWidth: number,
  maxLines: number,
  measure: TextMeasure,
): {done: boolean; current: string; index: number} {
  const candidate = current.length > 0 ? `${current} ${words[index]}` : words[index];
  if (measure(candidate) <= maxWidth) {
    return {done: false, current: candidate, index: index + 1};
  }
  if (lines.length === maxLines - 1) {
    lines.push(ellipsize(candidate, maxWidth, measure));
    return {done: true, current, index};
  }
  if (current.length > 0) {
    lines.push(current);
    return {done: false, current: '', index};
  }
  const next = index + 1;
  const done = placeBrokenWord(
    lines,
    breakToken(words[index], maxWidth, measure),
    words.slice(next),
    maxWidth,
    maxLines,
    measure,
  );
  return {done, current: '', index: next};
}

function placeBrokenWord(
  lines: string[],
  pieces: string[],
  pending: string[],
  maxWidth: number,
  maxLines: number,
  measure: TextMeasure,
): boolean {
  for (let index = 0; index < pieces.length; index++) {
    if (lines.length !== maxLines - 1) {
      lines.push(pieces[index]);
      continue;
    }
    const rest = pieces.slice(index).join('');
    const tail = pending.length > 0 ? `${rest} ${pending.join(' ')}` : rest;
    lines.push(ellipsize(tail, maxWidth, measure));
    return true;
  }
  return false;
}

function breakToken(token: string, maxWidth: number, measure: TextMeasure): string[] {
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

function ellipsize(value: string, maxWidth: number, measure: TextMeasure): string {
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
