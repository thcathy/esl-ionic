import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';

import {ArticleDictationCompletePage} from './article-dictation-complete.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {dictation1, dictation1Histories, member1} from '../../../testing/test-data';
import {FFSAuthServiceSpy, ManageVocabHistoryServiceSpy, NavigationServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {DictationService} from '../../services/dictation/dictation.service';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {StorageService} from '../../services/storage.service';
import {FFSAuthService} from '../../services/auth.service';
import {NavigationService} from '../../services/navigation.service';
import {Dictation, Dictations} from '../../entity/dictation';

describe('ArticleDictationCompletePage', () => {
  let component: ArticleDictationCompletePage;
  let fixture: ComponentFixture<ArticleDictationCompletePage>;
  let dictationServiceSpy;
  let authServiceSpy;
  let navigationServiceSpy;

  beforeEach(waitForAsync(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['createSentenceDictationHistory', 'isInstantDictation']);
    dictationServiceSpy.isInstantDictation.and.returnValue(false);

    authServiceSpy = FFSAuthServiceSpy();
    authServiceSpy.isAuthenticated.and.returnValue(true);

    navigationServiceSpy = NavigationServiceSpy();
    navigationServiceSpy.editDictation = jasmine.createSpy('editDictation');

    const params = {
      'dictation': dictation1,
      'histories': dictation1Histories
    };
    const storageSpy = StorageSpy();
    storageSpy.get.and.callFake((param) => params[param]);

    TestBed.configureTestingModule({
      declarations: [ ArticleDictationCompletePage,  ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DictationService, useValue: dictationServiceSpy},
        { provide: StorageService, useValue: storageSpy },
        { provide: ManageVocabHistoryService, useValue: ManageVocabHistoryServiceSpy},
        { provide: FFSAuthService, useValue: authServiceSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
        { provide: ActivatedRoute, useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({
                historyStored: 'true'
              })
            }
          }},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleDictationCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call create history if history stored is true', fakeAsync(() => {
    fixture.detectChanges();
    expect(dictationServiceSpy.createSentenceDictationHistory.calls.count()).toEqual(0);
  }));

  it('should not call create history if not authenticated', fakeAsync(() => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.historyStored = false;
    component.init();
    expect(dictationServiceSpy.createSentenceDictationHistory.calls.count()).toEqual(0);
  }));

  describe('showEditButton', () => {
    function ownerFillInDictation(): Dictation {
      const dictation = { ...dictation1, id: 1, source: Dictations.Source.FillIn, creator: member1 };
      return dictation;
    }

    beforeEach(() => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
      authServiceSpy.userProfile = { email: member1.emailAddress };
    });

    it('returns true for owner FillIn saved dictation', () => {
      component.dictation = ownerFillInDictation();
      expect(component.showEditButton()).toBeTrue();
    });

    it('returns false for non-owner', () => {
      component.dictation = ownerFillInDictation();
      authServiceSpy.userProfile = { email: 'other@gmail.com' };
      expect(component.showEditButton()).toBeFalse();
    });

    it('returns false when unauthenticated', () => {
      component.dictation = ownerFillInDictation();
      authServiceSpy.isAuthenticated.and.returnValue(false);
      expect(component.showEditButton()).toBeFalse();
    });

    it('returns false for non-FillIn source', () => {
      component.dictation = { ...ownerFillInDictation(), source: Dictations.Source.Generate };
      expect(component.showEditButton()).toBeFalse();
    });

    it('returns false when id <= 0', () => {
      component.dictation = { ...ownerFillInDictation(), id: 0 };
      expect(component.showEditButton()).toBeFalse();
    });

    it('returns false when creator is undefined', () => {
      component.dictation = { ...ownerFillInDictation(), creator: undefined };
      expect(component.showEditButton()).toBeFalse();
    });

    it('Edit tap calls navigationService.editDictation once', () => {
      const dictation = ownerFillInDictation();
      component.dictation = dictation;
      component.navigationService.editDictation(dictation);
      expect(navigationServiceSpy.editDictation).toHaveBeenCalledOnceWith(dictation);
    });
  });
});
