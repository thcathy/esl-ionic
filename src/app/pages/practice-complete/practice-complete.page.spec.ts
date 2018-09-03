import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {async, ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed} from '@angular/core/testing';

import { PracticeCompletePage } from './practice-complete.page';
import {dictation1} from "../../../test-config/test-data";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {DictationService} from "../../services/dictation/dictation.service";
import {
  LoadingControllerSpy,
  NavgationServiceSpy,
  StorageSpy,
  ToastControllerSpy
} from "../../../test-config/mocks-ionic";
import {LoadingController, ToastController} from "@ionic/angular";
import {NavigationService} from "../../services/navigation.service";
import {TranslateModule} from "@ngx-translate/core";
import {Storage} from "@ionic/storage";
import {Observable} from "rxjs/Observable";
import "rxjs-compat/add/observable/of";
import {SharedTestModule} from "../../../test-config/shared-test.module";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('PracticeCompletePage', () => {
  let component: PracticeCompletePage;
  let fixture: ComponentFixture<PracticeCompletePage>;
  let dictationServiceSpy;

  beforeEach(async(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['createVocabDictationHistory', 'isInstantDictation']);
    dictationServiceSpy.isInstantDictation.and.returnValue(false);

    const params = {
      'dictation': dictation1,
      'histories': [],
    };
    let storageSpy = StorageSpy();
    storageSpy.get.and.callFake((param) => {return params[param]});

    TestBed.configureTestingModule({
      declarations: [ PracticeCompletePage ],
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
                historyStored: 'true',
                mark: '10',
              })
            }
          }},
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call create history if history stored is true', fakeAsync(() => {
    fixture.detectChanges();
    expect(dictationServiceSpy.createVocabDictationHistory.calls.count()).toEqual(0);
  }));
});