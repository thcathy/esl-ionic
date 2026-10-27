import {showShareInstallBanner} from './share-install-banner.logic';

describe('showShareInstallBanner', () => {
  const cases: {isApp: boolean; url: string | null | undefined; show: boolean}[] = [
    {isApp: false, url: '/link/dictation-view/1', show: true},
    {isApp: false, url: '/link/dictation-view/1?ref=share', show: true},
    {isApp: false, url: '/link/dictation-view/1#top', show: true},
    {isApp: false, url: '/link/dictation-view', show: true},
    {isApp: false, url: '/dictation-view/1', show: false},
    {isApp: false, url: '/dictation-view/1?from=link', show: false},
    {isApp: true, url: '/link/dictation-view/1', show: false},
    {isApp: true, url: '/dictation-view/1', show: false},
    {isApp: false, url: '/home', show: false},
    {isApp: false, url: '', show: false},
    {isApp: false, url: null, show: false},
    {isApp: false, url: undefined, show: false},
  ];

  for (const item of cases) {
    const label = `isApp=${item.isApp} url=${String(item.url)}`;
    it(`${label} → ${item.show}`, () => {
      expect(showShareInstallBanner(item.isApp, item.url)).toBe(item.show);
    });
  }
});
