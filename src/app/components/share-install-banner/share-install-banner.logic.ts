/** Web share-link dictation view. */
export function showShareInstallBanner(isApp: boolean, url: string | null | undefined): boolean {
  if (isApp || typeof url !== 'string') {
    return false;
  }
  return url.split(/[?#]/)[0].startsWith('/link/dictation-view');
}
