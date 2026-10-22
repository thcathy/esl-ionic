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

  it('sends app_open for web and for a native shell, and again only after background', () => {
    service.configure();
    service.appOpen();

    expect(gtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, jasmine.objectContaining({
      source: 'web',
      debug_mode: true,
    }));
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', withPage({
      platform: 'web',
      app_version: packageJson.version,
    }));

    gtag.calls.reset();
    appService.isApp.and.returnValue(true);
    platform.is.and.callFake((name: string) => name === 'ios');
    service.appOpen();
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', jasmine.objectContaining({platform: 'ios'}));

    gtag.calls.reset();
    appService.isApp.and.returnValue(false);
    platform.is.and.callFake((name: string) => name === 'ios' || name === 'mobileweb');
    service.appOpen();
    expect(gtag).toHaveBeenCalledWith('event', 'app_open', jasmine.objectContaining({platform: 'web'}));

    gtag.calls.reset();
    service.onAppActive(true);
    service.onAppActive(false);
    service.onAppActive(true);
    service.onAppActive(true);
    expect(gtag.calls.allArgs().filter(args => args[1] === 'app_open').length).toBe(1);
  });

  it('sends one practice_complete and one dictation_result for each start', () => {
    spyOn(Date, 'now').and.returnValues(1_000, 6_000);
    service.practiceDidStart('search');
    service.practiceDidComplete({itemCount: 4, correctCount: 3});
    service.practiceDidComplete({itemCount: 9, correctCount: 9});

    expect(gtag).toHaveBeenCalledWith('event', 'practice_start', withPage({source: 'search'}));
    expect(gtag).toHaveBeenCalledWith('event', 'practice_complete', withPage({
      item_count: 4,
      duration_sec: 5,
      correct_count: 3,
    }));

    gtag.calls.reset();
    service.dictationDidFinish({success: true, wordCount: 1});
    service.dictationDidStart('short');
    service.dictationDidFinish({success: false, wordCount: 3, errorType: 'answer_mismatch'});
    service.dictationDidFinish({success: true, wordCount: 3});

    expect(gtag).toHaveBeenCalledWith('event', 'dictation_start', withPage({mode: 'short'}));
    expect(gtag).toHaveBeenCalledWith('event', 'dictation_result', withPage({
      success: false,
      word_count: 3,
      error_type: 'answer_mismatch',
    }));
    expect(gtag.calls.allArgs().filter(args => args[0] === 'event').length).toBe(2);
  });

  it('sends search counts and a create type', () => {
    service.searchUse(2, 18);
    service.customPracticeCreate('vocab_select');

    expect(gtag).toHaveBeenCalledWith('event', 'search_use', withPage({result_count: 2, query_len: 18}));
    expect(gtag).toHaveBeenCalledWith('event', 'custom_practice_create', withPage({create_type: 'vocab_select'}));
  });

  it('sends share with an allowed method', () => {
    service.share('copy');

    expect(gtag).toHaveBeenCalledWith('event', 'share', withPage({method: 'copy'}));
  });
});
