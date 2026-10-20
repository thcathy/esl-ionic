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
    );

    service.openContactUs();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/contact-us'], {queryParams: {}});
  });
});

describe('NavigationService practice source', () => {
  function setup(url: string) {
    const router = {
      url,
      navigate: jasmine.createSpy('navigate'),
    };
    const storage = jasmine.createSpyObj('StorageService', ['set']);
    storage.set.and.resolveTo();
    const dictationService = jasmine.createSpyObj('DictationService', ['isSentenceDictation']);
    const service = new NavigationService(
      router as unknown as Router,
      null,
      storage,
      dictationService,
      null,
      null,
    );
    return {service, router, dictationService};
  }

  it('keeps the search list when Start is tapped on the card', async () => {
    const {service, router, dictationService} = setup('/search-dictation?q=St%20Mary');
    dictationService.isSentenceDictation.and.returnValue(false);
    service.openDictationById(4, true);

    router.url = '/dictation-view/12';
    await service.startDictation({id: 12} as Dictation);

    expect(service.practiceAttemptSource()).toBe('search');
    expect(JSON.stringify(service.practiceAttemptSource())).not.toContain('Mary');
    expect(router.navigate).toHaveBeenCalledWith(['/dictation-practice']);
  });

  it('uses sentence length as the dictation mode and not the article', async () => {
    const {service, router, dictationService} = setup('/member-home');
    dictationService.isSentenceDictation.and.returnValue(true);

    await service.startDictation({
      id: 3,
      sentenceLength: 'Short',
      article: 'Secret school text',
    } as Dictation);

    expect(service.dictationAttemptMode()).toBe('short');
    expect(JSON.stringify(service.dictationAttemptMode())).not.toContain('Secret');
    expect(router.navigate).toHaveBeenCalledWith(['/article-dictation']);
  });

});
