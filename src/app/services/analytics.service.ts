import {Injectable} from '@angular/core';
import {VocabPracticeType} from '../enum/vocab-practice-type.enum';

/**
 * GA4 property "esl ionic - GA4" (properties/330417634).
 * Web, iOS, and Android all run this Ionic bundle inside a webview, so they share
 * gtag.js measurement ID G-T0NL87GWKB. There is no Firebase Analytics native SDK;
 * GA4's built-in platform dimension therefore stays "web". Segment native installs
 * with the app_open `platform` param and the `client_platform` user property.
 */
export const GA4_MEASUREMENT_ID = 'G-T0NL87GWKB';
export const GA4_PROPERTY_ID = '330417634';

export const PRACTICE_SOURCES = ['search', 'home', 'card', 'edit', 'retry', 'unknown'] as const;
export type PracticeSource = typeof PRACTICE_SOURCES[number];

export const CLIENT_PLATFORMS = ['ios', 'android', 'web'] as const;
export type ClientPlatform = typeof CLIENT_PLATFORMS[number];

export const DICTATION_MODES = ['spell', 'puzzle', 'sentence'] as const;
export type DictationMode = typeof DICTATION_MODES[number];

export const CARD_CREATE_TYPES = ['word', 'sentence', 'vocab_card'] as const;
export type CardCreateType = typeof CARD_CREATE_TYPES[number];

export const DICTATION_ERROR_TYPES = ['incorrect'] as const;
export type DictationErrorType = typeof DICTATION_ERROR_TYPES[number];

export const APP_LAUNCHES = ['cold', 'warm'] as const;
export type AppLaunch = typeof APP_LAUNCHES[number];

export interface PracticeFinishStats {
  item_count: number;
  correct_count: number;
  word_count: number;
  success: boolean;
  error_type?: DictationErrorType;
}

const MAX_COUNT = 100000;
const MAX_DURATION_SEC = 60 * 60 * 24;
const BLOCKED_PARAM_KEYS = new Set([
  'query', 'keyword', 'q', 'email', 'emailaddress', 'school', 'name', 'title',
  'creator', 'article', 'answer', 'message', 'prompt', 'password', 'token',
  'phone', 'address', 'username', 'user', 'description', 'text', 'word',
]);

type AnalyticsValue = string | number | boolean;
type GtagCommand = 'event' | 'config' | 'set' | 'js';
type GtagFn = (command: GtagCommand, ...args: unknown[]) => void;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private practiceStartedAt: number | null = null;

  configure(options: { pageTitle: string; platform: ClientPlatform }): void {
    const platform = allow(options.platform, CLIENT_PLATFORMS, 'web');
    const gtag = readGtag();
    if (!gtag) {
      return;
    }
    gtag('set', 'user_properties', { client_platform: platform });
    gtag('config', GA4_MEASUREMENT_ID, {
      page_title: options.pageTitle,
      source: platform === 'web' ? 'web' : 'app',
      client_platform: platform,
    });
  }

  /** In-app entry such as search, home, or card. This is not a campaign source. */
  practiceStart(source: string): void {
    this.practiceStartedAt = Date.now();
    this.send('practice_start', {
      source: allow(source, PRACTICE_SOURCES, 'unknown'),
    });
  }

  /** Session reached the end. Also sends dictation_result. */
  sessionFinished(stats: PracticeFinishStats): void {
    if (stats.item_count <= 0) {
      this.practiceStartedAt = null;
      return;
    }
    this.practiceComplete({
      item_count: stats.item_count,
      correct_count: stats.correct_count,
    });
    this.dictationResult({
      success: stats.success,
      word_count: stats.word_count,
      error_type: stats.success ? undefined : stats.error_type,
    });
  }

  practiceComplete(stats: { item_count: number; correct_count?: number }): void {
    const params: Record<string, AnalyticsValue | undefined> = {
      item_count: countParam(stats.item_count),
      duration_sec: this.takeDurationSec(),
    };
    if (stats.correct_count != null) {
      params.correct_count = countParam(stats.correct_count);
    }
    this.send('practice_complete', params);
  }

  dictationStart(mode: string): void {
    this.send('dictation_start', {
      mode: allow(mode, DICTATION_MODES, 'spell'),
    });
  }

  dictationResult(stats: { success: boolean; word_count: number; error_type?: string }): void {
    const params: Record<string, AnalyticsValue | undefined> = {
      success: stats.success === true,
      word_count: countParam(stats.word_count),
    };
    if (stats.success !== true && stats.error_type) {
      const errorType = allow(stats.error_type, DICTATION_ERROR_TYPES, null);
      if (errorType) {
        params.error_type = errorType;
      }
    }
    this.send('dictation_result', params);
  }

  /** Length and hit count only. The query string is not a parameter. */
  searchUse(queryLength: number, resultCount: number): void {
    this.send('search_use', {
      query_len: countParam(queryLength),
      result_count: countParam(resultCount),
    });
  }

  cardCreate(createType: string): void {
    const create_type = allow(createType, CARD_CREATE_TYPES, null);
    if (!create_type) {
      return;
    }
    this.send('card_create', { create_type });
  }

  appOpen(platform: string, appVersion: string, launch: string): void {
    const params: Record<string, AnalyticsValue | undefined> = {
      platform: allow(platform, CLIENT_PLATFORMS, 'web'),
      launch: allow(launch, APP_LAUNCHES, 'cold'),
    };
    if (/^[0-9]+(\.[0-9]+){0,3}$/.test(appVersion)) {
      params.app_version = appVersion;
    }
    this.send('app_open', params);
  }

  private takeDurationSec(): number | undefined {
    if (this.practiceStartedAt == null) {
      return undefined;
    }
    const elapsed = Math.round((Date.now() - this.practiceStartedAt) / 1000);
    this.practiceStartedAt = null;
    return Math.min(MAX_DURATION_SEC, Math.max(0, elapsed));
  }

  private send(eventName: string, params: Record<string, AnalyticsValue | undefined>): void {
    const gtag = readGtag();
    if (!gtag) {
      return;
    }
    gtag('event', eventName, sanitizeAnalyticsParams(params));
  }
}

