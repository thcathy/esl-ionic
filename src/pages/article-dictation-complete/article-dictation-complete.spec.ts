import {ComponentFixture, ComponentFixtureAutoDetect, fakeAsync, TestBed} from "@angular/core/testing";
import {IonicModule, NavController, NavParams, ToastController} from "ionic-angular";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {GoogleAnalyticsSpy, NavgationServiceSpy, NavMock} from "../../../test-config/mocks-ionic";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {ArticleDictationCompletePage} from "./article-dictation-complete";
import {DictationService} from "../../providers/dictation/dictation.service";
import {dictation1, dictation1Histories} from "../../../test-config/test-data";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {NavigationService} from "../../providers/navigation.service";

describe('ArticleDictationCompletePage', () => {
  let fixture: ComponentFixture<ArticleDictationCompletePage>;
  let pageElement: HTMLElement;
  let dictationServiceSpy;

  beforeEach(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['createSentenceDictationHistory', 'isInstantDictation']);
    const navParamSpy = jasmine.createSpyObj('NavParams', ['get']);
    var params = {
      'historyStored': true,
      'dictation': dictation1,
      'histories': dictation1Histories
    }
    navParamSpy.get.and.callFake((myParam) => {return params[myParam];});
    dictationServiceSpy.isInstantDictation.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [ ArticleDictationCompletePage ],
      imports: [
        IonicModule.forRoot(ArticleDictationCompletePage),
        TranslateModule.forRoot(),
        FormsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: DictationService, useValue: dictationServiceSpy},
        { provide: NavParams, useValue: navParamSpy},
        ToastController,
        { provide: NavController, useValue: NavMock },
        { provide: GoogleAnalytics, useValue: GoogleAnalyticsSpy() },
        { provide: NavigationService, useValue: NavgationServiceSpy() },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ArticleDictationCompletePage);
    pageElement = fixture.debugElement.nativeElement;
  });



  it('should not call create history if history stored is true', fakeAsync(() => {
    fixture.detectChanges();
    expect(dictationServiceSpy.createSentenceDictationHistory.calls.count()).toEqual(0);
  }));
});
