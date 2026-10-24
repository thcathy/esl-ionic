const CRAWLER_UA_MARKERS = [
  'facebookexternalhit',
  'facebot',
  'whatsapp',
  'telegrambot',
  'twitterbot',
  'slackbot',
  'linkedinbot',
  'applebot',
  'discordbot',
] as const;

export function isCrawlerUserAgent(userAgent: string | undefined | null): boolean {
  if (!userAgent) {
    return false;
  }
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_MARKERS.some((marker) => ua.includes(marker));
}

export function dictationIdFromPath(path: string): string | null {
  const pathname = path.split('?')[0].split('#')[0];
  const match = pathname.match(/^\/link\/dictation-view\/(\d{1,19})\/?$/);
  return match?.[1] ?? null;
}
