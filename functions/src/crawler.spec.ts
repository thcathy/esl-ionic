import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { dictationIdFromPath, isCrawlerUserAgent } from './crawler';

describe('isCrawlerUserAgent', () => {
  const crawlers = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'FACEBOOKEXTERNALHIT/1.1',
    'Facebot',
    'WhatsApp/2.23.20.0',
    'TelegramBot (like TwitterBot)',
    'Twitterbot/1.0',
    'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1)',
    'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
  ];

  for (const ua of crawlers) {
    it(`matches ${ua}`, () => {
      assert.equal(isCrawlerUserAgent(ua), true);
    });
  }

  const browsers = [
    undefined,
    null,
    '',
    '   ',
    'bot',
    'Bot',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'curl/8.4.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'facebook',
    'Slack',
    'LinkedIn',
    'Twitter',
  ];

  for (const ua of browsers) {
    it(`ignores ${JSON.stringify(ua)}`, () => {
      assert.equal(isCrawlerUserAgent(ua), false);
    });
  }
});

describe('dictationIdFromPath', () => {
  it('reads a numeric id', () => {
    assert.equal(dictationIdFromPath('/link/dictation-view/1'), '1');
    assert.equal(dictationIdFromPath('/link/dictation-view/42/'), '42');
    assert.equal(dictationIdFromPath('/link/dictation-view/42?ref=share'), '42');
    assert.equal(dictationIdFromPath('/link/dictation-view/42#top'), '42');
  });

  it('rejects paths that are not a public dictation link', () => {
    assert.equal(dictationIdFromPath('/link/dictation-view'), null);
    assert.equal(dictationIdFromPath('/link/dictation-view/'), null);
    assert.equal(dictationIdFromPath('/link/dictation-view/abc'), null);
    assert.equal(dictationIdFromPath('/link/dictation-view/-1'), null);
    assert.equal(dictationIdFromPath('/link/dictation-view/1/extra'), null);
    assert.equal(dictationIdFromPath('/dictation-view/1'), null);
    assert.equal(dictationIdFromPath('/link/other/1'), null);
    assert.equal(dictationIdFromPath(''), null);
  });
});
