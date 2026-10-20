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

  it('uses the home starter and drops an earlier search list', async () => {
    const {service, router, dictationService} = setup('/search-dictation');
    dictationService.isSentenceDictation.and.returnValue(false);
    service.openDictationById(1, true);

    router.url = '/vocabulary-starter';
    await service.startDictation({id: -1} as Dictation);

    expect(service.practiceAttemptSource()).toBe('home');
  });

  it('drops the list source when a card is opened from the editor', async () => {
    const {service, router, dictationService} = setup('/search-dictation?q=St%20Mary');
    dictationService.isSentenceDictation.and.returnValue(false);
    service.openDictationById(4, true);

    router.url = '/edit-dictation/Edit';
    service.openDictation({id: 5} as Dictation);

    router.url = '/dictation-view/5';
    await service.startDictation({id: 5} as Dictation);

    expect(service.practiceAttemptSource()).toBe('card');
    expect(JSON.stringify(service.practiceAttemptSource())).not.toContain('Mary');
  });

  it('drops a search list after a sentence start so the next card is not search', async () => {
    const {service, router, dictationService} = setup('/search-dictation?q=St%20Mary');
    dictationService.isSentenceDictation.and.returnValue(true);
    service.openDictationById(4, true);

    router.url = '/dictation-view/4';
    await service.startDictation({
      id: 4,
      sentenceLength: 'Long',
      article: 'Secret school text',
    } as Dictation);

    dictationService.isSentenceDictation.and.returnValue(false);
    router.url = '/dictation-view/8';
    await service.startDictation({id: 8} as Dictation);

    expect(service.practiceAttemptSource()).toBe('card');
    expect(service.dictationAttemptMode()).toBe('long');
    expect(JSON.stringify(service.practiceAttemptSource())).not.toContain('Mary');
  });

  it('keeps the vocab source when a sentence dictation starts afterwards', async () => {
    const {service, router, dictationService} = setup('/vocabulary-starter');
    dictationService.isSentenceDictation.and.returnValue(false);
    await service.startDictation({id: -1} as Dictation);
    expect(service.practiceAttemptSource()).toBe('home');

    router.url = '/dictation-view/3';
    dictationService.isSentenceDictation.and.returnValue(true);
    await service.startDictation({id: 3, sentenceLength: 'Short', article: 'Secret'} as Dictation);

    expect(service.practiceAttemptSource()).toBe('home');
    expect(service.dictationAttemptMode()).toBe('short');
  });
});
