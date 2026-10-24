import { dictationIdFromPath, isCrawlerUserAgent } from './crawler';
import {
  CRAWLER_CACHE_CONTROL,
  DICTATION_FETCH_TIMEOUT_MS,
  HTML_CONTENT_TYPE,
  SPA_CACHE_CONTROL,
  SPA_SHELL_FETCH_TIMEOUT_MS,
  SPA_SHELL_TTL_MS,
} from './config';
import { genericOgTags, ogTagsForPayload, renderOgHtml } from './og';

export interface ShellCache {
  body: string | null;
  fetchedAt: number;
}

export interface LinkRequest {
  userAgent: string | undefined;
  path: string;
}

export interface LinkDeps {
  fetchImpl: typeof fetch;
  eslRestBase: string;
  spaIndexUrl: string;
  now: () => number;
  shellCache: ShellCache;
}

export interface LinkResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export async function handleLinkRequest(request: LinkRequest, deps: LinkDeps): Promise<LinkResponse> {
  if (!isCrawlerUserAgent(request.userAgent)) {
    return spaShellResponse(deps);
  }

  const id = dictationIdFromPath(request.path);
  if (!id) {
    return crawlerHtml(renderOgHtml(genericOgTags()));
  }

  const payload = await fetchDictation(deps, id);
  return crawlerHtml(renderOgHtml(ogTagsForPayload(payload, id)));
}

async function fetchDictation(deps: LinkDeps, id: string): Promise<unknown> {
  const url = `${deps.eslRestBase.replace(/\/$/, '')}/dictation/get/${id}`;
  try {
    const response = await deps.fetchImpl(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(DICTATION_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    return JSON.parse(await response.text()) as unknown;
  } catch (err) {
    console.warn('linkDictationOg dictation fetch failed', id, err instanceof Error ? err.name : 'error');
    return null;
  }
}

async function spaShellResponse(deps: LinkDeps): Promise<LinkResponse> {
  try {
    const body = await loadSpaShell(deps);
    return {
      status: 200,
      headers: {
        'Content-Type': HTML_CONTENT_TYPE,
        'Cache-Control': SPA_CACHE_CONTROL,
        Vary: 'User-Agent',
      },
      body,
    };
  } catch (err) {
    console.warn('linkDictationOg spa shell unavailable', err instanceof Error ? err.name : 'error');
    return {
      status: 503,
      headers: {
        'Content-Type': HTML_CONTENT_TYPE,
        'Cache-Control': 'no-store',
        Vary: 'User-Agent',
      },
      body: '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>FunFunSpell</title></head><body><p>FunFunSpell is temporarily unavailable.</p></body></html>',
    };
  }
}

async function loadSpaShell(deps: LinkDeps): Promise<string> {
  const now = deps.now();
  const cache = deps.shellCache;
  if (cache.body !== null && now - cache.fetchedAt < SPA_SHELL_TTL_MS) {
    return cache.body;
  }
  try {
    const response = await deps.fetchImpl(deps.spaIndexUrl, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'FunFunSpellLinkOg/1.0',
      },
      signal: AbortSignal.timeout(SPA_SHELL_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      throw new Error(`SPA shell HTTP ${response.status}`);
    }
    const body = await response.text();
    if (!body.includes('<app-root')) {
      throw new Error('SPA shell missing app-root');
    }
    cache.body = body;
    cache.fetchedAt = now;
    return body;
  } catch (err) {
    if (cache.body !== null) {
      return cache.body;
    }
    throw err;
  }
}

function crawlerHtml(body: string): LinkResponse {
  return {
    status: 200,
    headers: {
      'Content-Type': HTML_CONTENT_TYPE,
      // Public CDN cache is keyed by URL. Vary on User-Agent so crawler HTML is not reused for browsers.
      'Cache-Control': CRAWLER_CACHE_CONTROL,
      Vary: 'User-Agent',
    },
    body,
  };
}
