import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
import {AlertController, Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {
  AlertControllerSpy, AppServiceSpy,
  PlatformSpy,
  SplashScreenSpy,
  StatusBarSpy,
  StorageSpy
} from '../../testing/mocks-ionic';
import {SharedTestModule} from '../../testing/shared-test.module';
import {AppService} from '../services/app.service';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StatusBar, useValue: StatusBarSpy() },
        { provide: SplashScreen, useValue: SplashScreenSpy() },
        { provide: Platform, useValue: PlatformSpy() },
        { provide: AlertController, useValue: AlertControllerSpy()},
        { provide: Storage, useValue: StorageSpy()},
        { provide: AppService, useValue: AppServiceSpy()}
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
