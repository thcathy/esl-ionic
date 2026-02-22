import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {DictationPracticePage} from './dictation-practice.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {NavigationServiceSpy, StorageSpy, VocabPracticeServiceSpy} from '../../../testing/mocks-ionic';
import {dictation2_vocabDictation} from '../../../testing/test-data';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {NavigationService} from '../../services/navigation.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {SpeechService} from '../../services/speech.service';
import {StorageService} from '../../services/storage.service';
import {TranslateService} from '@ngx-translate/core';

describe('DictationPracticePage', () => {
  let component: DictationPracticePage;
  let fixture: ComponentFixture<DictationPracticePage>;
  let storageSpy, navigationServiceSpy, speechServiceSpy, translateService;

  beforeEach(waitForAsync(() => {
    storageSpy = StorageSpy();
    navigationServiceSpy = NavigationServiceSpy();
    speechServiceSpy = jasmine.createSpyObj('SpeechService', ['speakByVoiceMode', 'prefetchByVoiceMode']);
    speechServiceSpy.speakByVoiceMode.and.resolveTo('local');
    speechServiceSpy.prefetchByVoiceMode.and.resolveTo();

    TestBed.configureTestingModule({
      declarations: [ DictationPracticePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StorageService, useValue: storageSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: VocabPracticeService, useValue: VocabPracticeServiceSpy() },
        { provide: SpeechService, useValue: speechServiceSpy },
      ],
    });
    TestBed.overrideTemplate(DictationPracticePage, '');
    TestBed
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationPracticePage);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    translateService.currentLang = 'en';
  });

  describe('initDictation', () => {
    it('will call speak once', fakeAsync(() => {
      const dictation = dictation2_vocabDictation;
      dictation.options = { 'practiceType': VocabPracticeType.Spell };
      const params = { 'dictation': dictation };
      storageSpy.get.and.callFake((param) => Promise.resolve(params[param]));
      let total = 0;
      component.speak$.subscribe(v => total += 1);

      component.initDictation();
      tick();
      expect(component.vocabPractices.length).toBe(dictation.vocabs.length);
      expect(total).toBe(1);
    }));

    it('default practice type be Spell', fakeAsync(() => {
      const params = { 'dictation': dictation2_vocabDictation };
      storageSpy.get.and.callFake((param) => params[param]);
      component.initDictation();
      tick();
      expect(component.practiceType).toBe(VocabPracticeType.Spell);
    }));
  });

  describe('speak', () => {
    it('routes to speech service with pronounce url when available', () => {
      component.dictation = { options: { speakPunctuation: true } } as any;
      component.vocabPractices = [{ word: 'hello', activePronounceLink: 'https://x/a.mp3' } as any];
      component.questionIndex = 0;

      component.speak();

      expect(speechServiceSpy.speakByVoiceMode).toHaveBeenCalledWith('hello', {
        speakPunctuation: true,
        pronounceUrl: 'https://x/a.mp3',
      });
    });

    it('routes to speech service when pronounce link is unavailable', () => {
      component.dictation = { options: { speakPunctuation: true } } as any;
      component.vocabPractices = [{ word: 'hello' } as any];
      component.questionIndex = 0;

      component.speak();

      expect(speechServiceSpy.speakByVoiceMode).toHaveBeenCalledWith('hello', {
        speakPunctuation: true,
        pronounceUrl: undefined,
      });
    });
  });
});
