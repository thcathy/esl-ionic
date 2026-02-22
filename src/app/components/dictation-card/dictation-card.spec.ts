import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {DictationCardComponent} from './dictation-card';
import {memberVocabularyMember1Apple, memberVocabularyMember1Banana, memberVocabularyMember1Cat, TestData} from '../../../testing/test-data';
import {ManageVocabHistoryServiceSpy} from '../../../testing/mocks-ionic';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {NavigationService} from '../../services/navigation.service';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {UIOptionsService} from '../../services/ui-options.service';

describe('DictationCardComponent', () => {
  let component: DictationCardComponent;
  let fixture: ComponentFixture<DictationCardComponent>;
  let manageVocabHistoryServiceSpy, navigationServiceSpy, uiOptionsService;

  beforeEach(waitForAsync(() => {
    manageVocabHistoryServiceSpy = ManageVocabHistoryServiceSpy();

    TestBed.configureTestingModule({
      declarations: [ DictationCardComponent ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      providers: [
        { provide: ManageVocabHistoryService, useValue: manageVocabHistoryServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationCardComponent);
    component = fixture.componentInstance;
    navigationServiceSpy = TestBed.inject(NavigationService) as any;
    uiOptionsService = TestBed.inject(UIOptionsService) as any;
  });

  describe('dictation source is FillIn', () => {
    it('html elements display correctly', fakeAsync(() => {
      component.dictation = TestData.fillInDictation();
      component.edit = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.section-info ion-card-header ion-card-title')?.textContent).toContain('Dictation');
      expect(fixture.nativeElement.querySelector('.section-info .descriptionTR')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.section-info .suitableTR')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.section-info .recommendTR')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.section-content .fillin-vocabs')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.section-info .share-button')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.section-info .edit-button')).toBeTruthy();
    }));
  });

  describe('dictation source is Select', () => {
    beforeEach(() => {
      component.dictation = TestData.selectDictation();
    });

    it('html elements display correctly', fakeAsync(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.section-info ion-card-header ion-card-title')?.textContent).toContain('Vocabulary Exercise');
      expect(fixture.nativeElement.querySelector('.section-info .descriptionTR')).toBeNull();
      expect(fixture.nativeElement.querySelector('.section-info .suitableTR')).toBeNull();
      expect(fixture.nativeElement.querySelector('.section-info .recommendTR')).toBeNull();
      expect(fixture.nativeElement.querySelector('.section-content .select-vocab-list')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.section-info .share-button')).toBeNull();
      expect(fixture.nativeElement.querySelector('.section-info .edit-button')).toBeNull();
    }));

    it('if the vocab is learnt will show badge', fakeAsync(() => {
      manageVocabHistoryServiceSpy.isLearnt.and.returnValue(true);
      const apple = memberVocabularyMember1Apple();
      const banana = memberVocabularyMember1Banana();
      const cat = memberVocabularyMember1Cat();
      manageVocabHistoryServiceSpy.findMemberVocabulary.and.callFake((word: string) => {
        if (word === 'banana') {
          return banana;
        }
        if (word === 'cat') {
          return cat;
        }
        return apple;
      });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.select-vocab-list ion-badge')).toBeTruthy();
    }));
  });

  describe('sentence dictation', () => {
    beforeEach(() => {
      component.dictation = new TestData.DefaultSentenceDictation();
      component.showPracticeOptions = true;
      fixture.detectChanges();
    });

    it('show inline article options when start enabled', fakeAsync(() => {
      expect(fixture.nativeElement.querySelector('.section-options app-article-dictation-options')).toBeTruthy();
    }));
  });

  describe('word dictation', () => {
    beforeEach(() => {
      component.dictation = TestData.fillInDictation();
      component.showPracticeOptions = true;
      fixture.detectChanges();
    });

    it('show inline start practice selector', fakeAsync(() => {
      expect(fixture.nativeElement.querySelector('.section-options app-vocab-practice-type-selector')).toBeTruthy();
    }));

    it('start vocab dictation with selected type', fakeAsync(() => {
      spyOn(uiOptionsService, 'saveOption').and.returnValue(Promise.resolve());
      component.startVocabDictation(VocabPracticeType.Puzzle);
      expect(component.dictation.options.practiceType).toEqual(VocabPracticeType.Puzzle);
      expect(uiOptionsService.saveOption).toHaveBeenCalledWith(UIOptionsService.keys.vocabPracticeType, VocabPracticeType.Puzzle);
      expect(navigationServiceSpy.startDictation).toHaveBeenCalledWith(component.dictation);
    }));
  });

  describe('start option persistence', () => {
    it('load saved voice mode and practice type on init', async () => {
      component.dictation = TestData.fillInDictation();
      component.dictation.options = {practiceType: VocabPracticeType.Puzzle} as any;
      spyOn(uiOptionsService, 'loadOption').and.callFake((key: string) => {
        if (key === UIOptionsService.keys.ttsVoiceMode) {
          return Promise.resolve(UIOptionsService.voiceMode.local);
        }
        if (key === UIOptionsService.keys.vocabPracticeType) {
          return Promise.resolve(VocabPracticeType.Spell);
        }
        return Promise.resolve(null);
      });

      await component.ngOnInit();

      expect(component.selectedVoiceMode).toBe(UIOptionsService.voiceMode.local);
      expect(component.selectedStartPracticeType).toBe(VocabPracticeType.Puzzle);
    });

    it('save voice and practice type when starting vocab dictation', fakeAsync(() => {
      spyOn(uiOptionsService, 'saveOption').and.returnValue(Promise.resolve());
      component.selectedVoiceMode = UIOptionsService.voiceMode.local;
      component.dictation = TestData.fillInDictation();

      component.startVocabDictation(VocabPracticeType.Puzzle);

      expect(uiOptionsService.saveOption).toHaveBeenCalledWith(UIOptionsService.keys.ttsVoiceMode, UIOptionsService.voiceMode.local);
      expect(uiOptionsService.saveOption).toHaveBeenCalledWith(UIOptionsService.keys.vocabPracticeType, VocabPracticeType.Puzzle);
      expect(component.dictation.options.practiceType).toBe(VocabPracticeType.Puzzle);
    }));
  });

});
