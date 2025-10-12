import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';

import {ArticleDictationCompletePage} from './article-dictation-complete.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {dictation1, dictation1Histories} from '../../../testing/test-data';
import {FFSAuthServiceSpy, ManageVocabHistoryServiceSpy, StorageSpy} from '../../../testing/mocks-ionic';
import {DictationService} from '../../services/dictation/dictation.service';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';
import {StorageService} from '../../services/storage.service';
import {FFSAuthService} from '../../services/auth.service';

describe('ArticleDictationCompletePage', () => {
  let component: ArticleDictationCompletePage;
  let fixture: ComponentFixture<ArticleDictationCompletePage>;
  let dictationServiceSpy;
  let authServiceSpy;

  beforeEach(waitForAsync(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['createSentenceDictationHistory', 'isInstantDictation']);
    dictationServiceSpy.isInstantDictation.and.returnValue(false);
    
    authServiceSpy = FFSAuthServiceSpy();
    authServiceSpy.isAuthenticated.and.returnValue(true);

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
});
