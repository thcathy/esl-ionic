import {Injectable} from '@angular/core';
import {Capacitor} from '@capacitor/core';
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

  saveQrPng(dataUrl: string, filename: string): boolean {
    if (!dataUrl || !filename) {
      return false;
    }
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
    return !Capacitor.isNativePlatform();
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
