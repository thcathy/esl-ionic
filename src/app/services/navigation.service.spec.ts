import {NavigationService} from './navigation.service';
import {Router} from '@angular/router';
import {AnalyticsService} from './analytics.service';
import {Dictation} from '../entity/dictation';
import {DictationService} from './dictation/dictation.service';
import {StorageService} from './storage.service';

describe('NavigationService', () => {
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

  it('practice_start uses the page that launched the dictation', async () => {
    const {service, analytics, router} = navigationWithUrl('/vocabulary-starter');

    await service.startDictation({id: -1} as Dictation);

    expect(analytics.practiceStart).toHaveBeenCalledOnceWith('home');
    expect(router.navigate).toHaveBeenCalledWith(['/dictation-practice']);
  });

  it('practice_start keeps search when the card was opened from search results', async () => {
    const {service, analytics} = navigationWithUrl('/dictation-view/4');
    service.rememberPracticeSource('search');

    await service.startDictation({id: 4} as Dictation);

    expect(analytics.practiceStart).toHaveBeenCalledOnceWith('search');
  });

  it('passes the remembered source through dictation view navigation state', () => {
    const {service, router} = navigationWithUrl('/search-dictation');
    service.rememberPracticeSource('search');

    service.openDictationById(4, true);

    expect(router.navigate).toHaveBeenCalledWith(['/dictation-view', 4], {
      state: {showBackButton: true, practiceSource: 'search'},
    });
  });
});

function navigationWithUrl(url: string) {
  const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  Object.assign(router, {url});
  const storage = jasmine.createSpyObj<StorageService>('StorageService', ['set']);
  storage.set.and.resolveTo();
  const dictationService = jasmine.createSpyObj<DictationService>('DictationService', ['isSentenceDictation']);
  dictationService.isSentenceDictation.and.returnValue(false);
  const analytics = jasmine.createSpyObj<AnalyticsService>('AnalyticsService', ['practiceStart']);
  const service = new NavigationService(
    router,
    null,
    storage,
    dictationService,
    null,
    null,
    analytics,
  );
  return {service, analytics, router};
}
