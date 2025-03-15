import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';

import {AppComponent} from './app.component';
import {SharedTestModule} from '../testing/shared-test.module';

describe('AppComponent', () => {
  let splashScreenSpy, platformReadySpy;

  beforeEach(waitForAsync(() => {
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
    platformReadySpy = Promise.resolve();

    (window as any).gtag = jasmine.createSpy('gtag');

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [],
    }).compileComponents();
  }));

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
