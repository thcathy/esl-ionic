import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeHtml } from './escape-html';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    assert.equal(escapeHtml(`Tom & <Jerry> "quotes" 'ok'`), 'Tom &amp; &lt;Jerry&gt; &quot;quotes&quot; &#39;ok&#39;');
  });

  it('escapes ampersands before other characters', () => {
    assert.equal(escapeHtml('&lt;'), '&amp;lt;');
  });
});
