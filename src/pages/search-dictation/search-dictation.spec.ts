import {
  async,
  ComponentFixture,
  ComponentFixtureAutoDetect,
  fakeAsync, flushMicrotasks,
  TestBed, tick
} from "@angular/core/testing";
import {
  IonicModule,
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {GoogleAnalyticsSpy, StorageSpy} from "../../../test-config/mocks-ionic";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {SearchDictationPage} from "./search-dictation";
import {DictationService} from "../../providers/dictation/dictation.service";
import {of} from "rxjs/observable/of";
import {ComponentsModule} from "../../components/components.module";
import {NavigationService} from "../../providers/navigation.service";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {Storage} from "@ionic/storage";
import {asyncData} from "../../testing/test-helpers";
import {LoadingControllerMock, LoadingMock} from "ionic-mocks";

describe('SearchDictationPage', () => {
  let fixture: ComponentFixture<SearchDictationPage>;
  let component: SearchDictationPage;
  let pageElement: HTMLElement;
  let googleAnalyticsSpy;
  let dictationServiceSpy;
  let storageSpy;

  beforeEach(() => {
    dictationServiceSpy = jasmine.createSpyObj('DictationService', ['search']);
    dictationServiceSpy.search.and.returnValue(of(dictationServiceSpy));
    googleAnalyticsSpy = GoogleAnalyticsSpy();
    storageSpy = StorageSpy();
    storageSpy.get.and.returnValue(Promise.resolve(['old search history']));
    let loading = LoadingMock.instance();

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
        ToastController, NavController, LoadingController,
        { provide: DictationService, useValue: dictationServiceSpy },
        { provide: GoogleAnalytics, useValue: googleAnalyticsSpy },
        { provide: Storage, useValue: storageSpy },
        { provide: LoadingController, useValue: LoadingControllerMock.instance(loading) },
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

  it('form is validated', () => {
    component.keyword.setValue('ab');
    expect(component.keyword.errors.minlength).toBeDefined();
    component.keyword.setValue('123456789012345678901234567890123456789012345678901');
    expect(component.keyword.errors.maxlength).toBeDefined();

    component.creator.setValue('12');
    expect(component.creator.errors.minlength).toBeDefined();
    component.creator.setValue('123456789012345678901234567890123456789012345678901');
    expect(component.creator.errors.maxlength).toBeDefined();
  });

  it('date options are pre-set', fakeAsync(() => {
    const thisMonth = new Date().getMonth();
    const options = component.createDateOptions();

    expect(options[0].option).toBe('Any');
    expect(options[0].date).not.toBeDefined();
    expect(options[1].option).toBe('Within 1 Month');
    expect([1, -11]).toContain(thisMonth - options[1].date.getMonth());
    expect(options[2].option).toBe('Within 3 Month');
    expect([3, -9]).toContain(thisMonth - options[2].date.getMonth());
    expect(options[3].option).toBe('Within Half Year');
    expect([6, -6]).toContain(thisMonth - options[3].date.getMonth());
  }));

  it('history is loaded from storage when init, and updated when search', fakeAsync(() => {
    component.ionViewDidLoad();
    tick();
    expect(component.history[0]).toBe('old search history');

    component.keyword.setValue('new search');
    component.search();
    expect(component.history.length).toBe(2);
    expect(component.history[0]).toBe('new search');
    expect(storageSpy.set.calls.mostRecent().args[1][0]).toEqual('new search');
  }));

  it('keep last 10 history at max', () => {
    for (let i=0; i < 15; i++) {
      component.keyword.setValue(`new search ${i}`);
      component.search();
    }
    expect(component.history.length).toBe(10);
    expect(storageSpy.set.calls.mostRecent().args[1].length).toEqual(10);
  });

});

