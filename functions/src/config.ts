/** Site-wide tags from src/index.html. Keep these in sync with that file. */
export const SITE_TITLE = 'FunFunSpell - Online English Exercise and Dictation';
export const SITE_DESCRIPTION =
  'Provide free English vocabulary exercise and create your own dictation with images and pronunciation';
export const SITE_IMAGE = 'https://www.funfunspell.com/assets/img/logo_hd.png';
export const SITE_URL = 'https://www.funfunspell.com/';
export const SHARE_ORIGIN = 'https://www.funfunspell.com';
export const DEFAULT_DICTATION_DESCRIPTION = 'English dictation on FunFunSpell';
export const DEFAULT_ESL_REST_BASE = 'https://esl-rest.funfunspell.com/esl-rest';
export const DEFAULT_SPA_INDEX_URL = 'https://www.funfunspell.com/index.html';

export const CRAWLER_CACHE_CONTROL = 'public, max-age=300';
export const SPA_CACHE_CONTROL = 'max-age=0, no-cache';
export const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

export const SPA_SHELL_TTL_MS = 60_000;
export const DICTATION_FETCH_TIMEOUT_MS = 8_000;
export const SPA_SHELL_FETCH_TIMEOUT_MS = 8_000;

export function eslRestBase(): string {
  const configured = process.env.ESL_REST_BASE?.trim();
  return (configured || DEFAULT_ESL_REST_BASE).replace(/\/$/, '');
}

export function spaIndexUrl(): string {
  const configured = process.env.SPA_INDEX_URL?.trim();
  return configured || DEFAULT_SPA_INDEX_URL;
}
