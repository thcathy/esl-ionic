import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { SITE_DESCRIPTION, SITE_IMAGE, SITE_TITLE, SITE_URL } from './config';

function readRepoFile(name: string): string {
  const candidates = [resolve(process.cwd(), name), resolve(process.cwd(), '..', name)];
  for (const path of candidates) {
    try {
      return readFileSync(path, 'utf8');
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }
  throw new Error(`${name} not found`);
}

interface FirebaseConfig {
  hosting: { rewrites: Array<{ source: string; function?: string; destination?: string }> };
  functions: Array<{ source: string; runtime?: string; predeploy?: string[] }>;
}

describe('firebase.json link rewrite', () => {
  const config = JSON.parse(readRepoFile('firebase.json')) as FirebaseConfig;

  it('sends /link to linkDictationOg before the SPA catch-all', () => {
    assert.deepEqual(
      config.hosting.rewrites.map((rewrite) => rewrite.source),
      ['/link/**', '**'],
    );
    assert.equal(config.hosting.rewrites[0].function, 'linkDictationOg');
    assert.equal(config.hosting.rewrites[1].destination, '/index.html');
  });

  it('does not rewrite app-link association files', () => {
    const blob = JSON.stringify(config.hosting.rewrites);
    assert.equal(blob.includes('.well-known'), false);
    assert.equal(blob.includes('apple-app-site-association'), false);
  });

  it('builds the Node 22 function before deploy', () => {
    assert.equal(config.functions[0].source, 'functions');
    assert.equal(config.functions[0].runtime, 'nodejs22');
    const predeploy = config.functions[0].predeploy ?? [];
    assert.equal(predeploy.some((command) => command.includes('ci --include=dev')), true);
    assert.equal(predeploy.some((command) => command.includes('run build')), true);
  });

  it('keeps generic Open Graph copy aligned with src/index.html', () => {
    const indexHtml = readRepoFile('src/index.html');
    for (const value of [SITE_TITLE, SITE_DESCRIPTION, SITE_IMAGE, SITE_URL, 'summary_large_image']) {
      assert.equal(indexHtml.includes(value), true, value);
    }
  });
});
