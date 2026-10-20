import {AnalyticsService, GA4_MEASUREMENT_ID, asPracticeSource, dictationModeFromPractice, practiceSourceFromUrl, resolveClientPlatform, resolvePracticeSource, sanitizeAnalyticsParams, sentencePracticeStats, vocabPracticeStats} from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let gtag: jasmine.Spy;

  beforeEach(() => {
    gtag = jasmine.createSpy('gtag');
    (window as unknown as { gtag: jasmine.Spy }).gtag = gtag;
    service = new AnalyticsService();
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(1_700_000_000_000));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    delete (window as unknown as { gtag?: jasmine.Spy }).gtag;
  });

  it('configures the shared gtag measurement id and client platform', () => {
    service.configure({ pageTitle: 'esl-ionic', platform: 'ios' });

    expect(gtag).toHaveBeenCalledWith('set', 'user_properties', { client_platform: 'ios' });
    expect(gtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, {
      page_title: 'esl-ionic',
      source: 'app',
      client_platform: 'ios',
    });
  });

  it('practice_start keeps an allow-listed entry and drops free text', () => {
    service.practiceStart('search');
    service.practiceStart('learner@school.edu');

    expect(eventParams('practice_start', 0)).toEqual({ source: 'search' });
    expect(eventParams('practice_start', 1)).toEqual({ source: 'unknown' });
    expect(JSON.stringify(gtag.calls.allArgs())).not.toContain('learner@school.edu');
  });

  it('session finish sends practice_complete and dictation_result without answer text', () => {
    service.practiceStart('home');
    jasmine.clock().mockDate(new Date(1_700_000_012_400));

    service.sessionFinished(vocabPracticeStats([true, false, true]));

    expect(eventParams('practice_complete')).toEqual({
      item_count: 3,
      correct_count: 2,
      duration_sec: 12,
    });
    expect(eventParams('dictation_result')).toEqual({
      success: false,
      word_count: 3,
      error_type: 'incorrect',
    });
  });

  it('omits error_type when the attempt is fully correct', () => {
    service.sessionFinished(vocabPracticeStats([true, true]));

    expect(eventParams('dictation_result')).toEqual({
      success: true,
      word_count: 2,
    });
  });

  it('search_use sends lengths only', () => {
    service.searchUse(18, 4);

    expect(gtag).toHaveBeenCalledWith('event', 'search_use', {
      query_len: 18,
      result_count: 4,
    });
    expect(Object.keys(eventParams('search_use'))).toEqual(['query_len', 'result_count']);
  });

  it('card_create and app_open stay on closed vocabularies', () => {
    service.cardCreate('vocab_card');
    service.cardCreate('my school name');
    service.appOpen('android', '10.3.12', 'warm');
    service.appOpen('desktop', 'not a version', 'later');

    expect(eventParams('card_create')).toEqual({ create_type: 'vocab_card' });
    expect(gtag.calls.allArgs().filter(args => args[1] === 'card_create').length).toBe(1);
    expect(eventParams('app_open', 0)).toEqual({
      platform: 'android',
      launch: 'warm',
      app_version: '10.3.12',
    });
    expect(eventParams('app_open', 1)).toEqual({
      platform: 'web',
      launch: 'cold',
    });
  });

  it('does nothing when gtag is missing', () => {
    delete (window as unknown as { gtag?: jasmine.Spy }).gtag;

    expect(() => service.practiceStart('home')).not.toThrow();
  });
});

describe('analytics helpers', () => {
  it('resolves native webviews to ios or android and browsers to web', () => {
    expect(resolveClientPlatform({ nativeApp: true, ios: true, android: false })).toBe('ios');
    expect(resolveClientPlatform({ nativeApp: true, ios: false, android: true })).toBe('android');
    expect(resolveClientPlatform({ nativeApp: false, ios: true, android: false })).toBe('web');
    expect(resolveClientPlatform({ nativeApp: false, ios: false, android: false })).toBe('web');
  });

  it('maps routes to practice entry without keeping the query string', () => {
    expect(practiceSourceFromUrl('/search-dictation?q=school+name')).toBe('search');
    expect(practiceSourceFromUrl('/home')).toBe('home');
    expect(practiceSourceFromUrl('/vocabulary-starter')).toBe('home');
    expect(practiceSourceFromUrl('/member-home')).toBe('home');
    expect(practiceSourceFromUrl('/edit-dictation/Start')).toBe('edit');
    expect(practiceSourceFromUrl('/practice-complete')).toBe('retry');
    expect(practiceSourceFromUrl('/article-dictation-complete')).toBe('retry');
    expect(practiceSourceFromUrl('/dictation-view/42')).toBe('card');
    expect(practiceSourceFromUrl('/account')).toBe('unknown');
  });

  it('keeps a remembered search or home source for the dictation card', () => {
    expect(resolvePracticeSource('/dictation-view/9', 'search')).toBe('search');
    expect(resolvePracticeSource('/dictation-view/9', 'home')).toBe('home');
    expect(resolvePracticeSource('/dictation-view/9', null)).toBe('card');
    expect(resolvePracticeSource('/vocabulary-starter', 'search')).toBe('home');
    expect(asPracticeSource('email@school.edu')).toBeNull();
  });

  it('maps practice type to dictation mode', () => {
    expect(dictationModeFromPractice(true, 'Spell')).toBe('sentence');
    expect(dictationModeFromPractice(false, 'Puzzle')).toBe('puzzle');
    expect(dictationModeFromPractice(false, 'Spell')).toBe('spell');
    expect(dictationModeFromPractice(false, null)).toBe('spell');
  });

  it('counts vocab items and sentence segments', () => {
    expect(vocabPracticeStats([true, false])).toEqual({
      item_count: 2,
      correct_count: 1,
      word_count: 2,
      success: false,
      error_type: 'incorrect',
    });
    expect(sentencePracticeStats([[true, true], [true, false]])).toEqual({
      item_count: 2,
      correct_count: 1,
      word_count: 4,
      success: false,
      error_type: 'incorrect',
    });
    expect(sentencePracticeStats([[true], [true]]).success).toBeTrue();
  });

  it('strips raw query text, emails, and school names from params', () => {
    expect(sanitizeAnalyticsParams({
      query: 'cats in hats',
      keyword: 'central school',
      email: 'learner@example.com',
      title: 'My exercise',
      query_len: 11,
      result_count: 2,
      success: true,
      source: 'search',
      mode: 'please email the school',
    })).toEqual({
      query_len: 11,
      result_count: 2,
      success: true,
      source: 'search',
    });
  });
});

function eventParams(eventName: string, index = 0): Record<string, unknown> {
  const gtag = (window as unknown as { gtag: jasmine.Spy }).gtag;
  const matches = gtag.calls.allArgs().filter(args => args[0] === 'event' && args[1] === eventName);
  return matches[index][2] as Record<string, unknown>;
}
