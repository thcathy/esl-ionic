import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SITE_DESCRIPTION, SITE_IMAGE, SITE_TITLE, SITE_URL } from './config';
import { genericOgTags, ogTagsForPayload, renderOgHtml } from './og';

function meta(html: string, attr: 'property' | 'name', key: string): string | null {
  const match = html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)">`));
  return match?.[1] ?? null;
}

const publicDictation = {
  id: 1,
  title: 'Numbers 1-10',
  shortTitle: 'Numbers 1-10',
  description: 'Numbers 1-10',
  publicAccess: true,
  requirePassword: false,
  password: '',
  vocabs: [{ word: 'ZzVocabWord99' }],
  article: 'ZzArticleBody99',
  creator: { email: 'zz-secret@example.com', name: 'Secret Name' },
};

describe('ogTagsForPayload', () => {
  it('maps a public dictation onto title, description, url, and the P1 image', () => {
    const tags = ogTagsForPayload(publicDictation, '1');
    assert.equal(tags.title, 'Numbers 1-10 · FunFunSpell');
    assert.equal(tags.description, 'Numbers 1-10');
    assert.equal(tags.image, SITE_IMAGE);
    assert.equal(tags.url, 'https://www.funfunspell.com/link/dictation-view/1');
    assert.equal(tags.type, 'website');
    assert.equal(tags.twitterCard, 'summary_large_image');
    assert.equal(tags.twitterText, true);
  });

  it('falls back to shortTitle and a short description', () => {
    const tags = ogTagsForPayload({
      title: '   ',
      shortTitle: 'Short name',
      description: '\n\t',
      publicAccess: true,
      requirePassword: false,
    }, '7');
    assert.equal(tags.title, 'Short name · FunFunSpell');
    assert.equal(tags.description, 'English dictation on FunFunSpell');
  });

  it('uses the site title when a public dictation has no name', () => {
    const tags = ogTagsForPayload({ publicAccess: true, requirePassword: false }, '7');
    assert.equal(tags.title, SITE_TITLE);
  });

  it('keeps private, password, and missing payloads on the P1 site tags', () => {
    const cases: unknown[] = [
      { ...publicDictation, publicAccess: false, title: 'ZzPrivateTitle99', description: 'ZzPrivateDescription99' },
      { ...publicDictation, requirePassword: true, title: 'ZzPrivateTitle99', password: 'ZzPassword99' },
      { ...publicDictation, publicAccess: true, requirePassword: false, password: 'ZzPassword99', title: 'ZzPrivateTitle99' },
      { ...publicDictation, publicAccess: 'true', title: 'ZzPrivateTitle99' },
      null,
      'Dictation not found',
      [],
    ];
    for (const payload of cases) {
      const tags = ogTagsForPayload(payload, '1');
      assert.deepEqual(tags, genericOgTags());
      assert.equal(tags.title, SITE_TITLE);
      assert.equal(tags.description, SITE_DESCRIPTION);
      assert.equal(tags.url, SITE_URL);
      assert.equal(tags.twitterText, false);
    }
  });

  it('truncates a long description and does not use vocab or article text', () => {
    const tags = ogTagsForPayload({
      ...publicDictation,
      description: `${'a'.repeat(320)} ZzVocabWord99`,
      article: 'ZzArticleBody99',
    }, '1');
    assert.equal(Array.from(tags.description).length, 300);
    assert.equal(tags.description.endsWith('…'), true);
    assert.equal(tags.description.includes('ZzVocabWord99'), false);
  });
});

describe('renderOgHtml', () => {
  it('escapes interpolated title and description', () => {
    const html = renderOgHtml(ogTagsForPayload({
      title: `Tom & <Jerry> "quotes"`,
      description: `line <script>alert(1)</script> & more`,
      publicAccess: true,
      requirePassword: false,
    }, '3'));
    assert.equal(html.includes('<script>'), false);
    assert.equal(html.includes('Tom &amp; &lt;Jerry&gt; &quot;quotes&quot; · FunFunSpell'), true);
    assert.equal(meta(html, 'property', 'og:description'), 'line &lt;script&gt;alert(1)&lt;/script&gt; &amp; more');
    assert.equal(meta(html, 'name', 'twitter:title'), 'Tom &amp; &lt;Jerry&gt; &quot;quotes&quot; · FunFunSpell');
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image');
    assert.equal(meta(html, 'property', 'og:image'), SITE_IMAGE);
    assert.equal(meta(html, 'property', 'og:type'), 'website');
    assert.equal(meta(html, 'name', 'twitter:url'), 'https://www.funfunspell.com/link/dictation-view/3');
  });

  it('renders generic P1 tags without twitter text or private fields', () => {
    const html = renderOgHtml(ogTagsForPayload({
      ...publicDictation,
      publicAccess: false,
      title: 'ZzPrivateTitle99',
      description: 'ZzPrivateDescription99',
      password: 'ZzPassword99',
    }, '1'));
    assert.equal(meta(html, 'property', 'og:title'), SITE_TITLE);
    assert.equal(meta(html, 'property', 'og:description'), SITE_DESCRIPTION);
    assert.equal(meta(html, 'property', 'og:image'), SITE_IMAGE);
    assert.equal(meta(html, 'property', 'og:url'), SITE_URL);
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image');
    assert.equal(html.includes('twitter:title'), false);
    assert.equal(html.includes('ZzPrivateTitle99'), false);
    assert.equal(html.includes('ZzPrivateDescription99'), false);
    assert.equal(html.includes('ZzPassword99'), false);
    assert.equal(html.includes('ZzVocabWord99'), false);
    assert.equal(html.includes('ZzArticleBody99'), false);
    assert.equal(html.includes('zz-secret@example.com'), false);
  });
});