export function resolveClientPlatform(flags: { nativeApp: boolean; ios: boolean; android: boolean }): ClientPlatform {
  if (flags.nativeApp && flags.ios) {
    return 'ios';
  }
  if (flags.nativeApp && flags.android) {
    return 'android';
  }
  return 'web';
}

export function practiceSourceFromUrl(url: string): PracticeSource {
  const path = (url || '').split('?')[0].split('#')[0];
  if (path.includes('/search-dictation')) {
    return 'search';
  }
  if (path.includes('/vocabulary-starter') || path.includes('/member-home') || /(^|\/)home$/.test(path)) {
    return 'home';
  }
  if (path.includes('/edit-dictation')) {
    return 'edit';
  }
  if (path.includes('practice-complete') || path.includes('article-dictation-complete')) {
    return 'retry';
  }
  if (path.includes('/dictation-view')) {
    return 'card';
  }
  return 'unknown';
}

export function asPracticeSource(value: string | null | undefined): PracticeSource | null {
  if (value == null || value === '') {
    return null;
  }
  return allow(value, PRACTICE_SOURCES, null);
}

export function resolvePracticeSource(url: string, remembered: PracticeSource | null): PracticeSource {
  const fromUrl = practiceSourceFromUrl(url);
  if (fromUrl === 'card' && remembered) {
    return remembered;
  }
  return fromUrl;
}

export function dictationModeFromPractice(isSentence: boolean, practiceType?: string | null): DictationMode {
  if (isSentence) {
    return 'sentence';
  }
  if (practiceType === VocabPracticeType.Puzzle) {
    return 'puzzle';
  }
  return 'spell';
}

export function vocabPracticeStats(correctFlags: boolean[]): PracticeFinishStats {
  const item_count = correctFlags.length;
  const correct_count = correctFlags.filter(Boolean).length;
  const success = item_count > 0 && correct_count === item_count;
  return {
    item_count,
    correct_count,
    word_count: item_count,
    success,
    error_type: success ? undefined : 'incorrect',
  };
}

export function sentencePracticeStats(segmentCorrectness: boolean[][]): PracticeFinishStats {
  const item_count = segmentCorrectness.length;
  const correct_count = segmentCorrectness.filter(flags => flags.length > 0 && flags.every(Boolean)).length;
  const word_count = segmentCorrectness.reduce((sum, flags) => sum + flags.length, 0);
  const success = word_count > 0 && segmentCorrectness.every(flags => flags.length > 0 && flags.every(Boolean));
  return {
    item_count,
    correct_count,
    word_count,
    success,
    error_type: success ? undefined : 'incorrect',
  };
}

export function sanitizeAnalyticsParams(
  input: Record<string, AnalyticsValue | undefined> | null | undefined
): Record<string, AnalyticsValue> {
  const safe: Record<string, AnalyticsValue> = {};
  if (!input) {
    return safe;
  }
  for (const [key, value] of Object.entries(input)) {
    if (BLOCKED_PARAM_KEYS.has(key.toLowerCase()) || value == null) {
      continue;
    }
    if (typeof value === 'boolean') {
      safe[key] = value;
      continue;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      safe[key] = Math.min(MAX_COUNT, Math.max(0, Math.round(value)));
      continue;
    }
    if (typeof value === 'string' && isSafeToken(value)) {
      safe[key] = value;
    }
  }
  return safe;
}

function isSafeToken(value: string): boolean {
  return /^[a-z0-9_|.-]{1,32}$/i.test(value) && !value.includes('@');
}

function countParam(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(MAX_COUNT, Math.max(0, Math.round(value)));
}

function allow<T extends string>(value: string | null | undefined, allowed: readonly T[], fallback: T): T;
function allow<T extends string>(value: string | null | undefined, allowed: readonly T[], fallback: null): T | null;
function allow<T extends string>(value: string | null | undefined, allowed: readonly T[], fallback: T | null): T | null {
  if (value != null && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  return fallback;
}

function readGtag(): GtagFn | null {
  const candidate = (window as Window & { gtag?: GtagFn }).gtag;
  return typeof candidate === 'function' ? candidate : null;
}
