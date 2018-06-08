import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from "@angular/core/testing";
import {AppHeaderComponent} from "./app-header";
import {IonicModule} from "ionic-angular";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {HttpLoaderFactory} from "../../app/app.module";

describe('AppHeaderComponent (minimal)', () => {
  let fixture: ComponentFixture<AppHeaderComponent>;
  let component: AppHeaderComponent;
  let appHeaderElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AppHeaderComponent ],
      imports: [
        IonicModule.forRoot(AppHeaderComponent),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ComponentFixtureAutoDetect, useValue: true }
      ]
    });
    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    appHeaderElement = fixture.debugElement.nativeElement;
  });

  it('should show input title', () => {
    component.title = 'testing title';
    fixture.detectChanges();
    const ionTitle = appHeaderElement.querySelector('ion-title');
    expect(ionTitle.textContent).toEqual('testing title');
  })
});
