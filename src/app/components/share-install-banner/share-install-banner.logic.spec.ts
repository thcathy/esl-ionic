import {
  readShareInstallBannerDismissed,
  SHARE_INSTALL_BANNER_DISMISS_KEY,
  showShareInstallBanner,
} from './share-install-banner.logic';

describe('showShareInstallBanner', () => {
  const cases: {isApp: boolean; url: string | null | undefined; dismissed: boolean; show: boolean}[] = [
    {isApp: false, url: '/link/dictation-view/1', dismissed: false, show: true},
    {isApp: false, url: '/link/dictation-view/1?ref=share', dismissed: false, show: true},
    {isApp: false, url: '/link/dictation-view/1#top', dismissed: false, show: true},
    {isApp: false, url: '/link/dictation-view', dismissed: false, show: true},
    {isApp: false, url: '/dictation-view/1', dismissed: false, show: false},
    {isApp: false, url: '/dictation-view/1?from=link', dismissed: false, show: false},
    {isApp: true, url: '/link/dictation-view/1', dismissed: false, show: false},
    {isApp: true, url: '/dictation-view/1', dismissed: false, show: false},
    {isApp: false, url: '/link/dictation-view/1', dismissed: true, show: false},
    {isApp: false, url: '/home', dismissed: false, show: false},
    {isApp: false, url: '', dismissed: false, show: false},
    {isApp: false, url: null, dismissed: false, show: false},
    {isApp: false, url: undefined, dismissed: false, show: false},
  ];

  for (const item of cases) {
    const label = `isApp=${item.isApp} url=${String(item.url)} dismissed=${item.dismissed}`;
    it(`${label} → ${item.show}`, () => {
      expect(showShareInstallBanner(item.isApp, item.url, item.dismissed)).toBe(item.show);
    });
  }

  it('reads the session dismiss flag', () => {
    const storage = new Map<string, string>();
    const store = {
      getItem: (key: string) => storage.get(key) ?? null,
    };
    expect(readShareInstallBannerDismissed(store)).toBeFalse();
    storage.set(SHARE_INSTALL_BANNER_DISMISS_KEY, '1');
    expect(readShareInstallBannerDismissed(store)).toBeTrue();
    expect(readShareInstallBannerDismissed(null)).toBeFalse();
    expect(readShareInstallBannerDismissed({
      getItem: () => {
        throw new Error('blocked');
      },
    })).toBeFalse();
  });
});
