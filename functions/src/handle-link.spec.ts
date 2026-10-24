import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SITE_IMAGE, SITE_TITLE, SPA_SHELL_TTL_MS } from './config';
import { handleLinkRequest, type LinkDeps, type ShellCache } from './handle-link';

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FACEBOOK = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';
const SHELL = '<!doctype html><html><head><title>FunFunSpell - Online English Exercise and Dictation</title></head><body><app-root></app-root></body></html>';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function deps(handlers: {
  dictation?: Response | Error;
  shell?: Response | Error;
  now?: number;
  cache?: ShellCache;
}): { deps: LinkDeps; calls: string[] } {
  const calls: string[] = [];
  const cache = handlers.cache ?? { body: null, fetchedAt: 0 };
  let now = handlers.now ?? 1_000_000;
  const linkDeps: LinkDeps = {
    eslRestBase: 'https://esl-rest.funfunspell.com/esl-rest/',
    spaIndexUrl: 'https://www.funfunspell.com/index.html',
    now: () => now,
    shellCache: cache,
    fetchImpl: async (input) => {
      const url = String(input);
      calls.push(url);
      if (url.includes('/dictation/get/')) {
        if (handlers.dictation instanceof Error) {
          throw handlers.dictation;
        }
        return handlers.dictation ?? jsonResponse({ message: 'missing fixture' }, 500);
      }
      if (url === 'https://www.funfunspell.com/index.html') {
        if (handlers.shell instanceof Error) {
          throw handlers.shell;
        }
        return handlers.shell ?? new Response(SHELL, { status: 200 });
      }
      throw new Error(`unexpected fetch ${url}`);
    },
  };
  return {
    deps: linkDeps,
    calls,
    // tests advance time by replacing now through the closure
    setNow(value: number) {
      now = value;
    },
  } as { deps: LinkDeps; calls: string[] } & { setNow: (value: number) => void };
}

