import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';

import packageJson from '../../../package.json';
import {environment} from '../../environments/environment';
import {AppService} from './app.service';
import {
  analyticsPageFields,
  AnalyticsPlatform,
  CreateType,
  DictationAttemptSummary,
  DictationMode,
  GA4_MEASUREMENT_ID,
  gtagConfigParams,
  PracticeSource,
  sanitizeAnalyticsParams,
  ShareMethod,
  StoreBadge,
} from './analytics-events';

type GtagCommand = 'config' | 'event' | 'set' | 'js';
type GtagFn = (command: GtagCommand, ...args: unknown[]) => void;
type AnalyticsEventName =
  | 'app_open'
  | 'practice_start'
  | 'practice_complete'
  | 'dictation_start'
  | 'dictation_result'
  | 'search_use'
  | 'custom_practice_create'
  | 'share'
  | 'share_banner'
  | 'share_banner_click';

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/**
 * Product events for GA4 property properties/330417634.
 *
 * SDK path: gtag.js (measurement ID G-T0NL87GWKB), loaded from index.html.
 * iOS and Android do not use the Firebase Analytics native SDK. Capacitor serves
 * the same web bundle in a WebView, so those installs hit this same property.
 * GA4 still labels that traffic platform=web. `app_open.platform` and the
 * `app_platform` user property carry ios, android, or web.
 *
 * Non-production builds set gtag `debug_mode` so hits show in DebugView.
 * Production builds (web deploy and store builds) show in Realtime.
 */
@Injectable({providedIn: 'root'})
export class AnalyticsService {
  private practiceStartedAt: number | null = null;
  private dictationOpen = false;
  private backgrounded = false;

  constructor(
    private platform: Platform,
    private appService: AppService,
  ) {}

  configure(): void {
    const gtag = this.readGtag();
    if (!gtag) {
      return;
    }
    gtag('config', GA4_MEASUREMENT_ID, {
      ...gtagConfigParams({
        production: environment.production,
        pageTitle: packageJson.name,
        trafficSource: this.trafficSource(),
      }),
      ...analyticsPageFields(),
    });
    gtag('set', 'user_properties', {
      app_platform: this.platformName(),
    });
  }

  appOpen(): void {
    this.send('app_open', {
      platform: this.platformName(),
      app_version: packageJson.version,
    });
  }

  /** Foreground after a background transition. The initial open stays on {@link appOpen}. */
  onAppActive(active: boolean): void {
    if (!active) {
      this.backgrounded = true;
      return;
    }
    if (!this.backgrounded) {
      return;
    }
    this.backgrounded = false;
    this.appOpen();
  }

  practiceDidStart(source: PracticeSource): void {
    this.practiceStartedAt = Date.now();
    this.send('practice_start', {source});
  }

  practiceDidComplete(input: { itemCount: number; correctCount?: number }): void {
    const startedAt = this.practiceStartedAt;
    if (startedAt == null) {
      return;
    }
    this.practiceStartedAt = null;
    const durationSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const params: Record<string, number> = {
      item_count: input.itemCount,
      duration_sec: durationSec,
    };
    if (input.correctCount != null) {
      params['correct_count'] = input.correctCount;
    }
    this.send('practice_complete', params);
  }

  dictationDidStart(mode: DictationMode): void {
    this.dictationOpen = true;
    this.send('dictation_start', {mode});
  }

  dictationDidFinish(summary: DictationAttemptSummary): void {
    if (!this.dictationOpen) {
      return;
    }
    this.dictationOpen = false;
    const params: Record<string, string | number | boolean> = {
      success: summary.success,
      word_count: summary.wordCount,
    };
    if (summary.errorType) {
      params['error_type'] = summary.errorType;
    }
    this.send('dictation_result', params);
  }

  searchUse(resultCount: number, queryLength: number): void {
    this.send('search_use', {
      result_count: resultCount,
      query_len: queryLength,
    });
  }

  customPracticeCreate(createType: CreateType): void {
    this.send('custom_practice_create', {create_type: createType});
  }

  share(method: ShareMethod): void {
    this.send('share', {method});
  }

  /** Once per view, and only when the share-link install banner is actually shown. */
  shareBannerImpress(): void {
    this.send('share_banner', {});
  }

  shareBannerClick(store: StoreBadge): void {
    this.send('share_banner_click', {store});
  }

  private platformName(): AnalyticsPlatform {
    if (this.appService.isApp() && this.platform.is('ios')) {
      return 'ios';
    }
    if (this.appService.isApp() && this.platform.is('android')) {
      return 'android';
    }
    return 'web';
  }

  /** gtag config `source` (app or web). Not the practice_start source. */
  private trafficSource(): 'app' | 'web' {
    return this.platformName() === 'web' ? 'web' : 'app';
  }

  private send(name: AnalyticsEventName, params: Record<string, unknown>): void {
    const gtag = this.readGtag();
    if (!gtag) {
      return;
    }
    gtag('event', name, {
      ...analyticsPageFields(),
      ...sanitizeAnalyticsParams(params),
    });
  }

  private readGtag(): GtagFn | null {
    return typeof window.gtag === 'function' ? window.gtag : null;
  }
}
