import {Injectable} from '@angular/core';
import {Share} from '@capacitor/share';

import {Dictation} from '../entity/dictation';

type QrCodeModule = typeof import('qrcode');

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  dictationShareUrl(dictation: Dictation): string {
    return `https://www.funfunspell.com/link/dictation-view/${dictation.id}`;
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
    await Share.share({
      title: this.shareTitle(dictation),
      url: this.dictationShareUrl(dictation),
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

  saveQrPng(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
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
