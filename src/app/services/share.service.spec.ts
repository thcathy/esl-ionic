import {TestBed} from '@angular/core/testing';
import {Capacitor} from '@capacitor/core';

import {Dictation} from '../entity/dictation';
import {ShareService} from './share.service';

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

  it('downloads the QR png through an anchor', () => {
    const link = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(link);
    spyOn(link, 'click');
    spyOn(document.body, 'appendChild').and.returnValue(link);
    spyOn(link, 'remove');

    expect(service.saveQrPng('data:image/png;base64,abc', 'funfunspell-dictation-42.png')).toBeTrue();

    expect(link.href).toContain('data:image/png;base64,abc');
    expect(link.download).toBe('funfunspell-dictation-42.png');
    expect(link.click).toHaveBeenCalled();
    expect(link.remove).toHaveBeenCalled();
  });

  it('does not treat a native webview click as a completed download', () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    const link = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(link);
    spyOn(link, 'click');
    spyOn(document.body, 'appendChild').and.returnValue(link);
    spyOn(link, 'remove');

    expect(service.saveQrPng('data:image/png;base64,abc', 'funfunspell-dictation-42.png')).toBeFalse();
    expect(link.click).toHaveBeenCalled();
  });

  it('does not start a download without a file', () => {
    spyOn(document, 'createElement');
    expect(service.saveQrPng('', 'funfunspell-dictation-42.png')).toBeFalse();
    expect(document.createElement).not.toHaveBeenCalled();
  });
});

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
