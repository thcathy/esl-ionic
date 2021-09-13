import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {PracticeCompletePage, PracticeCompletePageInput} from './practice-complete.page';
import {dictation1} from '../../../testing/test-data';
import {DictationService} from '../../services/dictation/dictation.service';
import {AuthServiceSpy, DictationServiceSpy, IonicComponentServiceSpy, ManageVocabHistoryServiceSpy, NavigationServiceSpy, StorageSpy, VocabPracticeServiceSpy,} from '../../../testing/mocks-ionic';
import {Storage} from '@ionic/storage';
import 'rxjs-compat/add/observable/of';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {AuthService} from '../../services/auth.service';
import {NavigationService} from '../../services/navigation.service';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {IonicComponentService} from '../../services/ionic-component.service';
import {Observable} from 'rxjs';

describe('PracticeCompletePage', () => {
  let component: PracticeCompletePage;
  let fixture: ComponentFixture<PracticeCompletePage>;
  let dictationServiceSpy, vocabPracticeServiceSpy, storageSpy,
    authServiceSpy, navigationServiceSpy, manageVocabHistoryServiceSpy, ionicComponentServiceSpy;
  let defaultInput;

  beforeEach(async(() => {
    vocabPracticeServiceSpy = VocabPracticeServiceSpy();
    dictationServiceSpy = DictationServiceSpy();
    storageSpy = StorageSpy();
    authServiceSpy = AuthServiceSpy();
    navigationServiceSpy = NavigationServiceSpy();
    manageVocabHistoryServiceSpy = ManageVocabHistoryServiceSpy();
    ionicComponentServiceSpy = IonicComponentServiceSpy();

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
        { provide: ManageVocabHistoryService, useValue: manageVocabHistoryServiceSpy },
        { provide: IonicComponentService, useValue: ionicComponentServiceSpy },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const dictation = dictation1;
    dictation.options = { 'practiceType': VocabPracticeType.Puzzle };
    defaultInput = <PracticeCompletePageInput>{
      dictation: dictation,
      histories: [],
      historyStored: false,
    };
  });

  it('should not call create history if history stored is true', fakeAsync(() => {
    dictationServiceSpy.isInstantDictation.and.returnValue(false);
    dictationServiceSpy.isGeneratedDictation.and.returnValue(false);
    defaultInput.historyStored = true;
    const params = { 'practiceCompletePageInput': defaultInput };
    storageSpy.get.and.callFake((param) => params[param]);
    authServiceSpy.isAuthenticated.and.returnValue(true);

    component.ionViewWillEnter();

    expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
  }));

  it('should not call save history if not login', fakeAsync(() => {
    dictationServiceSpy.isInstantDictation.and.returnValue(false);
    dictationServiceSpy.isGeneratedDictation.and.returnValue(true);
    const params = { 'practiceCompletePageInput': defaultInput };
    storageSpy.get.and.callFake((param) => params[param]);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    component.ionViewWillEnter();
    tick();
    fixture.detectChanges();
    expect(vocabPracticeServiceSpy.saveHistory.calls.count()).toEqual(0);
    expect(manageVocabHistoryServiceSpy.classifyVocabulary.calls.count()).toEqual(0);
    expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
  }));

  describe('test retry', () => {
    it('retry generated dictation will go to vocabulary starter with correct vocabulary practice type', fakeAsync(() => {
      dictationServiceSpy.isInstantDictation.and.returnValue(false);
      dictationServiceSpy.isGeneratedDictation.and.returnValue(true);
      const params = { 'practiceCompletePageInput': defaultInput };
      storageSpy.get.and.callFake((param) => params[param]);
      component.ionViewWillEnter();
      tick();
      fixture.detectChanges();
      component.getDictationThenOpen();

      expect(navigationServiceSpy.startDictation.calls.count()).toEqual(1);
      expect(navigationServiceSpy.startDictation.calls.mostRecent().args[0].options.practiceType).toEqual(VocabPracticeType.Puzzle);
    }));

    it('show vocabulary practice type options for saved vocabulary dictation', fakeAsync(() => {
      dictationServiceSpy.isInstantDictation.and.returnValue(false);
      dictationServiceSpy.isGeneratedDictation.and.returnValue(false);
      dictationServiceSpy.isSentenceDictation.and.returnValue(true);
      dictationServiceSpy.getById.and.returnValue(Observable.of(dictation1));
      ionicComponentServiceSpy.presentVocabPracticeTypeActionSheet.and.returnValue(Promise.resolve(VocabPracticeType.Puzzle));
      const params = { 'practiceCompletePageInput': defaultInput };
      storageSpy.get.and.callFake((param) => params[param]);
      component.ionViewWillEnter();
      tick();
      fixture.detectChanges();
      component.getDictationThenOpen();

      expect(navigationServiceSpy.startDictation.calls.count()).toEqual(0);
      expect(ionicComponentServiceSpy.presentVocabPracticeTypeActionSheet.calls.count()).toEqual(1);
    }));
  });

  describe('test createHistory', () => {
    it('do not create history for practice type is puzzle', fakeAsync(() => {
      defaultInput.dictation.options.practiceType = VocabPracticeType.Puzzle;
      const params = { 'practiceCompletePageInput': defaultInput };
      storageSpy.get.and.callFake((param) => params[param]);
      component.ionViewWillEnter();
      tick();

      expect(vocabPracticeServiceSpy.saveHistory).toHaveBeenCalledTimes(0);
      expect(dictationServiceSpy.createVocabDictationHistory).toHaveBeenCalledTimes(0);
    }));

    it('should call member vocabulary save history if dictation is generated', fakeAsync(() => {
      dictationServiceSpy.isInstantDictation.and.returnValue(false);
      dictationServiceSpy.isGeneratedDictation.and.returnValue(true);
      defaultInput.dictation.options.practiceType = VocabPracticeType.Spell;
      const params = { 'practiceCompletePageInput': defaultInput };
      storageSpy.get.and.callFake((param) => params[param]);
      authServiceSpy.isAuthenticated.and.returnValue(true);
      component.ionViewWillEnter();
      tick();

      expect(vocabPracticeServiceSpy.saveHistory.calls.count()).toEqual(1);
      expect(manageVocabHistoryServiceSpy.classifyVocabulary.calls.count()).toEqual(1);
      expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
    }));
  });

});
