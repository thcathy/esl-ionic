import {TestBed} from '@angular/core/testing';
import {Capacitor} from '@capacitor/core';
import {Directory} from '@capacitor/filesystem';
import {FilesystemWeb} from '@capacitor/filesystem/dist/esm/web';
import {ShareWeb} from '@capacitor/share/dist/esm/web';

import {Dictation} from '../entity/dictation';
import {ShareService, wrapCanvasText} from './share.service';

describe('ShareService', () => {
  let service: ShareService;
  const dictation = {id: 42, title: 'Apple'} as Dictation;
  const shareUrl = 'https://www.funfunspell.com/link/dictation-view/42';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareService);
  });

  it('keeps the canonical dictation link', () => {
    expect(service.dictationShareUrl(dictation)).toBe(shareUrl);
    expect(service.shareTitle(dictation)).toBe('Share FunFunSpell Dictation - Apple');
  });

  it('does not build a link when the dictation id is missing', () => {
    expect(service.dictationShareUrl(undefined)).toBeNull();
    expect(service.dictationShareUrl({title: 'Apple'} as Dictation)).toBeNull();
    expect(service.dictationShareUrl({id: -3, title: 'Apple'} as Dictation)).toBeNull();
  });

  it('does not open system share without a public id', async () => {
    const share = jasmine.createSpy('share').and.resolveTo(undefined);
    await withNavigatorShare(share, async () => {
      await expectAsync(service.nativeShare({title: 'Apple'} as Dictation)).toBeRejected();
      expect(share).not.toHaveBeenCalled();
    });
  });

  it('shares the canonical dictation link without extra text', async () => {
    const share = jasmine.createSpy('share').and.resolveTo(undefined);
    await withNavigatorShare(share, async () => {
      await service.nativeShare(dictation);
      expect(share).toHaveBeenCalledOnceWith({
        title: 'Share FunFunSpell Dictation - Apple',
        text: undefined,
        url: shareUrl,
      });
    });
  });

  it('copies the exact share url', async () => {
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    const previous = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText},
    });
    try {
      await service.copyLink(shareUrl);
      expect(writeText).toHaveBeenCalledOnceWith(shareUrl);
    } finally {
      Object.defineProperty(navigator, 'clipboard', {configurable: true, value: previous});
    }
  });

  it('reports system share only when the platform can share', async () => {
    await withNavigatorShare(undefined, async () => {
      await expectAsync(service.canUseSystemShare()).toBeResolvedTo(false);
    });
    await withNavigatorShare(jasmine.createSpy('share').and.resolveTo(undefined), async () => {
      await expectAsync(service.canUseSystemShare()).toBeResolvedTo(true);
    });
    await withThrowingNavigatorShare(async () => {
      await expectAsync(service.canUseSystemShare()).toBeResolvedTo(false);
    });
  });

  it('builds a png data url for the link', async () => {
    const dataUrl = await service.qrDataUrl(shareUrl, 128);
    expect(dataUrl.startsWith('data:image/png;base64,')).toBeTrue();
    expect(dataUrl.length).toBeGreaterThan(100);
  });

  it('draws the dictation name under the QR on the saved image', async () => {
    const card = await service.qrCardDataUrl(shareUrl, 'Apple', 280);
    const size = await pngSize(card);
    expect(card.startsWith('data:image/png;base64,')).toBeTrue();
    expect(size.width).toBe(280 + 96);
    expect(size.height).toBeGreaterThan(280 + 96);
    expect(await darkPixelsBelowQr(card, 280)).toBeGreaterThan(20);
    expect(await colorfulPixels(card)).toBeGreaterThan(20);
  });

  it('leaves a blank name as the QR itself', async () => {
    const qr = await service.qrDataUrl(shareUrl, 128);
    const card = await service.qrCardDataUrl(shareUrl, '   ', 128);
    expect(card).toBe(qr);
  });

  it('wraps a long dictation name and keeps an ellipsis on the last line', () => {
    const width = (value: string) => value.length * 10;
    expect(wrapCanvasText('Apple', 100, 3, width)).toEqual(['Apple']);
    expect(wrapCanvasText('One two three four', 80, 2, width)).toEqual(['One two', 'three f…']);
    expect(wrapCanvasText('生字練習很長的標題', 40, 2, width)).toEqual(['生字練習', '很長的…']);
  });

  it('downloads the QR png through an anchor', async () => {
    const link = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(link);
    spyOn(link, 'click');
    spyOn(document.body, 'appendChild').and.returnValue(link);
    spyOn(link, 'remove');

    await expectAsync(service.saveQrPng('data:image/png;base64,abc', 'funfunspell-dictation-42.png')).toBeResolvedTo(true);

    expect(link.href).toContain('data:image/png;base64,abc');
    expect(link.download).toBe('funfunspell-dictation-42.png');
    expect(link.click).toHaveBeenCalled();
    expect(link.remove).toHaveBeenCalled();
  });

  it('writes the QR on a device and opens the share sheet', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    spyOn(document, 'createElement');
    const fileUri = 'file:///cache/funfunspell-dictation-42.png';
    const writeFile = spyOn(FilesystemWeb.prototype, 'writeFile').and.resolveTo({uri: fileUri});
    const share = spyOn(ShareWeb.prototype, 'share').and.resolveTo({});

    await expectAsync(service.saveQrPng('data:image/png;base64,abc', 'funfunspell-dictation-42.png')).toBeResolvedTo(true);

    expect(document.createElement).not.toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalledOnceWith({
      path: 'funfunspell-dictation-42.png',
      data: 'abc',
      directory: Directory.Cache,
    });
    expect(share).toHaveBeenCalledOnceWith({
      title: 'funfunspell-dictation-42.png',
      files: [fileUri],
    });
  });

  it('does not record a device save when the share sheet is canceled', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    spyOn(FilesystemWeb.prototype, 'writeFile').and.resolveTo({uri: 'file:///cache/funfunspell-dictation-42.png'});
    const share = spyOn(ShareWeb.prototype, 'share').and.rejectWith(new Error('Share canceled'));

    await expectAsync(service.saveQrPng('data:image/png;base64,abc', 'funfunspell-dictation-42.png')).toBeResolvedTo(false);
    expect(share).toHaveBeenCalled();
  });

  it('does not start a download without a file', async () => {
    spyOn(document, 'createElement');
    await expectAsync(service.saveQrPng('', 'funfunspell-dictation-42.png')).toBeResolvedTo(false);
    expect(document.createElement).not.toHaveBeenCalled();
  });
});

