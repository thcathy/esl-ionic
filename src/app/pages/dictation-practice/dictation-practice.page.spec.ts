import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { DictationPracticePage } from './dictation-practice.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {Storage} from '@ionic/storage';
import {NavigationServiceSpy, SpeechServiceSpy, StorageSpy, VocabPracticeServiceSpy} from '../../../testing/mocks-ionic';
import {dictation2_vocabDictation} from '../../../testing/test-data';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {NavigationService} from '../../services/navigation.service';
import {SpeechService} from '../../services/speech.service';
import {count, tap} from 'rxjs/operators';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';

describe('DictationPracticePage', () => {
  let component: DictationPracticePage;
  let fixture: ComponentFixture<DictationPracticePage>;
  let storageSpy, navigationServiceSpy;

  beforeEach(async(() => {
    storageSpy = StorageSpy();
    navigationServiceSpy = NavigationServiceSpy();

    TestBed.configureTestingModule({
      declarations: [ DictationPracticePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Storage, useValue: storageSpy },
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
    fit('will call speak once', fakeAsync(() => {
      const params = {
        'dictation': dictation2_vocabDictation,
        'vocabPracticeType': VocabPracticeType.Spell,
      };
      storageSpy.get.and.callFake((param) => params[param]);
      let total = 0;
      component.speak$.subscribe(v => total += 1);

      component.initDictation();
      tick();
      expect(component.vocabPractices.length).toBe(dictation2_vocabDictation.vocabs.length);
      expect(total).toBe(1);
    }));
  });
});