describe('handleLinkRequest', () => {
  it('returns rich Open Graph HTML for a crawler and a public dictation', async () => {
    const { deps: linkDeps, calls } = deps({
      dictation: jsonResponse({
        title: 'Numbers 1-10',
        shortTitle: 'Numbers 1-10',
        description: 'Numbers 1-10',
        publicAccess: true,
        requirePassword: false,
        password: '',
        creator: { email: 'zz-secret@example.com' },
        vocabs: [{ word: 'ZzVocabWord99' }],
      }),
    });
    const result = await handleLinkRequest(
      { userAgent: FACEBOOK, path: '/link/dictation-view/1' },
      linkDeps,
    );
    assert.equal(result.status, 200);
    assert.equal(result.headers['Cache-Control'], 'public, max-age=300');
    assert.equal(result.headers.Vary, 'User-Agent');
    assert.equal(result.body.includes('Numbers 1-10 · FunFunSpell'), true);
    assert.equal(result.body.includes(`content="${SITE_IMAGE}"`), true);
    assert.equal(result.body.includes('content="https://www.funfunspell.com/link/dictation-view/1"'), true);
    assert.equal(result.body.includes('zz-secret@example.com'), false);
    assert.equal(result.body.includes('ZzVocabWord99'), false);
    assert.equal(result.body.includes('<app-root'), false);
    assert.deepEqual(calls, ['https://esl-rest.funfunspell.com/esl-rest/dictation/get/1']);
  });

  it('returns the SPA shell for a browser and does not call the API', async () => {
    const { deps: linkDeps, calls } = deps({});
    const result = await handleLinkRequest(
      { userAgent: CHROME, path: '/link/dictation-view/1' },
      linkDeps,
    );
    assert.equal(result.status, 200);
    assert.equal(result.headers['Cache-Control'], 'max-age=0, no-cache');
    assert.equal(result.headers.Vary, 'User-Agent');
    assert.equal(result.body.includes('<app-root'), true);
    assert.equal(result.body.includes(SITE_TITLE), true);
    assert.deepEqual(calls, ['https://www.funfunspell.com/index.html']);
  });

  it('treats an empty or generic bot user agent as a browser', async () => {
    for (const userAgent of [undefined, '', 'bot', 'Googlebot/2.1']) {
      const { deps: linkDeps, calls } = deps({});
      const result = await handleLinkRequest({ userAgent, path: '/link/dictation-view/1' }, linkDeps);
      assert.equal(result.body.includes('<app-root'), true, userAgent);
      assert.deepEqual(calls, ['https://www.funfunspell.com/index.html']);
    }
  });

  it('uses generic site tags when the dictation is private, missing, or the API fails', async () => {
    const cases = [
      jsonResponse({ title: 'ZzPrivateTitle99', publicAccess: false, requirePassword: false }),
      jsonResponse({ title: 'ZzPrivateTitle99', publicAccess: true, requirePassword: true, password: 'ZzPassword99' }),
      jsonResponse({ message: 'Dictation not found' }, 404),
      new Error('network down'),
    ];
    for (const dictation of cases) {
      const { deps: linkDeps } = deps({ dictation });
      const result = await handleLinkRequest(
        { userAgent: 'WhatsApp/2.1', path: '/link/dictation-view/99' },
        linkDeps,
      );
      assert.equal(result.status, 200);
      assert.equal(result.headers['Cache-Control'], 'public, max-age=300');
      assert.equal(result.body.includes(`content="${SITE_TITLE}"`), true);
      assert.equal(result.body.includes('ZzPrivateTitle99'), false);
      assert.equal(result.body.includes('ZzPassword99'), false);
      assert.equal(result.body.includes('twitter:title'), false);
    }
  });

  it('uses generic site tags for a crawler path without a dictation id', async () => {
    const { deps: linkDeps, calls } = deps({});
    const result = await handleLinkRequest(
      { userAgent: 'Slackbot-LinkExpanding 1.0', path: '/link/dictation-view' },
      linkDeps,
    );
    assert.equal(result.body.includes(`content="${SITE_TITLE}"`), true);
    assert.deepEqual(calls, []);
  });

  it('reuses a fresh SPA shell and refetches after the ttl', async () => {
    const cache: ShellCache = { body: null, fetchedAt: 0 };
    const state = deps({ cache });
    await handleLinkRequest({ userAgent: CHROME, path: '/link/dictation-view/1' }, state.deps);
    await handleLinkRequest({ userAgent: CHROME, path: '/link/dictation-view/2' }, state.deps);
    assert.equal(state.calls.length, 1);
    state.setNow(1_000_000 + SPA_SHELL_TTL_MS);
    await handleLinkRequest({ userAgent: CHROME, path: '/link/dictation-view/3' }, state.deps);
    assert.equal(state.calls.length, 2);
  });

  it('serves a stale SPA shell when a refresh fails', async () => {
    const cache: ShellCache = {
      body: SHELL,
      fetchedAt: 0,
    };
    const { deps: linkDeps } = deps({
      cache,
      now: SPA_SHELL_TTL_MS + 5,
      shell: new Error('cdn down'),
    });
    const result = await handleLinkRequest({ userAgent: CHROME, path: '/link/dictation-view/1' }, linkDeps);
    assert.equal(result.status, 200);
    assert.equal(result.body, SHELL);
  });

  it('returns 503 when the SPA shell cannot be loaded', async () => {
    const { deps: linkDeps } = deps({ shell: new Response('nope', { status: 500 }) });
    const result = await handleLinkRequest({ userAgent: CHROME, path: '/link/dictation-view/1' }, linkDeps);
    assert.equal(result.status, 503);
    assert.equal(result.headers['Cache-Control'], 'no-store');
    assert.equal(result.body.includes('<app-root'), false);
    assert.equal(result.body.includes('temporarily unavailable'), true);
  });
});