function pngSize(dataUrl: string): Promise<{width: number; height: number}> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({width: image.naturalWidth, height: image.naturalHeight});
    image.onerror = () => reject(new Error('png unavailable'));
    image.src = dataUrl;
  });
}

async function darkPixelsBelowQr(dataUrl: string, qrSize: number): Promise<number> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const loaded = new Image();
    loaded.onload = () => resolve(loaded);
    loaded.onerror = () => reject(new Error('png unavailable'));
    loaded.src = dataUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return 0;
  }
  ctx.drawImage(image, 0, 0);
  const top = 48 + qrSize + 28;
  const band = ctx.getImageData(0, top, canvas.width, Math.max(1, canvas.height - top));
  let dark = 0;
  for (let index = 0; index < band.data.length; index += 4) {
    if (band.data[index] < 250 || band.data[index + 1] < 250 || band.data[index + 2] < 250) {
      dark += 1;
    }
  }
  return dark;
}

async function colorfulPixels(dataUrl: string): Promise<number> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const loaded = new Image();
    loaded.onload = () => resolve(loaded);
    loaded.onerror = () => reject(new Error('png unavailable'));
    loaded.src = dataUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return 0;
  }
  ctx.drawImage(image, 0, 0);
  const band = ctx.getImageData(0, Math.floor(canvas.height * 0.8), canvas.width, Math.ceil(canvas.height * 0.2));
  let colorful = 0;
  for (let index = 0; index < band.data.length; index += 4) {
    const red = band.data[index];
    const green = band.data[index + 1];
    const blue = band.data[index + 2];
    if (Math.abs(red - green) > 25 || Math.abs(green - blue) > 25 || Math.abs(red - blue) > 25) {
      colorful += 1;
    }
  }
  return colorful;
}

async function withNavigatorShare<T>(share: unknown, run: () => Promise<T>): Promise<T> {
  const previous = navigator.share;
  Object.defineProperty(navigator, 'share', {configurable: true, value: share});
  try {
    return await run();
  } finally {
    Object.defineProperty(navigator, 'share', {configurable: true, value: previous});
  }
}

async function withThrowingNavigatorShare(run: () => Promise<void>): Promise<void> {
  const previous = navigator.share;
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    get() {
      throw new Error('unavailable');
    },
  });
  try {
    await run();
  } finally {
    Object.defineProperty(navigator, 'share', {configurable: true, value: previous});
  }
}
