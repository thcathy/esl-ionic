import {
  analyticsPageFields,
  dictationMode,
  gtagConfigParams,
  practiceSourceFromUrl,
  sanitizeAnalyticsParams,
  summarizeDictationAttempt,
} from './analytics-events';

describe('analytics event params', () => {
  it('maps start screens to a short source token', () => {
    expect(practiceSourceFromUrl('/search-dictation?q=St%20Mary')).toBe('search');
    expect(practiceSourceFromUrl('/home')).toBe('home');
    expect(practiceSourceFromUrl('/vocabulary-starter')).toBe('home');
    expect(practiceSourceFromUrl('/member-home?segment=vocabulary')).toBe('member');
    expect(practiceSourceFromUrl('/dictation-view/12')).toBe('card');
    expect(practiceSourceFromUrl('/link/dictation-view/12')).toBe('card');
    expect(practiceSourceFromUrl('/edit-dictation/Start')).toBe('instant');
    expect(practiceSourceFromUrl('/practice-complete')).toBe('retry');
    expect(practiceSourceFromUrl('/article-dictation-complete')).toBe('retry');
    expect(practiceSourceFromUrl('/account')).toBe('card');
  });

  it('maps sentence length to a mode and ignores other text', () => {
    expect(dictationMode('Short')).toBe('short');
    expect(dictationMode('Normal')).toBe('normal');
    expect(dictationMode('Long')).toBe('long');
    expect(dictationMode('VeryLong')).toBe('very_long');
    expect(dictationMode('St Mary School')).toBe('sentence');
    expect(dictationMode(null)).toBe('sentence');
  });

  it('summarizes a dictation attempt without the question or answer', () => {
    expect(summarizeDictationAttempt([
      {isCorrect: [true, true]},
      {isCorrect: [true]},
    ])).toEqual({success: true, wordCount: 3});

    const missed = {
      isCorrect: [true, false],
      question: 'secret sentence',
      answer: 'secret',
    };
    expect(summarizeDictationAttempt([missed])).toEqual({
      success: false,
      wordCount: 2,
      errorType: 'answer_mismatch',
    });
  });

  it('turns debug_mode on only outside production', () => {
    expect(gtagConfigParams({
      production: false,
      pageTitle: 'esl-ionic',
      trafficSource: 'web',
    })).toEqual({
      page_title: 'esl-ionic',
      source: 'web',
      debug_mode: true,
    });
    expect(gtagConfigParams({
      production: true,
      pageTitle: 'esl-ionic',
      trafficSource: 'app',
    })).toEqual({
      page_title: 'esl-ionic',
      source: 'app',
    });
  });

  it('drops emails, queries, titles, school names, and values outside the event contract', () => {
    const safe = sanitizeAnalyticsParams({
      query: 'how to spell',
      keyword: 'apple',
      email: 'learner@example.com',
      school: 'St Mary',
      creator: 'tim@school.edu',
      title: 'My exercise',
      name: 'Tim',
      article: 'The quick brown fox',
      description: 'homework',
      source: 'St.Mary',
      mode: 'paragraph',
      app_version: '2.0.0',
      platform: 'web',
      create_type: 'word',
      error_type: 'answer_mismatch',
      success: false,
      query_len: 9999,
      item_count: 2.2,
      correct_count: 0,
      result_count: -1,
      word_count: Number.NaN,
      duration_sec: 4.6,
    });

    expect(safe).toEqual({
      app_version: '2.0.0',
      platform: 'web',
      create_type: 'word',
      error_type: 'answer_mismatch',
      success: false,
      query_len: 200,
      item_count: 2,
      correct_count: 0,
      duration_sec: 5,
    });
    expect(JSON.stringify(safe)).not.toContain('@');
    expect(JSON.stringify(safe)).not.toContain('Mary');
    expect(JSON.stringify(safe)).not.toContain('apple');
  });

  it('keeps the path and drops the query and hash from the hit url', () => {
    const previous = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState(null, '', '/search-dictation?q=St%20Mary%20pupil@school.edu#token');
    try {
      const fields = analyticsPageFields();
      expect(fields.page_path).toBe('/search-dictation');
      expect(fields.page_location.endsWith('/search-dictation')).toBeTrue();
      expect(JSON.stringify(fields)).not.toContain('Mary');
      expect(JSON.stringify(fields)).not.toContain('@');
      expect(JSON.stringify(fields)).not.toContain('token');
      expect(JSON.stringify(fields)).not.toContain('q=');
    } finally {
      window.history.replaceState(null, '', previous || '/');
    }
  });
});
