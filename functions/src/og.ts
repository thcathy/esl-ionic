import {
  DEFAULT_DICTATION_DESCRIPTION,
  SHARE_ORIGIN,
  SITE_DESCRIPTION,
  SITE_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from './config';
import { escapeHtml } from './escape-html';

const MAX_TITLE_NAME = 120;
const MAX_DESCRIPTION = 300;

export interface OgTags {
  title: string;
  description: string;
  image: string;
  url: string;
  type: 'website';
  twitterCard: 'summary_large_image';
  twitterText: boolean;
}

export function genericOgTags(): OgTags {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    image: SITE_IMAGE,
    url: SITE_URL,
    type: 'website',
    twitterCard: 'summary_large_image',
    twitterText: false,
  };
}

export function ogTagsForPayload(payload: unknown, id: string): OgTags {
  if (!isRecord(payload) || !isPublicDictation(payload)) {
    return genericOgTags();
  }
  const name = nonBlank(payload.title) ?? nonBlank(payload.shortTitle);
  const title = name ? `${truncate(name, MAX_TITLE_NAME)} · FunFunSpell` : SITE_TITLE;
  const description = truncate(
    nonBlank(payload.description) ?? DEFAULT_DICTATION_DESCRIPTION,
    MAX_DESCRIPTION,
  );
  return {
    title,
    description,
    image: SITE_IMAGE,
    url: `${SHARE_ORIGIN}/link/dictation-view/${id}`,
    type: 'website',
    twitterCard: 'summary_large_image',
    twitterText: true,
  };
}

export function renderOgHtml(tags: OgTags): string {
  const lines = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    `<title>${escapeHtml(tags.title)}</title>`,
    metaProperty('og:title', tags.title),
    metaProperty('og:description', tags.description),
    metaProperty('og:image', tags.image),
    metaProperty('og:url', tags.url),
    metaProperty('og:type', tags.type),
    metaName('twitter:card', tags.twitterCard),
  ];
  if (tags.twitterText) {
    lines.push(
      metaName('twitter:title', tags.title),
      metaName('twitter:description', tags.description),
      metaName('twitter:image', tags.image),
      metaName('twitter:url', tags.url),
    );
  }
  lines.push('</head>', '<body></body>', '</html>');
  return lines.join('\n');
}

export function isPublicDictation(body: Record<string, unknown>): boolean {
  if (body.publicAccess !== true) {
    return false;
  }
  if (body.requirePassword === true) {
    return false;
  }
  if (typeof body.password === 'string' && body.password.trim() !== '') {
    return false;
  }
  return true;
}

function metaProperty(property: string, content: string): string {
  return `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}">`;
}

function metaName(name: string, content: string): string {
  return `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}">`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonBlank(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const cleaned = value.replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function truncate(value: string, max: number): string {
  const chars = Array.from(value);
  if (chars.length <= max) {
    return value;
  }
  return `${chars.slice(0, max - 1).join('')}…`;
}
