import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { PracticeCompletePage } from './practice-complete.page';
import {dictation1} from "../../../test-config/test-data";
import {DictationService} from "../../services/dictation/dictation.service";
import {
  AuthServiceSpy,
  DictationServiceSpy, ManageVocabHistoryServiceSpy, NavigationServiceSpy,
  StorageSpy, VocabPracticeServiceSpy,
} from "../../../test-config/mocks-ionic";
import {Storage} from "@ionic/storage";
import "rxjs-compat/add/observable/of";
import {SharedTestModule} from "../../../test-config/shared-test.module";
import {AuthService} from "../../services/auth.service";
import {NavigationService} from "../../services/navigation.service";
import {VocabPracticeService} from "../../services/practice/vocab-practice.service";
import {ManageVocabHistoryService} from "../../services/member/manage-vocab-history.service";

describe('PracticeCompletePage', () => {
  let component: PracticeCompletePage;
  let fixture: ComponentFixture<PracticeCompletePage>;
  let dictationServiceSpy = DictationServiceSpy();
  let vocabPracticeServiceSpy = VocabPracticeServiceSpy();
  let storageSpy = StorageSpy();
  let authServiceSpy = AuthServiceSpy();
  let navigationServiceSpy = NavigationServiceSpy();
  let manageVocabHistoryServiceSpy = ManageVocabHistoryServiceSpy();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeCompletePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DictationService, useValue: dictationServiceSpy},
        { provide: VocabPracticeService, useValue: vocabPracticeServiceSpy},
        { provide: Storage, useValue: storageSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ManageVocabHistoryService, useValue: manageVocabHistoryServiceSpy},
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
    expect(vocabPracticeServiceSpy.saveHistory.calls.count()).toEqual(0);
    expect(manageVocabHistoryServiceSpy.classifyVocabulary.calls.count()).toEqual(0);
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

    expect(vocabPracticeServiceSpy.saveHistory.calls.count()).toEqual(1);
    expect(manageVocabHistoryServiceSpy.classifyVocabulary.calls.count()).toEqual(1);
    expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
  }));

  it('retry generated dictation will go to vocabulary starter', fakeAsync(()=> {
    dictationServiceSpy.isInstantDictation.and.returnValue(false);
    dictationServiceSpy.isGeneratedDictation.and.returnValue(true);
    const params = {
      'dictation': dictation1,
      'histories': [],
      'historyStored': false,
    };
    storageSpy.get.and.callFake((param) => {return params[param]});

    component.ionViewDidEnter();
    tick();
    fixture.detectChanges();
    component.getDictationThenOpen();

    expect(navigationServiceSpy.openVocabularyStarter.calls.count()).toEqual(1);
  }));
});
