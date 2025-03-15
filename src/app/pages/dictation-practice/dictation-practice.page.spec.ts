import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {DictationPracticePage} from './dictation-practice.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {NavigationServiceSpy, StorageSpy, VocabPracticeServiceSpy} from '../../../testing/mocks-ionic';
import {dictation2_vocabDictation} from '../../../testing/test-data';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {NavigationService} from '../../services/navigation.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {StorageService} from '../../services/storage.service';

describe('DictationPracticePage', () => {
  let component: DictationPracticePage;
  let fixture: ComponentFixture<DictationPracticePage>;
  let storageSpy, navigationServiceSpy;

  beforeEach(waitForAsync(() => {
    storageSpy = StorageSpy();
    navigationServiceSpy = NavigationServiceSpy();

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
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationPracticePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      expect(fixture.nativeElement.querySelector('.spell-input-div')).toBeDefined();
      expect(fixture.nativeElement.querySelector('.puzzle-div')).toBeNull();
    }));
  });
});
