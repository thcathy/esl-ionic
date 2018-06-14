import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  fakeAsync,
  TestBed
} from "@angular/core/testing";
import {IonicModule, NavController, NavParams, ToastController} from "ionic-angular";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {GoogleAnalyticsSpy} from "../../../test-config/mocks-ionic";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {SearchDictationPage} from "./search-dictation";
import {DictationService} from "../../providers/dictation/dictation.service";
import {of} from "rxjs/observable/of";
import {ComponentsModule} from "../../components/components.module";
import {NavigationService} from "../../providers/navigation.service";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";

describe('SearchDictationPage', () => {
  let fixture: ComponentFixture<SearchDictationPage>;
  let component: SearchDictationPage;
  let pageElement: HTMLElement;
  let googleAnalyticsSpy;
  let dictationServiceSpy;

  beforeEach(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['search']);
    dictationServiceSpy.search.and.returnValue(of(dictationServiceSpy));
    googleAnalyticsSpy = GoogleAnalyticsSpy();
    TestBed.configureTestingModule({
      declarations: [ SearchDictationPage ],
      imports: [
        IonicModule.forRoot(SearchDictationPage),
        TranslateModule.forRoot(),
        FormsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true },
        ToastController, NavController,
        { provide: DictationService, useValue: dictationServiceSpy },
        { provide: GoogleAnalytics, useValue: googleAnalyticsSpy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SearchDictationPage);
    component = fixture.componentInstance;
    pageElement = fixture.debugElement.nativeElement;
  });

  it('should create component', () => {
    expect(component).toBeDefined();
    expect(component.inputForm).toBeDefined();
  });

  it('call google analytics after view enter', fakeAsync(() => {
    component.ionViewDidLoad();
    expect(googleAnalyticsSpy.trackView.calls.mostRecent().args[0]).toEqual('search-dictation');
  }));

  it('form is validated', fakeAsync(() => {
    component.keyword.setValue('abcd');
    expect(component.keyword.errors.minlength).toBeDefined();
    component.keyword.setValue('123456789012345678901234567890123456789012345678901');
    expect(component.keyword.errors.maxlength).toBeDefined();

    component.creator.setValue('12');
    expect(component.creator.errors.minlength).toBeDefined();
    component.creator.setValue('123456789012345678901234567890123456789012345678901');
    expect(component.creator.errors.maxlength).toBeDefined();
  }));

});
