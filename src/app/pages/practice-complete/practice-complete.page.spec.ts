import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { PracticeCompletePage } from './practice-complete.page';
import {dictation1} from "../../../test-config/test-data";
import {DictationService} from "../../services/dictation/dictation.service";
import {
  AuthServiceSpy,
  DictationServiceSpy, MemberVocabularyServiceSpy,
  StorageSpy,
} from "../../../test-config/mocks-ionic";
import {Storage} from "@ionic/storage";
import "rxjs-compat/add/observable/of";
import {SharedTestModule} from "../../../test-config/shared-test.module";
import {MemberVocabularyService} from "../../services/practice/member-vocabulary.service";
import {AuthService} from "../../services/auth.service";

describe('PracticeCompletePage', () => {
  let component: PracticeCompletePage;
  let fixture: ComponentFixture<PracticeCompletePage>;
  let dictationServiceSpy = DictationServiceSpy();
  let memberVocabularyServiceSpy = MemberVocabularyServiceSpy();
  let storageSpy = StorageSpy();
  let authServiceSpy = AuthServiceSpy();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeCompletePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DictationService, useValue: dictationServiceSpy},
        { provide: MemberVocabularyService, useValue: memberVocabularyServiceSpy},
        { provide: Storage, useValue: storageSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not call create history if history stored is true', fakeAsync(() => {
    dictationServiceSpy.isInstantDictation.and.returnValue(false);
    dictationServiceSpy.isGeneratedDictation.and.returnValue(false);
    const params = {
      'dictation': dictation1,
      'histories': [],
      'historyStored': true,
    };
    storageSpy.get.and.callFake((param) => {return params[param]});
    authServiceSpy.isAuthenticated.and.returnValue(true);

    component.ionViewDidEnter();

    expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
  }));

  it('should not call create history if not login', fakeAsync(() => {
    dictationServiceSpy.isInstantDictation.and.returnValue(false);
    dictationServiceSpy.isGeneratedDictation.and.returnValue(true);
    const params = {
      'dictation': dictation1,
      'histories': [],
      'historyStored': false,
    };
    storageSpy.get.and.callFake((param) => {return params[param]});
    authServiceSpy.isAuthenticated.and.returnValue(false);

    component.ionViewDidEnter();
    tick();
    fixture.detectChanges();
    expect(memberVocabularyServiceSpy.saveHistory.calls.count()).toEqual(0);
    expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
  }));

  it('should call member vocabulary save history if dictation is generated', fakeAsync(() => {
    dictationServiceSpy.isInstantDictation.and.returnValue(false);
    dictationServiceSpy.isGeneratedDictation.and.returnValue(true);
    const params = {
      'dictation': dictation1,
      'histories': [],
      'historyStored': false,
    };
    storageSpy.get.and.callFake((param) => {return params[param]});
    authServiceSpy.isAuthenticated.and.returnValue(true);

    component.ionViewDidEnter();
    tick();
    fixture.detectChanges();

    expect(memberVocabularyServiceSpy.saveHistory.calls.count()).toEqual(1);
    expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
  }));
});
