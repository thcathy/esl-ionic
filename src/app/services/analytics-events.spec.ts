import {
  analyticsPageFields,
  practiceSourceFromUrl,
  sanitizeAnalyticsParams,
  summarizeDictationAttempt,
} from './analytics-events';

describe('analytics event params', () => {
  it('maps the screen to a source token and ignores the query', () => {
    expect(practiceSourceFromUrl('/search-dictation?q=St%20Mary')).toBe('search');
    expect(practiceSourceFromUrl('/vocabulary-starter')).toBe('home');
    expect(practiceSourceFromUrl('/member-home')).toBe('member');
    expect(practiceSourceFromUrl('/dictation-view/12')).toBe('card');
    expect(practiceSourceFromUrl('/edit-dictation/Start')).toBe('instant');
    expect(practiceSourceFromUrl('/practice-complete')).toBe('retry');
  });

  it('drops emails, queries, titles, and school names', () => {
    const safe = sanitizeAnalyticsParams({
      query: 'how to spell',
      keyword: 'apple',
      email: 'learner@example.com',
      school: 'St Mary',
      title: 'My exercise',
      source: 'St.Mary',
      create_type: 'word',
      success: false,
      query_len: 9999,
      item_count: 2,
    });

    expect(safe).toEqual({
      create_type: 'word',
      success: false,
      query_len: 200,
      item_count: 2,
    });
    expect(JSON.stringify(safe)).not.toContain('@');
    expect(JSON.stringify(safe)).not.toContain('Mary');
    expect(JSON.stringify(safe)).not.toContain('apple');
  });

  it('counts a dictation without copying the sentence or the answer', () => {
    const history = {isCorrect: [true, false], question: 'secret sentence', answer: 'secret'};
    const summary = summarizeDictationAttempt([history]);
    expect(summary).toEqual({success: false, wordCount: 2, errorType: 'answer_mismatch'});
    expect(JSON.stringify(summary)).not.toContain('secret');
  });

  it('allows share methods and drops any other method', () => {
    for (const method of ['native', 'copy', 'qr_view', 'qr_download']) {
      expect(sanitizeAnalyticsParams({method})).toEqual({method});
    }
    expect(sanitizeAnalyticsParams({method: 'whatsapp'})).toEqual({});
    expect(sanitizeAnalyticsParams({method: 'copy this link to a friend'})).toEqual({});
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
      expect(JSON.stringify(fields)).not.toContain('q=');
    } finally {
      window.history.replaceState(null, '', previous || '/');
    }
  });
});
