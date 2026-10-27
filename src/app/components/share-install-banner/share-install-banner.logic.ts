export const SHARE_INSTALL_BANNER_DISMISS_KEY = 'ffs_share_install_banner_dismissed';

type KeyValueStore = {getItem(key: string): string | null};

/** Web share-link dictation view, and not dismissed for this tab session. */
export function showShareInstallBanner(
  isApp: boolean,
  url: string | null | undefined,
  dismissed: boolean,
): boolean {
  if (isApp || dismissed || typeof url !== 'string') {
    return false;
  }
  return url.split(/[?#]/)[0].startsWith('/link/dictation-view');
}

export function readShareInstallBannerDismissed(storage: KeyValueStore | null | undefined): boolean {
  if (!storage) {
    return false;
  }
  try {
    return storage.getItem(SHARE_INSTALL_BANNER_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}
