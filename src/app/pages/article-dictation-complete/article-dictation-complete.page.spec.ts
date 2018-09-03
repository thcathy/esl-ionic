import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';

import { ArticleDictationCompletePage } from './article-dictation-complete.page';
import {SharedTestModule} from "../../../test-config/shared-test.module";
import {dictation1, dictation1Histories} from "../../../test-config/test-data";
import {StorageSpy} from "../../../test-config/mocks-ionic";
import {Storage} from "@ionic/storage";
import {DictationService} from "../../services/dictation/dictation.service";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('ArticleDictationCompletePage', () => {
  let component: ArticleDictationCompletePage;
  let fixture: ComponentFixture<ArticleDictationCompletePage>;
  let dictationServiceSpy;

  beforeEach(async(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['createSentenceDictationHistory', 'isInstantDictation']);
    dictationServiceSpy.isInstantDictation.and.returnValue(false);

    const params = {
      'dictation': dictation1,
      'histories': dictation1Histories
    };
    let storageSpy = StorageSpy();
    storageSpy.get.and.callFake((param) => {return params[param]});

    TestBed.configureTestingModule({
      declarations: [ ArticleDictationCompletePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DictationService, useValue: dictationServiceSpy},
        { provide: Storage, useValue: storageSpy },
        { provide: ActivatedRoute, useValue: {
            snapshot: {
              paramMap: convertToParamMap({
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
});