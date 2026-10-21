import {Router} from '@angular/router';

import {Dictation} from '../entity/dictation';
import {NavigationService} from './navigation.service';

describe('NavigationService.openContactUs', () => {
  it('opens the in-app contact page', () => {
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    const service = new NavigationService(
      router,
      null,
      null,
      null,
      null,
      null,
      null,
    );

    service.openContactUs();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/contact-us'], {queryParams: {}});
  });
});

describe('NavigationService.startDictation', () => {
  it('reports the screen that tapped Start, and the sentence length rather than the article', async () => {
    const router = {
      url: '/vocabulary-starter',
      navigate: jasmine.createSpy('navigate'),
    };
    const storage = jasmine.createSpyObj('StorageService', ['set']);
    storage.set.and.resolveTo();
    const dictationService = jasmine.createSpyObj('DictationService', ['isSentenceDictation']);
    const analytics = jasmine.createSpyObj('AnalyticsService', ['practiceDidStart', 'dictationDidStart']);
    const service = new NavigationService(
      router as unknown as Router,
      null,
      storage,
      dictationService,
      null,
      null,
      analytics,
    );

    dictationService.isSentenceDictation.and.returnValue(false);
    await service.startDictation({id: -1} as Dictation);
    expect(analytics.practiceDidStart).toHaveBeenCalledOnceWith('home');
    expect(router.navigate).toHaveBeenCalledWith(['/dictation-practice']);

    router.url = '/member-home';
    dictationService.isSentenceDictation.and.returnValue(true);
    await service.startDictation({
      id: 3,
      sentenceLength: 'Short',
      article: 'Secret school text',
    } as Dictation);
    expect(analytics.dictationDidStart).toHaveBeenCalledOnceWith('short');
    expect(JSON.stringify(analytics.dictationDidStart.calls.argsFor(0))).not.toContain('Secret');
    expect(router.navigate).toHaveBeenCalledWith(['/article-dictation']);
  });
});
