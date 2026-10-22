export const GA4_MEASUREMENT_ID = 'G-T0NL87GWKB';

export const PRACTICE_SOURCES = ['search', 'home', 'card', 'member', 'instant', 'retry'] as const;
export type PracticeSource = typeof PRACTICE_SOURCES[number];

export const CREATE_TYPES = ['word', 'sentence', 'vocab_select'] as const;
export type CreateType = typeof CREATE_TYPES[number];

export const DICTATION_MODES = ['short', 'normal', 'long', 'very_long', 'sentence'] as const;
export type DictationMode = typeof DICTATION_MODES[number];

export const DICTATION_ERROR_TYPES = ['answer_mismatch'] as const;
export type DictationErrorType = typeof DICTATION_ERROR_TYPES[number];

export const ANALYTICS_PLATFORMS = ['ios', 'android', 'web'] as const;
export type AnalyticsPlatform = typeof ANALYTICS_PLATFORMS[number];

export const SHARE_METHODS = ['native', 'copy', 'qr_view', 'qr_download'] as const;
export type ShareMethod = typeof SHARE_METHODS[number];

const ENUM_PARAMS: Readonly<Record<string, ReadonlySet<string>>> = {
  source: new Set(PRACTICE_SOURCES),
  mode: new Set(DICTATION_MODES),
  platform: new Set(ANALYTICS_PLATFORMS),
  create_type: new Set(CREATE_TYPES),
  error_type: new Set(DICTATION_ERROR_TYPES),
  method: new Set(SHARE_METHODS),
};

const INT_PARAM_KEYS: ReadonlySet<string> = new Set([
  'item_count', 'duration_sec', 'correct_count', 'word_count', 'result_count', 'query_len',
]);
const BOOL_PARAM_KEYS: ReadonlySet<string> = new Set(['success']);

const TOKEN = /^[a-z0-9_.-]{1,40}$/i;
const PARAM_NAME = /^[a-z][a-z0-9_]{0,39}$/;

const SENTENCE_LENGTHS = ['Short', 'Normal', 'Long', 'VeryLong'] as const;
type SentenceLengthOption = typeof SENTENCE_LENGTHS[number];

export function practiceSourceFromUrl(url: string | null | undefined): PracticeSource {
  const path = `${url ?? ''}`.split('?')[0].split('#')[0];
  if (path.includes('/search-dictation')) {
    return 'search';
  }
  if (path.includes('/member-home')) {
    return 'member';
  }
  if (path.includes('/vocabulary-starter') || path === '/' || path === '/home' || path.startsWith('/home/')) {
    return 'home';
  }
  if (path.includes('/practice-complete') || path.includes('/article-dictation-complete')) {
    return 'retry';
  }
  if (path.includes('/edit-dictation')) {
    return 'instant';
  }
  return 'card';
}

export function dictationMode(sentenceLength: string | null | undefined): DictationMode {
  const length = sentenceLengthOption(sentenceLength);
  switch (length) {
    case 'Short':
      return 'short';
    case 'Normal':
      return 'normal';
    case 'Long':
      return 'long';
    case 'VeryLong':
      return 'very_long';
    case null:
      return 'sentence';
    default: {
      const unexpected: never = length;
      return unexpected;
    }
  }
}

export interface DictationAttemptSummary {
  success: boolean;
  wordCount: number;
  errorType?: DictationErrorType;
}

/** Scores correctness flags only. The question and the learner's answer are not copied. */
export function summarizeDictationAttempt(histories: { isCorrect?: boolean[] }[] | null | undefined): DictationAttemptSummary {
  let wordCount = 0;
  let incorrect = 0;
  for (const history of histories ?? []) {
    for (const correct of history?.isCorrect ?? []) {
      wordCount += 1;
      if (!correct) {
        incorrect += 1;
      }
    }
  }
  const success = wordCount > 0 && incorrect === 0;
  if (success) {
    return {success, wordCount};
  }
  return {success, wordCount, errorType: 'answer_mismatch'};
}

export function gtagConfigParams(input: {
  production: boolean;
  pageTitle: string;
  trafficSource: 'app' | 'web';
}): Record<string, string | boolean> {
  const params: Record<string, string | boolean> = {
    page_title: input.pageTitle,
    source: input.trafficSource,
  };
  if (!input.production) {
    params['debug_mode'] = true;
  }
  return params;
}

function sentenceLengthOption(value: string | null | undefined): SentenceLengthOption | null {
  switch (value) {
    case 'Short':
    case 'Normal':
    case 'Long':
    case 'VeryLong':
      return value;
    default:
      return null;
  }
}

/** Path only. Query and hash can hold search text, school names, or auth codes. */
export function analyticsPageFields(): { page_location: string; page_path: string } {
  const url = new URL(window.location.href);
  const pagePath = url.pathname || '/';
  return {
    page_location: `${url.origin}${pagePath}`,
    page_path: pagePath,
  };
}

function countLimit(key: string): number {
  if (key === 'query_len') {
    return 200;
  }
  if (key === 'duration_sec') {
    return 86_400;
  }
  return 100_000;
}

function coerceCount(value: unknown, max: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.min(max, Math.round(value));
}

/** Known product params only. Drops query text, emails, titles, and values outside the event contract. */
export function sanitizeAnalyticsParams(params: Record<string, unknown> | null | undefined): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (!PARAM_NAME.test(key)) {
      continue;
    }
    const allowed = ENUM_PARAMS[key];
    if (allowed) {
      if (typeof value === 'string' && allowed.has(value)) {
        safe[key] = value;
      }
      continue;
    }
    if (key === 'app_version' && typeof value === 'string' && TOKEN.test(value)) {
      safe[key] = value;
      continue;
    }
    if (INT_PARAM_KEYS.has(key)) {
      const count = coerceCount(value, countLimit(key));
      if (count != null) {
        safe[key] = count;
      }
      continue;
    }
    if (BOOL_PARAM_KEYS.has(key) && typeof value === 'boolean') {
      safe[key] = value;
    }
  }
  return safe;
}
