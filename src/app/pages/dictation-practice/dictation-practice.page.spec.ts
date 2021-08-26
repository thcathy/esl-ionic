import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { DictationPracticePage } from './dictation-practice.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {NavigationServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {dictation2_vocabDictation} from '../../../testing/test-data';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {NavigationService} from '../../services/navigation.service';

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
    fit('', fakeAsync(() => {
      const params = {
        'dictation': dictation2_vocabDictation,
        'vocabPracticeType': VocabPracticeType.Spell,
      };
      // storageSpy.get('dictation').and.returnValue(dictation2_vocabDictation);

      spyOn(storageSpy, 'get').withArgs('dictation').and.returnValue(dictation2_vocabDictation);
      spyOn(storageSpy, 'get').withArgs('vocabPracticeType').and.returnValue(VocabPracticeType.Spell);
      // storageSpy.get.and.callFake((param) => params[param]);

      component.initDictation();
      tick();
    }));
  });
});
