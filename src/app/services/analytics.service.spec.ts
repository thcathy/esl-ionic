import {Platform} from '@ionic/angular';

import packageJson from '../../../package.json';
import {AppService} from './app.service';
import {AnalyticsService} from './analytics.service';
import {analyticsPageFields, GA4_MEASUREMENT_ID} from './analytics-events';

function withPage<T extends Record<string, string | number | boolean>>(params: T) {
  return {...analyticsPageFields(), ...params};
}

describe('AnalyticsService', () => {
  let gtag: jasmine.Spy;
  let platform: jasmine.SpyObj<Platform>;
  let appService: jasmine.SpyObj<AppService>;
  let service: AnalyticsService;

  beforeEach(() => {
    gtag = jasmine.createSpy('gtag');
    window.gtag = gtag;
    platform = jasmine.createSpyObj('Platform', ['is']);
    platform.is.and.returnValue(false);
    appService = jasmine.createSpyObj('AppService', ['isApp']);
    appService.isApp.and.returnValue(false);
    service = new AnalyticsService(platform, appService);
  });

  afterEach(() => {
    delete window.gtag;
  });

  it('configures the GA4 measurement id and sends a cold web app_open', () => {
    service.configure();
    service.appOpen();

    expect(gtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, jasmine.objectContaining({
      page_title: packageJson.name,
      source: 'web',
      debug_mode: true,
      ...analyticsPageFields(),
    }));
    expect(gtag).toHaveBeenCalledWith('set', 'user_properties', {app_platform: 'web'});
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', withPage({
      platform: 'web',
      app_version: packageJson.version,
    }));
  });

  it('reports a Capacitor iOS shell as ios on the same measurement id', () => {
    appService.isApp.and.returnValue(true);
    platform.is.and.callFake((name: string) => name === 'ios');

    service.configure();
    service.appOpen();

    expect(gtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, jasmine.objectContaining({source: 'app'}));
    expect(gtag).toHaveBeenCalledWith('set', 'user_properties', {app_platform: 'ios'});
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', jasmine.objectContaining({platform: 'ios'}));
  });

  it('reports a Capacitor Android shell as android', () => {
    appService.isApp.and.returnValue(true);
    platform.is.and.callFake((name: string) => name === 'android');

    service.configure();
    service.appOpen();

    expect(gtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, jasmine.objectContaining({source: 'app'}));
    expect(gtag).toHaveBeenCalledWith('set', 'user_properties', {app_platform: 'android'});
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', jasmine.objectContaining({platform: 'android'}));
  });

  it('treats mobile web as web even when the browser is iOS', () => {
    platform.is.and.callFake((name: string) => name === 'ios' || name === 'mobileweb');

    service.configure();
    service.appOpen();

    expect(gtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, jasmine.objectContaining({source: 'web'}));
    expect(gtag).toHaveBeenCalledWith('set', 'user_properties', {app_platform: 'web'});
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', jasmine.objectContaining({platform: 'web'}));
  });

  it('sends a warm app_open only after the app was backgrounded', () => {
    service.onAppActive(true);
    expect(gtag).not.toHaveBeenCalled();

    service.onAppActive(false);
    service.onAppActive(true);
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', jasmine.objectContaining({platform: 'web'}));

    gtag.calls.reset();
    service.onAppActive(true);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('sends practice_start and practice_complete with duration', () => {
    spyOn(Date, 'now').and.returnValues(1_000, 6_000);
    service.practiceDidStart('home');
    service.practiceDidComplete({itemCount: 4, correctCount: 0});

    expect(gtag).toHaveBeenCalledWith('event', 'practice_start', withPage({source: 'home'}));
    expect(gtag).toHaveBeenCalledWith('event', 'practice_complete', withPage({
      item_count: 4,
      duration_sec: 5,
      correct_count: 0,
    }));
  });

  it('omits correct_count when the practice has no score', () => {
    service.practiceDidStart('card');
    service.practiceDidComplete({itemCount: 2});

    expect(gtag).toHaveBeenCalledWith('event', 'practice_complete', withPage({
      item_count: 2,
      duration_sec: 0,
    }));
  });

  it('sends one complete per open practice and ignores a result with no open dictation', () => {
    service.practiceDidComplete({itemCount: 3, correctCount: 1});
    service.dictationDidFinish({success: false, wordCount: 1, errorType: 'answer_mismatch'});
    expect(gtag).not.toHaveBeenCalled();

    let now = 1_000;
    spyOn(Date, 'now').and.callFake(() => now);
    service.practiceDidStart('retry');
    now = 3_000;
    service.practiceDidComplete({itemCount: 3, correctCount: 1});
    service.practiceDidComplete({itemCount: 9, correctCount: 9});
    now = 10_000;
    service.practiceDidStart('home');
    now = 11_000;
    service.practiceDidComplete({itemCount: 1});

    const completes = gtag.calls.allArgs().filter(args => args[1] === 'practice_complete');
    expect(completes.map(args => args[2])).toEqual([
      withPage({item_count: 3, duration_sec: 2, correct_count: 1}),
      withPage({item_count: 1, duration_sec: 1}),
    ]);

    gtag.calls.reset();
    service.dictationDidStart('normal');
    service.dictationDidFinish({success: false, wordCount: 4, errorType: 'answer_mismatch'});
    service.dictationDidFinish({success: true, wordCount: 4});
    service.dictationDidStart('short');
    service.dictationDidFinish({success: true, wordCount: 2});
    const results = gtag.calls.allArgs().filter(args => args[1] === 'dictation_result');
    expect(results.map(args => args[2])).toEqual([
      withPage({success: false, word_count: 4, error_type: 'answer_mismatch'}),
      withPage({success: true, word_count: 2}),
    ]);
  });

  it('sends dictation_start mode and dictation_result without the sentence', () => {
    service.dictationDidStart('very_long');
    service.dictationDidFinish({success: false, wordCount: 3, errorType: 'answer_mismatch'});

    expect(gtag).toHaveBeenCalledWith('event', 'dictation_start', withPage({mode: 'very_long'}));
    expect(gtag).toHaveBeenCalledWith('event', 'dictation_result', withPage({
      success: false,
      word_count: 3,
      error_type: 'answer_mismatch',
    }));
  });

  it('omits error_type when the dictation succeeded', () => {
    service.dictationDidStart('sentence');
    service.dictationDidFinish({success: true, wordCount: 8});
    expect(gtag).toHaveBeenCalledWith('event', 'dictation_result', withPage({
      success: true,
      word_count: 8,
    }));
  });

  it('sends search counts and a create type', () => {
    service.searchUse(2, 18);
    service.customPracticeCreate('vocab_select');

    expect(gtag).toHaveBeenCalledWith('event', 'search_use', withPage({result_count: 2, query_len: 18}));
    expect(gtag).toHaveBeenCalledWith('event', 'custom_practice_create', withPage({create_type: 'vocab_select'}));
  });

  it('does nothing when gtag has not loaded', () => {
    delete window.gtag;
    expect(() => {
      service.configure();
      service.appOpen();
      service.practiceDidStart('card');
      service.searchUse(0, 0);
    }).not.toThrow();
  });
});
