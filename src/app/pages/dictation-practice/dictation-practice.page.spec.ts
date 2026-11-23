import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';

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
    speechServiceSpy = jasmine.createSpyObj('SpeechService', ['speakByVoiceMode', 'prefetchByVoiceMode', 'getVoiceMode', 'ensureVoiceModeLoaded']);
    speechServiceSpy.speakByVoiceMode.and.resolveTo('local');
    speechServiceSpy.prefetchByVoiceMode.and.resolveTo(true);
    speechServiceSpy.getVoiceMode.and.resolveTo('local');
    speechServiceSpy.ensureVoiceModeLoaded.and.resolveTo();

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
    component.preload = jasmine.createSpyObj('DictationPreloadComponent', [
      'start', 'completeCategory',
      'recordQuestion', 'recordVoice', 'recordImage',
    ]) as any;
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
      component.onPreloadCompleted({ useLocalVoice: false });
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

  describe('hideAppFooter', () => {
    it('stays visible when the virtual keyboard is closed', () => {
      component.dictation = { options: { practiceType: VocabPracticeType.Spell } } as any;
      component.isKeyboardActive = false;
      expect(component.hideAppFooter).toBeFalse();
    });

    it('hides while the spell keyboard is open', () => {
      component.dictation = { options: { practiceType: VocabPracticeType.Spell } } as any;
      component.isKeyboardActive = true;
      expect(component.hideAppFooter).toBeTrue();
    });

    it('stays visible in puzzle mode because that keyboard is disabled', () => {
      component.dictation = { options: { practiceType: VocabPracticeType.Puzzle } } as any;
      component.isKeyboardActive = true;
      expect(component.hideAppFooter).toBeFalse();
    });

    it('stays visible for Write on paper', () => {
      component.dictation = { options: { practiceType: VocabPracticeType.Paper } } as any;
      component.isKeyboardActive = true;
      expect(component.hideAppFooter).toBeFalse();
    });
  });

  describe('Write on paper', () => {
    function questions() {
      return [{ word: 'apple' }, { word: 'playground' }, { word: 'elephant' }] as any[];
    }

    beforeEach(() => {
      component.dictation = { options: { practiceType: VocabPracticeType.Paper } } as any;
      component.vocabPractices = questions();
      component.questionIndex = 0;
    });

    it('advances with Next and does not save a skip as wrong', () => {
      component.onPaperNext();

      expect(component.questionIndex).toBe(1);
      expect(component.histories).toEqual([]);
      expect(component.paperMarking).toBeFalse();
      expect(navigationServiceSpy.practiceComplete).not.toHaveBeenCalled();
    });

    it('opens marking after the last word without saving', () => {
      component.questionIndex = 2;

      component.onPaperNext();

      expect(component.paperMarking).toBeTrue();
      expect(component.paperMarks).toEqual([null, null, null]);
      expect(component.histories).toEqual([]);
      expect(component.canFinishPaper).toBeFalse();
      expect(navigationServiceSpy.practiceComplete).not.toHaveBeenCalled();
    });

    it('keeps Finish disabled until every item is ticked', () => {
      component.paperMarking = true;
      component.paperMarks = [null, null, null];

      component.finishPaper();
      expect(navigationServiceSpy.practiceComplete).not.toHaveBeenCalled();

      component.setPaperMark(0, true);
      expect(component.canFinishPaper).toBeFalse();
      component.setPaperMark(1, false);
      expect(component.canFinishPaper).toBeFalse();
      component.setPaperMark(2, true);
      expect(component.canFinishPaper).toBeTrue();
    });

    it('mark all fills only unmarked items', () => {
      component.paperMarks = [true, null, false];

      component.markUnmarkedPaper(false);

      expect(component.paperMarks).toEqual([true, false, false]);

      component.paperMarks = [null, true, null];
      component.markUnmarkedPaper(true);

      expect(component.paperMarks).toEqual([true, true, true]);
      expect(component.canFinishPaper).toBeTrue();
    });

    it('keeps questions in list order when responses arrive out of order', fakeAsync(() => {
      const vocabPractice = TestBed.inject(VocabPracticeService) as jasmine.SpyObj<VocabPracticeService>;
      vocabPractice.getQuestion.and.callFake((word: string) => of({word} as any).pipe(delay(word === 'apple' ? 40 : 0)));
      const dictation = {
        id: 2,
        vocabs: [{word: 'apple'}, {word: 'banana'}, {word: 'cat'}],
        showImage: false,
        options: {practiceType: VocabPracticeType.Paper},
      };
      storageSpy.get.and.callFake((param) => Promise.resolve(param === 'dictation' ? dictation : null));

      component.initDictation();
      tick(50);

      expect(component.vocabPractices.map(question => question.word)).toEqual(['apple', 'banana', 'cat']);
    }));

    it('finishes with tick results and empty answers in list order', () => {
      component.paperMarking = true;
      component.paperMarks = [true, false, true];

      component.finishPaper();

      expect(navigationServiceSpy.practiceComplete).toHaveBeenCalledOnceWith({
        dictation: component.dictation,
        mark: 2,
        histories: [
          jasmine.objectContaining({ answer: '', correct: true, question: component.vocabPractices[0] }),
          jasmine.objectContaining({ answer: '', correct: false, question: component.vocabPractices[1] }),
          jasmine.objectContaining({ answer: '', correct: true, question: component.vocabPractices[2] }),
        ],
      });
    });
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
